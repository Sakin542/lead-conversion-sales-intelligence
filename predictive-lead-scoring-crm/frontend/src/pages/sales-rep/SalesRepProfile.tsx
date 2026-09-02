import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { salesRepApi } from '../../services/api';
import { User, LogOut, CheckCircle2, Lock, Settings, Shield, Save, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SalesRepProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [securityActivity, setSecurityActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getProfile();
      if (res.success) {
        setProfileData(res.user);
        setName(res.user.name || user?.name || '');
        setPhone(res.user.phone || '');
        setSecurityActivity(res.security_activity || []);
      }
    } catch (e) {
      console.error(e);
      setName(user?.name || 'Sales Representative');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload: any = { name, phone };
      if (newPassword) {
        if (!currentPassword) {
          setErrorMsg('Current password is required to change password.');
          setIsSaving(false);
          return;
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await salesRepApi.updateProfile(payload);
      if (res.success) {
        updateUser({ name });
        setSuccessMsg(res.message || 'Profile and password updated successfully.');
        setErrorMsg(null);
        setCurrentPassword('');
        setNewPassword('');
        fetchProfile();
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Failed to update profile details.';
      setErrorMsg(msg);
      setSuccessMsg(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <User className="w-6 h-6" />
              </div>
              <span>Sales Representative Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Personal credentials, sales performance details, and security session logs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/sales-rep/settings')}
              leftIcon={<Settings className="w-4 h-4 text-indigo-400" />}
              className="border-slate-800 text-slate-300 font-bold text-xs"
            >
              Sales Rep Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-rose-900 text-rose-300 hover:bg-rose-950/60 font-bold text-xs"
              leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Information Card */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Account Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Display Name</span>
                  <span className="text-white font-extrabold text-sm">{user?.name || name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Email Address (Unchangeable)</span>
                  <span className="text-indigo-400 font-semibold">{user?.email || profileData?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Assigned System Role</span>
                  <Badge variant="primary" size="sm" className="mt-1">SALES REP</Badge>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Title</span>
                  <span className="text-slate-300">{profileData?.job_title || 'Account Executive'}</span>
                </div>
              </div>
            </Card>

            {/* Profile Update Form & Security Logs */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                  Edit Personal Information & Credentials
                </h3>

                {successMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Display Name (Editable)" value={name} onChange={(e) => setName(e.target.value)} required />
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block text-xs">Account Email (Unchangeable)</label>
                      <div className="relative flex items-center">
                        <input
                          type="email"
                          value={user?.email || profileData?.email || 'rep@predictivecrm.com'}
                          disabled
                          readOnly
                          className="w-full bg-slate-950 text-slate-400 font-mono text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 opacity-80 cursor-not-allowed"
                        />
                        <Shield className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />

                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" /> Change Password (Optional)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSaving}
                      leftIcon={<Save className="w-4 h-4" />}
                      className="bg-indigo-600 border-none font-bold text-xs px-4 py-2"
                    >
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Recent Security Activity */}
              <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Recent Security & Audit Log
                </h3>

                <div className="space-y-2 text-xs">
                  {securityActivity.length === 0 ? (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-center">
                      No security audit events recorded.
                    </div>
                  ) : (
                    securityActivity.map((sa) => (
                      <div key={sa.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{sa.action}</span>
                            <p className="text-[10px] text-slate-500">{sa.timestamp}</p>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm">{sa.ip_address || '127.0.0.1'}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepProfile;
