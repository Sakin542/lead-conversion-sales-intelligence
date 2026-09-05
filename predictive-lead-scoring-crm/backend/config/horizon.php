<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Horizon Domain
    |--------------------------------------------------------------------------
    |
    | This is the subdomain where Horizon will be accessible from. If this
    | setting is null, Horizon will reside under the same domain as the
    | application. Otherwise, this value will serve as the subdomain.
    |
    */

    'domain' => env('HORIZON_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Path
    |--------------------------------------------------------------------------
    |
    | This is the URI path where Horizon will be accessible from. Feel free
    | to change this path to anything you like.
    |
    */

    'path' => env('HORIZON_PATH', 'horizon'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Connection
    |--------------------------------------------------------------------------
    |
    | This is the name of the Redis connection where Horizon will store the
    | meta information required to keep Horizon running. Note that this
    | connection must be configured in your "database.php" file.
    |
    */

    'use' => 'default',

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Prefix
    |--------------------------------------------------------------------------
    |
    | This prefix will be used when storing all Horizon data in Redis. You
    | may modify the prefix when running multiple installations of Horizon
    | on the same server to prevent data overlap.
    |
    */

    'prefix' => env(
        'HORIZON_PREFIX',
        Str::slug(env('APP_NAME', 'laravel'), '_') . '_horizon:'
    ),

    /*
    |--------------------------------------------------------------------------
    | Queue Wait Time Thresholds
    |--------------------------------------------------------------------------
    |
    | This option configures the threshold (in seconds) that determines if
    | a queue is experiencing long wait times. This will trigger Horizon
    | notifications and visual warnings on the dashboard.
    |
    */

    'waits' => [
        'redis:scoring' => 30,
        'redis:notifications' => 60,
        'redis:default' => 60,
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Configurations
    |--------------------------------------------------------------------------
    |
    | Here you may define the queue worker settings for your application.
    | You can configure different settings based on the environment Horizon
    | is running in.
    |
    */

    'environments' => [
        'production' => [
            'supervisor-scoring' => [
                'connection' => 'redis',
                'queue' => ['scoring', 'notifications', 'default'],
                'balance' => 'auto',
                'minProcesses' => 2,
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
                'tries' => 3,
                'timeout' => 60,
            ],
        ],

        'local' => [
            'supervisor-scoring' => [
                'connection' => 'redis',
                'queue' => ['scoring', 'notifications', 'default'],
                'balance' => 'auto',
                'minProcesses' => 1,
                'maxProcesses' => 3,
                'tries' => 3,
                'timeout' => 60,
            ],
        ],
    ],
];

