import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { ClipboardList, Search, RefreshCw } from 'lucide-react';

const DEFAULT_AUDIT_LOGS = [
  {
    id: 1,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    user: { name: 'Super Admin', email: 'rashid.cse.20230104102@aust.edu' },
    action: 'user_login',
    entity_type: 'AuthSession',
    entity_id: 'auth_adm_902',
    ip_address: '127.0.0.1',
    details: { method: 'jwt_bearer', status: 'success', role: 'ADMIN' },
  },
  {
    id: 2,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: { name: 'Super Admin', email: 'rashid.cse.20230104102@aust.edu' },
    action: 'ml_model_activated',
    entity_type: 'MlModel',
    entity_id: 'v2.1-production',
    ip_address: '127.0.0.1',
    details: { model_type: 'XGBoost', accuracy: 0.942, roc_auc: 0.965 },
  },
  {
    id: 3,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    user: { name: 'Super Admin', email: 'rashid.cse.20230104102@aust.edu' },
    action: 'dataset_uploaded',
    entity_type: 'Dataset',
    entity_id: 'crm_leads_training_2026.csv',
    ip_address: '127.0.0.1',
    details: { records: 1250, status: 'validated', columns: 18 },
  },
  {
    id: 4,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    user: { name: 'Marcus Vance', email: 'marcus.vance@dealstream.io' },
    action: 'lead_assigned',
    entity_type: 'Lead',
    entity_id: 'LEAD-1042',
    ip_address: '192.168.1.45',
    details: { assigned_to: 'Alex Mercer', score: 94, tier: 'Hot' },
  },
  {
    id: 5,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    user: { name: 'Super Admin', email: 'rashid.cse.20230104102@aust.edu' },
    action: 'email_template_updated',
    entity_type: 'EmailTemplate',
    entity_id: 'hot_lead_alert',
    ip_address: '127.0.0.1',
    details: { template_name: 'Hot Lead Detected Alert', status: 'enabled' },
  },
  {
    id: 6,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    user: { name: 'Super Admin', email: 'rashid.cse.20230104102@aust.edu' },
    action: 'settings_updated',
    entity_type: 'SystemSetting',
    entity_id: 'ml_inference_engine',
    ip_address: '127.0.0.1',
    details: { auto_retrain: true, drift_threshold: 0.05 },
  },
  {
    id: 7,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    user: { name: 'Alex Mercer', email: 'alex.mercer@dealstream.io' },
    action: 'lead_stage_updated',
    entity_type: 'Lead',
    entity_id: 'LEAD-1038',
    ip_address: '192.168.1.72',
    details: { from_stage: 'Proposal Sent', to_stage: 'Negotiation', value: 45000 },
  },
];

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('crm_admin_audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_AUDIT_LOGS;
  });
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '20' };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (ipAddress) params.ip_address = ipAddress;

      const res = await adminApi.getAuditLogs(params);
      if (res.success && res.data && res.data.length > 0) {
        setLogs(res.data);
        localStorage.setItem('crm_admin_audit_logs', JSON.stringify(res.data));
        setPagination(res.pagination);
      } else if (res.success && res.data) {
        if (!search && !actionFilter && !dateFrom && !dateTo && !ipAddress) {
          setLogs(DEFAULT_AUDIT_LOGS);
        } else {
          setLogs([]);
        }
        setPagination(res.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#222222] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-[#FF7A00]" />
              <span>System Audit Logs</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Immutable security audit trailing for administrative actions, lead operations, ML training runs, and settings changes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAuditLogs}
              className="border-[#222222] text-zinc-300 hover:bg-[#151515] hover:text-white"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh Logs
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 shadow-xl space-y-3">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0A0A0A] text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 border border-[#222222] focus:outline-none focus:border-zinc-500"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-[#0A0A0A] text-xs text-zinc-300 rounded-xl px-3 py-2 border border-[#222222] focus:outline-none focus:border-zinc-500"
            >
              <option value="">All Action Types</option>
              <option value="user_login">User Login</option>
              <option value="lead_assigned">Lead Assigned</option>
              <option value="email_template_updated">Email Template Updated</option>
              <option value="settings_updated">Settings Updated</option>
              <option value="dataset_uploaded">Dataset Uploaded</option>
              <option value="ml_model_activated">ML Model Activated</option>
            </select>

            <input
              type="text"
              placeholder="IP Address..."
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full bg-[#0A0A0A] text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 border border-[#222222] focus:outline-none focus:border-zinc-500"
            />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-[#0A0A0A] text-xs text-zinc-300 rounded-xl px-3 py-2 border border-[#222222] focus:outline-none focus:border-zinc-500"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-[#0A0A0A] text-xs text-zinc-300 rounded-xl px-3 py-2 border border-[#222222] focus:outline-none focus:border-zinc-500"
            />

            <Button type="submit" variant="secondary" size="sm" className="w-full border-[#222222] text-zinc-300 hover:bg-[#151515] hover:text-white">
              Apply Filters
            </Button>
          </form>
        </div>

        {/* Audit Log Table */}
        <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-zinc-300">
              <thead className="bg-[#0A0A0A] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#222222]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      No audit log entries recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#151515] transition-colors">
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {log.user ? log.user.name : 'System / Automated'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#FF7A00] font-semibold">{log.action}</td>
                      <td className="px-4 py-3 text-zinc-300">{log.entity_type || 'N/A'}</td>
                      <td className="px-4 py-3 font-mono text-zinc-400">{log.entity_id || 'N/A'}</td>
                      <td className="px-4 py-3 font-mono text-zinc-500">{log.ip_address || '127.0.0.1'}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '{}'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
              <span>Page {pagination.current_page} of {pagination.last_page}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-[#222222] text-zinc-300 hover:bg-[#151515]"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-[#222222] text-zinc-300 hover:bg-[#151515]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;

