import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-indigo-950/80 text-indigo-400 border-indigo-800/80',
    secondary: 'bg-purple-950/80 text-purple-400 border-purple-800/80',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
    danger: 'bg-rose-950/80 text-rose-400 border-rose-800/80',
    neutral: 'bg-slate-900 text-slate-400 border-slate-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-bold uppercase rounded-full border tracking-wide ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

