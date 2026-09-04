import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { salesRepApi } from '../../services/api';
import { Mail, Send, FileText, Clock, User, Eye, Sparkles } from 'lucide-react';

export const SalesRepEmailCenter: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State for Inline Compose Email Box
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // View Sent Email Detail Modal State
  const [viewEmailModal, setViewEmailModal] = useState<any | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const [res, leadsRes] = await Promise.all([
        salesRepApi.getEmails(),
        salesRepApi.getLeads({ per_page: '100' }).catch(() => ({ success: false, data: [] }))
      ]);

      if (res.success) {
        setData(res);
      }
      if (leadsRes.success && Array.isArray(leadsRes.data)) {
        setLeadsList(leadsRes.data);
        if (leadsRes.data.length > 0 && !selectedLeadId) {
          setSelectedLeadId(String(leadsRes.data[0].id));
        }
      }
    } catch (e) {
      console.error('Error fetching email center data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplateId(String(tpl.id));
    setEmailSubject(tpl.subject || '');
    setEmailBody(tpl.body_html || '');
  };

  const handleTemplateDropdownChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (!tplId) return;
    const tpl = data?.templates?.find((t: any) => String(t.id) === tplId);
    if (tpl) {
      setEmailSubject(tpl.subject || '');
      setEmailBody(tpl.body_html || '');
    }
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !emailSubject || !emailBody) return;

    setIsSending(true);
    try {
      const res = await salesRepApi.sendCustomerEmail({
        lead_id: Number(selectedLeadId),
        subject: emailSubject,
        body_html: emailBody.includes('<p>') ? emailBody : `<p>${emailBody.replace(/\n/g, '<br>')}</p>`,
      });

      if (res.success) {
        setSelectedTemplateId('');
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
      <div className="space-y-6 pb-12 w-full">
        {/* Top Header */}
        <div className="border-b border-[#2A2A2E] pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Mail className="w-7 h-7 text-[#FF7A00]" />
            <span>Customer Email Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Dispatch emails using approved templates, select assigned leads, and track customer email history.
          </p>
        </div>

        {loading ? (
          <div className="min-h-[420px] flex flex-col items-center justify-center space-y-3 bg-[#171718] border border-[#2A2A2E] rounded-xl p-8">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-zinc-400 font-medium">Loading Email Center & Approved Templates...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Row: Approved Templates + Inline Compose Email Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              {/* Approved Templates Column (4 cols) */}
              <Card className="lg:col-span-4 p-5 bg-[#171718] border-[#2A2A2E] flex flex-col min-h-[580px] h-full space-y-4 shadow-lg w-full">
                <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3 shrink-0">
                  <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FF7A00]" />
                    <span>Approved Templates</span>
                  </h3>
                  <Badge variant="neutral" size="sm" className="bg-[#111113] text-[#FF7A00] border-[#2A2A2E] px-2.5 py-0.5 font-bold">
                    {data?.templates?.length || 0} Available
                  </Badge>
                </div>

                {(!data?.templates || data.templates.length === 0) ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <Mail className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-500">No email templates available.</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[500px]">
                    {data?.templates?.map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTemplate(t)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group space-y-2 min-h-[96px] flex flex-col justify-between ${
                          selectedTemplateId === String(t.id)
                            ? 'bg-[#1C1C1E] border-[#FF7A00] shadow-md'
                            : 'bg-[#111113] border-[#2A2A2E] hover:border-[#FF7A00]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-extrabold text-white group-hover:text-[#FF7A00] transition-colors truncate">
                              {t.name}
                            </p>
                            <Sparkles className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#FF7A00] transition-colors shrink-0" />
                          </div>
                          <p className="text-[11px] text-[#FF7A00] font-semibold truncate">
                            {t.subject || 'No subject'}
                          </p>
                        </div>

                        {t.body_html && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {t.body_html.replace(/<[^>]*>?/gm, '')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Compose Email Box Card (8 cols) */}
              <Card className="lg:col-span-8 p-5 sm:p-6 bg-[#171718] border-[#2A2A2E] flex flex-col min-h-[580px] h-full space-y-4 shadow-lg w-full">
                <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3 shrink-0">
                  <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#FF7A00]" />
                    <span>Compose Customer Email</span>
                  </h3>
                  <Badge variant="neutral" size="sm" className="bg-[#111113] text-zinc-400 border-[#2A2A2E] px-2.5 py-0.5 font-semibold">
                    Direct Email Dispatch
                  </Badge>
                </div>

                <form onSubmit={handleSendEmailSubmit} className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Template Selection Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">Load Approved Template</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => handleTemplateDropdownChange(e.target.value)}
                        className="w-full h-11 bg-[#111113] border border-[#2A2A2E] rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                      >
                        <option value="">-- Custom Email / Choose Template --</option>
                        {data?.templates?.map((t: any) => (
                          <option key={t.id} value={String(t.id)}>
                            {t.name} ({t.subject})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Customer Lead Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">Select Customer Lead *</label>
                      {leadsList.length > 0 ? (
                        <select
                          value={selectedLeadId}
                          onChange={(e) => setSelectedLeadId(e.target.value)}
                          className="w-full h-11 bg-[#111113] border border-[#2A2A2E] rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                          required
                        >
                          <option value="">-- Choose Assigned Lead --</option>
                          {leadsList.map((l: any) => (
                            <option key={l.id} value={String(l.id)}>
                              {l.first_name} {l.last_name} {l.company ? `(${l.company})` : ''} - {l.email || `ID #${l.id}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={selectedLeadId}
                          onChange={(e) => setSelectedLeadId(e.target.value)}
                          placeholder="Enter Lead ID number..."
                          required
                          className="w-full h-11 bg-[#111113] border border-[#2A2A2E] rounded-xl px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                        />
                      )}
                    </div>
                  </div>

                  {/* Email Subject Line */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-300">Email Subject Line *</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g. Follow-Up: Product Overview & Proposal Discussion"
                      required
                      className="w-full h-11 bg-[#111113] border border-[#2A2A2E] rounded-xl px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                    />
                  </div>

                  {/* Email Body Text Area */}
                  <div className="flex-1 flex flex-col space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-300">Email Body Message Content *</label>
                    <textarea
                      rows={8}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Type your email message here or click an approved template on the left..."
                      className="w-full flex-1 min-h-[220px] bg-[#111113] border border-[#2A2A2E] rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00] leading-relaxed resize-y transition-colors"
                      required
                    />
                  </div>

                  {/* Submit Action Bar */}
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#2A2A2E]">
                    <p className="text-[11px] text-zinc-500">
                      Dispatches email to recipient and logs activity to lead timeline.
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplateId('');
                          setEmailSubject('');
                          setEmailBody('');
                        }}
                        className="border-[#2A2A2E] text-zinc-300 hover:text-white h-10 px-4 rounded-xl whitespace-nowrap"
                      >
                        Reset Form
                      </Button>
                      <Button
                        type="submit"
                        variant="ai"
                        size="md"
                        isLoading={isSending}
                        leftIcon={<Send className="w-4 h-4 shrink-0 text-white" />}
                        className="font-bold h-10 px-5 rounded-xl whitespace-nowrap shrink-0"
                      >
                        Send Customer Email
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            {/* Bottom Section: Sent Customer Emails History List */}
            <Card className="p-5 bg-[#171718] border-[#2A2A2E] flex flex-col space-y-4 shadow-lg w-full">
              <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3 shrink-0">
                <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                  <Clock className="w-4 h-4 text-[#FF7A00]" />
                  <span>Sent Customer Email History</span>
                </h3>
                <Badge variant="neutral" size="sm" className="bg-[#111113] text-zinc-400 border-[#2A2A2E] px-2.5 py-0.5 font-bold whitespace-nowrap shrink-0">
                  {data?.email_history?.length || 0} Logged
                </Badge>
              </div>

              {(!data?.email_history || data.email_history.length === 0) ? (
                <div className="py-16 text-center space-y-2">
                  <Mail className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-zinc-300">No customer emails dispatched yet.</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">Fill out the Compose Email Box above to send your first email.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                  {data?.email_history?.map((e: any) => (
                    <div
                      key={e.id}
                      onClick={() => setViewEmailModal(e)}
                      className="p-4 bg-[#111113] rounded-xl border border-[#2A2A2E] hover:border-zinc-500 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[84px] group"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                          <p className="text-xs font-extrabold text-white truncate">
                            To: {e.lead ? `${e.lead.first_name} ${e.lead.last_name}` : 'Customer'}
                            {e.lead?.email ? ` (${e.lead.email})` : ''}
                          </p>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium truncate">
                          {e.notes || e.description || 'Email Outreach Logged'}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                          <span>{new Date(e.created_at || e.occurred_at).toLocaleString()}</span>
                          {e.lead?.company && <span>• {e.lead.company}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <Badge
                          variant={e.outcome === 'Failed' ? 'danger' : 'success'}
                          size="sm"
                          className="capitalize font-semibold px-3 py-1 whitespace-nowrap"
                        >
                          {e.outcome || 'Sent'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-zinc-400 hover:text-white hover:bg-[#1C1C1E] rounded-lg"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setViewEmailModal(e);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* View Sent Email Detail Modal */}
        {viewEmailModal && (
          <Modal
            isOpen={!!viewEmailModal}
            onClose={() => setViewEmailModal(null)}
            title="Dispatched Email Details"
            size="2xl"
          >
            <div className="space-y-4 text-xs pt-1">
              <div className="p-4 bg-[#111113] rounded-xl border border-[#2A2A2E] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-zinc-400 font-semibold">Recipient</p>
                    <p className="font-extrabold text-white text-sm mt-0.5">
                      {viewEmailModal.lead ? `${viewEmailModal.lead.first_name} ${viewEmailModal.lead.last_name}` : 'Customer'}
                    </p>
                    {viewEmailModal.lead?.email && (
                      <p className="text-zinc-400 mt-0.5">{viewEmailModal.lead.email}</p>
                    )}
                  </div>
                  <Badge variant={viewEmailModal.outcome === 'Failed' ? 'danger' : 'success'} className="px-3 py-1 whitespace-nowrap">
                    {viewEmailModal.outcome || 'Sent'}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-[#111113] rounded-xl border border-[#2A2A2E] space-y-1">
                <p className="text-zinc-400 font-semibold">Dispatched Time</p>
                <p className="font-semibold text-white">
                  {new Date(viewEmailModal.created_at || viewEmailModal.occurred_at).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-[#111113] rounded-xl border border-[#2A2A2E] space-y-1">
                <p className="text-zinc-400 font-semibold">Subject / Summary</p>
                <p className="font-bold text-[#FF7A00]">
                  {viewEmailModal.notes || viewEmailModal.description || 'Email Sent'}
                </p>
              </div>

              <div className="p-4 bg-[#111113] rounded-xl border border-[#2A2A2E] space-y-2">
                <p className="text-zinc-400 font-bold">Email Description & Content</p>
                <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {viewEmailModal.description}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewEmailModal(null)}
                  className="border-[#2A2A2E] text-zinc-300 hover:text-white h-9 px-4 whitespace-nowrap"
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepEmailCenter;
