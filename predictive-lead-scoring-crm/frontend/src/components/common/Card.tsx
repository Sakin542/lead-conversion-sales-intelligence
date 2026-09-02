import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-sm box-border flex flex-col min-w-0 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

