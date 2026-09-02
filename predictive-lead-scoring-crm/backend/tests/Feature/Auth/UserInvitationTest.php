<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\UserInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class UserInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_endpoint_does_not_exist(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(404);
    }

    public function test_admin_can_invite_sales_manager_and_sales_rep(): void
    {
        Notification::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $responseManager = $this->actingAs($admin)
            ->postJson('/api/users/invite', [
                'name' => 'Manager User',
                'email' => 'manager@example.com',
                'role' => User::ROLE_SALES_MANAGER,
            ]);

        $responseManager->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', [
            'email' => 'manager@example.com',
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => false,
        ]);

        $responseRep = $this->actingAs($admin)
            ->postJson('/api/users/invite', [
                'name' => 'Rep User',
                'email' => 'rep@example.com',
                'role' => User::ROLE_SALES_REP,
            ]);

        $responseRep->assertStatus(201);

        Notification::assertSentTo(
            User::where('email', 'manager@example.com')->first(),
            UserInvitationNotification::class
        );
    }

    public function test_sales_manager_can_invite_sales_rep(): void
    {
        Notification::fake();

        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($manager)
            ->postJson('/api/users/invite', [
                'name' => 'Sales Rep 1',
                'email' => 'rep1@example.com',
                'role' => User::ROLE_SALES_REP,
            ]);

        $response->assertStatus(201);
    }

    public function test_sales_manager_cannot_invite_admin_or_manager(): void
    {
        $manager = User::factory()->create([
            'role' => User::ROLE_SALES_MANAGER,
            'is_active' => true,
        ]);

        $responseAdmin = $this->actingAs($manager)
            ->postJson('/api/users/invite', [
                'name' => 'Attempt Admin',
                'email' => 'admin_attempt@example.com',
                'role' => User::ROLE_ADMIN,
            ]);

        $responseAdmin->assertStatus(403);

        $responseManager = $this->actingAs($manager)
            ->postJson('/api/users/invite', [
                'name' => 'Attempt Manager',
                'email' => 'manager_attempt@example.com',
                'role' => User::ROLE_SALES_MANAGER,
            ]);

        $responseManager->assertStatus(403);
    }

    public function test_invited_user_can_verify_token_and_set_password(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $plainToken = 'test_secret_token_string_123';
        $hashedToken = hash('sha256', $plainToken);

        $invitedUser = User::factory()->create([
            'email' => 'invited@example.com',
            'role' => User::ROLE_SALES_REP,
            'is_active' => false,
            'invitation_token' => $hashedToken,
            'invitation_expires_at' => now()->addDays(7),
            'invited_by' => $admin->id,
        ]);

        // Verify token
        $verifyResponse = $this->getJson("/api/auth/invitation/verify?email=invited@example.com&token={$plainToken}");
        $verifyResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // Accept invitation and set password
        $acceptResponse = $this->postJson('/api/auth/accept-invitation', [
            'email' => 'invited@example.com',
            'token' => $plainToken,
            'password' => 'NewSecurePass123!',
            'password_confirmation' => 'NewSecurePass123!',
        ]);

        $acceptResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $invitedUser->refresh();
        $this->assertTrue($invitedUser->is_active);
        $this->assertNull($invitedUser->invitation_token);

        // Verify login works now
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'invited@example.com',
            'password' => 'NewSecurePass123!',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}

