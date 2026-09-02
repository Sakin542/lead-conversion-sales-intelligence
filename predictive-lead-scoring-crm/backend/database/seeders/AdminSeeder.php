<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\MlModel;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminSeeder extends Seeder
{
    /**
     * Seed initial Admin user, ML models, email templates, and system settings.
     */
    public function run(): void
    {
        $adminEmail = env('INITIAL_ADMIN_EMAIL', 'rashid.cse.20230104102@aust.edu');
        $adminPassword = env('INITIAL_ADMIN_PASSWORD', 'AdminPassword123!');

        // 1. Seed Initial Admin Account
        if (!User::where('email', $adminEmail)->orWhere('role', User::ROLE_ADMIN)->exists()) {
            User::create([
                'name' => 'System Admin',
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            Log::info('Initial Admin account created.', ['email' => $adminEmail]);
        }

        // 2. Seed ML Models
        if (MlModel::count() === 0) {
            MlModel::create([
                'name' => 'XGBoost',
                'version' => 'v1.4',
                'accuracy' => 91.2,
                'precision' => 89.7,
                'recall' => 87.5,
                'f1_score' => 88.6,
                'roc_auc' => 94.1,
                'is_active' => true,
                'feature_importance' => [
                    'Website Visits' => 0.28,
                    'Email Opens' => 0.22,
                    'Previous Interactions' => 0.18,
                    'Demo Requested' => 0.15,
                    'Expected Revenue' => 0.11,
                    'Lead Source' => 0.06,
                ],
                'last_trained_at' => now()->subDays(2),
            ]);

            MlModel::create([
                'name' => 'Random Forest',
                'version' => 'v1.2',
                'accuracy' => 89.8,
                'precision' => 88.2,
                'recall' => 85.9,
                'f1_score' => 87.0,
                'roc_auc' => 92.1,
                'is_active' => false,
                'feature_importance' => [
                    'Website Visits' => 0.25,
                    'Email Opens' => 0.23,
                    'Demo Requested' => 0.20,
                    'Previous Interactions' => 0.16,
                    'Expected Revenue' => 0.10,
                    'Lead Source' => 0.06,
                ],
                'last_trained_at' => now()->subDays(5),
            ]);

            MlModel::create([
                'name' => 'Logistic Regression',
                'version' => 'v1.0',
                'accuracy' => 84.2,
                'precision' => 82.1,
                'recall' => 79.4,
                'f1_score' => 80.7,
                'roc_auc' => 87.6,
                'is_active' => false,
                'feature_importance' => [
                    'Website Visits' => 0.30,
                    'Demo Requested' => 0.25,
                    'Email Opens' => 0.20,
                    'Previous Interactions' => 0.15,
                    'Expected Revenue' => 0.10,
                ],
                'last_trained_at' => now()->subDays(10),
            ]);
        }

        // 3. Seed Email Templates
        if (EmailTemplate::count() === 0) {
            EmailTemplate::create([
                'key' => 'user_invitation',
                'name' => 'User Account Invitation',
                'subject' => 'You have been invited to join {{ app_name }}',
                'body_html' => '<h2>Welcome to {{ app_name }}, {{ user_name }}!</h2><p>You have been invited to join the CRM as a {{ user_role }}. Click below to set your password and activate your account.</p>',
                'is_enabled' => true,
            ]);

            EmailTemplate::create([
                'key' => 'password_reset',
                'name' => 'Password Reset Link',
                'subject' => 'Reset Your CRM Password',
                'body_html' => '<h2>Password Reset Requested</h2><p>Click the link below to reset your password for your CRM account.</p>',
                'is_enabled' => true,
            ]);

            EmailTemplate::create([
                'key' => 'hot_lead_alert',
                'name' => 'Hot Lead Alert',
                'subject' => '🔥 Hot Lead Alert: {{ lead_name }}',
                'body_html' => '<h2>Hot Lead Detected!</h2><p>Lead {{ lead_name }} has crossed the hot lead threshold with a score of {{ lead_score }}.</p>',
                'is_enabled' => true,
            ]);
        }

        // 4. Seed System Settings
        if (SystemSetting::count() === 0) {
            SystemSetting::set('lead_scoring_thresholds', [
                'hot_threshold' => 80,
                'warm_threshold' => 50,
                'cold_threshold' => 0,
            ], 'Lead temperature categorization boundaries');

            SystemSetting::set('notifications', [
                'hot_lead_notifications' => true,
                'new_lead_notifications' => true,
                'assignment_notifications' => true,
                'follow_up_notifications' => true,
            ], 'System notification dispatch configuration');

            SystemSetting::set('security', [
                'session_timeout_minutes' => 120,
                'min_password_length' => 6,
                'max_login_attempts' => 5,
            ], 'Security and session policy configuration');
        }
    }
}
