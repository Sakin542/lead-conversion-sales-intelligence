<?php

namespace Tests\Feature\Admin;

use App\Models\Dataset;
use App\Models\EmailTemplate;
use App\Models\MlModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_system_health(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/system/health');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['api', 'database', 'mlService', 'emailService', 'checkedAt']);
    }

    public function test_sales_manager_cannot_access_admin_system_health(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($manager)
            ->getJson('/api/admin/system/health');

        $response->assertStatus(403);
    }

    public function test_admin_can_compare_ml_models(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        MlModel::create([
            'name' => 'XGBoost',
            'version' => 'v1.4',
            'accuracy' => 0.92,
            'f1_score' => 0.91,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/ml/compare');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_access_dataset_quality_and_preview(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $dataset = Dataset::create([
            'name' => 'test_dataset.csv',
            'file_path' => 'datasets/test.csv',
            'row_count' => 100,
            'column_count' => 10,
            'status' => 'validated',
            'uploaded_by' => $admin->id,
        ]);

        $reportRes = $this->actingAs($admin)
            ->getJson("/api/admin/datasets/{$dataset->id}/quality-report");

        $reportRes->assertStatus(200)
            ->assertJsonPath('success', true);

        $previewRes = $this->actingAs($admin)
            ->getJson("/api/admin/datasets/{$dataset->id}/preview");

        $previewRes->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_get_security_activity(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/profile/security-activity');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}

