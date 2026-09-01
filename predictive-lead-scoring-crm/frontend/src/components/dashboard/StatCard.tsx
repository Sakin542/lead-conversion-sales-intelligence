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
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'hot':
        return <Flame className="w-5 h-5 text-emerald-400" />;
      case 'conversion':
        return <TrendingUp className="w-5 h-5 text-indigo-400" />;
      case 'pipeline':
        return <DollarSign className="w-5 h-5 text-purple-400" />;
      default:
        return <Users className="w-5 h-5 text-slate-400" />;
    }
  };

  const getIconBg = () => {
    switch (metric.type) {
      case 'total':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'hot':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'conversion':
        return 'bg-indigo-500/10 border-indigo-500/20';
      case 'pipeline':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <Card className="relative overflow-hidden bg-slate-900/60 border-slate-800/80 p-5 hover:border-slate-700/80 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wide">{metric.title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{metric.value}</h3>
        </div>

        <div className={`p-2.5 rounded-xl border ${getIconBg()} shrink-0`}>
          {getIcon()}
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-2 text-xs">
        <span
          className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
            metric.isPositive
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
              : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
          }`}
        >
          {metric.isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
          )}
          {metric.change}
        </span>
        <span className="text-slate-400 font-medium">{metric.comparison}</span>
      </div>
    </Card>
  );
};

export default StatCard;

