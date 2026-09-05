<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\MlModel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManagerDashboardController extends Controller
{
    /**
     * Get Real-Time Aggregated Manager Dashboard Metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $timeframe = $request->query('timeframe', '30d');

        // 1. Core KPIs
        $totalLeads = Lead::count();
        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        
        $hotLeads = Lead::where('score', '>=', $hotThreshold)->count();
        $warmLeads = Lead::where('score', '>=', 50)->where('score', '<', $hotThreshold)->count();
        $coldLeads = Lead::where('score', '<', 50)->count();
        
        $wonLeads = Lead::whereIn('status', ['won', 'converted'])->count();
        $conversionRateNum = $totalLeads > 0 ? round(($wonLeads / $totalLeads) * 100, 1) : 0;
        $conversionRate = $conversionRateNum . '%';

        $totalPipelineValue = (float) Deal::sum('value');
        if ($totalPipelineValue == 0) {
            $totalPipelineValue = (float) Lead::sum('estimated_value');
        }

        $activeSalesReps = User::where('role', User::ROLE_SALES_REP)->where('is_active', true)->count();
        $pendingFollowups = FollowUp::where('status', 'pending')->count();

        // 2. High Intent Uncontacted Leads for AI Insight
        $uncontactedHotLeads = Lead::where('score', '>=', $hotThreshold)
            ->whereIn('status', ['new', 'unassigned'])
            ->count();

        // 3. Monthly Conversion & Volume Trends
        $driver = DB::connection()->getDriverName();
        $dateFormat = $driver === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";

        $monthlyTrend = Lead::select(
            DB::raw("{$dateFormat} as month"),
            DB::raw('count(*) as total_leads'),
            DB::raw("SUM(CASE WHEN status IN ('won', 'converted') THEN 1 ELSE 0 END) as converted_leads")
        )
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->limit(6)
        ->get()
        ->map(function ($row) {
            $total = (int) $row->total_leads;
            $converted = (int) $row->converted_leads;
            $rate = $total > 0 ? round(($converted / $total) * 100, 1) : 0;
            return [
                'month' => $row->month,
                'leads' => $total,
                'conversions' => $converted,
                'rate' => $rate,
            ];
        });

        // 4. Lead Score Distribution
        $scoreDistribution = [
            ['range' => '< 40 (Cold)', 'count' => Lead::where('score', '<', 40)->count(), 'color' => '#71717a'],
            ['range' => '40-59 (Medium)', 'count' => Lead::whereBetween('score', [40, 59])->count(), 'color' => '#fbbf24'],
            ['range' => '60-79 (Warm)', 'count' => Lead::whereBetween('score', [60, 79])->count(), 'color' => '#FF7A00'],
            ['range' => '80+ (Hot)', 'count' => Lead::where('score', '>=', 80)->count(), 'color' => '#34d399'],
        ];

        // 5. Top Hot Leads from DB
        $topLeads = Lead::with(['assignedToUser', 'user'])
            ->orderBy('score', 'desc')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($lead) {
                $ownerName = $lead->assignedToUser?->name ?? $lead->user?->name ?? 'Unassigned';
                return [
                    'id' => $lead->id,
                    'name' => trim($lead->first_name . ' ' . $lead->last_name),
                    'email' => $lead->email,
                    'phone' => $lead->phone ?? '',
                    'company' => $lead->company ?? 'N/A',
                    'score' => $lead->score ?? 0,
                    'status' => $lead->status,
                    'stage' => ucfirst($lead->status),
                    'estimated_value' => (float) ($lead->estimated_value ?? 0),
                    'owner' => $ownerName,
                    'lastActivity' => $lead->updated_at ? $lead->updated_at->diffForHumans() : 'Recently',
                ];
            });

        // 6. Pipeline Stages Overview
        $pipelineStages = [
            ['stage' => 'New', 'count' => Lead::where('status', 'new')->count(), 'value' => (float) Lead::where('status', 'new')->sum('estimated_value')],
            ['stage' => 'Contacted', 'count' => Lead::where('status', 'contacted')->count(), 'value' => (float) Lead::where('status', 'contacted')->sum('estimated_value')],
            ['stage' => 'Qualified', 'count' => Lead::where('status', 'qualified')->count(), 'value' => (float) Lead::where('status', 'qualified')->sum('estimated_value')],
            ['stage' => 'Proposal', 'count' => Lead::where('status', 'proposal')->count(), 'value' => (float) Lead::where('status', 'proposal')->sum('estimated_value')],
            ['stage' => 'Negotiation', 'count' => Lead::where('status', 'negotiation')->count(), 'value' => (float) Lead::where('status', 'negotiation')->sum('estimated_value')],
            ['stage' => 'Won', 'count' => Lead::where('status', 'won')->count(), 'value' => (float) Lead::where('status', 'won')->sum('estimated_value')],
        ];

        // 7. Recent Activities from DB
        $recentActivities = LeadActivity::with(['lead', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'lead_id' => $act->lead_id,
                    'lead_name' => $act->lead ? trim($act->lead->first_name . ' ' . $act->lead->last_name) : 'Prospect',
                    'company' => $act->lead?->company ?? '',
                    'user_name' => $act->user?->name ?? 'Sales Rep',
                    'type' => $act->activity_type ?? $act->type ?? 'activity',
                    'description' => $act->description ?? $act->notes ?? 'Logged CRM interaction',
                    'time' => $act->created_at ? $act->created_at->diffForHumans() : 'Just now',
                ];
            });

        // 8. Lead Activity Summary Counters
        $activityCounters = [
            'total_calls' => LeadActivity::whereIn('activity_type', ['call', 'phone'])->orWhere('type', 'call')->count(),
            'total_emails' => LeadActivity::whereIn('activity_type', ['email', 'mail'])->orWhere('type', 'email')->count(),
            'total_meetings' => LeadActivity::whereIn('activity_type', ['meeting', 'demo'])->orWhere('type', 'meeting')->count(),
            'total_notes' => LeadActivity::whereIn('activity_type', ['note', 'task'])->orWhere('type', 'note')->count(),
        ];

        return response()->json([
            'success' => true,
            'kpis' => [
                'total_leads' => $totalLeads,
                'hot_leads' => $hotLeads,
                'warm_leads' => $warmLeads,
                'cold_leads' => $coldLeads,
                'won_leads' => $wonLeads,
                'conversion_rate' => $conversionRate,
                'conversion_rate_num' => $conversionRateNum,
                'pipeline_value' => $totalPipelineValue,
                'active_reps' => $activeSalesReps,
                'pending_followups' => $pendingFollowups,
                'uncontacted_hot_leads' => $uncontactedHotLeads,
            ],
            'monthly_trend' => $monthlyTrend,
            'score_distribution' => $scoreDistribution,
            'top_hot_leads' => $topLeads,
            'pipeline_stages' => $pipelineStages,
            'recent_activities' => $recentActivities,
            'activity_counters' => $activityCounters,
            'ai_insight' => [
                'high_intent_count' => $uncontactedHotLeads,
                'timeframe' => '48 hours',
                'recommendation' => $uncontactedHotLeads > 0
                    ? "Reassign {$uncontactedHotLeads} high-intent leads to active top-converting sales reps immediately."
                    : "All hot leads are actively engaged. Maintain current outreach cadence.",
            ],
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}

