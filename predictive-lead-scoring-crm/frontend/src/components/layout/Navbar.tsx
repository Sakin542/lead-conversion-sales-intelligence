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
    <nav className="sticky top-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-[#222225] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & System Badge */}
          <div className="flex items-center space-x-4">
            <AnimatedLogo size="md" />

            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#101011] border border-[#222225] text-xs font-medium text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A00]"></span>
              </span>
              <span>AI Engine Active</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </Link>

            <button
              onClick={() => handleNavClick('#demo')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center space-x-1.5"
            >
              <span>Live Simulator</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                HOT
              </span>
            </button>

            <button
              onClick={() => handleNavClick('#features')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </button>

            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              How It Works
            </button>

            <button
              onClick={() => handleNavClick('#faq')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              FAQ
            </button>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/contact-sales">
              <Button
                variant="outline"
                size="sm"
                className="text-zinc-300 border-[#222222] hover:bg-[#151515]"
              >
                Contact Sales
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="primary"
                size="sm"
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
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#111111] focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-[#222222] px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 bg-[#111111] rounded-lg border border-[#222222] text-xs font-medium text-zinc-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
              <span>AI Lead Scoring Engine Active</span>
            </div>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'bg-[#151515] text-white' : 'text-zinc-400 hover:bg-[#111111]'
              }`}
            >
              Home
            </Link>
            <button
              onClick={() => handleNavClick('#demo')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#111111] flex items-center justify-between"
            >
              <span>Live Simulator</span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded">Interactive</span>
            </button>
            <button
              onClick={() => handleNavClick('#features')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#111111]"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#111111]"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('#faq')}
              className="text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#111111]"
            >
              FAQ
            </button>
          </div>

          <div className="pt-3 border-t border-[#222222] flex flex-col space-y-2">
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
              <Button variant="primary" className="w-full justify-center">
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
