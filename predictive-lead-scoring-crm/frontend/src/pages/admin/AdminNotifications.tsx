import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Bell,
  ShieldAlert,
  Cpu,
  CheckCheck,
  Trash2,
  RefreshCw,
  UserCheck,
  Database,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export interface AdminNotification {
  id: string;
  category: 'system' | 'ai' | 'operations' | 'security';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export const AdminNotifications: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: 'n1',
      category: 'system',
      severity: 'critical',
      title: 'Database Auto-Backup Sync Complete',
      description: 'Scheduled multi-region snapshot store updated successfully with 0 read replica latency.',
      timestamp: '5 minutes ago',
      read: false,
      actionUrl: '/admin/settings',
      actionLabel: 'View Health Logs',
    },
    {
      id: 'n2',
      category: 'ai',
      severity: 'success',
      title: 'ML Lead Scoring Engine Retrained',
      description: 'XGBoost v2.1 pipeline model retrained with 94.8% precision across 12,400 historical deal outcomes.',
      timestamp: '18 minutes ago',
      read: false,
      actionUrl: '/admin/ml',
      actionLabel: 'Inspect Model Metrics',
    },
    {
      id: 'n3',
      category: 'security',
      severity: 'warning',
      title: 'Privileged User Role Updated',
      description: 'User access role for "Senior Manager" updated to require MFA mandatory enforcement.',
      timestamp: '1 hour ago',
      read: false,
      actionUrl: '/admin/audit-logs',
      actionLabel: 'View Audit Log',
    },
    {
      id: 'n4',
      category: 'operations',
      severity: 'info',
      title: 'Automated AI Lead Distribution Executed',
      description: '28 incoming high-intent prospects dynamically assigned to top-performing sales representatives.',
      timestamp: '2 hours ago',
      read: true,
      actionUrl: '/admin/leads',
      actionLabel: 'View Leads Directory',
    },
    {
      id: 'n5',
      category: 'system',
      severity: 'info',
      title: 'API Rate Limit Telemetry Verified',
      description: 'All external webhook gateways operating cleanly at 14ms average response time.',
      timestamp: '4 hours ago',
      read: true,
    },
    {
      id: 'n6',
      category: 'ai',
      severity: 'success',
      title: 'High-Intent Hot Prospect Cluster Identified',
      description: 'ML model detected 14 leads jumping score tier from Warm to Hot (+35 point surge).',
      timestamp: '6 hours ago',
      read: true,
      actionUrl: '/admin/leads?temperature=HOT',
      actionLabel: 'View Hot Leads',
    },
  ]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter((n) => n.severity === 'critical').length;
  const aiCount = notifications.filter((n) => n.category === 'ai').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai':
        return <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'security':
        return <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'system':
        return <Database className="w-5 h-5 text-indigo-400 shrink-0" />;
      default:
        return <UserCheck className="w-5 h-5 text-purple-400 shrink-0" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger" size="sm">CRITICAL</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">WARNING</Badge>;
      case 'success':
        return <Badge variant="success" size="sm">SYSTEM OK</Badge>;
      default:
        return <Badge variant="primary" size="sm">INFO</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 font-heading">
              <Bell className="w-7 h-7 text-indigo-400" />
              <span>Admin Telemetry & Event Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enterprise system logs, ML model retraining triggers, security audit events, and operational alerts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-400" />}
            >
              Mark All Read
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-rose-400 hover:bg-rose-950/40"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Stats Highlight Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Unread Alerts</span>
            <p className="text-2xl font-black text-white">{unreadCount}</p>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Critical Signals</span>
            <p className="text-2xl font-black text-rose-400">{criticalCount}</p>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI Model Telemetry</span>
            <p className="text-2xl font-black text-emerald-400">{aiCount}</p>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stored Logs</span>
            <p className="text-2xl font-black text-white">{notifications.length}</p>
          </Card>
        </div>

        {/* Category Filters Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 px-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Category Filter:</span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Notifications' },
              { id: 'system', label: 'System & Infra' },
              { id: 'ai', label: 'AI & ML Telemetry' },
              { id: 'security', label: 'Security & Access' },
              { id: 'operations', label: 'Sales Operations' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Stream Card */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center bg-slate-900/80 border-slate-800 space-y-3">
            <CheckCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No System Notifications</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no active telemetry events or alerts in this selected category filter.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => (
              <Card
                key={item.id}
                className={`p-4 transition-all border ${
                  item.read
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-90'
                    : 'bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-800/70 shadow-lg shadow-indigo-950/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <h4 className={`text-sm font-bold ${item.read ? 'text-slate-300' : 'text-white'}`}>
                          {item.title}
                        </h4>
                        {getSeverityBadge(item.severity)}
                        {!item.read && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-indigo-950 text-indigo-400 border border-indigo-800 rounded uppercase">
                            UNREAD
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                      <span className="text-[10px] text-slate-500 font-medium block pt-0.5">{item.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {!item.read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="text-xs text-slate-400 hover:text-emerald-400 font-bold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    {item.actionLabel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = item.actionUrl || '#')}
                        className="text-xs border-slate-800 text-indigo-400 hover:bg-slate-800"
                        rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                      >
                        {item.actionLabel}
                      </Button>
                    )}
                    <button
                      onClick={() => dismissNotification(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                      title="Dismiss Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
