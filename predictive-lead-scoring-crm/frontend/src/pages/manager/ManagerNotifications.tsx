import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationProvider';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  RefreshCw,
  CheckCircle2,
  Flame,
  Sparkles,
  Users,
  Clock,
  Trash2,
  ArrowUpRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export const ManagerNotifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    connectionStatus,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications({ type: activeTab });
  }, [activeTab, fetchNotifications]);

  const getIcon = (type?: string, priority?: string) => {
    const combined = (type || '').toUpperCase();
    if (combined.includes('HOT') || priority === 'CRITICAL') {
      return <Flame className="w-5 h-5 text-amber-400" />;
    }
    if (combined.includes('ASSIGN') || combined.includes('TEAM')) {
      return <Users className="w-5 h-5 text-indigo-400" />;
    }
    if (combined.includes('FOLLOW')) {
      return <Clock className="w-5 h-5 text-cyan-400" />;
    }
    if (combined.includes('DEAL') || combined.includes('WON')) {
      return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    }
    if (combined.includes('ALERT') || combined.includes('FAIL')) {
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  };

  const tabs = [
    { id: 'all', label: 'Team Notifications' },
    { id: 'unread', label: 'Unread' },
    { id: 'leads', label: 'Lead Inquiries' },
    { id: 'followups', label: 'Follow-ups' },
    { id: 'pipeline', label: 'Pipeline Deals' },
    { id: 'ai', label: 'AI Score Alerts' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 font-heading">
              <Users className="w-7 h-7 text-indigo-400" />
              <span>Sales Manager Notification Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>Team performance, incoming lead inquiries, assignment alerts, and deal milestones.</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-800 text-emerald-400">
                <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{connectionStatus === 'connected' ? 'Socket Active' : 'Connecting'}</span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications({ type: activeTab })}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="border-indigo-800/80 text-indigo-300 hover:bg-indigo-950/40"
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="py-16 text-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center border-slate-800/80 bg-slate-900/30">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">No Team Notifications</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no notifications matching your active manager filter.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isUnread = !n.is_read && !n.read;

              return (
                <Card
                  key={n.id}
                  className={`p-4 transition-all duration-200 border ${
                    isUnread
                      ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/20 ring-1 ring-indigo-500/20'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {getIcon(n.type, n.priority)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className={`text-sm font-bold ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                            {n.title}
                          </h3>

                          <Badge
                            variant={n.priority === 'CRITICAL' || n.type?.includes('HOT') ? 'danger' : 'primary'}
                            size="sm"
                          >
                            {n.type}
                          </Badge>

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {n.message}
                        </p>

                        <span className="text-[10px] text-slate-500 inline-block font-mono">
                          {n.formatted_time || n.created_at}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {n.action_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isUnread) markRead(n.id);
                            navigate(n.action_url!);
                          }}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      )}

                      {isUnread && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Mark Read"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerNotifications;
