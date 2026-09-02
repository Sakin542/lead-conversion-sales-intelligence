import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { BarChart3, TrendingUp, DollarSign, Target, RefreshCw, Download, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { date_range: dateRange };
      if (dateRange === 'custom') {
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
      }
      const res = await adminApi.getAnalytics(params);
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleExportCsv = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/admin/analytics/export-csv?date_range=${dateRange}&token=${token}`, '_blank');
  };

  const leadAn = data?.lead_analytics || {};
  const convAn = data?.conversion_analytics || {};
  const salesAn = data?.sales_analytics || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-indigo-400" />
              <span>System Analytics & Revenue Intelligence</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Multi-dimensional analysis for lead acquisition, conversion efficiency, representative performance, and revenue sources.
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
              onClick={fetchAnalytics}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">Time Window:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: 'This Year' },
              { id: 'custom', label: 'Custom' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateRange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dateRange === opt.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center space-x-2 text-xs">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1"
              />
              <Button size="sm" variant="secondary" onClick={fetchAnalytics}>
                Apply
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total System Leads</span>
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-white">{leadAn.total_leads || 0}</p>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Overall Conversion Rate</span>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400">{convAn.overall_rate || 0}%</p>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Won Revenue</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white">${(salesAn.won_deals_value || 0).toLocaleString()}</p>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion by Channel Source */}
              <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Conversion Rate by Acquisition Source</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={convAn.by_source || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="source" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Bar dataKey="conversion_rate" fill="#6366f1" radius={[8, 8, 0, 0]} name="Conversion Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Revenue by Source */}
              <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Revenue Generated by Source</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesAn.revenue_by_source || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="source" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

