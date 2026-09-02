<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FollowUp;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagerAtRiskLeadController extends Controller
{
    /**
     * Scan active leads and return at-risk / stale leads requiring Manager intervention.
     */
    public function index(Request $request): JsonResponse
    {
        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);

        $query = Lead::with(['assignedTo:id,name', 'user:id,name'])
            ->whereNotIn('status', ['won', 'lost', 'converted']);

        if ($repId = $request->query('sales_rep_id')) {
            if ($repId === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $repId);
            }
        }

        if ($stage = $request->query('stage')) {
            $query->where('status', $stage);
        }

        $allLeads = $query->orderBy('updated_at', 'asc')->get();

        $atRiskLeads = [];

        foreach ($allLeads as $lead) {
            $score = $lead->score ?? 0;
            $updatedAt = $lead->updated_at ?: $lead->created_at;
            $daysInactive = $updatedAt ? (int) now()->diffInDays($updatedAt) : 0;

            $hasPendingFollowup = FollowUp::where('lead_id', $lead->id)
                ->where('status', 'pending')
                ->exists();

            $overdueFollowupCount = FollowUp::where('lead_id', $lead->id)
                ->where('status', 'pending')
                ->where('scheduled_at', '<', now())
                ->count();

            $riskLevel = null;
            $riskReason = null;
            $recommendedAction = null;

            // Rule 1: CRITICAL - HOT lead with overdue follow-ups or no activity >= 4 days
            if ($score >= $hotThreshold && ($overdueFollowupCount > 0 || $daysInactive >= 4)) {
                $riskLevel = 'CRITICAL';
                $riskReason = "🔥 HOT Lead (Score {$score}) with {$daysInactive} days inactivity & {$overdueFollowupCount} overdue follow-ups.";
                $recommendedAction = 'Immediate Rep contact or reassign to available executive.';
            }
            // Rule 2: HIGH - Proposal / Negotiation stage inactive >= 5 days
            elseif (in_array(strtolower($lead->status), ['proposal', 'negotiation']) && $daysInactive >= 5) {
                $riskLevel = 'HIGH';
                $riskReason = "Deal stuck in {$lead->status} stage for {$daysInactive} days without response.";
                $recommendedAction = 'Schedule executive follow-up call & review pricing proposal.';
            }
            // Rule 3: HIGH - Qualified lead with no scheduled follow-up
            elseif (strtolower($lead->status) === 'qualified' && !$hasPendingFollowup && $daysInactive >= 3) {
                $riskLevel = 'HIGH';
                $riskReason = "Qualified lead with no scheduled next action.";
                $recommendedAction = 'Schedule next demo/discovery action.';
            }
            // Rule 4: MEDIUM - Inactive >= 7 days regardless of stage
            elseif ($daysInactive >= 7) {
                $riskLevel = 'MEDIUM';
                $riskReason = "Lead inactive for {$daysInactive} days without activity updates.";
                $recommendedAction = 'Contact representative for status check.';
            }
            // Rule 5: LOW - Unassigned lead > 2 days
            elseif (!$lead->assigned_to && $daysInactive >= 2) {
                $riskLevel = 'LOW';
                $riskReason = "Lead unassigned for {$daysInactive} days.";
                $recommendedAction = 'Assign to available Sales Representative.';
            }

            if ($riskLevel) {
                // Apply Risk Level Filter if requested
                if ($filterRisk = $request->query('risk_level')) {
                    if (strtoupper($filterRisk) !== $riskLevel) {
                        continue;
                    }
                }

                $atRiskLeads[] = [
                    'id' => $lead->id,
                    'lead_name' => $lead->first_name . ' ' . $lead->last_name,
                    'email' => $lead->email,
                    'company' => $lead->company ?: 'N/A',
                    'score' => $score,
                    'conversion_probability' => min(99, max(5, round($score * 1.05))) . '%',
                    'pipeline_stage' => $lead->status,
                    'last_activity' => $updatedAt ? $updatedAt->toDayDateTimeString() : 'N/A',
                    'days_inactive' => $daysInactive,
                    'assigned_rep' => $lead->assignedTo ? $lead->assignedTo->name : 'Unassigned',
                    'assigned_to' => $lead->assigned_to,
                    'risk_level' => $riskLevel,
                    'risk_reason' => $riskReason,
                    'recommended_action' => $recommendedAction,
                ];
            }
        }

        // Sort by CRITICAL -> HIGH -> MEDIUM -> LOW
        $priorityOrder = ['CRITICAL' => 1, 'HIGH' => 2, 'MEDIUM' => 3, 'LOW' => 4];
        usort($atRiskLeads, fn($a, $b) => $priorityOrder[$a['risk_level']] <=> $priorityOrder[$b['risk_level']]);

        return response()->json([
            'success' => true,
            'at_risk_leads' => $atRiskLeads,
            'summary' => [
                'total_at_risk' => count($atRiskLeads),
                'critical_count' => count(array_filter($atRiskLeads, fn($l) => $l['risk_level'] === 'CRITICAL')),
                'high_count' => count(array_filter($atRiskLeads, fn($l) => $l['risk_level'] === 'HIGH')),
                'medium_count' => count(array_filter($atRiskLeads, fn($l) => $l['risk_level'] === 'MEDIUM')),
                'low_count' => count(array_filter($atRiskLeads, fn($l) => $l['risk_level'] === 'LOW')),
            ],
        ]);
    }

    /**
     * Mark risk flag as resolved or touch lead.
     */
    public function resolve(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->touch(); // updates updated_at timestamp

        AuditLog::log(
            $request->user()->id,
            'lead_risk_resolved',
            'Lead',
            (string) $lead->id,
            ['resolved_by' => $request->user()->name],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Lead risk status marked as resolved.',
            'lead' => $lead,
        ]);
    }
}

