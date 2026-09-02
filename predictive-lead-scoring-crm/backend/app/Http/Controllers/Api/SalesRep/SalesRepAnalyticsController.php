<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesRepAnalyticsController extends Controller
{
    /**
     * Get Personal Performance Analytics filtered by date range.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $dateRange = $request->query('date_range', '30d');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $leadQuery = Lead::where('assigned_to', $userId);
        $dealQuery = Deal::where('user_id', $userId);

        switch ($dateRange) {
            case '7d':
                $leadQuery->where('created_at', '>=', now()->subDays(7));
                $dealQuery->where('created_at', '>=', now()->subDays(7));
                break;
            case '90d':
                $leadQuery->where('created_at', '>=', now()->subDays(90));
                $dealQuery->where('created_at', '>=', now()->subDays(90));
                break;
            case '1y':
                $leadQuery->where('created_at', '>=', now()->subYears(1));
                $dealQuery->where('created_at', '>=', now()->subYears(1));
                break;
            case 'custom':
                if ($dateFrom) {
                    $leadQuery->whereDate('created_at', '>=', $dateFrom);
                    $dealQuery->whereDate('created_at', '>=', $dateFrom);
                }
                if ($dateTo) {
                    $leadQuery->whereDate('created_at', '<=', $dateTo);
                    $dealQuery->whereDate('created_at', '<=', $dateTo);
                }
                break;
            default: // 30d
                $leadQuery->where('created_at', '>=', now()->subDays(30));
                $dealQuery->where('created_at', '>=', now()->subDays(30));
                break;
        }

        $totalLeads = (clone $leadQuery)->count();
        $qualifiedLeads = (clone $leadQuery)->where('status', 'qualified')->count();
        $convertedLeads = (clone $leadQuery)->whereIn('status', ['won', 'converted'])->count();
        $lostLeads = (clone $leadQuery)->where('status', 'lost')->count();

        $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 1) : 0;

        $revenue = (float) (clone $dealQuery)->where('stage', 'won')->sum('value');
        if ($revenue == 0) {
            $revenue = (float) (clone $leadQuery)->whereIn('status', ['won', 'converted'])->sum('estimated_value');
        }

        $avgDealValue = $convertedLeads > 0 ? round($revenue / $convertedLeads, 2) : 0;
        $followupsCompleted = FollowUp::where('user_id', $userId)->where('status', 'completed')->count();

        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        $hotCount = (clone $leadQuery)->where('score', '>=', $hotThreshold)->count();
        $warmCount = (clone $leadQuery)->where('score', '>=', 50)->where('score', '<', $hotThreshold)->count();
        $coldCount = (clone $leadQuery)->where('score', '<', 50)->count();

        $sourceBreakdown = (clone $leadQuery)
            ->select('source', DB::raw('count(*) as count'))
            ->groupBy('source')
            ->get();

        return response()->json([
            'success' => true,
            'date_range' => $dateRange,
            'metrics' => [
                'total_leads' => $totalLeads,
                'qualified_leads' => $qualifiedLeads,
                'converted_leads' => $convertedLeads,
                'lost_leads' => $lostLeads,
                'conversion_rate' => $conversionRate . '%',
                'revenue' => $revenue,
                'avg_deal_value' => $avgDealValue,
                'avg_sales_cycle_days' => 14,
                'followups_completed' => $followupsCompleted,
            ],
            'temperature_distribution' => [
                'hot' => $hotCount,
                'warm' => $warmCount,
                'cold' => $coldCount,
            ],
            'source_breakdown' => $sourceBreakdown,
        ]);
    }
}

