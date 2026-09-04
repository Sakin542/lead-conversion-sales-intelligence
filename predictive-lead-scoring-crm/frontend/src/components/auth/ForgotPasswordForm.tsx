import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { authApi } from '../../services/api';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError(null);
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setApiError(null);
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      const status = err.status || (err.response && err.response.status);
      if (status === 422) {
        const backendMessage = err.data?.message || err.data?.errors?.email?.[0] || 'Invalid email address provided.';
        setApiError(backendMessage);
      } else if (status === 429) {
        setApiError('Too many password reset requests. Please wait a few minutes and try again.');
      } else if (status >= 500) {
        setApiError('Something went wrong. Please try again later.');
      } else if (!window.navigator.onLine || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        setApiError('Unable to connect to the server. Please check your connection and try again.');
      } else {
        setApiError(err.data?.message || err.message || 'Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center" role="status" aria-live="polite">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Reset link sent
          </h2>
          <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
            If an account exists for <span className="font-semibold text-[#FF7A00]">{email}</span>, we've sent you a password reset link.
          </p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto pt-1">
            Please check your inbox and follow the instructions to reset your password.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm bg-[#1A1A1C] hover:bg-[#222225] text-white border border-[#2A2A2E] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <div>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setEmailError(null);
                setApiError(null);
              }}
              className="text-xs text-[#FF7A00] hover:text-[#FF8C1A] font-medium focus:outline-none transition-colors"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          No worries. Enter your registered email address and we'll send you a secure link to reset your password.
        </p>
      </div>

      {apiError && (
        <div
          className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start space-x-3 text-rose-300 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{apiError}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <Input
            label="Email Address"
            type="email"
            name="email"
            id="forgot-password-email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            error={emailError || undefined}
            leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
            autoComplete="email"
            required
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error-text' : undefined}
          />
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </div>
      </form>

      <div className="border-t border-[#2A2A2E] pt-4 text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-medium text-[#FF7A00] hover:text-[#FF8C1A] transition-colors group focus:outline-none focus:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

