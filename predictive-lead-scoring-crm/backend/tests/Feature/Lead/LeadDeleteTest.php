<?php

namespace Tests\Feature\Lead;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_delete_their_own_lead(): void
    {
        $user = User::factory()->create();

        $lead = Lead::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Delete',
            'last_name' => 'Me',
            'email' => 'delete@example.com',
            'company' => 'Acme',
        ]);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/leads/{$lead->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Lead deleted successfully',
            ]);

        $this->assertDatabaseMissing('leads', [
            'id' => $lead->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_lead(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $leadB = Lead::factory()->create([
            'user_id' => $userB->id,
            'first_name' => 'Protected',
            'last_name' => 'Lead',
            'email' => 'protected@example.com',
            'company' => 'UserB Corp',
        ]);

        $response = $this->actingAs($userA, 'sanctum')->deleteJson("/api/leads/{$leadB->id}");

        $response->assertStatus(404);
        $this->assertDatabaseHas('leads', [
            'id' => $leadB->id,
        ]);
    }
}

