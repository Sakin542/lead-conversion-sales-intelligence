<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAnalyticsController extends Controller
{
    /**
     * Get Admin Advanced System Analytics filtered by date range.
     */
    public function index(Request $request): JsonResponse
    {
        $dateRange = $request->query('date_range', '30d');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $leadQuery = Lead::query();
        $dealQuery = Deal::query();

        // Apply Date Range Filter
        switch ($dateRange) {
            case 'today':
                $leadQuery->whereDate('created_at', now()->toDateString());
                $dealQuery->whereDate('created_at', now()->toDateString());
                break;
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
        $convertedLeads = (clone $leadQuery)->whereIn('status', ['won', 'converted'])->count();
        $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 1) : 0;

        $sourceBreakdown = (clone $leadQuery)
            ->select('source', DB::raw('count(*) as count'), DB::raw('SUM(COALESCE(estimated_value, 0)) as revenue'))
            ->groupBy('source')
            ->get();

        $stageBreakdown = (clone $leadQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $totalRevenue = (float) (clone $dealQuery)->whereHas('pipelineStage', fn($q) => $q->where('slug', 'won'))->sum('value');
        if ($totalRevenue == 0) {
            $totalRevenue = (float) (clone $leadQuery)->whereIn('status', ['won', 'converted'])->sum('estimated_value');
        }

        return response()->json([
            'success' => true,
            'date_range' => $dateRange,
            'lead_analytics' => [
                'total_leads' => $totalLeads,
                'converted_leads' => $convertedLeads,
                'conversion_rate' => $conversionRate . '%',
                'source_breakdown' => $sourceBreakdown,
                'stage_breakdown' => $stageBreakdown,
            ],
            'sales_analytics' => [
                'total_won_revenue' => $totalRevenue,
                'avg_deal_size' => $convertedLeads > 0 ? round($totalRevenue / $convertedLeads, 2) : 0,
            ],
        ]);
    }

    /**
     * Export Filtered Analytics to CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $dateRange = $request->query('date_range', '30d');
        $filename = "analytics_export_{$dateRange}_" . date('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($request, $dateRange) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Lead ID', 'First Name', 'Last Name', 'Email', 'Company', 'Source', 'Status', 'Estimated Value', 'Created At']);

            $leadQuery = Lead::query();
            if ($dateRange === '7d') $leadQuery->where('created_at', '>=', now()->subDays(7));
            elseif ($dateRange === '90d') $leadQuery->where('created_at', '>=', now()->subDays(90));
            elseif ($dateRange === '1y') $leadQuery->where('created_at', '>=', now()->subYears(1));

            foreach ($leadQuery->orderBy('created_at', 'desc')->get() as $lead) {
                fputcsv($file, [
                    $lead->id,
                    $lead->first_name,
                    $lead->last_name,
                    $lead->email,
                    $lead->company,
                    $lead->source,
                    $lead->status,
                    $lead->estimated_value,
                    $lead->created_at->toDayDateTimeString(),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
