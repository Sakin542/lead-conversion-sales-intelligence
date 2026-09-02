<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get Notifications for Authenticated User with pagination & filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = [
            'type' => $request->query('type', 'all'),
            'search' => $request->query('search', ''),
        ];
        $perPage = (int) $request->query('per_page', 20);

        $paginator = NotificationService::getNotifications($user, $filters, $perPage);
        $unreadCount = NotificationService::getUnreadCount($user);

        $items = collect($paginator->items())->map(function ($n) {
            return [
                'id' => (string) $n->id,
                'type' => $n->type,
                'title' => $n->title ?? 'System Alert',
                'message' => $n->message ?? '',
                'entity_type' => $n->entity_type,
                'entity_id' => $n->entity_id,
                'priority' => $n->priority ?? 'NORMAL',
                'is_read' => (bool) $n->is_read,
                'read' => (bool) $n->is_read,
                'action_url' => $n->data['action_url'] ?? NotificationService::resolveActionUrl($n->user->role ?? 'SALES_REP', $n->entity_type, $n->entity_id),
                'metadata' => $n->metadata ?? [],
                'created_at' => $n->created_at ? $n->created_at->toISOString() : now()->toISOString(),
                'formatted_time' => $n->created_at ? $n->created_at->diffForHumans() : 'Just now',
            ];
        });

        return response()->json([
            'success' => true,
            'notifications' => $items,
            'unread_count' => $unreadCount,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Get unread notification count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $unreadCount = NotificationService::getUnreadCount($user);

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark single notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $success = NotificationService::markAsRead($id, $user);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Notification marked as read.' : 'Notification not found or unauthorized.',
            'unread_count' => NotificationService::getUnreadCount($user),
        ], $success ? 200 : 404);
    }

    /**
     * Mark all notifications as read for user.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = NotificationService::markAllAsRead($user);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read.",
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $success = NotificationService::deleteNotification($id, $user);

        return response()->json([
            'success' => true,
            'message' => $success ? 'Notification deleted.' : 'Notification already removed.',
            'unread_count' => NotificationService::getUnreadCount($user),
        ], 200);
    }
}

