import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerApi } from '../../services/api';
import { TrendingUp, DollarSign, Briefcase, Bot, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const RevenueForecast: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await managerApi.getRevenueForecast();
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
    fetchForecast();
  }, []);

  const kpis = data?.kpis || {};
  const scenarios = data?.scenarios || {};
  const charts = data?.charts || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-indigo-400" />
              <span>Manager Revenue Forecast</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Multi-tiered forecasting aggregating actual won revenue, open pipeline, weighted deal probabilities, and AI predictions.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchForecast}
            className="border-slate-800 text-slate-300 hover:bg-slate-900"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Forecast
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 4 Core Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Actual Won Revenue</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400">${(kpis.actual_revenue || 0).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">Realized Closed Revenue</p>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Pipeline Value</span>
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-indigo-400">${(kpis.pipeline_value || 0).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">Unclosed Active Funnel</p>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Weighted Forecast</span>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-purple-400">${(kpis.weighted_forecast || 0).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">Deal Value &times; Probability</p>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">AI Predicted Revenue</span>
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-400">${(kpis.ai_predicted_revenue || 0).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">ML Model Score Projection</p>
              </Card>
            </div>

            {/* Scenarios (Best / Expected / Worst Case) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase">Best-Case Forecast</span>
                <p className="text-2xl font-black text-white">${(scenarios.best_case || 0).toLocaleString()}</p>
                <p className="text-[11px] text-emerald-300/80">Won Revenue + 100% Pipeline</p>
              </div>

              <div className="p-4 bg-indigo-950/40 border border-indigo-800/80 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase">Expected Forecast</span>
                <p className="text-2xl font-black text-white">${(scenarios.expected || 0).toLocaleString()}</p>
                <p className="text-[11px] text-indigo-300/80">Won Revenue + Weighted Forecast</p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Worst-Case Forecast</span>
                <p className="text-2xl font-black text-white">${(scenarios.worst_case || 0).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">Won Revenue + 70% High-Intent Leads</p>
              </div>
            </div>

            {/* Monthly Forecast Chart */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Monthly Revenue Forecast vs Actual</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.monthly_forecast || []}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="actual_revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="Actual Won ($)" />
                    <Area type="monotone" dataKey="forecast_revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorForecast)" name="AI Forecast ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sales Rep Forecast Table */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Sales Representative Forecast Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Sales Representative</th>
                      <th className="px-4 py-3">Actual Won Revenue</th>
                      <th className="px-4 py-3">Pipeline Value</th>
                      <th className="px-4 py-3">Weighted Forecast</th>
                      <th className="px-4 py-3 text-right">Total Expected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(charts.rep_forecast || []).map((rep: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-white">{rep.rep_name}</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">${rep.actual_won.toLocaleString()}</td>
                        <td className="px-4 py-3 text-indigo-400 font-semibold">${rep.pipeline_value.toLocaleString()}</td>
                        <td className="px-4 py-3 text-purple-400 font-semibold">${rep.weighted_forecast.toLocaleString()}</td>
                        <td className="px-4 py-3 font-black text-right text-white">${rep.total_expected.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RevenueForecast;

