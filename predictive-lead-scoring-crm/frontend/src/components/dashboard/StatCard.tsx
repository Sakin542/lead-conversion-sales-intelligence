import React from 'react';
import { Users, Flame, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../common/Card';
import { KPIMetric } from '../../data/dashboardData';

interface StatCardProps {
  metric: KPIMetric;
}

export const StatCard: React.FC<StatCardProps> = ({ metric }) => {
  const getIcon = () => {
    switch (metric.type) {
      case 'total':
        return <Users className="w-4.5 h-4.5 text-zinc-300" />;
      case 'hot':
        return <Flame className="w-4.5 h-4.5 text-rose-400" />;
      case 'conversion':
        return <TrendingUp className="w-4.5 h-4.5 text-[#FF7A00]" />;
      case 'pipeline':
        return <DollarSign className="w-4.5 h-4.5 text-[#FF7A00]" />;
      default:
        return <Users className="w-4.5 h-4.5 text-[#A1A1AA]" />;
    }
  };

  const getIconBg = () => {
    switch (metric.type) {
      case 'total':
        return 'bg-[#1C1C1E] border-[#2A2A2E]';
      case 'hot':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'conversion':
        return 'bg-[#FF7A00]/10 border-[#FF7A00]/20';
      case 'pipeline':
        return 'bg-[#FF7A00]/10 border-[#FF7A00]/20';
      default:
        return 'bg-[#1C1C1E] border-[#2A2A2E]';
    }
  };

  return (
    <Card className="relative overflow-hidden bg-[#171718] border-[#2A2A2E] p-5 hover:border-[#383838] hover:shadow-xl hover:shadow-[#FF7A00]/10 hover:-translate-y-1 transition-all duration-300 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{metric.title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{metric.value}</h3>
        </div>

        <div className={`p-2.5 rounded-lg border ${getIconBg()} shrink-0 transition-transform duration-300 hover:scale-110`}>
          {getIcon()}
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-2 text-xs">
        <span
          className={`inline-flex items-center font-medium px-2 py-0.5 rounded-full border transition-transform duration-200 hover:scale-105 ${
            metric.isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {metric.isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
          )}
          {metric.change}
        </span>
        <span className="text-zinc-500 font-normal">{metric.comparison}</span>
      </div>
    </Card>
  );
};

export default StatCard;
