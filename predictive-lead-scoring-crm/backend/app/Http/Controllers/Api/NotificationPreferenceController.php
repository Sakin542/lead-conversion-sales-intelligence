<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    /**
     * Display current user's notification preferences.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $preferences = $user->getOrDefaultsNotificationPreference();

        return response()->json([
            'success' => true,
            'preferences' => $preferences,
        ], 200);
    }

    /**
     * Update user's notification preferences.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_assignment_enabled' => ['sometimes', 'boolean'],
            'hot_lead_enabled' => ['sometimes', 'boolean'],
            'lead_score_enabled' => ['sometimes', 'boolean'],
            'follow_up_enabled' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $preferences = $user->getOrDefaultsNotificationPreference();
        $preferences->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated successfully.',
            'preferences' => $preferences,
        ], 200);
    }
}

