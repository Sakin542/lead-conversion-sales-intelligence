export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface Lead {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  company: string;
  job_title?: string | null;
  source?: string | null;
  status: LeadStatus;
  industry?: string | null;
  company_size?: string | null;
  estimated_value?: number | string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  activities?: LeadActivity[];
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  job_title?: string;
  source?: string;
  status?: LeadStatus;
  industry?: string;
  company_size?: string;
  estimated_value?: number | string;
  notes?: string;
}

export interface LeadQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  source?: string;
  industry?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedLeadsResponse {
  success: boolean;
  message: string;
  data: Lead[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export type ActivityType =
  | 'email_open'
  | 'page_visit'
  | 'form_submission'
  | 'email_click'
  | 'demo_request'
  | 'call'
  | 'meeting';

export interface LeadActivity {
  id: number;
  lead_id: number;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any> | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  lead?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company: string;
  };
}

export interface ActivityFormData {
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  occurred_at?: string;
}

