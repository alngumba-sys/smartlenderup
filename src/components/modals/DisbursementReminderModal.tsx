import { X, AlertTriangle, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface DueLoan {
  id: string;
  applicantName: string;
  amount: number;
  releaseDate: string;
  disbursementMethod: string;
  sourceOfFunds: string;
  accountNumber: string;
  daysPastDue: number;
}

interface DisbursementReminderModalProps {
  dueLoans: DueLoan[];
  onClose: () => void;
  onMarkDisbursed: (loanId: string) => void;
}

export function DisbursementReminderModal({ 
  dueLoans, 
  onClose, 
  onMarkDisbursed 
}: DisbursementReminderModalProps) {
  const { isDark } = useTheme();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [dismissedLoans, setDismissedLoans] = useState<Set<string>>(new Set());

  const handleMarkDisbursed = (loanId: string) => {
    setSelectedLoanId(loanId);
    // Add to dismissed loans immediately
    setDismissedLoans(prev => new Set([...prev, loanId]));
    
    setTimeout(() => {
      onMarkDisbursed(loanId);
      setSelectedLoanId(null);
      
      // Check if all loans are now dismissed
      const remainingLoans = dueLoans.filter(loan => !dismissedLoans.has(loan.id) && loan.id !== loanId);
      if (remainingLoans.length === 0) {
        onClose();
      }
    }, 300);
  };

  // Filter out dismissed loans from the display
  const visibleLoans = dueLoans.filter(loan => !dismissedLoans.has(loan.id));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${
          isDark ? 'border-gray-700 bg-red-900/20' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-red-900/40' : 'bg-red-100'
            }`}>
              <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Disbursement Reminder
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-red-300' : 'text-red-700'
              }`}>
                {visibleLoans.length} loan{visibleLoans.length > 1 ? 's' : ''} pending disbursement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
            isDark 
              ? 'bg-amber-900/20 border border-amber-700' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <Clock className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isDark ? 'text-amber-300' : 'text-amber-900'
              }`}>
                The following loans have reached their scheduled disbursement date
              </p>
              <p className={`text-xs mt-1 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}>
                Please disburse the funds and mark each loan as completed. This reminder will appear on every login until all loans are disbursed.
              </p>
            </div>
          </div>

          {/* Due Loans List */}
          <div className="space-y-3">
            {visibleLoans.map((loan) => (
              <div 
                key={loan.id}
                className={`rounded-lg border p-4 transition-all ${
                  selectedLoanId === loan.id
                    ? 'opacity-50 scale-98'
                    : ''
                } ${
                  isDark 
                    ? 'bg-gray-750 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Loan Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {loan.applicantName}
                      </h4>
                      {loan.daysPastDue > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {loan.daysPastDue} day{loan.daysPastDue > 1 ? 's' : ''} overdue
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Loan ID: {loan.id}
                    </p>

                    {/* Loan Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className={`text-xs mb-1 ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Amount
                        </p>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                          <p className={`font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            KES {loan.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className={`text-xs mb-1 ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Release Date
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                          <p className={`font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatDate(loan.releaseDate)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className={`text-xs mb-1 ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Method
                        </p>
                        <p className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {loan.disbursementMethod === 'mpesa' ? 'M-Pesa' :
                           loan.disbursementMethod === 'bank' ? 'Bank Transfer' :
                           loan.disbursementMethod === 'cash' ? 'Cash' :
                           'Check'}
                        </p>
                      </div>

                      <div>
                        <p className={`text-xs mb-1 ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Source
                        </p>
                        <p className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {loan.sourceOfFunds}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className={`text-xs mb-1 ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Account/Reference
                        </p>
                        <p className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {loan.accountNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mark as Disbursed Button */}
                  <button
                    onClick={() => handleMarkDisbursed(loan.id)}
                    disabled={selectedLoanId === loan.id}
                    className="flex-shrink-0 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="size-4" />
                    <span className="text-sm font-medium">Mark Disbursed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 p-5 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Close (Remind Me Later)
          </button>
        </div>
      </div>
    </div>
  );
}