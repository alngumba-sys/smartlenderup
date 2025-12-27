import { X, Phone, MessageSquare, Mail, UserCheck, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { loans, clients, collectionActivities, CollectionActivity } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';

interface CollectionActivityModalProps {
  loanId: string;
  onClose: () => void;
}

export function CollectionActivityModal({ loanId, onClose }: CollectionActivityModalProps) {
  const { isDark } = useTheme();
  const [newActivityType, setNewActivityType] = useState<CollectionActivity['activityType']>('Phone Call');
  const [newNotes, setNewNotes] = useState('');
  const [newOutcome, setNewOutcome] = useState<CollectionActivity['outcome']>('Successful');

  const loan = loans.find(l => l.id === loanId);
  const client = loan ? clients.find(c => c.id === loan.clientId) : null;
  const activities = collectionActivities.filter(a => a.loanId === loanId);

  if (!loan || !client) {
    return null;
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Successful': return <CheckCircle className="size-4 text-emerald-600" />;
      case 'Promise to Pay': return <Calendar className="size-4 text-blue-600" />;
      case 'No Response': return <XCircle className="size-4 text-gray-600" />;
      case 'Disputed': return <AlertTriangle className="size-4 text-amber-600" />;
      case 'Refused': return <XCircle className="size-4 text-red-600" />;
      default: return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Phone Call': return <Phone className="size-4 text-blue-600" />;
      case 'SMS': return <MessageSquare className="size-4 text-emerald-600" />;
      case 'Field Visit': return <MapPin className="size-4 text-purple-600" />;
      case 'Demand Letter': return <FileText className="size-4 text-red-600" />;
      case 'Payment Promise': return <Calendar className="size-4 text-amber-600" />;
      default: return null;
    }
  };

  const handleAddActivity = () => {
    // This would normally save to backend
    alert(`New collection activity added:\nType: ${newActivityType}\nOutcome: ${newOutcome}\nNotes: ${newNotes}`);
    setNewNotes('');
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-gray-900 mb-1">Collection Activities</h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-700">{loan.id} - {client.name}</span>
                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                  {loan.daysInArrears} Days Overdue
                </span>
              </div>
              <div className="mt-2 text-sm">
                <p className="text-gray-600">
                  Outstanding: <span className="text-red-900">KES {loan.outstandingBalance.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Client Contact Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-blue-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-blue-800">
                <Phone className="size-4" />
                <span>{client.phone}</span>
                <button className="ml-auto px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                  Call Now
                </button>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <MessageSquare className="size-4" />
                <button className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                  Send SMS
                </button>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <MapPin className="size-4" />
                <span>{client.branch}</span>
                <button className="ml-auto px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">
                  Schedule Visit
                </button>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded text-sm border border-amber-200">
                <AlertTriangle className="size-4" />
                <span>Credit Score: {client.creditScore || 300}</span>
              </div>
            </div>
          </div>

          {/* Add New Activity */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-gray-900 mb-4">Log New Collection Activity</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Activity Type</label>
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value as CollectionActivity['activityType'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="SMS">SMS</option>
                    <option value="Field Visit">Field Visit</option>
                    <option value="Demand Letter">Demand Letter</option>
                    <option value="Payment Promise">Payment Promise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Outcome</label>
                  <select
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value as CollectionActivity['outcome'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Successful">Successful</option>
                    <option value="No Response">No Response</option>
                    <option value="Promise to Pay">Promise to Pay</option>
                    <option value="Disputed">Disputed</option>
                    <option value="Refused">Refused</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Enter details of the collection activity..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                />
              </div>
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Log Activity
              </button>
            </div>
          </div>

          {/* Collection History */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-gray-900 mb-4">Collection History ({activities.length} activities)</h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">No collection activities recorded yet</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.activityType)}
                        <div>
                          <p className="text-gray-900 text-sm">{activity.activityType}</p>
                          <p className="text-gray-600 text-xs">{activity.date} • {activity.performedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getOutcomeIcon(activity.outcome)}
                        <span className="text-xs text-gray-600">{activity.outcome}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm italic">{activity.notes}</p>
                    {activity.promisedAmount && (
                      <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                        <p className="text-blue-900">
                          Promised Amount: KES {activity.promisedAmount.toLocaleString()} on {activity.promisedDate}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="text-amber-900 mb-3">Recommended Actions</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Make phone call to client within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>If no response, schedule field visit to business location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Contact guarantors if client is unreachable</span>
              </li>
              {loan.daysInArrears > 60 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span className="text-red-800">Consider issuing demand letter - account is {loan.daysInArrears} days overdue</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Issue Demand Letter
            </button>
            <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">
              Record Payment Promise
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}