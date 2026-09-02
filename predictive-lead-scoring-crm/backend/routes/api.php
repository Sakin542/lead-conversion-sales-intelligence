<?php

use App\Http\Controllers\Api\Admin\AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminDatasetController;
use App\Http\Controllers\Api\Admin\AdminLeadController;
use App\Http\Controllers\Api\Admin\AdminMlController;
use App\Http\Controllers\Api\Admin\AdminSystemController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\FollowUpController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LeadActivityController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\Manager\ManagerAiAssignmentController;
use App\Http\Controllers\Api\Manager\ManagerAtRiskLeadController;
use App\Http\Controllers\Api\Manager\ManagerBulkOperationController;
use App\Http\Controllers\Api\Manager\ManagerForecastController;
use App\Http\Controllers\Api\Manager\ManagerGoalController;
use App\Http\Controllers\Api\Manager\ManagerReportController;
use App\Http\Controllers\Api\NotificationPreferenceController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\SalesRep\SalesRepActivityController;
use App\Http\Controllers\Api\SalesRep\SalesRepAnalyticsController;
use App\Http\Controllers\Api\SalesRep\SalesRepDashboardController;
use App\Http\Controllers\Api\SalesRep\SalesRepEmailController;
use App\Http\Controllers\Api\SalesRep\SalesRepFollowUpController;
use App\Http\Controllers\Api\SalesRep\SalesRepGoalController;
use App\Http\Controllers\Api\SalesRep\SalesRepLeadController;
use App\Http\Controllers\Api\SalesRep\SalesRepNotificationController;
use App\Http\Controllers\Api\SalesRep\SalesRepPipelineController;
use App\Http\Controllers\Api\SalesRep\SalesRepProfileController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index']);

// Public Authentication & Password Reset Routes
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/verify-code', [PasswordResetController::class, 'verifyCode']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
    Route::get('/invitation/verify', [UserController::class, 'verifyInvitation']);
    Route::post('/accept-invitation', [UserController::class, 'acceptInvitation']);
});

