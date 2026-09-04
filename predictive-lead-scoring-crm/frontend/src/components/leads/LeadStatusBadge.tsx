import React from 'react';
import { LeadStatus } from '../../types/lead';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const styles: Record<LeadStatus, { bg: string; text: string; border: string; label: string }> = {
    new: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-300',
      border: 'border-slate-500/20',
      label: 'New Lead',
    },
    contacted: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      label: 'Contacted',
    },
    qualified: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      label: 'Qualified',
    },
    proposal: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      label: 'Proposal',
    },
    negotiation: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      label: 'Negotiation',
    },
    won: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      label: 'Won',
    },
    lost: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      label: 'Lost',
    },
  };

  const style = styles[status] || styles.new;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')} animate-pulse`} />
      {style.label}
    </span>
  );
};

export default LeadStatusBadge;

