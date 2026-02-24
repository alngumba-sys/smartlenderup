import { useState } from 'react';
import { X, RefreshCw, DollarSign, Calendar, PercentIcon, Info } from 'lucide-react';
import { formatCurrency, getCurrencyCode } from '../../utils/currencyUtils';
import { toast } from 'sonner';
import { useData } from '../../contexts/DataContext';

interface LoanRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
}

export function LoanRolloverModal({ isOpen, onClose, loanId }: LoanRolloverModalProps) {
  const { loans, clients } = useData();
  const currencyCode = getCurrencyCode();
  
  const loan = loans.find(l => l.id === loanId);
  const client = loan ? clients.find(c => c.id === loan.clientId || c.id === loan.clientUuid) : null;
  
  const [rolloverType, setRolloverType] = useState<'renew' | 'refinance' | 'extend'>('renew');
  const [newPrincipal, setNewPrincipal] = useState(loan?.principalAmount || 0);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [newTerm, setNewTerm] = useState(loan?.term || 12);
  const [newInterestRate, setNewInterestRate] = useState(loan?.interestRate || 15);
  const [rolloutstanding, setRollOutstanding] = useState(true);
  
  if (!isOpen || !loan) return null;

  const totalPaid = loan.paidAmount ?? loan.amount_paid ?? loan.amountPaid ?? 0;
  const totalRepayable = loan.totalRepayable || loan.totalRepayment || 0;
  const outstandingBalance = totalRepayable - totalPaid;
  const totalNewLoan = rolloutstanding ? outstandingBalance + additionalAmount : newPrincipal;
  const monthlyPayment = (totalNewLoan * (1 + (newInterestRate / 100))) / newTerm;

  const handleSubmit = () => {
    // In production, this would update the loan in the database
    toast.success('Loan Rollover Initiated', {
      description: `New loan of ${totalNewLoan.toLocaleString()} created`,
      duration: 5000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white/20 rounded-lg flex items-center justify-center">
                <RefreshCw className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Roll over / Renew Loan
                </h2>
                <p className="text-sm text-blue-100">
                  {client?.name || client?.firstName + ' ' + client?.lastName || 'Unknown Client'} - {loan.loanNumber || loanId.substring(0, 8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <X className="size-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Current Loan Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Loan Status</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <label className="text-xs text-gray-600">Original Principal</label>
                <p className="font-semibold text-gray-900">{formatCurrency(loan.principalAmount)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Amount Paid</label>
                <p className="font-semibold text-emerald-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Outstanding Balance</label>
                <p className="font-semibold text-red-600">{formatCurrency(outstandingBalance)}</p>
              </div>
            </div>
          </div>

          {/* Rollover Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Rollover Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setRolloverType('renew')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  rolloverType === 'renew'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RefreshCw className={`size-4 mb-1 ${
                  rolloverType === 'renew' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <p className={`text-xs font-semibold ${
                  rolloverType === 'renew' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Renew
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  New loan with same terms
                </p>
              </button>

              <button
                onClick={() => setRolloverType('refinance')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  rolloverType === 'refinance'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className={`size-4 mb-1 ${
                  rolloverType === 'refinance' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <p className={`text-xs font-semibold ${
                  rolloverType === 'refinance' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Refinance
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  New terms & amount
                </p>
              </button>

              <button
                onClick={() => setRolloverType('extend')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  rolloverType === 'extend'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className={`size-4 mb-1 ${
                  rolloverType === 'extend' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <p className={`text-xs font-semibold ${
                  rolloverType === 'extend' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Extend
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  Extend repayment period
                </p>
              </button>
            </div>
          </div>

          {/* Loan Adjustment Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Loan Adjustment Settings</h3>

            {/* Roll Outstanding Balance */}
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <Info className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Roll Outstanding Balance
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Include {formatCurrency(outstandingBalance)} outstanding balance in new loan
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={rolloutstanding}
                onChange={(e) => setRollOutstanding(e.target.checked)}
                className="size-5 rounded border-gray-300 text-blue-600"
              />
            </div>

            {/* New Principal (if not rolling outstanding) */}
            {!rolloutstanding && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Principal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                    {currencyCode}
                  </span>
                  <input
                    type="number"
                    value={newPrincipal}
                    onChange={(e) => setNewPrincipal(Number(e.target.value))}
                    className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Additional Top-up Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Additional Top-up Amount (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  {currencyCode}
                </span>
                <input
                  type="number"
                  value={additionalAmount}
                  onChange={(e) => setAdditionalAmount(Number(e.target.value))}
                  className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Add extra funds to the new loan
              </p>
            </div>

            {/* New Loan Term */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Loan Term (Months)
                </label>
                <input
                  type="number"
                  value={newTerm}
                  onChange={(e) => setNewTerm(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newInterestRate}
                  onChange={(e) => setNewInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">New Loan Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-blue-700">Total New Loan Amount</label>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(totalNewLoan)}</p>
              </div>
              <div>
                <label className="text-xs text-blue-700">Estimated Monthly Payment</label>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(monthlyPayment)}</p>
              </div>
              <div>
                <label className="text-xs text-blue-700">Loan Term</label>
                <p className="text-sm font-semibold text-blue-900">{newTerm} months</p>
              </div>
              <div>
                <label className="text-xs text-blue-700">Interest Rate</label>
                <p className="text-sm font-semibold text-blue-900">{newInterestRate}% per annum</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Process Rollover
          </button>
        </div>
      </div>
    </div>
  );
}