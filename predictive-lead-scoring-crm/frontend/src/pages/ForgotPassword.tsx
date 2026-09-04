import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0D] text-zinc-100 selection:bg-[#FF7A00]/30 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glow Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF7A00]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Forgot Password Card Container */}
        <div className="max-w-md w-full bg-[#171718] rounded-xl border border-[#2A2A2E] shadow-2xl p-6 sm:p-8 relative z-10 text-white">
          <ForgotPasswordForm />
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
};

export default ForgotPassword;
