import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { salesRepApi } from '../../services/api';
import { TrendingUp } from 'lucide-react';

export const SalesRepAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getAnalytics({ date_range: dateRange });
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

  const metrics = data?.metrics || {};
  const tempDist = data?.temperature_distribution || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-indigo-400" />
              <span>Personal Performance Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Personal conversion trends, revenue won, lead temperature breakdown, and activity metrics.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between h-full space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Leads</span>
                <div>
                  <p className="text-2xl font-black text-white">{metrics.total_leads || 0}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">In Selected Period</p>
                </div>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between h-full space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Conversion Rate</span>
                <div>
                  <p className="text-2xl font-black text-emerald-400">{metrics.conversion_rate || '0%'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Lead to Win Ratio</p>
                </div>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between h-full space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Revenue Closed</span>
                <div>
                  <p className="text-2xl font-black text-emerald-400">${(metrics.revenue || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Closed Sales Revenue</p>
                </div>
              </Card>

              <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between h-full space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Follow-ups Completed</span>
                <div>
                  <p className="text-2xl font-black text-cyan-400">{metrics.followups_completed || 0}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Completed Tasks</p>
                </div>
              </Card>
            </div>

            {/* Temperature Breakdown & Source Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5 bg-slate-900/80 border-slate-800 flex flex-col justify-between h-full space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                    Lead Temperature Distribution
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-[11px] font-bold text-amber-400 uppercase block">HOT</span>
                      <p className="text-2xl font-black text-white">{tempDist.hot || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase block">WARM</span>
                      <p className="text-2xl font-black text-white">{tempDist.warm || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">COLD</span>
                      <p className="text-2xl font-black text-white">{tempDist.cold || 0}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-slate-900/80 border-slate-800 flex flex-col justify-between h-full space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                    Lead Source Distribution
                  </h3>

                  <div className="space-y-2">
                    {data?.source_breakdown?.map((sb: any) => (
                      <div key={sb.source} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{sb.source}</span>
                        <Badge variant="primary" size="sm">{sb.count} leads</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepAnalytics;
