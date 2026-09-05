<?php

namespace App\Listeners;

use App\Events\HotLeadDetected;
use App\Notifications\HotLeadNotification;
use App\Services\NotificationService;
class SendHotLeadNotificationListener
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
        if ($salesRep) {
            $prefs = $salesRep->getOrDefaultsNotificationPreference();
            if ($prefs->hot_lead_enabled) {
                // Email Notification
                $salesRep->notify(new HotLeadNotification($lead, $salesRep));
            }

            // Real-Time + Database Notification to assigned Sales Rep
            NotificationService::createNotification(
                $salesRep,
                'HOT_LEAD_DETECTED',
                '🔥 Hot Lead Alert',
                "Lead \"{$lead->first_name} {$lead->last_name}\" has an AI Score of {$lead->score}/100.",
                'Lead',
                (string) $lead->id,
                ['score' => $lead->score, 'company' => $lead->company],
                'CRITICAL',
                "hot-lead:{$lead->id}:rep:{$salesRep->id}"
            );
        }

        // Real-Time + Database Notification to Sales Managers & Admin
        NotificationService::notifyRole(
            ['ADMIN', 'SALES_MANAGER'],
            'HOT_LEAD_DETECTED',
            '🔥 Hot Lead Alert',
            "High priority lead \"{$lead->first_name} {$lead->last_name}\" from {$lead->company} scored {$lead->score}/100.",
            'Lead',
            (string) $lead->id,
            ['score' => $lead->score, 'company' => $lead->company, 'assigned_to' => $salesRep?->name],
            'HIGH',
            "hot-lead:{$lead->id}:mgmt"
        );

        $lead->hot_notified = true;
        $lead->save();
    }
}
