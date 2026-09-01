<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FollowUp;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowUpController extends Controller
{
    /**
     * Display a listing of user's follow-ups.
     */
    public function index(Request $request): JsonResponse
    {
        $query = FollowUp::where('user_id', $request->user()->id)
            ->with(['lead:id,first_name,last_name,company,email']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('lead_id')) {
            $query->where('lead_id', $request->lead_id);
        }

        $followUps = $query->orderBy('scheduled_at', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $followUps,
        ], 200);
    }

    /**
     * Store a newly created follow-up in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => ['required', 'exists:leads,id'],
            'type' => ['required', 'in:call,email,meeting,demo,other'],
            'scheduled_at' => ['required', 'date'],
            'note' => ['nullable', 'string'],
        ]);

        // Verify lead ownership/access
        $lead = Lead::findOrFail($validated['lead_id']);
        if ($lead->user_id !== $request->user()->id && $lead->assigned_to !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action on this lead.',
            ], 403);
        }

        $followUp = FollowUp::create([
            'lead_id' => $validated['lead_id'],
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'scheduled_at' => $validated['scheduled_at'],
            'note' => $validated['note'] ?? null,
            'status' => 'pending',
            'reminder_sent' => false,
        ]);

        $followUp->load('lead:id,first_name,last_name,company,email');

        return response()->json([
            'success' => true,
            'message' => 'Sales follow-up scheduled successfully.',
            'data' => $followUp,
        ], 201);
    }

    /**
     * Display the specified follow-up.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $followUp = FollowUp::where('user_id', $request->user()->id)
            ->with('lead')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $followUp,
        ], 200);
    }

    /**
     * Update the specified follow-up.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $followUp = FollowUp::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'type' => ['sometimes', 'in:call,email,meeting,demo,other'],
            'scheduled_at' => ['sometimes', 'date'],
            'note' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:pending,completed,cancelled'],
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && $followUp->status !== 'completed') {
            $validated['completed_at'] = now();
        }

        $followUp->update($validated);
        $followUp->load('lead:id,first_name,last_name,company,email');

        return response()->json([
            'success' => true,
            'message' => 'Follow-up updated successfully.',
            'data' => $followUp,
        ], 200);
    }

    /**
     * Mark the follow-up as completed.
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $followUp = FollowUp::where('user_id', $request->user()->id)->findOrFail($id);

        $followUp->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Follow-up marked as completed.',
            'data' => $followUp,
        ], 200);
    }

    /**
     * Remove the specified follow-up from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $followUp = FollowUp::where('user_id', $request->user()->id)->findOrFail($id);
        $followUp->delete();

        return response()->json([
            'success' => true,
            'message' => 'Follow-up deleted successfully.',
        ], 200);
    }
}

