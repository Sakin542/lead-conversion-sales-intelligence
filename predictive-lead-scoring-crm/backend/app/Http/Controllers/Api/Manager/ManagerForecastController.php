<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManagerForecastController extends Controller
{
    /**
     * Generate Manager Revenue Forecast metrics from real pipeline and lead data.
     */
    public function index(Request $request): JsonResponse
    {
        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);

        // 1. Actual Won Revenue
        $wonRevenue = (float) Deal::where('stage', 'won')->sum('value');
        if ($wonRevenue == 0) {
            $wonRevenue = (float) Lead::whereIn('status', ['won', 'converted'])->sum('estimated_value');
        }

        // 2. Open Pipeline Deals
        $openPipelineValue = (float) Deal::whereNotIn('stage', ['won', 'lost'])->sum('value');
        if ($openPipelineValue == 0) {
            $openPipelineValue = (float) Lead::whereNotIn('status', ['won', 'lost', 'converted'])->sum('estimated_value');
        }

        // 3. Weighted Pipeline Forecast & AI Predicted Revenue
        $openLeads = Lead::whereNotIn('status', ['won', 'lost', 'converted'])->get();
        $weightedForecast = 0.0;
        $aiPredictedRevenue = 0.0;

        foreach ($openLeads as $lead) {
            $val = (float) ($lead->estimated_value ?? 0);
            $score = (float) ($lead->score ?? 50);
            $prob = min(0.95, max(0.05, ($score / 100.0)));

            $weightedForecast += ($val * $prob);
            $aiPredictedRevenue += ($val * ($score / 100.0));
        }

        $weightedForecast = round($weightedForecast, 2);
        $aiPredictedRevenue = round($aiPredictedRevenue, 2);

        // Best-case scenario (All open pipeline converted + Won revenue)
        $bestCase = $wonRevenue + $openPipelineValue;

        // Expected scenario (Weighted forecast + Won revenue)
        $expectedCase = $wonRevenue + $weightedForecast;

        // Worst-case scenario (Only Won revenue + High score leads >= 80)
        $highScoreLeadsValue = Lead::whereNotIn('status', ['won', 'lost', 'converted'])
            ->where('score', '>=', $hotThreshold)
            ->sum('estimated_value');
        $worstCase = $wonRevenue + ($highScoreLeadsValue * 0.7);

        // Monthly Forecast Chart Data
        $driver = DB::connection()->getDriverName();
        $dateFormat = $driver === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";

        $monthlyTrend = Lead::select(
            DB::raw("{$dateFormat} as month"),
            DB::raw("SUM(CASE WHEN status IN ('won', 'converted') THEN COALESCE(estimated_value, 0) ELSE 0 END) as actual_revenue"),
            DB::raw("SUM(CASE WHEN status NOT IN ('won', 'lost', 'converted') THEN COALESCE(estimated_value, 0) * (COALESCE(score, 50) / 100.0) ELSE 0 END) as forecast_revenue")
        )
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->limit(6)
        ->get();

        // Rep Forecast Comparison
        $repComparison = User::whereIn('role', [User::ROLE_SALES_REP, User::ROLE_SALES_MANAGER])
            ->select('id', 'name')
            ->get()
            ->map(function ($rep) {
                $won = (float) Lead::where('assigned_to', $rep->id)->whereIn('status', ['won', 'converted'])->sum('estimated_value');
                $pipeline = (float) Lead::where('assigned_to', $rep->id)->whereNotIn('status', ['won', 'lost', 'converted'])->sum('estimated_value');
                $weighted = 0.0;

                $leads = Lead::where('assigned_to', $rep->id)->whereNotIn('status', ['won', 'lost', 'converted'])->get();
                foreach ($leads as $l) {
                    $weighted += ($l->estimated_value * (($l->score ?? 50) / 100.0));
                }

                return [
                    'rep_name' => $rep->name,
                    'actual_won' => $won,
                    'pipeline_value' => $pipeline,
                    'weighted_forecast' => round($weighted, 2),
                    'total_expected' => round($won + $weighted, 2),
                ];
            });

        // Forecast by Stage
        $stageForecast = Lead::select('status as stage', DB::raw('count(*) as count'), DB::raw('SUM(COALESCE(estimated_value, 0)) as total_value'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                $stageProbabilities = [
                    'new' => 0.10,
                    'contacted' => 0.25,
                    'qualified' => 0.50,
                    'proposal' => 0.75,
                    'negotiation' => 0.85,
                    'won' => 1.00,
                    'lost' => 0.00,
                ];
                $prob = $stageProbabilities[strtolower($item->stage)] ?? 0.30;
                $item->weighted_value = round($item->total_value * $prob, 2);
                return $item;
            });

        return response()->json([
            'success' => true,
            'kpis' => [
                'actual_revenue' => $wonRevenue,
                'pipeline_value' => $openPipelineValue,
                'weighted_forecast' => $weightedForecast,
                'ai_predicted_revenue' => $aiPredictedRevenue,
            ],
            'scenarios' => [
                'best_case' => round($bestCase, 2),
                'expected' => round($expectedCase, 2),
                'worst_case' => round($worstCase, 2),
            ],
            'charts' => [
                'monthly_forecast' => $monthlyTrend,
                'rep_forecast' => $repComparison,
                'stage_forecast' => $stageForecast,
            ],
        ]);
    }
}

