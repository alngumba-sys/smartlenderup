import { X, DollarSign, User, Calendar, CreditCard, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface ExpenseDetailsModalProps {
  expenseId: string;
  onClose: () => void;
}

export function ExpenseDetailsModal({ expenseId, onClose }: ExpenseDetailsModalProps) {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const { expenses, payees } = useData();
  const expense = expenses.find(e => e.id === expenseId);
  const payee = expense ? payees.find(p => p.id === expense.payeeId) : null;

  if (!expense) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800';
      case 'Pending': return isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800';
      case 'Approved': return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'Rejected': return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="size-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-gray-900 dark:text-white">Expense Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{expense.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getStatusColor(expense.status)}`}>
              {expense.status}
            </span>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg">
              <p className="text-sm text-emerald-900 dark:text-emerald-300 mb-1">Amount</p>
              <p className="text-2xl text-emerald-900 dark:text-emerald-300">{currencyCode} {expense.amount.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expense Date</p>
              <p className="text-xl text-gray-900 dark:text-white">{expense.expenseDate}</p>
            </div>
          </div>

          {/* Expense Information */}
          <div className="mb-6">
            <h4 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="size-5" />
              Expense Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                <p className="text-gray-900 dark:text-white">{expense.subcategory}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Method</p>
                <p className="text-gray-900 dark:text-white">{expense.paymentMethod}</p>
              </div>
              {expense.paymentType && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Type</p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm">
                      {expense.paymentType}
                    </span>
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                <p className="text-gray-900 dark:text-white">{expense.description || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reference Number</p>
                <p className="text-gray-900 dark:text-white font-mono">{expense.paymentReference}</p>
              </div>
              {expense.receiptNumber && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Receipt Number</p>
                  <p className="text-gray-900 dark:text-white font-mono">{expense.receiptNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payee Information */}
          {payee && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="size-5" />
                Payee Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                  <p className="text-gray-900 dark:text-white">{payee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
                  <p className="text-gray-900 dark:text-white">{payee.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                  <p className="text-gray-900 dark:text-white">{payee.phone}</p>
                </div>
                {payee.email && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-gray-900 dark:text-white">{payee.email}</p>
                  </div>
                )}
                {payee.kraPin && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">KRA PIN</p>
                    <p className="text-gray-900 dark:text-white">{payee.kraPin}</p>
                  </div>
                )}
                {payee.contactPerson && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact Person</p>
                    <p className="text-gray-900 dark:text-white">{payee.contactPerson}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Information */}
          <div className="mb-6">
            <h4 className="text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="size-5" />
              Processing Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {expense.approvedBy && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved By</p>
                  <p className="text-gray-900 dark:text-white">{expense.approvedBy}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid By</p>
                <p className="text-gray-900 dark:text-white">{expense.paidBy}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="mb-6">
              <h4 className="text-gray-900 dark:text-white mb-2">Notes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {expense.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {expense.status === 'Pending' && (
              <>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <XCircle className="size-4" />
                  Reject
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <CheckCircle className="size-4" />
                  Approve
                </button>
              </>
            )}
            {expense.status === 'Approved' && (
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <CreditCard className="size-4" />
                Mark as Paid
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}