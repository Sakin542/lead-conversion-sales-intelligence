<?php

namespace App\Notifications;

use App\Models\FollowUp;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SalesFollowUpReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public FollowUp $followUp, public User $salesRep)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $lead = $this->followUp->lead;
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $leadUrl = rtrim($frontendUrl, '/') . '/leads/' . $lead->id;

        return (new MailMessage)
            ->subject('Sales Follow-Up Reminder — ' . $lead->first_name . ' ' . $lead->last_name)
            ->view('emails.sales-follow-up-reminder', [
                'user' => $this->salesRep,
                'lead' => $lead,
                'followUp' => $this->followUp,
                'leadUrl' => $leadUrl,
            ]);
    }
}

