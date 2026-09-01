<?php

namespace App\Listeners;

use App\Events\LeadScoreUpdated;
use App\Notifications\LeadScoreUpdatedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendLeadScoreUpdatedNotificationListener implements ShouldQueue
{
    public function handle(LeadScoreUpdated $event): void
    {
        $lead = $event->lead;
        $salesRep = $lead->getAssignedSalesRepresentative();

        if (!$salesRep) {
            return;
        }

        $prefs = $salesRep->getOrDefaultsNotificationPreference();
        if (!$prefs->lead_score_enabled) {
            return;
        }

        $threshold = (int) env('LEAD_SCORE_EMAIL_CHANGE_THRESHOLD', 10);
        $diff = abs($event->newScore - $event->previousScore);

        if ($diff >= $threshold) {
            $salesRep->notify(new LeadScoreUpdatedNotification(
                $lead,
                $salesRep,
                $event->previousScore,
                $event->newScore
            ));

            $lead->last_notified_score = $event->newScore;
            $lead->save();
        }
    }
}

