import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications, NotificationItem } from '../../context/NotificationProvider';
import { useAuth } from '../../context/AuthContext';
import { Flame, Clock, Mail, Sparkles, CheckCheck, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, connectionStatus } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getNotificationCenterPath = () => {
    if (user?.role === 'ADMIN') return '/admin/notifications';
    if (user?.role === 'SALES_MANAGER') return '/manager/notifications';
    return '/sales-rep/notifications';
  };

  const getNotificationIcon = (type?: string, priority?: string) => {
    const combined = (type || '').toUpperCase();
    if (combined.includes('HOT') || priority === 'CRITICAL') {
      return <Flame className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (combined.includes('FOLLOW')) {
      return <Clock className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
    if (combined.includes('DEAL') || combined.includes('WON')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (combined.includes('ALERT') || combined.includes('FAIL')) {
      return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (combined.includes('EMAIL') || combined.includes('MAIL')) {
      return <Mail className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    return <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />;
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read && !item.read) {
      markRead(item.id);
    }
    onClose();
    if (item.action_url) {
      navigate(item.action_url);
    } else {
      navigate(getNotificationCenterPath());
    }
  };

  const displayList = notifications.slice(0, 6);

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 z-50 space-y-3 ring-1 ring-slate-800 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Live Tag */}
          <span className="text-[10px] font-semibold flex items-center space-x-1 text-slate-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{connectionStatus === 'connected' ? 'Live' : 'Connecting'}</span>
          </span>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Items List */}
      <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {displayList.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No notifications available
          </div>
        ) : (
          displayList.map((item) => {
            const isUnread = !item.is_read && !item.read;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-start space-x-3 group relative ${
                  isUnread
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-l-2 border-indigo-500'
                    : 'hover:bg-slate-800/40 text-slate-400 opacity-90'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 shrink-0 mt-0.5">
                  {getNotificationIcon(item.type, item.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${isUnread ? 'font-bold text-white' : 'font-semibold text-slate-300'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {item.formatted_time || 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                    {item.message}
                  </p>
                </div>

                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5 ring-2 ring-slate-950" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link to Full Notification Center */}
      <div className="border-t border-slate-800/80 pt-2.5 text-center">
        <Link
          to={getNotificationCenterPath()}
          onClick={onClose}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1 transition-colors"
        >
          <span>View All Notifications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

