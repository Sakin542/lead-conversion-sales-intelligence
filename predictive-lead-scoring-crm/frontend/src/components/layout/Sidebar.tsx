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
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER';
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
    ? []
    : [{ name: 'Settings', path: '/settings', icon: Settings }];


  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center space-x-1.5 min-w-0">
            <AnimatedLogo size="sm" showTagline={false} collapsed={collapsed} />
            {!collapsed && user?.role === 'SALES_MANAGER' && (
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-indigo-950 text-indigo-400 border border-indigo-800/80 rounded uppercase tracking-wider shrink-0">
                MANAGER
              </span>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onMobileClose}
                className={`group flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section: Settings & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 shrink-0">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onMobileClose}
                className={`group flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-200" />
                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            );
          })}

          <button
            onClick={logout}
            className="w-full group flex items-center px-3 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all duration-150"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-400" />
            {!collapsed && <span className="ml-3 truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
