<?php

namespace Tests\Feature\Ml;

use App\Models\Lead;
use App\Models\User;
use App\Services\MlPredictionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MlPredictionTest extends TestCase
{
    use RefreshDatabase;

    public function test_ml_prediction_service_scoring()
    {
        $service = new MlPredictionService();
        $leadData = [
            'Lead Source' => 'Google',
            'TotalVisits' => 10,
            'Total Time Spent on Website' => 1000,
            'Last Activity' => 'SMS Sent',
        ];

        $prediction = $service->predictLead($leadData);

        $this->assertIsArray($prediction);
        $this->assertArrayHasKey('conversion_probability', $prediction);
        $this->assertArrayHasKey('lead_score', $prediction);
        $this->assertArrayHasKey('temperature', $prediction);
        $this->assertContains($prediction['temperature'], ['HOT', 'WARM', 'COLD']);
    }

    public function test_admin_can_call_ml_predict_endpoint()
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/ml/predict', [
                'lead_data' => [
                    'Lead Source' => 'Google',
                    'TotalVisits' => 5,
                    'Total Time Spent on Website' => 600,
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'prediction' => [
                    'conversion_probability',
                    'lead_score',
                    'temperature',
                ],
            ]);
    }

    public function test_score_leads_artisan_command()
    {
        $lead = Lead::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'score' => 0,
        ]);

        $this->artisan('ml:score', ['--lead' => $lead->id])
            ->assertExitCode(0);

        $lead->refresh();
        $this->assertGreaterThan(0, $lead->score);
    }
}
