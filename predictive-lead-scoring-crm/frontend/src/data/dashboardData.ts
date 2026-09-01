export interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  comparison: string;
  type: 'total' | 'hot' | 'conversion' | 'pipeline';
}

export interface ConversionTrendPoint {
  month: string;
  rate: number;
  target?: number;
}

export interface ScoreCategory {
  name: string;
  range: string;
  count: number;
  percentage: number;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  score: number;
  category: 'Hot' | 'Warm' | 'Medium' | 'Cold';
  stage: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';
  lastActivity: string;
  owner: string;
  avatar?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: string;
  percentage: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'email' | 'form' | 'visit' | 'reply' | 'download';
}

export interface ActivityMetric {
  title: string;
  count: string;
  change: string;
  isPositive: boolean;
}

export const kpiMetrics: KPIMetric[] = [
  {
    id: 'total-leads',
    title: 'Total Leads',
    value: '2,847',
    change: '+12.5%',
    isPositive: true,
    comparison: 'vs last month',
    type: 'total',
  },
  {
    id: 'hot-leads',
    title: 'Hot Leads',
    value: '386',
    change: '+18.2%',
    isPositive: true,
    comparison: 'vs last month',
    type: 'hot',
  },
  {
    id: 'conversion-rate',
    title: 'Conversion Rate',
    value: '24.8%',
    change: '+4.6%',
    isPositive: true,
    comparison: 'vs last month',
    type: 'conversion',
  },
  {
    id: 'pipeline-value',
    title: 'Pipeline Value',
    value: '$1.24M',
    change: '+8.7%',
    isPositive: true,
    comparison: 'vs last month',
    type: 'pipeline',
  },
];

export const conversionTrendData: ConversionTrendPoint[] = [
  { month: 'Jan', rate: 18, target: 20 },
  { month: 'Feb', rate: 20, target: 20 },
  { month: 'Mar', rate: 19, target: 22 },
  { month: 'Apr', rate: 23, target: 22 },
  { month: 'May', rate: 22, target: 24 },
  { month: 'Jun', rate: 25, target: 24 },
  { month: 'Jul', rate: 27, target: 25 },
  { month: 'Aug', rate: 29, target: 25 },
];

export const scoreDistributionData: ScoreCategory[] = [
  {
    name: 'Hot',
    range: '80–100',
    count: 386,
    percentage: 13.5,
    color: '#10b981', // emerald-500
    badgeBg: 'bg-emerald-950/80 border-emerald-800/80',
    badgeText: 'text-emerald-400',
  },
  {
    name: 'Warm',
    range: '60–79',
    count: 721,
    percentage: 25.3,
    color: '#6366f1', // indigo-500
    badgeBg: 'bg-indigo-950/80 border-indigo-800/80',
    badgeText: 'text-indigo-400',
  },
  {
    name: 'Medium',
    range: '40–59',
    count: 934,
    percentage: 32.8,
    color: '#f59e0b', // amber-500
    badgeBg: 'bg-amber-950/80 border-amber-800/80',
    badgeText: 'text-amber-400',
  },
  {
    name: 'Cold',
    range: '0–39',
    count: 806,
    percentage: 28.4,
    color: '#64748b', // slate-500
    badgeBg: 'bg-slate-900 border-slate-700',
    badgeText: 'text-slate-400',
  },
];

export const topHotLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Sarah Johnson',
    email: 'sarah.j@technova.io',
    company: 'TechNova Ltd.',
    score: 94,
    category: 'Hot',
    stage: 'Qualified',
    lastActivity: '2 hours ago',
    owner: 'Alex Morgan',
  },
  {
    id: 'lead-2',
    name: 'Michael Chen',
    email: 'm.chen@brightsys.com',
    company: 'Bright Systems',
    score: 91,
    category: 'Hot',
    stage: 'Proposal',
    lastActivity: '5 hours ago',
    owner: 'Alex Morgan',
  },
  {
    id: 'lead-3',
    name: 'Emma Williams',
    email: 'emma@cloudcore.net',
    company: 'CloudCore',
    score: 87,
    category: 'Hot',
    stage: 'Negotiation',
    lastActivity: '1 day ago',
    owner: 'Sarah Lee',
  },
  {
    id: 'lead-4',
    name: 'David Wilson',
    email: 'dwilson@nexasoft.org',
    company: 'NexaSoft',
    score: 84,
    category: 'Hot',
    stage: 'Qualified',
    lastActivity: '1 day ago',
    owner: 'Alex Morgan',
  },
  {
    id: 'lead-5',
    name: 'Sophia Brown',
    email: 'sbrown@dataflow.co',
    company: 'DataFlow',
    score: 81,
    category: 'Hot',
    stage: 'Contacted',
    lastActivity: '2 days ago',
    owner: 'Sarah Lee',
  },
];

export const pipelineStages: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'New Leads',
    count: 842,
    value: '$320,000',
    percentage: 100,
    color: '#3b82f6', // blue-500
  },
  {
    id: 'stage-2',
    name: 'Contacted',
    count: 613,
    value: '$280,000',
    percentage: 72.8,
    color: '#6366f1', // indigo-500
  },
  {
    id: 'stage-3',
    name: 'Qualified',
    count: 421,
    value: '$240,000',
    percentage: 50.0,
    color: '#8b5cf6', // purple-500
  },
  {
    id: 'stage-4',
    name: 'Proposal',
    count: 267,
    value: '$190,000',
    percentage: 31.7,
    color: '#ec4899', // pink-500
  },
  {
    id: 'stage-5',
    name: 'Negotiation',
    count: 148,
    value: '$130,000',
    percentage: 17.6,
    color: '#f59e0b', // amber-500
  },
  {
    id: 'stage-6',
    name: 'Won',
    count: 96,
    value: '$85,000',
    percentage: 11.4,
    color: '#10b981', // emerald-500
  },
];

export const recentActivities: ActivityItem[] = [
  {
    id: 'act-1',
    user: 'Sarah Johnson',
    action: 'opened your email',
    target: 'Q3 Enterprise Proposal',
    timestamp: '2 minutes ago',
    type: 'email',
  },
  {
    id: 'act-2',
    user: 'Michael Chen',
    action: 'submitted contact form',
    target: 'Request for Custom Quote',
    timestamp: '18 minutes ago',
    type: 'form',
  },
  {
    id: 'act-3',
    user: 'Emma Williams',
    action: 'visited pricing page',
    target: 'Enterprise Tier Options',
    timestamp: '42 minutes ago',
    type: 'visit',
  },
  {
    id: 'act-4',
    user: 'David Wilson',
    action: 'replied to email',
    target: 'Re: API Integration Architecture',
    timestamp: '1 hour ago',
    type: 'reply',
  },
  {
    id: 'act-5',
    user: 'Sophia Brown',
    action: 'downloaded product brochure',
    target: 'Security & Compliance PDF',
    timestamp: '2 hours ago',
    type: 'download',
  },
];

export const leadActivitySummary: ActivityMetric[] = [
  {
    title: 'Email Opens',
    count: '1,284',
    change: '+14.2%',
    isPositive: true,
  },
  {
    title: 'Page Visits',
    count: '2,941',
    change: '+8.5%',
    isPositive: true,
  },
  {
    title: 'Form Submissions',
    count: '428',
    change: '+22.1%',
    isPositive: true,
  },
  {
    title: 'Demo Requests',
    count: '172',
    change: '+15.8%',
    isPositive: true,
  },
];

export const aiInsightData = {
  highIntentUncontactedCount: 42,
  timeframe: '24 hours',
  recommendation: 'Prioritize these leads today to maximize conversion rate by an estimated 14%.',
};

