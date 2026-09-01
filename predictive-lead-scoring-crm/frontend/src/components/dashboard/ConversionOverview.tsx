import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Card from '../common/Card';
import { conversionTrendData } from '../../data/dashboardData';
import { TrendingUp } from 'lucide-react';

export const ConversionOverview: React.FC = () => {
  return (
    <Card className="bg-slate-900/60 border-slate-800/80 p-6 flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Lead Conversion Trend</h3>
          </div>
          <p className="text-xs text-slate-400">Monthly conversion rate growth performance</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center text-slate-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5" />
            Actual Rate (%)
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={conversionTrendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}%`}
              domain={[0, 35]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(value: any) => [`${value}%`, 'Conversion Rate']}
              labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
            />

            <Area
              type="monotone"
              dataKey="rate"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorConversion)"
              dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 6, fill: '#a5b4fc', strokeWidth: 2, stroke: '#6366f1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ConversionOverview;

