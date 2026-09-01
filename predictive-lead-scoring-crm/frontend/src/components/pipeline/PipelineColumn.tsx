import React from 'react';
import { Deal, PipelineStage } from '../../types/pipeline';
import DealCard from './DealCard';
import { Plus } from 'lucide-react';

interface PipelineColumnProps {
  stage: PipelineStage;
  stages: PipelineStage[];
  deals: Deal[];
  onStageChange: (dealId: number, newStageId: number) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onAddDeal: (stageId: number) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  stages,
  deals,
  onStageChange,
  onEditDeal,
  onDeleteDeal,
  onAddDeal,
}) => {
  const totalValue = deals.reduce((acc, deal) => {
    const val = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStageHeaderColor = (slug: string) => {
    switch (slug) {
      case 'new-lead':
        return 'border-t-slate-400';
      case 'contacted':
        return 'border-t-blue-500';
      case 'qualified':
        return 'border-t-indigo-500';
      case 'proposal':
        return 'border-t-purple-500';
      case 'negotiation':
        return 'border-t-amber-500';
      case 'won':
        return 'border-t-emerald-500';
      case 'lost':
        return 'border-t-rose-500';
      default:
        return 'border-t-slate-500';
    }
  };

  return (
    <div
      className={`w-80 shrink-0 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3.5 flex flex-col min-h-[550px] border-t-4 ${getStageHeaderColor(
        stage.slug
      )} shadow-lg backdrop-blur-sm`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2.5">
          <h3 className="text-sm font-bold text-white tracking-tight">{stage.name}</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-200 font-bold text-[11px] min-w-[24px] text-center">
            {deals.length}
          </span>
        </div>

        <button
          onClick={() => onAddDeal(stage.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
          title={`Add Deal to ${stage.name}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Column Total Value Box */}
      <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400 font-medium flex items-center justify-between">
        <span>Column Value</span>
        <span className="text-slate-100 font-bold tracking-tight">{formatCurrency(totalValue)}</span>
      </div>

      {/* Deals List Container */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[400px] custom-scrollbar pr-1">
        {deals.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-xl bg-slate-900/30 space-y-1">
            <p className="text-xs text-slate-500 font-semibold">No deals in stage</p>
            <p className="text-[11px] text-slate-600">Click + to add a deal</p>
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              stages={stages}
              onStageChange={onStageChange}
              onEdit={onEditDeal}
              onDelete={onDeleteDeal}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PipelineColumn;
