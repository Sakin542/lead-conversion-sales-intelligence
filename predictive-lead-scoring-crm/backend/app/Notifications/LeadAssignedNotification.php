<?php

namespace App\Notifications;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeadAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public Lead $lead, public User $salesRep)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $leadUrl = rtrim($frontendUrl, '/') . '/leads/' . $this->lead->id;

        return (new MailMessage)
            ->subject('New Lead Assigned to You')
            ->view('emails.lead-assigned', [
                'user' => $this->salesRep,
                'lead' => $this->lead,
                'leadUrl' => $leadUrl,
            ]);
    }
}

