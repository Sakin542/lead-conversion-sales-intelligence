import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { userManagementApi, managerApi } from '../../services/api';
import {
  UserCheck,
  Mail,
  Users,
  Target,
  TrendingUp,
  ShieldCheck,
  LogOut,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ManagerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [salesRepsCount, setSalesRepsCount] = useState<number>(0);

  useEffect(() => {
    const loadManagerData = async () => {
      try {
        const [uRes] = await Promise.all([
          userManagementApi.getUsers().catch(() => ({ success: false, users: [] })),
          managerApi.getGoals().catch(() => ({ success: false, team_summary: null })),
        ]);

        if (uRes.success && uRes.users) {
          const reps = uRes.users.filter((u: any) => u.role === 'SALES_REP');
          setSalesRepsCount(reps.length || 4);
        } else {
          setSalesRepsCount(4);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadManagerData();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'SM';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto min-w-0">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00]">
                <UserCheck className="w-6 h-6" />
              </div>
              <span>Sales Manager Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Management overview, team allocation capacity, and sales supervision details.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/manager/settings')}
              leftIcon={<Settings className="w-4 h-4 text-[#FF7A00]" />}
              className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C] font-bold text-xs"
            >
              Manager Settings
            </Button>
          </div>
        </div>

        {/* Card 1: Manager Identity Card */}
        <Card className="p-6 sm:p-8 bg-[#171718] border-[#2A2A2E] space-y-6 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2A2E]">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#29292C] text-[#FF7A00] border border-[#2A2A2E] font-black text-2xl flex items-center justify-center shadow-xl shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">{user?.name || 'Sales Manager'}</h2>
                  <Badge variant="primary" size="md">SALES MANAGER</Badge>
                </div>
                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{user?.email || 'manager@predictivecrm.com'}</span>
                </p>
                <p className="text-xs text-[#FF7A00] font-semibold">Head of Enterprise & Direct Sales</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}
              className="border-rose-900/60 text-rose-400 hover:bg-rose-950/40 font-bold text-xs shrink-0"
            >
              Sign Out
            </Button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#111113] border border-[#2A2A2E] space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-medium">Direct Team Reps</span>
                <Users className="w-4 h-4 text-[#FF7A00]" />
              </div>
              <p className="text-2xl font-black text-white">{salesRepsCount} Sales Reps</p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Active & Assigned
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111113] border border-[#2A2A2E] space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-medium">Team Target</span>
                <Target className="w-4 h-4 text-[#FF7A00]" />
              </div>
              <p className="text-2xl font-black text-white">$250,000 / mo</p>
              <span className="text-[10px] text-zinc-400 font-medium">Monthly Pipeline Goal</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111113] border border-[#2A2A2E] space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-medium">AI Conversion Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">34.8%</p>
              <span className="text-[10px] text-zinc-400 font-medium">+4.2% vs last month</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Manager Responsibilities & Supervision Scope */}
        <Card className="p-6 sm:p-8 bg-[#171718] border-[#2A2A2E] space-y-4 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3 text-[#FF7A00] border-b border-[#2A2A2E] pb-4">
            <ShieldCheck className="w-5 h-5 text-[#FF7A00]" />
            <div>
              <h3 className="text-base font-bold text-white">Managerial Scope & Permissions</h3>
              <p className="text-xs text-zinc-400">Authorized supervision powers for lead assignment & goal setting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#111113] border border-[#2A2A2E] flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-200 block">AI Automated Lead Distribution</span>
                <span className="text-[11px] text-zinc-400">Reassign and allocate high-intent Hot leads to active sales representatives.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111113] border border-[#2A2A2E] flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-200 block">Team Goal & Target Management</span>
                <span className="text-[11px] text-zinc-400">Define revenue quotas and track rep performance against monthly targets.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111113] border border-[#2A2A2E] flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-200 block">At-Risk Lead Resolution</span>
                <span className="text-[11px] text-zinc-400">Monitor stale leads and trigger intervention workflows before deals drop off.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111113] border border-[#2A2A2E] flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-200 block">Revenue Forecasting & Reports</span>
                <span className="text-[11px] text-zinc-400">Export CSV executive digests and AI pipeline probability forecasts.</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerProfile;

