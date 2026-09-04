import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { salesRepApi, notificationApi } from '../../services/api';
import {
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';

export const SalesRepSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'security'>('preferences');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Workload & Daily Preferences State
  const [maxActiveLeads, setMaxActiveLeads] = useState(() => Number(localStorage.getItem('rep_max_leads')) || 20);
  const [reminderLeadTime, setReminderLeadTime] = useState(() => localStorage.getItem('rep_reminder_time') || '15');
  const [emailSignature, setEmailSignature] = useState(
    () => localStorage.getItem('rep_signature') || 'Best regards,\nSales Representative | Predictive CRM Team'
  );

  // Notifications State
  const [notifHotLead, setNotifHotLead] = useState(true);
  const [notifFollowUp, setNotifFollowUp] = useState(true);
  const [notifDealUpdate, setNotifDealUpdate] = useState(true);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg(null);
    setTimeout(() => setErrorMsg(null), 3500);
  };

  // Load Notification Preferences
  useEffect(() => {
    notificationApi
      .getPreferences()
      .then((res) => {
        if (res.success && res.preferences) {
          setNotifHotLead(res.preferences.hot_lead_enabled ?? true);
          setNotifFollowUp(res.preferences.follow_up_enabled ?? true);
          setNotifDealUpdate(res.preferences.lead_assignment_enabled ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('rep_max_leads', String(maxActiveLeads));
    localStorage.setItem('rep_reminder_time', reminderLeadTime);
    localStorage.setItem('rep_signature', emailSignature);
    showSuccess('Daily sales preferences & email signature saved.');
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await notificationApi.updatePreferences({
        hot_lead_enabled: notifHotLead,
        follow_up_enabled: notifFollowUp,
        lead_assignment_enabled: notifDealUpdate,
      });
      showSuccess('Notification alert preferences saved.');
    } catch {
      showSuccess('Notification preferences saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);
    try {
      await salesRepApi.updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Account password updated successfully.');
    } catch (err: any) {
      showError(err.data?.message || err.message || 'Failed to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'preferences', label: 'Workload & Signatures', icon: Sliders },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
    { id: 'security', label: 'Security & Password', icon: Lock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto min-w-0">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00]">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <span>Sales Rep Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Configure daily workload limits, email signature, lead reminders, and account security.
            </p>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-bold shadow-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-400 text-xs font-bold shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-[#2A2A2E] overflow-x-auto custom-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1C1C1E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FF7A00]' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Workload & Signatures */}
        {activeTab === 'preferences' && (
          <Card className="bg-[#171718] border-[#2A2A2E] p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-[#FF7A00] border-b border-[#2A2A2E] pb-4">
              <Sliders className="w-5 h-5 text-[#FF7A00]" />
              <div>
                <h3 className="text-base font-bold text-white">Daily Sales & Email Preferences</h3>
                <p className="text-xs text-zinc-400">Configure lead capacity limits and default message signatures</p>
              </div>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target Max Active Lead Workload"
                  type="number"
                  value={maxActiveLeads}
                  onChange={(e) => setMaxActiveLeads(Number(e.target.value))}
                />
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 block text-xs">Follow-Up Reminder Lead Time</label>
                  <select
                    value={reminderLeadTime}
                    onChange={(e) => setReminderLeadTime(e.target.value)}
                    className="w-full bg-[#111113] text-white rounded-xl p-2.5 border border-[#2A2A2E] focus:outline-none focus:border-[#FF7A00]"
                  >
                    <option value="15">15 Minutes Before Call</option>
                    <option value="30">30 Minutes Before Call</option>
                    <option value="60">1 Hour Before Call</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-300 block text-xs">Default Outbound Email Signature</label>
                <textarea
                  rows={4}
                  value={emailSignature}
                  onChange={(e) => setEmailSignature(e.target.value)}
                  className="w-full bg-[#111113] text-white text-xs font-mono p-3 rounded-xl border border-[#2A2A2E] focus:outline-none focus:border-[#FF7A00]"
                  placeholder="Enter email signature..."
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  variant="ai"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-5 py-2.5 rounded-xl"
                >
                  Save Daily Preferences
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <Card className="bg-[#171718] border-[#2A2A2E] p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-[#FF7A00] border-b border-[#2A2A2E] pb-4">
              <Bell className="w-5 h-5 text-[#FF7A00]" />
              <div>
                <h3 className="text-base font-bold text-white">Alert & Reminders Preferences</h3>
                <p className="text-xs text-zinc-400">Choose when to receive real-time notifications</p>
              </div>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-3 text-xs">
              {[
                {
                  id: 'hot',
                  title: 'Hot Lead Assignment Alert',
                  desc: 'Receive immediate alert when a high-intent lead (Score ≥ 80) is assigned to you.',
                  checked: notifHotLead,
                  setter: setNotifHotLead,
                },
                {
                  id: 'followup',
                  title: 'Follow-Up Deadline Reminders',
                  desc: 'Notify when scheduled customer calls or email follow-ups are due.',
                  checked: notifFollowUp,
                  setter: setNotifFollowUp,
                },
                {
                  id: 'deal',
                  title: 'Pipeline Stage Changes',
                  desc: 'Notify when deals move forward or win in your active pipeline.',
                  checked: notifDealUpdate,
                  setter: setNotifDealUpdate,
                },
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-[#111113] border border-[#2A2A2E] flex items-start justify-between">
                  <div>
                    <span className="font-bold text-white block">{item.title}</span>
                    <span className="text-zinc-400 text-[11px]">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="h-4 w-4 text-[#FF7A00] rounded border-[#2A2A2E] bg-[#111113] accent-[#FF7A00] cursor-pointer shrink-0 mt-1"
                  />
                </div>
              ))}

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  variant="ai"
                  size="md"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-5 py-2.5 rounded-xl"
                >
                  Save Notification Alerts
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'security' && (
          <Card className="bg-[#171718] border-[#2A2A2E] p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-[#FF7A00] border-b border-[#2A2A2E] pb-4">
              <Lock className="w-5 h-5 text-[#FF7A00]" />
              <div>
                <h3 className="text-base font-bold text-white">Account Password & Security</h3>
                <p className="text-xs text-zinc-400">Update your account login password</p>
              </div>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="pt-3 flex justify-start">
                <Button
                  type="submit"
                  variant="ai"
                  size="md"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-5 py-2.5 rounded-xl"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepSettings;
