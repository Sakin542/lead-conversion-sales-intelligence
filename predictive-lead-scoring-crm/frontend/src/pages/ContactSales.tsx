import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { publicApi } from '../services/api';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  DollarSign,
} from 'lucide-react';

export const ContactSales: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    industry: '',
    company_size: '',
    interested_in: '',
    budget: '',
    revenue: '',
    country: '',
    website: '',
    preferred_contact_method: 'EMAIL',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = 'Full Name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Business Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await publicApi.submitLead({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        job_title: formData.job_title.trim() || undefined,
        industry: formData.industry || undefined,
        company_size: formData.company_size || undefined,
        interested_in: formData.interested_in || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
        country: formData.country.trim() || undefined,
        website: formData.website.trim() || undefined,
        preferred_contact_method: formData.preferred_contact_method || undefined,
        message: formData.message.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage(res.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          job_title: '',
          industry: '',
          company_size: '',
          interested_in: '',
          budget: '',
          revenue: '',
          country: '',
          website: '',
          preferred_contact_method: 'EMAIL',
          message: '',
        });
      } else {
        setErrorMessage(res.message || 'An error occurred while submitting your inquiry.');
      }
    } catch (err: any) {
      console.error('Public lead submission error:', err);
      setErrorMessage(err.message || 'Unable to submit inquiry right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      <Navbar />

      {/* Background Neon Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-950/40 via-purple-950/30 to-cyan-950/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Connect With Our Sales Intelligence Team</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading">
            Get Started with <span className="gradient-text-animated">PredictiveCRM</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Tell us about your business goals and requirements. Our enterprise team will evaluate your needs and get in touch shortly.
          </p>
        </div>

        {/* Form Container Card */}
        <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800/90 shadow-2xl space-y-6 relative overflow-hidden">
          {successMessage ? (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white font-heading">Inquiry Submitted Successfully</h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">{successMessage}</p>
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuccessMessage(null)}
                  className="border-slate-800 text-indigo-400 hover:bg-slate-800 font-bold"
                >
                  Submit Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-3 text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Basic Contact Info Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    name="name"
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                  />

                  <Input
                    label="Business Email *"
                    name="email"
                    type="email"
                    placeholder="sarah@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <div className="w-full space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 tracking-wide">
                      Preferred Contact Method
                    </label>
                    <select
                      name="preferred_contact_method"
                      value={formData.preferred_contact_method}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-800 text-slate-100 text-sm bg-slate-950 min-h-[42px] px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="PHONE">Phone Call</option>
                      <option value="WHATSAPP">WhatsApp / Message</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Company & Firmographic Information Grid */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-400" />
                  <span>Company Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    name="company"
                    type="text"
                    placeholder="Acme Enterprise Inc."
                    value={formData.company}
                    onChange={handleChange}
                  />

                  <Input
                    label="Job Title"
                    name="job_title"
                    type="text"
                    placeholder="VP of Sales / Director"
                    value={formData.job_title}
                    onChange={handleChange}
                  />

                  <div className="w-full space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 tracking-wide">
                      Industry Classification
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-800 text-slate-100 text-sm bg-slate-950 min-h-[42px] px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="">Select Industry</option>
                      <option value="SaaS">SaaS & Enterprise Software</option>
                      <option value="Finance">Financial Services & Banking</option>
                      <option value="E-commerce">E-commerce & Retail</option>
                      <option value="Healthcare">Healthcare & Biotech</option>
                      <option value="Manufacturing">Manufacturing & Supply Chain</option>
                      <option value="Education">Education & EdTech</option>
                      <option value="Other">Other Industry</option>
                    </select>
                  </div>

                  <div className="w-full space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 tracking-wide">
                      Company Size
                    </label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-800 text-slate-100 text-sm bg-slate-950 min-h-[42px] px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="">Select Company Size</option>
                      <option value="1-10">1 - 10 Employees</option>
                      <option value="11-50">11 - 50 Employees</option>
                      <option value="51-200">51 - 200 Employees</option>
                      <option value="201-500">201 - 500 Employees</option>
                      <option value="500+">500+ Enterprise Employees</option>
                    </select>
                  </div>

                  <Input
                    label="Country"
                    name="country"
                    type="text"
                    placeholder="United States, United Kingdom..."
                    value={formData.country}
                    onChange={handleChange}
                  />

                  <Input
                    label="Company Website"
                    name="website"
                    type="url"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Requirement & Budget Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Requirements & Budget</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 tracking-wide">
                      Interested Product / Service
                    </label>
                    <select
                      name="interested_in"
                      value={formData.interested_in}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-800 text-slate-100 text-sm bg-slate-950 min-h-[42px] px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="">Select Product / Service</option>
                      <option value="AI Predictive Lead Scoring Engine">AI Predictive Lead Scoring Engine</option>
                      <option value="Omnichannel Activity Tracking">Omnichannel Activity Tracking</option>
                      <option value="Enterprise Sales Pipeline CRM">Enterprise Sales Pipeline CRM</option>
                      <option value="Custom ML Model Retraining">Custom ML Model Retraining</option>
                      <option value="Full Enterprise Suite">Full Enterprise Suite</option>
                    </select>
                  </div>

                  <Input
                    label="Expected Budget (USD)"
                    name="budget"
                    type="number"
                    placeholder="e.g. 25000"
                    value={formData.budget}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Project Requirements / Additional Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Tell us about your team size, sales volume, and specific scoring requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl p-3.5 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">
                  By submitting this form, you agree to our Privacy Policy. Your inquiry is safe with us.
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={loading}
                  className="w-full sm:w-auto px-8 font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-xl shadow-indigo-500/20"
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Inquiry
                </Button>
              </div>
            </form>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ContactSales;

