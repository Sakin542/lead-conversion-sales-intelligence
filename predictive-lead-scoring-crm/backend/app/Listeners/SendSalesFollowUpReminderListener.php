<?php

namespace App\Listeners;

use App\Events\SalesFollowUpDue;
use App\Notifications\SalesFollowUpReminderNotification;
use App\Services\NotificationService;
class SendSalesFollowUpReminderListener
{
    public function handle(SalesFollowUpDue $event): void
    {
        $followUp = $event->followUp;
        $salesRep = $followUp->user;

        if (!$salesRep) {
            return;
        }

        $prefs = $salesRep->getOrDefaultsNotificationPreference();
        if ($prefs->follow_up_enabled) {
            $salesRep->notify(new SalesFollowUpReminderNotification($followUp, $salesRep));
        }

        NotificationService::createNotification(
            $salesRep,
            'FOLLOW_UP_DUE',
            '⏰ Follow-up Due',
            "Scheduled follow-up for lead \"{$followUp->lead?->first_name} {$followUp->lead?->last_name}\" is due today.",
            'FollowUp',
            (string) $followUp->id,
            ['follow_up_id' => $followUp->id, 'due_date' => $followUp->due_date],
            'HIGH',
            "followup:{$followUp->id}:due"
        );

        $followUp->reminder_sent = true;
        $followUp->save();
    }
}
