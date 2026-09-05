<?php

namespace Tests\Feature\Admin;

use App\Models\Dataset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminDatasetUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_valid_csv_dataset(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $csvContent = "Lead_Origin,Lead_Source,Total_Visits,Total_Time_Spent,Page_Views_Per_Visit,Last_Activity,Converted\n" .
                      "API,Direct,5,250,2.5,Email Opened,1\n" .
                      "Landing Page,Google,2,80,1.0,Page Visited,0\n" .
                      "API,Direct,5,250,2.5,Email Opened,1\n" . // duplicate
                      "Lead Add Form,Reference,10,600,4.0,SMS Sent,1\n";

        $file = UploadedFile::fake()->createWithContent('leads_training_data.csv', $csvContent);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/datasets', [
                'file' => $file,
                'name' => 'Q3 Leads Dataset',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('dataset.name', 'Q3 Leads Dataset')
            ->assertJsonPath('dataset.row_count', 4)
            ->assertJsonPath('dataset.column_count', 7)
            ->assertJsonPath('dataset.duplicate_count', 1);

        $this->assertDatabaseHas('datasets', [
            'name' => 'Q3 Leads Dataset',
            'row_count' => 4,
            'column_count' => 7,
            'duplicate_count' => 1,
            'status' => 'validated',
        ]);
    }

    public function test_dataset_upload_requires_file(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/datasets', [
                'name' => 'Empty Dataset',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_sales_rep_cannot_upload_dataset(): void
    {
        Storage::fake('local');

        $rep = User::factory()->create([
            'role' => User::ROLE_SALES_REP,
            'is_active' => true,
        ]);

        $file = UploadedFile::fake()->createWithContent('test.csv', "col1,col2\nval1,val2\n");

        $response = $this->actingAs($rep)
            ->postJson('/api/admin/datasets', [
                'file' => $file,
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_preview_and_delete_uploaded_dataset(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $csvContent = "id,name,score\n1,Alice,85\n2,Bob,42\n3,Charlie,95\n";
        $file = UploadedFile::fake()->createWithContent('dataset_preview_test.csv', $csvContent);

        $uploadRes = $this->actingAs($admin)
            ->postJson('/api/admin/datasets', [
                'file' => $file,
            ]);

        $uploadRes->assertStatus(201);
        $datasetId = $uploadRes->json('dataset.id');

        // Preview
        $previewRes = $this->actingAs($admin)
            ->getJson("/api/admin/datasets/{$datasetId}/preview?page=1&per_page=2");

        $previewRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('headers', ['id', 'name', 'score'])
            ->assertJsonPath('pagination.total_rows', 3);

        // Quality Report
        $reportRes = $this->actingAs($admin)
            ->getJson("/api/admin/datasets/{$datasetId}/quality-report");

        $reportRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('metrics.total_rows', 3)
            ->assertJsonPath('metrics.total_columns', 3);

        // Delete
        $deleteRes = $this->actingAs($admin)
            ->deleteJson("/api/admin/datasets/{$datasetId}");

        $deleteRes->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('datasets', ['id' => $datasetId]);
    }
}

