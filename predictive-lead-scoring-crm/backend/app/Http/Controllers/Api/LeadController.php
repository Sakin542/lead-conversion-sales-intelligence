<?php

namespace App\Http\Controllers\Api;

use App\Events\HotLeadDetected;
use App\Events\LeadAssigned;
use App\Events\LeadScoreUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Models\Lead;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    /**
     * Display a listing of the user's leads.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $query = Lead::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhere('assigned_to', $userId);
        });

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }

        if ($industry = $request->query('industry')) {
            $query->where('industry', $industry);
        }

        // Sorting
        $sort = $request->query('sort', 'created_at');
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = [
            'first_name',
            'last_name',
            'email',
            'company',
            'status',
            'score',
            'estimated_value',
            'created_at',
            'updated_at',
        ];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = min((int) $request->query('per_page', 20), 100);
        if ($perPage <= 0) {
            $perPage = 20;
        }

        $leads = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Leads retrieved successfully',
            'data' => $leads->items(),
            'pagination' => [
                'current_page' => $leads->currentPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
                'last_page' => $leads->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (empty($data['status'])) {
            $data['status'] = 'new';
        }
        if (empty($data['source'])) {
            $data['source'] = 'MANUAL_ENTRY';
        }
        $data['created_by'] = $request->user()->id;

        // Auto-calculate initial AI score if missing
        if (!isset($data['score']) || $data['score'] === null) {
            $data['score'] = $this->calculateInitialScore($data);
        }

        $lead = $request->user()->leads()->create($data);

        // Dispatch events
        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        if ($lead->score >= $hotThreshold) {
            try {
                event(new HotLeadDetected($lead, $lead->score));
            } catch (\Throwable $e) {
                // Event listener issue ignored
            }
        }

        if (!empty($data['assigned_to'])) {
            $salesRep = User::find($data['assigned_to']);
            if ($salesRep) {
                event(new LeadAssigned($lead, $salesRep));
            }
        }

        // Trigger internal team notification for new lead
        NotificationService::notifyRole(
            ['ADMIN', 'SALES_MANAGER'],
            'NEW_LEAD',
            '📌 New Lead Created',
            "Lead \"{$lead->first_name} {$lead->last_name}\" from {$lead->company} was created.",
            'Lead',
            (string) $lead->id,
            ['lead_id' => $lead->id, 'created_by' => $request->user()->name],
            'NORMAL',
            "lead-created:{$lead->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Lead created successfully',
            'data' => $lead,
        ], 201);
    }

    /**
     * Display the specified lead.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $lead = Lead::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhere('assigned_to', $userId);
        })->with(['activities', 'followUps'])->find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead retrieved successfully',
            'data' => $lead,
        ]);
    }

    /**
     * Update the specified lead in storage.
     */
    public function update(UpdateLeadRequest $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $lead = Lead::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhere('assigned_to', $userId);
        })->find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $oldAssignedTo = $lead->assigned_to;
        $lead->update($request->validated());

        if (array_key_exists('assigned_to', $request->validated())) {
            $newAssignedTo = $request->validated()['assigned_to'];
            if ($newAssignedTo && $newAssignedTo !== $oldAssignedTo) {
                $salesRep = User::find($newAssignedTo);
                if ($salesRep) {
                    event(new LeadAssigned($lead, $salesRep));
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead updated successfully',
            'data' => $lead,
        ]);
    }

    /**
     * Update lead score (Triggered by ML Engine or API).
     */
    public function updateScore(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'score' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $userId = $request->user()->id;
        $lead = Lead::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhere('assigned_to', $userId);
        })->find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $previousScore = $lead->score ?? 0;
        $newScore = (int) $validated['score'];

        $lead->score = $newScore;
        $lead->save();

        // 1. Dispatch score update event
        event(new LeadScoreUpdated($lead, $previousScore, $newScore));

        // 2. Dispatch hot lead event if threshold crossed
        $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
        if ($newScore >= $hotThreshold && !$lead->hot_notified) {
            event(new HotLeadDetected($lead));
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead score updated successfully',
            'data' => $lead,
        ]);
    }

    /**
     * Remove the specified lead from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $lead = Lead::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhere('assigned_to', $userId);
        })->find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $lead->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lead deleted successfully',
        ]);
    }

    /**
     * Helper to compute initial heuristic AI Lead Score (0-100).
     */
    private function calculateInitialScore(array $data): int
    {
        $score = 40; // Base score for internal entry

        $value = (float) ($data['estimated_value'] ?? ($data['budget'] ?? 0));
        if ($value >= 50000) {
            $score += 30;
        } elseif ($value >= 10000) {
            $score += 20;
        } elseif ($value >= 1000) {
            $score += 10;
        }

        $industry = strtolower($data['industry'] ?? '');
        if (in_array($industry, ['saas', 'software', 'finance', 'technology', 'enterprise', 'healthcare'])) {
            $score += 15;
        }

        return (int) min(99, max(10, $score));
    }
}
