import { AuthResponse, ForgotPasswordResponse, User } from '../types/auth';

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
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

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

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    try {
      return await apiRequest<{ success: boolean; message: string }>('/auth/account', {
        method: 'DELETE',
      });
    } finally {
      removeToken();
    }
  },

  getProtectedData: async (): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>('/protected', {
      method: 'GET',
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

