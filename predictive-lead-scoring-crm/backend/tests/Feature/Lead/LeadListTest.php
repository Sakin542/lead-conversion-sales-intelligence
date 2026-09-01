<?php

namespace Tests\Feature\Lead;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadListTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_only_their_own_leads(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        Lead::factory()->create([
            'user_id' => $userA->id,
            'first_name' => 'LeadA',
            'email' => 'leada@example.com',
            'company' => 'Company A',
        ]);

        Lead::factory()->create([
            'user_id' => $userB->id,
            'first_name' => 'LeadB',
            'email' => 'leadb@example.com',
            'company' => 'Company B',
        ]);

        $response = $this->actingAs($userA, 'sanctum')->getJson('/api/leads');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'pagination' => ['total' => 1],
            ]);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('leada@example.com', $data[0]['email']);
    }

    public function test_lead_search_filters_correctly(): void
    {
        $user = User::factory()->create();

        Lead::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Sarah',
            'last_name' => 'Connor',
            'email' => 'sarah@cyberdyne.com',
            'company' => 'Cyberdyne',
        ]);

        Lead::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Wick',
            'email' => 'john@continental.com',
            'company' => 'Continental',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/leads?search=sarah');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Sarah', $data[0]['first_name']);
    }

    public function test_lead_filtering_by_status(): void
    {
        $user = User::factory()->create();

        Lead::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Qualified',
            'last_name' => 'Lead',
            'email' => 'q@example.com',
            'company' => 'Acme',
            'status' => 'qualified',
        ]);

        Lead::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'New',
            'last_name' => 'Lead',
            'email' => 'n@example.com',
            'company' => 'Acme',
            'status' => 'new',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/leads?status=qualified');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('qualified', $data[0]['status']);
    }
}

