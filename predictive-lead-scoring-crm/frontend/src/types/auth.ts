export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
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

export interface RegisterFormData {
  name: string;
  email: string;
  company?: string;
  password: string;
  passwordConfirmation: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface FormErrors {
  [key: string]: string;
}

