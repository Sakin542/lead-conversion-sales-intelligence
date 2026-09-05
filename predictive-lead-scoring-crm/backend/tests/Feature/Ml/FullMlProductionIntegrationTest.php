<?php

namespace Tests\Feature\Ml;

use App\Jobs\BatchScoreLeadsJob;
use App\Jobs\ScoreLeadJob;
use App\Models\Lead;
use App\Models\LeadScore;
use App\Models\User;
use App\Services\FeatureEngineeringService;
use App\Services\MLPredictionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class FullMlProductionIntegrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 1. Test ML service health endpoint integration.
     */
    public function test_ml_service_health_endpoint()
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/ml/status');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'status',
                'api_url',
                'microservice',
            ]);
    }

    /**
     * 2. Test prediction request validation.
     */
    public function test_prediction_request_validation()
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->postJson('/api/admin/ml/predict', [
            'lead_data' => [
                'Lead Source' => 'Google',
                'TotalVisits' => 10,
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'prediction' => [
                    'conversion_probability',
                    'lead_score',
                    'temperature',
                ],
            ]);
    }

    /**
     * 3. Test successful prediction & feature engineering alignment.
     */
    public function test_successful_feature_engineering_and_prediction()
    {
        $lead = Lead::factory()->create([
            'first_name' => 'Sarah',
            'last_name' => 'Connor',
            'source' => 'Google',
            'industry' => 'Technology',
            'estimated_value' => 50000,
        ]);

        $featureService = new FeatureEngineeringService();
        $features = $featureService->extractFeatures($lead);

        $this->assertArrayHasKey('Lead Origin', $features);
        $this->assertArrayHasKey('Lead Source', $features);
        $this->assertArrayHasKey('TotalVisits', $features);
        $this->assertArrayHasKey('Total Time Spent on Website', $features);
        $this->assertEquals('Google', $features['Lead Source']);

        $mlService = new MLPredictionService($featureService);
        $result = $mlService->predict($features);

        $this->assertArrayHasKey('conversion_probability', $result);
        $this->assertArrayHasKey('lead_score', $result);
        $this->assertArrayHasKey('temperature', $result);
        $this->assertContains($result['temperature'], ['HOT', 'WARM', 'COLD']);
    }

    /**
     * 4. Test ML service fault tolerance when HTTP is unavailable.
     */
    public function test_ml_service_fault_tolerant_fallback()
    {
        // Mock HTTP connection failure
        Http::fake([
            '*/predict' => Http::response(null, 500),
        ]);

        $mlService = new MLPredictionService();
        $leadData = ['TotalVisits' => 15, 'Total Time Spent on Website' => 1200];

        $prediction = $mlService->predict($leadData, true);

        $this->assertNotNull($prediction);
        $this->assertArrayHasKey('conversion_probability', $prediction);
        $this->assertArrayHasKey('lead_score', $prediction);
        $this->assertArrayHasKey('temperature', $prediction);
    }

    /**
     * 5. Test lead scoring job execution.
     */
    public function test_score_lead_job_execution()
    {
        $salesRep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $lead = Lead::factory()->create([
            'assigned_to' => $salesRep->id,
            'score' => 0,
        ]);

        $job = new ScoreLeadJob($lead);
        $job->handle(new MLPredictionService());

        $lead->refresh();
        $this->assertGreaterThan(0, $lead->score);
    }

    /**
     * 6. Test score persistence into Lead and LeadScore tables.
     */
    public function test_score_persistence_into_lead_scores_table()
    {
        $lead = Lead::factory()->create(['score' => 0]);
        $mlService = new MLPredictionService();

        $result = $mlService->scoreLead($lead);

        $lead->refresh();
        $this->assertEquals($result['lead_score'], $lead->score);

        $this->assertDatabaseHas('lead_scores', [
            'lead_id' => $lead->id,
            'score' => $result['lead_score'],
        ]);

        $latestScore = $lead->latestScore;
        $this->assertNotNull($latestScore);
        $this->assertEquals($result['lead_score'], $latestScore->score);
    }

    /**
     * 7. Test temperature calculation thresholds.
     */
    public function test_temperature_calculation_thresholds()
    {
        $leadHot = Lead::factory()->create(['score' => 85]);
        $leadWarm = Lead::factory()->create(['score' => 65]);
        $leadCold = Lead::factory()->create(['score' => 30]);

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN, 'is_active' => true]);

        $resHot = $this->actingAs($admin)->getJson("/api/leads/{$leadHot->id}/score");
        $resHot->assertStatus(200)->assertJsonPath('temperature', 'HOT');

        $resWarm = $this->actingAs($admin)->getJson("/api/leads/{$leadWarm->id}/score");
        $resWarm->assertStatus(200)->assertJsonPath('temperature', 'WARM');

        $resCold = $this->actingAs($admin)->getJson("/api/leads/{$leadCold->id}/score");
        $resCold->assertStatus(200)->assertJsonPath('temperature', 'COLD');
    }

    /**
     * 8. Test RBAC authorization for lead scoring endpoints.
     */
    public function test_rbac_authorization_for_lead_score_endpoints()
    {
        $rep1 = User::factory()->create(['role' => User::ROLE_SALES_REP, 'is_active' => true]);
        $rep2 = User::factory()->create(['role' => User::ROLE_SALES_REP, 'is_active' => true]);

        $lead = Lead::factory()->create([
            'assigned_to' => $rep1->id,
            'score' => 75,
        ]);

        // Rep 1 (authorized) can view score
        $this->actingAs($rep1)
            ->getJson("/api/leads/{$lead->id}/score")
            ->assertStatus(200);

        // Rep 2 (unauthorized) cannot view score
        $this->actingAs($rep2)
            ->getJson("/api/leads/{$lead->id}/score")
            ->assertStatus(404);

        // Admin can view any lead score
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN, 'is_active' => true]);
        $this->actingAs($admin)
            ->getJson("/api/leads/{$lead->id}/score")
            ->assertStatus(200);
    }

    /**
     * 9. Test batch scoring job and command.
     */
    public function test_batch_scoring_job_and_artisan_command()
    {
        $leads = Lead::factory()->count(10)->create(['score' => 0]);

        // Execute batch job
        $job = new BatchScoreLeadsJob($leads->pluck('id'));
        $job->handle(new MLPredictionService());

        foreach ($leads as $lead) {
            $lead->refresh();
            $this->assertGreaterThan(0, $lead->score);
        }

        // Test command chunking
        Queue::fake();
        $this->artisan('ml:batch-score', ['--chunk' => 5])
            ->assertExitCode(0);

        Queue::assertPushed(BatchScoreLeadsJob::class, 2);
    }

    /**
     * 10. Test manual rescore endpoint.
     */
    public function test_manual_rescore_endpoint()
    {
        $rep = User::factory()->create(['role' => User::ROLE_SALES_REP, 'is_active' => true]);
        $lead = Lead::factory()->create([
            'assigned_to' => $rep->id,
            'score' => 10,
        ]);

        $response = $this->actingAs($rep)->postJson("/api/leads/{$lead->id}/score");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $lead->refresh();
        $this->assertGreaterThan(0, $lead->score);
    }
}

