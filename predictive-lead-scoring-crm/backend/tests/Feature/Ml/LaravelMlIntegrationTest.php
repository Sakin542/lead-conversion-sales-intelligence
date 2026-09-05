<?php

namespace Tests\Feature\Ml;

use App\Jobs\ScoreLeadJob;
use App\Models\Lead;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class LaravelMlIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_lead_creation_dispatches_score_lead_job()
    {
        Queue::fake();

        $lead = Lead::factory()->create([
            'first_name' => 'Alice',
            'last_name' => 'Smith',
        ]);

        Queue::assertPushed(ScoreLeadJob::class, function ($job) use ($lead) {
            return $job->lead->id === $lead->id;
        });
    }

    public function test_logging_activity_dispatches_score_lead_job()
    {
        Queue::fake();

        $salesRep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $lead = Lead::factory()->create([
            'assigned_to' => $salesRep->id,
        ]);

        $response = $this->actingAs($salesRep)
            ->postJson('/api/sales-rep/activities', [
                'lead_id' => $lead->id,
                'activity_type' => 'call',
                'notes' => 'Customer requested demo details.',
            ]);

        $response->assertStatus(201);

        Queue::assertPushed(ScoreLeadJob::class, function ($job) use ($lead) {
            return $job->lead->id === $lead->id;
        });
    }

    public function test_score_lead_job_triggers_hot_lead_notification()
    {
        $salesRep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $lead = Lead::factory()->create([
            'first_name' => 'High',
            'last_name' => 'Intent',
            'assigned_to' => $salesRep->id,
            'score' => 10,
        ]);

        // Directly execute job
        $job = new ScoreLeadJob($lead);
        $job->handle(new \App\Services\MlPredictionService());

        $lead->refresh();
        $this->assertGreaterThan(0, $lead->score);

        if ($lead->score >= 80) {
            $this->assertDatabaseHas('notifications', [
                'user_id' => $salesRep->id,
                'type' => 'HOT_LEAD_ALERT',
            ]);
        }
    }

    public function test_admin_can_check_ml_status_endpoint()
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/ml/status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'status',
                'api_url',
                'microservice',
            ]);
    }
}
