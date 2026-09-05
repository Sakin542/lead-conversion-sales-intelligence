import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { leadService } from '../../services/leadService';
import { User } from '../../types/auth';
import { Target, Plus, Search, UserCheck, Globe, Building, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

export const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [websiteMetrics, setWebsiteMetrics] = useState<any>(null);
  const [salesReps, setSalesReps] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Parameters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [tempFilter, setTempFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [repFilter, setRepFilter] = useState('');

  // Reassign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [targetRepId, setTargetRepId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Add Lead Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    status: 'new',
    source: 'Website',
    estimated_value: '',
    assigned_to: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (search) params.search = search;
      if (originFilter) params.origin = originFilter;
      if (tempFilter) params.temperature = tempFilter;
      if (statusFilter) params.status = statusFilter;
      if (repFilter) params.sales_rep_id = repFilter;

      const res = await adminApi.getLeads(params);
      if (res.success) {
        setLeads(res.data);
        setPagination(res.pagination);
        setWebsiteMetrics(res.website_metrics);
      }
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchReps = async () => {
    try {
      const res = await adminApi.getUsers();
      if (res.success) {
        setSalesReps(res.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReps();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [page, originFilter, tempFilter, statusFilter, repFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleOpenAssignModal = (lead: any) => {
    setSelectedLead(lead);
    setTargetRepId(lead.assigned_to ? String(lead.assigned_to) : '');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsAssigning(true);
    try {
      const repId = targetRepId ? Number(targetRepId) : null;
      const res = await adminApi.assignLead(selectedLead.id, repId);
      if (res.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, assigned_to: repId, assigned_to_user: res.data.assigned_to_user } : l))
        );
        setIsAssignModalOpen(false);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to assign lead');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!window.confirm('Delete this lead record permanently?')) return;
    try {
      const res = await adminApi.deleteLead(leadId);
      if (res.success) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to delete lead.');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.first_name || !newLead.last_name || !newLead.email) {
      setCreateError('First Name, Last Name, and Email are required.');
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const payload: any = {
        first_name: newLead.first_name.trim(),
        last_name: newLead.last_name.trim(),
        email: newLead.email.trim(),
        phone: newLead.phone.trim() || undefined,
        company: newLead.company.trim() || undefined,
        job_title: newLead.job_title.trim() || undefined,
        status: newLead.status || 'new',
        source: newLead.source || 'Website',
      };

      if (newLead.estimated_value) {
        payload.estimated_value = Number(newLead.estimated_value);
      }
      if (newLead.assigned_to) {
        payload.assigned_to = Number(newLead.assigned_to);
      }

      const res = await leadService.createLead(payload);
      if (res && (res.success || res.data)) {
        setIsCreateModalOpen(false);
        setNewLead({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          company: '',
          job_title: '',
          status: 'new',
          source: 'Website',
          estimated_value: '',
          assigned_to: '',
        });
        fetchLeads();
      }
    } catch (err: any) {
      setCreateError(err.data?.message || err.message || 'Failed to create lead.');
    } finally {
      setIsCreating(false);
    }
  };

  const getTemperatureBadge = (score: number) => {
    if (score >= 80) return <Badge variant="warning" size="sm">🔥 HOT ({score})</Badge>;
    if (score >= 50) return <Badge variant="primary" size="sm">WARM ({score})</Badge>;
    return <Badge variant="neutral" size="sm">COLD ({score})</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#222222] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-purple-400" />
              <span>Lead Intelligence & Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Global lead oversight, public website lead monitoring, AI scores, and team assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              className="border-[#222222] text-zinc-300 hover:bg-[#151515]"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="ai"
              size="sm"
              onClick={() => {
                setCreateError(null);
                setIsCreateModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Lead
            </Button>
          </div>
        </div>

        {/* Public Website Lead Capture Monitoring Banner */}
        {websiteMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex items-center space-x-4">
              <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-purple-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase">Website Capture Leads</p>
                <p className="text-xl font-bold text-white">{websiteMetrics.total_website_leads || 0}</p>
              </div>
            </div>

            <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase">Website Conversion Rate</p>
                <p className="text-xl font-bold text-emerald-400">{websiteMetrics.website_conversion_rate || 0}%</p>
              </div>
            </div>

            <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex items-center space-x-4">
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-blue-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase">Website Lead Revenue</p>
                <p className="text-xl font-bold text-white">${(websiteMetrics.website_revenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <Input
                placeholder="Search lead name, company, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-zinc-400" />}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                value={originFilter}
                onChange={(e) => { setOriginFilter(e.target.value); setPage(1); }}
                options={[
                  { value: '', label: 'All Sources' },
                  { value: 'website', label: '🌐 Website Only' },
                  { value: 'internal', label: 'CRM Internal' },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                value={tempFilter}
                onChange={(e) => { setTempFilter(e.target.value); setPage(1); }}
                options={[
                  { value: '', label: 'All Temperatures' },
                  { value: 'HOT', label: '🔥 HOT (&ge; 80)' },
                  { value: 'WARM', label: 'WARM (50-79)' },
                  { value: 'COLD', label: 'COLD (&lt; 50)' },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'proposal', label: 'Proposal' },
                  { value: 'won', label: 'Won / Converted' },
                  { value: 'lost', label: 'Lost' },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                value={repFilter}
                onChange={(e) => { setRepFilter(e.target.value); setPage(1); }}
                options={[
                  { value: '', label: 'All Sales Reps' },
                  { value: 'unassigned', label: 'Unassigned' },
                  ...salesReps.map((r) => ({ value: String(r.id), label: r.name })),
                ]}
              />
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Lead Table */}
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-hidden shadow-xl">
          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[750px] text-left text-xs text-zinc-300">
              <thead className="bg-[#111111] text-zinc-400 font-medium uppercase tracking-wider border-b border-[#222222]">
                <tr>
                  <th className="px-5 py-3.5">Lead Name</th>
                  <th className="px-5 py-3.5">Company & Source</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">AI Intent Score</th>
                  <th className="px-5 py-3.5">Assigned Rep</th>
                  <th className="px-5 py-3.5">Est. Value</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                      No leads match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} className="hover:bg-[#151515] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-white leading-snug">{l.first_name} {l.last_name}</p>
                        <p className="text-[11px] text-zinc-400 leading-snug">{l.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-zinc-200">{l.company || 'N/A'}</p>
                        <span className="inline-flex items-center text-[10px] text-purple-400">
                          {l.source === 'website' || l.source === '🌐 Website' ? '🌐 Public Website' : l.source}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 uppercase font-bold text-zinc-300">
                        {l.status}
                      </td>
                      <td className="px-5 py-3.5">
                        {getTemperatureBadge(l.score ?? 0)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-zinc-200">
                        {l.assigned_to_user ? (
                          <span className="text-purple-400 font-bold">{l.assigned_to_user.name}</span>
                        ) : (
                          <span className="text-amber-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-400">
                        ${(l.estimated_value || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenAssignModal(l)}
                          className="p-1.5 text-zinc-400 hover:text-purple-400 hover:bg-[#151515] rounded-lg"
                          title="Assign / Reassign Lead"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(l.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"
                          title="Delete Lead Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination && pagination.last_page > 1 && (
            <div className="p-4 border-t border-[#222222] flex items-center justify-between text-xs text-zinc-400">
              <span>Page {pagination.current_page} of {pagination.last_page} ({pagination.total} Total Leads)</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign / Reassign Lead">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-zinc-400">
            Select a sales representative to take ownership of <strong className="text-white">{selectedLead?.first_name} {selectedLead?.last_name}</strong>.
          </p>

          <Select
            label="Sales Representative"
            value={targetRepId}
            onChange={(e) => setTargetRepId(e.target.value)}
            options={[
              { value: '', label: '-- Unassigned --' },
              ...salesReps.map((r) => ({ value: String(r.id), label: `${r.name} (${r.role.replace('_', ' ')})` })),
            ]}
          />

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#222222]">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isAssigning}>
              Save Lead Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Lead Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Lead">
        <form onSubmit={handleCreateLead} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name *"
              placeholder="e.g. John"
              value={newLead.first_name}
              onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name *"
              placeholder="e.g. Doe"
              value={newLead.last_name}
              onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. john@company.com"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +1 555-0199"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company"
              placeholder="e.g. Acme Corp"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
            />
            <Input
              label="Job Title"
              placeholder="e.g. VP of Sales"
              value={newLead.job_title}
              onChange={(e) => setNewLead({ ...newLead, job_title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              value={newLead.status}
              onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
              options={[
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'proposal', label: 'Proposal' },
                { value: 'negotiation', label: 'Negotiation' },
                { value: 'won', label: 'Won' },
                { value: 'lost', label: 'Lost' },
              ]}
            />
            <Select
              label="Lead Source"
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              options={[
                { value: 'Website', label: 'Website' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Inbound Call', label: 'Inbound Call' },
                { value: 'Cold Outreach', label: 'Cold Outreach' },
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Event', label: 'Event' },
                { value: 'Partner', label: 'Partner' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Estimated Value ($)"
              type="number"
              placeholder="e.g. 25000"
              value={newLead.estimated_value}
              onChange={(e) => setNewLead({ ...newLead, estimated_value: e.target.value })}
            />
            <Select
              label="Assign to Sales Rep"
              value={newLead.assigned_to}
              onChange={(e) => setNewLead({ ...newLead, assigned_to: e.target.value })}
              options={[
                { value: '', label: '-- Unassigned --' },
                ...salesReps.map((r) => ({ value: String(r.id), label: `${r.name} (${r.role.replace('_', ' ')})` })),
              ]}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#222222]">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="ai" size="sm" isLoading={isCreating}>
              Create & Score Lead
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminLeads;

