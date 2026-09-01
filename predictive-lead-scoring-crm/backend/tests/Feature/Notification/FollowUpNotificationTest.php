<?php

namespace Tests\Feature\Notification;

use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\SalesFollowUpReminderNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class FollowUpNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_follow_up_can_be_created_and_completed(): void
    {
        $user = User::factory()->create();
        $lead = Lead::create([
            'user_id' => $user->id,
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'company' => 'Acme Inc',
            'status' => 'new',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/follow-ups', [
                'lead_id' => $lead->id,
                'type' => 'call',
                'scheduled_at' => now()->addDay()->toDateTimeString(),
                'note' => 'Discuss enterprise pricing',
            ]);

        $response->assertStatus(201);
        $followUpId = $response->json('data.id');

        $completeResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/follow-ups/' . $followUpId . '/complete');

        $completeResponse->assertStatus(200);
        $this->assertEquals('completed', FollowUp::find($followUpId)->status);
    }

    public function test_scheduled_reminder_command_sends_notification_for_due_follow_ups(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $lead = Lead::create([
            'user_id' => $user->id,
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'company' => 'Acme Inc',
            'status' => 'new',
        ]);

        $followUp = FollowUp::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'type' => 'call',
            'scheduled_at' => now()->subMinute(),
            'note' => 'Follow up on proposal',
            'status' => 'pending',
            'reminder_sent' => false,
        ]);

        Artisan::call('reminders:send-follow-ups');

        Notification::assertSentTo(
            [$user],
            SalesFollowUpReminderNotification::class
        );

        $this->assertTrue((bool) $followUp->fresh()->reminder_sent);
    }
}

