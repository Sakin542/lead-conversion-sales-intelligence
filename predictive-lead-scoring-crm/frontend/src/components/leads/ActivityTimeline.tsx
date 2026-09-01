import React, { useState } from 'react';
import {
  Mail,
  Globe,
  FileText,
  MousePointer,
  PlayCircle,
  PhoneCall,
  Calendar,
  Plus,
  Trash2,
  Activity,
  Clock,
} from 'lucide-react';
import { ActivityType, LeadActivity, ActivityFormData } from '../../types/lead';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface ActivityTimelineProps {
  activities: LeadActivity[];
  onAddActivity: (data: ActivityFormData) => Promise<void>;
  onDeleteActivity?: (activityId: number) => Promise<void>;
}

const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; icon: React.FC<{ className?: string }>; colorClass: string; bgClass: string }
> = {
  email_open: {
    label: 'Email Opened',
    icon: Mail,
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-500/10 border-sky-500/20',
  },
  page_visit: {
    label: 'Page Visit',
    icon: Globe,
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10 border-indigo-500/20',
  },
  form_submission: {
    label: 'Form Submitted',
    icon: FileText,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
  },
  email_click: {
    label: 'Email Link Clicked',
    icon: MousePointer,
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10 border-purple-500/20',
  },
  demo_request: {
    label: 'Demo Requested',
    icon: PlayCircle,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  call: {
    label: 'Phone Call',
    icon: PhoneCall,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
  },
  meeting: {
    label: 'Meeting',
    icon: Calendar,
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/20',
  },
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onAddActivity,
  onDeleteActivity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newType, setNewType] = useState<ActivityType>('call');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddActivity({
        type: newType,
        description: description.trim(),
      });
      setDescription('');
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to record activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Activity Timeline</h3>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </Button>
      </div>

      {/* Timeline List */}
      {activities.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No activity recorded yet</p>
          <p className="text-xs text-slate-500">
            Log sales calls, emails, or meetings to track lead engagement.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {activities.map((activity) => {
            const config = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.call;
            const IconComponent = config.icon;

            return (
              <div key={activity.id} className="relative group">
                {/* Icon Dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border ${config.bgClass} flex items-center justify-center bg-slate-950 z-10`}
                >
                  <IconComponent className={`w-3 h-3 ${config.colorClass}`} />
                </div>

                {/* Activity Card */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1 hover:border-slate-700/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${config.bgClass} ${config.colorClass}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatTimestamp(activity.occurred_at || activity.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed pt-1">{activity.description}</p>

                  {onDeleteActivity && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Lead Activity"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Activity Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ActivityType)}
              className="w-full px-3.5 py-2.5 min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {Object.entries(ACTIVITY_TYPE_CONFIG).map(([typeKey, cfg]) => (
                <option key={typeKey} value={typeKey}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Conducted 30-min discovery call. Interested in Enterprise pricing."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="min-w-[130px]"
            >
              Log Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ActivityTimeline;
