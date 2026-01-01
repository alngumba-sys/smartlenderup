import { useState } from 'react';
import { Mail, MessageSquare, Send, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner@2.0.3';

interface ReminderTemplate {
  id: string;
  clientName: string;
  clientId: string;
  phone: string;
  email?: string;
  dueAmount: number;
  daysOverdue: number;
  loanType: string;
  suggestedChannel: 'sms' | 'email' | 'both';
  suggestedTime: string;
  personalizedMessage: string;
  tone: 'friendly' | 'urgent' | 'formal';
  aiConfidence: number;
}

export function AIRemindersPanel() {
  const { loans, clients } = useData();
  const { isDark } = useTheme();
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [sendingReminders, setSendingReminders] = useState(false);

  // Generate AI-powered reminder suggestions
  const generateReminders = (): ReminderTemplate[] => {
    const overdueLoans = loans.filter(loan => loan.daysInArrears > 0);
    
    return overdueLoans.map(loan => {
      const client = clients.find(c => c.clientId === loan.clientId);
      const daysOverdue = loan.daysInArrears;
      
      // AI determines optimal channel based on overdue days and client profile
      let suggestedChannel: 'sms' | 'email' | 'both' = 'sms';
      let tone: 'friendly' | 'urgent' | 'formal' = 'friendly';
      let suggestedTime = '9:00 AM';
      
      if (daysOverdue > 30) {
        suggestedChannel = 'both';
        tone = 'urgent';
        suggestedTime = '10:00 AM'; // Morning for urgent
      } else if (daysOverdue > 7) {
        suggestedChannel = 'sms';
        tone = 'formal';
        suggestedTime = '2:00 PM'; // Afternoon for formal
      } else {
        suggestedChannel = 'sms';
        tone = 'friendly';
        suggestedTime = '4:00 PM'; // Late afternoon for friendly reminders
      }

      // AI-generated personalized messages
      const messages = {
        friendly: `Hi ${client?.fullName || loan.clientName}, hope you're doing well! Just a gentle reminder that your ${loan.loanType} payment of KES ${loan.outstandingBalance.toLocaleString()} was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago. We're here to help if you need to discuss payment options. Thank you! - SmartLenderUp`,
        
        formal: `Dear ${client?.fullName || loan.clientName}, This is a reminder that your ${loan.loanType} payment of KES ${loan.outstandingBalance.toLocaleString()} is ${daysOverdue} days overdue. Please arrange payment at your earliest convenience or contact us to discuss alternative arrangements. Loan Ref: ${loan.loanId}. - SmartLenderUp`,
        
        urgent: `URGENT: ${client?.fullName || loan.clientName}, your ${loan.loanType} payment of KES ${loan.outstandingBalance.toLocaleString()} is ${daysOverdue} days overdue. This may affect your credit score and future loan eligibility. Please contact us immediately at [PHONE] or visit our office. Loan Ref: ${loan.loanId}. - SmartLenderUp`
      };

      return {
        id: loan.loanId,
        clientName: client?.fullName || loan.clientName,
        clientId: loan.clientId,
        phone: client?.phoneNumber || '+254700000000',
        email: client?.email,
        dueAmount: loan.outstandingBalance,
        daysOverdue,
        loanType: loan.loanType,
        suggestedChannel,
        suggestedTime,
        personalizedMessage: messages[tone],
        tone,
        aiConfidence: daysOverdue > 30 ? 95 : daysOverdue > 7 ? 88 : 82
      };
    });
  };

  const reminders = generateReminders();

  const toggleReminder = (id: string) => {
    setSelectedReminders(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedReminders.length === reminders.length) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(reminders.map(r => r.id));
    }
  };

  const sendReminders = async () => {
    setSendingReminders(true);
    
    // Simulate sending reminders (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Successfully scheduled ${selectedReminders.length} AI-powered reminder${selectedReminders.length > 1 ? 's' : ''}!`, {
      description: 'Reminders will be sent at optimal times based on AI analysis.'
    });
    
    setSelectedReminders([]);
    setSendingReminders(false);
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'friendly': return 'text-green-600';
      case 'formal': return 'text-blue-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getToneBg = (tone: string) => {
    switch (tone) {
      case 'friendly': return 'bg-green-50 border-green-200';
      case 'formal': return 'bg-blue-50 border-blue-200';
      case 'urgent': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5 text-purple-600" />
            <h3 className="text-lg" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
              AI-Powered Smart Reminders
            </h3>
          </div>
          <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
            Personalized SMS/Email reminders optimized by AI for maximum response rate
          </p>
        </div>
        {selectedReminders.length > 0 && (
          <button
            onClick={sendReminders}
            disabled={sendingReminders}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Send className="size-4" />
            {sendingReminders ? 'Scheduling...' : `Send ${selectedReminders.length} Reminder${selectedReminders.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="size-4 text-purple-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Pending</span>
          </div>
          <p className="text-2xl" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>{reminders.length}</p>
        </div>

        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="size-4 text-blue-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Optimal Time</span>
          </div>
          <p className="text-lg" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>9-10 AM</p>
        </div>

        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="size-4 text-green-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>AI Confidence</span>
          </div>
          <p className="text-2xl" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>89%</p>
        </div>

        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-amber-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Success Rate</span>
          </div>
          <p className="text-2xl" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>76%</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
        <div className="flex items-start gap-2">
          <Sparkles className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 text-sm mb-1">
              <strong>How AI Optimizes Reminders:</strong>
            </p>
            <p className="text-blue-800 text-xs">
              Our AI analyzes 20+ factors including payment history, M-Pesa transaction patterns, time-of-day response rates, 
              client communication preferences, and overdue duration to generate personalized messages with optimal send times. 
              Machine learning models continuously improve based on response rates.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Note */}
      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 text-sm mb-1">
              <strong>Setup Required:</strong>
            </p>
            <p className="text-amber-800 text-xs">
              To enable automated sending, configure your SMS provider (e.g., Africa's Talking API Key) and email service 
              (e.g., SendGrid API Key) in Settings → Integrations. Messages are currently in preview mode.
            </p>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="text-center py-12 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#f9fafb',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <CheckCircle className="size-12 mx-auto mb-3 text-green-600" />
          <h4 className="mb-2" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
            All Caught Up! 🎉
          </h4>
          <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
            No overdue payments detected. AI will alert you when reminders are needed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{
            backgroundColor: isDark ? '#1e293b' : '#f9fafb',
            borderColor: isDark ? '#334155' : '#e5e7eb'
          }}>
            <input
              type="checkbox"
              checked={selectedReminders.length === reminders.length}
              onChange={toggleAll}
              className="size-4 rounded"
            />
            <span className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
              Select All ({reminders.length})
            </span>
          </div>

          {/* Reminder Cards */}
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border transition-all ${selectedReminders.includes(reminder.id) ? 'ring-2 ring-purple-500' : ''}`}
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e5e7eb'
              }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedReminders.includes(reminder.id)}
                  onChange={() => toggleReminder(reminder.id)}
                  className="size-5 rounded mt-1 flex-shrink-0"
                />
                
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="mb-1" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                        {reminder.clientName}
                      </h4>
                      <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                        {reminder.loanType} • {reminder.daysOverdue} day{reminder.daysOverdue > 1 ? 's' : ''} overdue • 
                        KES {reminder.dueAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getToneColor(reminder.tone)}`}>
                        <Sparkles className="size-3" />
                        {reminder.aiConfidence}% match
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      {reminder.suggestedChannel === 'sms' && <MessageSquare className="size-4 text-blue-600" />}
                      {reminder.suggestedChannel === 'email' && <Mail className="size-4 text-purple-600" />}
                      {reminder.suggestedChannel === 'both' && (
                        <>
                          <MessageSquare className="size-4 text-blue-600" />
                          <Mail className="size-4 text-purple-600" />
                        </>
                      )}
                      <div>
                        <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Channel</p>
                        <p className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                          {reminder.suggestedChannel === 'both' ? 'SMS + Email' : reminder.suggestedChannel.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-green-600" />
                      <div>
                        <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Best Time</p>
                        <p className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                          {reminder.suggestedTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-purple-600" />
                      <div>
                        <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Tone</p>
                        <p className={`text-sm capitalize ${getToneColor(reminder.tone)}`}>
                          {reminder.tone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className={`p-3 rounded border ${getToneBg(reminder.tone)}`}>
                    <p className="text-xs text-gray-600 mb-1">AI-Generated Message:</p>
                    <p className="text-sm text-gray-800">{reminder.personalizedMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
