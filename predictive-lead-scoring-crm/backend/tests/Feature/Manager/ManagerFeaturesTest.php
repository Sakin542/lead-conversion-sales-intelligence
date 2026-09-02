<?php

namespace Tests\Feature\Manager;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagerFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_manager_can_access_ai_assignment_recommendations(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        Lead::factory()->create(['status' => 'new']);

        $response = $this->actingAs($manager)
            ->getJson('/api/manager/ai-assignment/recommendations');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_sales_rep_cannot_access_ai_assignment_recommendations(): void
    {
        $rep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $response = $this->actingAs($rep)
            ->getJson('/api/manager/ai-assignment/recommendations');

        $response->assertStatus(403);
    }

    public function test_sales_manager_can_access_at_risk_leads(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($manager)
            ->getJson('/api/manager/at-risk-leads');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_sales_rep_cannot_access_at_risk_leads(): void
    {
        $rep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $response = $this->actingAs($rep)
            ->getJson('/api/manager/at-risk-leads');

        $response->assertStatus(403);
    }

    public function test_sales_manager_can_manage_goals(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($manager)
            ->postJson('/api/manager/goals', [
                'type' => 'revenue',
                'target_value' => 100000,
                'timeframe' => 'monthly',
                'start_date' => now()->startOfMonth()->toDateString(),
                'end_date' => now()->endOfMonth()->toDateString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_sales_manager_can_access_revenue_forecast(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($manager)
            ->getJson('/api/manager/revenue-forecast');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_sales_manager_can_perform_bulk_assign(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $rep = User::factory()->create(['role' => User::ROLE_SALES_REP]);
        $lead = Lead::factory()->create();

        $response = $this->actingAs($manager)
            ->postJson('/api/manager/leads/bulk-assign', [
                'lead_ids' => [$lead->id],
                'assigned_to' => $rep->id,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}

