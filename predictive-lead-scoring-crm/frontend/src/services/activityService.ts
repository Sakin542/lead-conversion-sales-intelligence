import { apiRequest } from './api';
import { ActivityFormData, LeadActivity } from '../types/lead';

export const activityService = {
  getRecentActivities: async (): Promise<{ success: boolean; data: LeadActivity[] }> => {
    return apiRequest<{ success: boolean; data: LeadActivity[] }>('/activities', {
      method: 'GET',
    });
  },

  getLeadActivities: async (
    leadId: number | string
  ): Promise<{ success: boolean; data: LeadActivity[] }> => {
    return apiRequest<{ success: boolean; data: LeadActivity[] }>(
      `/leads/${leadId}/activities`,
      {
        method: 'GET',
      }
    );
  },

  createActivity: async (
    leadId: number | string,
    data: ActivityFormData
  ): Promise<{ success: boolean; message: string; data: LeadActivity }> => {
    return apiRequest<{ success: boolean; message: string; data: LeadActivity }>(
      `/leads/${leadId}/activities`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  deleteActivity: async (
    activityId: number | string
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/activities/${activityId}`,
      {
        method: 'DELETE',
      }
    );
  },
};

export default activityService;

