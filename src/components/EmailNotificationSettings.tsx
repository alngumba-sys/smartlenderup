import { Mail, Send, Clock, Bell, Settings, AlertCircle, CheckCircle, X, Plus, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { getCurrencySymbol } from '../utils/currencyUtils';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'payment_reminder' | 'loan_approved' | 'disbursement' | 'overdue' | 'statement' | 'welcome';
  subject: string;
  body: string;
  active: boolean;
}

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

interface AutomatedRule {
  id: string;
  name: string;
  trigger: 'days_before_due' | 'days_overdue' | 'loan_approved' | 'disbursed';
  days?: number;
  templateId: string;
  active: boolean;
}

export function EmailNotificationSettings() {
  const { isDark } = useTheme();
  const { clients, loans, payments } = useData();
  const currencySymbol = getCurrencySymbol();

  const [activeTab, setActiveTab] = useState<'settings' | 'templates' | 'rules' | 'logs'>('settings');
  const [emailSettings, setEmailSettings] = useState({
    fromEmail: 'info@bvfunguo.com',
    fromName: 'BV Funguo Ltd',
    replyTo: 'info@bvfunguo.com',
    smtpConfigured: false,
    resendApiKey: '',
    enableReminders: true,
    enableStatements: true,
    enableAlerts: true
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Payment Reminder',
      type: 'payment_reminder',
      subject: 'Payment Reminder - {{loan_id}}',
      body: `Dear {{client_name}},

This is a friendly reminder that your loan payment of {{amount}} is due on {{due_date}}.

Loan Details:
- Loan ID: {{loan_id}}
- Amount Due: {{amount}}
- Due Date: {{due_date}}
- Outstanding Balance: {{outstanding_balance}}

Please make your payment on time to avoid late fees.

Thank you,
BV Funguo Ltd`,
      active: true
    },
    {
      id: '2',
      name: 'Loan Approved',
      type: 'loan_approved',
      subject: 'Loan Application Approved - {{loan_id}}',
      body: `Dear {{client_name}},

Congratulations! Your loan application has been approved.

Loan Details:
- Loan ID: {{loan_id}}
- Approved Amount: {{amount}}
- Interest Rate: {{interest_rate}}%
- Loan Term: {{loan_term}}

Your loan will be disbursed shortly. We will notify you once the funds are transferred.

Thank you,
BV Funguo Ltd`,
      active: true
    },
    {
      id: '3',
      name: 'Disbursement Confirmation',
      type: 'disbursement',
      subject: 'Loan Disbursed - {{loan_id}}',
      body: `Dear {{client_name}},

Your loan has been successfully disbursed.

Disbursement Details:
- Loan ID: {{loan_id}}
- Amount Disbursed: {{amount}}
- Disbursement Date: {{disbursement_date}}
- First Payment Due: {{first_payment_date}}

Please ensure timely repayment to maintain a good credit history.

Thank you,
BV Funguo Ltd`,
      active: true
    },
    {
      id: '4',
      name: 'Overdue Payment Alert',
      type: 'overdue',
      subject: 'URGENT: Overdue Payment - {{loan_id}}',
      body: `Dear {{client_name}},

Your loan payment is now {{days_overdue}} days overdue.

Overdue Payment Details:
- Loan ID: {{loan_id}}
- Overdue Amount: {{amount}}
- Days Overdue: {{days_overdue}}
- Late Fee: {{late_fee}}

Please contact us immediately to arrange payment and avoid further penalties.

Thank you,
BV Funguo Ltd
Phone: +254 XXX XXX XXX`,
      active: true
    },
    {
      id: '5',
      name: 'Monthly Statement',
      type: 'statement',
      subject: 'Monthly Loan Statement - {{month}}',
      body: `Dear {{client_name}},

Here is your monthly loan statement for {{month}}.

Account Summary:
- Total Borrowed: {{total_borrowed}}
- Total Paid: {{total_paid}}
- Outstanding Balance: {{outstanding_balance}}
- Active Loans: {{active_loans_count}}

For detailed statement, please login to your account or contact us.

Thank you,
BV Funguo Ltd`,
      active: true
    }
  ]);

  const [automatedRules, setAutomatedRules] = useState<AutomatedRule[]>([
    {
      id: '1',
      name: 'Payment Reminder - 3 Days Before',
      trigger: 'days_before_due',
      days: 3,
      templateId: '1',
      active: true
    },
    {
      id: '2',
      name: 'Payment Reminder - 1 Day Before',
      trigger: 'days_before_due',
      days: 1,
      templateId: '1',
      active: true
    },
    {
      id: '3',
      name: 'Overdue Alert - 1 Day',
      trigger: 'days_overdue',
      days: 1,
      templateId: '4',
      active: true
    },
    {
      id: '4',
      name: 'Overdue Alert - 7 Days',
      trigger: 'days_overdue',
      days: 7,
      templateId: '4',
      active: true
    },
    {
      id: '5',
      name: 'Loan Approval Notification',
      trigger: 'loan_approved',
      templateId: '2',
      active: true
    },
    {
      id: '6',
      name: 'Disbursement Notification',
      trigger: 'disbursed',
      templateId: '3',
      active: true
    }
  ]);

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([
    {
      id: '1',
      to: 'client@example.com',
      subject: 'Payment Reminder - LN12345',
      template: 'Payment Reminder',
      sentAt: '2024-02-24 10:30:00',
      status: 'sent'
    },
    {
      id: '2',
      to: 'client2@example.com',
      subject: 'Loan Approved - LN12346',
      template: 'Loan Approved',
      sentAt: '2024-02-24 09:15:00',
      status: 'sent'
    }
  ]);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingRule, setEditingRule] = useState<AutomatedRule | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const handleSaveSettings = async () => {
    try {
      // In production, save to Supabase
      // For now, just show success
      toast.success('Email settings saved successfully');
    } catch (error) {
      toast.error('Failed to save email settings');
      console.error(error);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmailAddress,
          subject: 'Test Email from BV Funguo Ltd',
          html: `
            <h1>Test Email</h1>
            <p>This is a test email from your BV Funguo microfinance platform.</p>
            <p>If you're receiving this, your email configuration is working correctly!</p>
          `
        }
      });

      if (error) throw error;
      toast.success(`Test email sent to ${testEmailAddress}`);
      setTestEmailAddress('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test email');
      console.error(error);
    }
  };

  const handleSendReminder = async (clientId: string, loanId: string) => {
    try {
      const client = clients.find(c => c.id === clientId);
      const loan = loans.find(l => l.id === loanId);
      
      if (!client || !loan) {
        toast.error('Client or loan not found');
        return;
      }

      if (!client.email) {
        toast.error('Client has no email address');
        return;
      }

      const template = templates.find(t => t.type === 'payment_reminder');
      if (!template) {
        toast.error('Payment reminder template not found');
        return;
      }

      // Replace template variables
      let emailBody = template.body
        .replace(/{{client_name}}/g, client.name)
        .replace(/{{loan_id}}/g, loanId)
        .replace(/{{amount}}/g, `${currencySymbol} ${loan.approvedAmount?.toLocaleString() || '0'}`)
        .replace(/{{due_date}}/g, 'TBD')
        .replace(/{{outstanding_balance}}/g, `${currencySymbol} ${loan.outstandingBalance?.toLocaleString() || '0'}`);

      let emailSubject = template.subject
        .replace(/{{loan_id}}/g, loanId);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: client.email,
          subject: emailSubject,
          html: emailBody.replace(/\n/g, '<br>')
        }
      });

      if (error) throw error;

      // Log the email
      const newLog: EmailLog = {
        id: Date.now().toString(),
        to: client.email,
        subject: emailSubject,
        template: template.name,
        sentAt: new Date().toLocaleString(),
        status: 'sent'
      };
      setEmailLogs([newLog, ...emailLogs]);

      toast.success(`Reminder sent to ${client.name}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reminder');
      console.error(error);
    }
  };

  const handleToggleTemplate = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, active: !t.active } : t
    ));
    toast.success('Template status updated');
  };

  const handleToggleRule = (id: string) => {
    setAutomatedRules(automatedRules.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    ));
    toast.success('Rule status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Notifications</h2>
          <p className="text-sm text-gray-600">Configure automated email notifications for your clients</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Mail className="size-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-900">From: {emailSettings.fromEmail}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 px-6">
            {[
              { id: 'settings', label: 'Email Settings', icon: Settings },
              { id: 'templates', label: 'Templates', icon: Mail },
              { id: 'rules', label: 'Automated Rules', icon: Clock },
              { id: 'logs', label: 'Email Logs', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium relative transition-colors ${
                  activeTab === tab.id
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Configuration Status */}
              <div className={`p-4 rounded-lg border-2 ${
                emailSettings.smtpConfigured 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  {emailSettings.smtpConfigured ? (
                    <CheckCircle className="size-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-5 text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {emailSettings.smtpConfigured ? 'Email Configured' : 'Email Configuration Required'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {emailSettings.smtpConfigured 
                        ? 'Your email service is configured and ready to send notifications.'
                        : 'To enable email notifications, you need to configure your Resend API key in Supabase Edge Functions.'}
                    </p>
                    {!emailSettings.smtpConfigured && (
                      <div className="bg-white border border-amber-300 rounded-lg p-3 text-sm text-gray-700">
                        <p className="font-semibold mb-2">Setup Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Sign up for a free Resend account at resend.com</li>
                          <li>Get your API key from the Resend dashboard</li>
                          <li>Add domain verification for info@bvfunguo.com</li>
                          <li>Deploy the Supabase Edge Function (see documentation)</li>
                          <li>Add your Resend API key as a secret in Supabase</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Settings Form */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="info@bvfunguo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="BV Funguo Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={emailSettings.replyTo}
                    onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="info@bvfunguo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resend API Key
                  </label>
                  <input
                    type="password"
                    value={emailSettings.resendApiKey}
                    onChange={(e) => setEmailSettings({ ...emailSettings, resendApiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    placeholder="re_xxxxxxxxxxxx"
                  />
                  <p className="text-xs text-gray-500 mt-1">This should be stored in Supabase secrets</p>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Notification Types</h3>
                
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Bell className="size-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Reminders</p>
                      <p className="text-xs text-gray-600">Send automated reminders before due dates</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailSettings.enableReminders}
                    onChange={(e) => setEmailSettings({ ...emailSettings, enableReminders: e.target.checked })}
                    className="size-4 rounded border-gray-300"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Mail className="size-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Monthly Statements</p>
                      <p className="text-xs text-gray-600">Send monthly account statements</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailSettings.enableStatements}
                    onChange={(e) => setEmailSettings({ ...emailSettings, enableStatements: e.target.checked })}
                    className="size-4 rounded border-gray-300"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="size-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Overdue Alerts</p>
                      <p className="text-xs text-gray-600">Send alerts for overdue payments</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailSettings.enableAlerts}
                    onChange={(e) => setEmailSettings({ ...emailSettings, enableAlerts: e.target.checked })}
                    className="size-4 rounded border-gray-300"
                  />
                </label>
              </div>

              {/* Test Email */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Send Test Email</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="test@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleTestEmail}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center gap-2"
                  >
                    <Send className="size-4" />
                    Send Test
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Email Templates</h3>
                <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center gap-2">
                  <Plus className="size-4" />
                  New Template
                </button>
              </div>

              <div className="space-y-3">
                {templates.map(template => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            template.active 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {template.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Subject: {template.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTemplate(template.id)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          {template.active ? (
                            <CheckCircle className="size-4 text-emerald-600" />
                          ) : (
                            <X className="size-4 text-gray-400" />
                          )}
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded">
                          <Eye className="size-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-xs font-mono text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {template.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RULES TAB */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Automated Email Rules</h3>
                <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center gap-2">
                  <Plus className="size-4" />
                  New Rule
                </button>
              </div>

              <div className="space-y-3">
                {automatedRules.map(rule => {
                  const template = templates.find(t => t.id === rule.templateId);
                  return (
                    <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              rule.active 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {rule.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Trigger:</span>{' '}
                              {rule.trigger === 'days_before_due' && `${rule.days} days before payment due`}
                              {rule.trigger === 'days_overdue' && `${rule.days} days overdue`}
                              {rule.trigger === 'loan_approved' && 'When loan is approved'}
                              {rule.trigger === 'disbursed' && 'When loan is disbursed'}
                            </p>
                            <p>
                              <span className="font-medium">Template:</span> {template?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                          >
                            {rule.active ? (
                              <CheckCircle className="size-4 text-emerald-600" />
                            ) : (
                              <X className="size-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Email Send Logs</h3>

              {emailLogs.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date/Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">To</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Template</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailLogs.map((log, idx) => (
                        <tr key={log.id} className={`border-b border-gray-200 ${idx === emailLogs.length - 1 ? 'border-b-0' : ''}`}>
                          <td className="px-4 py-3 text-sm text-gray-900">{log.sentAt}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{log.to}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{log.subject}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.template}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              log.status === 'sent' ? 'bg-emerald-100 text-emerald-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                  <Mail className="size-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">No emails sent yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
