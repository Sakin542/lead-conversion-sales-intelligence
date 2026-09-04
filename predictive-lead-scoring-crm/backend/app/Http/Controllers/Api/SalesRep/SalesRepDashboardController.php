<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\MlModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesRepDashboardController extends Controller
{
    /**
     * Get Personal Sales Dashboard KPIs and Priorities.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Personal KPI Aggregations (Enforce assigned_to = user_id)
        $myLeadsCount = Lead::where('assigned_to', $userId)->count();
        $newLeadsCount = Lead::where('assigned_to', $userId)->where('status', 'new')->count();

        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        $hotLeadsCount = Lead::where('assigned_to', $userId)->where('score', '>=', $hotThreshold)->count();
        $qualifiedLeadsCount = Lead::where('assigned_to', $userId)->where('status', 'qualified')->count();

        $followupsTodayCount = FollowUp::where('user_id', $userId)
            ->where('status', 'pending')
            ->whereDate('scheduled_at', now()->toDateString())
            ->count();

        $dealsWonCount = Deal::where('user_id', $userId)->whereHas('pipelineStage', fn($q) => $q->where('slug', 'won'))->count();
        if ($dealsWonCount == 0) {
            $dealsWonCount = Lead::where('assigned_to', $userId)->whereIn('status', ['won', 'converted'])->count();
        }

        $conversionRate = $myLeadsCount > 0 ? round(($dealsWonCount / $myLeadsCount) * 100, 1) : 0;

        $revenue = (float) Deal::where('user_id', $userId)->whereHas('pipelineStage', fn($q) => $q->where('slug', 'won'))->sum('value');
        if ($revenue == 0) {
            $revenue = (float) Lead::where('assigned_to', $userId)->whereIn('status', ['won', 'converted'])->sum('estimated_value');
        }

        $pipelineValue = (float) Deal::where('user_id', $userId)->whereHas('pipelineStage', fn($q) => $q->whereNotIn('slug', ['won', 'lost']))->sum('value');
        if ($pipelineValue == 0) {
            $pipelineValue = (float) Lead::where('assigned_to', $userId)->whereNotIn('status', ['won', 'lost', 'converted'])->sum('estimated_value');
        }

        // Today's Priorities
        $hotLeadsNoContact = Lead::where('assigned_to', $userId)
            ->where('score', '>=', $hotThreshold)
            ->where(function ($q) {
                $q->whereNull('updated_at')->orWhere('updated_at', '<=', now()->subDays(2));
            })
            ->limit(5)
            ->get();

        $overdueFollowups = FollowUp::with('lead')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->where('scheduled_at', '<', now())
            ->limit(5)
            ->get();

        $activeModel = MlModel::where('is_active', true)->first();

        return response()->json([
            'success' => true,
            'kpis' => [
                'my_leads' => $myLeadsCount,
                'new_leads' => $newLeadsCount,
                'hot_leads' => $hotLeadsCount,
                'qualified_leads' => $qualifiedLeadsCount,
                'followups_today' => $followupsTodayCount,
                'deals_won' => $dealsWonCount,
                'conversion_rate' => $conversionRate . '%',
                'revenue' => $revenue,
                'pipeline_value' => $pipelineValue,
                'active_model' => $activeModel ? "{$activeModel->name} ({$activeModel->version})" : 'XGBoost v1.4',
            ],
            'priorities' => [
                'hot_leads_no_contact' => $hotLeadsNoContact,
                'overdue_followups' => $overdueFollowups,
            ],
        ]);
    }
}

