import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Mail, ArrowRight, CheckCircle2, X, FileText, Lock, Building } from 'lucide-react';
import Button from '../common/Button';

interface FooterProps {
  variant?: 'default' | 'auth';
  className?: string;
}

interface ModalContent {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default', className = '' }) => {
  const isAuth = variant === 'auth';
  const location = useLocation();
  const navigate = useNavigate();

  // Newsletter State
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // Active Modal Content State
  const [activeModal, setActiveModal] = useState<ModalContent | null>(null);

  const footerBgClass = isAuth
    ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-t border-indigo-900/60 shadow-2xl text-slate-300'
    : 'bg-slate-950 border-t border-slate-800/80 text-slate-400';

  // Smooth Navigation Handler
  const handleNavClick = (anchorId: string) => {
    if (location.pathname !== '/') {
      navigate(`/${anchorId}`);
      setTimeout(() => {
        const element = document.querySelector(anchorId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const element = document.querySelector(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Newsletter Submit Handler
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setNewsletterError('Please enter a valid email address');
      return;
    }
    setNewsletterError('');
    setNewsletterSubscribed(true);
  };

  // Modal Openers
  const openPrivacyModal = () => {
    setActiveModal({
      title: 'Privacy Policy',
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            At <strong>PredictiveCRM</strong>, we prioritize the protection and confidentiality of your customer data. This policy outlines how we handle data collected across our platforms.
          </p>
          <h4 className="font-bold text-white text-sm">1. Data Collection</h4>
          <p>
            We collect behavioral signals (email interactions, website touchpoints, and firmographic metadata) solely for generating predictive lead conversion scores for your organization.
          </p>
          <h4 className="font-bold text-white text-sm">2. Data Security & Encryption</h4>
          <p>
            All lead activity logs and customer details are encrypted both in transit (TLS 1.3) and at rest (AES-256). We never resell or share customer dataset records with third parties.
          </p>
          <h4 className="font-bold text-white text-sm">3. Compliance</h4>
          <p>
            Our infrastructure complies with GDPR, CCPA, and SOC-2 Type II standards. Users can request full data export or deletion at any time.
          </p>
        </div>
      ),
    });
  };

  const openTermsModal = () => {
    setActiveModal({
      title: 'Terms of Service',
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Welcome to <strong>PredictiveCRM</strong>. By accessing our platform, services, or APIs, you agree to comply with the following terms.
          </p>
          <h4 className="font-bold text-white text-sm">1. Subscription & Account Access</h4>
          <p>
            Accounts are provisioned for authorized enterprise revenue personnel. Users must maintain credential confidentiality.
          </p>
          <h4 className="font-bold text-white text-sm">2. Permitted Use</h4>
          <p>
            The Machine Learning lead scoring engine is provided to prioritize legitimate sales prospects. Automated abuse or scraping is strictly prohibited.
          </p>
          <h4 className="font-bold text-white text-sm">3. Service Level Agreement (SLA)</h4>
          <p>
            We guarantee 99.99% operational uptime for our real-time scoring queue workers.
          </p>
        </div>
      ),
    });
  };

  const openSecurityModal = () => {
    setActiveModal({
      title: 'Security & Compliance Standards',
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center space-x-3 text-emerald-300 font-semibold">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <span>SOC-2 Type II Certified & ISO 27001 Compliant</span>
          </div>
          <h4 className="font-bold text-white text-sm">Enterprise Infrastructure Protection</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>End-to-End TLS 1.3 encryption across all API gateways</li>
            <li>Role-Based Access Control (RBAC) with Granular Token Authentication</li>
            <li>Continuous Automated Vulnerability Scanning & Penetration Audits</li>
            <li>Isolated Multi-Tenant Database Architecture</li>
          </ul>
        </div>
      ),
    });
  };

  const openSolutionModal = (solutionTitle: string, description: string, benefits: string[]) => {
    setActiveModal({
      title: solutionTitle,
      icon: <Building className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>{description}</p>
          <h4 className="font-bold text-white text-sm">Key Capabilities & Benefits</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            {benefits.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ),
    });
  };

  return (
    <footer className={`${footerBgClass} relative overflow-hidden transition-colors duration-300 ${className}`}>
      {/* Background Animated Gradient Glow */}
      <div
        className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-glow ${
          isAuth ? 'bg-indigo-600/20' : 'bg-indigo-900/20'
        }`}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Newsletter Column */}
          <div className="md:col-span-5 space-y-6">
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Empowering high-velocity revenue teams with Machine Learning lead scoring, intent tracking, and automated sales pipeline intelligence.
            </p>

            {/* Functional Email Newsletter Box */}
            <div className="space-y-2 max-w-sm">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Stay updated with AI Sales Insights
              </label>

              {newsletterSubscribed ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg flex items-center space-x-2.5 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subscribed! Welcome to AI Sales Insights.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="enter your email..."
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (newsletterError) setNewsletterError('');
                      }}
                      className="w-full bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-400"
                    />
                  </div>
                  <Button variant="primary" size="sm" type="submit" className="shrink-0 bg-indigo-600 hover:bg-indigo-500 border-none font-bold">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
              {newsletterError && <p className="text-xs text-red-400 font-medium">{newsletterError}</p>}
            </div>
          </div>

          {/* Product Column */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNavClick('#demo')} className="hover:text-indigo-400 transition-colors text-left">
                  AI Lead Simulator
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#features')} className="hover:text-indigo-400 transition-colors text-left">
                  Feature Suite
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#how-it-works')} className="hover:text-indigo-400 transition-colors text-left">
                  Workflow Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#faq')} className="hover:text-indigo-400 transition-colors text-left">
                  FAQ & Docs
                </button>
              </li>
            </ul>
          </div>

          {/* Solution Column */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Solutions
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => openSolutionModal('For Sales Leaders', 'Automate lead prioritization and empower your account executives to focus exclusively on prospects with high purchase intent.', ['3.5x higher conversion rates', '60% time saved on cold calls', 'Real-time hot lead alerts'])}
                  className="text-slate-300 hover:text-indigo-400 transition-colors text-left"
                >
                  For Sales Leaders
                </button>
              </li>
              <li>
                <button
                  onClick={() => openSolutionModal('For Growth Marketing', 'Identify which acquisition channels, campaigns, and content touchpoints generate genuine high-converting buyers.', ['Omnichannel campaign tracking', 'Attribution analytics dashboard', 'Lead intent heatmaps'])}
                  className="text-slate-300 hover:text-indigo-400 transition-colors text-left"
                >
                  For Growth Marketing
                </button>
              </li>
              <li>
                <button
                  onClick={() => openSolutionModal('Enterprise CRM API', 'Seamless RESTful API integration for custom CRM platforms, data warehouses, and queue workers.', ['Sub-100ms API response latency', 'Webhook activity notifications', 'SDK support for PHP, Python & TypeScript'])}
                  className="text-slate-300 hover:text-indigo-400 transition-colors text-left"
                >
                  Enterprise CRM API
                </button>
              </li>
              <li>
                <button
                  onClick={openSecurityModal}
                  className="text-slate-300 hover:text-indigo-400 transition-colors text-left"
                >
                  Security Whitepaper
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Auth Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Access Platform
            </h3>
            <div className="space-y-2 pt-1">
              <Link to="/login" className="block text-sm text-slate-300 hover:text-white transition-colors">
                Sign In to CRM Dashboard
              </Link>
            </div>

            <div className="pt-4 space-y-2 border-t border-slate-800 text-xs">
              <button onClick={openSecurityModal} className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise SOC-2 Compliant</span>
              </button>
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>99.99% Uptime Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Predictive Lead Scoring & CRM. All rights reserved.</p>
          <div className="flex space-x-6">
            <button onClick={openPrivacyModal} className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </button>
            <button onClick={openTermsModal} className="hover:text-slate-200 transition-colors">
              Terms of Service
            </button>
            <button onClick={openSecurityModal} className="hover:text-slate-200 transition-colors">
              Security
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modal Popup */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                {activeModal.icon}
                <h3 className="text-base font-bold text-white">{activeModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {activeModal.content}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
