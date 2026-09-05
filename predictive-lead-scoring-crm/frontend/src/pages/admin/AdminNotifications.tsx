import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  ArrowUpRight,
  ShieldAlert,
  Cpu,
} from 'lucide-react';

export const AdminNotifications: React.FC = () => {
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

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const highlightedId = (location.state as any)?.highlightId || (location.state as any)?.selectedNotificationId;

  useEffect(() => {
    fetchNotifications({ type: activeCategory, search: searchTerm });
  }, [activeCategory, fetchNotifications]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotifications({ type: activeCategory, search: searchTerm });
  };

  const getIcon = (type?: string, priority?: string) => {
    const combined = (type || '').toUpperCase();
    if (combined.includes('HOT') || priority === 'CRITICAL') {
      return <Flame className="w-5 h-5 text-amber-400" />;
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
    if (combined.includes('ML') || combined.includes('AI')) {
      return <Cpu className="w-5 h-5 text-purple-400" />;
    }
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  };

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'unread', label: 'Unread' },
    { id: 'leads', label: 'Lead Alerts' },
    { id: 'followups', label: 'Follow-ups' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'ai', label: 'AI / ML' },
    { id: 'system', label: 'System' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 font-heading">
              <ShieldAlert className="w-7 h-7 text-[#FF7A00]" />
              <span>Admin Notification Control Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center gap-2">
              <span>System-wide security, ML engine, user events, and high-value prospect alerts.</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111113] border border-[#2A2A2E] text-[#FF7A00]">
                <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-[#FF7A00] animate-pulse' : 'bg-zinc-500'}`} />
                <span>{connectionStatus === 'connected' ? 'Socket Live' : 'Offline Sync'}</span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications({ type: activeCategory, search: searchTerm })}
              className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C]"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="border-[#FF7A00]/40 text-[#FF7A00] hover:bg-[#FF7A00]/10"
                leftIcon={<CheckCheck className="w-4 h-4 text-emerald-400" />}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#171718] p-3.5 rounded-2xl border border-[#2A2A2E]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#FF7A00] text-white shadow-md shadow-orange-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-[#29292C]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111113] text-xs text-white placeholder-zinc-500 rounded-xl pl-9 pr-3 py-1.5 border border-[#2A2A2E] focus:outline-none focus:border-[#FF7A00]"
            />
          </form>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="py-16 text-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center border-[#2A2A2E] bg-[#171718]">
            <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">No System Notifications Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              There are currently no persistent system events matching your active filter.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isUnread = !n.is_read && !n.read;
              const isHighlighted = highlightedId && String(n.id) === String(highlightedId);

              return (
                <Card
                  key={n.id}
                  id={`notif-${n.id}`}
                  className={`p-4 transition-all duration-300 border ${
                    isHighlighted
                      ? 'bg-[#1D1815] border-[#FF7A00] ring-2 ring-[#FF7A00] shadow-xl shadow-orange-950/40'
                      : isUnread
                      ? 'bg-[#171718] border-[#FF7A00]/40 shadow-lg shadow-orange-950/20 ring-1 ring-[#FF7A00]/20'
                      : 'bg-[#111113] border-[#2A2A2E] hover:bg-[#171718]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2 rounded-xl bg-[#111113] border border-[#2A2A2E] shrink-0 mt-0.5">
                        {getIcon(n.type, n.priority)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className={`text-sm font-bold ${isUnread ? 'text-white' : 'text-zinc-300'}`}>
                            {n.title}
                          </h3>

                          <Badge variant={n.priority === 'CRITICAL' || n.priority === 'HIGH' ? 'danger' : 'neutral'} size="sm">
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
                          Inspect
                        </Button>
                      )}

                      {isUnread && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-[#29292C] rounded-lg transition-colors"
                          title="Mark as Read"
                        >
                          <CheckCheck className="w-4 h-4" />
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
    </AdminLayout>
  );
};

export default AdminNotifications;
