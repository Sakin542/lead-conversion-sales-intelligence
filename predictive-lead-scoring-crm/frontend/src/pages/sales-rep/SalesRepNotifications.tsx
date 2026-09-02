import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { salesRepApi } from '../../services/api';
import { Bell, RefreshCw, CheckCircle2, Flame, Sparkles, Mail, Clock } from 'lucide-react';

export const SalesRepNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getNotifications();
      if (res && res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error(e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await salesRepApi.markNotificationRead(id);
      if (res && res.success) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type?: string, title?: string) => {
    const combined = `${type || ''} ${title || ''}`.toUpperCase();
    if (combined.includes('HOT') || combined.includes('PRIORITY')) {
      return <Flame className="w-4 h-4 text-amber-400" />;
    }
    if (combined.includes('EMAIL') || combined.includes('MESSAGE')) {
      return <Mail className="w-4 h-4 text-purple-400" />;
    }
    if (combined.includes('FOLLOW') || combined.includes('DUE') || combined.includes('SCHEDULE')) {
      return <Clock className="w-4 h-4 text-cyan-400" />;
    }
    return <Sparkles className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Standardized Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 font-heading">
              <Bell className="w-7 h-7 text-indigo-400" />
              <span>Personal Notifications</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Lead assignments, HOT lead alerts, follow-up reminders, and manager updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="border-indigo-800/80 text-indigo-300 hover:bg-indigo-950/40"
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Standardized Summary KPI Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Notifications</span>
            <p className="text-2xl font-black text-white">{notifications.length}</p>
          </Card>
          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Unread Notices</span>
            <p className="text-2xl font-black text-amber-400">{unreadCount}</p>
          </Card>
          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">System Status</span>
            <p className="text-2xl font-black text-emerald-400">Active</p>
          </Card>
        </div>

        {/* Main Notification Stream Card */}
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          {loading ? (
            <div className="py-14 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
              <p className="text-sm font-bold text-slate-300">All Caught Up!</p>
              <p className="text-xs text-slate-500">You have no pending unread notifications at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    n.read
                      ? 'bg-slate-950/60 border-slate-800/60 opacity-75'
                      : 'bg-slate-950 border-slate-800 shadow-md shadow-slate-950/40'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(n.type, n.title)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <Badge variant={n.type?.includes('HOT') ? 'warning' : 'primary'} size="sm">
                          {n.title || n.type || 'Notice'}
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-medium">{n.created_at}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{n.message}</p>
                    </div>
                  </div>

                  {!n.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs border-indigo-800 text-indigo-300 hover:bg-indigo-950/40 shrink-0 self-end sm:self-center"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesRepNotifications;
