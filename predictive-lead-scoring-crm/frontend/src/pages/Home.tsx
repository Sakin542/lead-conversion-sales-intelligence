import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Activity,
  Kanban,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
    <div className="border border-[#2A2A2E] rounded-xl bg-[#171718] overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-semibold text-sm sm:text-base hover:bg-[#1C1C1E] transition-colors"
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#FF7A00] shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-500 shrink-0 ml-2" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-[#2A2A2E] bg-[#101011]">
          {answer}
        </div>
      )}
    </div>
  );
};

export const Home: React.FC = () => {
  // Interactive Bottom Simulator State
  const [emailOpens, setEmailOpens] = useState<number>(8);
  const [pageVisits, setPageVisits] = useState<number>(14);
  const [demoRequested, setDemoRequested] = useState<boolean>(true);
  const [industry] = useState<string>('SaaS');

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
    if (score >= 80) return { label: 'HOT LEAD', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    if (score >= 50) return { label: 'WARM LEAD', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: 'COLD LEAD', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  };

  const classification = getClassification(calculatedScore);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white relative overflow-hidden">
      <Navbar />

      {/* Subtle Ambient Background Glow Orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#FF7A00]/15 via-[#FF8C1A]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute top-96 -left-32 w-[350px] h-[350px] bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-blob"></div>
      <div className="absolute bottom-48 -right-32 w-[400px] h-[400px] bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16 lg:pb-24 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#101011] border border-[#222225] text-zinc-300 text-xs font-medium tracking-wide shadow-sm hover:border-[#FF7A00]/40 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7A00] animate-pulse" />
                <span className="gradient-text-animated font-medium">AI-Powered Lead Conversion & Sales Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.12]">
                Turn Your Leads Into <span className="gradient-text-ai text-shadow-glow">Smarter Sales Decisions</span>
              </h1>

              <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Empower your sales reps to prioritize high-value prospects. Our machine learning lead scoring engine analyzes behavioral intent, website activity, and email engagement to predict conversion probability with precision.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link to="/contact-sales" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto min-w-[180px]"
                  >
                    Sign In to CRM
                  </Button>
                </Link>
              </div>

              {/* Statistics Row */}
              <div className="pt-6 border-t border-[#222225] grid grid-cols-3 gap-4 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                <div className="hover:scale-105 transition-transform">
                  <p className="text-2xl sm:text-3xl font-bold text-white">3.5x</p>
                  <p className="text-xs text-[#A1A1AA] font-normal">Conversion Increase</p>
                </div>
                <div className="hover:scale-105 transition-transform">
                  <p className="text-2xl sm:text-3xl font-bold text-white">94.8%</p>
                  <p className="text-xs text-[#A1A1AA] font-normal">Scoring Accuracy</p>
                </div>
                <div className="hover:scale-105 transition-transform">
                  <p className="text-2xl sm:text-3xl font-bold text-white">60%</p>
                  <p className="text-xs text-[#A1A1AA] font-normal">Time Saved per Rep</p>
                </div>
              </div>
            </div>

            {/* Right Hero Premium AI Lead Score Visualization Box */}
            <div className="lg:col-span-5 flex justify-center animate-scale-in">
              <div className="w-full max-w-md bg-[#171718] rounded-xl shadow-2xl border border-[#2A2A2E] p-6 space-y-5 relative hover:shadow-[#FF7A00]/10 hover:border-[#FF7A00]/50 transition-all duration-300">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">AI CONVERSION SCORE</h4>
                      <p className="text-[10px] text-[#A1A1AA]">Predictive Intent Analysis</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    HOT LEAD
                  </span>
                </div>

                {/* Score Circle & Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#A1A1AA] font-medium">Conversion Probability</span>
                    <span className="text-3xl font-bold text-white tracking-tight">92%</span>
                  </div>

                  <div className="w-full bg-[#111113] rounded-full h-3 p-0.5 border border-[#2A2A2E] overflow-hidden">
                    <div className="bg-gradient-to-r from-[#FF7A00] to-[#FF8C1A] h-full rounded-full w-[92%] transition-all duration-1000 shadow-sm"></div>
                  </div>
                </div>

                {/* AI Insights List */}
                <div className="space-y-2 pt-2 border-t border-[#222222]">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">AI Key Signals</p>
                  <div className="space-y-2 text-xs text-zinc-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>High website engagement (18 page visits)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Recent activity (Active 2 hours ago)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Demo requested & 2 meetings completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Decision maker job title (VP of Sales)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section id="features" className="py-16 lg:py-24 bg-[#0B0B0D] border-y border-[#2A2A2E] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20">
              Enterprise Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything Needed to Scale Sales Intelligence
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Seamlessly unify intent signals, automated routing, and machine learning scoring into one minimal workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-6 space-y-4 hover:border-[#FF7A00]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">ML Conversion Scoring</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Supervised machine learning algorithms (Logistic Regression, Random Forest, XGBoost) evaluate intent signals to assign probabilities.
              </p>
            </div>

            <div className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-6 space-y-4 hover:border-[#FF7A00]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Real-Time Activity Tracking</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Logs email opens, click-throughs, page visits, and demo submissions instantly updating lead scores in real-time.
              </p>
            </div>

            <div className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-6 space-y-4 hover:border-[#FF7A00]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Visual Pipeline Management</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drag-and-drop Kanban deal pipeline with automatic probability metrics for deal stage progression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="demo" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-[#FF7A00] uppercase tracking-wider">Live AI Scoring Simulator</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Test How AI Scores Prospect Intent</h2>
            <p className="text-xs sm:text-sm text-zinc-400">Adjust the activity inputs below to observe how the predictive score recalculates.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-zinc-300">Email Opens:</span>
                    <span className="text-white font-bold">{emailOpens} opens</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={emailOpens}
                    onChange={(e) => setEmailOpens(Number(e.target.value))}
                    className="w-full accent-[#FF7A00] bg-[#111113] h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-zinc-300">Page Visits:</span>
                    <span className="text-white font-bold">{pageVisits} visits</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={pageVisits}
                    onChange={(e) => setPageVisits(Number(e.target.value))}
                    className="w-full accent-[#FF7A00] bg-[#111113] h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2E]">
                  <span className="text-xs font-medium text-zinc-300">Demo Request Submitted:</span>
                  <button
                    onClick={() => setDemoRequested(!demoRequested)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      demoRequested
                        ? 'bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/30'
                        : 'bg-[#111113] text-zinc-400 border-[#2A2A2E]'
                    }`}
                  >
                    {demoRequested ? 'Yes (Submitted)' : 'No'}
                  </button>
                </div>
              </div>
            </div>

            {/* Score Result Card */}
            <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#222222] rounded-xl p-6 text-center space-y-4">
              <span className="text-xs text-zinc-400 font-medium">Calculated Conversion Probability</span>
              <div className="text-5xl font-bold text-white tracking-tight">{calculatedScore}%</div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${classification.color}`}>
                  {classification.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-zinc-400">Everything you need to know about the AI lead scoring system.</p>
        </div>

        <div className="space-y-3">
          <FAQItem
            question="How does the AI calculate conversion probability?"
            answer="The system analyzes historical CRM conversion outcomes alongside behavioral activities (email opens, clicks, demo requests) and firmographics (industry, company size) using supervised classification algorithms."
          />
          <FAQItem
            question="Can we customize lead temperature thresholds?"
            answer="Yes! By default, score >= 80% is classified as HOT, 50-79% as WARM, and < 50% as COLD. These thresholds can be adjusted in Manager Settings."
          />
          <FAQItem
            question="Does it integrate with existing sales stacks?"
            answer="Our platform provides RESTful API endpoints and webhooks for seamless synchronization with external email providers and CRM infrastructure."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
