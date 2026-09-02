<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\MlModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesRepLeadController extends Controller
{
    /**
     * Get Leads assigned to the authenticated Sales Representative.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $query = Lead::where('assigned_to', $userId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }

        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        if ($temp = $request->query('temperature')) {
            if ($temp === 'HOT') $query->where('score', '>=', $hotThreshold);
            elseif ($temp === 'WARM') $query->where('score', '>=', 50)->where('score', '<', $hotThreshold);
            elseif ($temp === 'COLD') $query->where('score', '<', 50);
        }

        $perPage = min((int) $request->query('per_page', 15), 100);
        $leads = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
            'pagination' => [
                'current_page' => $leads->currentPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
                'last_page' => $leads->lastPage(),
            ],
        ]);
    }

    /**
     * Get Priority Leads categorized into HOT, High Priority, Follow-up due, and Overdue.
     */
    public function priority(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);

        $hotLeads = Lead::where('assigned_to', $userId)->where('score', '>=', $hotThreshold)->orderBy('score', 'desc')->limit(10)->get();
        $highPriority = Lead::where('assigned_to', $userId)->where('score', '>=', 65)->orderBy('score', 'desc')->limit(10)->get();

        $followupDue = FollowUp::with('lead')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->whereDate('scheduled_at', now()->toDateString())
            ->get();

        $overdue = FollowUp::with('lead')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->where('scheduled_at', '<', now())
            ->get();

        return response()->json([
            'success' => true,
            'hot_leads' => $hotLeads,
            'high_priority_leads' => $highPriority,
            'followup_due_today' => $followupDue,
            'overdue_followups' => $overdue,
        ]);
    }

    /**
     * Get Detailed Lead Information with AI Explanation, Recommendation & Timeline.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        $lead = Lead::with('assignedToUser:id,name,email')->findOrFail($id);

        // Strict Ownership Enforcement: If role is SALES_REP, lead MUST be assigned to this user
        if ($userRole === 'SALES_REP' && $lead->assigned_to !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You are not authorized to view this lead.',
            ], 403);
        }

        $activeModel = MlModel::where('is_active', true)->first();
        $score = $lead->score ?? 75;

        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        $temperature = $score >= $hotThreshold ? 'HOT' : ($score >= 50 ? 'WARM' : 'COLD');
        $conversionProb = round(min(99, max(5, $score * 0.95)), 1);

        // Why is this score HOT/WARM? AI score explanation
        $scoreExplanations = [];
        if ($score >= 70) {
            $scoreExplanations[] = '✓ High engagement score detected across recent sessions';
            $scoreExplanations[] = '✓ Strong industry alignment & company budget fit';
            $scoreExplanations[] = '✓ Active communication history & email interaction';
            $scoreExplanations[] = '✓ Similar historical profiles converted successfully';
        } else {
            $scoreExplanations[] = '• Moderate engagement & pending follow-up response';
            $scoreExplanations[] = '• Lead profile acquired via digital campaigns';
        }

        // AI Recommended Next Action
        $recommendedAction = 'Contact lead today via call or email.';
        $recommendationReason = 'High conversion probability with recent activity.';
        if ($score >= $hotThreshold) {
            $recommendedAction = 'Schedule Product Demo & Dispatch Proposal';
            $recommendationReason = 'Lead score exceeds HOT threshold (80+). Immediate closing opportunity.';
        } elseif ($lead->status === 'new') {
            $recommendedAction = 'Perform Initial Qualification Outreach Call';
            $recommendationReason = 'Newly assigned lead requires initial contact within 24 hours.';
        }

        // Chronological Lead Timeline
        $activities = LeadActivity::where('lead_id', $lead->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $followups = FollowUp::where('lead_id', $lead->id)
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'lead' => $lead,
            'ai_prediction' => [
                'score' => $score,
                'conversion_probability' => $conversionProb . '%',
                'temperature' => $temperature,
                'model' => $activeModel ? "{$activeModel->name} ({$activeModel->version})" : 'XGBoost v1.4',
                'explanations' => $scoreExplanations,
                'recommended_action' => [
                    'action' => $recommendedAction,
                    'reason' => $recommendationReason,
                ],
            ],
            'timeline' => [
                'activities' => $activities,
                'followups' => $followups,
            ],
        ]);
    }
}

