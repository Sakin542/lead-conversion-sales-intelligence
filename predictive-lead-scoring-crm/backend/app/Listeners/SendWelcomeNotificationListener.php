<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Notifications\WelcomeUserNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendWelcomeNotificationListener
{
    public function handle(UserRegistered $event): void
    {
        $user = $event->user;
        $user->notify(new WelcomeUserNotification($user));
    }
}

