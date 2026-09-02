import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import TopNavbar from '../layout/TopNavbar';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Admin Dedicated Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area Wrapper */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        {/* Top Navbar */}
        <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Global Admin Security Header Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-indigo-900/60 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="font-bold">ADMIN SYSTEM CONTROL CENTER</span>
            <span className="hidden sm:inline text-indigo-400/60">• Authenticated as {user?.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-400">ML Engine Active (XGBoost v1.4)</span>
          </div>
        </div>

        {/* Page Main Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

