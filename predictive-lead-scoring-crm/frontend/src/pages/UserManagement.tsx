import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { User, UserRole } from '../types/auth';
import { userManagementApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Shield, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Invite Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('SALES_REP');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userManagementApi.getUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenInviteModal = () => {
    setInviteName('');
    setInviteEmail('');
    // Default role based on who is logged in
    if (currentUser?.role === 'ADMIN') {
      setInviteRole('SALES_MANAGER');
    } else {
      setInviteRole('SALES_REP');
    }
    setInviteSuccessMsg(null);
    setInviteErrorMsg(null);
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccessMsg(null);
    setInviteErrorMsg(null);

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteErrorMsg('Name and Email are required.');
      return;
    }

    setIsSubmittingInvite(true);

    try {
      const res = await userManagementApi.inviteUser({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });

      if (res.success) {
        setInviteSuccessMsg(`Invitation sent successfully to ${inviteEmail}.`);
        fetchUsers();
        setTimeout(() => {
          setIsInviteModalOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      setInviteErrorMsg(err.data?.message || err.message || 'Failed to send invitation.');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await userManagementApi.deleteUser(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SALES_MANAGER':
        return 'warning';
      case 'SALES_REP':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Shield className="w-7 h-7 text-[#FF7A00]" />
              <span>CRM User Management</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage accounts, assign roles, and issue invitation links for CRM team members.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C] hover:text-white"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="ai"
              size="sm"
              onClick={handleOpenInviteModal}
              className="font-bold"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Invite CRM User
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* User Table */}
        <div className="bg-[#171718] border border-[#2A2A2E] rounded-2xl overflow-hidden shadow-xl">
          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[650px] text-left text-sm text-zinc-300">
              <thead className="bg-[#111113] text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-[#2A2A2E]">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined / Invited</th>
                  {currentUser?.role === 'ADMIN' && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Loading team members...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      No CRM users found. Click "Invite CRM User" to get started.
                    </td>
                  </tr>
                ) : (
                  users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-[#1C1C1E] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#29292C] text-[#FF7A00] border border-[#2A2A2E] font-bold text-xs flex items-center justify-center">
                            {usr.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{usr.name}</p>
                            <p className="text-xs text-zinc-400 leading-tight mt-0.5">{usr.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getRoleBadgeVariant(usr.role)} size="sm">
                          {usr.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {usr.is_active ? (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                            Active Account
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-[#FF7A00] bg-[#FF7A00]/10 border border-[#FF7A00]/40 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] mr-1.5 animate-pulse"></span>
                            Pending Invitation
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {usr.created_at ? new Date(usr.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      {currentUser?.role === 'ADMIN' && (
                        <td className="px-6 py-4 text-right">
                          {usr.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              disabled={deletingId === usr.id}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite CRM User"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Send an email invitation containing a secure link to set up their password and activate their CRM account.
          </p>

          {inviteSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg flex items-center space-x-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{inviteSuccessMsg}</span>
            </div>
          )}

          {inviteErrorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{inviteErrorMsg}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Sarah Jenkins"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="sarah@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
            required
          />

          <Select
            label="CRM Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            options={
              currentUser?.role === 'ADMIN'
                ? [
                    { value: 'SALES_MANAGER', label: 'Sales Manager' },
                    { value: 'SALES_REP', label: 'Sales Representative' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]
                : [{ value: 'SALES_REP', label: 'Sales Representative' }]
            }
          />

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#2A2A2E]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="ai"
              size="sm"
              isLoading={isSubmittingInvite}
              className="font-bold"
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default UserManagement;
