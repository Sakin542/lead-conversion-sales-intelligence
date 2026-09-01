<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProtectedRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_access_user_endpoint(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                ],
            ])
            ->assertJsonMissing(['password', 'remember_token']);
    }

    public function test_authenticated_user_can_access_protected_endpoint(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/protected');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'You are authenticated',
            ]);
    }

    public function test_unauthenticated_user_receives_401(): void
    {
        $responseUser = $this->getJson('/api/auth/user');
        $responseUser->assertStatus(401);

        $responseProtected = $this->getJson('/api/protected');
        $responseProtected->assertStatus(401);
    }
}

