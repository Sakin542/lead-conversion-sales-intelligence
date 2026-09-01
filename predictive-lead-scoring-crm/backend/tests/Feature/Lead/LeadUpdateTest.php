<?php

namespace Tests\Feature\Lead;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_their_own_lead(): void
    {
        $user = User::factory()->create();

        $lead = Lead::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'company' => 'Old Company',
            'status' => 'new',
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/leads/{$lead->id}", [
            'company' => 'New Enterprise Co',
            'status' => 'proposal',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Lead updated successfully',
                'data' => [
                    'id' => $lead->id,
                    'company' => 'New Enterprise Co',
                    'status' => 'proposal',
                ],
            ]);

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'company' => 'New Enterprise Co',
            'status' => 'proposal',
        ]);
    }

    public function test_user_cannot_update_another_users_lead(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $leadB = Lead::factory()->create([
            'user_id' => $userB->id,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'company' => 'UserB Corp',
        ]);

        $response = $this->actingAs($userA, 'sanctum')->putJson("/api/leads/{$leadB->id}", [
            'company' => 'Hacked Corp',
        ]);

        $response->assertStatus(404);
        $this->assertDatabaseHas('leads', [
            'id' => $leadB->id,
            'company' => 'UserB Corp',
        ]);
    }
}

