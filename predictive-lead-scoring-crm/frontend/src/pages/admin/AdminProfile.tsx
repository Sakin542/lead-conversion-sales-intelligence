import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import {
  User,
  Shield,
  Mail,
  LogOut,
  CheckCircle2,
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  Clock,
  Key,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [securityActivity, setSecurityActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const [adminName, setAdminName] = useState(() => {
    return user?.name || localStorage.getItem('admin_name') || 'System Administrator';
  });
  const adminEmail = user?.email || localStorage.getItem('admin_email') || 'admin@predictivecrm.com';

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await adminApi.getSecurityActivity();
      if (res.success && res.security_activity) {
        setSecurityActivity(res.security_activity);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim()) {
      setErrorMsg('Admin Name cannot be empty.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    if (!adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      setErrorMsg('Valid email address is required.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    updateUser({ name: adminName, email: adminEmail });
    localStorage.setItem('admin_name', adminName);
    localStorage.setItem('admin_email', adminEmail);

    setSuccessMsg('Admin profile updated and synchronized across system!');
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl mx-auto min-w-0">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <User className="w-6 h-6" />
              </div>
              <span>System Admin Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Highest-level system administrator profile details and security governance.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/settings')}
            leftIcon={<Settings className="w-4 h-4 text-indigo-400" />}
            className="border-slate-800 text-slate-300 font-bold text-xs"
          >
            Admin System Settings
          </Button>
        </div>

        {/* Identity & Edit Card */}
        <Card className="p-6 sm:p-8 bg-slate-900/80 border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
                {getInitials(user?.name || adminName)}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">{user?.name || adminName}</h2>
                  <Badge variant="danger" size="md">ADMIN</Badge>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user?.email || adminEmail}</span>
                </p>
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Full Root System Access Granted
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}
              className="border-rose-900/60 text-rose-400 hover:bg-rose-950/40 font-bold text-xs shrink-0"
            >
              Logout Admin Session
            </Button>
          </div>

          {/* Edit Admin Information Form */}
          <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Edit Administrative Details</span>
            </h3>

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Shield className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">Root System Admin email is permanent and cannot be modified.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs border-none px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Save Admin Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Activity Logs Card */}
        <Card className="p-6 sm:p-8 bg-slate-900/80 border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Recent System Security Activity Logs</span>
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchActivity}
              isLoading={loadingActivity}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-400" />}
              className="border-slate-800 text-slate-300 font-bold text-xs"
            >
              Refresh Logs
            </Button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">Security Event / Action</th>
                  <th className="px-3.5 py-2.5">IP Address</th>
                  <th className="px-3.5 py-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {securityActivity.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      No security audit events recorded.
                    </td>
                  </tr>
                ) : (
                  securityActivity.map((log, i) => (
                    <tr key={log.id || i} className="hover:bg-slate-800/40">
                      <td className="px-3.5 py-2.5 font-bold text-white flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{log.action}</span>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-indigo-300">{log.ip_address || '127.0.0.1'}</td>
                      <td className="px-3.5 py-2.5 text-right text-slate-400">{log.timestamp || 'Just now'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
