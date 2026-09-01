import React from 'react';
import { Eye, Edit, Trash2, Building } from 'lucide-react';
import { Lead } from '../../types/lead';
import LeadStatusBadge from './LeadStatusBadge';

interface LeadTableProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatCurrency = (val?: number | string | null) => {
    if (val === null || val === undefined || val === '') return '$0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num)
      ? '$0.00'
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(num);
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className="overflow-x-auto custom-scrollbar border border-slate-800/80 rounded-xl bg-slate-900/60">
      <table className="w-full text-left text-xs text-slate-300">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider bg-slate-950/40">
            <th className="py-3.5 px-4">Lead</th>
            <th className="py-3.5 px-4">Company</th>
            <th className="py-3.5 px-4">Source</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Est. Value</th>
            <th className="py-3.5 px-4">Created</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors group">
              {/* Lead Name & Email */}
              <td className="py-3.5 px-4 font-medium text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 group-hover:border-indigo-500/50 transition-colors">
                    {lead.first_name.charAt(0)}
                    {lead.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-[11px] text-slate-400">{lead.email}</p>
                  </div>
                </div>
              </td>

              {/* Company */}
              <td className="py-3.5 px-4 font-medium text-slate-200 whitespace-nowrap">
                <div className="flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lead.company}</span>
                </div>
              </td>

              {/* Source */}
              <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 font-medium border border-slate-700/50">
                  {lead.source || 'Direct'}
                </span>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <LeadStatusBadge status={lead.status} />
              </td>

              {/* Estimated Value */}
              <td className="py-3.5 px-4 text-emerald-400 font-bold whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <span>{formatCurrency(lead.estimated_value)}</span>
                </div>
              </td>

              {/* Created Date */}
              <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                {formatDate(lead.created_at)}
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(lead)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                    title="View Lead Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEdit(lead)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                    title="Edit Lead"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(lead)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
