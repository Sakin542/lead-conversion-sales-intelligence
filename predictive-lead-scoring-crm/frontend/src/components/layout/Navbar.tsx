import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import Button from '../common/Button';
import AnimatedLogo from '../common/AnimatedLogo';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (anchorId: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/${anchorId}`;
      return;
    }
    const element = document.querySelector(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Animated Logo */}
          <div className="flex items-center space-x-4">
            <AnimatedLogo size="md" />

            {/* System Live Pulsing Status */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-xs font-semibold text-emerald-400 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>AI Engine v2.4 Active</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/'
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-300 hover:text-indigo-400'
              }`}
            >
              Home
            </Link>

            <button
              onClick={() => handleNavClick('#demo')}
              className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors flex items-center space-x-1.5"
            >
              <span>Live Simulator</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-full shadow-2xs animate-pulse">
                HOT
              </span>
            </button>

            <button
              onClick={() => handleNavClick('#features')}
              className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
            >
              Features
            </button>

            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
            >
              How It Works
            </button>

            <button
              onClick={() => handleNavClick('#faq')}
              className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
            >
              FAQ
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/contact-sales">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold text-indigo-300 border-indigo-800/80 hover:bg-indigo-950/60"
              >
                Contact Sales
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="primary"
                size="sm"
                className="font-semibold shadow-md shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/60 rounded-lg border border-emerald-800/80 text-xs font-semibold text-emerald-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI Lead Scoring Engine Active</span>
            </div>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/' ? 'bg-indigo-950/80 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Home
            </Link>
            <button
              onClick={() => handleNavClick('#demo')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Live Simulator</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">Interactive</span>
            </button>
            <button
              onClick={() => handleNavClick('#features')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('#faq')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              FAQ
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
              <Button variant="primary" className="w-full justify-center font-semibold shadow-md shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
