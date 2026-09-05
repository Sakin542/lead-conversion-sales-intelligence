<?php

namespace Tests\Feature\Ml;

use App\Jobs\BatchScoreLeadsJob;
use App\Models\Lead;
use App\Models\User;
use App\Services\MlPredictionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ProductionPipelineTest extends TestCase
{
    use RefreshDatabase;

    public function test_ml_prediction_service_caches_predictions()
    {
        Cache::flush();
        $service = new MlPredictionService();
        $leadData = [
            'Lead Source' => 'Google',
            'TotalVisits' => 12,
            'Total Time Spent on Website' => 900,
        ];

        $cacheKey = 'ml_lead_predict_' . md5(json_encode($leadData));
        $this->assertFalse(Cache::has($cacheKey));

        $res1 = $service->predictLead($leadData);
        $this->assertTrue(Cache::has($cacheKey));

        $res2 = $service->predictLead($leadData);
        $this->assertEquals($res1, $res2);
    }

    public function test_batch_score_leads_job_scores_all_chunk_leads()
    {
        $leads = Lead::factory()->count(5)->create(['score' => 0]);
        $job = new BatchScoreLeadsJob($leads->pluck('id'));

        $job->handle(new MlPredictionService());

        foreach ($leads as $lead) {
            $lead->refresh();
            $this->assertGreaterThan(0, $lead->score);
        }
    }

    public function test_batch_score_artisan_command_dispatches_jobs()
    {
        Queue::fake();
        Lead::factory()->count(15)->create(['score' => 0]);

        $this->artisan('ml:batch-score', ['--chunk' => 5])
            ->assertExitCode(0);

        Queue::assertPushed(BatchScoreLeadsJob::class, 3);
    }

    public function test_admin_can_get_ml_intelligence_metrics()
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        Lead::factory()->create(['score' => 90]);
        Lead::factory()->create(['score' => 60]);
        Lead::factory()->create(['score' => 20]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/ml/metrics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'model_name',
                'metrics' => ['roc_auc', 'accuracy', 'f1_score'],
                'distribution' => ['total_leads', 'hot_leads', 'warm_leads', 'cold_leads'],
                'feature_importance',
            ]);
    }

    public function test_admin_can_get_horizon_queue_stats()
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/ml/horizon-stats');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'horizon' => [
                    'status',
                    'queue_connection',
                    'queues',
                    'workers',
                ],
            ]);
    }
}

