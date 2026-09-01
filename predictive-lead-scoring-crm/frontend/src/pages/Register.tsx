import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Building, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RegisterFormData, FormErrors } from '../types/auth';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    company: '',
    password: '',
    passwordConfirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
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
      setSuccessMessage('Account created successfully!');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glow Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Full Black Register Card Container */}
        <div className="max-w-md w-full bg-black rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-10 space-y-6 relative z-10 text-white">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Create an Account
            </h2>
            <p className="text-sm text-slate-400">
              Join thousands of sales teams scoring leads with AI
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
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Work Email"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Company Name"
              type="text"
              name="company"
              placeholder="Acme Corp"
              value={formData.company}
              onChange={handleChange}
              error={errors.company}
              leftIcon={<Building className="w-4 h-4 text-slate-400" />}
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
              value={formData.passwordConfirmation}
              onChange={handleChange}
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
                Create Account
              </Button>
            </div>
          </form>

          <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Auth Variant Footer */}
      <Footer variant="auth" />
    </div>
  );
};

export default Register;
