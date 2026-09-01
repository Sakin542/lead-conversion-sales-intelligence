export interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'LinkedIn' | 'Google Ads' | 'Webinar' | 'Cold Outbound';
  status: 'Active' | 'Scheduled' | 'Completed' | 'Paused';
  budget: number;
  spent: number;
  leadsGenerated: number;
  conversionRate: number;
  roi: string;
  startDate: string;
  endDate: string;
}

export interface CampaignChannelSummary {
  channel: string;
  leadCount: number;
  share: number;
  color: string;
}

export const campaignKpis = [
  {
    title: 'Active Campaigns',
    value: '12',
    change: '+3 this month',
    isPositive: true,
  },
  {
    title: 'Total Campaign Budget',
    value: '$60,000',
    subText: '$45,800 spent (76.3%)',
    change: '+14.2%',
    isPositive: true,
  },
  {
    title: 'Leads Generated',
    value: '1,670',
    subText: '$27.42 CPL avg',
    change: '+21.5%',
    isPositive: true,
  },
  {
    title: 'Campaign ROI',
    value: '4.8x',
    subText: '$219,800 revenue',
    change: '+0.6x vs target',
    isPositive: true,
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Q3 Enterprise Tech Webinar Series',
    channel: 'Webinar',
    status: 'Active',
    budget: 12000,
    spent: 9400,
    leadsGenerated: 480,
    conversionRate: 28.5,
    roi: '5.2x',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
  },
  {
    id: 'camp-2',
    name: 'Google Search - High Intent CRM',
    channel: 'Google Ads',
    status: 'Active',
    budget: 18000,
    spent: 14200,
    leadsGenerated: 520,
    conversionRate: 31.4,
    roi: '6.0x',
    startDate: '2026-06-15',
    endDate: '2026-09-30',
  },
  {
    id: 'camp-3',
    name: 'Q3 LinkedIn Executive Outreach',
    channel: 'LinkedIn',
    status: 'Active',
    budget: 15000,
    spent: 11800,
    leadsGenerated: 340,
    conversionRate: 22.1,
    roi: '4.1x',
    startDate: '2026-07-10',
    endDate: '2026-10-15',
  },
  {
    id: 'camp-4',
    name: 'SaaS Founders Nurture Email Flow',
    channel: 'Email',
    status: 'Active',
    budget: 3000,
    spent: 2100,
    leadsGenerated: 210,
    conversionRate: 18.2,
    roi: '3.5x',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
  },
  {
    id: 'camp-5',
    name: 'Cold Outbound Sequence - Fintech',
    channel: 'Cold Outbound',
    status: 'Paused',
    budget: 5000,
    spent: 4100,
    leadsGenerated: 120,
    conversionRate: 14.8,
    roi: '2.1x',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
  },
  {
    id: 'camp-6',
    name: 'Q4 Product Launch Teaser',
    channel: 'Email',
    status: 'Scheduled',
    budget: 7000,
    spent: 0,
    leadsGenerated: 0,
    conversionRate: 0,
    roi: '0x',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
  },
];

export const channelSummaries: CampaignChannelSummary[] = [
  { channel: 'Google Ads', leadCount: 520, share: 31.1, color: '#3b82f6' },
  { channel: 'Webinar Series', leadCount: 480, share: 28.7, color: '#8b5cf6' },
  { channel: 'LinkedIn Outreach', leadCount: 340, share: 20.4, color: '#0284c7' },
  { channel: 'Email Nurture', leadCount: 210, share: 12.6, color: '#10b981' },
  { channel: 'Cold Outbound', leadCount: 120, share: 7.2, color: '#f59e0b' },
];

