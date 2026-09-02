import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { salesRepApi } from '../../services/api';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  Send,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';

export const SalesRepLeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Send Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const fetchLeadDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await salesRepApi.getLeadDetails(Number(id));
      if (res.success) {
        setData(res);
      } else {
        setError('Lead details could not be loaded.');
      }
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Forbidden or Lead not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !emailSubject || !emailBody) return;

    setIsSendingEmail(true);
    setEmailSuccess(null);
    try {
      const res = await salesRepApi.sendCustomerEmail({
        lead_id: Number(id),
        subject: emailSubject,
        body_html: `<p>${emailBody.replace(/\n/g, '<br>')}</p>`,
      });

      if (res.success) {
        setEmailSuccess(`Email successfully sent to ${data?.lead?.email}.`);
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailSubject('');
          setEmailBody('');
          setEmailSuccess(null);
          fetchLeadDetails();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to dispatch email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const lead = data?.lead;
  const ai = data?.ai_prediction;
  const timeline = data?.timeline;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/sales-rep/leads')}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {lead ? `${lead.first_name} ${lead.last_name}` : 'Lead Details'}
              </h1>
              <p className="text-xs text-slate-400">
                {lead?.company || 'Prospect Profile'} • Created {lead?.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold"
          >
            <Send className="w-4 h-4 mr-1.5" /> Send Customer Email
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card className="p-8 bg-slate-900/80 border-slate-800 text-center space-y-3">
            <p className="text-sm font-bold text-rose-400">{error}</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/sales-rep/leads')}>
              Return to My Leads
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Lead Overview */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Lead Overview
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Company</span>
                  <span className="text-white font-extrabold text-sm">{lead?.company || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Email Address</span>
                  <span className="text-indigo-400 font-semibold">{lead?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Phone Number</span>
                  <span className="text-slate-200">{lead?.phone || '+1 (555) 019-2834'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Industry / Job Title</span>
                  <span className="text-slate-300">{lead?.industry || 'Enterprise Software'} • {lead?.job_title || 'Decision Maker'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Country / Location</span>
                  <span className="text-slate-300">{lead?.country || 'United States'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Lead Source</span>
                  <span className="text-slate-300">{lead?.source || 'Website Registration'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Pipeline Stage</span>
                  <Badge variant="primary" size="sm" className="mt-1">{lead?.status?.toUpperCase()}</Badge>
                </div>
              </div>
            </Card>

            {/* Middle & Right Column: AI Intelligence & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Prediction & Recommendations Card */}
              <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">AI Lead Intelligence</h3>
                  </div>
                  <Badge variant={ai?.temperature === 'HOT' ? 'warning' : 'primary'} size="md">
                    {ai?.temperature} Intent
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between h-full">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">AI Lead Score</span>
                    <p className="text-2xl font-black text-indigo-400 mt-1">{ai?.score}/100</p>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between h-full">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Conversion Prob.</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{ai?.conversion_probability}</p>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between h-full">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Active Engine</span>
                    <p className="text-xs font-bold text-white truncate mt-1">{ai?.model}</p>
                  </div>
                </div>

                {/* Why is this score HOT/WARM? */}
                <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    Why is this lead scored {ai?.temperature}?
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1 pl-1">
                    {ai?.explanations?.map((exp: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{exp}</li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommended Next Action */}
                <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-800/60 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">AI Recommended Next Action</h4>
                  </div>
                  <p className="text-sm font-extrabold text-white">{ai?.recommended_action?.action}</p>
                  <p className="text-xs text-indigo-300/80">{ai?.recommended_action?.reason}</p>
                </div>
              </Card>

              {/* Chronological Lead Timeline */}
              <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Chronological Activity &amp; Touchpoint Timeline</span>
                </h3>

                <div className="space-y-3 pl-2">
                  {timeline?.activities?.length === 0 && timeline?.followups?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No recorded activity history yet.</p>
                  ) : (
                    <>
                      {timeline?.activities?.map((act: any) => (
                        <div key={`act-${act.id}`} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-indigo-400 uppercase">{act.activity_type} Logged</span>
                            <p className="text-xs text-slate-200 mt-1">{act.description || act.notes}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{new Date(act.created_at).toLocaleString()}</p>
                          </div>
                          <Badge variant="secondary" size="sm">{act.outcome || 'Logged'}</Badge>
                        </div>
                      ))}

                      {timeline?.followups?.map((f: any) => (
                        <div key={`fol-${f.id}`} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-cyan-400 uppercase">Scheduled Follow-up</span>
                            <p className="text-xs text-slate-200 mt-1">{f.notes || 'Follow-up scheduled'}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{new Date(f.scheduled_at).toLocaleString()}</p>
                          </div>
                          <Badge variant={f.status === 'completed' ? 'success' : 'warning'} size="sm">
                            {f.status}
                          </Badge>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Smart Email Modal */}
        {isEmailModalOpen && (
          <Modal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            title={`Send Email to ${lead?.first_name} ${lead?.last_name}`}
          >
            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              {emailSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{emailSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Recipient Email</label>
                <input
                  type="text"
                  disabled
                  value={lead?.email || ''}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400"
                />
              </div>

              <Input
                label="Email Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. Schedule Product Demo - Predictive CRM"
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Body Content</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                  placeholder="Dear customer, following up regarding your product demo request..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEmailModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSendingEmail} className="bg-indigo-600 border-none font-bold">
                  Send Email Now
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepLeadDetails;
