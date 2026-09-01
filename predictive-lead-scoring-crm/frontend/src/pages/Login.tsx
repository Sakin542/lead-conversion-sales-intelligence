import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { LoginFormData, FormErrors } from '../types/auth';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Signed in successfully.');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glow Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Full Black Login Card Container */}
        <div className="max-w-md w-full bg-black rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-10 space-y-6 relative z-10 text-white">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Log In
            </h2>
            <p className="text-sm text-slate-400">
              Sign in to manage your high-converting lead pipeline
            </p>
          </div>

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center space-x-2.5 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
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
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
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
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                autoComplete="current-password"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-500 rounded border-slate-700 bg-slate-950 accent-indigo-500 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">Remember me</span>
              </label>

              <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none font-bold"
                isLoading={isSubmitting}
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
              Register Free Account
            </Link>
          </div>
        </div>
      </main>

      {/* Auth Variant Footer */}
      <Footer variant="auth" />
    </div>
  );
};

export default Login;
