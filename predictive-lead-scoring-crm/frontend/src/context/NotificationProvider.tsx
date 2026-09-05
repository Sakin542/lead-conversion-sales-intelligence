import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationApi, getToken } from '../services/api';
import { NotificationToastContainer, ToastItem } from '../components/notifications/NotificationToast';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  priority?: string;
  is_read: boolean;
  read?: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
  formatted_time?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  toasts: ToastItem[];
  loading: boolean;
  fetchNotifications: (params?: { type?: string; search?: string; page?: number }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!user || !token) return;
    try {
      const res = await notificationApi.getUnreadCount();
      if (res && res.success) {
        setUnreadCount(res.unread_count);
      }
    } catch (e) {
      // Ignore initial load errors silently
    }
  }, [user]);

  const fetchNotifications = useCallback(async (params?: { type?: string; search?: string; page?: number }) => {
    const token = getToken();
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications(params);
      if (res && res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count);
      }
    } catch (e: any) {
      if (e?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      await notificationApi.markRead(id);
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      setUnreadCount(0);
      await notificationApi.markAllRead();
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.is_read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      await notificationApi.deleteNotification(id);
    } catch (e: any) {
      if (e?.status === 404) {
        return;
      }
      console.error('Failed to delete notification:', e);
    }
  }, [notifications]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize Socket.IO connection when user logs in
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setConnectionStatus('disconnected');
      return;
    }

    const token = getToken();
    if (!token) return;

    setConnectionStatus('connecting');

    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      setConnectionStatus('disconnected');
      fetchUnreadCount();
      fetchNotifications();
      return;
    }

    setConnectionStatus('connecting');

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 5000,
      timeout: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      fetchUnreadCount();
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
      // Stop reconnection attempts when socket server is offline
      try {
        socket.disconnect();
      } catch (e) {
        // Ignore
      }
    });

    // Real-Time Event Handler
    socket.on('notification:new', (newNotif: NotificationItem) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((count) => count + 1);

      // Add real-time toast alert
      const toastItem: ToastItem = {
        id: newNotif.id || String(Date.now()),
        type: newNotif.type,
        title: newNotif.title,
        message: newNotif.message,
        priority: newNotif.priority,
        action_url: newNotif.action_url,
        created_at: newNotif.created_at,
      };

      setToasts((prev) => [toastItem, ...prev.slice(0, 4)]);

      // Auto-dismiss toast after 6 seconds
      setTimeout(() => {
        dismissToast(toastItem.id);
      }, 6000);
    });

    // Initial load
    fetchUnreadCount();
    fetchNotifications();

    // Background real-time polling fallback
    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 12000);

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.off();
        if (socket.connected) {
          socket.disconnect();
        } else {
          // If unmounting while still connecting (e.g. React 18 StrictMode), delay disconnect slightly to prevent WebSocket closed warning
          setTimeout(() => {
            try {
              socket.disconnect();
            } catch (e) {
              // Ignore
            }
          }, 150);
        }
      }
      socketRef.current = null;
    };
  }, [user, fetchUnreadCount, fetchNotifications, dismissToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        connectionStatus,
        toasts,
        loading,
        fetchNotifications,
        markRead,
        markAllRead,
        deleteNotification,
        dismissToast,
      }}
    >
      {children}
      <NotificationToastContainer toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      connectionStatus: 'disconnected' as const,
      toasts: [],
      loading: false,
      fetchNotifications: async () => {},
      markRead: async () => {},
      markAllRead: async () => {},
      deleteNotification: async () => {},
      dismissToast: () => {},
    };
  }
  return context;
};

