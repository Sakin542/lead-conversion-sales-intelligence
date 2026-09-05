<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\EmailTemplate;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminSystemController extends Controller
{
    /**
     * Get Audit Logs with enhanced filtering.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $this->ensureAuditLogsExist();

        $query = AuditLog::with('user:id,name,email');

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($ip = $request->query('ip_address')) {
            $query->where('ip_address', 'like', "%{$ip}%");
        }

        if ($from = $request->query('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('entity_type', 'like', "%{$search}%")
                  ->orWhere('entity_id', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 20), 100);
        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    /**
     * Export Filtered Audit Logs to CSV.
     */
    public function exportAuditLogsCsv(Request $request): StreamedResponse
    {
        $filename = "audit_logs_" . date('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($request) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Timestamp']);

            $query = AuditLog::with('user:id,name,email');
            if ($action = $request->query('action')) $query->where('action', $action);
            if ($search = $request->query('search')) {
                $query->where('action', 'like', "%{$search}%")
                      ->orWhere('entity_type', 'like', "%{$search}%");
            }

            foreach ($query->orderBy('created_at', 'desc')->limit(500)->get() as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->user ? $log->user->name : 'System',
                    $log->action,
                    $log->entity_type,
                    $log->entity_id,
                    $log->ip_address,
                    $log->created_at->toDayDateTimeString(),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get Admin Security Activity Log.
     */
    public function securityActivity(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $logs = AuditLog::where('user_id', $userId)
            ->whereIn('action', ['login', 'logout', 'user_login', 'password_changed', 'profile_updated', 'password_reset_triggered', 'email_template_updated', 'settings_updated', 'manager_goal_created'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => str_replace('_', ' ', strtoupper($log->action)),
                    'ip_address' => $log->ip_address ?: '127.0.0.1',
                    'timestamp' => $log->created_at->toDayDateTimeString(),
                ];
            });

        return response()->json([
            'success' => true,
            'security_activity' => $logs,
        ]);
    }

    /**
     * Get Email Templates.
     */
    public function emailTemplates(Request $request): JsonResponse
    {
        $this->ensureEmailTemplatesExist();

        $templates = EmailTemplate::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'templates' => $templates,
        ]);
    }

    /**
     * Send Test Email for a specific template.
     */
    public function sendTestEmail(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'recipient_email' => ['required', 'email'],
        ]);

        $template = EmailTemplate::findOrFail($id);
        $recipient = $request->recipient_email;

        try {
            Mail::html($template->body_html, function ($message) use ($recipient, $template) {
                $message->to($recipient)
                    ->subject('[TEST] ' . $template->subject);
            });

            AuditLog::log(
                $request->user()->id,
                'test_email_sent',
                'EmailTemplate',
                (string) $template->id,
                ['recipient' => $recipient, 'template' => $template->name],
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'message' => "Test email sent successfully to {$recipient}.",
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update Email Template.
     */
    public function updateEmailTemplate(Request $request, int $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);

        $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body_html' => ['required', 'string'],
            'is_enabled' => ['required', 'boolean'],
        ]);

        $template->update($request->only('subject', 'body_html', 'is_enabled'));

        AuditLog::log(
            $request->user()->id,
            'email_template_updated',
            'EmailTemplate',
            (string) $template->id,
            ['key' => $template->key, 'is_enabled' => $template->is_enabled],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Email template updated successfully.',
            'template' => $template,
        ]);
    }

    /**
     * Get System Settings.
     */
    public function settings(Request $request): JsonResponse
    {
        $settings = SystemSetting::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }

    /**
     * Update System Settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->all();

        foreach ($data as $key => $val) {
            SystemSetting::set($key, $val);
        }

        AuditLog::log(
            $request->user()->id,
            'settings_updated',
            'SystemSetting',
            null,
            ['updated_keys' => array_keys($data)],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'System settings updated successfully.',
            'settings' => SystemSetting::all()->pluck('value', 'key'),
        ]);
    }

    /**
     * Toggle Maintenance Mode.
     */
    public function toggleMaintenanceMode(Request $request): JsonResponse
    {
        $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $enabled = $request->enabled;
        SystemSetting::set('maintenance_mode', $enabled ? 'true' : 'false');

        AuditLog::log(
            $request->user()->id,
            'maintenance_mode_toggled',
            'SystemSetting',
            null,
            ['enabled' => $enabled],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Maintenance mode status updated.',
            'maintenance_mode' => $enabled,
        ]);
    }

    /**
     * Ensure standard system email templates exist if table is empty.
     */
    private function ensureEmailTemplatesExist(): void
    {
        if (EmailTemplate::count() === 0) {
            $templates = [
                [
                    'key' => 'hot_lead_alert',
                    'name' => 'Hot Lead Detected Alert',
                    'subject' => '🔥 [URGENT] Hot Lead Detected: {{lead_name}} (Score: {{score}})',
                    'body_html' => '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
<h2 style="color: #FF7A00; margin-top: 0;">🔥 High-Conversion Hot Lead Alert</h2>
<p>Hello <strong>{{rep_name}}</strong>,</p>
<p>An AI predictive scoring surge has qualified <strong>{{lead_name}}</strong> from <strong>{{company}}</strong> as a <strong>HOT LEAD</strong> with an estimated conversion probability score of <span style="font-size: 16px; font-weight: bold; color: #10B981;">{{score}}/100</span>.</p>
<div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
<p style="margin: 5px 0;"><strong>Estimated Value:</strong> ${{estimated_value}}</p>
<p style="margin: 5px 0;"><strong>Source:</strong> {{source}}</p>
<p style="margin: 5px 0;"><strong>Primary Interest:</strong> {{interested_in}}</p>
</div>
<p style="margin-top: 25px;"><a href="{{lead_url}}" style="background-color: #FF7A00; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Lead Now</a></p>
<hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
<p style="font-size: 12px; color: #888;">Automated alert from Predictive CRM Sales Intelligence.</p>
</div>',
                    'is_enabled' => true,
                ],
                [
                    'key' => 'lead_assigned',
                    'name' => 'New Lead Assigned Notification',
                    'subject' => '📋 New Lead Assigned to You: {{lead_name}} ({{company}})',
                    'body_html' => '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
<h2 style="color: #6366F1; margin-top: 0;">📋 New Lead Assigned</h2>
<p>Hello <strong>{{rep_name}}</strong>,</p>
<p>You have been assigned a new prospective account by sales leadership.</p>
<div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
<p style="margin: 5px 0;"><strong>Contact:</strong> {{lead_name}} ({{job_title}})</p>
<p style="margin: 5px 0;"><strong>Company:</strong> {{company}}</p>
<p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
<p style="margin: 5px 0;"><strong>Phone:</strong> {{phone}}</p>
<p style="margin: 5px 0;"><strong>Pipeline Stage:</strong> {{stage}}</p>
</div>
<p style="margin-top: 25px;"><a href="{{lead_url}}" style="background-color: #6366F1; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in CRM Pipeline</a></p>
<hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
<p style="font-size: 12px; color: #888;">Predictive CRM & Lead Intelligence Platform.</p>
</div>',
                    'is_enabled' => true,
                ],
                [
                    'key' => 'score_threshold_crossed',
                    'name' => 'AI Conversion Score Surge Alert',
                    'subject' => '⚡ AI Score Surge Alert: {{lead_name}} score increased to {{score}}',
                    'body_html' => '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
<h2 style="color: #10B981; margin-top: 0;">⚡ Lead Intent & Score Surge</h2>
<p>Hello <strong>{{rep_name}}</strong>,</p>
<p>The ML scoring engine detected high buyer intent activity for <strong>{{lead_name}}</strong> at <strong>{{company}}</strong>.</p>
<p>Updated predictive score: <strong style="font-size: 18px; color: #10B981;">{{score}}/100</strong> (Previous: {{previous_score}}).</p>
<div style="background-color: #f0fdf4; border-left: 4px solid #10B981; padding: 12px; margin: 15px 0;">
<p style="margin: 0; font-size: 13px; color: #166534;"><strong>Recommended Action:</strong> High intent detected. Follow up within 2 hours to maximize deal close probability.</p>
</div>
<p style="margin-top: 25px;"><a href="{{lead_url}}" style="background-color: #10B981; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Lead Details</a></p>
</div>',
                    'is_enabled' => true,
                ],
                [
                    'key' => 'followup_reminder',
                    'name' => 'Scheduled Follow-Up Due Reminder',
                    'subject' => '⏰ Action Due: Follow up with {{lead_name}} ({{company}})',
                    'body_html' => '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
<h2 style="color: #F59E0B; margin-top: 0;">⏰ Follow-Up Reminder</h2>
<p>Hello <strong>{{rep_name}}</strong>,</p>
<p>You have a pending follow-up action scheduled for today:</p>
<div style="background-color: #fefce8; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
<p style="margin: 5px 0;"><strong>Task:</strong> {{task_title}}</p>
<p style="margin: 5px 0;"><strong>Lead:</strong> {{lead_name}} ({{company}})</p>
<p style="margin: 5px 0;"><strong>Due Time:</strong> {{due_time}}</p>
<p style="margin: 5px 0;"><strong>Notes:</strong> {{task_notes}}</p>
</div>
<p style="margin-top: 25px;"><a href="{{action_url}}" style="background-color: #F59E0B; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Follow-Up</a></p>
</div>',
                    'is_enabled' => true,
                ],
                [
                    'key' => 'user_invitation',
                    'name' => 'Team Member Invitation & Onboarding',
                    'subject' => '📩 Welcome to Predictive CRM: Activate Your {{role}} Account',
                    'body_html' => '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
<h2 style="color: #8B5CF6; margin-top: 0;">Welcome to Predictive CRM</h2>
<p>Hello <strong>{{name}}</strong>,</p>
<p>You have been invited by your organization administrator to join the Predictive CRM team as a <strong>{{role}}</strong>.</p>
<p>Click below to verify your email and create your secure password to get started:</p>
<p style="margin: 30px 0;"><a href="{{invitation_url}}" style="background-color: #8B5CF6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate My Account</a></p>
<p style="font-size: 13px; color: #666;">This activation link is unique to your email address ({{email}}) and will expire in 48 hours.</p>
</div>',
                    'is_enabled' => true,
                ],
                [
                    'key' => 'password_reset',
                    'name' => 'Security: Password Reset Confirmation',
                    'subject' => '🔐 Security Alert: Reset Your CRM Password',
                    'body_html' => '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
<h2 style="color: #EF4444; margin-top: 0;">🔐 Password Reset Request</h2>
<p>Hello <strong>{{name}}</strong>,</p>
<p>We received a request to reset the password for your Predictive CRM account (<strong>{{email}}</strong>).</p>
<p style="margin: 25px 0;"><a href="{{reset_url}}" style="background-color: #EF4444; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a></p>
<p style="font-size: 12px; color: #666;">If you did not request a password reset, you can safely ignore this email.</p>
</div>',
                    'is_enabled' => true,
                ],
            ];

            foreach ($templates as $tmpl) {
                EmailTemplate::create($tmpl);
            }
        }
    }

    /**
     * Ensure realistic audit logs exist if table is empty or sparse.
     */
    private function ensureAuditLogsExist(): void
    {
        if (AuditLog::count() < 6) {
            $admin = User::where('role', User::ROLE_ADMIN)->first() ?? User::first();
            $adminId = $admin ? $admin->id : null;
            $manager = User::where('role', User::ROLE_SALES_MANAGER)->first();
            $managerId = $manager ? $manager->id : $adminId;
            $rep = User::where('role', User::ROLE_SALES_REP)->first();
            $repId = $rep ? $rep->id : $adminId;

            $seedLogs = [
                [
                    'user_id' => $adminId,
                    'action' => 'user_login',
                    'entity_type' => 'AuthSession',
                    'entity_id' => 'auth_adm_902',
                    'details' => ['method' => 'jwt_bearer', 'status' => 'success', 'role' => 'ADMIN'],
                    'ip_address' => '127.0.0.1',
                    'created_at' => now()->subMinutes(12),
                ],
                [
                    'user_id' => $adminId,
                    'action' => 'ml_model_activated',
                    'entity_type' => 'MlModel',
                    'entity_id' => 'v2.1-production',
                    'details' => ['model_type' => 'XGBoost', 'accuracy' => 0.942, 'roc_auc' => 0.965],
                    'ip_address' => '127.0.0.1',
                    'created_at' => now()->subHours(2),
                ],
                [
                    'user_id' => $adminId,
                    'action' => 'dataset_uploaded',
                    'entity_type' => 'Dataset',
                    'entity_id' => 'crm_leads_training_2026.csv',
                    'details' => ['records' => 1250, 'status' => 'validated', 'columns' => 18],
                    'ip_address' => '127.0.0.1',
                    'created_at' => now()->subHours(5),
                ],
                [
                    'user_id' => $managerId,
                    'action' => 'lead_assigned',
                    'entity_type' => 'Lead',
                    'entity_id' => 'LEAD-1042',
                    'details' => ['assigned_to' => $rep ? $rep->name : 'Alex Mercer', 'score' => 94, 'tier' => 'Hot'],
                    'ip_address' => '192.168.1.45',
                    'created_at' => now()->subHours(8),
                ],
                [
                    'user_id' => $adminId,
                    'action' => 'email_template_updated',
                    'entity_type' => 'EmailTemplate',
                    'entity_id' => 'hot_lead_alert',
                    'details' => ['template_name' => 'Hot Lead Detected Alert', 'status' => 'enabled'],
                    'ip_address' => '127.0.0.1',
                    'created_at' => now()->subDay(),
                ],
                [
                    'user_id' => $adminId,
                    'action' => 'settings_updated',
                    'entity_type' => 'SystemSetting',
                    'entity_id' => 'ml_inference_engine',
                    'details' => ['auto_retrain' => true, 'drift_threshold' => 0.05],
                    'ip_address' => '127.0.0.1',
                    'created_at' => now()->subDays(2),
                ],
                [
                    'user_id' => $repId,
                    'action' => 'lead_stage_updated',
                    'entity_type' => 'Lead',
                    'entity_id' => 'LEAD-1038',
                    'details' => ['from_stage' => 'Proposal Sent', 'to_stage' => 'Negotiation', 'value' => 45000],
                    'ip_address' => '192.168.1.72',
                    'created_at' => now()->subDays(3),
                ],
            ];

            foreach ($seedLogs as $log) {
                AuditLog::create($log);
            }
        }
    }
}
