import { useState } from 'react';
import { MessageSquare, Plus, Send, Calendar, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { SMSCampaignModal } from '../SMSCampaignModal';

export function SMSCampaignsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);

  const { smsCampaigns = [] } = useData();

  const filteredCampaigns = smsCampaigns.filter(campaign => {
    return statusFilter === 'all' || campaign.status === statusFilter;
  });

  const totalSent = smsCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalCost = smsCampaigns.reduce((sum, c) => sum + c.costEstimate, 0);
  const sentCampaigns = smsCampaigns.filter(c => c.status === 'Sent').length;
  const scheduledCampaigns = smsCampaigns.filter(c => c.status === 'Scheduled').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sent': return <CheckCircle className="size-4 text-emerald-600" />;
      case 'Failed': return <XCircle className="size-4 text-red-600" />;
      case 'Scheduled': return <Clock className="size-4 text-blue-600" />;
      case 'Draft': return <MessageSquare className="size-4 text-gray-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-emerald-100 text-emerald-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Payment Reminder': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Promotional': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Overdue Alert': return 'bg-red-50 text-red-700 border-red-200';
      case 'Meeting Reminder': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Custom': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900 dark:text-white">SMS Campaigns</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage bulk SMS campaigns</p>
        </div>
        <button
          onClick={() => setShowNewCampaign(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Campaign
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Campaigns</p>
              <p className="text-gray-900 dark:text-white text-2xl mt-1">{smsCampaigns.length}</p>
            </div>
            <MessageSquare className="size-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Sent Campaigns</p>
              <p className="text-gray-900 dark:text-white text-2xl mt-1">{sentCampaigns}</p>
            </div>
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total SMS Sent</p>
              <p className="text-gray-900 dark:text-white text-2xl mt-1">{totalSent.toLocaleString()}</p>
            </div>
            <Send className="size-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Cost</p>
              <p className="text-gray-900 dark:text-white text-2xl mt-1">KES {totalCost.toLocaleString()}</p>
            </div>
            <Calendar className="size-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Filter className="size-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="Sent">Sent</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
            <option value="Failed">Failed</option>
          </select>
          <div className="flex-1"></div>
          <span className="text-gray-600 dark:text-gray-400 text-sm">{filteredCampaigns.length} campaigns</span>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            onClick={() => setSelectedCampaign(campaign.id)}
            className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
          >
            {/* Campaign Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white mb-1">{campaign.name}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">{campaign.id}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </span>
              </div>
            </div>

            {/* Campaign Type */}
            <span className={`inline-block px-2 py-1 rounded text-xs border ${getTypeColor(campaign.type)}`}>
              {campaign.type}
            </span>

            {/* Campaign Details */}
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Target:</span>
                <span className="text-gray-900 dark:text-white text-right">{campaign.targetAudience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                <span className="text-gray-900 dark:text-white">{campaign.recipientCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Scheduled:</span>
                <span className="text-gray-900 dark:text-white">{campaign.scheduledDate}</span>
              </div>
              {campaign.status === 'Sent' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sent:</span>
                    <span className="text-emerald-900">{campaign.sentCount}</span>
                  </div>
                  {campaign.failedCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                      <span className="text-red-900">{campaign.failedCount}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Message Preview */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Message Preview:</p>
              <p className="text-gray-900 dark:text-white text-sm line-clamp-2 italic">
                {campaign.message}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-400">Created by {campaign.createdBy}</span>
              <span className="text-gray-900 dark:text-white">KES {campaign.costEstimate.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedCampaign && (
        <SMSCampaignModal
          campaignId={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {showNewCampaign && (
        <SMSCampaignModal
          onClose={() => setShowNewCampaign(false)}
        />
      )}
    </div>
  );
}