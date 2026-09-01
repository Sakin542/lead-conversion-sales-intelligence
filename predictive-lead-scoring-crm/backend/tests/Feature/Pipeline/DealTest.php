<?php

namespace Tests\Feature\Pipeline;

use App\Models\Deal;
use App\Models\Lead;
use App\Models\PipelineStage;
use App\Models\User;
use Database\Seeders\PipelineStageSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DealTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PipelineStageSeeder::class);
    }

    public function test_user_can_create_deal(): void
    {
        $user = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $user->id]);
        $stage = PipelineStage::firstWhere('slug', 'new-lead');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/deals', [
            'title' => 'Enterprise License Agreement',
            'lead_id' => $lead->id,
            'pipeline_stage_id' => $stage->id,
            'value' => 45000.00,
            'probability' => 75,
            'expected_close_date' => '2026-10-15',
            'notes' => 'Negotiating SLA terms',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Deal created successfully',
                'data' => [
                    'title' => 'Enterprise License Agreement',
                    'lead_id' => $lead->id,
                    'pipeline_stage_id' => $stage->id,
                ],
            ]);

        $this->assertDatabaseHas('deals', [
            'title' => 'Enterprise License Agreement',
            'user_id' => $user->id,
        ]);
    }

    public function test_user_can_update_deal_stage(): void
    {
        $user = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $user->id]);
        $stageNew = PipelineStage::firstWhere('slug', 'new-lead');
        $stageWon = PipelineStage::firstWhere('slug', 'won');

        $deal = Deal::factory()->create([
            'user_id' => $user->id,
            'lead_id' => $lead->id,
            'pipeline_stage_id' => $stageNew->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')->patchJson("/api/deals/{$deal->id}/stage", [
            'pipeline_stage_id' => $stageWon->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Deal stage updated successfully',
                'data' => [
                    'id' => $deal->id,
                    'pipeline_stage_id' => $stageWon->id,
                ],
            ]);

        $this->assertDatabaseHas('deals', [
            'id' => $deal->id,
            'pipeline_stage_id' => $stageWon->id,
        ]);
    }

    public function test_deal_validation_requires_valid_lead_owned_by_user(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $leadB = Lead::factory()->create(['user_id' => $userB->id]);
        $stage = PipelineStage::first();

        $response = $this->actingAs($userA, 'sanctum')->postJson('/api/deals', [
            'title' => 'Invalid Deal',
            'lead_id' => $leadB->id,
            'pipeline_stage_id' => $stage->id,
            'value' => 1000,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['lead_id']);
    }

    public function test_user_can_delete_deal(): void
    {
        $user = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $user->id]);
        $deal = Deal::factory()->create(['user_id' => $user->id, 'lead_id' => $lead->id]);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/deals/{$deal->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('deals', ['id' => $deal->id]);
    }
}

