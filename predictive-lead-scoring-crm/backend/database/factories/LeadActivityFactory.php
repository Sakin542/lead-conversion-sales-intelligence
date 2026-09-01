<?php

namespace Database\Factories;

use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeadActivity>
 */
class LeadActivityFactory extends Factory
{
    protected $model = LeadActivity::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lead_id' => Lead::factory(),
            'type' => $this->faker->randomElement(['email_open', 'page_visit', 'form_submission', 'email_click', 'demo_request', 'call', 'meeting']),
            'description' => $this->faker->sentence(),
            'metadata' => ['key' => 'value'],
            'occurred_at' => now(),
        ];
    }
}

