import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, UserRole } from '../../types/auth';
import { adminApi, userManagementApi } from '../../services/api';
import { Users, UserPlus, Mail, Trash2, Key, CheckCircle2, AlertCircle, RefreshCw, Power } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('SALES_MANAGER');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getUsers(params);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(null);
    setInviteError(null);

    if (!name.trim() || !email.trim()) {
      setInviteError('Name and Email are required.');
      return;
    }

    setIsInviting(true);
    try {
      const res = await userManagementApi.inviteUser({ name, email, role });
      if (res.success) {
        setInviteSuccess(`Invitation sent successfully to ${email}.`);
        fetchUsers();
        setTimeout(() => {
          setIsInviteOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      setInviteError(err.data?.message || err.message || 'Failed to send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await adminApi.toggleUserStatus(userId);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: res.user.is_active } : u))
        );
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to update user status.');
    }
  };

  const handleResetPassword = async (userId: number, userEmail: string) => {
    if (!window.confirm(`Trigger password reset email for ${userEmail}?`)) return;

    try {
      const res = await adminApi.triggerPasswordReset(userId);
      if (res.success) {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to trigger password reset.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;

    try {
      const res = await adminApi.deleteUser(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to delete user.');
    }
  };

  const getRoleBadgeVariant = (r: UserRole) => {
    switch (r) {
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 text-[#FF7A00]" />
              <span>User & Account Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Create, invite, audit roles, and control access permissions across all CRM accounts.
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
              onClick={() => {
                setName('');
                setEmail('');
                setRole('SALES_MANAGER');
                setInviteSuccess(null);
                setInviteError(null);
                setIsInviteOpen(true);
              }}
              className="font-bold"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Create / Invite User
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <Input
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'SALES_MANAGER', label: 'Sales Manager' },
                  { value: 'SALES_REP', label: 'Sales Representative' },
                ]}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active Account' },
                  { value: 'pending', label: 'Pending Invitation' },
                ]}
              />
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[#171718] border border-[#2A2A2E] rounded-2xl overflow-hidden shadow-xl">
          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-zinc-300">
              <thead className="bg-[#111113] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#2A2A2E]">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1C1C1E] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#29292C] border border-[#2A2A2E] text-[#FF7A00] font-bold text-xs flex items-center justify-center">
                            {u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-snug">{u.name}</p>
                            <p className="text-[11px] text-zinc-400 leading-snug">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                          {u.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-semibold text-[#FF7A00] bg-[#FF7A00]/10 border border-[#FF7A00]/40 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] mr-1.5 animate-pulse"></span>
                            Pending Invite
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className="p-1.5 text-zinc-400 hover:text-[#FF7A00] hover:bg-[#29292C] rounded-lg transition-colors"
                          title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.id, u.email)}
                          className="p-1.5 text-zinc-400 hover:text-[#FF7A00] hover:bg-[#29292C] rounded-lg transition-colors"
                          title="Trigger Reset Password Email"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Invite User Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Create / Invite CRM User">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            The user will receive an email invitation containing a secure single-use link to activate their account and set their password.
          </p>

          {inviteSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{inviteSuccess}</span>
            </div>
          )}

          {inviteError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{inviteError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Marcus Vance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="marcus@crm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
            required
          />

          <Select
            label="CRM Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'SALES_MANAGER', label: 'Sales Manager' },
              { value: 'SALES_REP', label: 'Sales Representative' },
            ]}
          />

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#2A2A2E]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="ai" size="sm" isLoading={isInviting} className="font-bold">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;

