export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  company: string;
  password: string;
  passwordConfirmation: string;
}

export interface FormErrors {
  [key: string]: string;
}

