export type UserRole = 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  invited_by?: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  errors?: Record<string, string[]>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface InviteUserFormData {
  name: string;
  email: string;
  role: UserRole;
}

export interface AcceptInvitationFormData {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface FormErrors {
  [key: string]: string;
}
