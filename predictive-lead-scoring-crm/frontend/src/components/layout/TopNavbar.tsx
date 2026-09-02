import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Settings, LogOut, ChevronDown, X, Users, GitCommitHorizontal, Megaphone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { adminApi, userManagementApi } from '../../services/api';
import leadService from '../../services/leadService';
import dealService from '../../services/dealService';
import { mockCampaigns } from '../../data/campaignsData';

interface TopNavbarProps {
  onMobileMenuToggle?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    leads: any[];
    deals: any[];
    campaigns: any[];
    users: any[];
  }>({ leads: [], deals: [], campaigns: [], users: [] });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard Hotkey ⌘K / Ctrl+K & Click Outside Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced Search Execution
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ leads: [], deals: [], campaigns: [], users: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchOpen(true);

    const timer = setTimeout(async () => {
      const q = searchQuery.toLowerCase();
      let leadsRes: any[] = [];
      let dealsRes: any[] = [];
      let usersRes: any[] = [];

      try {
        if (user?.role === 'ADMIN') {
          const apiRes = await adminApi.globalSearch(searchQuery);
          if (apiRes.success && apiRes.results) {
            leadsRes = apiRes.results.leads || [];
            dealsRes = apiRes.results.deals || [];
            usersRes = apiRes.results.users || [];
          }
        } else if (user?.role === 'SALES_MANAGER') {
          const [lData, pData, uData] = await Promise.all([
            leadService.getLeads({ search: searchQuery }).catch(() => ({ data: [] })),
            dealService.getPipeline().catch(() => ({ all_deals: [] })),
            userManagementApi.getUsers().catch(() => ({ users: [] })),
          ]);
          leadsRes = lData.data || [];
          dealsRes = (pData.all_deals || []).filter((d: any) =>
            d.title.toLowerCase().includes(q) || (d.company && d.company.toLowerCase().includes(q))
          );
          usersRes = (uData.users || []).filter((u: any) =>
            u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
          );
        } else {
          const [lData, pData] = await Promise.all([
            leadService.getLeads({ search: searchQuery }).catch(() => ({ data: [] })),
            dealService.getPipeline().catch(() => ({ all_deals: [] })),
          ]);
          leadsRes = lData.data || [];
          dealsRes = (pData.all_deals || []).filter((d: any) =>
            d.title.toLowerCase().includes(q) || (d.company && d.company.toLowerCase().includes(q))
          );
        }
      } catch (e) {
        // Fallback local search
      }

      // Filter campaigns
      const campaignsRes = mockCampaigns.filter(
        (c) => c.name.toLowerCase().includes(q) || c.channel.toLowerCase().includes(q)
      );

      setSearchResults({
        leads: leadsRes.slice(0, 5),
        deals: dealsRes.slice(0, 5),
        campaigns: campaignsRes.slice(0, 3),
        users: usersRes.slice(0, 3),
      });
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.role]);

  const getInitials = (name?: string) => {
    if (!name) return 'AM';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSelectResult = (path: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const totalResultsCount =
    searchResults.leads.length +
    searchResults.deals.length +
    searchResults.campaigns.length +
    searchResults.users.length;

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Menu Toggle & Interactive Global Search Bar */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 max-w-xl min-w-0" ref={searchContainerRef}>
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input & Dropdown Overlay */}
        <div className="relative w-full min-w-0">
          <div className="relative flex items-center">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-indigo-400 absolute left-3.5 animate-spin pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            )}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setSearchOpen(true);
              }}
              placeholder="Search leads, deals, campaigns..."
              className="w-full bg-slate-900/80 text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-12 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center absolute right-3 space-x-1 pointer-events-none">
                <kbd className="bg-slate-950 text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Interactive Search Results Dropdown */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl max-h-[80vh] overflow-y-auto custom-scrollbar p-2 space-y-3">
              {isSearching && totalResultsCount === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Searching CRM database...</span>
                </div>
              )}

              {!isSearching && totalResultsCount === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-400">No results found for "{searchQuery}"</p>
                  <p>Try searching by lead name, company, deal title, or campaign.</p>
                </div>
              )}

              {/* 1. Leads Results */}
              {searchResults.leads.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Leads ({searchResults.leads.length})</span>
                  </div>
                  {searchResults.leads.map((lead: any) => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectResult(user?.role === 'ADMIN' ? `/admin/leads` : `/leads`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between group text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                          {lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{lead.email} • {lead.company || 'Direct Lead'}</p>
                      </div>
                      {lead.score !== undefined && (
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 border ${
                          lead.score >= 80 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {lead.score}% Score
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* 2. Deals / Pipeline Results */}
              {searchResults.deals.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                    <GitCommitHorizontal className="w-3.5 h-3.5" />
                    <span>Deals & Pipeline ({searchResults.deals.length})</span>
                  </div>
                  {searchResults.deals.map((deal: any) => (
                    <button
                      key={deal.id}
                      onClick={() => handleSelectResult(user?.role === 'SALES_REP' ? '/sales-rep/pipeline' : '/pipeline')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between group text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-200 group-hover:text-purple-300 truncate">{deal.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{deal.company || 'Pipeline Deal'}</p>
                      </div>
                      <span className="font-bold text-slate-200 shrink-0 text-xs ml-2">
                        ${typeof deal.value === 'number' ? deal.value.toLocaleString() : deal.value}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 3. Campaigns Results */}
              {searchResults.campaigns.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Campaigns ({searchResults.campaigns.length})</span>
                  </div>
                  {searchResults.campaigns.map((camp: any) => (
                    <button
                      key={camp.id}
                      onClick={() => handleSelectResult('/campaigns')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between group text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-200 group-hover:text-blue-300 truncate">{camp.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{camp.channel} Channel</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 font-semibold text-[10px] border border-blue-800">
                        {camp.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 4. Users Results (Admin) */}
              {searchResults.users.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Team Users ({searchResults.users.length})</span>
                  </div>
                  {searchResults.users.map((u: any) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectResult(user?.role === 'ADMIN' ? '/admin/users' : '/users')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between group text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-200 group-hover:text-amber-300 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[10px]">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Real-Time Notification Bell & Dropdown */}
        <NotificationBell />

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
                  to={
                    user?.role === 'ADMIN'
                      ? '/admin/profile'
                      : user?.role === 'SALES_MANAGER'
                      ? '/manager/profile'
                      : '/sales-rep/profile'
                  }
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 mr-2.5 text-slate-400" />
                  Profile
                </Link>
                <Link
                  to={
                    user?.role === 'ADMIN'
                      ? '/admin/settings'
                      : user?.role === 'SALES_MANAGER'
                      ? '/manager/settings'
                      : '/settings'
                  }
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
