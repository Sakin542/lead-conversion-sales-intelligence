import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { User } from '../../types/auth';
import { Target, Download, Search, UserCheck, Globe, Building, RefreshCw, Trash2 } from 'lucide-react';
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

  const handleExportCsv = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.open(`${API_URL}/admin/leads/export`, '_blank');
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-purple-400" />
              <span>Lead Intelligence & Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Global lead oversight, public website lead monitoring, AI scores, and team assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCsv}
              className="bg-emerald-600 hover:bg-emerald-500 border-none font-bold"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Leads CSV
            </Button>
          </div>
        </div>

        {/* Public Website Lead Capture Monitoring Banner */}
        {websiteMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-xl text-indigo-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Website Capture Leads</p>
                <p className="text-xl font-black text-white">{websiteMetrics.total_website_leads || 0}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Website Conversion Rate</p>
                <p className="text-xl font-black text-emerald-400">{websiteMetrics.website_conversion_rate || 0}%</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-purple-950 border border-purple-800 rounded-xl text-purple-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Website Lead Revenue</p>
                <p className="text-xl font-black text-white">${(websiteMetrics.website_revenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <Input
                placeholder="Search lead name, company, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Lead Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      No leads match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-white leading-snug">{l.first_name} {l.last_name}</p>
                        <p className="text-[11px] text-slate-400 leading-snug">{l.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-200">{l.company || 'N/A'}</p>
                        <span className="inline-flex items-center text-[10px] text-indigo-400">
                          {l.source === 'website' || l.source === '🌐 Website' ? '🌐 Public Website' : l.source}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 uppercase font-bold text-slate-300">
                        {l.status}
                      </td>
                      <td className="px-5 py-3.5">
                        {getTemperatureBadge(l.score ?? 0)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-200">
                        {l.assigned_to_user ? (
                          <span className="text-indigo-400 font-bold">{l.assigned_to_user.name}</span>
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
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg"
                          title="Assign / Reassign Lead"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(l.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"
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
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
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
          <p className="text-xs text-slate-400">
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

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isAssigning} className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold">
              Save Lead Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminLeads;

