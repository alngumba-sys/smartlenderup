import { X, MessageSquare, Users, Calendar, DollarSign, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { smsCampaigns, SMSCampaign } from '../data/dummyData';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SMSCampaignModalProps {
  campaignId?: string;
  onClose: () => void;
}

export function SMSCampaignModal({ campaignId, onClose }: SMSCampaignModalProps) {
  const { isDark } = useTheme();
  const campaign = campaignId ? smsCampaigns.find(c => c.id === campaignId) : null;
  
  const [campaignName, setCampaignName] = useState(campaign?.name || '');
  const [campaignType, setCampaignType] = useState<SMSCampaign['type']>(campaign?.type || 'Custom');
  const [targetAudience, setTargetAudience] = useState(campaign?.targetAudience || '');
  const [message, setMessage] = useState(campaign?.message || '');
  const [scheduledDate, setScheduledDate] = useState(campaign?.scheduledDate || '');
  const [recipientCount] = useState(campaign?.recipientCount || 0);

  const characterCount = message.length;
  const smsCount = Math.ceil(characterCount / 160);
  const costPerSMS = 1; // KES 1 per SMS
  const estimatedCost = recipientCount * smsCount * costPerSMS;

  const handleSendCampaign = () => {
    alert(`Campaign "${campaignName}" scheduled for ${scheduledDate}\nRecipients: ${recipientCount}\nEstimated Cost: KES ${estimatedCost}`);
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sent': return <CheckCircle className="size-4 text-emerald-600" />;
      case 'Failed': return <XCircle className="size-4 text-red-600" />;
      case 'Scheduled': return <Clock className="size-4 text-blue-600" />;
      case 'Draft': return <MessageSquare className="size-4 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-gray-900 mb-1">
                {campaign ? `Campaign: ${campaign.name}` : 'Create New SMS Campaign'}
              </h2>
              {campaign && (
                <div className="flex items-center gap-3 text-sm mt-2">
                  <span className="text-gray-700">{campaign.id}</span>
                  <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                    campaign.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' :
                    campaign.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    campaign.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusIcon(campaign.status)}
                    {campaign.status}
                  </span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {campaign ? (
            // View existing campaign
            <>
              {/* Campaign Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm">Recipients</p>
                      <p className="text-blue-900 text-2xl mt-1">{campaign.recipientCount}</p>
                    </div>
                    <Users className="size-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-sm">Sent</p>
                      <p className="text-emerald-900 text-2xl mt-1">{campaign.sentCount}</p>
                    </div>
                    <CheckCircle className="size-8 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm">Failed</p>
                      <p className="text-red-900 text-2xl mt-1">{campaign.failedCount}</p>
                    </div>
                    <XCircle className="size-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-gray-900 mb-4">Campaign Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Type:</p>
                    <p className="text-gray-900">{campaign.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Target Audience:</p>
                    <p className="text-gray-900">{campaign.targetAudience}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Scheduled Date:</p>
                    <p className="text-gray-900">{campaign.scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created By:</p>
                    <p className="text-gray-900">{campaign.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cost:</p>
                    <p className="text-gray-900">KES {campaign.costEstimate.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-gray-900 mb-3">Message</h3>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-emerald-900 text-sm">{campaign.message}</p>
                </div>
                <p className="text-gray-600 text-xs mt-2">
                  {campaign.message.length} characters • {Math.ceil(campaign.message.length / 160)} SMS
                </p>
              </div>
            </>
          ) : (
            // Create new campaign
            <>
              {/* Campaign Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., December Payment Reminders"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Campaign Type</label>
                    <select
                      value={campaignType}
                      onChange={(e) => setCampaignType(e.target.value as SMSCampaign['type'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Payment Reminder">Payment Reminder</option>
                      <option value="Promotional">Promotional</option>
                      <option value="Overdue Alert">Overdue Alert</option>
                      <option value="Meeting Reminder">Meeting Reminder</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Scheduled Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select target audience...</option>
                    <option value="All active borrowers">All Active Borrowers</option>
                    <option value="Good standing clients">Good Standing Clients</option>
                    <option value="Loans >30 DPD">Loans {'>'} 30 Days Overdue</option>
                    <option value="Loans >60 DPD">Loans {'>'} 60 Days Overdue</option>
                    <option value="All groups">All Group Members</option>
                    <option value="Nairobi clients">Nairobi Branch Clients</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your SMS message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={4}
                    maxLength={480}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">
                      {characterCount}/480 characters • {smsCount} SMS
                    </span>
                    <span className={characterCount > 160 ? 'text-amber-600' : 'text-gray-600'}>
                      {characterCount > 160 && 'Multiple SMS will be sent'}
                    </span>
                  </div>
                </div>

                {/* Cost Estimate */}
                {targetAudience && message && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="size-5 text-amber-600" />
                      <h4 className="text-amber-900">Cost Estimate</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-amber-600">Recipients</p>
                        <p className="text-amber-900">85</p>
                      </div>
                      <div>
                        <p className="text-amber-600">SMS per Recipient</p>
                        <p className="text-amber-900">{smsCount}</p>
                      </div>
                      <div>
                        <p className="text-amber-600">Total Cost</p>
                        <p className="text-amber-900">KES {(85 * smsCount).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50">
          {campaign ? (
            <div className="flex gap-2">
              {campaign.status === 'Scheduled' && (
                <>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Send Now
                  </button>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">
                    Reschedule
                  </button>
                </>
              )}
              {campaign.status === 'Draft' && (
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2">
                  <Send className="size-4" />
                  Schedule Campaign
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSendCampaign}
                disabled={!campaignName || !message || !targetAudience || !scheduledDate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="size-4" />
                Schedule Campaign
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                Save as Draft
              </button>
            </div>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}