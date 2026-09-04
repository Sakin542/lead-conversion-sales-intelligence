import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { salesRepApi } from '../../services/api';
import { Target, Search, Eye, Plus, Calendar, RefreshCw } from 'lucide-react';

export const SalesRepLeads: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [temperature, setTemperature] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  // Activity & Follow-up Modals
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState<any | null>(null);
  const [activityType, setActivityType] = useState('call');
  const [outcome, setOutcome] = useState('Interested');
  const [activityNotes, setActivityNotes] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  const [selectedLeadForFollowup, setSelectedLeadForFollowup] = useState<any | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');
  const [isSavingFollowup, setIsSavingFollowup] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (search) params.search = search;
      if (temperature) params.temperature = temperature;
      if (status) params.status = status;

      const res = await salesRepApi.getLeads(params);
      if (res.success) {
        setLeads(res.data);
        setPagination(res.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, temperature, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForActivity) return;

    setIsSavingActivity(true);
    try {
      const res = await salesRepApi.logActivity({
        lead_id: selectedLeadForActivity.id,
        activity_type: activityType,
        outcome,
        notes: activityNotes,
      });

      if (res.success) {
        setSelectedLeadForActivity(null);
        setActivityNotes('');
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to log activity.');
    } finally {
      setIsSavingActivity(false);
    }
  };

  const handleSaveFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForFollowup || !scheduledAt) return;

    setIsSavingFollowup(true);
    try {
      const res = await salesRepApi.createFollowUp({
        lead_id: selectedLeadForFollowup.id,
        scheduled_at: scheduledAt,
        notes: followupNotes,
      });

      if (res.success) {
        setSelectedLeadForFollowup(null);
        setScheduledAt('');
        setFollowupNotes('');
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to schedule follow-up.');
    } finally {
      setIsSavingFollowup(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-[#FF7A00]" />
              <span>My Assigned Leads</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Search, filter, update pipeline stage, and execute outreach for your assigned prospects.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeads}
            className="border-[#2A2A2E] text-zinc-300 hover:bg-[#1C1C1E]"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Leads
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lead name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111113] text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 border border-[#2A2A2E] focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <select
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full bg-[#111113] text-xs text-zinc-300 rounded-xl px-3 py-2 border border-[#2A2A2E] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="">All AI Temperatures</option>
              <option value="HOT">HOT (Score 80+)</option>
              <option value="WARM">WARM (Score 50-79)</option>
              <option value="COLD">COLD (Score &lt; 50)</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#111113] text-xs text-zinc-300 rounded-xl px-3 py-2 border border-[#2A2A2E] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            <Button type="submit" variant="ai" size="sm" className="w-full">
              Filter Leads
            </Button>
          </form>
        </div>

        {/* Leads Table */}
        <Card className="p-5 bg-[#171718] border-[#2A2A2E] space-y-4">
          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-zinc-300">
              <thead className="bg-[#111113] text-zinc-400 font-bold uppercase tracking-wider border-b border-[#2A2A2E]">
                <tr>
                  <th className="px-4 py-3">Lead / Company</th>
                  <th className="px-4 py-3">AI Score</th>
                  <th className="px-4 py-3">Temperature</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Est. Value</th>
                  <th className="px-4 py-3">Assigned Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      No assigned leads match your criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} className="hover:bg-[#1C1C1E] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{l.first_name} {l.last_name}</p>
                        <p className="text-[11px] text-zinc-400">{l.company} • {l.email}</p>
                      </td>
                      <td className="px-4 py-3 font-black text-[#FF7A00]">{l.score ?? 75}/100</td>
                      <td className="px-4 py-3">
                        <Badge variant={(l.score ?? 75) >= 80 ? 'warning' : (l.score ?? 75) >= 50 ? 'primary' : 'neutral'} size="sm">
                          {(l.score ?? 75) >= 80 ? 'HOT' : (l.score ?? 75) >= 50 ? 'WARM' : 'COLD'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 uppercase font-bold text-xs">{l.status}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">${(l.estimated_value || 25000).toLocaleString()}</td>
                      <td className="px-4 py-3 text-zinc-400">{l.created_at ? new Date(l.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLeadForActivity(l)}
                            className="text-[11px] border-[#2A2A2E] text-zinc-200 hover:bg-[#1C1C1E]"
                            title="Log Activity"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Log
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLeadForFollowup(l)}
                            className="text-[11px] border-[#2A2A2E] text-[#FF7A00] hover:bg-[#1C1C1E]"
                            title="Schedule Follow-up"
                          >
                            <Calendar className="w-3 h-3 mr-1" /> Follow-up
                          </Button>
                          <Button
                            variant="ai"
                            size="sm"
                            onClick={() => navigate(`/sales-rep/leads/${l.id}`)}
                            className="text-[11px]"
                          >
                            <Eye className="w-3 h-3 mr-1" /> Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-between items-center text-xs text-zinc-400 pt-3 border-t border-[#2A2A2E]">
              <span>Page {pagination.current_page} of {pagination.last_page}</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-[#2A2A2E]">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage(page + 1)} className="border-[#2A2A2E]">
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Activity Log Modal */}
        {selectedLeadForActivity && (
          <Modal
            isOpen={!!selectedLeadForActivity}
            onClose={() => setSelectedLeadForActivity(null)}
            title={`Log Activity: ${selectedLeadForActivity.first_name} ${selectedLeadForActivity.last_name}`}
          >
            <form onSubmit={handleSaveActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full bg-[#111113] border border-[#2A2A2E] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="demo">Product Demo</option>
                  <option value="note">Note</option>
                  <option value="proposal">Proposal</option>
                </select>
              </div>

              {activityType === 'call' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Call Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full bg-[#111113] border border-[#2A2A2E] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FF7A00]"
                  >
                    <option value="Connected">Connected</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Busy">Busy</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Callback Requested">Callback Requested</option>
                    <option value="Qualified">Qualified</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Notes / Description</label>
                <textarea
                  rows={3}
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  className="w-full bg-[#111113] border border-[#2A2A2E] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-[#FF7A00]"
                  placeholder="Record summary of discussion..."
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-[#2A2A2E]">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLeadForActivity(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="ai" size="sm" isLoading={isSavingActivity}>
                  Save Activity Log
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Schedule Follow-up Modal */}
        {selectedLeadForFollowup && (
          <Modal
            isOpen={!!selectedLeadForFollowup}
            onClose={() => setSelectedLeadForFollowup(null)}
            title={`Schedule Follow-up: ${selectedLeadForFollowup.first_name} ${selectedLeadForFollowup.last_name}`}
          >
            <form onSubmit={handleSaveFollowup} className="space-y-4">
              <Input
                label="Date & Time"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Follow-up Goal / Notes</label>
                <textarea
                  rows={3}
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  className="w-full bg-[#111113] border border-[#2A2A2E] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-[#FF7A00]"
                  placeholder="e.g. Discuss contract pricing proposal..."
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-[#2A2A2E]">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLeadForFollowup(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="ai" size="sm" isLoading={isSavingFollowup}>
                  Schedule Follow-up
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepLeads;
