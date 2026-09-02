import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { Settings, Shield, Bell, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [hotThreshold, setHotThreshold] = useState(80);
  const [warmThreshold, setWarmThreshold] = useState(50);
  const [hotLeadNotif, setHotLeadNotif] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(120);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.settings) {
        if (res.settings.maintenance_mode === 'true' || res.settings.maintenance_mode === true) {
          setIsMaintenanceMode(true);
        } else {
          setIsMaintenanceMode(false);
        }
        const scoring = res.settings.lead_scoring_thresholds || {};
        if (scoring.hot_threshold) setHotThreshold(scoring.hot_threshold);
        if (scoring.warm_threshold) setWarmThreshold(scoring.warm_threshold);

        const notifs = res.settings.notifications || {};
        if (notifs.hot_lead_notifications !== undefined) setHotLeadNotif(notifs.hot_lead_notifications);

        const sec = res.settings.security || {};
        if (sec.session_timeout_minutes) setSessionTimeout(sec.session_timeout_minutes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setIsMaintenanceMode(enabled);
    try {
      const res = await adminApi.toggleMaintenanceMode(enabled);
      if (res.success) {
        setSuccessMsg(`Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}.`);
      }
    } catch (err: any) {
      setIsMaintenanceMode(!enabled);
      alert(err.data?.message || err.message || 'Failed to toggle maintenance mode');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

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
        min_password_length: 6,
      },
    };

    try {
      const res = await adminApi.updateSettings(payload);
      if (res.success) {
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Settings className="w-7 h-7 text-indigo-400" />
              <span>System Settings & Configuration</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure AI lead scoring thresholds, system notifications, and security policies.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            className="border-slate-800 text-slate-300 hover:bg-slate-900"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl mx-auto">
            {successMsg && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2.5 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Lead Scoring Threshold Settings */}
            <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>AI Lead Scoring Temperature Thresholds</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="HOT Lead Score Threshold (80 - 100)"
                  type="number"
                  min={60}
                  max={100}
                  value={hotThreshold}
                  onChange={(e) => setHotThreshold(Number(e.target.value))}
                  required
                />

                <Input
                  label="WARM Lead Score Threshold (50 - 79)"
                  type="number"
                  min={30}
                  max={79}
                  value={warmThreshold}
                  onChange={(e) => setWarmThreshold(Number(e.target.value))}
                  required
                />
              </div>
            </Card>

            {/* Notification Rules */}
            <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span>System Notification Rules</span>
              </h3>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hotLeadNotif}
                  onChange={(e) => setHotLeadNotif(e.target.checked)}
                  className="h-4 w-4 text-indigo-500 rounded bg-slate-950 accent-indigo-500"
                />
                <span className="text-xs text-slate-200 font-semibold">
                  Trigger Instant Email & Alert when a lead crosses the HOT threshold ({hotThreshold}+)
                </span>
              </label>
            </Card>

            {/* Security Policy */}
            <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security & Session Policy</span>
              </h3>

              <Input
                label="Session Lifetime (Minutes)"
                type="number"
                min={15}
                max={1440}
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                required
              />
            </Card>

            {/* Maintenance Mode Card */}
            <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>System Maintenance Mode</span>
              </h3>
              <p className="text-xs text-slate-400">
                Enabling maintenance mode notifies system users that maintenance operations are in progress.
              </p>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={isMaintenanceMode}
                  onChange={handleMaintenanceToggle}
                  className="h-4 w-4 text-amber-500 rounded bg-slate-950 accent-amber-500"
                />
                <span className="text-xs text-amber-300 font-extrabold uppercase">
                  Enable System Maintenance Mode
                </span>
              </label>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold"
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

