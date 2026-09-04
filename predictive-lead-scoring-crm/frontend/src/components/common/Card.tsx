import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  aiGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverGlow = false, aiGlow = false, ...props }) => {
  return (
    <div
      className={`bg-[#171718] border border-[#2A2A2E] rounded-xl p-4 sm:p-6 shadow-sm box-border flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#383838] hover:shadow-xl hover:shadow-[#FF7A00]/10 animate-fade-in ${
        hoverGlow || aiGlow ? 'hover:border-[#FF7A00]/50 hover:shadow-[#FF7A00]/20' : ''
      } ${aiGlow ? 'border-[#FF7A00]/40' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
