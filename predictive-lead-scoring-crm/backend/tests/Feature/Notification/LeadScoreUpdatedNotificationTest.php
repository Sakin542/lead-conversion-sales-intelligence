<?php

namespace Tests\Feature\Notification;

use App\Models\Lead;
use App\Models\User;
use App\Notifications\LeadScoreUpdatedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class LeadScoreUpdatedNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_score_change_below_threshold_does_not_send_email(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $lead = Lead::create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Smith',
            'email' => 'john@example.com',
            'company' => 'ABC Corp',
            'status' => 'new',
            'score' => 60,
        ]);

        // Change by 5 (< 10 threshold)
        $response = $this->actingAs($user, 'sanctum')
            ->patchJson('/api/leads/' . $lead->id . '/score', [
                'score' => 65,
            ]);

        $response->assertStatus(200);

        Notification::assertNotSentTo(
            [$user],
            LeadScoreUpdatedNotification::class
        );
    }

    public function test_score_change_above_threshold_sends_email(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $lead = Lead::create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Smith',
            'email' => 'john@example.com',
            'company' => 'ABC Corp',
            'status' => 'new',
            'score' => 60,
        ]);

        // Change by 15 (>= 10 threshold)
        $response = $this->actingAs($user, 'sanctum')
            ->patchJson('/api/leads/' . $lead->id . '/score', [
                'score' => 75,
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            [$user],
            LeadScoreUpdatedNotification::class
        );
    }
}

