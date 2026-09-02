<?php

namespace App\Http\Controllers\Api\Manager;

use App\Events\LeadAssigned;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagerAiAssignmentController extends Controller
{
    /**
     * Get AI lead assignment recommendations for unassigned or target leads.
     */
    public function recommendations(Request $request): JsonResponse
    {
        $salesReps = User::whereIn('role', [User::ROLE_SALES_REP, User::ROLE_SALES_MANAGER])
            ->where('is_active', true)
            ->withCount(['assignedLeads as total_assigned'])
            ->withCount(['assignedLeads as converted_count' => function ($q) {
                $q->whereIn('status', ['won', 'converted']);
            }])
            ->withCount(['assignedLeads as active_workload' => function ($q) {
                $q->whereNotIn('status', ['won', 'lost', 'converted']);
            }])
            ->get();

        if ($salesReps->isEmpty()) {
            return response()->json([
                'success' => true,
                'recommendations' => [],
                'message' => 'No active sales representatives available for assignment recommendation.',
            ]);
        }

        $leadQuery = Lead::with('assignedTo:id,name');

        if ($leadId = $request->query('lead_id')) {
            $leadQuery->where('id', $leadId);
        } else {
            // Default to unassigned or recently created leads
            $leadQuery->whereNull('assigned_to')->orWhere('status', 'new');
        }

        $targetLeads = $leadQuery->limit(10)->get();

        $results = [];

        foreach ($targetLeads as $lead) {
            $repScores = [];

            foreach ($salesReps as $rep) {
                $conversionRate = $rep->total_assigned > 0 ? round(($rep->converted_count / $rep->total_assigned) * 100, 1) : 0;
                $workload = $rep->active_workload;

                // Source affinity score
                $sourceMatchCount = Lead::where('assigned_to', $rep->id)
                    ->where('source', $lead->source)
                    ->whereIn('status', ['won', 'converted'])
                    ->count();

                $similarDealsCount = Lead::where('assigned_to', $rep->id)
                    ->whereIn('status', ['won', 'converted'])
                    ->count();

                // Composite Confidence Calculation (0 - 100)
                $confidence = 50;
                $confidence += min(25, $conversionRate * 0.3);
                $confidence += min(15, $sourceMatchCount * 5);
                $confidence -= min(20, $workload * 2);
                $confidence = max(15, min(98, round($confidence)));

                // Build transparent reasons list
                $reasons = [];
                if ($conversionRate >= 20) {
                    $reasons[] = "✓ High historical conversion rate ({$conversionRate}%)";
                }
                if ($sourceMatchCount > 0) {
                    $reasons[] = "✓ Strong performance on {$lead->source} acquisition channel ({$sourceMatchCount} closed)";
                }
                if ($workload <= 5) {
                    $reasons[] = "✓ Low active workload ({$workload} assigned leads)";
                } else {
                    $reasons[] = "• Moderate active workload ({$workload} assigned leads)";
                }
                if ($similarDealsCount > 0) {
                    $reasons[] = "✓ Closed {$similarDealsCount} similar converted deals";
                }

                $repScores[] = [
                    'rep_id' => $rep->id,
                    'rep_name' => $rep->name,
                    'rep_email' => $rep->email,
                    'confidence' => $confidence,
                    'conversion_rate' => $conversionRate,
                    'workload' => $workload,
                    'reasons' => $reasons,
                ];
            }

            // Sort reps by confidence descending
            usort($repScores, fn($a, $b) => $b['confidence'] <=> $a['confidence']);

            $bestMatch = $repScores[0];
            $alternatives = array_slice($repScores, 1);

            $results[] = [
                'lead_id' => $lead->id,
                'lead_name' => $lead->first_name . ' ' . $lead->last_name,
                'email' => $lead->email,
                'company' => $lead->company ?: 'N/A',
                'source' => $lead->source,
                'score' => $lead->score ?? 0,
                'recommended_rep' => [
                    'id' => $bestMatch['rep_id'],
                    'name' => $bestMatch['rep_name'],
                    'email' => $bestMatch['rep_email'],
                ],
                'confidence' => $bestMatch['confidence'],
                'reasons' => $bestMatch['reasons'],
                'current_workload' => $bestMatch['workload'],
                'historical_rate' => $bestMatch['conversion_rate'] . '%',
                'alternatives' => $alternatives,
            ];
        }

        return response()->json([
            'success' => true,
            'recommendations' => $results,
        ]);
    }

    /**
     * Accept AI recommendation or assign lead to selected representative.
     */
    public function assign(Request $request, int $leadId): JsonResponse
    {
        $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $lead = Lead::findOrFail($leadId);
        $lead->assigned_to = $request->assigned_to;
        $lead->save();

        $salesRep = User::find($request->assigned_to);
        if ($salesRep) {
            event(new LeadAssigned($lead, $salesRep));
        }

        AuditLog::log(
            $request->user()->id,
            'ai_lead_assigned_by_manager',
            'Lead',
            (string) $lead->id,
            ['assigned_to' => $request->assigned_to],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => "Lead assigned to {$salesRep->name} successfully.",
            'lead' => $lead->load('assignedTo:id,name'),
        ]);
    }
}

