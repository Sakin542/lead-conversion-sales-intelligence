<?php

namespace App\Notifications;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeadScoreUpdatedNotification extends Notification
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Lead $lead,
        public User $salesRep,
        public int $previousScore,
        public int $newScore
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $leadUrl = rtrim($frontendUrl, '/') . '/leads/' . $this->lead->id;

        $previousClassification = $this->getClassification($this->previousScore);
        $newClassification = $this->getClassification($this->newScore);
        $scoreChange = $this->newScore - $this->previousScore;

        return (new MailMessage)
            ->subject('Lead Score Updated — ' . $this->lead->first_name . ' ' . $this->lead->last_name)
            ->view('emails.lead-score-updated', [
                'user' => $this->salesRep,
                'lead' => $this->lead,
                'previousScore' => $this->previousScore,
                'newScore' => $this->newScore,
                'scoreChange' => $scoreChange,
                'previousClassification' => $previousClassification,
                'newClassification' => $newClassification,
                'leadUrl' => $leadUrl,
            ]);
    }

    private function getClassification(int $score): string
    {
        if ($score >= (int) env('HOT_LEAD_SCORE_THRESHOLD', 80)) {
            return 'Hot';
        }
        if ($score >= 50) {
            return 'Warm';
        }
        return 'Cold';
    }
}

