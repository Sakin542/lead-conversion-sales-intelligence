import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/50 focus:ring-offset-2 focus:ring-offset-[#0B0B0D] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variantStyles = {
    primary: 'bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-semibold border border-transparent shadow-sm',
    ai: 'bg-[#FF7A00] hover:bg-[#FF8C1A] text-[#FFFFFF] font-semibold shadow-md shadow-[#FF7A00]/20 border border-[#FF7A00]/30',
    secondary: 'bg-[#1A1A1C] hover:bg-[#252528] text-[#FFFFFF] border border-[#2A2A2E]',
    outline: 'border border-[#2A2A2E] bg-[#111113] text-[#FFFFFF] hover:bg-[#1C1C1E] hover:border-[#383838]',
    ghost: 'text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#1C1C1E]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-rose-500/20',
  };

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[34px] gap-1.5',
    md: 'text-sm px-4.5 py-2 min-h-[40px] gap-2',
    lg: 'text-base px-6 py-3 min-h-[46px] gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
