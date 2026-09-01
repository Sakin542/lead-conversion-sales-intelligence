import React from 'react';
import { DollarSign, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { PipelineSummary as PipelineSummaryType } from '../../types/pipeline';

interface PipelineSummaryProps {
  summary: PipelineSummaryType;
}

export const PipelineSummary: React.FC<PipelineSummaryProps> = ({ summary }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Pipeline Value */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center space-x-4 shadow-md hover:border-slate-700/80 transition-all duration-200">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wide">Total Open Value</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.total_pipeline_value)}
          </p>
        </div>
      </div>

      {/* Open Deals */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center space-x-4 shadow-md hover:border-slate-700/80 transition-all duration-200">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wide">Open Deals</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {summary.open_deals_count}
          </p>
        </div>
      </div>

      {/* Won Deals */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center space-x-4 shadow-md hover:border-slate-700/80 transition-all duration-200">
        <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wide">Won Deals</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {summary.won_deals_count}
          </p>
        </div>
      </div>

      {/* Lost Deals */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center space-x-4 shadow-md hover:border-slate-700/80 transition-all duration-200">
        <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wide">Lost Deals</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {summary.lost_deals_count}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PipelineSummary;
