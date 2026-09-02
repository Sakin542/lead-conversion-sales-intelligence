import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased w-full min-w-0 overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

