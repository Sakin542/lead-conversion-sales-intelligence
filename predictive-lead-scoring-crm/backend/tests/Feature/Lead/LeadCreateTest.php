<?php

namespace Tests\Feature\Lead;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_lead(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/leads', [
            'first_name' => 'Sarah',
            'last_name' => 'Connor',
            'email' => 'sarah@cyberdyne.com',
            'phone' => '+1 555-0199',
            'company' => 'Cyberdyne Systems',
            'job_title' => 'Security Consultant',
            'source' => 'Website',
            'status' => 'qualified',
            'industry' => 'Technology',
            'company_size' => '50-200',
            'estimated_value' => 50000.00,
            'notes' => 'High interest in security audit.',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Lead created successfully',
                'data' => [
                    'first_name' => 'Sarah',
                    'last_name' => 'Connor',
                    'email' => 'sarah@cyberdyne.com',
                    'company' => 'Cyberdyne Systems',
                    'status' => 'qualified',
                    'user_id' => $user->id,
                ],
            ]);

        $this->assertDatabaseHas('leads', [
            'email' => 'sarah@cyberdyne.com',
            'user_id' => $user->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_lead(): void
    {
        $response = $this->postJson('/api/leads', [
            'first_name' => 'Sarah',
            'last_name' => 'Connor',
            'email' => 'sarah@cyberdyne.com',
            'company' => 'Cyberdyne Systems',
        ]);

        $response->assertStatus(401);
    }

    public function test_create_lead_validation_fails_for_missing_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/leads', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'company']);
    }

    public function test_create_lead_validation_fails_for_invalid_status(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/leads', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'company' => 'Acme Inc',
            'status' => 'invalid_status_value',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }
}

