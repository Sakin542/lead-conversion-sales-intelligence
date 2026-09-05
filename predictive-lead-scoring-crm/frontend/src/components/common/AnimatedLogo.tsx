import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  collapsed?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  collapsed = false,
}) => {
  const sizeClasses = {
    sm: {
      box: 'w-7 h-7 rounded-lg',
      icon: 'w-3.5 h-3.5',
      text: 'text-sm font-black',
      tagline: 'text-[9px]',
    },
    md: {
      box: 'w-9 h-9 rounded-xl',
      icon: 'w-4.5 h-4.5',
      text: 'text-base sm:text-lg font-black',
      tagline: 'text-[10px]',
    },
    lg: {
      box: 'w-11 h-11 rounded-2xl',
      icon: 'w-6 h-6',
      text: 'text-xl sm:text-2xl font-black',
      tagline: 'text-xs',
    },
  };

  const currentSize = sizeClasses[size];
  const gapClass = size === 'sm' ? 'space-x-2' : 'space-x-3';

  return (
    <Link to="/" className={`inline-flex items-center ${gapClass} group shrink-0 ${className}`}>
      {/* Animated Glowing Icon Box */}
      <div className="relative flex items-center justify-center">
        {/* Animated Rotating Gradient Ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF7A00] via-[#FF8C1A] to-[#F59E0B] rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition duration-500 animate-spin-slow"></div>

        {/* Inner Icon Container */}
        <div className={`relative ${currentSize.box} bg-[#101011] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-[#2A2A2E]`}>
          <TrendingUp className={`${currentSize.icon} text-[#FF7A00] group-hover:text-[#FF8C1A] transition-colors`} />
          <Sparkles className="w-2.5 h-2.5 text-[#FF8C1A] absolute top-1 right-1 animate-pulse" />
        </div>
      </div>

      {/* Brand Text */}
      {!collapsed && (
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
      )}
    </Link>
  );
};

export default AnimatedLogo;
