<?php

namespace App\Http\Controllers\Api\SalesRep;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesRepNotificationController extends Controller
{
    /**
     * Get Personal Notifications for Authenticated User.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = (int) $request->query('per_page', 30);
        $paginator = NotificationService::getNotifications($user, [], $perPage);
        $unreadCount = NotificationService::getUnreadCount($user);

        $notifications = collect($paginator->items())->map(function ($n) {
            return [
                'id' => (string) $n->id,
                'type' => $n->type,
                'title' => $n->title ?? 'Notification',
                'message' => $n->message ?? '',
                'entity_type' => $n->entity_type,
                'entity_id' => $n->entity_id,
                'priority' => $n->priority ?? 'NORMAL',
                'read' => (bool) $n->is_read,
                'is_read' => (bool) $n->is_read,
                'action_url' => $n->data['action_url'] ?? NotificationService::resolveActionUrl($n->user->role ?? 'SALES_REP', $n->entity_type, $n->entity_id),
                'created_at' => $n->created_at ? $n->created_at->toDayDateTimeString() : now()->toDayDateTimeString(),
            ];
        });

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark Notification as Read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $success = NotificationService::markAsRead($id, $user);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }
}
