import { Lead } from './lead';

export interface PipelineStage {
  id: number;
  name: string;
  slug: string;
  position: number;
  deals_count?: number;
  total_value?: number;
  deals?: Deal[];
  created_at?: string;
  updated_at?: string;
}

export interface Deal {
  id: number;
  user_id: number;
  lead_id: number;
  pipeline_stage_id: number;
  title: string;
  value: number | string;
  expected_close_date?: string | null;
  probability: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead | {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company: string;
  };
  pipeline_stage?: PipelineStage;
}

export interface DealFormData {
  title: string;
  lead_id: number;
  pipeline_stage_id: number;
  value: number | string;
  expected_close_date?: string;
  probability: number;
  notes?: string;
}

export interface PipelineSummary {
  total_pipeline_value: number;
  open_deals_count: number;
  won_deals_count: number;
  lost_deals_count: number;
  total_deals_count: number;
}

export interface PipelineResponse {
  success: boolean;
  message: string;
  summary: PipelineSummary;
  stages: PipelineStage[];
  all_deals: Deal[];
}

