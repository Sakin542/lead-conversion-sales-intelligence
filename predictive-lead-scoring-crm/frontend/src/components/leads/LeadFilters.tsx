import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sourceFilter: string;
  onSourceChange: (source: string) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Sources' },
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Event', label: 'Event' },
  { value: 'Other', label: 'Other' },
];

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  onReset,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-[#111111] border border-[#222222] rounded-xl shadow-md">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, or company..."
          className="w-full pl-10 pr-4 py-2.5 min-h-[42px] bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-zinc-400 hidden sm:inline-block shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3.5 py-2.5 min-h-[42px] bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#111111] text-zinc-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => onSourceChange(e.target.value)}
          className="px-3.5 py-2.5 min-h-[42px] bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111111] text-zinc-200">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        {(search || statusFilter || sourceFilter) && (
          <button
            onClick={onReset}
            className="px-3.5 py-2.5 min-h-[42px] rounded-xl bg-[#151515] text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-all flex items-center space-x-1.5 border border-[#222222]"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadFilters;
