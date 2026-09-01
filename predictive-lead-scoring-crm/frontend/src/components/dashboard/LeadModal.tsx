import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Lead } from '../../data/dashboardData';
import { Sparkles, Mail, Building, Flame, ExternalLink } from 'lucide-react';

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({ lead, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!lead) return null;

  const scoreFactors = [
    { name: 'ICP Profile Match', weight: '+35%', detail: 'Matches Enterprise Tech ICP criteria (100-500 employees)' },
    { name: 'Digital Engagement', weight: '+30%', detail: '5 email opens, visited pricing page 3x in last 24h' },
    { name: 'High Intent Signals', weight: '+20%', detail: 'Downloaded Security & Compliance Whitepaper' },
    { name: 'Buying Stage Fit', weight: '+9%', detail: 'Actively evaluating vendor proposals' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Lead Intelligence: ${lead.name}`}>
      <div className="space-y-6 text-slate-200">
        {/* Header Lead Profile Card */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-extrabold text-lg flex items-center justify-center">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">{lead.name}</h3>
              <p className="text-xs text-slate-400 flex items-center mt-0.5">
                <Building className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {lead.company}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-md">
              <Flame className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              {lead.score}% AI Score
            </span>
            <span className="block text-[11px] text-slate-400 mt-1 font-medium">Stage: {lead.stage}</span>
          </div>
        </div>

        {/* AI Propensity Factors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              AI Conversion Score Factors
            </h4>
            <span className="text-[11px] text-emerald-400 font-bold">Predicted Conversion: High</span>
          </div>

          <div className="space-y-2">
            {scoreFactors.map((factor) => (
              <div key={factor.name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">{factor.name}</span>
                  <p className="text-[11px] text-slate-400">{factor.detail}</p>
                </div>
                <span className="font-extrabold font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  {factor.weight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info & Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Email Address</span>
            <p className="font-semibold text-slate-200 truncate">{lead.email}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Account Owner</span>
            <p className="font-semibold text-slate-200">{lead.owner}</p>
          </div>
        </div>

        {/* Outreach Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              navigate('/leads');
            }}
            className="text-xs font-bold border-slate-700 text-slate-300"
          >
            All Leads
          </Button>

          <div className="flex items-center space-x-2">
            <a
              href={`mailto:${lead.email}?subject=Sales Inquiry - ${lead.company}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Mail className="w-3.5 h-3.5" />}
                className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none text-white"
              >
                Send Outreach Email
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LeadModal;
