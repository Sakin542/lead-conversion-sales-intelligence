<?php

namespace App\Listeners;

use App\Events\HotLeadDetected;
use App\Notifications\HotLeadNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendHotLeadNotificationListener implements ShouldQueue
{
    public function handle(HotLeadDetected $event): void
    {
        $lead = $event->lead;

        if ($lead->hot_notified) {
            return;
        }

        $threshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        if ($lead->score < $threshold) {
            return;
        }

        $salesRep = $lead->getAssignedSalesRepresentative();
        if (!$salesRep) {
            return;
        }

        $prefs = $salesRep->getOrDefaultsNotificationPreference();
        if ($prefs->hot_lead_enabled) {
            $salesRep->notify(new HotLeadNotification($lead, $salesRep));

            $lead->hot_notified = true;
            $lead->save();
        }
    }
}

