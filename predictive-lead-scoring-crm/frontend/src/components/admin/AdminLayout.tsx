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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-zinc-100 flex flex-col font-sans antialiased w-full min-w-0 overflow-x-hidden">
      {/* Admin Dedicated Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area Wrapper */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Top Navbar */}
        <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Global Admin Security Header Banner */}
        <div className="bg-[#101011] border-b border-[#2A2A2E] px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center space-x-2 min-w-0 truncate">
            <Shield className="w-4 h-4 text-[#FF7A00] shrink-0" />
            <span className="font-bold truncate text-white">ADMIN SYSTEM CONTROL CENTER</span>
            <span className="hidden sm:inline text-zinc-400 truncate">• Authenticated as {user?.email}</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#FF7A00]">ML Engine Active (XGBoost v1.4)</span>
          </div>
        </div>

        {/* Page Main Content Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full min-w-0 mx-auto space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
