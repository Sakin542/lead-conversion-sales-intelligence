import { apiRequest } from './api';
import { Deal, DealFormData, PipelineResponse } from '../types/pipeline';

export const dealService = {
  getPipeline: async (params: {
    stage?: string;
    pipeline_stage_id?: number;
    min_value?: number;
    max_value?: number;
  } = {}): Promise<PipelineResponse> => {
    const query = new URLSearchParams();

    if (params.stage) query.append('stage', params.stage);
    if (params.pipeline_stage_id) query.append('pipeline_stage_id', params.pipeline_stage_id.toString());
    if (params.min_value !== undefined) query.append('min_value', params.min_value.toString());
    if (params.max_value !== undefined) query.append('max_value', params.max_value.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<PipelineResponse>(`/pipeline${queryString}`, {
      method: 'GET',
    });
  },

  getDeal: async (id: number | string): Promise<{ success: boolean; data: Deal }> => {
    return apiRequest<{ success: boolean; data: Deal }>(`/deals/${id}`, {
      method: 'GET',
    });
  },

  createDeal: async (
    data: DealFormData
  ): Promise<{ success: boolean; message: string; data: Deal }> => {
    return apiRequest<{ success: boolean; message: string; data: Deal }>('/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDeal: async (
    id: number | string,
    data: Partial<DealFormData>
  ): Promise<{ success: boolean; message: string; data: Deal }> => {
    return apiRequest<{ success: boolean; message: string; data: Deal }>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateDealStage: async (
    id: number | string,
    pipeline_stage_id: number
  ): Promise<{ success: boolean; message: string; data: Deal }> => {
    return apiRequest<{ success: boolean; message: string; data: Deal }>(
      `/deals/${id}/stage`,
      {
        method: 'PATCH',
        body: JSON.stringify({ pipeline_stage_id }),
      }
    );
  },

  deleteDeal: async (
    id: number | string
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/deals/${id}`, {
      method: 'DELETE',
    });
  },
};

export default dealService;

