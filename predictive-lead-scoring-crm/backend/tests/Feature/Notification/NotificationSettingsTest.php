<?php

namespace Tests\Feature\Notification;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_and_update_notification_preferences(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/notification-settings');

        $response->assertStatus(200)
            ->assertJsonPath('preferences.lead_assignment_enabled', true)
            ->assertJsonPath('preferences.hot_lead_enabled', true);

        $updateResponse = $this->actingAs($user, 'sanctum')
            ->putJson('/api/notification-settings', [
                'hot_lead_enabled' => false,
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('preferences.hot_lead_enabled', false);

        $this->assertFalse((bool) $user->fresh()->notificationPreference->hot_lead_enabled);
    }
}

