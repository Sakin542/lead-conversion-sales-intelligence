<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_seeder_creates_single_admin(): void
    {
        $this->seed(AdminSeeder::class);

        $adminCount = User::where('role', User::ROLE_ADMIN)->count();
        $this->assertEquals(1, $adminCount);

        $admin = User::where('role', User::ROLE_ADMIN)->first();
        $this->assertEquals('rashid.cse.20230104102@aust.edu', $admin->email);
        $this->assertTrue($admin->is_active);

        // Run seeder second time to test idempotency
        $this->seed(AdminSeeder::class);

        $this->assertEquals(1, User::where('role', User::ROLE_ADMIN)->count());
    }
}

