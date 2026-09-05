import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { LoginFormData, FormErrors } from '../types/auth';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'SALES_MANAGER') {
        navigate('/manager/dashboard', { replace: true });
      } else if (user.role === 'SALES_REP') {
        navigate('/sales-rep/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      setSuccessMessage('Signed in successfully.');
    } catch (err: any) {
      if (err.data?.errors) {
        const fieldErrors: FormErrors = {};
        Object.keys(err.data.errors).forEach((key) => {
          fieldErrors[key] = err.data.errors[key][0];
        });
        setErrors(fieldErrors);
      } else {
        const msg = err.data?.message || err.message;
        setApiError(!msg || msg === 'Invalid credentials' ? 'Invalid email or password' : msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0D] text-zinc-100 font-sans antialiased selection:bg-[#FF7A00]/30 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF7A00]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Enterprise Login Card Container */}
        <div className="max-w-md w-full bg-[#171718] rounded-xl shadow-2xl border border-[#2A2A2E] p-6 sm:p-8 space-y-6 relative z-10 text-white">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Log In
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              Sign in to manage your high-converting lead pipeline
            </p>
          </div>

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center space-x-2.5 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {apiError && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center space-x-2.5 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-[#71717A]" />}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4 text-[#71717A]" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[#71717A] hover:text-white focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#2A2A2E] bg-[#111113] accent-[#FF7A00] cursor-pointer"
                />
                <span className="text-[#A1A1AA] font-medium">Remember me</span>
              </label>

              <Link to="/forgot-password" className="font-medium text-[#FF7A00] hover:text-[#FF8C1A] transition-colors">
                Forgot your password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="ai"
                size="lg"
                className="w-full justify-center font-bold"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Auth Variant Footer */}
      <Footer variant="auth" />
    </div>
  );
};

export default Login;
