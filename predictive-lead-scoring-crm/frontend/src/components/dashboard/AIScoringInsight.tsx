import React from 'react';
import Card from '../common/Card';
import { aiInsightData } from '../../data/dashboardData';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

export const AIScoringInsight: React.FC = () => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border-indigo-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
            <Bot className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                AI Lead Scoring Insight
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              You have <span className="text-indigo-400 underline decoration-indigo-500/50 underline-offset-4 font-extrabold">{aiInsightData.highIntentUncontactedCount} high-intent leads</span> that haven't been contacted in the last {aiInsightData.timeframe}.
            </h3>

            <p className="text-xs text-slate-300">
              <strong className="text-indigo-300 font-semibold">Recommended Action:</strong> {aiInsightData.recommendation}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Link to="/leads">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none whitespace-nowrap text-white shrink-0"
            >
              View Hot Leads
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default AIScoringInsight;
