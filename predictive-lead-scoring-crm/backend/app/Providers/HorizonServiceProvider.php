<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class HorizonServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->authorization();
    }

    /**
     * Configure the Horizon authorization gate.
     */
    protected function authorization(): void
    {
        Gate::define('viewHorizon', function ($user = null) {
            if (!$user) {
                return false;
            }
            return $user->role === User::ROLE_ADMIN;
        });
    }
}