// Protected User Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::delete('/account', [AuthController::class, 'deleteAccount']);
    });

    // User Management & Invitation Routes (Admin & Sales Manager)
    Route::middleware('role:ADMIN,SALES_MANAGER')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users/invite', [UserController::class, 'invite']);
    });
    Route::middleware('role:ADMIN')->group(function () {
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
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

// Manager Dedicated Endpoints (Restricted to SALES_MANAGER and ADMIN)
Route::middleware(['auth:sanctum', 'role:ADMIN,SALES_MANAGER'])->prefix('manager')->group(function () {
    // AI Lead Assignment Recommendation
    Route::get('/ai-assignment/recommendations', [ManagerAiAssignmentController::class, 'recommendations']);
    Route::post('/ai-assignment/{leadId}/assign', [ManagerAiAssignmentController::class, 'assign']);

    // Stale & At-Risk Lead Detection
    Route::get('/at-risk-leads', [ManagerAtRiskLeadController::class, 'index']);
    Route::patch('/at-risk-leads/{id}/resolve', [ManagerAtRiskLeadController::class, 'resolve']);

    // Team Goals & Targets
    Route::get('/goals', [ManagerGoalController::class, 'index']);
    Route::post('/goals', [ManagerGoalController::class, 'store']);
    Route::delete('/goals/{id}', [ManagerGoalController::class, 'destroy']);

    // Revenue Forecast
    Route::get('/revenue-forecast', [ManagerForecastController::class, 'index']);

    // Bulk Lead Operations
    Route::post('/leads/bulk-assign', [ManagerBulkOperationController::class, 'bulkAssign']);
    Route::post('/leads/bulk-status', [ManagerBulkOperationController::class, 'bulkStatus']);
    Route::post('/leads/bulk-followup', [ManagerBulkOperationController::class, 'bulkFollowup']);
    Route::post('/leads/bulk-delete', [ManagerBulkOperationController::class, 'bulkDelete']);

    // Manager Reports
    Route::get('/reports', [ManagerReportController::class, 'index']);
    Route::get('/reports/export-csv', [ManagerReportController::class, 'exportCsv']);
});

// Sales Representative Panel Dedicated Endpoints
Route::middleware(['auth:sanctum', 'role:ADMIN,SALES_MANAGER,SALES_REP'])->prefix('sales-rep')->group(function () {
    // Dashboard & Personal Priorities
    Route::get('/dashboard', [SalesRepDashboardController::class, 'index']);

    // Personal Leads & Priority Leads
    Route::get('/leads', [SalesRepLeadController::class, 'index']);
    Route::get('/priority-leads', [SalesRepLeadController::class, 'priority']);
    Route::get('/leads/{id}', [SalesRepLeadController::class, 'show']);

    // Activity Recording
    Route::get('/activities', [SalesRepActivityController::class, 'index']);
    Route::post('/activities', [SalesRepActivityController::class, 'store']);

    // Scheduled Follow-ups
    Route::get('/follow-ups', [SalesRepFollowUpController::class, 'index']);
    Route::post('/follow-ups', [SalesRepFollowUpController::class, 'store']);
    Route::patch('/follow-ups/{id}/complete', [SalesRepFollowUpController::class, 'complete']);

    // Personal Pipeline Kanban
    Route::get('/pipeline', [SalesRepPipelineController::class, 'index']);
    Route::patch('/pipeline/{id}/stage', [SalesRepPipelineController::class, 'updateStage']);

    // Customer Email Center
    Route::get('/emails', [SalesRepEmailController::class, 'index']);
    Route::post('/emails/send', [SalesRepEmailController::class, 'send']);

    // Personal Performance Analytics
    Route::get('/analytics', [SalesRepAnalyticsController::class, 'index']);

    // Assigned Goals
    Route::get('/goals', [SalesRepGoalController::class, 'index']);

    // Personal Notifications
    Route::get('/notifications', [SalesRepNotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [SalesRepNotificationController::class, 'markRead']);

    // Profile & Security
    Route::get('/profile', [SalesRepProfileController::class, 'show']);
    Route::put('/profile', [SalesRepProfileController::class, 'update']);
});

// Admin Panel Dedicated Endpoints (Strictly Admin Only)
Route::middleware(['auth:sanctum', 'role:ADMIN'])->prefix('admin')->group(function () {
    // Dashboard & System Health
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/system/health', [AdminDashboardController::class, 'systemHealth']);
    Route::get('/search', [AdminDashboardController::class, 'search']);

    // User Management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::patch('/users/{id}/status', [AdminUserController::class, 'toggleStatus']);
    Route::post('/users/{id}/reset-password', [AdminUserController::class, 'triggerPasswordReset']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    // Lead Management & Export
    Route::get('/leads', [AdminLeadController::class, 'index']);
    Route::patch('/leads/{id}/assign', [AdminLeadController::class, 'assign']);
    Route::delete('/leads/{id}', [AdminLeadController::class, 'destroy']);
    Route::get('/leads/export', [AdminLeadController::class, 'export']);

    // AI / ML Control Center & Comparison
    Route::get('/ml/overview', [AdminMlController::class, 'overview']);
    Route::get('/ml/models', [AdminMlController::class, 'models']);
    Route::get('/ml/compare', [AdminMlController::class, 'compareModels']);
    Route::post('/ml/models/{id}/activate', [AdminMlController::class, 'activateModel']);
    Route::get('/ml/feature-importance', [AdminMlController::class, 'featureImportance']);
    Route::get('/ml/predictions', [AdminMlController::class, 'predictions']);
    Route::post('/ml/train', [AdminMlController::class, 'train']);

    // Datasets, Quality & Preview
    Route::get('/datasets', [AdminDatasetController::class, 'index']);
    Route::post('/datasets', [AdminDatasetController::class, 'store']);
    Route::get('/datasets/{id}/quality-report', [AdminDatasetController::class, 'qualityReport']);
    Route::get('/datasets/{id}/preview', [AdminDatasetController::class, 'preview']);
    Route::delete('/datasets/{id}', [AdminDatasetController::class, 'destroy']);

    // Analytics & Export
    Route::get('/analytics', [AdminAnalyticsController::class, 'index']);
    Route::get('/analytics/export-csv', [AdminAnalyticsController::class, 'exportCsv']);

    // System Tools, Email Testing, Security & Maintenance
    Route::get('/audit-logs', [AdminSystemController::class, 'auditLogs']);
    Route::get('/audit-logs/export-csv', [AdminSystemController::class, 'exportAuditLogsCsv']);
    Route::get('/profile/security-activity', [AdminSystemController::class, 'securityActivity']);
    Route::get('/email-templates', [AdminSystemController::class, 'emailTemplates']);
    Route::put('/email-templates/{id}', [AdminSystemController::class, 'updateEmailTemplate']);
    Route::post('/email-templates/{id}/send-test', [AdminSystemController::class, 'sendTestEmail']);
    Route::get('/settings', [AdminSystemController::class, 'settings']);
    Route::put('/settings', [AdminSystemController::class, 'updateSettings']);
    Route::post('/settings/maintenance-mode', [AdminSystemController::class, 'toggleMaintenanceMode']);
});
