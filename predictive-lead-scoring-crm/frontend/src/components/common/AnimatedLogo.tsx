import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
      text: 'text-base',
      tagline: 'text-[9px]',
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-lg sm:text-xl',
      tagline: 'text-[10px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 'w-6 h-6',
      text: 'text-2xl',
      tagline: 'text-xs',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Link to="/" className={`inline-flex items-center space-x-3 group ${className}`}>
      {/* Animated Glowing Icon Box */}
      <div className="relative flex items-center justify-center">
        {/* Animated Rotating Gradient Ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-600 rounded-xl blur-sm opacity-80 group-hover:opacity-100 transition duration-500 animate-spin-slow"></div>

        {/* Inner Icon Container */}
        <div className={`relative ${currentSize.box} bg-slate-950 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-slate-800`}>
          <TrendingUp className={`${currentSize.icon} text-indigo-400 group-hover:text-cyan-300 transition-colors`} />
          <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute top-1 right-1 animate-pulse" />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={`font-display font-black tracking-tight text-white leading-tight ${currentSize.text}`}>
          Predictive<span className="gradient-text-animated">CRM</span>
        </span>
        {showTagline && (
          <span className={`font-heading text-slate-400 font-bold tracking-widest uppercase ${currentSize.tagline}`}>
            AI Sales Intelligence
          </span>
        )}
      </div>
    </Link>
  );
};

export default AnimatedLogo;
