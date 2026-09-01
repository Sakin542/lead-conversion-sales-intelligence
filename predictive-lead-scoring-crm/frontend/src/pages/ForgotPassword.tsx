import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glow Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Forgot Password Card Container */}
        <div className="max-w-md w-full bg-black rounded-2xl border border-slate-800/90 shadow-2xl p-6 sm:p-10 backdrop-blur-xl relative z-10 text-white">
          <ForgotPasswordForm />
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
};

export default ForgotPassword;
