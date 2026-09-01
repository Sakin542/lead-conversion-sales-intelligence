<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LeadActivityController;
use App\Http\Controllers\Api\LeadController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index']);

// Public Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });

    Route::get('/protected', function () {
        return response()->json([
            'success' => true,
            'message' => 'You are authenticated',
        ]);
    });

    // Lead Management Routes (STEP 06 & 07)
    Route::get('/leads', [LeadController::class, 'index']);
    Route::post('/leads', [LeadController::class, 'store']);
    Route::get('/leads/{id}', [LeadController::class, 'show']);
    Route::put('/leads/{id}', [LeadController::class, 'update']);
    Route::patch('/leads/{id}', [LeadController::class, 'update']);
    Route::delete('/leads/{id}', [LeadController::class, 'destroy']);

    // Lead Activity Routes (STEP 08)
    Route::get('/activities', [LeadActivityController::class, 'index']);
    Route::get('/leads/{lead}/activities', [LeadActivityController::class, 'index']);
    Route::post('/leads/{lead}/activities', [LeadActivityController::class, 'store']);
    Route::get('/activities/{activity}', [LeadActivityController::class, 'show']);
    Route::delete('/activities/{activity}', [LeadActivityController::class, 'destroy']);

    // Sales Pipeline Routes (STEP 09)
    Route::get('/pipeline', [DealController::class, 'index']);
    Route::post('/deals', [DealController::class, 'store']);
    Route::get('/deals/{id}', [DealController::class, 'show']);
    Route::put('/deals/{id}', [DealController::class, 'update']);
    Route::patch('/deals/{id}', [DealController::class, 'update']);
    Route::patch('/deals/{id}/stage', [DealController::class, 'updateStage']);
    Route::delete('/deals/{id}', [DealController::class, 'destroy']);
});
