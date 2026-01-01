import { X, DollarSign, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

interface EarlySettlementModalProps {
  loanId: string;
  onClose: () => void;
}

export function EarlySettlementModal({ loanId, onClose }: EarlySettlementModalProps) {
  const { isDark } = useTheme();
  const { loans, clients, settleLoanEarly } = useData();
  const loan = loans.find(l => l.id === loanId);
  const client = loan ? clients.find(c => c.id === loan?.clientId) : null;
  
  const [settlementDate, setSettlementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [includeRebate, setIncludeRebate] = useState(true);

  if (!loan || !client) return null;

  // Calculate settlement amount
  const calculateSettlement = () => {
    const outstanding = loan.outstandingBalance;
    const remainingInterest = outstanding * 0.15; // Approximate remaining interest
    
    let settlementAmount = outstanding;
    let rebateAmount = 0;
    
    if (includeRebate) {
      // Calculate rebate (unearned interest)
      const daysRemaining = Math.max(0, 
        (new Date(loan.maturityDate).getTime() - new Date(settlementDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalDays = (new Date(loan.maturityDate).getTime() - new Date(loan.disbursementDate).getTime()) / (1000 * 60 * 60 * 24);
      rebateAmount = remainingInterest * (daysRemaining / totalDays);
      settlementAmount = outstanding - rebateAmount;
    }

    return {
      outstandingPrincipal: Math.round(outstanding * 0.7),
      outstandingInterest: Math.round(outstanding * 0.2),
      pendingFees: Math.round(outstanding * 0.1),
      rebateAmount: Math.round(rebateAmount),
      totalSettlement: Math.round(settlementAmount),
      savingsFromRebate: Math.round(rebateAmount)
    };
  };

  const settlement = calculateSettlement();
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      alert('Please confirm the settlement terms');
      return;
    }
    console.log('Processing early settlement:', {
      loanId,
      settlementDate,
      amount: settlement.totalSettlement,
      paymentMethod
    });
    settleLoanEarly(loanId, settlementDate, paymentMethod, settlement.totalSettlement);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="size-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-gray-900 dark:text-white">Early Loan Settlement</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Loan Details */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-gray-900 dark:text-white mb-3">Loan Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Loan ID</p>
                  <p className="text-gray-900 dark:text-white">{loan.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Client Name</p>
                  <p className="text-gray-900 dark:text-white">{client.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Disbursement Date</p>
                  <p className="text-gray-900 dark:text-white">{loan.disbursementDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Maturity Date</p>
                  <p className="text-gray-900 dark:text-white">{loan.maturityDate}</p>
                </div>
              </div>
            </div>

            {/* Settlement Date */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Settlement Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Rebate Option */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="rebate"
                  checked={includeRebate}
                  onChange={(e) => setIncludeRebate(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="rebate" className="text-sm text-blue-900 dark:text-blue-100 cursor-pointer">
                    <strong>Apply Interest Rebate (Unearned Interest)</strong>
                  </label>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                    Calculate and deduct unearned interest for early settlement. 
                    This gives the client a discount for paying early.
                  </p>
                  
                  {/* Formula Explanation */}
                  <div className="mt-3 p-2.5 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-300 dark:border-blue-700">
                    <p className="text-[10px] text-blue-900 dark:text-blue-200 font-medium mb-1">CALCULATION FORMULA:</p>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                      <strong>Total Savings</strong> = (Remaining Monthly Payments × Number of Months Left) − Settlement Amount
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settlement Calculation */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="size-5 text-gray-700 dark:text-gray-300" />
                <h4 className="text-gray-900 dark:text-white">Settlement Calculation</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Outstanding Principal</span>
                  <span className="text-gray-900 dark:text-white">KES {settlement.outstandingPrincipal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Outstanding Interest</span>
                  <span className="text-gray-900 dark:text-white">KES {settlement.outstandingInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Pending Fees & Penalties</span>
                  <span className="text-gray-900 dark:text-white">KES {settlement.pendingFees.toLocaleString()}</span>
                </div>
                {includeRebate && settlement.rebateAmount > 0 && (
                  <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-emerald-600 dark:text-emerald-400">Less: Interest Rebate</span>
                    <span className="text-emerald-600 dark:text-emerald-400">-KES {settlement.rebateAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 px-4 rounded-lg mt-3">
                  <span className="text-emerald-900 dark:text-emerald-300">Total Settlement Amount</span>
                  <span className="text-emerald-900 dark:text-emerald-300 text-xl">
                    KES {settlement.totalSettlement.toLocaleString()}
                  </span>
                </div>
              </div>

              {includeRebate && settlement.savingsFromRebate > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-900 dark:text-emerald-300">
                    Client saves <strong>KES {settlement.savingsFromRebate.toLocaleString()}</strong> by settling early!
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                required
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Confirmation */}
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900 dark:text-amber-300">
                  <p className="mb-2">
                    <strong>Important Notice</strong>
                  </p>
                  <p>
                    This action will close the loan permanently. Once settled, the loan cannot be reopened. 
                    A settlement certificate will be generated for the client.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-3">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="confirm" className="text-sm text-gray-700 dark:text-gray-300">
                  I confirm that the settlement amount of <strong>KES {settlement.totalSettlement.toLocaleString()}</strong> is correct 
                  and the client understands this will close the loan.
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Process Settlement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}