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
  Mail,
  Clock,
  Trash2,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';

export const SalesRepNotifications: React.FC = () => {
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

  const getNotificationIcon = (type?: string, priority?: string) => {
    const combined = (type || '').toUpperCase();
    if (combined.includes('HOT') || priority === 'CRITICAL') {
      return <Flame className="w-5 h-5 text-amber-400" />;
    }
    if (combined.includes('EMAIL') || combined.includes('MESSAGE')) {
      return <Mail className="w-5 h-5 text-purple-400" />;
    }
    if (combined.includes('FOLLOW')) {
      return <Clock className="w-5 h-5 text-cyan-400" />;
    }
    if (combined.includes('DEAL') || combined.includes('WON')) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (combined.includes('ALERT') || combined.includes('FAIL')) {
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  };

  const tabs = [
    { id: 'all', label: 'All Notifications' },
    { id: 'unread', label: 'Unread' },
    { id: 'leads', label: 'My Lead Alerts' },
    { id: 'followups', label: 'Follow-ups' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'ai', label: 'AI Alerts' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 font-heading">
              <Bell className="w-7 h-7 text-[#FF7A00]" />
              <span>Personal Notifications</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center gap-2">
              <span>Lead assignments, HOT lead alerts, scheduled follow-up reminders, and pipeline updates.</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111113] border border-[#2A2A2E] text-[#FF7A00]">
                <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-[#FF7A00] animate-pulse' : 'bg-zinc-500'}`} />
                <span>{connectionStatus === 'connected' ? 'Live Socket' : 'Reconnecting'}</span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications({ type: activeTab })}
              className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C]"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="border-[#FF7A00]/40 text-[#FF7A00] hover:bg-[#FF7A00]/10"
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#2A2A2E]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#FF7A00] text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-[#29292C]'
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
          <Card className="p-12 text-center border-[#2A2A2E] bg-[#171718]">
            <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">No Notifications Available</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              You currently have no unread or persistent notifications matching this filter.
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
                      ? 'bg-[#171718] border-[#FF7A00]/40 shadow-lg shadow-orange-950/20 ring-1 ring-[#FF7A00]/20'
                      : 'bg-[#111113] border-[#2A2A2E] hover:bg-[#171718]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2 rounded-xl bg-[#111113] border border-[#2A2A2E] shrink-0 mt-0.5">
                        {getNotificationIcon(n.type, n.priority)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className={`text-sm font-bold ${isUnread ? 'text-white' : 'text-zinc-300'}`}>
                            {n.title}
                          </h3>

                          <Badge
                            variant={n.priority === 'CRITICAL' || n.type?.includes('HOT') ? 'danger' : 'primary'}
                            size="sm"
                          >
                            {n.type}
                          </Badge>

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {n.message}
                        </p>

                        <span className="text-[10px] text-zinc-500 inline-block font-mono">
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
                          className="text-xs font-bold text-[#FF7A00] hover:text-[#FF8C1A]"
                          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      )}

                      {isUnread && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-[#29292C] rounded-lg transition-colors"
                          title="Mark Read"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-[#29292C] rounded-lg transition-colors"
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

export default SalesRepNotifications;
