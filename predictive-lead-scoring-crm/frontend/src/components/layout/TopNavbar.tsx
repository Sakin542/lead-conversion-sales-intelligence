import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopNavbarProps {
  onMobileMenuToggle?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'High-score lead registered', time: '10m ago', unread: true },
    { id: 2, title: 'Q3 Pipeline target reached 80%', time: '1h ago', unread: true },
    { id: 3, title: 'Weekly sales forecast report ready', time: '3h ago', unread: false },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'AM';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, deals, campaigns..."
            className="w-full bg-slate-900/80 text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-12 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <div className="hidden sm:flex items-center absolute right-3 top-1/2 -translate-y-1/2 space-x-1 pointer-events-none">
            <kbd className="bg-slate-950 text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                <span className="text-xs text-indigo-400 font-medium">3 New</span>
              </div>
              <div className="space-y-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors flex items-start space-x-2.5 cursor-pointer text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-slate-200 font-medium leading-snug">{item.title}</p>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-800/80" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-500/20">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-white leading-none">{user?.name || 'CRM User'}</p>
              <p className="text-xs text-slate-400 leading-none mt-1">{user?.role ? user.role.replace('_', ' ') : 'CRM User'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-bold text-white text-sm">{user?.name || 'Alex Morgan'}</p>
                <p className="text-slate-400 truncate mt-0.5">{user?.email || 'alex@predictivecrm.com'}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 mr-2.5 text-slate-400" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2.5 text-slate-400" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2.5 text-rose-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
