<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\FollowUpController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LeadActivityController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\NotificationPreferenceController;
use App\Http\Controllers\Api\PasswordResetController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index']);

// Public Authentication & Password Reset Routes
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/verify-code', [PasswordResetController::class, 'verifyCode']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::delete('/account', [AuthController::class, 'deleteAccount']);
    });

    Route::get('/protected', function () {
        return response()->json([
            'success' => true,
            'message' => 'You are authenticated',
        ]);
    });

    // Lead Management Routes
    Route::get('/leads', [LeadController::class, 'index']);
    Route::post('/leads', [LeadController::class, 'store']);
    Route::get('/leads/{id}', [LeadController::class, 'show']);
    Route::put('/leads/{id}', [LeadController::class, 'update']);
    Route::patch('/leads/{id}', [LeadController::class, 'update']);
    Route::patch('/leads/{id}/score', [LeadController::class, 'updateScore']);
    Route::delete('/leads/{id}', [LeadController::class, 'destroy']);

    // Lead Activity Routes
    Route::get('/activities', [LeadActivityController::class, 'index']);
    Route::get('/leads/{lead}/activities', [LeadActivityController::class, 'index']);
    Route::post('/leads/{lead}/activities', [LeadActivityController::class, 'store']);
    Route::get('/activities/{activity}', [LeadActivityController::class, 'show']);
    Route::delete('/activities/{activity}', [LeadActivityController::class, 'destroy']);

    // Sales Pipeline Routes
    Route::get('/pipeline', [DealController::class, 'index']);
    Route::post('/deals', [DealController::class, 'store']);
    Route::get('/deals/{id}', [DealController::class, 'show']);
    Route::put('/deals/{id}', [DealController::class, 'update']);
    Route::patch('/deals/{id}', [DealController::class, 'update']);
    Route::patch('/deals/{id}/stage', [DealController::class, 'updateStage']);
    Route::delete('/deals/{id}', [DealController::class, 'destroy']);

    // Notification Preference Settings Routes
    Route::get('/notification-settings', [NotificationPreferenceController::class, 'show']);
    Route::put('/notification-settings', [NotificationPreferenceController::class, 'update']);

    // Sales Follow-Up Routes
    Route::get('/follow-ups', [FollowUpController::class, 'index']);
    Route::post('/follow-ups', [FollowUpController::class, 'store']);
    Route::get('/follow-ups/{id}', [FollowUpController::class, 'show']);
    Route::put('/follow-ups/{id}', [FollowUpController::class, 'update']);
    Route::patch('/follow-ups/{id}', [FollowUpController::class, 'update']);
    Route::post('/follow-ups/{id}/complete', [FollowUpController::class, 'complete']);
    Route::delete('/follow-ups/{id}', [FollowUpController::class, 'destroy']);
});
