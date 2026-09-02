import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, CheckCircle2, Clock, AlertTriangle, X, ArrowRight, Sparkles } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  action_url?: string;
  created_at?: string;
}

interface NotificationToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onNotificationClick?: (toast: ToastItem) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
  onNotificationClick,
}) => {
  const navigate = useNavigate();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type?: string, priority?: string) => {
    const isCritical = priority === 'CRITICAL' || priority === 'HIGH' || type?.includes('HOT') || type?.includes('OVERDUE');
    if (type?.includes('HOT') || type?.includes('LEAD')) {
      return <Flame className={`w-5 h-5 ${isCritical ? 'text-amber-400 animate-bounce' : 'text-amber-400'}`} />;
    }
    if (type?.includes('FOLLOW')) {
      return <Clock className="w-5 h-5 text-cyan-400" />;
    }
    if (type?.includes('DEAL') || type?.includes('WON')) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (type?.includes('ALERT') || type?.includes('FAILED')) {
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  };

  const handleToastClick = (toast: ToastItem) => {
    onDismiss(toast.id);
    if (onNotificationClick) {
      onNotificationClick(toast);
    } else if (toast.action_url) {
      navigate(toast.action_url);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isHigh = toast.priority === 'CRITICAL' || toast.priority === 'HIGH' || toast.type?.includes('HOT');

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 flex items-start space-x-3 group ${
              isHigh
                ? 'bg-slate-900/95 border-amber-500/50 shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-slate-900/90 border-slate-800 shadow-indigo-500/5 ring-1 ring-slate-800'
            }`}
          >
            {/* Type Icon */}
            <div className="p-2 rounded-xl bg-slate-800/80 shrink-0 mt-0.5">
              {getToastIcon(toast.type, toast.priority)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-white truncate tracking-wide">
                  {toast.title}
                </h4>
                {isHigh && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full shrink-0">
                    URGENT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {toast.message}
              </p>

              {/* Action Button */}
              {toast.action_url && (
                <button
                  onClick={() => handleToastClick(toast)}
                  className="mt-2.5 inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
