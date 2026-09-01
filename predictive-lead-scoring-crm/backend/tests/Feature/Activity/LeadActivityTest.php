<?php

namespace Tests\Feature\Activity;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_activity_for_their_lead(): void
    {
        $user = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/leads/{$lead->id}/activities", [
            'type' => 'call',
            'description' => 'Discovery call with prospect',
            'metadata' => ['duration' => 30],
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Activity logged successfully',
                'data' => [
                    'lead_id' => $lead->id,
                    'type' => 'call',
                    'description' => 'Discovery call with prospect',
                ],
            ]);

        $this->assertDatabaseHas('lead_activities', [
            'lead_id' => $lead->id,
            'type' => 'call',
        ]);
    }

    public function test_user_cannot_create_activity_for_another_users_lead(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $leadB = Lead::factory()->create(['user_id' => $userB->id]);

        $response = $this->actingAs($userA, 'sanctum')->postJson("/api/leads/{$leadB->id}/activities", [
            'type' => 'meeting',
            'description' => 'Unauthorized call',
        ]);

        $response->assertStatus(404);
    }

    public function test_user_can_list_activities_for_lead(): void
    {
        $user = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $user->id]);

        LeadActivity::factory()->create([
            'lead_id' => $lead->id,
            'type' => 'email_open',
            'description' => 'Opened email newsletter',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/leads/{$lead->id}/activities");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('email_open', $data[0]['type']);
    }

    public function test_user_can_delete_activity(): void
    {
        $user = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $user->id]);
        $activity = LeadActivity::factory()->create(['lead_id' => $lead->id]);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/activities/{$activity->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('lead_activities', ['id' => $activity->id]);
    }
}

