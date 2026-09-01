<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadActivityRequest;
use App\Models\LeadActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadActivityController extends Controller
{
    /**
     * Display activities for a specific lead, or overall recent activities.
     */
    public function index(Request $request, ?string $leadId = null): JsonResponse
    {
        if ($leadId) {
            $lead = $request->user()->leads()->find($leadId);

            if (!$lead) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lead not found',
                ], 404);
            }

            $activities = $lead->activities()->orderBy('occurred_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Activities retrieved successfully',
                'data' => $activities,
            ]);
        }

        // Recent activities across all user's leads for dashboard
        $userLeadIds = $request->user()->leads()->pluck('id');
        $activities = LeadActivity::whereIn('lead_id', $userLeadIds)
            ->with('lead:id,first_name,last_name,email,company')
            ->orderBy('occurred_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Recent activities retrieved successfully',
            'data' => $activities,
        ]);
    }

    /**
     * Store a new activity for a specific lead.
     */
    public function store(StoreLeadActivityRequest $request, string $leadId): JsonResponse
    {
        $lead = $request->user()->leads()->find($leadId);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $data = $request->validated();
        if (empty($data['occurred_at'])) {
            $data['occurred_at'] = now();
        }

        $activity = $lead->activities()->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Activity logged successfully',
            'data' => $activity,
        ], 201);
    }

    /**
     * Display a specific activity.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $activity = LeadActivity::with('lead')->find($id);

        if (!$activity || $activity->lead->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Activity retrieved successfully',
            'data' => $activity,
        ]);
    }

    /**
     * Delete an activity.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $activity = LeadActivity::with('lead')->find($id);

        if (!$activity || $activity->lead->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found',
            ], 404);
        }

        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted successfully',
        ]);
    }
}

