import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { salesRepApi } from '../../services/api';
import { User, LogOut, CheckCircle2, Lock } from 'lucide-react';

export const SalesRepProfile: React.FC = () => {
  const { logout } = useAuth();
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

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getProfile();
      if (res.success) {
        setProfileData(res.user);
        setName(res.user.name || '');
        setPhone(res.user.phone || '');
        setSecurityActivity(res.security_activity || []);
      }
    } catch (e) {
      console.error(e);
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
    try {
      const payload: any = { name, phone };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      const res = await salesRepApi.updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Profile updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        fetchProfile();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <User className="w-7 h-7 text-indigo-400" />
              <span>Personal Profile &amp; Security</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your personal credentials, contact info, and security session log.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-rose-900 text-rose-300 hover:bg-rose-950/60 font-bold"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
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
                Account Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Full Name</span>
                  <span className="text-white font-extrabold text-sm">{profileData?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Email Address</span>
                  <span className="text-indigo-400 font-semibold">{profileData?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Assigned Role</span>
                  <Badge variant="primary" size="sm" className="mt-1">{profileData?.role}</Badge>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Job Title</span>
                  <span className="text-slate-300">{profileData?.job_title}</span>
                </div>
              </div>
            </Card>

            {/* Profile Update Form & Security Logs */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                  Edit Personal Information &amp; Credentials
                </h3>

                {successMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

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
                    <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="bg-indigo-600 border-none font-bold">
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Recent Security Activity */}
              <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Recent Security &amp; Audit Log
                </h3>

                <div className="space-y-2">
                  {securityActivity.map((sa) => (
                    <div key={sa.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{sa.action}</span>
                        <p className="text-[10px] text-slate-500">{sa.timestamp}</p>
                      </div>
                      <Badge variant="neutral" size="sm">{sa.ip_address}</Badge>
                    </div>
                  ))}
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
