import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Sparkles, TrendingUp, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FormErrors } from '../types/auth';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  // Current Step: 1 = Email, 2 = Verify Code, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form States
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 Validation: Email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 500);
  };

  // Step 2 Validation: 6-Digit Code
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (errors.code) setErrors({});

    // Auto-focus next input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length < 6) {
      setErrors({ code: 'Please enter the complete 6-digit code' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 500);
  };

  // Step 3 Validation: New Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-slate-900/90 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative z-10">
          {/* Left Column - Dynamic Step Content */}
          <div className="md:col-span-7 p-6 sm:p-10 space-y-6">
            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-semibold">
              <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-indigo-400' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[10px]">1</span>
                <span>Email</span>
              </div>
              <span className="text-slate-700">──</span>
              <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-indigo-400' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[10px]">2</span>
                <span>Verify Code</span>
              </div>
              <span className="text-slate-700">──</span>
              <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-indigo-400' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[10px]">3</span>
                <span>New Password</span>
              </div>
            </div>

            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/80 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Step 1 of 3: Account Recovery</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Reset Your Password
                  </h2>
                  <p className="text-sm text-slate-400">
                    Enter your registered work email address below to receive a verification code.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleEmailSubmit} noValidate>
                  <Input
                    label="Registered Work Email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                    error={errors.email}
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                    autoComplete="email"
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full justify-center shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none font-bold"
                      isLoading={isSubmitting}
                    >
                      Send Verification Code
                    </Button>
                  </div>
                </form>

                <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
                  <Link to="/login" className="inline-flex items-center font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* STEP 2: Enter 6-Digit Code */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/80 text-xs font-bold">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Step 2 of 3: Verification Code</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Enter Verification Code
                  </h2>
                  <p className="text-sm text-slate-400">
                    We have sent a 6-digit code to <strong className="text-slate-200">{email}</strong>.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleCodeSubmit} noValidate>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      6-Digit Security Code
                    </label>
                    <div className="flex gap-2 sm:gap-3 justify-between">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-input-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !code[index] && index > 0) {
                              const prevInput = document.getElementById(`code-input-${index - 1}`);
                              prevInput?.focus();
                            }
                          }}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-950 border border-slate-800 rounded-xl text-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      ))}
                    </div>
                    {errors.code && <p className="text-xs text-red-400 font-medium mt-2">{errors.code}</p>}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full justify-center shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none font-bold"
                      isLoading={isSubmitting}
                    >
                      Verify Code
                    </Button>
                  </div>
                </form>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center font-semibold text-slate-400 hover:text-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Change Email
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Verification code resent!')}
                    className="font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/80 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Step 3 of 3: New Credentials</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-sm text-slate-400">
                    Create a new secure password for your PredictiveCRM account.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handlePasswordSubmit} noValidate>
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                      }}
                      error={errors.newPassword}
                      leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Input
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    error={errors.confirmPassword}
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
                      Reset Password
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4: Success Screen */}
            {step === 4 && (
              <div className="space-y-6 text-center py-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Password Reset Complete
                  </h2>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none font-bold"
                    onClick={() => navigate('/login')}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - SaaS Security Panel */}
          <div className="hidden md:flex md:col-span-5 bg-black text-white p-8 flex-col justify-between relative overflow-hidden border-l border-slate-800">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-2 text-indigo-400">
                <TrendingUp className="w-6 h-6" />
                <span className="font-extrabold text-lg tracking-tight text-white">PredictiveCRM</span>
              </div>

              <div className="space-y-3 pt-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/80 text-indigo-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white leading-snug">
                  Multi-Factor Account Protection
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We use time-based security codes and encrypted verification channels to ensure your account details remain 100% secure.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between relative z-10">
              <span className="flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1" /> Encrypted Protocol
              </span>
              <span>24/7 Security</span>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
};

export default ForgotPassword;
