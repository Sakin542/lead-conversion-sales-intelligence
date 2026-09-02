<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ManagerReportController extends Controller
{
    /**
     * Generate Manager Reports based on report type and filter params.
     */
    public function index(Request $request): JsonResponse
    {
        $type = $request->query('report_type', 'team_performance');
        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);

        $data = [];

        switch ($type) {
            case 'team_performance':
                $data = User::whereIn('role', [User::ROLE_SALES_REP, User::ROLE_SALES_MANAGER])
                    ->select('id', 'name', 'email')
                    ->withCount(['assignedLeads as total_leads'])
                    ->withCount(['assignedLeads as converted_count' => function ($q) {
                        $q->whereIn('status', ['won', 'converted']);
                    }])
                    ->get()
                    ->map(function ($rep) {
                        $rate = $rep->total_leads > 0 ? round(($rep->converted_count / $rep->total_leads) * 100, 1) : 0;
                        $rev = (float) Lead::where('assigned_to', $rep->id)->whereIn('status', ['won', 'converted'])->sum('estimated_value');
                        return [
                            'rep_name' => $rep->name,
                            'email' => $rep->email,
                            'total_leads' => $rep->total_leads,
                            'converted_leads' => $rep->converted_count,
                            'conversion_rate' => $rate . '%',
                            'revenue' => $rev,
                        ];
                    });
                break;

            case 'lead_conversion':
                $totalLeads = Lead::count();
                $qualifiedLeads = Lead::where('status', 'qualified')->count();
                $wonLeads = Lead::whereIn('status', ['won', 'converted'])->count();
                $lostLeads = Lead::where('status', 'lost')->count();
                $conversionRate = $totalLeads > 0 ? round(($wonLeads / $totalLeads) * 100, 1) : 0;

                $data = [
                    'total_leads' => $totalLeads,
                    'qualified_leads' => $qualifiedLeads,
                    'won_leads' => $wonLeads,
                    'lost_leads' => $lostLeads,
                    'conversion_rate' => $conversionRate . '%',
                    'by_stage' => Lead::select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
                ];
                break;

            case 'lead_source':
                $data = Lead::select('source', DB::raw('count(*) as total_leads'), DB::raw('SUM(CASE WHEN status IN ("won", "converted") THEN 1 ELSE 0 END) as converted'), DB::raw('SUM(COALESCE(estimated_value, 0)) as revenue'))
                    ->groupBy('source')
                    ->get()
                    ->map(function ($item) {
                        $item->conversion_rate = $item->total_leads > 0 ? round(($item->converted / $item->total_leads) * 100, 1) . '%' : '0%';
                        return $item;
                    });
                break;

            case 'revenue':
                $data = [
                    'won_revenue' => (float) Deal::where('stage', 'won')->sum('value') ?: (float) Lead::whereIn('status', ['won', 'converted'])->sum('estimated_value'),
                    'pipeline_value' => (float) Deal::whereNotIn('stage', ['won', 'lost'])->sum('value') ?: (float) Lead::whereNotIn('status', ['won', 'lost', 'converted'])->sum('estimated_value'),
                    'by_source' => Lead::whereIn('status', ['won', 'converted'])->select('source', DB::raw('SUM(COALESCE(estimated_value, 0)) as revenue'))->groupBy('source')->get(),
                ];
                break;

            case 'ai_performance':
                $total = Lead::count();
                $hot = Lead::where('score', '>=', $hotThreshold)->count();
                $warm = Lead::where('score', '>=', 50)->where('score', '<', $hotThreshold)->count();
                $cold = Lead::where('score', '<', 50)->count();

                $avgScore = round(Lead::avg('score') ?: 0, 1);

                $data = [
                    'average_score' => $avgScore,
                    'distribution' => [
                        'HOT' => $hot,
                        'WARM' => $warm,
                        'COLD' => $cold,
                    ],
                    'hot_conversion_rate' => $hot > 0 ? round((Lead::where('score', '>=', $hotThreshold)->whereIn('status', ['won', 'converted'])->count() / $hot) * 100, 1) . '%' : '0%',
                ];
                break;
        }

        return response()->json([
            'success' => true,
            'report_type' => $type,
            'report_data' => $data,
            'generated_at' => now()->toDayDateTimeString(),
        ]);
    }

    /**
     * Export Report data to CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $type = $request->query('report_type', 'team_performance');
        $filename = "manager_report_{$type}_" . date('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($type) {
            $file = fopen('php://output', 'w');

            if ($type === 'team_performance') {
                fputcsv($file, ['Representative Name', 'Email', 'Total Assigned Leads', 'Converted Leads', 'Conversion Rate', 'Revenue Generated']);
                $reps = User::whereIn('role', [User::ROLE_SALES_REP, User::ROLE_SALES_MANAGER])->get();
                foreach ($reps as $r) {
                    $total = Lead::where('assigned_to', $r->id)->count();
                    $won = Lead::where('assigned_to', $r->id)->whereIn('status', ['won', 'converted'])->count();
                    $rate = $total > 0 ? round(($won / $total) * 100, 1) . '%' : '0%';
                    $rev = Lead::where('assigned_to', $r->id)->whereIn('status', ['won', 'converted'])->sum('estimated_value');
                    fputcsv($file, [$r->name, $r->email, $total, $won, $rate, $rev]);
                }
            } else {
                fputcsv($file, ['Lead ID', 'Name', 'Email', 'Source', 'Status', 'Score', 'Estimated Value']);
                foreach (Lead::limit(100)->get() as $l) {
                    fputcsv($file, [$l->id, $l->first_name . ' ' . $l->last_name, $l->email, $l->source, $l->status, $l->score, $l->estimated_value]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

