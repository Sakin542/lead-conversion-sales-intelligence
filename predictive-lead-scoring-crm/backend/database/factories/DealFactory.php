<?php

namespace Database\Factories;

use App\Models\Deal;
use App\Models\Lead;
use App\Models\PipelineStage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deal>
 */
class DealFactory extends Factory
{
    protected $model = Deal::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'lead_id' => Lead::factory(),
            'pipeline_stage_id' => PipelineStage::firstOrCreate(
                ['slug' => 'new-lead'],
                ['name' => 'New Lead', 'position' => 1]
            )->id,
            'title' => $this->faker->sentence(3),
            'value' => $this->faker->randomFloat(2, 10000, 100000),
            'expected_close_date' => now()->addDays(30)->format('Y-m-d'),
            'probability' => 50,
            'notes' => $this->faker->paragraph(),
        ];
    }
}

