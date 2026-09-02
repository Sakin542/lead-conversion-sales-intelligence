import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadTable from '../../components/leads/LeadTable';
import LeadFilters from '../../components/leads/LeadFilters';
import { Lead, LeadFormData } from '../../types/lead';
import leadService from '../../services/leadService';
import { managerApi, adminApi } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import LeadForm from '../../components/leads/LeadForm';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/auth';
import { Plus, AlertCircle, Users, ChevronLeft, ChevronRight, UserCheck, Tag, Calendar, Download, Trash2 } from 'lucide-react';

export const Leads: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesReps, setSalesReps] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'assign' | 'status' | 'followup' | 'delete' | null>(null);
  const [bulkAssignedTo, setBulkAssignedTo] = useState<string>('');
  const [bulkStatusValue, setBulkStatusValue] = useState<string>('contacted');
  const [bulkFollowupTitle, setBulkFollowupTitle] = useState<string>('Quarterly Check-in');
  const [bulkFollowupDate, setBulkFollowupDate] = useState<string>(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState<boolean>(false);

  // Pagination & Filters State
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads({
        page,
        per_page: 15,
        search,
        status: statusFilter,
        source: sourceFilter,
        sort: 'created_at',
        direction: 'desc',
      });

      setLeads(response.data || []);
      setTotalPages(response.pagination?.last_page || 1);
      setTotalLeads(response.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Unable to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    if (isManagerOrAdmin) {
      adminApi.getUsers().then((res) => {
        if (res.success) setSalesReps(res.users);
      }).catch(() => {});
    }
  }, [page, statusFilter, sourceFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchLeads();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleSelect = (id: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const handleExecuteBulkAction = async () => {
    if (selectedLeadIds.length === 0 || !bulkActionType) return;
    setIsBulkSubmitting(true);
    try {
      if (bulkActionType === 'assign') {
        await managerApi.bulkAssignLeads(selectedLeadIds, bulkAssignedTo ? Number(bulkAssignedTo) : null);
      } else if (bulkActionType === 'status') {
        await managerApi.bulkStatusLeads(selectedLeadIds, bulkStatusValue);
      } else if (bulkActionType === 'followup') {
        await managerApi.bulkFollowupLeads(selectedLeadIds, bulkFollowupTitle, bulkFollowupDate);
      } else if (bulkActionType === 'delete') {
        await managerApi.bulkDeleteLeads(selectedLeadIds);
      }
      setBulkActionType(null);
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Bulk operation failed.');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleBulkExportCsv = () => {
    const selectedLeads = leads.filter((l) => selectedLeadIds.includes(l.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,First Name,Last Name,Email,Company,Source,Status,Estimated Value']
        .concat(
          selectedLeads.map(
            (l) => `${l.id},"${l.first_name}","${l.last_name}","${l.email}","${l.company}","${l.source}","${l.status}",${l.estimated_value}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setPage(1);
  };

  const handleCreateLead = async (formData: LeadFormData) => {
    setIsSubmitting(true);
    try {
      await leadService.createLead(formData);
      setIsCreateModalOpen(false);
      fetchLeads();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await leadService.deleteLead(leadToDelete.id);
      setLeadToDelete(null);
      fetchLeads();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 text-indigo-400" />
              <span>Lead Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage and track potential sales leads and customer conversion opportunities.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-none shadow-lg shadow-indigo-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Lead
          </Button>
        </div>

        {/* Filter Toolbar */}
        <LeadFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={(val: string) => {
            setStatusFilter(val);
            setPage(1);
          }}
          sourceFilter={sourceFilter}
          onSourceChange={(val: string) => {
            setSourceFilter(val);
            setPage(1);
          }}
          onReset={handleResetFilters}
        />

        {/* Bulk Action Bar (When 1+ leads selected) */}
        {isManagerOrAdmin && selectedLeadIds.length > 0 && (
          <div className="bg-indigo-950/80 border border-indigo-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xl">
            <span className="text-xs font-bold text-indigo-200">
              {selectedLeadIds.length} leads selected
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkActionType('assign')}
                className="text-xs border-indigo-800 text-indigo-200 hover:bg-indigo-900/60"
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
              >
                Assign
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkActionType('status')}
                className="text-xs border-indigo-800 text-indigo-200 hover:bg-indigo-900/60"
                leftIcon={<Tag className="w-3.5 h-3.5" />}
              >
                Change Status
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkActionType('followup')}
                className="text-xs border-indigo-800 text-indigo-200 hover:bg-indigo-900/60"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Add Follow-up
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExportCsv}
                className="text-xs border-indigo-800 text-emerald-300 hover:bg-indigo-900/60"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export Selected
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkActionType('delete')}
                className="text-xs border-rose-900 text-rose-300 hover:bg-rose-950/60"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/50 flex items-center space-x-3 text-rose-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Lead Table / Empty / Loading */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description={
              search || statusFilter || sourceFilter
                ? 'No leads match your active filters. Try adjusting your criteria.'
                : 'Get started by creating your first lead prospect in the system.'
            }
            action={{
              label: search || statusFilter || sourceFilter ? 'Clear Filters' : 'Add First Lead',
              onClick: search || statusFilter || sourceFilter ? handleResetFilters : () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <>
            <LeadTable
              leads={leads}
              selectedLeadIds={selectedLeadIds}
              onToggleSelect={isManagerOrAdmin ? handleToggleSelect : undefined}
              onSelectAll={isManagerOrAdmin ? handleSelectAll : undefined}
              onView={(lead) => navigate(`/leads/${lead.id}`)}
              onEdit={(lead) => navigate(`/leads/${lead.id}?edit=true`)}
              onDelete={(lead) => setLeadToDelete(lead)}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
                <span>
                  Showing page <strong className="text-white">{page}</strong> of{' '}
                  <strong className="text-white">{totalPages}</strong> ({totalLeads} total leads)
                </span>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Action Modal */}
      {bulkActionType && (
        <Modal
          isOpen={!!bulkActionType}
          onClose={() => setBulkActionType(null)}
          title={`Bulk Action: ${bulkActionType.toUpperCase()}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Apply bulk update to {selectedLeadIds.length} selected leads:
            </p>

            {bulkActionType === 'assign' && (
              <Select
                label="Assign to Sales Representative"
                value={bulkAssignedTo}
                onChange={(e) => setBulkAssignedTo(e.target.value)}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...salesReps.map((r) => ({ value: String(r.id), label: r.name })),
                ]}
              />
            )}

            {bulkActionType === 'status' && (
              <Select
                label="Pipeline Status"
                value={bulkStatusValue}
                onChange={(e) => setBulkStatusValue(e.target.value)}
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
            )}

            {bulkActionType === 'followup' && (
              <div className="space-y-3">
                <Input
                  label="Follow-up Title"
                  value={bulkFollowupTitle}
                  onChange={(e) => setBulkFollowupTitle(e.target.value)}
                  required
                />
                <Input
                  label="Scheduled Date"
                  type="date"
                  value={bulkFollowupDate}
                  onChange={(e) => setBulkFollowupDate(e.target.value)}
                  required
                />
              </div>
            )}

            {bulkActionType === 'delete' && (
              <div className="p-4 bg-rose-950/40 border border-rose-900 rounded-xl text-xs text-rose-200">
                ⚠️ Are you sure you want to permanently delete {selectedLeadIds.length} selected leads? This action cannot be undone.
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <Button variant="outline" size="sm" onClick={() => setBulkActionType(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isBulkSubmitting}
                onClick={handleExecuteBulkAction}
                className={bulkActionType === 'delete' ? 'bg-rose-600 border-none font-bold' : 'bg-indigo-600 border-none font-bold'}
              >
                Confirm {bulkActionType.toUpperCase()}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Lead Prospect"
      >
        <LeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        title="Delete Lead Prospect"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete lead{' '}
            <strong className="text-white">
              {leadToDelete?.first_name} {leadToDelete?.last_name}
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setLeadToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteLead}
            >
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Leads;
