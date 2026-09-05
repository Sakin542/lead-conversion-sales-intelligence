import React from 'react';
import Card from '../common/Card';
import { aiInsightData } from '../../data/dashboardData';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

interface AIScoringInsightProps {
  insight?: {
    high_intent_count?: number;
    timeframe?: string;
    recommendation?: string;
  };
}

export const AIScoringInsight: React.FC<AIScoringInsightProps> = ({ insight }) => {
  const highIntentCount = insight?.high_intent_count ?? aiInsightData.highIntentUncontactedCount;
  const insightTimeframe = insight?.timeframe ?? aiInsightData.timeframe;
  const recommendation = insight?.recommendation ?? aiInsightData.recommendation;

  return (
    <Card className="relative overflow-hidden bg-[#171718] border-[#2A2A2E] p-6 sm:p-7 space-y-5 shadow-sm hover:border-[#FF7A00]/40 hover:shadow-lg hover:shadow-[#FF7A00]/10 transition-all duration-300 animate-fade-in">
      {/* Background Subtle AI Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="w-11 h-11 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] shrink-0">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20 shadow-sm">
                <Sparkles className="w-3 h-3 mr-1.5 text-[#FF7A00] animate-spin-slow" />
                AI Lead Scoring Insight
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-snug">
              You have <span className="text-[#FF7A00] font-bold">{highIntentCount} high-intent leads</span> that haven't been contacted in the last {insightTimeframe}.
            </h3>

            <p className="text-xs text-[#A1A1AA]">
              <strong className="text-white font-medium">Recommended Action:</strong> {recommendation}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Link to="/leads">
            <Button
              variant="ai"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="whitespace-nowrap px-4.5 py-2.5 min-h-[44px] rounded-xl font-bold text-sm shadow-md shadow-[#FF7A00]/20 hover:shadow-[#FF7A00]/40"
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
