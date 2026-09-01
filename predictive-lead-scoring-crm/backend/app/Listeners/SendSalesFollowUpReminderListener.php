<?php

namespace App\Listeners;

use App\Events\SalesFollowUpDue;
use App\Notifications\SalesFollowUpReminderNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendSalesFollowUpReminderListener implements ShouldQueue
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

            $followUp->reminder_sent = true;
            $followUp->save();
        }
    }
}

