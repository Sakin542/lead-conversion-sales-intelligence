<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\UserInvitationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * List users according to authenticated user's role.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->isAdmin()) {
            $users = User::with('inviter:id,name')
                ->select(['id', 'name', 'email', 'role', 'is_active', 'created_at', 'invited_by'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else if ($currentUser->isSalesManager()) {
            $users = User::with('inviter:id,name')
                ->where('role', User::ROLE_SALES_REP)
                ->orWhere('id', $currentUser->id)
                ->select(['id', 'name', 'email', 'role', 'is_active', 'created_at', 'invited_by'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'users' => $users,
        ], 200);
    }

    /**
     * Invite a new user to the CRM.
     */
    public function invite(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:' . implode(',', [User::ROLE_ADMIN, User::ROLE_SALES_MANAGER, User::ROLE_SALES_REP])],
        ]);

        $requestedRole = $request->role;

        // Sales Manager can ONLY invite SALES_REP
        if ($currentUser->isSalesManager() && $requestedRole !== User::ROLE_SALES_REP) {
            return response()->json([
                'success' => false,
                'message' => 'Sales Managers are only permitted to invite Sales Representatives.',
            ], 403);
        }

        // Sales Rep cannot invite any user
        if ($currentUser->isSalesRep()) {
            return response()->json([
                'success' => false,
                'message' => 'Sales Representatives cannot invite users.',
            ], 403);
        }

        $plainToken = Str::random(64);
        $hashedToken = hash('sha256', $plainToken);

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make(Str::random(32)),
            'role' => $requestedRole,
            'is_active' => false,
            'invitation_token' => $hashedToken,
            'invitation_expires_at' => now()->addDays(7),
            'invited_by' => $currentUser->id,
        ]);

        // Send invitation email
        $newUser->notify(new UserInvitationNotification($plainToken, $currentUser->name));

        return response()->json([
            'success' => true,
            'message' => 'User invitation sent successfully.',
            'user' => [
                'id' => $newUser->id,
                'name' => $newUser->name,
                'email' => $newUser->email,
                'role' => $newUser->role,
                'is_active' => $newUser->is_active,
                'created_at' => $newUser->created_at,
            ],
        ], 201);
    }

    /**
     * Verify invitation token.
     */
    public function verifyInvitation(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid invitation or account is already active.',
            ], 422);
        }

        $hashedInputToken = hash('sha256', $request->token);
        if (!$user->invitation_token || !hash_equals($user->invitation_token, $hashedInputToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired invitation token.',
            ], 422);
        }

        if ($user->invitation_expires_at && now()->gt($user->invitation_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation token has expired. Please request a new invitation.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invitation token is valid.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 200);
    }

    /**
     * Accept invitation and set account password.
     */
    public function acceptInvitation(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid invitation or account is already active.',
            ], 422);
        }

        $hashedInputToken = hash('sha256', $request->token);
        if (!$user->invitation_token || !hash_equals($user->invitation_token, $hashedInputToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired invitation token.',
            ], 422);
        }

        if ($user->invitation_expires_at && now()->gt($user->invitation_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation token has expired. Please request a new invitation.',
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->is_active = true;
        $user->invitation_token = null;
        $user->invitation_expires_at = null;
        $user->email_verified_at = now();
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account activated successfully. You can now log in.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Delete user account (Admin only).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $currentUser = $request->user();

        if (!$currentUser->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admins can delete user accounts.',
            ], 403);
        }

        if ($currentUser->id === $id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own Admin account.',
            ], 422);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $targetUser->tokens()->delete();
        $targetUser->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ], 200);
    }
}

