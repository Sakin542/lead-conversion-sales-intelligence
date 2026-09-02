import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { salesRepApi } from '../../services/api';
import { Mail, Send } from 'lucide-react';

export const SalesRepEmailCenter: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Send Email Modal State
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [_selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [leadIdInput, setLeadIdInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getEmails();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    setEmailSubject(tpl.subject || '');
    setEmailBody(tpl.body_html || '');
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadIdInput || !emailSubject || !emailBody) return;

    setIsSending(true);
    try {
      const res = await salesRepApi.sendCustomerEmail({
        lead_id: Number(leadIdInput),
        subject: emailSubject,
        body_html: `<p>${emailBody.replace(/\n/g, '<br>')}</p>`,
      });

      if (res.success) {
        setIsSendModalOpen(false);
        setLeadIdInput('');
        setEmailSubject('');
        setEmailBody('');
        fetchEmails();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to send customer email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Mail className="w-7 h-7 text-indigo-400" />
              <span>Customer Email Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Dispatch emails using approved templates and track sent customer communications.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSendModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold"
            leftIcon={<Send className="w-4 h-4" />}
          >
            Compose Email
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Approved Templates List */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Approved Templates
              </h3>

              <div className="space-y-2">
                {data?.templates?.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      handleSelectTemplate(t);
                      setIsSendModalOpen(true);
                    }}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-800 cursor-pointer transition-colors space-y-1"
                  >
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[11px] text-indigo-400 truncate">{t.subject}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Email Outreach History */}
            <Card className="lg:col-span-2 p-5 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Sent Customer Emails History
              </h3>

              {data?.email_history?.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No customer emails sent yet.</p>
              ) : (
                <div className="space-y-3">
                  {data?.email_history?.map((e: any) => (
                    <div key={e.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-white">
                          To: {e.lead ? `${e.lead.first_name} ${e.lead.last_name} (${e.lead.email})` : 'Customer'}
                        </p>
                        <p className="text-xs text-slate-300">{e.notes || e.description}</p>
                        <p className="text-[10px] text-slate-500">{new Date(e.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={e.outcome === 'Sent' ? 'success' : 'danger'} size="sm">
                        {e.outcome || 'Sent'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Compose / Template Dispatch Modal */}
        {isSendModalOpen && (
          <Modal
            isOpen={isSendModalOpen}
            onClose={() => setIsSendModalOpen(false)}
            title="Compose & Dispatch Customer Email"
          >
            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              <Input
                label="Target Lead ID"
                type="number"
                value={leadIdInput}
                onChange={(e) => setLeadIdInput(e.target.value)}
                placeholder="Enter Lead ID number..."
                required
              />

              <Input
                label="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. Next Steps - Product Demo"
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Body Text</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSendModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSending} className="bg-indigo-600 border-none font-bold">
                  Send Email
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepEmailCenter;
