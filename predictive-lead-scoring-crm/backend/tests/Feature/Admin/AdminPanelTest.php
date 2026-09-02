<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_seeder_creates_correct_admin_email(): void
    {
        $this->seed(AdminSeeder::class);

        $admin = User::where('role', User::ROLE_ADMIN)->first();
        $this->assertNotNull($admin);
        $this->assertEquals('rashid.cse.20230104102@aust.edu', $admin->email);
        $this->assertTrue($admin->is_active);
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin_test@example.com',
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'kpis' => [
                    'total_users',
                    'total_leads',
                    'new_leads',
                    'hot_leads',
                    'warm_leads',
                    'cold_leads',
                    'converted_leads',
                    'conversion_rate',
                    'total_revenue',
                    'pipeline_value',
                    'pending_followups',
                    'active_sales_reps',
                ],
                'charts',
                'alerts',
            ]);
    }

    public function test_sales_rep_cannot_access_admin_dashboard(): void
    {
        $rep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $response = $this->actingAs($rep)
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_sales_manager_cannot_access_admin_dashboard(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($manager)
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_admin_dashboard(): void
    {
        $response = $this->getJson('/api/admin/dashboard');
        $response->assertStatus(401);
    }
}

