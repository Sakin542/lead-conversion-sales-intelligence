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
    <Card className="p-6 flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#FF7A00]" />
            <h3 className="text-base font-bold text-white tracking-tight">Lead Conversion Trend</h3>
          </div>
          <p className="text-xs text-[#A1A1AA]">Monthly conversion rate growth performance</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center text-[#A1A1AA] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] mr-1.5" />
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
                <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />

            <XAxis
              dataKey="month"
              stroke="#71717A"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#71717A"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}%`}
              domain={[0, 35]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#171718',
                borderColor: '#2A2A2E',
                borderRadius: '0.75rem',
                color: '#FFFFFF',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(value: any) => [`${value}%`, 'Conversion Rate']}
              labelStyle={{ color: '#A1A1AA', fontWeight: 600 }}
            />

            <Area
              type="monotone"
              dataKey="rate"
              stroke="#FF7A00"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorConversion)"
              dot={{ r: 4, fill: '#FF8C1A', strokeWidth: 2, stroke: '#171718' }}
              activeDot={{ r: 6, fill: '#FFFFFF', strokeWidth: 2, stroke: '#FF7A00' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ConversionOverview;

