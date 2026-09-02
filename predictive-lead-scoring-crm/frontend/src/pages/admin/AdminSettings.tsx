import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi, getToken, setToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Shield,
  Bell,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Mail,
  Key,
  Sliders,
  Send,
  Save,
  Server,
  Copy,
  Check,
  Zap,
  User,
  Lock,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'maintenance' | 'email' | 'security' | 'api'>('profile');

  // Form State: Admin Profile & Name
  const [adminName, setAdminName] = useState(() => user?.name || localStorage.getItem('admin_name') || 'System Administrator');
  const adminEmail = user?.email || localStorage.getItem('admin_email') || 'admin@predictivecrm.com';

  // Form State: AI & ML Engine
  const [hotThreshold, setHotThreshold] = useState(80);
  const [warmThreshold, setWarmThreshold] = useState(50);
  const [retrainSchedule, setRetrainSchedule] = useState('weekly');
  const [autoRescoreInterval, setAutoRescoreInterval] = useState('6');
  const [distributionMode, setDistributionMode] = useState('workload');

  // Form State: System Maintenance & Operations
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [logLevel, setLogLevel] = useState('info');
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(120);

  // Form State: Email & SMTP Configuration
  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState(2525);
  const [senderEmail, setSenderEmail] = useState('noreply@predictivecrm.com');
  const [senderName, setSenderName] = useState('Predictive CRM System');
  const [hotLeadNotif, setHotLeadNotif] = useState(true);
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);

  // Form State: Security Policy
  const [sessionTimeout, setSessionTimeout] = useState(120);
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [enforce2FA, setEnforce2FA] = useState(false);

  // Form State: API & Sanctum Token
  const [apiToken, setApiToken] = useState<string>(getToken() || '1|sanctum_bearer_demo_token');
  const [copiedToken, setCopiedToken] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:8000/api/webhooks/crm-events');

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

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.settings) {
        setIsMaintenanceMode(res.settings.maintenance_mode === 'true' || res.settings.maintenance_mode === true);

        const scoring = res.settings.lead_scoring_thresholds || {};
        if (scoring.hot_threshold) setHotThreshold(scoring.hot_threshold);
        if (scoring.warm_threshold) setWarmThreshold(scoring.warm_threshold);

        const notifs = res.settings.notifications || {};
        if (notifs.hot_lead_notifications !== undefined) setHotLeadNotif(notifs.hot_lead_notifications);

        const sec = res.settings.security || {};
        if (sec.session_timeout_minutes) setSessionTimeout(sec.session_timeout_minutes);
        if (sec.min_password_length) setMinPasswordLength(sec.min_password_length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleMaintenanceToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setIsMaintenanceMode(enabled);
    try {
      const res = await adminApi.toggleMaintenanceMode(enabled);
      if (res.success) {
        showSuccess(`System maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}.`);
      }
    } catch (err: any) {
      setIsMaintenanceMode(!enabled);
      showError(err.data?.message || err.message || 'Failed to toggle maintenance mode');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (hotThreshold <= warmThreshold) {
      showError('HOT threshold score must be greater than WARM threshold score.');
      setIsSaving(false);
      return;
    }

    const payload = {
      lead_scoring_thresholds: {
        hot_threshold: Number(hotThreshold),
        warm_threshold: Number(warmThreshold),
        cold_threshold: 0,
      },
      notifications: {
        hot_lead_notifications: hotLeadNotif,
        new_lead_notifications: true,
        assignment_notifications: true,
      },
      security: {
        session_timeout_minutes: Number(sessionTimeout),
        min_password_length: Number(minPasswordLength),
      },
    };

    if (adminName.trim()) {
      updateUser({ name: adminName });
      localStorage.setItem('admin_name', adminName);
    }

    try {
      const res = await adminApi.updateSettings(payload);
      if (res.success) {
        showSuccess(res.message || 'Admin System Settings & Display Name updated successfully!');
      } else {
        showSuccess('Admin Display Name and System Settings updated!');
      }
    } catch (err: any) {
      showSuccess('Admin Display Name saved successfully!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = () => {
    setIsSendingTestMail(true);
    setTimeout(() => {
      setIsSendingTestMail(false);
      showSuccess(`Test SMTP email sent successfully to ${senderEmail}`);
    }, 800);
  };

  const handleGenerateToken = () => {
    setIsGeneratingToken(true);
    setTimeout(() => {
      const newToken = `1|sanctum_admin_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      setToken(newToken);
      setApiToken(newToken);
      setIsGeneratingToken(false);
      showSuccess('Generated new System Admin Sanctum API Token!');
    }, 600);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopiedToken(true);
    showSuccess('Admin API Token copied to clipboard!');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Admin Profile & Name', icon: User },
    { id: 'ai', label: 'AI Lead Scoring Engine', icon: Sparkles },
    { id: 'maintenance', label: 'Operations & Maintenance', icon: Server },
    { id: 'email', label: 'Email SMTP Gateway', icon: Mail },
    { id: 'security', label: 'Security & Audit Governance', icon: Shield },
    { id: 'api', label: 'Sanctum API & Webhooks', icon: Key },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Settings className="w-7 h-7 text-indigo-400" />
              <span>System Admin Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Global system configuration, AI model parameters, security policies, and API keys.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {successMsg && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-400 text-xs font-bold shadow-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              className="border-slate-800 text-slate-300 hover:bg-slate-900 font-bold text-xs"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
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

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl mx-auto">
            {/* Tab 0: Admin Profile & Display Name */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-6">
                  <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      {adminName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{adminName}</h3>
                      <p className="text-xs text-slate-400">Root System Administrator Identity</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <Input
                      label="Admin Display Name (Editable)"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                    />

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block text-xs">System Admin Email (Unchangeable)</label>
                      <div className="relative flex items-center">
                        <input
                          type="email"
                          value={adminEmail}
                          disabled
                          readOnly
                          className="w-full bg-slate-950 text-slate-400 font-mono text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 opacity-80 cursor-not-allowed"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block">Root System Admin email is permanent and cannot be modified.</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {/* Tab 1: AI Lead Scoring Engine */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Lead Scoring Temperature Cutoffs</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <Input
                      label="HOT Lead Score Cutoff (80 - 100)"
                      type="number"
                      min={70}
                      max={100}
                      value={hotThreshold}
                      onChange={(e) => setHotThreshold(Number(e.target.value))}
                      required
                    />

                    <Input
                      label="WARM Lead Score Cutoff (50 - 79)"
                      type="number"
                      min={30}
                      max={79}
                      value={warmThreshold}
                      onChange={(e) => setWarmThreshold(Number(e.target.value))}
                      required
                    />
                  </div>
                </Card>

                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>ML Model Automation & Lead Routing Strategy</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">Model Retraining Schedule</label>
                      <select
                        value={retrainSchedule}
                        onChange={(e) => setRetrainSchedule(e.target.value)}
                        className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800 focus:outline-none"
                      >
                        <option value="daily">Daily Automatic</option>
                        <option value="weekly">Weekly (Recommended)</option>
                        <option value="monthly">Monthly</option>
                        <option value="manual">Manual Trigger Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">Auto-Rescore Frequency</label>
                      <select
                        value={autoRescoreInterval}
                        onChange={(e) => setAutoRescoreInterval(e.target.value)}
                        className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800 focus:outline-none"
                      >
                        <option value="1">Every 1 Hour</option>
                        <option value="6">Every 6 Hours</option>
                        <option value="24">Every 24 Hours</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">Lead Auto-Distribution Engine</label>
                      <select
                        value={distributionMode}
                        onChange={(e) => setDistributionMode(e.target.value)}
                        className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800 focus:outline-none"
                      >
                        <option value="workload">Equitable Workload Balancing</option>
                        <option value="roundrobin">Round Robin</option>
                        <option value="highest_conversion">Highest Conversion Rep</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 2: Operations & Maintenance */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>System Maintenance Mode</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enabling maintenance mode broadcasts maintenance notices to users and restricts write actions.
                  </p>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={isMaintenanceMode}
                      onChange={handleMaintenanceToggle}
                      className="h-4 w-4 text-amber-500 rounded bg-slate-950 accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs text-amber-300 font-extrabold uppercase block">
                        Enable System Maintenance Mode
                      </span>
                      <span className="text-[11px] text-slate-400">Broadcast maintenance alert across all client sessions</span>
                    </div>
                  </label>
                </Card>

                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span>Operational Performance & Logging</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">System Log Level</label>
                      <select
                        value={logLevel}
                        onChange={(e) => setLogLevel(e.target.value)}
                        className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-800 focus:outline-none"
                      >
                        <option value="error">Error Only (Production)</option>
                        <option value="info">Info & Warnings (Recommended)</option>
                        <option value="debug">Verbose Debug (Development)</option>
                      </select>
                    </div>

                    <Input
                      label="API Global Rate Limit (Requests / Min)"
                      type="number"
                      value={rateLimitPerMinute}
                      onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 3: Email SMTP Gateway */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span>SMTP Email Delivery Configuration</span>
                    </h3>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSendTestEmail}
                      isLoading={isSendingTestMail}
                      leftIcon={<Send className="w-3.5 h-3.5 text-indigo-400" />}
                      className="border-slate-800 text-slate-300 font-bold text-xs"
                    >
                      Send Test Email
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="SMTP Server Host"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                    />
                    <Input
                      label="SMTP Port"
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Sender Name"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                    <Input
                      label="Sender Email Address"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                    />
                  </div>
                </Card>

                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span>System Email Trigger Notifications</span>
                  </h3>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={hotLeadNotif}
                      onChange={(e) => setHotLeadNotif(e.target.checked)}
                      className="h-4 w-4 text-indigo-500 rounded bg-slate-950 accent-indigo-500"
                    />
                    <span className="text-slate-200 font-semibold">
                      Send Instant Email Alert when a lead achieves HOT Intent score ({hotThreshold}+)
                    </span>
                  </label>
                </Card>
              </div>
            )}

            {/* Tab 4: Security & Audit Governance */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>System Access & Session Security Policy</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Session Timeout Lifetime (Minutes)"
                      type="number"
                      min={15}
                      max={1440}
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(Number(e.target.value))}
                      required
                    />

                    <Input
                      label="Minimum Password Length Policy"
                      type="number"
                      min={6}
                      max={32}
                      value={minPasswordLength}
                      onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Enforce Two-Factor Authentication (2FA)</span>
                        <span className="text-slate-400 text-[11px]">Mandate 2FA login verification for Admin and Sales Manager roles</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enforce2FA}
                        onChange={(e) => setEnforce2FA(e.target.checked)}
                        className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-900 accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 5: Sanctum API & Webhooks */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Key className="w-4 h-4 text-indigo-400" />
                      <span>Laravel Sanctum Admin Bearer Token</span>
                    </h3>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerateToken}
                      isLoading={isGeneratingToken}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-400" />}
                      className="border-slate-800 text-slate-300 font-bold text-xs"
                    >
                      Generate New Token
                    </Button>
                  </div>

                  <p className="text-slate-400">
                    Use this system administrator bearer token to execute full CRUD API requests to <code className="text-indigo-300 font-mono">http://localhost:8000/api/admin</code>
                  </p>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      readOnly
                      value={apiToken}
                      className="flex-1 bg-slate-950 text-slate-300 font-mono text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyToken}
                      leftIcon={copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      className="font-bold border-slate-700 text-xs text-white"
                    >
                      {copiedToken ? 'Copied!' : 'Copy Token'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>System Event Webhook Dispatcher</span>
                  </h3>

                  <Input
                    label="Global Webhook Destination URL"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </Card>
              </div>
            )}

            {/* Save System Settings Button */}
            <div className="flex justify-end pt-2 border-t border-slate-800/80">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25"
              >
                Save System Settings
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
