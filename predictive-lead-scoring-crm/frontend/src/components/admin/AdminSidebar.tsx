import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  GitCommitHorizontal,
  Bot,
  Database,
  BarChart3,
  Bell,
  Mail,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import AnimatedLogo from '../common/AnimatedLogo';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapsed = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Leads', path: '/admin/leads', icon: Target },
    { name: 'Sales Pipeline', path: '/admin/pipeline', icon: GitCommitHorizontal },
    { name: 'AI / ML Control', path: '/admin/ml', icon: Bot },
    { name: 'Datasets', path: '/admin/datasets', icon: Database },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Email Templates', path: '/admin/email-templates', icon: Mail },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#101011] border-r border-[#222225] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Admin Badge */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#222225] shrink-0">
          <div className="flex items-center space-x-1.5 min-w-0">
            <AnimatedLogo size="sm" showTagline={false} collapsed={collapsed} />
            {!collapsed && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#1C1C1E] text-[#FF7A00] border border-[#FF7A00]/20 rounded uppercase tracking-wider shrink-0">
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1E] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={onMobileClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tree */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onMobileClose}
                className={`group flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 relative ${
                  active
                    ? 'bg-[#29292C] text-white border border-[#2A2A2E] shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1E]'
                }`}
                title={collapsed ? item.name : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FF7A00] rounded-r-full" />
                )}
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                    active ? 'text-[#FF7A00]' : 'text-[#A1A1AA] group-hover:text-white'
                  }`}
                />
                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-[#222222] shrink-0">
          <button
            onClick={logout}
            className="w-full group flex items-center px-3 py-2.5 rounded-lg font-medium text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-150"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-zinc-400 group-hover:text-rose-400" />
            {!collapsed && <span className="ml-3 truncate">Logout Admin</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
