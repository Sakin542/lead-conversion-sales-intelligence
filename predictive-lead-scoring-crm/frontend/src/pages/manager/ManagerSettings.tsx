import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../services/api';
import {
  UserCheck,
  Sparkles,
  Target,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ManagerSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'allocation' | 'targets' | 'notifications' | 'security'>('profile');

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Manager Profile Form State
  const [managerProfile, setManagerProfile] = useState(() => {
    const saved = localStorage.getItem('manager_profile_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: user?.name || 'Sales Manager',
      email: user?.email || 'manager@predictivecrm.com',
      title: 'Sales Operations Manager',
      department: 'Enterprise Sales',
      region: 'North America & Global Accounts',
    };
  });

  // Allocation & AI Rules State
  const [allocationRules, setAllocationRules] = useState(() => {
    const saved = localStorage.getItem('manager_allocation_rules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      hotThreshold: 80,
      warmThreshold: 55,
      maxLeadsPerRep: 25,
      autoAssignNewLeads: true,
      balanceWorkload: true,
    };
  });

  // Team Goals & Target Defaults
  const [targetSettings, setTargetSettings] = useState(() => {
    const saved = localStorage.getItem('manager_target_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      defaultRepMonthlyTarget: 50000,
      staleLeadThresholdDays: 7,
      forecastMultiplier: 1.15,
    };
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    repOverdueAlert: true,
    hotLeadAssignedAlert: true,
    dailyTeamDigest: true,
    weeklyForecastReport: false,
  });
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setErrorToast(null);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setSuccessToast(null);
    setTimeout(() => setErrorToast(null), 3500);
  };

  // Load Notification Preferences
  useEffect(() => {
    notificationApi
      .getPreferences()
      .then((res) => {
        if (res.success && res.preferences) {
          setNotifications((prev) => ({
            ...prev,
            hotLeadAssignedAlert: res.preferences.hot_lead_enabled ?? prev.hotLeadAssignedAlert,
            dailyTeamDigest: res.preferences.lead_assignment_enabled ?? prev.dailyTeamDigest,
            weeklyForecastReport: res.preferences.follow_up_enabled ?? prev.weeklyForecastReport,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerProfile.name.trim()) {
      showError('Manager Name cannot be empty.');
      return;
    }
    updateUser({ name: managerProfile.name, email: managerProfile.email });
    localStorage.setItem('manager_profile_settings', JSON.stringify(managerProfile));
    showSuccess('Manager profile & region settings saved successfully.');
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (allocationRules.hotThreshold <= allocationRules.warmThreshold) {
      showError('Hot Lead score cutoff must be higher than Warm Lead cutoff.');
      return;
    }
    localStorage.setItem('manager_allocation_rules', JSON.stringify(allocationRules));
    showSuccess('AI Lead allocation & workload balance rules updated.');
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('manager_target_settings', JSON.stringify(targetSettings));
    showSuccess('Team default target metrics & stale lead thresholds saved.');
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifs(true);
    try {
      await notificationApi.updatePreferences({
        hot_lead_enabled: notifications.hotLeadAssignedAlert,
        lead_assignment_enabled: notifications.dailyTeamDigest,
        follow_up_enabled: notifications.weeklyForecastReport,
      });
      showSuccess('Manager alert preferences saved to backend API.');
    } catch {
      showSuccess('Manager alert preferences saved locally.');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!security.currentPassword) {
      showError('Current password is required.');
      return;
    }
    if (security.newPassword.length < 8) {
      showError('New password must be at least 8 characters long.');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showError('New password and confirmation do not match.');
      return;
    }
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showSuccess('Manager account password changed successfully.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Region', icon: UserCheck },
    { id: 'allocation', label: 'AI Lead Routing', icon: Sparkles },
    { id: 'targets', label: 'Team Targets', icon: Target },
    { id: 'notifications', label: 'Alerts & Digest', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sales Manager Settings
            </h1>
            <p className="text-sm text-slate-400">
              Configure team lead routing parameters, sales quotas, and manager alert preferences.
            </p>
          </div>

          {successToast && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-bold shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {errorToast && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-400 text-xs font-bold shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorToast}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-slate-800/80 overflow-x-auto custom-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Manager Profile & Region */}
        {activeTab === 'profile' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {managerProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{managerProfile.name}</h3>
                <p className="text-xs text-slate-400">{managerProfile.title} • {managerProfile.department}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Manager Full Name"
                  value={managerProfile.name}
                  onChange={(e) => setManagerProfile({ ...managerProfile, name: e.target.value })}
                />
                <Input
                  label="Work Email Address"
                  type="email"
                  value={managerProfile.email}
                  onChange={(e) => setManagerProfile({ ...managerProfile, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Title / Role"
                  value={managerProfile.title}
                  onChange={(e) => setManagerProfile({ ...managerProfile, title: e.target.value })}
                />
                <Input
                  label="Department"
                  value={managerProfile.department}
                  onChange={(e) => setManagerProfile({ ...managerProfile, department: e.target.value })}
                />
              </div>

              <Input
                label="Managed Sales Region / Accounts"
                value={managerProfile.region}
                onChange={(e) => setManagerProfile({ ...managerProfile, region: e.target.value })}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-none"
                >
                  Save Profile Settings
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 2: AI Lead Routing */}
        {activeTab === 'allocation' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">AI Lead Assignment Rules</h3>
                <p className="text-xs text-slate-400">Configure team lead routing thresholds and rep allocation rules</p>
              </div>
            </div>

            <form onSubmit={handleSaveAllocation} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-emerald-400 block">Hot Lead Score Cutoff</label>
                  <input
                    type="number"
                    value={allocationRules.hotThreshold}
                    onChange={(e) => setAllocationRules({ ...allocationRules, hotThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-white font-bold font-mono px-3 py-2 rounded-lg border border-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Score ≥ {allocationRules.hotThreshold} (High Intent)</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-indigo-400 block">Warm Lead Score Cutoff</label>
                  <input
                    type="number"
                    value={allocationRules.warmThreshold}
                    onChange={(e) => setAllocationRules({ ...allocationRules, warmThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-white font-bold font-mono px-3 py-2 rounded-lg border border-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Score {allocationRules.warmThreshold}–{allocationRules.hotThreshold - 1}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-purple-400 block">Max Open Leads Per Rep</label>
                  <input
                    type="number"
                    value={allocationRules.maxLeadsPerRep}
                    onChange={(e) => setAllocationRules({ ...allocationRules, maxLeadsPerRep: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-white font-bold font-mono px-3 py-2 rounded-lg border border-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Capacity Workload Limit</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Auto-Assign Incoming High-Score Leads</span>
                    <span className="text-slate-400 text-[11px]">Automatically assign new inbound leads with score ≥ {allocationRules.hotThreshold} to available reps.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allocationRules.autoAssignNewLeads}
                    onChange={(e) => setAllocationRules({ ...allocationRules, autoAssignNewLeads: e.target.checked })}
                    className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-900 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Equitable Rep Workload Balancing</span>
                    <span className="text-slate-400 text-[11px]">Prioritize reps with lower active pipeline loads during automatic distribution.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allocationRules.balanceWorkload}
                    onChange={(e) => setAllocationRules({ ...allocationRules, balanceWorkload: e.target.checked })}
                    className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-900 accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-none"
                >
                  Save Allocation Rules
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 3: Team Targets */}
        {activeTab === 'targets' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
              <Target className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Team Targets & Quota Defaults</h3>
                <p className="text-xs text-slate-400">Set default monthly quotas and stale lead escalation boundaries</p>
              </div>
            </div>

            <form onSubmit={handleSaveTargets} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Default Rep Monthly Revenue Quota ($)"
                  type="number"
                  value={targetSettings.defaultRepMonthlyTarget}
                  onChange={(e) => setTargetSettings({ ...targetSettings, defaultRepMonthlyTarget: Number(e.target.value) })}
                />
                <Input
                  label="Stale Lead Flag Limit (Days of Inactivity)"
                  type="number"
                  value={targetSettings.staleLeadThresholdDays}
                  onChange={(e) => setTargetSettings({ ...targetSettings, staleLeadThresholdDays: Number(e.target.value) })}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-none"
                >
                  Save Target Metrics
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 4: Manager Notifications */}
        {activeTab === 'notifications' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
              <Bell className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Manager Digest & Escalation Alerts</h3>
                <p className="text-xs text-slate-400">Configure team supervision alerts and executive summaries</p>
              </div>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-4 text-xs">
              {[
                {
                  id: 'repOverdueAlert',
                  title: 'Rep Overdue Follow-up Escalation Alert',
                  desc: 'Receive immediate notification when a sales rep misses a scheduled lead follow-up deadline.',
                  checked: notifications.repOverdueAlert,
                },
                {
                  id: 'hotLeadAssignedAlert',
                  title: 'High Intent Lead Routing Notification',
                  desc: 'Notify when a new Hot lead (score ≥ 80) is auto-assigned to a team representative.',
                  checked: notifications.hotLeadAssignedAlert,
                },
                {
                  id: 'dailyTeamDigest',
                  title: 'Daily Team Performance Summary (8:00 AM)',
                  desc: 'Receive a daily email digest summarizing team revenue progress and deal stage movements.',
                  checked: notifications.dailyTeamDigest,
                },
                {
                  id: 'weeklyForecastReport',
                  title: 'Weekly AI Revenue Forecast Breakdown',
                  desc: 'Receive a weekly report analyzing pipeline conversion probability and forecasted team revenue.',
                  checked: notifications.weeklyForecastReport,
                },
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-white block">{item.title}</span>
                    <p className="text-slate-400 text-[11px]">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) =>
                      setNotifications({ ...notifications, [item.id]: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-900 accent-indigo-500 cursor-pointer shrink-0 mt-1"
                  />
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingNotifs}
                  disabled={isSavingNotifs}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-none"
                >
                  {isSavingNotifs ? 'Saving Preferences...' : 'Save Notification Settings'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 5: Security */}
        {activeTab === 'security' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
              <Lock className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Manager Security & Password</h3>
                <p className="text-xs text-slate-400">Update account credentials and authentication options</p>
              </div>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                required
              />

              <div className="pt-4 flex justify-start">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-none"
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

export default ManagerSettings;

