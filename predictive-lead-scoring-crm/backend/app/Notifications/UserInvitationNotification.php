<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $token,
        public string $inviterName
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $invitationUrl = rtrim($frontendUrl, '/') . '/accept-invitation?token=' . $this->token . '&email=' . urlencode($notifiable->email);
        $expiresAt = $notifiable->invitation_expires_at ? $notifiable->invitation_expires_at->toDayDateTimeString() : '7 days';

        return (new MailMessage)
            ->subject('You have been invited to join ' . config('app.name'))
            ->view('emails.user-invitation', [
                'user' => $notifiable,
                'inviterName' => $this->inviterName,
                'invitationUrl' => $invitationUrl,
                'expiresAt' => $expiresAt,
            ]);
    }
}

