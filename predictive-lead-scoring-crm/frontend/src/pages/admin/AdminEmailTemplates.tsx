import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { Mail, Edit3, Eye, RefreshCw } from 'lucide-react';

export const AdminEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit Modal
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Test Email Modal
  const [testTemplate, setTestTemplate] = useState<any | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const handleSendTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTemplate || !recipientEmail) return;

    setIsSendingTest(true);
    setTestFeedback(null);
    try {
      const res = await adminApi.sendTestEmail(testTemplate.id, recipientEmail);
      if (res.success) {
        setTestFeedback(res.message);
      }
    } catch (err: any) {
      setTestFeedback(err.data?.message || err.message || 'Failed to send test email.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getEmailTemplates();
      if (res.success) {
        setTemplates(res.templates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEditOpen = (t: any) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setBodyHtml(t.body_html);
    setIsEnabled(t.is_enabled);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const res = await adminApi.updateEmailTemplate(selectedTemplate.id, {
        subject,
        body_html: bodyHtml,
        is_enabled: isEnabled,
      });

      if (res.success) {
        setTemplates((prev) => prev.map((t) => (t.id === selectedTemplate.id ? res.template : t)));
        setSelectedTemplate(null);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to update template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Mail className="w-7 h-7 text-[#FF7A00]" />
              <span>Email Template Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Configure system email notification templates, edit subjects, HTML content, and toggles.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C]"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Templates
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center border-[#2A2A2E] bg-[#171718]">
            <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">No Email Templates Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-4">
              There are currently no email templates configured in the database.
            </p>
            <Button variant="ai" size="sm" onClick={fetchTemplates} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Reload System Templates
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {templates.map((t) => (
              <Card key={t.id} className="p-5 bg-[#171718] border-[#2A2A2E] space-y-4 hover:border-[#FF7A00]/40 transition-all">
                <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2E]">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-sm font-extrabold text-white leading-tight">{t.name}</h3>
                    <Badge variant={t.is_enabled ? 'success' : 'neutral'} size="sm">
                      {t.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  {/* Header Direct Quick Edit Action */}
                  <button
                    onClick={() => handleEditOpen(t)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-[#FF7A00] hover:text-white bg-[#FF7A00]/10 hover:bg-[#FF7A00] border border-[#FF7A00]/30 px-3 py-1.5 rounded-lg transition-all shadow-xs"
                    title="Edit Template"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-400">
                  <p><strong className="text-zinc-300">Template Key:</strong> <span className="font-mono text-[#FF7A00] font-semibold">{t.key}</span></p>
                  <p><strong className="text-zinc-300">Default Subject:</strong> <span className="text-zinc-200">{t.subject}</span></p>
                </div>

                <div className="pt-3 flex items-center justify-between gap-2 border-t border-[#2A2A2E]">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTestTemplate(t);
                        setRecipientEmail('');
                        setTestFeedback(null);
                      }}
                      className="text-xs border-[#FF7A00]/40 text-[#FF7A00] hover:bg-[#FF7A00]/10"
                      leftIcon={<Mail className="w-3.5 h-3.5" />}
                    >
                      Test Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleEditOpen(t);
                        setIsPreviewModalOpen(true);
                      }}
                      className="text-xs border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C]"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Preview
                    </Button>
                  </div>

                  <Button
                    variant="ai"
                    size="sm"
                    onClick={() => handleEditOpen(t)}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Edit Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedTemplate && !isPreviewModalOpen && (
        <Modal isOpen={!!selectedTemplate} onClose={() => setSelectedTemplate(null)} title={`Edit ${selectedTemplate.name}`}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Subject Line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Body HTML Content</label>
              <textarea
                rows={8}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full bg-[#111113] border border-[#2A2A2E] rounded-xl p-3 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] selection:bg-[#FF7A00]/30"
                required
              />
            </div>

            <label className="flex items-center space-x-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="h-4 w-4 text-[#FF7A00] rounded bg-[#111113] accent-[#FF7A00]"
              />
              <span className="text-xs text-zinc-300 font-semibold">Enable Template for Automated System Dispatch</span>
            </label>

            <div className="pt-4 flex justify-end space-x-3 border-t border-[#2A2A2E]">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="ai" size="sm" isLoading={isSaving}>
                Save Template
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {selectedTemplate && isPreviewModalOpen && (
        <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title={`Preview ${selectedTemplate.name}`}>
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#111113] border border-[#2A2A2E] rounded-xl space-y-1">
              <p><strong className="text-zinc-400">Subject:</strong> <span className="text-white font-bold">{subject}</span></p>
            </div>

            <div className="p-4 bg-[#111113] border border-[#2A2A2E] rounded-xl text-zinc-200 leading-relaxed max-h-[50vh] overflow-y-auto [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_p]:text-zinc-300 [&_a]:text-[#FF7A00]">
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Test Email Modal */}
      {testTemplate && (
        <Modal isOpen={!!testTemplate} onClose={() => setTestTemplate(null)} title={`Send Test Email: ${testTemplate.name}`}>
          <form onSubmit={handleSendTestSubmit} className="space-y-4">
            <Input
              label="Recipient Email Address"
              type="email"
              placeholder="e.g. admin@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />

            {testFeedback && (
              <div className="p-3 bg-[#FF7A00]/10 border border-[#FF7A00]/30 rounded-xl text-xs font-semibold text-[#FF7A00]">
                {testFeedback}
              </div>
            )}

            <div className="pt-3 flex justify-end space-x-3 border-t border-[#2A2A2E]">
              <Button type="button" variant="outline" size="sm" onClick={() => setTestTemplate(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="ai" size="sm" isLoading={isSendingTest}>
                Dispatch Test Email
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default AdminEmailTemplates;

