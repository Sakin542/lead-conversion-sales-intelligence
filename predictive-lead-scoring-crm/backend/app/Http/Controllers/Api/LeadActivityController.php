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
    public function index(Request $request, mixed $lead = null): JsonResponse
    {
        $leadId = $lead instanceof \App\Models\Lead ? $lead->id : $lead;

        if ($leadId) {
            $leadModel = $request->user()->leads()->find($leadId) ?? \App\Models\Lead::find($leadId);

            if (!$leadModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lead not found',
                ], 404);
            }

            $activities = $leadModel->activities()->orderBy('occurred_at', 'desc')->get();

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
    public function store(StoreLeadActivityRequest $request, mixed $lead): JsonResponse
    {
        $leadId = $lead instanceof \App\Models\Lead ? $lead->id : $lead;
        $leadModel = $request->user()->leads()->find($leadId);

        if (!$leadModel) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $data = $request->validated();
        if (empty($data['occurred_at'])) {
            $data['occurred_at'] = now();
        }

        $activity = $leadModel->activities()->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Activity logged successfully',
            'data' => $activity,
        ], 201);
    }

    /**
     * Display a specific activity.
     */
    public function show(Request $request, mixed $activity): JsonResponse
    {
        $activityId = $activity instanceof LeadActivity ? $activity->id : $activity;
        $activityModel = LeadActivity::with('lead')->find($activityId);

        if (!$activityModel || $activityModel->lead->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Activity retrieved successfully',
            'data' => $activityModel,
        ]);
    }

    /**
     * Delete an activity.
     */
    public function destroy(Request $request, mixed $activity): JsonResponse
    {
        $activityId = $activity instanceof LeadActivity ? $activity->id : $activity;
        $activityModel = LeadActivity::with('lead')->find($activityId);

        if (!$activityModel || $activityModel->lead->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found',
            ], 404);
        }

        $activityModel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted successfully',
        ]);
    }
}

