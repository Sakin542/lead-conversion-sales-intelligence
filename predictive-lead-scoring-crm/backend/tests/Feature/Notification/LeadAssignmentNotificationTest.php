<?php

namespace Tests\Feature\Notification;

use App\Models\Lead;
use App\Models\User;
use App\Notifications\LeadAssignedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class LeadAssignmentNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigning_lead_sends_notification_to_sales_rep(): void
    {
        Notification::fake();

        $owner = User::factory()->create();
        $salesRep = User::factory()->create();

        $lead = Lead::create([
            'user_id' => $owner->id,
            'first_name' => 'Sarah',
            'last_name' => 'Connor',
            'email' => 'sarah@cyberdyne.com',
            'company' => 'Cyberdyne Systems',
            'status' => 'new',
            'estimated_value' => 15000,
        ]);

        $response = $this->actingAs($owner, 'sanctum')
            ->putJson('/api/leads/' . $lead->id, [
                'assigned_to' => $salesRep->id,
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            [$salesRep],
            LeadAssignedNotification::class
        );
    }
}

