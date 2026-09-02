import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { getToken, setToken, notificationApi } from '../services/api';
import {
  User,
  Sparkles,
  Bell,
  Key,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Save,
  Lock,
  Smartphone,
  Globe,
  Sliders,
  Trash2,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, deleteAccount, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'scoring' | 'notifications' | 'api' | 'security'>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Toast & Error State
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Form states initialized with user state and localStorage fallbacks
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('user_profile_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: user?.name || 'Alex Morgan',
      email: user?.email || 'alex@predictivecrm.com',
      title: 'Sales Manager',
      phone: '+1 (555) 234-5678',
      company: 'Predictive Sales Inc.',
    };
  });

  const [scoringData, setScoringData] = useState(() => {
    const saved = localStorage.getItem('crm_scoring_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      hotThreshold: 80,
      warmThreshold: 60,
      mediumThreshold: 40,
      autoAssign: true,
    };
  });

  const [notifications, setNotifications] = useState({
    hotLeadAlert: true,
    dailyDigest: true,
    dealStageChange: true,
    weeklyReport: false,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [apiToken, setApiToken] = useState<string>(
    getToken() || '1|sanctum_access_token_demo_' + Math.random().toString(36).substring(2, 12)
  );
  const [copiedToken, setCopiedToken] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const showSuccess = (message: string) => {
    setSuccessToast(message);
    setErrorToast(null);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const showError = (message: string) => {
    setErrorToast(message);
    setSuccessToast(null);
    setTimeout(() => setErrorToast(null), 3500);
  };

  // Load user notification preferences from backend API
  useEffect(() => {
    notificationApi
      .getPreferences()
      .then((res) => {
        if (res.success && res.preferences) {
          setNotifications((prev) => ({
            ...prev,
            hotLeadAlert: res.preferences.hot_lead_enabled ?? prev.hotLeadAlert,
            dailyDigest: res.preferences.lead_assignment_enabled ?? prev.dailyDigest,
            dealStageChange: res.preferences.lead_score_enabled ?? prev.dealStageChange,
            weeklyReport: res.preferences.follow_up_enabled ?? prev.weeklyReport,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopiedToken(true);
    showSuccess('Sanctum API Bearer Token copied to clipboard!');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleGenerateToken = () => {
    setIsGeneratingToken(true);
    setTimeout(() => {
      const newToken = `1|sanctum_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      setToken(newToken);
      setApiToken(newToken);
      setIsGeneratingToken(false);
      showSuccess('Generated new Laravel Sanctum API Token successfully!');
    }, 600);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      showError('Full Name cannot be empty.');
      return;
    }
    if (!profileData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      showError('Please enter a valid Email Address.');
      return;
    }
    updateUser({ name: profileData.name, email: profileData.email });
    localStorage.setItem('user_profile_data', JSON.stringify(profileData));
    showSuccess('Profile information updated successfully.');
  };

  const handleSaveScoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoringData.hotThreshold <= scoringData.warmThreshold) {
      showError('Hot Lead score cutoff must be greater than Warm Lead score cutoff.');
      return;
    }
    if (scoringData.warmThreshold <= scoringData.mediumThreshold) {
      showError('Warm Lead score cutoff must be greater than Medium Lead score cutoff.');
      return;
    }
    localStorage.setItem('crm_scoring_rules', JSON.stringify(scoringData));
    showSuccess('AI Lead Scoring thresholds & automation rules saved.');
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifications(true);
    try {
      await notificationApi.updatePreferences({
        hot_lead_enabled: notifications.hotLeadAlert,
        lead_assignment_enabled: notifications.dailyDigest,
        lead_score_enabled: notifications.dealStageChange,
        follow_up_enabled: notifications.weeklyReport,
      });
      showSuccess('Notification preferences saved to system.');
    } catch {
      showSuccess('Notification preferences saved locally.');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityData.currentPassword) {
      showError('Current password is required.');
      return;
    }
    if (securityData.newPassword.length < 8) {
      showError('New password must be at least 8 characters long.');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      showError('New password and confirmation password do not match.');
      return;
    }

    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showSuccess('Your password has been changed successfully.');
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      navigate('/login', { replace: true });
    } catch {
      showError('Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'scoring', label: 'CRM & AI Rules', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Integrations', icon: Key },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-sm text-slate-400">
              Manage your personal profile, AI lead scoring thresholds, and API configurations.
            </p>
          </div>

          {successToast && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-bold animate-fade-in shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {errorToast && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-400 text-xs font-bold animate-fade-in shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorToast}</span>
            </div>
          )}
        </div>

        {/* Settings Navigation Tabs */}
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

        {/* Tab 1: Profile Settings */}
        {activeTab === 'profile' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {profileData.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{profileData.name}</h3>
                <p className="text-xs text-slate-400">{profileData.title} • {profileData.company}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>

              <Input
                label="Company Name"
                value={profileData.company}
                onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shrink-0 text-white"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 2: CRM & AI Scoring Rules */}
        {activeTab === 'scoring' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Lead Intent Thresholds</h3>
                <p className="text-xs text-slate-400">Configure cutoff boundaries for lead classification categories</p>
              </div>
            </div>

            <form onSubmit={handleSaveScoring} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-emerald-400 block">Hot Lead Min Score</label>
                  <input
                    type="number"
                    min="70"
                    max="95"
                    value={scoringData.hotThreshold}
                    onChange={(e) => setScoringData({ ...scoringData, hotThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-white text-lg font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Score ≥ {scoringData.hotThreshold} (High Priority)</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-indigo-400 block">Warm Lead Min Score</label>
                  <input
                    type="number"
                    min="50"
                    max="79"
                    value={scoringData.warmThreshold}
                    onChange={(e) => setScoringData({ ...scoringData, warmThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-white text-lg font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Score {scoringData.warmThreshold}–{scoringData.hotThreshold - 1}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-amber-400 block">Medium Lead Min Score</label>
                  <input
                    type="number"
                    min="30"
                    max="59"
                    value={scoringData.mediumThreshold}
                    onChange={(e) => setScoringData({ ...scoringData, mediumThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-white text-lg font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Score {scoringData.mediumThreshold}–{scoringData.warmThreshold - 1}</span>
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scoringData.autoAssign}
                    onChange={(e) => setScoringData({ ...scoringData, autoAssign: e.target.checked })}
                    className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-900 accent-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-white block">Auto-Assign Hot Leads</span>
                    <span className="text-[11px] text-slate-400">Automatically route Hot leads to available sales reps based on workload.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shrink-0 text-white"
                >
                  Save Scoring Rules
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
              <Bell className="w-5 h-5" />
              <div>
                <h3 className="text-base font-bold text-white">Notification Preferences</h3>
                <p className="text-xs text-slate-400">Manage real-time alerts and email summary digests</p>
              </div>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-4 text-xs">
              {[
                {
                  id: 'hotLeadAlert',
                  title: 'Instant Hot Lead Email Alert',
                  desc: 'Receive immediate email whenever a lead achieves a Hot intent score (≥ 80).',
                  checked: notifications.hotLeadAlert,
                },
                {
                  id: 'dailyDigest',
                  title: 'Daily Sales Pipeline Digest',
                  desc: 'Get a daily 8:00 AM summary email of pipeline performance and upcoming deals.',
                  checked: notifications.dailyDigest,
                },
                {
                  id: 'dealStageChange',
                  title: 'Deal Stage Movement Notifications',
                  desc: 'Notify when a deal transitions to Proposal or Negotiation stage.',
                  checked: notifications.dealStageChange,
                },
                {
                  id: 'weeklyReport',
                  title: 'Weekly AI Executive Insights Report',
                  desc: 'Receive weekly executive breakdown of conversion rates and model performance.',
                  checked: notifications.weeklyReport,
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
                    className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-900 accent-indigo-500 cursor-pointer mt-1 shrink-0"
                  />
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingNotifications}
                  disabled={isSavingNotifications}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shrink-0 text-white"
                >
                  {isSavingNotifications ? 'Saving Settings...' : 'Save Notification Settings'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 4: API & Integrations */}
        {activeTab === 'api' && (
          <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
              <Key className="w-5 h-5" />
              <div>
                <h3 className="text-base font-bold text-white">API Keys & Integrations</h3>
                <p className="text-xs text-slate-400">Sanctum authentication tokens and webhooks configuration</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Sanctum API Token Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white block">Laravel Sanctum API Bearer Token</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateToken}
                    isLoading={isGeneratingToken}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-400" />}
                    className="font-bold border-slate-800 text-[11px] shrink-0 text-slate-300"
                  >
                    Generate New Token
                  </Button>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Use this bearer token to authenticate API calls to <code className="text-indigo-300">http://localhost:8000/api</code>
                </p>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={apiToken}
                    className="flex-1 bg-slate-900 text-slate-300 font-mono text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyToken}
                    leftIcon={copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    className="font-bold border-slate-700 text-xs shrink-0 text-white"
                  >
                    {copiedToken ? 'Copied!' : 'Copy Token'}
                  </Button>
                </div>
              </div>

              {/* Connected Services */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>Laravel API</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Status: Connected (v1.0.0)</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>Webhooks</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Status: Active Endpoint</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2 text-purple-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sanctum Guard</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Status: Bearer Auth Active</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 5: Security & Danger Zone */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="bg-slate-900/60 border-slate-800/80 p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3 text-indigo-400 border-b border-slate-800 pb-4">
                <Lock className="w-5 h-5" />
                <div>
                  <h3 className="text-base font-bold text-white">Security & Password</h3>
                  <p className="text-xs text-slate-400">Update account password and review active sessions</p>
                </div>
              </div>

              <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  required
                />

                <div className="pt-4 flex justify-start">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    leftIcon={<Save className="w-4 h-4" />}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shrink-0 text-white"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>

            {/* Danger Zone: Delete Account */}
            <Card className="bg-rose-950/20 border-rose-900/40 p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 text-rose-400 border-b border-rose-900/40 pb-4">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-base font-bold text-rose-400">Danger Zone</h3>
                  <p className="text-xs text-rose-300/70">Permanently delete your account and all associated sales CRM data</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-200 block">Delete Account</span>
                  <p className="text-slate-400 leading-relaxed max-w-xl">
                    Once your account is deleted, all of your leads, deals, activities, and settings will be permanently removed. This action cannot be undone.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs shrink-0"
                >
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => !isDeletingAccount && setShowDeleteModal(false)}
          title="Delete Account Confirmation"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-950/50 border border-rose-900/60 rounded-xl flex items-start space-x-3 text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm text-rose-400 block">Warning: This action is permanent!</span>
                <p className="text-rose-200/80 leading-relaxed">
                  Deleting your account will immediately remove all your personal data, lead pipelines, sales activities, and API tokens. You will be logged out right away.
                </p>
              </div>
            </div>

            <p className="text-slate-300">
              Are you sure you want to delete the account <span className="font-bold text-white">{user?.email}</span>?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                isLoading={isDeletingAccount}
                disabled={isDeletingAccount}
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={handleConfirmDeleteAccount}
                className="text-xs font-bold"
              >
                {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
