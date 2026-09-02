<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Deal;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesRepPipelineController extends Controller
{
    /**
     * Get Personal Sales Pipeline Kanban Board.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $leads = Lead::where('assigned_to', $userId)
            ->select('id', 'first_name', 'last_name', 'company', 'email', 'status', 'score', 'estimated_value', 'created_at', 'updated_at')
            ->get();

        $deals = Deal::where('user_id', $userId)
            ->get();

        $stages = [
            'new' => ['name' => 'NEW LEADS', 'color' => 'indigo', 'items' => []],
            'contacted' => ['name' => 'CONTACTED', 'color' => 'purple', 'items' => []],
            'qualified' => ['name' => 'QUALIFIED', 'color' => 'cyan', 'items' => []],
            'proposal' => ['name' => 'PROPOSAL SENT', 'color' => 'amber', 'items' => []],
            'negotiation' => ['name' => 'NEGOTIATION', 'color' => 'orange', 'items' => []],
            'won' => ['name' => 'CLOSED WON', 'color' => 'emerald', 'items' => []],
            'lost' => ['name' => 'CLOSED LOST', 'color' => 'rose', 'items' => []],
        ];

        foreach ($leads as $lead) {
            $st = strtolower($lead->status);
            if (!isset($stages[$st])) {
                $st = 'new';
            }
            $stages[$st]['items'][] = [
                'id' => $lead->id,
                'title' => "{$lead->first_name} {$lead->last_name}",
                'company' => $lead->company,
                'value' => (float) ($lead->estimated_value ?: 25000),
                'score' => $lead->score,
                'status' => $lead->status,
                'updated_at' => $lead->updated_at ? $lead->updated_at->toDayDateTimeString() : 'N/A',
            ];
        }

        $totalPipelineValue = 0;
        foreach ($stages as $key => $st) {
            $val = array_sum(array_column($st['items'], 'value'));
            $stages[$key]['stage_value'] = $val;
            if (!in_array($key, ['won', 'lost'])) {
                $totalPipelineValue += $val;
            }
        }

        return response()->json([
            'success' => true,
            'pipeline' => $stages,
            'total_pipeline_value' => $totalPipelineValue,
        ]);
    }

    /**
     * Update Lead/Deal Pipeline Stage.
     */
    public function updateStage(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        $request->validate([
            'stage' => ['required', 'string', 'in:new,contacted,qualified,proposal,negotiation,won,lost,converted'],
        ]);

        $lead = Lead::findOrFail($id);
        if ($userRole === 'SALES_REP' && $lead->assigned_to !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You are not assigned to this lead.',
            ], 403);
        }

        $oldStatus = $lead->status;
        $lead->status = $request->stage;
        $lead->save();

        AuditLog::log(
            $userId,
            'pipeline_stage_updated',
            'Lead',
            (string) $lead->id,
            ['old_status' => $oldStatus, 'new_status' => $request->stage],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => "Lead stage updated to {$request->stage}.",
            'lead' => $lead,
        ]);
    }
}

