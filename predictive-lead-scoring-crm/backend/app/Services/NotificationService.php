<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * Create and send a single notification.
     */
    public static function createNotification(
        User|int $user,
        string $type,
        string $title,
        string $message,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $metadata = null,
        string $priority = 'NORMAL',
        ?string $eventKey = null,
        ?string $actionUrl = null
    ): ?Notification {
        try {
            $userModel = $user instanceof User ? $user : User::find($user);
            if (!$userModel || !$userModel->is_active) {
                return null;
            }

            // Prevent Duplicate Notifications via Event Key
            if ($eventKey) {
                $exists = Notification::where('user_id', $userModel->id)
                    ->where('event_key', $eventKey)
                    ->exists();

                if ($exists) {
                    return null;
                }
            }

            // Determine default action URL if not provided
            if (!$actionUrl) {
                $actionUrl = self::resolveActionUrl($userModel->role, $entityType, $entityId);
            }

            $notificationId = (string) Str::uuid();
            $dataPayload = [
                'id' => $notificationId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'entity_type' => $entityType,
                'entity_id' => $entityId ? (string) $entityId : null,
                'priority' => $priority,
                'action_url' => $actionUrl,
                'metadata' => $metadata ?? [],
            ];

            $notification = Notification::create([
                'id' => $notificationId,
                'type' => $type,
                'notifiable_type' => User::class,
                'notifiable_id' => $userModel->id,
                'user_id' => $userModel->id,
                'title' => $title,
                'message' => $message,
                'entity_type' => $entityType,
                'entity_id' => $entityId ? (string) $entityId : null,
                'metadata' => $metadata,
                'priority' => $priority,
                'event_key' => $eventKey,
                'is_read' => false,
                'read_at' => null,
                'data' => $dataPayload,
            ]);

            // Real-Time Socket Broadcast (Failsafed)
            self::broadcastToSocket($userModel->id, $notification);

            return $notification;
        } catch (\Throwable $e) {
            Log::error('Notification creation error: ' . $e->getMessage(), [
                'user_id' => is_numeric($user) ? $user : ($user->id ?? null),
                'type' => $type,
            ]);
            return null;
        }
    }

    /**
     * Send notification to multiple users.
     */
    public static function notifyUsers(
        iterable $users,
        string $type,
        string $title,
        string $message,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $metadata = null,
        string $priority = 'NORMAL',
        ?string $eventKeyPrefix = null,
        ?string $actionUrl = null
    ): array {
        $created = [];
        foreach ($users as $user) {
            $userObj = $user instanceof User ? $user : User::find($user);
            if (!$userObj) {
                continue;
            }

            $eventKey = $eventKeyPrefix ? "{$eventKeyPrefix}:user:{$userObj->id}" : null;
            $notif = self::createNotification(
                $userObj,
                $type,
                $title,
                $message,
                $entityType,
                $entityId,
                $metadata,
                $priority,
                $eventKey,
                $actionUrl
            );

            if ($notif) {
                $created[] = $notif;
            }
        }
        return $created;
    }

    /**
     * Send notification to all users matching specified role(s).
     */
    public static function notifyRole(
        string|array $roles,
        string $type,
        string $title,
        string $message,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $metadata = null,
        string $priority = 'NORMAL',
        ?string $eventKeyPrefix = null,
        ?string $actionUrl = null
    ): array {
        $roleList = is_array($roles) ? $roles : [$roles];
        $users = User::whereIn('role', $roleList)->where('is_active', true)->get();
        return self::notifyUsers($users, $type, $title, $message, $entityType, $entityId, $metadata, $priority, $eventKeyPrefix, $actionUrl);
    }

    /**
     * Broadcast notification payload to Socket.IO server.
     */
    private static function broadcastToSocket(int $userId, Notification $notification): void
    {
        try {
            $socketUrl = env('SOCKET_SERVER_URL', 'http://127.0.0.1:6001/broadcast');
            $socketSecret = env('SOCKET_SECRET', 'crm_socket_secret_123');

            $payload = [
                'id' => (string) $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'entity_type' => $notification->entity_type,
                'entity_id' => $notification->entity_id,
                'priority' => $notification->priority,
                'is_read' => (bool) $notification->is_read,
                'action_url' => $notification->data['action_url'] ?? null,
                'metadata' => $notification->metadata ?? [],
                'created_at' => $notification->created_at ? $notification->created_at->toISOString() : now()->toISOString(),
            ];

            Http::timeout(1.5)->post($socketUrl, [
                'secret' => $socketSecret,
                'userId' => $userId,
                'notification' => $payload,
            ]);
        } catch (\Throwable $e) {
            // Log silently; socket server unavailable shouldn't fail business operations
            Log::debug('Socket broadcast attempted: ' . $e->getMessage());
        }
    }

    /**
     * Resolve default actionable URL depending on user role and entity.
     */
    public static function resolveActionUrl(string $role, ?string $entityType, ?string $entityId): ?string
    {
        if (!$entityType) {
            return null;
        }

        switch (strtoupper($entityType)) {
            case 'LEAD':
                if ($role === User::ROLE_SALES_REP) {
                    return $entityId ? "/sales-rep/leads/{$entityId}" : "/sales-rep/leads";
                }
                if ($role === User::ROLE_SALES_MANAGER) {
                    return $entityId ? "/manager/at-risk-leads" : "/leads";
                }
                return "/admin/leads";

            case 'FOLLOWUP':
            case 'FOLLOW_UP':
                return "/sales-rep/follow-ups";

            case 'DEAL':
            case 'PIPELINE':
                return $role === User::ROLE_SALES_REP ? "/sales-rep/pipeline" : "/pipeline";

            case 'USER':
                return "/admin/users";

            case 'MODEL':
            case 'ML':
                return "/admin/ml";

            default:
                return null;
        }
    }

    /**
     * Query notifications for authenticated user with pagination & filter.
     */
    public static function getNotifications(User $user, array $filters = [], int $perPage = 20)
    {
        $query = Notification::where('user_id', $user->id);

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $type = strtoupper($filters['type']);
            if ($type === 'UNREAD') {
                $query->where('is_read', false);
            } elseif ($type === 'LEADS') {
                $query->whereIn('type', [
                    'NEW_LEAD', 'LEAD_ASSIGNED', 'LEAD_REASSIGNED', 'LEAD_UPDATED',
                    'LEAD_STATUS_CHANGED', 'LEAD_QUALIFIED', 'LEAD_CONVERTED', 'LEAD_LOST',
                    'HOT_LEAD_DETECTED', 'HIGH_VALUE_LEAD', 'STALE_LEAD', 'AT_RISK_LEAD',
                    'PUBLIC_LEAD_SUBMISSION', 'HOT_LEAD_ALERT'
                ]);
            } elseif ($type === 'FOLLOWUPS' || $type === 'FOLLOW_UPS') {
                $query->whereIn('type', [
                    'FOLLOW_UP_DUE', 'FOLLOW_UP_OVERDUE', 'FOLLOW_UP_ASSIGNED', 'FOLLOW_UP_COMPLETED'
                ]);
            } elseif ($type === 'PIPELINE' || $type === 'DEALS') {
                $query->whereIn('type', [
                    'DEAL_CREATED', 'DEAL_STAGE_CHANGED', 'DEAL_WON', 'DEAL_LOST', 'DEAL_STALE'
                ]);
            } elseif ($type === 'AI' || $type === 'ML') {
                $query->whereIn('type', [
                    'AI_SCORE_UPDATED', 'AI_HIGH_CONVERSION_PROBABILITY', 'AI_LOW_CONVERSION_PROBABILITY',
                    'MODEL_PREDICTION_FAILED', 'ML_MODEL_UPDATED', 'ML_MODEL_TRAINING_COMPLETED'
                ]);
            } elseif ($type === 'SYSTEM') {
                $query->whereIn('type', [
                    'SYSTEM_ALERT', 'SYSTEM_MAINTENANCE', 'EMAIL_DELIVERY_FAILED',
                    'IMPORT_COMPLETED', 'IMPORT_FAILED', 'USER_CREATED', 'USER_INVITED', 'ROLE_CHANGED'
                ]);
            } else {
                $query->where('type', $filters['type']);
            }
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('message', 'like', $search);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get total unread count for user.
     */
    public static function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Mark single notification as read.
     */
    public static function markAsRead(string $id, User $user): bool
    {
        $query = Notification::where('id', $id);
        if ($user->role !== 'ADMIN' && $user->role !== User::ROLE_ADMIN) {
            $query->where('user_id', $user->id);
        }
        $notification = $query->first();

        if ($notification) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
            return true;
        }

        return false;
    }

    /**
     * Mark all notifications as read for user.
     */
    public static function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Delete notification.
     */
    public static function deleteNotification(string $id, User $user): bool
    {
        $query = Notification::where('id', $id);
        if ($user->role !== 'ADMIN' && $user->role !== User::ROLE_ADMIN) {
            $query->where('user_id', $user->id);
        }
        return $query->delete() > 0;
    }
}

