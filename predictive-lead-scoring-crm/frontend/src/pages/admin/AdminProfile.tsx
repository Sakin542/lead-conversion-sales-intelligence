import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { User, Shield, Mail, LogOut, CheckCircle2 } from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [securityActivity, setSecurityActivity] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getSecurityActivity().then((res) => {
      if (res.success) setSecurityActivity(res.security_activity);
    }).catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <User className="w-7 h-7 text-indigo-400" />
              <span>Admin Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Highest-level system administrator profile details.
            </p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name || 'System Admin'}</h2>
              <p className="text-xs text-slate-400 flex items-center mt-0.5">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>{user?.email || 'rashid.cse.20230104102@aust.edu'}</span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Assigned System Role:</span>
              <Badge variant="danger" size="md">ADMIN</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">System Access Level:</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Full Administrative Control
              </span>
            </div>
          </div>

          {/* Recent Security Activity */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Recent Security Activity</span>
            </h3>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">IP Address</th>
                    <th className="px-3 py-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {securityActivity.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-slate-500">No security events logged yet.</td>
                    </tr>
                  ) : (
                    securityActivity.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2 font-bold text-white">{log.action}</td>
                        <td className="px-3 py-2 font-mono text-indigo-400">{log.ip_address}</td>
                        <td className="px-3 py-2 text-right text-slate-400">{log.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-rose-900 text-rose-400 hover:bg-rose-950/40 font-bold"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Logout Admin Session
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;

