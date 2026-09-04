import React from 'react';
import { Eye, Edit, Trash2, Building } from 'lucide-react';
import { Lead } from '../../types/lead';
import LeadStatusBadge from './LeadStatusBadge';

interface LeadTableProps {
  leads: Lead[];
  selectedLeadIds?: number[];
  onToggleSelect?: (id: number) => void;
  onSelectAll?: () => void;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedLeadIds = [],
  onToggleSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
}) => {
  const allSelected = leads.length > 0 && selectedLeadIds.length === leads.length;

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
    <div className="w-full min-w-0 overflow-x-auto custom-scrollbar border border-[#222222] rounded-xl bg-[#0A0A0A]">
      <table className="w-full min-w-[750px] text-left text-xs text-zinc-300">
        <thead>
          <tr className="border-b border-[#222222] text-zinc-400 font-medium uppercase text-[11px] tracking-wider bg-[#111111]">
            {onToggleSelect && (
              <th className="py-3.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-zinc-700 bg-zinc-900 accent-purple-500 cursor-pointer"
                />
              </th>
            )}
            <th className="py-3.5 px-4">Lead</th>
            <th className="py-3.5 px-4">Company</th>
            <th className="py-3.5 px-4">Source</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Est. Value</th>
            <th className="py-3.5 px-4">Created</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#222222]">
          {leads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);
            return (
              <tr key={lead.id} className={`hover:bg-[#151515] transition-colors group ${isSelected ? 'bg-purple-950/20' : ''}`}>
                {onToggleSelect && (
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-zinc-700 bg-zinc-900 accent-purple-500 cursor-pointer"
                    />
                  </td>
                )}
                {/* Lead Name & Email */}
              <td className="py-3.5 px-4 font-medium text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#151515] border border-[#222222] text-purple-400 font-bold flex items-center justify-center text-xs shrink-0 group-hover:border-purple-500/40 transition-colors">
                    {lead.first_name.charAt(0)}
                    {lead.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-[11px] text-zinc-400">{lead.email}</p>
                  </div>
                </div>
              </td>

              {/* Company */}
              <td className="py-3.5 px-4 font-medium text-zinc-200 whitespace-nowrap">
                <div className="flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{lead.company}</span>
                </div>
              </td>

              {/* Source */}
              <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                <span className="px-2 py-0.5 rounded bg-[#151515] text-[11px] text-zinc-300 font-medium border border-[#222222]">
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
              <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                {formatDate(lead.created_at)}
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(lead)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-400 hover:bg-[#151515] transition-colors"
                    title="View Lead Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEdit(lead)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-[#151515] transition-colors"
                    title="Edit Lead"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(lead)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-[#151515] transition-colors"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
