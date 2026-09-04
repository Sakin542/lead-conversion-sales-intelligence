<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class SalesRepActivityController extends Controller
{
    /**
     * Get Activities for Assigned Leads.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        $hasActivityType = Schema::hasColumn('lead_activities', 'activity_type');

        $query = LeadActivity::with('lead:id,first_name,last_name,email,company');

        if ($userRole === 'SALES_REP') {
            $assignedLeadIds = Lead::where('assigned_to', $userId)->pluck('id');
            $query->whereIn('lead_id', $assignedLeadIds);
        }

        if ($leadId = $request->query('lead_id')) {
            $query->where('lead_id', $leadId);
        }

        if ($type = $request->query('type')) {
            $query->where(function ($q) use ($type, $hasActivityType) {
                $q->where('type', $type);
                if ($hasActivityType) {
                    $q->orWhere('activity_type', $type);
                }
            });
        }

        $perPage = min((int) $request->query('per_page', 20), 100);
        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $activities->items(),
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
                'last_page' => $activities->lastPage(),
            ],
        ]);
    }

    /**
     * Store New Activity (Call, Email, Meeting, Demo, Note, Proposal).
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        $hasActivityType = Schema::hasColumn('lead_activities', 'activity_type');

        $request->validate([
            'lead_id' => ['required', 'integer', 'exists:leads,id'],
            'activity_type' => ['required', 'string', 'in:call,email,meeting,demo,note,proposal,other'],
            'outcome' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $lead = Lead::findOrFail($request->lead_id);

        if ($userRole === 'SALES_REP' && $lead->assigned_to !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You are not assigned to this lead.',
            ], 403);
        }

        $description = $request->notes ?: ucfirst($request->activity_type) . ($request->outcome ? " - {$request->outcome}" : ' logged');

        // Map request activity_type to valid enum value for legacy 'type' column
        $typeMapping = [
            'call' => 'call',
            'email' => 'email_open',
            'meeting' => 'meeting',
            'demo' => 'demo_request',
        ];
        $legacyType = $typeMapping[$request->activity_type] ?? 'call';

        $activityData = [
            'lead_id' => $lead->id,
            'user_id' => $userId,
            'type' => $legacyType,
            'description' => $description,
            'outcome' => $request->outcome,
            'notes' => $request->notes,
            'occurred_at' => now(),
            'created_at' => now(),
        ];

        if ($hasActivityType) {
            $activityData['activity_type'] = $request->activity_type;
        }

        $activity = LeadActivity::create($activityData);

        // Update lead's last activity timestamp
        $lead->touch();

        AuditLog::log(
            $userId,
            'activity_logged',
            'LeadActivity',
            (string) $activity->id,
            ['type' => $request->activity_type, 'outcome' => $request->outcome],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Activity recorded successfully.',
            'activity' => $activity->load('lead:id,first_name,last_name,company'),
        ], 201);
    }
}
