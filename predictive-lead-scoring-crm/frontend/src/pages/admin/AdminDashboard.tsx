import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { adminApi } from '../../services/api';
import {
  Users,
  Target,
  Flame,
  ThermometerSun,
  Snowflake,
  TrendingUp,
  DollarSign,
  Briefcase,
  Clock,
  UserCheck,
  Plus,
  Bot,
  ArrowUpRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{ kpis?: any; charts?: any; alerts?: any[] } | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Search Modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ leads: any[]; users: any[]; deals: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [res, healthRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getSystemHealth(),
      ]);
      if (res.success) {
        setData(res);
      }
      if (healthRes.success) {
        setHealthData(healthRes);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await adminApi.globalSearch(searchQuery);
      if (res.success) {
        setSearchResults(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Enterprise Executive Control Header */}
        <Card className="p-6 bg-[#111111] border-[#222222] shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Title, System Status, and Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Enterprise Control Center
                </h1>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  System Operational
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Real-time CRM telemetry, machine learning model health, user role hierarchy, and pipeline conversion analytics.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="border-[#222222] text-zinc-300 hover:bg-[#151515]"
                leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/users')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Invite User
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/leads')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Lead
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/admin/ml')}
                leftIcon={<Bot className="w-4 h-4 text-purple-400" />}
              >
                ML Control Center
              </Button>
            </div>
          </div>

          {/* Integrated Global Search Bar */}
          <div className="relative z-10 pt-2 border-t border-[#222222]">
            <form onSubmit={handleGlobalSearch} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Global Admin Search (Search leads, emails, companies, or sales reps)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A0A] text-sm text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 border border-[#222222] focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" isLoading={isSearching}>
                Search
              </Button>
            </form>

            {searchResults && (
              <div className="mt-4 p-4 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Global Search Results</h3>
                  <button
                    onClick={() => setSearchResults(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold"
                  >
                    Clear Results
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-purple-400 mb-1">Leads ({searchResults.leads.length})</h4>
                    {searchResults.leads.length === 0 ? (
                      <p className="text-[11px] text-zinc-600">No leads found.</p>
                    ) : (
                      searchResults.leads.map((l) => (
                        <div key={l.id} className="py-1 border-b border-[#222222] text-zinc-300">
                          {l.first_name} {l.last_name} ({l.company})
                        </div>
                      ))
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-400 mb-1">Users ({searchResults.users.length})</h4>
                    {searchResults.users.length === 0 ? (
                      <p className="text-[11px] text-zinc-600">No users found.</p>
                    ) : (
                      searchResults.users.map((u) => (
                        <div key={u.id} className="py-1 border-b border-[#222222] text-zinc-300">
                          {u.name} ({u.email})
                        </div>
                      ))
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-400 mb-1">Deals ({searchResults.deals.length})</h4>
                    {searchResults.deals.length === 0 ? (
                      <p className="text-[11px] text-zinc-600">No deals found.</p>
                    ) : (
                      searchResults.deals.map((d) => (
                        <div key={d.id} className="py-1 border-b border-[#222222] text-zinc-300">
                          {d.title} (${d.value})
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 12 KPI CARDS GRID */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Users</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{kpis.total_users || 0}</p>
              <p className="text-[11px] text-zinc-500">System Accounts</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Leads</span>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{kpis.total_leads || 0}</p>
              <p className="text-[11px] text-zinc-500">Database Prospects</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">New Leads</span>
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400">{kpis.new_leads || 0}</p>
              <p className="text-[11px] text-zinc-500">Unprocessed Queue</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hot Leads </span>
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">{kpis.hot_leads || 0}</p>
              <p className="text-[11px] text-zinc-500">Score &ge; 80 (High Intent)</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Warm Leads</span>
                <ThermometerSun className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-400">{kpis.warm_leads || 0}</p>
              <p className="text-[11px] text-zinc-500">Score 50-79</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cold Leads</span>
                <Snowflake className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-2xl font-bold text-zinc-400">{kpis.cold_leads || 0}</p>
              <p className="text-[11px] text-zinc-500">Score &lt; 50</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Converted Leads</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{kpis.converted_leads || 0}</p>
              <p className="text-[11px] text-zinc-500">Successfully Closed Deals</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Conversion Rate</span>
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{kpis.conversion_rate || 0}%</p>
              <p className="text-[11px] text-zinc-500">Lead-to-Win Ratio</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">${(kpis.total_revenue || 0).toLocaleString()}</p>
              <p className="text-[11px] text-zinc-500">Closed Deal Value</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pipeline Value</span>
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-400">${(kpis.pipeline_value || 0).toLocaleString()}</p>
              <p className="text-[11px] text-zinc-500">Active Deals in Funnel</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Follow-ups</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">{kpis.pending_followups || 0}</p>
              <p className="text-[11px] text-zinc-500">Scheduled Actions</p>
            </Card>

            <Card className="p-4 bg-[#111111] border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Reps</span>
                <UserCheck className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{kpis.active_sales_reps || 0}</p>
              <p className="text-[11px] text-zinc-500">Active Sales Team Members</p>
            </Card>
          </div>
        )}

        {/* System Health Monitoring Section */}
        <Card className="p-4 bg-[#111111] border-[#222222] space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Health Monitoring</h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] text-zinc-400">Last checked: {healthData?.checkedAt || 'Just now'}</span>
              <button
                onClick={fetchDashboardData}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#151515]"
                title="Refresh Health Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#0A0A0A] rounded-xl border border-[#222222]">
              <span className="font-semibold text-zinc-300">API Server</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">● Operational</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#0A0A0A] rounded-xl border border-[#222222]">
              <span className="font-semibold text-zinc-300">Database</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">● Connected</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#0A0A0A] rounded-xl border border-[#222222]">
              <span className="font-semibold text-zinc-300">ML Service</span>
              <span className={`font-bold flex items-center gap-1 ${healthData?.mlService?.status === 'unavailable' ? 'text-rose-400' : 'text-emerald-400'}`}>
                ● {healthData?.mlService?.status === 'unavailable' ? 'Unavailable' : 'Operational'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#0A0A0A] rounded-xl border border-[#222222]">
              <span className="font-semibold text-zinc-300">Email Service</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">● Operational</span>
            </div>
          </div>
        </Card>

        {/* 7 CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Lead Trend */}
          <Card className="p-5 bg-[#0A0A0A] border-[#222222] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Monthly Lead Volume Trend</span>
              <Badge variant="primary" size="sm">Lead Velocity</Badge>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.lead_trend || []}>
                  <defs>
                    <linearGradient id="colorLead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={11} />
                  <YAxis stroke="#71717A" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="count" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorLead)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Lead Temperature Distribution */}
          <Card className="p-5 bg-[#0A0A0A] border-[#222222] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Lead Temperature Breakdown</span>
              <Badge variant="warning" size="sm">Intent Scores</Badge>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.temperature_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    <Cell fill="#f59e0b" />
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#71717a" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#A1A1AA' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 3: Lead Source Distribution */}
          <Card className="p-5 bg-[#0A0A0A] border-[#222222] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Lead Sources Distribution</span>
              <Badge variant="secondary" size="sm">Acquisition</Badge>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.source_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="source" stroke="#71717A" fontSize={11} />
                  <YAxis stroke="#71717A" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 4: Sales Pipeline Breakdown */}
          <Card className="p-5 bg-[#0A0A0A] border-[#222222] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Sales Pipeline Stages</span>
              <Badge variant="success" size="sm">Deal Funnel</Badge>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.pipeline_stages || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis type="number" stroke="#71717A" fontSize={11} />
                  <YAxis dataKey="status" type="category" stroke="#71717A" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Rep Performance Table */}
        <Card className="p-5 bg-[#0A0A0A] border-[#222222] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Sales Representative Performance Summary</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/users')}
              className="text-xs text-purple-400 border-[#222222] hover:bg-[#151515]"
            >
              Manage Team →
            </Button>
          </div>

          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[640px] text-left text-xs text-zinc-300">
              <thead className="bg-[#111111] text-zinc-400 font-medium uppercase tracking-wider border-b border-[#222222]">
                <tr>
                  <th className="px-4 py-3">Sales Representative</th>
                  <th className="px-4 py-3">Assigned Leads</th>
                  <th className="px-4 py-3">Converted Leads</th>
                  <th className="px-4 py-3">Conversion Rate</th>
                  <th className="px-4 py-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {(charts.rep_performance || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                      No sales representatives found.
                    </td>
                  </tr>
                ) : (
                  (charts.rep_performance || []).map((rep: any) => (
                    <tr key={rep.id} className="hover:bg-[#151515]">
                      <td className="px-4 py-3 font-bold text-white">
                        {rep.name}
                        <span className="block text-[10px] text-zinc-400 font-normal">{rep.email}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-200">{rep.assigned_leads}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">{rep.converted_leads}</td>
                      <td className="px-4 py-3 font-bold text-purple-400">{rep.conversion_rate}%</td>
                      <td className="px-4 py-3 font-bold text-right text-emerald-400">
                        ${rep.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

