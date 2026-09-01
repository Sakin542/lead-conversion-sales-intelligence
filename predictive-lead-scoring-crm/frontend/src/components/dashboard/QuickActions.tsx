import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import ImportLeadsModal from './ImportLeadsModal';
import { UserPlus, Briefcase, Upload, GitCommitHorizontal, Zap } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <>
      <Card className="bg-slate-900/60 border-slate-800/80 p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4 text-indigo-400" />}
            onClick={() => navigate('/leads/new')}
            className="justify-start text-xs font-bold bg-slate-950/80 border-slate-800 hover:bg-slate-800 text-slate-200"
          >
            Add Lead
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Briefcase className="w-4 h-4 text-emerald-400" />}
            onClick={() => navigate('/pipeline')}
            className="justify-start text-xs font-bold bg-slate-950/80 border-slate-800 hover:bg-slate-800 text-slate-200"
          >
            Create Deal
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="w-4 h-4 text-purple-400" />}
            onClick={() => setShowImportModal(true)}
            className="justify-start text-xs font-bold bg-slate-950/80 border-slate-800 hover:bg-slate-800 text-slate-200"
          >
            Import Leads
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<GitCommitHorizontal className="w-4 h-4 text-blue-400" />}
            onClick={() => navigate('/pipeline')}
            className="justify-start text-xs font-bold bg-slate-950/80 border-slate-800 hover:bg-slate-800 text-slate-200"
          >
            View Pipeline
          </Button>
        </div>
      </Card>

      {/* CSV Import Leads Modal */}
      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </>
  );
};

export default QuickActions;

