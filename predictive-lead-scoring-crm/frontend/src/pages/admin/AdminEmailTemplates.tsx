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
        <div className="flex items-center justify-between border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Mail className="w-7 h-7 text-indigo-400" />
              <span>Email Template Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure system email notification templates, edit subjects, HTML content, and toggles.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            className="border-slate-800 text-slate-300 hover:bg-slate-900"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Templates
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <Card key={t.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white leading-tight">{t.name}</h3>
                  <Badge variant={t.is_enabled ? 'success' : 'neutral'} size="sm">
                    {t.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <p><strong>Key:</strong> <span className="font-mono text-indigo-400">{t.key}</span></p>
                  <p><strong>Subject:</strong> <span className="text-slate-200">{t.subject}</span></p>
                </div>

                <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800/80">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTestTemplate(t);
                      setRecipientEmail('');
                      setTestFeedback(null);
                    }}
                    className="text-xs border-indigo-800 text-indigo-300 hover:bg-indigo-950/60"
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
                    className="text-xs border-slate-800 text-slate-300"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEditOpen(t)}
                    className="text-xs bg-indigo-600 border-none font-bold"
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Edit
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
              <label className="text-xs font-semibold text-slate-300 block mb-1">Body HTML Content</label>
              <textarea
                rows={8}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <label className="flex items-center space-x-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-500 rounded bg-slate-950 accent-indigo-500"
              />
              <span className="text-xs text-slate-300 font-semibold">Enable Template for Automated System Dispatch</span>
            </label>

            <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold">
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
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <p><strong className="text-slate-400">Subject:</strong> <span className="text-white font-bold">{subject}</span></p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed max-h-[50vh] overflow-y-auto">
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
              <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-xl text-xs font-semibold text-indigo-200">
                {testFeedback}
              </div>
            )}

            <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setTestTemplate(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSendingTest} className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold">
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

