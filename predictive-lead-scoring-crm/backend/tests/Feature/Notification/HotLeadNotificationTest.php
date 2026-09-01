<?php

namespace Tests\Feature\Notification;

use App\Models\Lead;
use App\Models\User;
use App\Notifications\HotLeadNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class HotLeadNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_score_below_threshold_does_not_trigger_hot_lead_notification(): void
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
            'score' => 50,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson('/api/leads/' . $lead->id . '/score', [
                'score' => 79,
            ]);

        $response->assertStatus(200);

        Notification::assertNotSentTo(
            [$user],
            HotLeadNotification::class
        );
    }

    public function test_score_crossing_threshold_triggers_hot_lead_notification(): void
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
            'score' => 75,
            'hot_notified' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson('/api/leads/' . $lead->id . '/score', [
                'score' => 85,
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            [$user],
            HotLeadNotification::class
        );

        $this->assertTrue((bool) $lead->fresh()->hot_notified);
    }
}

