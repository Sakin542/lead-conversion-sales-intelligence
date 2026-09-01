import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

