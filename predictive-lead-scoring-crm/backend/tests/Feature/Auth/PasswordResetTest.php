<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_email_for_existing_user(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'reset.me@example.com',
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'reset.me@example.com',
        ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            [$user],
            ResetPasswordNotification::class
        );

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'reset.me@example.com',
        ]);
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'reset.me@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = 'test-reset-token-12345';
        DB::table('password_reset_tokens')->insert([
            'email' => 'reset.me@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => 'reset.me@example.com',
            'password' => 'newsecurepassword',
            'password_confirmation' => 'newsecurepassword',
        ]);

        $response->assertStatus(200);

        $this->assertTrue(Hash::check('newsecurepassword', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'reset.me@example.com',
        ]);
    }
}

