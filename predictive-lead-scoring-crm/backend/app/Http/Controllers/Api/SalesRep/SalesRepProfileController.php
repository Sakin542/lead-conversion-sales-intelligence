<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SalesRepProfileController extends Controller
{
    /**
     * Get Personal Profile Details.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $securityActivity = AuditLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => str_replace('_', ' ', strtoupper($log->action)),
                    'ip_address' => $log->ip_address ?: '127.0.0.1',
                    'timestamp' => $log->created_at->toDayDateTimeString(),
                ];
            });

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone ?? '+1 (555) 019-2834',
                'job_title' => 'Sales Representative',
                'created_at' => $user->created_at ? $user->created_at->toDayDateTimeString() : 'N/A',
            ],
            'security_activity' => $securityActivity,
        ]);
    }

    /**
     * Update Personal Profile (Name, Phone, Password).
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'current_password' => ['nullable', 'string'],
            'new_password' => ['nullable', 'string', 'min:6'],
        ]);

        $user->name = $request->name;
        if ($request->phone) {
            $user->phone = $request->phone;
        }

        if ($request->new_password) {
            if (!$request->current_password || !Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password verification failed.',
                ], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        AuditLog::log(
            $user->id,
            'profile_updated',
            'User',
            (string) $user->id,
            ['name' => $user->name],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile details updated successfully.',
            'user' => $user,
        ]);
    }
}

