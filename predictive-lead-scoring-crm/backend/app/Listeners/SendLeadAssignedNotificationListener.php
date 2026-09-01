<?php

namespace App\Listeners;

use App\Events\LeadAssigned;
use App\Notifications\LeadAssignedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendLeadAssignedNotificationListener implements ShouldQueue
{
    public function handle(LeadAssigned $event): void
    {
        $salesRep = $event->salesRep;
        $prefs = $salesRep->getOrDefaultsNotificationPreference();

        if ($prefs->lead_assignment_enabled) {
            $salesRep->notify(new LeadAssignedNotification($event->lead, $salesRep));
        }
    }
}

