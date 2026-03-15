import { toast } from 'sonner';
import { useData } from '../contexts/DataContext';
import { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, DollarSign } from 'lucide-react';

interface ClientLoanNotificationCardProps {
  notification: any;
  onActionTaken: () => void;
}

export function ClientLoanNotificationCard({ notification, onActionTaken }: ClientLoanNotificationCardProps) {
  const { updateLoan, addNotification, markNotificationAsRead, loans, clients } = useData();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'review' | 'decline' | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const loan = loans.find(l => l.id === notification.relatedId);
  const client = clients.find(c => c.id === notification.createdBy);

  const handleReview = async () => {
    setLoading(true);
    try {
      // Update loan status to "Under Review"
      await updateLoan(notification.relatedId, {
        status: 'Under Review'
      });

      // Notify client
      await addNotification({
        type: 'info',
        category: 'loan',
        title: 'Loan Application Under Review',
        message: `Your loan application for ${loan?.productName} is now being reviewed. We'll notify you once a decision is made.`,
        read: false,
        actionRequired: false,
        relatedId: notification.relatedId,
        relatedType: 'loan',
        createdBy: 'admin'
      });

      // Mark notification as read
      await markNotificationAsRead(notification.id);

      toast.success('Client notified that loan is under review');
      setShowModal(false);
      onActionTaken();
    } catch (error) {
      console.error('Error reviewing loan:', error);
      toast.error('Failed to update loan status');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    setLoading(true);
    try {
      // Update loan status to "Rejected"
      await updateLoan(notification.relatedId, {
        status: 'Rejected',
        notes: `Declined: ${declineReason}`
      });

      // Notify client
      await addNotification({
        type: 'alert',
        category: 'loan',
        title: 'Loan Application Declined',
        message: `Unfortunately, your loan application for ${loan?.productName} has been declined. Reason: ${declineReason}`,
        read: false,
        actionRequired: false,
        relatedId: notification.relatedId,
        relatedType: 'loan',
        createdBy: 'admin'
      });

      // Mark notification as read
      await markNotificationAsRead(notification.id);

      toast.success('Client notified of loan decline');
      setShowModal(false);
      onActionTaken();
    } catch (error) {
      console.error('Error declining loan:', error);
      toast.error('Failed to decline loan');
    } finally {
      setLoading(false);
    }
  };

  if (!loan || !client) return null;

  return (
    <>
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="size-6 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </div>
              {!notification.read && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                  Action Required
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <User className="size-4" />
                <span>{client.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Product:</span>
                  <span className="ml-2 font-medium text-gray-900">{loan.productName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-medium text-gray-900">KES {loan.principalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Term:</span>
                  <span className="ml-2 font-medium text-gray-900">{loan.term} {loan.termUnit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Purpose:</span>
                  <span className="ml-2 font-medium text-gray-900">{loan.purpose}</span>
                </div>
              </div>
            </div>

            {!notification.read && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAction('review');
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Eye className="size-4" />
                  Review
                </button>
                <button
                  onClick={() => {
                    setAction('decline');
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <XCircle className="size-4" />
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {action === 'review' ? 'Review Loan Application' : 'Decline Loan Application'}
            </h3>

            {action === 'review' ? (
              <>
                <p className="text-gray-600 mb-6">
                  This will change the loan status to "Under Review" and notify the client that their application is being processed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Confirm Review'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for declining this loan application.
                </p>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                  rows={4}
                  placeholder="e.g., Insufficient credit score, incomplete documentation..."
                  required
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setDeclineReason('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Confirm Decline'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}