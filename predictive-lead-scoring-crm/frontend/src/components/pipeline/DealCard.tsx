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
    <div className="p-4 bg-[#171718] border border-[#2A2A2E] rounded-xl space-y-3 shadow-md hover:border-[#FF7A00]/40 hover:shadow-xl hover:shadow-[#FF7A00]/10 hover:-translate-y-1 transition-all duration-300 animate-scale-in group">
      {/* Company Tag & Title */}
      <div>
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#FF7A00] uppercase tracking-wider mb-1">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{companyName}</span>
        </div>
        <h4 className="text-sm font-bold text-white leading-snug group-hover:text-[#FF7A00] transition-colors">
          {deal.title}
        </h4>
        <p className="text-xs text-[#A1A1AA] font-medium mt-0.5">{leadName}</p>
      </div>

      {/* Value & Probability */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#2A2A2E]">
        <span className="text-base font-extrabold text-[#22C55E] tracking-tight">
          {formatCurrency(deal.value)}
        </span>

        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 text-[11px] font-medium">
          <Percent className="w-3 h-3" />
          <span>{deal.probability}%</span>
        </div>
      </div>

      {/* Expected Close Date */}
      {deal.expected_close_date && (
        <div className="flex items-center text-[11px] text-[#A1A1AA] space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
          <span>Close: {formatDate(deal.expected_close_date)}</span>
        </div>
      )}

      {/* Stage Movement Dropdown & Action Buttons */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#2A2A2E] text-xs gap-2">
        <select
          value={deal.pipeline_stage_id}
          onChange={(e) => onStageChange(deal.id, parseInt(e.target.value, 10))}
          className="px-2.5 py-1 bg-[#111113] border border-[#2A2A2E] rounded-lg text-[11px] font-medium text-white focus:outline-none focus:border-[#FF7A00] transition-colors w-full max-w-[160px] truncate"
        >
          {stages.map((st) => (
            <option key={st.id} value={st.id} className="bg-[#171718] text-white">
              {st.name}
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onEdit(deal)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-[#151515] transition-colors border border-transparent hover:border-[#222222]"
            title="Edit Deal"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(deal)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-[#151515] transition-colors border border-transparent hover:border-[#222222]"
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
