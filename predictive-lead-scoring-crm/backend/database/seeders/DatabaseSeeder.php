<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PipelineStageSeeder::class,
            AdminSeeder::class,
        ]);

        // Create default manager if doesn't exist
        if (!User::where('email', 'manager@crm.com')->exists()) {
            User::create([
                'name' => 'Sales Manager',
                'email' => 'manager@crm.com',
                'password' => 'Password123!',
                'role' => User::ROLE_SALES_MANAGER,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Create default sales rep if doesn't exist
        if (!User::where('email', 'sales@crm.com')->exists()) {
            User::create([
                'name' => 'Sales Representative',
                'email' => 'sales@crm.com',
                'password' => 'Password123!',
                'role' => User::ROLE_SALES_REP,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Create default test user if doesn't exist
        if (!User::where('email', 'test@example.com')->exists()) {
            User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'Password123!',
                'role' => User::ROLE_SALES_REP,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
