import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitCommitHorizontal,
  Activity,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  Bot,
  ShieldAlert,
  Target,
  TrendingUp,
  FileSpreadsheet,
  Flame,
  Calendar,
  Mail,
  Bell,
  User,
} from 'lucide-react';
import AnimatedLogo from '../common/AnimatedLogo';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapsed = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER';
  const isManager = user?.role === 'SALES_MANAGER';
  const isSalesRep = user?.role === 'SALES_REP';

  const navItems = isSalesRep
    ? [
        { name: 'Dashboard', path: '/sales-rep/dashboard', icon: LayoutDashboard },
        { name: 'My Leads', path: '/sales-rep/leads', icon: Users },
        { name: 'Priority Leads', path: '/sales-rep/priority-leads', icon: Flame },
        { name: 'Sales Pipeline', path: '/sales-rep/pipeline', icon: GitCommitHorizontal },
        { name: 'Activities', path: '/sales-rep/activities', icon: Activity },
        { name: 'Follow-ups', path: '/sales-rep/follow-ups', icon: Calendar },
        { name: 'Emails', path: '/sales-rep/emails', icon: Mail },
        { name: 'My Analytics', path: '/sales-rep/analytics', icon: BarChart3 },
        { name: 'My Goals', path: '/sales-rep/goals', icon: Target },
        { name: 'Notifications', path: '/sales-rep/notifications', icon: Bell },
        { name: 'Profile', path: '/sales-rep/profile', icon: User },
      ]
    : [
        { name: 'Dashboard', path: user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'SALES_MANAGER' ? '/manager/dashboard' : '/dashboard', icon: LayoutDashboard },
        ...(isManagerOrAdmin
          ? [
              { name: 'User Management', path: '/users', icon: UserCheck },
              { name: 'AI Assignment', path: '/manager/ai-assignment', icon: Bot },
              { name: 'At-Risk Leads', path: '/manager/at-risk-leads', icon: ShieldAlert },
              { name: 'Team Goals', path: '/manager/goals', icon: Target },
              { name: 'Revenue Forecast', path: '/manager/revenue-forecast', icon: TrendingUp },
              { name: 'Manager Reports', path: '/manager/reports', icon: FileSpreadsheet },
            ]
          : []),
        { name: 'Leads', path: '/leads', icon: Users },
        { name: 'Pipeline', path: '/pipeline', icon: GitCommitHorizontal },
        { name: 'Activities', path: '/activities', icon: Activity },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Campaigns', path: '/campaigns', icon: Megaphone },
      ];

  const bottomItems = isSalesRep
    ? [{ name: 'Settings', path: '/sales-rep/settings', icon: Settings }]
    : isManager
    ? [{ name: 'Settings', path: '/manager/settings', icon: Settings }]
    : [{ name: 'Settings', path: '/settings', icon: Settings }];

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

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#101011] border-r border-[#222225] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#222225] shrink-0">
          <div className="flex items-center space-x-1.5 min-w-0">
            <AnimatedLogo size="sm" showTagline={false} collapsed={collapsed} />
            {!collapsed && user?.role === 'SALES_MANAGER' && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#1C1C1E] text-[#FF7A00] border border-[#FF7A00]/20 rounded uppercase tracking-wider shrink-0">
                MANAGER
              </span>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1E] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
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

        {/* Bottom Section: Settings & Logout */}
        <div className="p-3 border-t border-[#222222] space-y-1 shrink-0">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onMobileClose}
                className={`group flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  active
                    ? 'bg-[#151515] text-white border border-[#282828]'
                    : 'text-zinc-400 hover:text-white hover:bg-[#111111]'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-4.5 h-4.5 shrink-0 text-zinc-400 group-hover:text-white" />
                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            );
          })}

          <button
            onClick={logout}
            className="w-full group flex items-center px-3 py-2.5 rounded-lg font-medium text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-150"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-zinc-400 group-hover:text-rose-400" />
            {!collapsed && <span className="ml-3 truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
