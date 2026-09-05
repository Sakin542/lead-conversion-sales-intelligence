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

const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: 1,
    key: 'hot_lead_alert',
    name: 'Hot Lead Detected Alert',
    subject: '🔥 [URGENT] Hot Lead Detected: {{lead_name}} (Score: {{score}})',
    body_html: '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\n<h2 style="color: #FF7A00; margin-top: 0;">🔥 High-Conversion Hot Lead Alert</h2>\n<p>Hello <strong>{{rep_name}}</strong>,</p>\n<p>An AI predictive scoring surge has qualified <strong>{{lead_name}}</strong> from <strong>{{company}}</strong> as a <strong>HOT LEAD</strong> with an estimated conversion probability score of <span style="font-size: 16px; font-weight: bold; color: #10B981;">{{score}}/100</span>.</p>\n<div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">\n<p style="margin: 5px 0;"><strong>Estimated Value:</strong> ${{estimated_value}}</p>\n<p style="margin: 5px 0;"><strong>Source:</strong> {{source}}</p>\n<p style="margin: 5px 0;"><strong>Primary Interest:</strong> {{interested_in}}</p>\n</div>\n<p style="margin-top: 25px;"><a href="{{lead_url}}" style="background-color: #FF7A00; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Lead Now</a></p>\n<hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />\n<p style="font-size: 12px; color: #888;">Automated alert from Predictive CRM Sales Intelligence.</p>\n</div>',
    is_enabled: true,
  },
  {
    id: 2,
    key: 'lead_assigned',
    name: 'New Lead Assigned Notification',
    subject: '📋 New Lead Assigned to You: {{lead_name}} ({{company}})',
    body_html: '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\n<h2 style="color: #6366F1; margin-top: 0;">📋 New Lead Assigned</h2>\n<p>Hello <strong>{{rep_name}}</strong>,</p>\n<p>You have been assigned a new prospective account by sales leadership.</p>\n<div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">\n<p style="margin: 5px 0;"><strong>Contact:</strong> {{lead_name}} ({{job_title}})</p>\n<p style="margin: 5px 0;"><strong>Company:</strong> {{company}}</p>\n<p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>\n<p style="margin: 5px 0;"><strong>Phone:</strong> {{phone}}</p>\n<p style="margin: 5px 0;"><strong>Pipeline Stage:</strong> {{stage}}</p>\n</div>\n<p style="margin-top: 25px;"><a href="{{lead_url}}" style="background-color: #6366F1; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in CRM Pipeline</a></p>\n<hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />\n<p style="font-size: 12px; color: #888;">Predictive CRM & Lead Intelligence Platform.</p>\n</div>',
    is_enabled: true,
  },
  {
    id: 3,
    key: 'score_threshold_crossed',
    name: 'AI Conversion Score Surge Alert',
    subject: '⚡ AI Score Surge Alert: {{lead_name}} score increased to {{score}}',
    body_html: '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\n<h2 style="color: #10B981; margin-top: 0;">⚡ Lead Intent & Score Surge</h2>\n<p>Hello <strong>{{rep_name}}</strong>,</p>\n<p>The ML scoring engine detected high buyer intent activity for <strong>{{lead_name}}</strong> at <strong>{{company}}</strong>.</p>\n<p>Updated predictive score: <strong style="font-size: 18px; color: #10B981;">{{score}}/100</strong> (Previous: {{previous_score}}).</p>\n<div style="background-color: #f0fdf4; border-left: 4px solid #10B981; padding: 12px; margin: 15px 0;">\n<p style="margin: 0; font-size: 13px; color: #166534;"><strong>Recommended Action:</strong> High intent detected. Follow up within 2 hours to maximize deal close probability.</p>\n</div>\n<p style="margin-top: 25px;"><a href="{{lead_url}}" style="background-color: #10B981; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Lead Details</a></p>\n</div>',
    is_enabled: true,
  },
  {
    id: 4,
    key: 'followup_reminder',
    name: 'Scheduled Follow-Up Due Reminder',
    subject: '⏰ Action Due: Follow up with {{lead_name}} ({{company}})',
    body_html: '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\n<h2 style="color: #F59E0B; margin-top: 0;">⏰ Follow-Up Reminder</h2>\n<p>Hello <strong>{{rep_name}}</strong>,</p>\n<p>You have a pending follow-up action scheduled for today:</p>\n<div style="background-color: #fefce8; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">\n<p style="margin: 5px 0;"><strong>Task:</strong> {{task_title}}</p>\n<p style="margin: 5px 0;"><strong>Lead:</strong> {{lead_name}} ({{company}})</p>\n<p style="margin: 5px 0;"><strong>Due Time:</strong> {{due_time}}</p>\n<p style="margin: 5px 0;"><strong>Notes:</strong> {{task_notes}}</p>\n</div>\n<p style="margin-top: 25px;"><a href="{{action_url}}" style="background-color: #F59E0B; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Follow-Up</a></p>\n</div>',
    is_enabled: true,
  },
  {
    id: 5,
    key: 'user_invitation',
    name: 'Team Member Invitation & Onboarding',
    subject: '📩 Welcome to Predictive CRM: Activate Your {{role}} Account',
    body_html: '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\n<h2 style="color: #8B5CF6; margin-top: 0;">Welcome to Predictive CRM</h2>\n<p>Hello <strong>{{name}}</strong>,</p>\n<p>You have been invited by your organization administrator to join the Predictive CRM team as a <strong>{{role}}</strong>.</p>\n<p>Click below to verify your email and create your secure password to get started:</p>\n<p style="margin: 30px 0;"><a href="{{invitation_url}}" style="background-color: #8B5CF6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate My Account</a></p>\n<p style="font-size: 13px; color: #666;">This activation link is unique to your email address ({{email}}) and will expire in 48 hours.</p>\n</div>',
    is_enabled: true,
  },
  {
    id: 6,
    key: 'password_reset',
    name: 'Security: Password Reset Confirmation',
    subject: '🔐 Security Alert: Reset Your CRM Password',
    body_html: '<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\n<h2 style="color: #EF4444; margin-top: 0;">🔐 Password Reset Request</h2>\n<p>Hello <strong>{{name}}</strong>,</p>\n<p>We received a request to reset the password for your Predictive CRM account (<strong>{{email}}</strong>).</p>\n<p style="margin: 25px 0;"><a href="{{reset_url}}" style="background-color: #EF4444; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a></p>\n<p style="font-size: 12px; color: #666;">If you did not request a password reset, you can safely ignore this email.</p>\n</div>',
    is_enabled: true,
  },
];

export const AdminEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_admin_email_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_EMAIL_TEMPLATES;
  });
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
      if (res.success && Array.isArray(res.templates) && res.templates.length > 0) {
        setTemplates(res.templates);
        try {
          localStorage.setItem('crm_admin_email_templates', JSON.stringify(res.templates));
        } catch (_) {}
      } else {
        setTemplates((prev) => {
          const list = prev.length > 0 ? prev : DEFAULT_EMAIL_TEMPLATES;
          try {
            localStorage.setItem('crm_admin_email_templates', JSON.stringify(list));
          } catch (_) {}
          return list;
        });
      }
    } catch (e) {
      console.error(e);
      setTemplates((prev) => (prev.length > 0 ? prev : DEFAULT_EMAIL_TEMPLATES));
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
        setTemplates((prev) => {
          const updated = prev.map((t) => (t.id === selectedTemplate.id ? res.template : t));
          try {
            localStorage.setItem('crm_admin_email_templates', JSON.stringify(updated));
          } catch (_) {}
          return updated;
        });
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

