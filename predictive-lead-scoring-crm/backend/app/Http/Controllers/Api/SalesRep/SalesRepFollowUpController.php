<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FollowUp;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesRepFollowUpController extends Controller
{
    /**
     * Get Follow-ups categorized by Today, Upcoming, Overdue, Completed.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $today = FollowUp::with('lead:id,first_name,last_name,email,company,score')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->whereDate('scheduled_at', now()->toDateString())
            ->orderBy('scheduled_at', 'asc')
            ->get();

        $upcoming = FollowUp::with('lead:id,first_name,last_name,email,company,score')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->where('scheduled_at', '>', now()->endOfDay())
            ->orderBy('scheduled_at', 'asc')
            ->get();

        $overdue = FollowUp::with('lead:id,first_name,last_name,email,company,score')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->where('scheduled_at', '<', now()->startOfDay())
            ->orderBy('scheduled_at', 'asc')
            ->get();

        $completed = FollowUp::with('lead:id,first_name,last_name,email,company,score')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'today' => $today,
            'upcoming' => $upcoming,
            'overdue' => $overdue,
            'completed' => $completed,
        ]);
    }

    /**
     * Create Scheduled Follow-up.
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        $request->validate([
            'lead_id' => ['required', 'integer', 'exists:leads,id'],
            'scheduled_at' => ['required', 'date'],
            'type' => ['nullable', 'string', 'in:call,email,meeting,demo,followup'],
            'priority' => ['nullable', 'string', 'in:low,medium,high'],
            'notes' => ['nullable', 'string'],
        ]);

        $lead = Lead::findOrFail($request->lead_id);
        if ($userRole === 'SALES_REP' && $lead->assigned_to !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You are not assigned to this lead.',
            ], 403);
        }

        $followup = FollowUp::create([
            'lead_id' => $lead->id,
            'user_id' => $userId,
            'scheduled_at' => $request->scheduled_at,
            'type' => $request->type ?? 'followup',
            'priority' => $request->priority ?? 'medium',
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        AuditLog::log(
            $userId,
            'followup_created',
            'FollowUp',
            (string) $followup->id,
            ['lead_id' => $lead->id, 'scheduled_at' => $request->scheduled_at],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Follow-up scheduled successfully.',
            'followup' => $followup->load('lead:id,first_name,last_name,company'),
        ], 201);
    }

    /**
     * Mark Follow-up as Completed.
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        $followup = FollowUp::findOrFail($id);
        if ($userRole === 'SALES_REP' && $followup->user_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You do not own this follow-up.',
            ], 403);
        }

        $followup->status = 'completed';
        $followup->completed_at = now();
        $followup->save();

        return response()->json([
            'success' => true,
            'message' => 'Follow-up completed successfully.',
            'followup' => $followup,
        ]);
    }
}

