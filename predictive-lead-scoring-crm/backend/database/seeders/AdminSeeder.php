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
                'password' => $adminPassword,
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
                'accuracy' => 85.55,
                'precision' => 78.71,
                'recall' => 85.67,
                'f1_score' => 0.8204,
                'roc_auc' => 0.9263,
                'is_active' => true,
                'feature_importance' => [
                    'Lead Origin (Lead Add Form)' => 0.1736,
                    'Lead Profile (Potential Lead)' => 0.0821,
                    'Last Notable Activity (SMS Sent)' => 0.0717,
                    'Lead Source (Reference)' => 0.0447,
                    'Occupation (Working Professional)' => 0.0447,
                    'Total Time Spent on Website' => 0.0215,
                    'Last Activity (SMS Sent)' => 0.0195,
                    'Lead Profile (Student)' => 0.0187,
                ],
                'last_trained_at' => now()->subDays(2),
            ]);

            MlModel::create([
                'name' => 'Random Forest',
                'version' => 'v1.2',
                'accuracy' => 84.90,
                'precision' => 78.08,
                'recall' => 84.55,
                'f1_score' => 0.8119,
                'roc_auc' => 0.9200,
                'is_active' => false,
                'feature_importance' => [
                    'Total Time Spent on Website' => 0.1850,
                    'Lead Origin (Lead Add Form)' => 0.1240,
                    'Last Notable Activity (SMS Sent)' => 0.0890,
                    'Occupation (Working Professional)' => 0.0650,
                    'Lead Profile (Potential Lead)' => 0.0580,
                    'TotalVisits' => 0.0410,
                ],
                'last_trained_at' => now()->subDays(5),
            ]);

            MlModel::create([
                'name' => 'Logistic Regression',
                'version' => 'v1.0',
                'accuracy' => 82.68,
                'precision' => 75.39,
                'recall' => 81.74,
                'f1_score' => 0.7844,
                'roc_auc' => 0.9049,
                'is_active' => false,
                'feature_importance' => [
                    'Lead Origin (Lead Add Form)' => 0.2200,
                    'Occupation (Working Professional)' => 0.1800,
                    'Last Activity (SMS Sent)' => 0.1400,
                    'Total Time Spent on Website' => 0.1100,
                    'Do Not Email' => 0.0900,
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
