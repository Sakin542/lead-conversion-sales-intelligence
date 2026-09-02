<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\EmailTemplate;
use App\Models\SystemSetting;
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
        $templates = EmailTemplate::orderBy('name', 'asc')->get();

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
}
