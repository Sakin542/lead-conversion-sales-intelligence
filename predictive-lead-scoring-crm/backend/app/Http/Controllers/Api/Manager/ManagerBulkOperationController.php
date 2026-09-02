<?php

namespace App\Http\Controllers\Api\Manager;

use App\Events\LeadAssigned;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagerBulkOperationController extends Controller
{
    /**
     * Bulk assign leads to a sales representative.
     */
    public function bulkAssign(Request $request): JsonResponse
    {
        $request->validate([
            'lead_ids' => ['required', 'array', 'min:1'],
            'lead_ids.*' => ['exists:leads,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $leadIds = $request->lead_ids;
        $assignedTo = $request->assigned_to;

        Lead::whereIn('id', $leadIds)->update(['assigned_to' => $assignedTo]);

        if ($assignedTo) {
            $salesRep = User::find($assignedTo);
            if ($salesRep) {
                foreach (Lead::whereIn('id', $leadIds)->get() as $lead) {
                    event(new LeadAssigned($lead, $salesRep));
                }
            }
        }

        AuditLog::log(
            $request->user()->id,
            'bulk_lead_assigned',
            'Lead',
            null,
            ['count' => count($leadIds), 'lead_ids' => $leadIds, 'assigned_to' => $assignedTo],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => count($leadIds) . ' leads updated successfully.',
        ]);
    }

    /**
     * Bulk update lead status.
     */
    public function bulkStatus(Request $request): JsonResponse
    {
        $request->validate([
            'lead_ids' => ['required', 'array', 'min:1'],
            'lead_ids.*' => ['exists:leads,id'],
            'status' => ['required', 'string', 'in:new,contacted,qualified,proposal,negotiation,won,lost,converted'],
        ]);

        $leadIds = $request->lead_ids;
        $status = $request->status;

        Lead::whereIn('id', $leadIds)->update(['status' => $status]);

        AuditLog::log(
            $request->user()->id,
            'bulk_lead_status_updated',
            'Lead',
            null,
            ['count' => count($leadIds), 'new_status' => $status],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => count($leadIds) . " leads status updated to '{$status}'.",
        ]);
    }

    /**
     * Bulk add follow-up reminders.
     */
    public function bulkFollowup(Request $request): JsonResponse
    {
        $request->validate([
            'lead_ids' => ['required', 'array', 'min:1'],
            'lead_ids.*' => ['exists:leads,id'],
            'title' => ['required', 'string', 'max:255'],
            'scheduled_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $leadIds = $request->lead_ids;
        $title = $request->title;
        $scheduledAt = $request->scheduled_at;
        $notes = $request->notes;
        $userId = $request->user()->id;

        foreach ($leadIds as $leadId) {
            FollowUp::create([
                'lead_id' => $leadId,
                'user_id' => $userId,
                'title' => $title,
                'scheduled_at' => $scheduledAt,
                'notes' => $notes,
                'status' => 'pending',
            ]);
        }

        AuditLog::log(
            $request->user()->id,
            'bulk_followup_created',
            'FollowUp',
            null,
            ['count' => count($leadIds), 'title' => $title, 'scheduled_at' => $scheduledAt],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => "Follow-up scheduled for " . count($leadIds) . " leads.",
        ]);
    }

    /**
     * Bulk delete leads.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'lead_ids' => ['required', 'array', 'min:1'],
            'lead_ids.*' => ['exists:leads,id'],
        ]);

        $leadIds = $request->lead_ids;
        $count = count($leadIds);

        Lead::whereIn('id', $leadIds)->delete();

        AuditLog::log(
            $request->user()->id,
            'bulk_leads_deleted',
            'Lead',
            null,
            ['count' => $count, 'deleted_lead_ids' => $leadIds],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => "{$count} leads deleted permanently.",
        ]);
    }
}

