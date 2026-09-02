<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Deal;
use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\ManagerGoal;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagerGoalController extends Controller
{
    /**
     * List goals with dynamic achieved values calculated from real database records.
     */
    public function index(Request $request): JsonResponse
    {
        $goals = ManagerGoal::with(['user:id,name,email', 'creator:id,name'])->get();

        // Calculate progress dynamically against real database records
        $calculatedGoals = $goals->map(function ($goal) {
            $achieved = 0.0;
            $userQuery = $goal->user_id ? ['assigned_to' => $goal->user_id] : [];

            switch ($goal->type) {
                case 'leads':
                    $query = Lead::query();
                    if ($goal->user_id) $query->where('assigned_to', $goal->user_id);
                    if ($goal->start_date) $query->whereDate('created_at', '>=', $goal->start_date);
                    if ($goal->end_date) $query->whereDate('created_at', '<=', $goal->end_date);
                    $achieved = (float) $query->count();
                    break;

                case 'qualified_leads':
                    $query = Lead::where('status', 'qualified');
                    if ($goal->user_id) $query->where('assigned_to', $goal->user_id);
                    if ($goal->start_date) $query->whereDate('created_at', '>=', $goal->start_date);
                    if ($goal->end_date) $query->whereDate('created_at', '<=', $goal->end_date);
                    $achieved = (float) $query->count();
                    break;

                case 'converted_leads':
                case 'deals_closed':
                    $query = Lead::whereIn('status', ['won', 'converted']);
                    if ($goal->user_id) $query->where('assigned_to', $goal->user_id);
                    if ($goal->start_date) $query->whereDate('created_at', '>=', $goal->start_date);
                    if ($goal->end_date) $query->whereDate('created_at', '<=', $goal->end_date);
                    $achieved = (float) $query->count();
                    break;

                case 'revenue':
                    $query = Deal::where('stage', 'won');
                    if ($goal->user_id) $query->where('user_id', $goal->user_id);
                    if ($goal->start_date) $query->whereDate('created_at', '>=', $goal->start_date);
                    if ($goal->end_date) $query->whereDate('created_at', '<=', $goal->end_date);
                    $achieved = (float) $query->sum('value');
                    if ($achieved == 0) {
                        $leadQuery = Lead::whereIn('status', ['won', 'converted']);
                        if ($goal->user_id) $leadQuery->where('assigned_to', $goal->user_id);
                        if ($goal->start_date) $leadQuery->whereDate('created_at', '>=', $goal->start_date);
                        if ($goal->end_date) $leadQuery->whereDate('created_at', '<=', $goal->end_date);
                        $achieved = (float) $leadQuery->sum('estimated_value');
                    }
                    break;

                case 'follow_ups':
                    $query = FollowUp::where('status', 'completed');
                    if ($goal->user_id) $query->where('user_id', $goal->user_id);
                    if ($goal->start_date) $query->whereDate('created_at', '>=', $goal->start_date);
                    if ($goal->end_date) $query->whereDate('created_at', '<=', $goal->end_date);
                    $achieved = (float) $query->count();
                    break;

                case 'conversion_rate':
                    $totalQuery = Lead::query();
                    if ($goal->user_id) $totalQuery->where('assigned_to', $goal->user_id);
                    $total = $totalQuery->count();

                    $wonQuery = Lead::whereIn('status', ['won', 'converted']);
                    if ($goal->user_id) $wonQuery->where('assigned_to', $goal->user_id);
                    $won = $wonQuery->count();

                    $achieved = $total > 0 ? round(($won / $total) * 100, 1) : 0;
                    break;
            }

            $progress = $goal->target_value > 0 ? round(($achieved / $goal->target_value) * 100, 1) : 0;

            $status = 'On Track';
            if ($progress >= 95) {
                $status = 'Excellent';
            } elseif ($progress < 60) {
                $status = 'At Risk';
            }

            $remaining = max(0, $goal->target_value - $achieved);

            return [
                'id' => $goal->id,
                'title' => $goal->user ? "{$goal->user->name} Target" : 'Team Target',
                'assigned_rep' => $goal->user ? $goal->user->name : 'Entire Team',
                'user_id' => $goal->user_id,
                'type' => $goal->type,
                'timeframe' => $goal->timeframe,
                'target_value' => $goal->target_value,
                'achieved_value' => $achieved,
                'remaining_value' => $remaining,
                'progress' => $progress,
                'status' => $status,
                'start_date' => $goal->start_date ? $goal->start_date->format('Y-m-d') : null,
                'end_date' => $goal->end_date ? $goal->end_date->format('Y-m-d') : null,
            ];
        });

        // Summary for Team Target Metrics
        $teamRevenueGoal = $goals->where('type', 'revenue')->whereNull('user_id')->first();
        $teamRevenueTarget = $teamRevenueGoal ? $teamRevenueGoal->target_value : 500000;
        $actualTeamRevenue = (float) Deal::where('stage', 'won')->sum('value');
        if ($actualTeamRevenue == 0) {
            $actualTeamRevenue = (float) Lead::whereIn('status', ['won', 'converted'])->sum('estimated_value');
        }

        $teamProgress = $teamRevenueTarget > 0 ? round(($actualTeamRevenue / $teamRevenueTarget) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'goals' => $calculatedGoals,
            'team_summary' => [
                'revenue_target' => $teamRevenueTarget,
                'achieved_revenue' => $actualTeamRevenue,
                'progress_percentage' => $teamProgress,
                'remaining' => max(0, $teamRevenueTarget - $actualTeamRevenue),
            ],
        ]);
    }

    /**
     * Store new goal.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'string', 'in:leads,qualified_leads,converted_leads,revenue,conversion_rate,follow_ups,deals_closed'],
            'target_value' => ['required', 'numeric', 'min:1'],
            'timeframe' => ['required', 'string', 'in:monthly,quarterly'],
            'user_id' => ['nullable', 'exists:users,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $goal = ManagerGoal::create([
            'user_id' => $request->user_id,
            'type' => $request->type,
            'target_value' => $request->target_value,
            'timeframe' => $request->timeframe,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'created_by' => $request->user()->id,
        ]);

        AuditLog::log(
            $request->user()->id,
            'manager_goal_created',
            'ManagerGoal',
            (string) $goal->id,
            ['type' => $goal->type, 'target_value' => $goal->target_value],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Goal created successfully.',
            'goal' => $goal,
        ], 201);
    }

    /**
     * Delete goal.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $goal = ManagerGoal::findOrFail($id);
        $goal->delete();

        AuditLog::log(
            $request->user()->id,
            'manager_goal_deleted',
            'ManagerGoal',
            (string) $id,
            [],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Goal deleted successfully.',
        ]);
    }
}

