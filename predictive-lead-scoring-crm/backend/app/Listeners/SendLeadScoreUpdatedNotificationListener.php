<?php

namespace App\Listeners;

use App\Events\LeadScoreUpdated;
use App\Notifications\LeadScoreUpdatedNotification;
use App\Services\NotificationService;
class SendLeadScoreUpdatedNotificationListener
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

        $diff = abs($event->newScore - $event->previousScore);
        if ($diff >= 15) {
            $salesRep->notify(new LeadScoreUpdatedNotification(
                $lead,
                $salesRep,
                $event->previousScore,
                $event->newScore
            ));

            NotificationService::createNotification(
                $salesRep,
                'AI_SCORE_UPDATED',
                '⚡ Lead AI Score Updated',
                "Lead \"{$lead->first_name} {$lead->last_name}\" score changed from {$event->previousScore} to {$event->newScore}.",
                'Lead',
                (string) $lead->id,
                ['previous_score' => $event->previousScore, 'new_score' => $event->newScore],
                $event->newScore >= 80 ? 'HIGH' : 'NORMAL',
                "score-update:{$lead->id}:{$event->newScore}"
            );

            $lead->last_notified_score = $event->newScore;
            $lead->save();
        }
    }
}
