<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test that the health API endpoint returns status 200 and expected payload.
     */
    public function test_health_check_returns_successful_response(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Predictive CRM API is running',
                'version' => '1.0.0',
            ]);
    }
}

