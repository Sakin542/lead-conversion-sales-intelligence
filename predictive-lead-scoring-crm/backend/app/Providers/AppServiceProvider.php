<?php

namespace App\Providers;

use App\Events\HotLeadDetected;
use App\Events\LeadAssigned;
use App\Events\LeadScoreUpdated;
use App\Events\SalesFollowUpDue;
use App\Events\UserRegistered;
use App\Listeners\SendHotLeadNotificationListener;
use App\Listeners\SendLeadAssignedNotificationListener;
use App\Listeners\SendLeadScoreUpdatedNotificationListener;
use App\Listeners\SendSalesFollowUpReminderListener;
use App\Listeners\SendWelcomeNotificationListener;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            UserRegistered::class,
            SendWelcomeNotificationListener::class
        );

        Event::listen(
            LeadAssigned::class,
            SendLeadAssignedNotificationListener::class
        );

        Event::listen(
            LeadScoreUpdated::class,
            SendLeadScoreUpdatedNotificationListener::class
        );

        Event::listen(
            HotLeadDetected::class,
            SendHotLeadNotificationListener::class
        );

        Event::listen(
            SalesFollowUpDue::class,
            SendSalesFollowUpReminderListener::class
        );

        \App\Models\Lead::observe(\App\Observers\LeadObserver::class);
    }
}
