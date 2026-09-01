import { apiRequest } from './api';
import {
  Lead,
  LeadFormData,
  LeadQueryParams,
  PaginatedLeadsResponse,
} from '../types/lead';

export const leadService = {
  getLeads: async (params: LeadQueryParams = {}): Promise<PaginatedLeadsResponse> => {
    const query = new URLSearchParams();

    if (params.page) query.append('page', params.page.toString());
    if (params.per_page) query.append('per_page', params.per_page.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.source) query.append('source', params.source);
    if (params.industry) query.append('industry', params.industry);
    if (params.sort) query.append('sort', params.sort);
    if (params.direction) query.append('direction', params.direction);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<PaginatedLeadsResponse>(`/leads${queryString}`, {
      method: 'GET',
    });
  },

  getLead: async (id: number | string): Promise<{ success: boolean; data: Lead }> => {
    return apiRequest<{ success: boolean; data: Lead }>(`/leads/${id}`, {
      method: 'GET',
    });
  },

  createLead: async (
    data: LeadFormData
  ): Promise<{ success: boolean; message: string; data: Lead }> => {
    return apiRequest<{ success: boolean; message: string; data: Lead }>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLead: async (
    id: number | string,
    data: Partial<LeadFormData>
  ): Promise<{ success: boolean; message: string; data: Lead }> => {
    return apiRequest<{ success: boolean; message: string; data: Lead }>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLead: async (
    id: number | string
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },
};

export default leadService;

