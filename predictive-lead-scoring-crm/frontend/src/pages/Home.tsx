import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Activity,
  Kanban,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BellRing,
  Target,
  ShieldCheck,
  Layers,
  Clock,
  Check,
  X,
  LineChart,
} from 'lucide-react';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// FAQ Accordion Item Component
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-800/80 rounded-xl bg-slate-900/60 overflow-hidden transition-all shadow-2xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between text-slate-100 font-bold text-sm sm:text-base hover:bg-slate-900 transition-colors"
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500 shrink-0 ml-2" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/50">
          {answer}
        </div>
      )}
    </div>
  );
};

export const Home: React.FC = () => {
  // Hero Graph State
  const [graphTab, setGraphTab] = useState<'conversion' | 'model' | 'volume'>('conversion');
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('30d');

  // Chart datasets
  const chartData = {
    '30d': [
      { month: 'Week 1', rate: 42, score: '62%' },
      { month: 'Week 2', rate: 58, score: '74%' },
      { month: 'Week 3', rate: 75, score: '88%' },
      { month: 'Week 4', rate: 94, score: '95%' },
    ],
    '90d': [
      { month: 'Jan', rate: 35, score: '55%' },
      { month: 'Feb', rate: 52, score: '68%' },
      { month: 'Mar', rate: 88, score: '92%' },
      { month: 'Apr', rate: 94, score: '96%' },
    ],
    '1y': [
      { month: 'Q1', rate: 48, score: '64%' },
      { month: 'Q2', rate: 65, score: '78%' },
      { month: 'Q3', rate: 82, score: '89%' },
      { month: 'Q4', rate: 96, score: '97%' },
    ],
  };

  const currentChart = chartData[timeframe];

  // Interactive Bottom Simulator State
  const [emailOpens, setEmailOpens] = useState<number>(8);
  const [pageVisits, setPageVisits] = useState<number>(14);
  const [demoRequested, setDemoRequested] = useState<boolean>(true);
  const [industry, setIndustry] = useState<string>('SaaS');

  // Calculate dynamic score for bottom simulator
  const calculateScore = () => {
    let score = 20;
    score += Math.min(emailOpens * 4.5, 30);
    score += Math.min(pageVisits * 2.2, 30);
    if (demoRequested) score += 30;
    if (industry === 'SaaS' || industry === 'Finance') score += 10;
    return Math.min(Math.round(score), 99);
  };

  const calculatedScore = calculateScore();

  const getClassification = (score: number) => {
    if (score >= 80) return { label: 'HOT LEAD', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: '🔥' };
    if (score >= 50) return { label: 'WARM LEAD', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: '⚡' };
    return { label: 'COLD LEAD', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: '❄️' };
  };

  const classification = getClassification(calculatedScore);

  // Presets for bottom simulator
  const presets = [
    { name: 'Enterprise SaaS Lead', emailOpens: 12, pageVisits: 20, demoRequested: true, industry: 'SaaS' },
    { name: 'Financial Tech Lead', emailOpens: 7, pageVisits: 12, demoRequested: true, industry: 'Finance' },
    { name: 'E-commerce Lead', emailOpens: 4, pageVisits: 6, demoRequested: false, industry: 'E-commerce' },
    { name: 'Casual Blog Visitor', emailOpens: 1, pageVisits: 2, demoRequested: false, industry: 'Healthcare' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      <Navbar />

      {/* Ambient Dark Neon Glowing Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-cyan-900/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow"></div>
      <div className="absolute top-[800px] -right-20 w-96 h-96 bg-cyan-900/30 rounded-full blur-3xl pointer-events-none -z-10 animate-float"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-bold tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Next-Gen Machine Learning Lead Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-heading">
                Turn Your Leads Into <span className="gradient-text-animated">Opportunities</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Traditional CRMs force sales representatives to spend up to 67% of their workday guessing which prospects are genuine buyers. Our AI predictive lead scoring engine automatically evaluates behavioral intent, page visits, and email engagement to highlight hot leads ready for closing.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto min-w-[210px] min-h-[50px] px-8 py-3.5 text-base font-bold shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all hover:scale-[1.02]"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto min-w-[190px] min-h-[50px] px-8 py-3.5 text-base font-semibold text-slate-200 border-slate-800 bg-slate-900/80 hover:bg-slate-800 transition-all"
                  >
                    Sign In to CRM
                  </Button>
                </Link>
              </div>

              {/* Statistics Row */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">3.5x</p>
                  <p className="text-xs text-slate-400 font-medium">Conversion Increase</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">94.8%</p>
                  <p className="text-xs text-slate-400 font-medium">Scoring Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">60%</p>
                  <p className="text-xs text-slate-400 font-medium">Saves Rep Time</p>
                </div>
              </div>
            </div>

            {/* Right Hero Live Interactive AI Lead Intelligence Analytics Graph Component */}
            <div className="lg:col-span-5 flex justify-center animate-float">
              <div className="w-full max-w-md bg-slate-900/90 glass-card-dark rounded-2xl shadow-2xl border border-slate-800 p-5 sm:p-6 space-y-5 relative">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                      <LineChart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Predictive Lead Analytics</h4>
                      <p className="text-[10px] text-slate-400">Real-Time Conversion Graph</p>
                    </div>
                  </div>

                  {/* Timeframe Filter Buttons */}
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                    <button
                      onClick={() => setTimeframe('30d')}
                      className={`px-2 py-1 rounded-md transition-colors ${timeframe === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      30D
                    </button>
                    <button
                      onClick={() => setTimeframe('90d')}
                      className={`px-2 py-1 rounded-md transition-colors ${timeframe === '90d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      90D
                    </button>
                    <button
                      onClick={() => setTimeframe('1y')}
                      className={`px-2 py-1 rounded-md transition-colors ${timeframe === '1y' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-white'}`}
                    >
                      1Y
                    </button>
                  </div>
                </div>

                {/* Graph Category Selector */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-center">
                  <button
                    onClick={() => setGraphTab('conversion')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all truncate ${
                      graphTab === 'conversion'
                        ? 'bg-slate-900 text-indigo-400 border border-indigo-800/80 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Win Velocity
                  </button>
                  <button
                    onClick={() => setGraphTab('model')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all truncate ${
                      graphTab === 'model'
                        ? 'bg-slate-900 text-indigo-400 border border-indigo-800/80 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Model Precision
                  </button>
                  <button
                    onClick={() => setGraphTab('volume')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all truncate ${
                      graphTab === 'volume'
                        ? 'bg-slate-900 text-indigo-400 border border-indigo-800/80 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Lead Intent
                  </button>
                </div>

                {/* Interactive SVG Bar Chart Visualization */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Conversion Rate Trend</span>
                    <span className="text-emerald-400 font-heading flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" /> +3.5x Uplift
                    </span>
                  </div>

                  {/* Chart Graphic */}
                  <div className="h-32 flex items-end justify-between gap-3 pt-4 pb-1 border-b border-slate-800/80 px-2">
                    {currentChart.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-900 border border-indigo-500/50 text-[10px] font-extrabold text-indigo-300 px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                          {item.score}
                        </div>

                        {/* Animated Fill Bar */}
                        <div className="w-full bg-slate-900 h-24 rounded-t-md flex items-end overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 rounded-t-md transition-all duration-700 group-hover:from-indigo-500 group-hover:to-cyan-300 shadow-md shadow-indigo-500/20"
                            style={{ height: `${item.rate}%` }}
                          ></div>
                        </div>

                        <span className="text-[10px] font-semibold text-slate-400">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scored Leads</p>
                    <p className="text-sm sm:text-base font-black text-white font-heading">14,820</p>
                  </div>

                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                    <p className="text-sm sm:text-base font-black text-indigo-400 font-heading">94.8%</p>
                  </div>

                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline ARR</p>
                    <p className="text-sm sm:text-base font-black text-emerald-400 font-heading">$2.4M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 lg:py-20 bg-slate-900/60 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-700">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>The Challenge & Opportunity</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
                Why Static Lead Rules Fail in Modern B2B Sales
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Legacy CRM platforms rely on rigid, manual point rules (e.g., adding +5 points for an email click). These static rules fail to capture nuanced buyer intent, treat all activities equally, and quickly become outdated as customer journeys evolve.
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                <strong className="text-slate-200">PredictiveCRM replaces manual rulebooks with supervised machine learning.</strong> By combining historical deal outcomes with granular touchpoint tracking, our platform dynamically updates lead scores after every interaction—empowering representatives to strike while buyer interest is at its absolute peak.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-200">
                <div className="flex items-center space-x-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Supervised Machine Learning</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Real-Time Activity Triggers</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Automatic Sales Routing</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>3.5x Conversion Boost</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-black text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm text-white">Conversion Probability Impact</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">LIVE BENCHMARK</span>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Traditional Lead Scoring Response</span>
                    <span className="text-slate-500">18.4% Close Rate</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-700 h-2 rounded-full w-[18%]"></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-indigo-400">PredictiveCRM AI Scoring Response</span>
                    <span className="text-emerald-400">64.8% Close Rate</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-2.5 rounded-full w-[65%]"></div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800 relative z-10">
                Sales representatives who prioritize leads based on machine learning scoring close deals 3.2x faster while spending 60% less time on cold prospects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Tool Section */}
      <section id="demo" className="py-16 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Interactive Model Simulator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Test The AI Scoring Engine Live
            </h2>
            <p className="text-slate-400 text-base">
              Adjust behavioral touchpoints and company metadata below to observe how conversion probability score recalculates instantly.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-8">
            {/* Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Sample Lead Preset:</span>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setEmailOpens(preset.emailOpens);
                      setPageVisits(preset.pageVisits);
                      setDemoRequested(preset.demoRequested);
                      setIndustry(preset.industry);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-900 transition-all shadow-2xs"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls & Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Inputs */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Email Opens ({emailOpens})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={emailOpens}
                    onChange={(e) => setEmailOpens(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Website Page Visits ({pageVisits})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={pageVisits}
                    onChange={(e) => setPageVisits(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Target Industry Classification
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="SaaS">SaaS & Enterprise Tech</option>
                    <option value="Finance">Financial Services & Banking</option>
                    <option value="E-commerce">E-commerce & Retail</option>
                    <option value="Healthcare">Healthcare & Biotech</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={demoRequested}
                      onChange={(e) => setDemoRequested(e.target.checked)}
                      className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-900 accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-200">
                      Product Demo Requested (+30% intent boost)
                    </span>
                  </label>
                </div>
              </div>

              {/* Result Output Card */}
              <div className="p-6 bg-black text-white rounded-2xl border border-slate-800 shadow-xl text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-xl pointer-events-none"></div>

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">
                  AI Conversion Probability Output
                </p>
                <div className="text-5xl font-black text-indigo-400 relative z-10 font-heading">
                  {calculatedScore}%
                </div>
                <div className="inline-block relative z-10">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${classification.color}`}>
                    {classification.icon} {classification.label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto relative z-10">
                  {calculatedScore >= 80
                    ? 'High purchasing intent detected! Assign immediately to senior sales executives.'
                    : calculatedScore >= 50
                    ? 'Moderate intent. Schedule targeted email sequence & follow-up.'
                    : 'Low engagement signal. Keep in automated drip campaign.'}
                </p>

                <div className="pt-3 relative z-10">
                  <Link to="/login">
                    <Button variant="primary" size="sm" className="w-full justify-center font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none">
                      Score Your Real Leads Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Features Section (8 Feature Cards) */}
      <section id="features" className="py-16 lg:py-24 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Platform Features</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Comprehensive Sales Intelligence Capabilities
            </p>
            <p className="text-base text-slate-400">
              Everything your revenue team needs to target, score, and close high-value prospects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/80 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Predictive ML Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervised Machine Learning models (Logistic Regression, Random Forest, XGBoost) calculate accurate lead conversion probabilities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/80 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Omnichannel Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically aggregate email opens, page views, form submissions, and demo requests into a unified customer activity log.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Sales Pipeline Stages</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organize leads through customized sales stages (New, Contacted, Qualified, Proposal, Won) with live score tags.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/80 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Conversion Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor team performance, model precision/recall, pipeline velocity, and conversion drivers through real-time dashboards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/80 flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Real-Time Hot Lead Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get instant notifications when a cold lead exhibits sudden spikes in activity or passes the 80% conversion threshold.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Firmographic Enrichment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enrich lead records with company size, industry classification, source channels, and previous interaction history.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/80 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Automated Queue Workers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-performance background job processing ensures instant lead scoring updates without lagging the CRM interface.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:shadow-lg hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/80 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Enterprise CRM Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based access control, encrypted data storage, and strict API token authentication to keep customer data safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section: Legacy CRM vs Predictive CRM */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Comparison</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Legacy CRM vs. Predictive CRM
            </p>
            <p className="text-slate-400 text-base">
              See why high-velocity sales organizations are switching from static scoring rules to machine learning intelligence.
            </p>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 bg-black text-white p-4 font-bold text-xs sm:text-sm uppercase tracking-wider">
              <div className="col-span-4">Capability</div>
              <div className="col-span-4 text-slate-400">Traditional CRM</div>
              <div className="col-span-4 text-indigo-400">PredictiveCRM</div>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs sm:text-sm text-slate-300">
              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-4 font-semibold text-white">Scoring Mechanism</div>
                <div className="col-span-4 text-slate-400 flex items-center">
                  <X className="w-4 h-4 text-red-400 mr-1.5 shrink-0" /> Manual Point Addition
                </div>
                <div className="col-span-4 font-bold text-indigo-400 flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-1.5 shrink-0" /> Machine Learning Models
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center bg-slate-950/40">
                <div className="col-span-4 font-semibold text-white">Update Frequency</div>
                <div className="col-span-4 text-slate-400 flex items-center">
                  <Clock className="w-4 h-4 text-amber-400 mr-1.5 shrink-0" /> Batch Overnight
                </div>
                <div className="col-span-4 font-bold text-indigo-400 flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-1.5 shrink-0" /> Instant Real-Time
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-4 font-semibold text-white">Rep Time Saved</div>
                <div className="col-span-4 text-slate-400">Low (~10%)</div>
                <div className="col-span-4 font-bold text-emerald-400">High (Up to 60%)</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center bg-slate-950/40">
                <div className="col-span-4 font-semibold text-white">Prediction Accuracy</div>
                <div className="col-span-4 text-slate-400">Subjective & Static</div>
                <div className="col-span-4 font-bold text-indigo-400">94.8% Data-Validated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Three Steps To Accelerated Revenue
            </p>
            <p className="text-base text-slate-400">
              How PredictiveCRM seamlessly transforms raw prospect interactions into closed deals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <span className="text-5xl font-black text-indigo-500/20 font-heading">01</span>
              <h3 className="text-xl font-bold text-white font-heading">Capture Leads & Touchpoints</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automatically capture leads from web forms, email outreach campaigns, and integrations into one centralized database.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <span className="text-5xl font-black text-indigo-500/20 font-heading">02</span>
              <h3 className="text-xl font-bold text-white font-heading">Analyze Behavioral Intent</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Machine learning classification algorithms continuously analyze interaction frequency, email clicks, and page visits.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <span className="text-5xl font-black text-indigo-500/20 font-heading">03</span>
              <h3 className="text-xl font-bold text-white font-heading">Prioritize Hot Prospects</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Empower your sales representatives to engage with high-converting Hot Leads first, dramatically increasing win rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Knowledge Base</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How does AI Predictive Lead Scoring work?"
              answer="Our system analyzes behavioral touchpoints—such as email opens, page views, demo requests, and company firmographics—using trained classification algorithms to calculate a real-time conversion probability percentage."
            />
            <FAQItem
              question="Which Machine Learning algorithms are evaluated?"
              answer="PredictiveCRM supports Logistic Regression for interpretable baseline scoring, Random Forest for non-linear feature interactions, and XGBoost for state-of-the-art gradient boosting performance."
            />
            <FAQItem
              question="Can I connect this frontend with our backend API?"
              answer="Yes! The frontend is decoupled and ready to connect to Laravel, REST APIs, FastAPI, or Node.js backends seamlessly."
            />
            <FAQItem
              question="What score constitutes a 'Hot Lead'?"
              answer="Leads with a conversion probability score of 80% or higher are classified as Hot Leads and flagged for immediate representative outreach."
            />
            <FAQItem
              question="How often are lead scores recalculated?"
              answer="Lead scores are recalculated automatically in real time whenever a new activity (such as an email open or page visit) is detected."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-950 text-white relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
              Ready to prioritize your best leads?
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg max-w-xl mx-auto">
              Start closing more deals faster with data-backed lead scoring intelligence.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                className="min-w-[220px] min-h-[52px] px-9 py-4 text-base font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-none shadow-2xl rounded-xl transition-all hover:scale-[1.02]"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
