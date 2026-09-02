import { AuthResponse, ForgotPasswordResponse, User, UserRole } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred') as Error & {
      status?: number;
      data?: any;
    };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const authApi = {
  login: async (payload: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout: async (): Promise<AuthResponse> => {
    try {
      return await apiRequest<AuthResponse>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      removeToken();
    }
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    return apiRequest<{ success: boolean; user: User }>('/auth/user', {
      method: 'GET',
    });
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      return await apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err: any) {
      if (err.status === 404) {
        return await apiRequest<ForgotPasswordResponse>('/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
      }
      throw err;
    }
  },

  resetPassword: async (payload: {
    email: string;
    token?: string;
    code?: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      return await apiRequest<{ success: boolean; message?: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.status === 404) {
        return await apiRequest<{ success: boolean; message?: string }>('/reset-password', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      throw err;
    }
  },

  verifyInvitation: async (email: string, token: string): Promise<{ success: boolean; user?: Partial<User> }> => {
    return apiRequest<{ success: boolean; user?: Partial<User> }>(
      `/auth/invitation/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
      { method: 'GET' }
    );
  },

  acceptInvitation: async (payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/accept-invitation', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    try {
      return await apiRequest<{ success: boolean; message: string }>('/auth/account', {
        method: 'DELETE',
      });
    } finally {
      removeToken();
    }
  },
};

export const userManagementApi = {
  getUsers: async (): Promise<{ success: boolean; users: User[] }> => {
    return apiRequest<{ success: boolean; users: User[] }>('/users', {
      method: 'GET',
    });
  },

  inviteUser: async (payload: {
    name: string;
    email: string;
    role: UserRole;
  }): Promise<{ success: boolean; message: string; user: User }> => {
    return apiRequest<{ success: boolean; message: string; user: User }>('/users/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export const managerApi = {
  getAiAssignments: async (leadId?: number): Promise<{ success: boolean; recommendations: any[] }> => {
    const query = leadId ? `?lead_id=${leadId}` : '';
    return apiRequest(`/manager/ai-assignment/recommendations${query}`, { method: 'GET' });
  },

  assignLeadAi: async (leadId: number, assignedTo: number): Promise<{ success: boolean; message: string; lead: any }> => {
    return apiRequest(`/manager/ai-assignment/${leadId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
  },

  getAtRiskLeads: async (params?: Record<string, string>): Promise<{ success: boolean; at_risk_leads: any[]; summary: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/manager/at-risk-leads?${query}`, { method: 'GET' });
  },

  resolveAtRiskLead: async (id: number): Promise<{ success: boolean; message: string; lead: any }> => {
    return apiRequest(`/manager/at-risk-leads/${id}/resolve`, { method: 'PATCH' });
  },

  getGoals: async (): Promise<{ success: boolean; goals: any[]; team_summary: any }> => {
    return apiRequest('/manager/goals', { method: 'GET' });
  },

  createGoal: async (payload: {
    type: string;
    target_value: number;
    timeframe: string;
    user_id?: number | null;
    start_date: string;
    end_date: string;
  }): Promise<{ success: boolean; message: string; goal: any }> => {
    return apiRequest('/manager/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteGoal: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/manager/goals/${id}`, { method: 'DELETE' });
  },

  getRevenueForecast: async (): Promise<{ success: boolean; kpis: any; scenarios: any; charts: any }> => {
    return apiRequest('/manager/revenue-forecast', { method: 'GET' });
  },

  bulkAssignLeads: async (leadIds: number[], assignedTo: number | null): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/manager/leads/bulk-assign', {
      method: 'POST',
      body: JSON.stringify({ lead_ids: leadIds, assigned_to: assignedTo }),
    });
  },

  bulkStatusLeads: async (leadIds: number[], status: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/manager/leads/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ lead_ids: leadIds, status }),
    });
  },

  bulkFollowupLeads: async (leadIds: number[], title: string, scheduledAt: string, notes?: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/manager/leads/bulk-followup', {
      method: 'POST',
      body: JSON.stringify({ lead_ids: leadIds, title, scheduled_at: scheduledAt, notes }),
    });
  },

  bulkDeleteLeads: async (leadIds: number[]): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/manager/leads/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ lead_ids: leadIds }),
    });
  },

  getReports: async (params?: Record<string, string>): Promise<{ success: boolean; report_type: string; report_data: any; generated_at: string }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/manager/reports?${query}`, { method: 'GET' });
  },
};

export const adminApi = {
  getDashboard: async (): Promise<{ success: boolean; kpis: any; charts: any; alerts: any[] }> => {
    return apiRequest('/admin/dashboard', { method: 'GET' });
  },

  getSystemHealth: async (): Promise<{ success: boolean; api: any; database: any; mlService: any; emailService: any; checkedAt: string }> => {
    return apiRequest('/admin/system/health', { method: 'GET' });
  },

  globalSearch: async (q: string): Promise<{ success: boolean; results: { leads: any[]; users: any[]; deals: any[] } }> => {
    return apiRequest(`/admin/search?q=${encodeURIComponent(q)}`, { method: 'GET' });
  },

  getUsers: async (params?: Record<string, string>): Promise<{ success: boolean; users: User[] }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${query}`, { method: 'GET' });
  },

  updateUser: async (id: number, payload: Partial<User>): Promise<{ success: boolean; message: string; user: User }> => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  toggleUserStatus: async (id: number): Promise<{ success: boolean; message: string; user: User }> => {
    return apiRequest(`/admin/users/${id}/status`, { method: 'PATCH' });
  },

  triggerPasswordReset: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/users/${id}/reset-password`, { method: 'POST' });
  },

  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
  },

  getLeads: async (params?: Record<string, string>): Promise<{ success: boolean; data: any[]; pagination: any; website_metrics: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/leads?${query}`, { method: 'GET' });
  },

  assignLead: async (id: number, assignedTo: number | null): Promise<{ success: boolean; message: string; data: any }> => {
    return apiRequest(`/admin/leads/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
  },

  deleteLead: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/leads/${id}`, { method: 'DELETE' });
  },

  getMlOverview: async (): Promise<{ success: boolean; active_model: any }> => {
    return apiRequest('/admin/ml/overview', { method: 'GET' });
  },

  getMlModels: async (): Promise<{ success: boolean; models: any[] }> => {
    return apiRequest('/admin/ml/models', { method: 'GET' });
  },

  compareMlModels: async (modelIds?: string): Promise<{ success: boolean; comparison: any[]; highlights: any }> => {
    const query = modelIds ? `?model_ids=${modelIds}` : '';
    return apiRequest(`/admin/ml/compare${query}`, { method: 'GET' });
  },

  activateMlModel: async (id: number): Promise<{ success: boolean; message: string; active_model: any }> => {
    return apiRequest(`/admin/ml/models/${id}/activate`, { method: 'POST' });
  },

  getFeatureImportance: async (): Promise<{ success: boolean; model_name: string; feature_importance: Record<string, number> }> => {
    return apiRequest('/admin/ml/feature-importance', { method: 'GET' });
  },

  getPredictions: async (page = 1): Promise<{ success: boolean; data: any[]; pagination: any }> => {
    return apiRequest(`/admin/ml/predictions?page=${page}`, { method: 'GET' });
  },

  trainModel: async (payload: { algorithm: string; dataset_id?: number }): Promise<{ success: boolean; message: string; model: any }> => {
    return apiRequest('/admin/ml/train', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getDatasets: async (): Promise<{ success: boolean; datasets: any[] }> => {
    return apiRequest('/admin/datasets', { method: 'GET' });
  },

  getDatasetQualityReport: async (id: number): Promise<{ success: boolean; dataset_name: string; metrics: any }> => {
    return apiRequest(`/admin/datasets/${id}/quality-report`, { method: 'GET' });
  },

  getDatasetPreview: async (id: number, page = 1, perPage = 10): Promise<{ success: boolean; dataset_name: string; headers: string[]; rows: any[][]; pagination: any }> => {
    return apiRequest(`/admin/datasets/${id}/preview?page=${page}&per_page=${perPage}`, { method: 'GET' });
  },

  uploadDataset: async (formData: FormData): Promise<{ success: boolean; message: string; dataset: any }> => {
    return apiRequest('/admin/datasets', {
      method: 'POST',
      body: formData,
    });
  },

  deleteDataset: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/datasets/${id}`, { method: 'DELETE' });
  },

  getAnalytics: async (params?: Record<string, string>): Promise<{ success: boolean; date_range: string; lead_analytics: any; sales_analytics: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/analytics?${query}`, { method: 'GET' });
  },

  getAuditLogs: async (params?: Record<string, string>): Promise<{ success: boolean; data: any[]; pagination: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs?${query}`, { method: 'GET' });
  },

  getSecurityActivity: async (): Promise<{ success: boolean; security_activity: any[] }> => {
    return apiRequest('/admin/profile/security-activity', { method: 'GET' });
  },

  getEmailTemplates: async (): Promise<{ success: boolean; templates: any[] }> => {
    return apiRequest('/admin/email-templates', { method: 'GET' });
  },

  sendTestEmail: async (id: number, recipientEmail: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/email-templates/${id}/send-test`, {
      method: 'POST',
      body: JSON.stringify({ recipient_email: recipientEmail }),
    });
  },

  updateEmailTemplate: async (id: number, payload: { subject: string; body_html: string; is_enabled: boolean }): Promise<{ success: boolean; message: string; template: any }> => {
    return apiRequest(`/admin/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getSettings: async (): Promise<{ success: boolean; settings: Record<string, any> }> => {
    return apiRequest('/admin/settings', { method: 'GET' });
  },

  updateSettings: async (settings: Record<string, any>): Promise<{ success: boolean; message: string; settings: Record<string, any> }> => {
    return apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  toggleMaintenanceMode: async (enabled: boolean): Promise<{ success: boolean; message: string; maintenance_mode: boolean }> => {
    return apiRequest('/admin/settings/maintenance-mode', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },
};

export const salesRepApi = {
  getDashboard: async (): Promise<{ success: boolean; kpis: any; priorities: any }> => {
    return apiRequest('/sales-rep/dashboard', { method: 'GET' });
  },

  getLeads: async (params?: Record<string, string>): Promise<{ success: boolean; data: any[]; pagination: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sales-rep/leads?${query}`, { method: 'GET' });
  },

  getPriorityLeads: async (): Promise<{ success: boolean; hot_leads: any[]; high_priority_leads: any[]; followup_due_today: any[]; overdue_followups: any[] }> => {
    return apiRequest('/sales-rep/priority-leads', { method: 'GET' });
  },

  getLeadDetails: async (id: number): Promise<{ success: boolean; lead: any; ai_prediction: any; timeline: any }> => {
    return apiRequest(`/sales-rep/leads/${id}`, { method: 'GET' });
  },

  getActivities: async (params?: Record<string, string>): Promise<{ success: boolean; data: any[]; pagination: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sales-rep/activities?${query}`, { method: 'GET' });
  },

  logActivity: async (payload: { lead_id: number; activity_type: string; outcome?: string; notes?: string }): Promise<{ success: boolean; message: string; activity: any }> => {
    return apiRequest('/sales-rep/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getFollowUps: async (): Promise<{ success: boolean; today: any[]; upcoming: any[]; overdue: any[]; completed: any[] }> => {
    return apiRequest('/sales-rep/follow-ups', { method: 'GET' });
  },

  createFollowUp: async (payload: { lead_id: number; scheduled_at: string; type?: string; priority?: string; notes?: string }): Promise<{ success: boolean; message: string; followup: any }> => {
    return apiRequest('/sales-rep/follow-ups', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  completeFollowUp: async (id: number): Promise<{ success: boolean; message: string; followup: any }> => {
    return apiRequest(`/sales-rep/follow-ups/${id}/complete`, { method: 'PATCH' });
  },

  getPipeline: async (): Promise<{ success: boolean; pipeline: Record<string, any>; total_pipeline_value: number }> => {
    return apiRequest('/sales-rep/pipeline', { method: 'GET' });
  },

  updatePipelineStage: async (id: number, stage: string): Promise<{ success: boolean; message: string; lead: any }> => {
    return apiRequest(`/sales-rep/pipeline/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },

  getEmails: async (): Promise<{ success: boolean; email_history: any[]; templates: any[] }> => {
    return apiRequest('/sales-rep/emails', { method: 'GET' });
  },

  sendCustomerEmail: async (payload: { lead_id: number; subject: string; body_html: string }): Promise<{ success: boolean; message: string; activity?: any }> => {
    return apiRequest('/sales-rep/emails/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAnalytics: async (params?: Record<string, string>): Promise<{ success: boolean; date_range: string; metrics: any; temperature_distribution: any; source_breakdown: any[] }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sales-rep/analytics?${query}`, { method: 'GET' });
  },

  getGoals: async (): Promise<{ success: boolean; goals: any[] }> => {
    return apiRequest('/sales-rep/goals', { method: 'GET' });
  },

  getNotifications: async (): Promise<{ success: boolean; notifications: any[] }> => {
    return apiRequest('/sales-rep/notifications', { method: 'GET' });
  },

  markNotificationRead: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/sales-rep/notifications/${id}/read`, { method: 'PATCH' });
  },

  getProfile: async (): Promise<{ success: boolean; user: any; security_activity: any[] }> => {
    return apiRequest('/sales-rep/profile', { method: 'GET' });
  },

  updateProfile: async (payload: { name: string; phone?: string; current_password?: string; new_password?: string }): Promise<{ success: boolean; message: string; user: any }> => {
    return apiRequest('/sales-rep/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

export const notificationApi = {
  getPreferences: async (): Promise<{ success: boolean; preferences: any }> => {
    return apiRequest<{ success: boolean; preferences: any }>('/notification-settings', {
      method: 'GET',
    });
  },

  updatePreferences: async (payload: Record<string, boolean>): Promise<{ success: boolean; message: string; preferences: any }> => {
    return apiRequest<{ success: boolean; message: string; preferences: any }>('/notification-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

export default authApi;
