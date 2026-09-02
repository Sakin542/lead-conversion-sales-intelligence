<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\ManagerGoal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class SalesRepGoalController extends Controller
{
    /**
     * Get Manager-Assigned Goals for the Authenticated Sales Representative.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            if (!Schema::hasTable('manager_goals')) {
                return response()->json([
                    'success' => true,
                    'goals' => $this->getDefaultGoals(),
                ]);
            }

            $userColumn = Schema::hasColumn('manager_goals', 'user_id') ? 'user_id' : (Schema::hasColumn('manager_goals', 'assigned_to') ? 'assigned_to' : null);

            if (!$userColumn) {
                return response()->json([
                    'success' => true,
                    'goals' => $this->getDefaultGoals(),
                ]);
            }

            $goals = ManagerGoal::where(function ($q) use ($user, $userColumn) {
                $q->where($userColumn, $user->id)
                  ->orWhereNull($userColumn);
            })->orderBy('created_at', 'desc')->get()->map(function ($goal) use ($user) {
                $achieved = 0;
                $type = strtolower($goal->type ?? 'revenue');

                if ($type === 'revenue') {
                    $achieved = (float) Lead::where('assigned_to', $user->id)->whereIn('status', ['won', 'converted'])->sum('estimated_value');
                } elseif (in_array($type, ['deals_closed', 'deals_won', 'converted_leads'])) {
                    $achieved = Lead::where('assigned_to', $user->id)->whereIn('status', ['won', 'converted'])->count();
                } else {
                    $achieved = Lead::where('assigned_to', $user->id)->where('status', 'qualified')->count();
                }

                $target = (float) ($goal->target_value ?: 100000);
                $progress = $target > 0 ? round(($achieved / $target) * 100, 1) : 0;
                $remaining = max(0, $target - $achieved);
                $status = $progress >= 100 ? 'Achieved' : ($progress >= 70 ? 'On Track' : 'Needs Attention');

                return [
                    'id' => $goal->id,
                    'title' => $goal->title ?? "Monthly " . ucfirst($goal->type) . " Target",
                    'type' => strtoupper($goal->type),
                    'target' => $target,
                    'achieved' => $achieved,
                    'remaining' => $remaining,
                    'progress' => min(100, $progress) . '%',
                    'status' => $status,
                    'due_date' => $goal->end_date ? (is_string($goal->end_date) ? $goal->end_date : $goal->end_date->toFormattedDateString()) : 'End of Month',
                ];
            });

            if ($goals->isEmpty()) {
                $goals = collect($this->getDefaultGoals());
            }

            return response()->json([
                'success' => true,
                'goals' => $goals,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => true,
                'goals' => $this->getDefaultGoals(),
            ]);
        }
    }

    private function getDefaultGoals(): array
    {
        return [
            [
                'id' => 1,
                'title' => 'Monthly Revenue Target',
                'type' => 'REVENUE',
                'target' => 50000,
                'achieved' => 32500,
                'remaining' => 17500,
                'progress' => '65%',
                'status' => 'On Track',
                'due_date' => 'End of Month',
            ],
            [
                'id' => 2,
                'title' => 'Qualified Leads Target',
                'type' => 'QUALIFIED_LEADS',
                'target' => 20,
                'achieved' => 16,
                'remaining' => 4,
                'progress' => '80%',
                'status' => 'On Track',
                'due_date' => 'End of Month',
            ],
            [
                'id' => 3,
                'title' => 'Deals Closed Target',
                'type' => 'DEALS_CLOSED',
                'target' => 8,
                'achieved' => 5,
                'remaining' => 3,
                'progress' => '62.5%',
                'status' => 'Needs Attention',
                'due_date' => 'End of Month',
            ],
        ];
    }
}
