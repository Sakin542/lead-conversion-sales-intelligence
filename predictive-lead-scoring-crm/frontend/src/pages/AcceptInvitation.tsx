import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FormErrors } from '../types/auth';

export const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { acceptInvitation } = useAuth();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [invitationUser, setInvitationUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setVerificationError('Missing invitation token or email address.');
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.verifyInvitation(email, token);
        if (response.success && response.user) {
          setInvitationUser(response.user);
        } else {
          setVerificationError('Invalid or expired invitation token.');
        }
      } catch (err: any) {
        setVerificationError(err.data?.message || 'Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!passwordConfirmation) {
      newErrors.passwordConfirmation = 'Please confirm your password';
    } else if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await acceptInvitation(email, token, password, passwordConfirmation);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (err: any) {
      setApiError(err.data?.message || err.message || 'Failed to activate account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-black rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-10 space-y-6 relative z-10 text-white">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Activate CRM Account
            </h2>
            <p className="text-xs text-slate-400">
              Set a secure password to complete your account invitation
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Verifying invitation link...
            </div>
          ) : verificationError ? (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl space-y-3 text-center">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm text-rose-300 font-medium">{verificationError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="w-full justify-center border-rose-800 text-rose-200 hover:bg-rose-900/40"
              >
                Go to Login
              </Button>
            </div>
          ) : success ? (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm text-emerald-300 font-bold">Account Activated Successfully!</p>
              <p className="text-xs text-slate-400">Redirecting to your CRM dashboard...</p>
            </div>
          ) : (
            <>
              {invitationUser && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Account Name:</span>
                    <span className="text-slate-200 font-bold">{invitationUser.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Email:</span>
                    <span className="text-slate-200 font-bold">{invitationUser.email}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Assigned Role:</span>
                    <span className="text-indigo-400 font-bold uppercase">{invitationUser.role?.replace('_', ' ')}</span>
                  </div>
                </div>
              )}

              {apiError && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center space-x-2.5 text-rose-400 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="relative">
                  <Input
                    label="Create Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-200 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  name="passwordConfirmation"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  error={errors.passwordConfirmation}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none font-bold"
                    isLoading={isSubmitting}
                  >
                    Activate Account & Log In
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
};

export default AcceptInvitation;

