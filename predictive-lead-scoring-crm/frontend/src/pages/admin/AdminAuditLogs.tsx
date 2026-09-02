import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { ClipboardList, Search, RefreshCw, Download } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

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
      if (res.success) {
        setLogs(res.data);
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

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (actionFilter) params.append('action', actionFilter);
    const token = localStorage.getItem('token');
    window.open(`/api/admin/audit-logs/export-csv?${params.toString()}&token=${token}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-indigo-400" />
              <span>System Audit Logs</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Immutable security audit trailing for administrative actions, lead operations, ML training runs, and settings changes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAuditLogs}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh Logs
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
            />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-300 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
            />

            <Button type="submit" variant="secondary" size="sm" className="w-full">
              Apply Filters
            </Button>
          </form>
        </div>

        {/* Audit Log Table */}
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No audit log entries recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {log.user ? log.user.name : 'System / Automated'}
                      </td>
                      <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{log.action}</td>
                      <td className="px-4 py-3 text-slate-300">{log.entity_type || 'N/A'}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{log.entity_id || 'N/A'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '{}'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Page {pagination.current_page} of {pagination.last_page}</span>
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
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;

