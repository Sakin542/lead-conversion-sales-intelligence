import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerApi } from '../../services/api';
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react';

export const ManagerReports: React.FC = () => {
  const [reportType, setReportType] = useState('team_performance');
  const [reportData, setReportData] = useState<any>(null);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await managerApi.getReports({ report_type: reportType });
      if (res.success) {
        setReportData(res.report_data);
        setGeneratedAt(res.generated_at);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCsv = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.open(`${API_URL}/manager/reports/export-csv?report_type=${reportType}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-[#FF7A00]" />
              <span>Manager Reports Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Generate team performance, conversion rates, channel sources, revenue forecasts, and AI engine reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C] hover:text-white"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Report
            </Button>
            <Button
              variant="ai"
              size="sm"
              onClick={handleExportCsv}
              className="font-bold text-xs"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Report CSV
            </Button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-4 shadow-xl flex flex-wrap items-end gap-4">
          <div className="w-72">
            <Select
              label="Select Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'team_performance', label: 'Team Performance Report' },
                { value: 'lead_conversion', label: 'Lead Conversion Report' },
                { value: 'lead_source', label: 'Lead Acquisition Source Report' },
                { value: 'revenue', label: 'Revenue Forecast Report' },
                { value: 'ai_performance', label: 'AI Score Performance Report' },
              ]}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchReport}
            className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C] hover:text-white"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Report
          </Button>
        </div>

        {/* Report Display Container */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Card className="p-6 bg-[#171718] border-[#2A2A2E] space-y-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-white capitalize">{reportType.replace('_', ' ')} Report</h2>
                <p className="text-xs text-zinc-400">Generated on {generatedAt}</p>
              </div>
              <Badge variant="primary" size="md">System Verified Data</Badge>
            </div>

            {/* Team Performance Report */}
            {reportType === 'team_performance' && Array.isArray(reportData) && (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-zinc-300 min-w-[650px]">
                  <thead className="bg-[#111113] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#2A2A2E]">
                    <tr>
                      <th className="px-4 py-3">Sales Representative</th>
                      <th className="px-4 py-3">Total Assigned Leads</th>
                      <th className="px-4 py-3">Converted Leads</th>
                      <th className="px-4 py-3">Conversion Rate</th>
                      <th className="px-4 py-3 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2E]">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#1C1C1E] transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">
                          {row.rep_name}
                          <span className="block text-[10px] text-zinc-400 font-normal">{row.email}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-200">{row.total_leads}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-400">{row.converted_leads}</td>
                        <td className="px-4 py-3 font-semibold text-[#FF7A00]">{row.conversion_rate}</td>
                        <td className="px-4 py-3 font-semibold text-right text-emerald-400">${row.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Lead Conversion Report */}
            {reportType === 'lead_conversion' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Leads</span>
                    <p className="text-xl font-black text-white">{reportData.total_leads || 0}</p>
                  </div>
                  <div className="p-4 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                    <span className="text-[10px] font-bold text-[#FF7A00] uppercase">Qualified</span>
                    <p className="text-xl font-black text-[#FF7A00]">{reportData.qualified_leads || 0}</p>
                  </div>
                  <div className="p-4 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Won / Converted</span>
                    <p className="text-xl font-black text-emerald-400">{reportData.won_leads || 0}</p>
                  </div>
                  <div className="p-4 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Conversion Rate</span>
                    <p className="text-xl font-black text-emerald-400">{reportData.conversion_rate || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lead Source Report */}
            {reportType === 'lead_source' && Array.isArray(reportData) && (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-zinc-300 min-w-[650px]">
                  <thead className="bg-[#111113] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#2A2A2E]">
                    <tr>
                      <th className="px-4 py-3">Acquisition Source</th>
                      <th className="px-4 py-3">Total Prospects</th>
                      <th className="px-4 py-3">Converted Count</th>
                      <th className="px-4 py-3">Conversion Efficiency</th>
                      <th className="px-4 py-3 text-right">Revenue Attributed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2E]">
                    {reportData.map((s: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#1C1C1E] transition-colors">
                        <td className="px-4 py-3 font-semibold text-white uppercase">{s.source}</td>
                        <td className="px-4 py-3 text-zinc-200">{s.total_leads}</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">{s.converted}</td>
                        <td className="px-4 py-3 text-[#FF7A00] font-semibold">{s.conversion_rate}</td>
                        <td className="px-4 py-3 font-semibold text-right text-emerald-400">${(s.revenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Revenue & AI Reports */}
            {(reportType === 'revenue' || reportType === 'ai_performance') && (
              <div className="p-4 bg-[#111113] border border-[#2A2A2E] rounded-xl space-y-2">
                <pre className="text-xs font-mono text-[#FF7A00] overflow-x-auto">
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerReports;

