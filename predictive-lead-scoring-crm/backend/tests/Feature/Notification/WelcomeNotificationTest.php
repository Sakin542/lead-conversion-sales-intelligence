<?php

namespace Tests\Feature\Notification;

use App\Events\UserRegistered;
use App\Models\User;
use App\Notifications\WelcomeUserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class WelcomeNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_triggers_welcome_notification(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Welcome',
            'email' => 'john.welcome@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'john.welcome@example.com')->first();
        $this->assertNotNull($user);

        Notification::assertSentTo(
            [$user],
            WelcomeUserNotification::class
        );
    }
}

