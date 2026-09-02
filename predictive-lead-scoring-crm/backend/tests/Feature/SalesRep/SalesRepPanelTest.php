<?php

namespace Tests\Feature\SalesRep;

use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesRepPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_rep_can_access_own_dashboard(): void
    {
        $salesRep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        Lead::factory()->create([
            'assigned_to' => $salesRep->id,
            'status' => 'new',
            'score' => 85,
        ]);

        $response = $this->actingAs($salesRep)
            ->getJson('/api/sales-rep/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('kpis.my_leads', 1);
    }

    public function test_sales_rep_cannot_access_unassigned_lead_details(): void
    {
        $salesRepA = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $salesRepB = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $leadB = Lead::factory()->create([
            'assigned_to' => $salesRepB->id,
        ]);

        // Sales Rep A attempts to access Lead B
        $response = $this->actingAs($salesRepA)
            ->getJson("/api/sales-rep/leads/{$leadB->id}");

        $response->assertStatus(403);
    }

    public function test_sales_rep_can_log_activity_for_assigned_lead(): void
    {
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
                'outcome' => 'Interested',
                'notes' => 'Product demo requested for next Tuesday.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_sales_rep_can_complete_own_followup(): void
    {
        $salesRep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $lead = Lead::factory()->create([
            'assigned_to' => $salesRep->id,
        ]);

        $followup = FollowUp::create([
            'lead_id' => $lead->id,
            'user_id' => $salesRep->id,
            'scheduled_at' => now(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($salesRep)
            ->patchJson("/api/sales-rep/follow-ups/{$followup->id}/complete");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}

