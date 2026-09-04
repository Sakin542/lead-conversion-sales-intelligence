import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { authApi } from '../services/api';
import { FormErrors } from '../types/auth';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || searchParams.get('code') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'New password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!passwordConfirmation) {
      newErrors.passwordConfirmation = 'Please confirm your new password.';
    } else if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setApiError(null);
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        email: email.trim(),
        token: tokenParam,
        code: tokenParam,
        password,
        password_confirmation: passwordConfirmation,
      });

      setIsSuccess(true);
    } catch (err: any) {
      if (err.data?.errors) {
        const fieldErrors: FormErrors = {};
        Object.keys(err.data.errors).forEach((key) => {
          fieldErrors[key] = err.data.errors[key][0];
        });
        setErrors(fieldErrors);
      } else {
        setApiError(err.data?.message || err.message || 'Invalid or expired password reset link. Please request a new link.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0D] text-zinc-100 selection:bg-[#FF7A00]/30 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glow Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#171718] rounded-2xl border border-[#2A2A2E] shadow-2xl p-6 sm:p-10 backdrop-blur-xl relative z-10 text-white space-y-6">
          {isSuccess ? (
            <div className="space-y-6 text-center" role="status" aria-live="polite">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Password Reset Complete!
                </h1>
                <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
                  Your password has been successfully updated. You can now log in with your new credentials.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="ai"
                  size="lg"
                  className="w-full justify-center font-bold"
                  onClick={() => navigate('/login', { replace: true })}
                >
                  Sign In Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Set New Password
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Please enter your account email and choose a strong new password.
                </p>
              </div>

              {apiError && (
                <div
                  className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-start space-x-3 text-rose-300 text-sm"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{apiError}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  error={errors.email}
                  leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
                  autoComplete="email"
                  required
                />

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    error={errors.password}
                    leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-zinc-400 hover:text-white focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="passwordConfirmation"
                    placeholder="Re-enter new password"
                    value={passwordConfirmation}
                    onChange={(e) => {
                      setPasswordConfirmation(e.target.value);
                      if (errors.passwordConfirmation)
                        setErrors((prev) => ({ ...prev, passwordConfirmation: '' }));
                    }}
                    error={errors.passwordConfirmation}
                    leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-zinc-400 hover:text-white focus:outline-none"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="ai"
                    size="lg"
                    className="w-full justify-center font-bold tracking-wide"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </form>

              <div className="border-t border-[#2A2A2E] pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-[#FF7A00] hover:text-[#FF8C1A] transition-colors group focus:outline-none focus:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
};

export default ResetPassword;

