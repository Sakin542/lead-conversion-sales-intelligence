<?php

namespace App\Listeners;

use App\Events\LeadAssigned;
use App\Notifications\LeadAssignedNotification;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendLeadAssignedNotificationListener implements ShouldQueue
{
    public function handle(LeadAssigned $event): void
    {
        $salesRep = $event->salesRep;
        $lead = $event->lead;
        $prefs = $salesRep->getOrDefaultsNotificationPreference();

        if ($prefs->lead_assignment_enabled) {
            // Email notification
            $salesRep->notify(new LeadAssignedNotification($lead, $salesRep));

            // Database + Real-Time Socket Notification
            NotificationService::createNotification(
                $salesRep,
                'LEAD_ASSIGNED',
                '📌 New Lead Assigned',
                "Lead \"{$lead->first_name} {$lead->last_name}\" from {$lead->company} has been assigned to you.",
                'Lead',
                (string) $lead->id,
                ['lead_id' => $lead->id, 'score' => $lead->score],
                'HIGH',
                "lead-assigned:{$lead->id}:user:{$salesRep->id}"
            );
        }
    }
}
