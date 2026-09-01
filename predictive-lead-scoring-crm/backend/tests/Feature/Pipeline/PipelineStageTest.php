<?php

namespace Tests\Feature\Pipeline;

use App\Models\User;
use Database\Seeders\PipelineStageSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PipelineStageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PipelineStageSeeder::class);
    }

    public function test_user_can_retrieve_pipeline_board_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/pipeline');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'summary' => [
                    'total_pipeline_value',
                    'open_deals_count',
                    'won_deals_count',
                    'lost_deals_count',
                ],
                'stages',
            ]);

        $stages = $response->json('stages');
        $this->assertCount(7, $stages);
        $this->assertEquals('New Lead', $stages[0]['name']);
        $this->assertEquals('Lost', $stages[6]['name']);
    }
}

