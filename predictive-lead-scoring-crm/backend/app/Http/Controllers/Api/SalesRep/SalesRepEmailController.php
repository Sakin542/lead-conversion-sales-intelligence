<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\EmailTemplate;
use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class SalesRepEmailController extends Controller
{
    /**
     * Get Customer Email History and Approved Email Templates.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        $query = LeadActivity::with('lead:id,first_name,last_name,email,company')
            ->where('activity_type', 'email');

        if ($userRole === 'SALES_REP') {
            $assignedLeadIds = Lead::where('assigned_to', $userId)->pluck('id');
            $query->whereIn('lead_id', $assignedLeadIds);
        }

        $emailHistory = $query->orderBy('created_at', 'desc')->limit(50)->get();

        $templates = EmailTemplate::where('is_enabled', true)
            ->select('id', 'key', 'name', 'subject', 'body_html')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'email_history' => $emailHistory,
            'templates' => $templates,
        ]);
    }

    /**
     * Send Customer Email from Sales Rep Panel.
     */
    public function send(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        $request->validate([
            'lead_id' => ['required', 'integer', 'exists:leads,id'],
            'subject' => ['required', 'string', 'max:255'],
            'body_html' => ['required', 'string'],
        ]);

        $lead = Lead::findOrFail($request->lead_id);
        if ($userRole === 'SALES_REP' && $lead->assigned_to !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You are not assigned to this lead.',
            ], 403);
        }

        $recipientEmail = $lead->email;
        $subject = $request->subject;
        $bodyHtml = $request->body_html;

        try {
            Mail::html($bodyHtml, function ($message) use ($recipientEmail, $subject) {
                $message->to($recipientEmail)
                    ->subject($subject);
            });

            // Log email activity
            $activity = LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => $userId,
                'activity_type' => 'email',
                'type' => 'email',
                'description' => "Email sent to {$recipientEmail}: {$subject}",
                'outcome' => 'Sent',
                'notes' => "Subject: {$subject}",
                'occurred_at' => now(),
                'created_at' => now(),
            ]);

            AuditLog::log(
                $userId,
                'customer_email_sent',
                'Lead',
                (string) $lead->id,
                ['recipient' => $recipientEmail, 'subject' => $subject],
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'message' => "Email successfully dispatched to {$recipientEmail}.",
                'activity' => $activity,
            ]);
        } catch (\Throwable $e) {
            // Log failed attempt
            LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => $userId,
                'activity_type' => 'email',
                'type' => 'email',
                'description' => "Failed email attempt to {$recipientEmail}",
                'outcome' => 'Failed',
                'notes' => "Failed attempt: {$e->getMessage()}",
                'occurred_at' => now(),
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage(),
            ], 500);
        }
    }
}
