<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeUserNotification extends Notification
{
    public function __construct(public User $user)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $loginUrl = rtrim($frontendUrl, '/') . '/login';

        return (new MailMessage)
            ->subject('Welcome to ' . config('app.name'))
            ->view('emails.welcome', [
                'user' => $this->user,
                'loginUrl' => $loginUrl,
            ]);
    }
}

