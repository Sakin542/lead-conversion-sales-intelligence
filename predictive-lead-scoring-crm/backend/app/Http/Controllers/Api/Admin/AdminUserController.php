<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserController extends Controller
{
    /**
     * List all users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('inviter:id,name');

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->query('status')) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'pending') {
                $query->where('is_active', false);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Update user role or profile details.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'role' => ['sometimes', 'string', 'in:' . implode(',', [User::ROLE_ADMIN, User::ROLE_SALES_MANAGER, User::ROLE_SALES_REP])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $oldRole = $user->role;
        $user->update($request->only('name', 'role', 'is_active'));

        AuditLog::log(
            $request->user()->id,
            'user_updated',
            'User',
            (string) $user->id,
            ['old_role' => $oldRole, 'new_role' => $user->role, 'is_active' => $user->is_active],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        AuditLog::log(
            $request->user()->id,
            $user->is_active ? 'user_activated' : 'user_deactivated',
            'User',
            (string) $user->id,
            ['email' => $user->email],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * Send password reset trigger for user.
     */
    public function triggerPasswordReset(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $code = (string) random_int(100000, 999999);
        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'email' => $user->email,
                'token' => Hash::make($token),
                'code' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        $user->notify(new ResetPasswordNotification($token, $code));

        AuditLog::log(
            $request->user()->id,
            'password_reset_triggered',
            'User',
            (string) $user->id,
            ['target_email' => $user->email],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => "Password reset instructions sent to {$user->email}.",
        ]);
    }

    /**
     * Delete user account.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user()->id === $id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own Admin account.',
            ], 422);
        }

        $user = User::findOrFail($id);
        $userEmail = $user->email;

        $user->tokens()->delete();
        $user->delete();

        AuditLog::log(
            $request->user()->id,
            'user_deleted',
            'User',
            (string) $id,
            ['deleted_email' => $userEmail],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}

