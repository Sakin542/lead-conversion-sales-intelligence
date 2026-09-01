import React from 'react';
import { Calendar, Percent, Edit, Trash2, Building2 } from 'lucide-react';
import { Deal, PipelineStage } from '../../types/pipeline';

interface DealCardProps {
  deal: Deal;
  stages: PipelineStage[];
  onStageChange: (dealId: number, newStageId: number) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  stages,
  onStageChange,
  onEdit,
  onDelete,
}) => {
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num)
      ? '$0'
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(num);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const leadName = deal.lead
    ? `${deal.lead.first_name} ${deal.lead.last_name}`
    : 'Unknown Lead';
  const companyName = deal.lead ? deal.lead.company : 'N/A';

  return (
    <div className="p-4 bg-slate-900/90 border border-slate-800/80 rounded-xl space-y-3 shadow-md hover:border-indigo-500/50 hover:shadow-indigo-500/5 transition-all group">
      {/* Company Tag & Title */}
      <div>
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{companyName}</span>
        </div>
        <h4 className="text-sm font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">
          {deal.title}
        </h4>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{leadName}</p>
      </div>

      {/* Value & Probability */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60">
        <span className="text-base font-extrabold text-emerald-400 tracking-tight">
          {formatCurrency(deal.value)}
        </span>

        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/80 text-[11px] font-bold">
          <Percent className="w-3 h-3" />
          <span>{deal.probability}%</span>
        </div>
      </div>

      {/* Expected Close Date */}
      {deal.expected_close_date && (
        <div className="flex items-center text-[11px] text-slate-400 space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Close: {formatDate(deal.expected_close_date)}</span>
        </div>
      )}

      {/* Stage Movement Dropdown & Action Buttons */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs gap-2">
        <select
          value={deal.pipeline_stage_id}
          onChange={(e) => onStageChange(deal.id, parseInt(e.target.value, 10))}
          className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors w-full max-w-[160px] truncate"
        >
          {stages.map((st) => (
            <option key={st.id} value={st.id} className="bg-slate-900 text-slate-200">
              {st.name}
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onEdit(deal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            title="Edit Deal"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(deal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            title="Delete Deal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
