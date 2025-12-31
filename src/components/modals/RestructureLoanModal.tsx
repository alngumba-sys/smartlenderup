import { X, FileEdit, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

interface RestructureLoanModalProps {
  loanId: string;
  onClose: () => void;
}

export function RestructureLoanModal({ loanId, onClose }: RestructureLoanModalProps) {
  const { isDark } = useTheme();
  const { loans, clients, restructureLoan, loanProducts } = useData();
  const loan = loans.find(l => l.id === loanId);
  const client = loan ? clients.find(c => c.id === loan?.clientId) : null;
  
  // Check if loan is disbursed (Active status)
  const isLoanDisbursed = loan?.status === 'Active';
  
  const [restructureDate, setRestructureDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedProductId, setSelectedProductId] = useState(loan?.productId || '');
  const [newTenor, setNewTenor] = useState(12);
  const [reason, setReason] = useState('');
  const [waivePenalties, setWaivePenalties] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  // Get interest rate from selected product (read-only)
  const selectedProduct = loanProducts.find(p => p.id === selectedProductId);
  const newInterestRate = selectedProduct?.interestRate || loan?.interestRate || 10;

  if (!loan || !client) return null;

  // Calculate restructure terms
  const calculateRestructure = () => {
    const outstanding = loan.outstandingBalance;
    const currentPenalties = Math.round(outstanding * 0.05); // 5% penalties assumed
    
    let newPrincipal = outstanding;
    if (waivePenalties) {
      newPrincipal = outstanding - currentPenalties;
    }

    const newMonthlyPayment = (newPrincipal * (1 + newInterestRate / 100)) / newTenor;
    const totalNewAmount = newMonthlyPayment * newTenor;
    const totalInterest = totalNewAmount - newPrincipal;

    return {
      currentOutstanding: outstanding,
      currentPenalties,
      newPrincipal: Math.round(newPrincipal),
      newMonthlyPayment: Math.round(newMonthlyPayment),
      totalNewAmount: Math.round(totalNewAmount),
      totalInterest: Math.round(totalInterest),
      savingsFromWaiver: waivePenalties ? currentPenalties : 0
    };
  };

  const restructure = calculateRestructure();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      alert('Please confirm the restructure terms');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a reason for restructuring');
      return;
    }
    console.log('Processing loan restructure:', {
      loanId,
      restructureDate,
      newTenor,
      newInterestRate,
      newPrincipal: restructure.newPrincipal,
      newMonthlyPayment: restructure.newMonthlyPayment,
      reason,
      waivePenalties
    });
    restructureLoan({
      loanId,
      restructureDate,
      newTenor,
      newInterestRate,
      newPrincipal: restructure.newPrincipal,
      newMonthlyPayment: restructure.newMonthlyPayment,
      reason,
      waivePenalties
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileEdit className="size-6 text-amber-600 dark:text-amber-400" />
              <h3 className="text-gray-900 dark:text-white">Restructure Loan</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Loan Details */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-gray-900 dark:text-white mb-3">Current Loan Information</h4>
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
                  <p className="text-gray-600 dark:text-gray-400">Original Principal</p>
                  <p className="text-gray-900 dark:text-white">KES {loan.principalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Outstanding Balance</p>
                  <p className="text-gray-900 dark:text-white">KES {loan.outstandingBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Current Interest Rate</p>
                  <p className="text-gray-900 dark:text-white">{loan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Days in Arrears</p>
                  <p className="text-red-600 dark:text-red-400">{loan.daysInArrears} days</p>
                </div>
              </div>
            </div>

            {/* Restructure Date */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Restructure Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={restructureDate}
                onChange={(e) => setRestructureDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                required
              />
            </div>
            
            {/* Loan Product Selection - Only enabled if not disbursed */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Loan Product <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={isLoanDisbursed}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm ${
                  isLoanDisbursed ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''
                }`}
                required
              >
                <option value="">Select a loan product...</option>
                {loanProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.interestRate}% {product.interestType}
                  </option>
                ))}
              </select>
              {isLoanDisbursed && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Cannot change loan product for disbursed loans
                </p>
              )}
            </div>

            {/* New Terms */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    New Tenor (Months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newTenor}
                    onChange={(e) => setNewTenor(Number(e.target.value))}
                    min="3"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Interest Rate (%) <span className="text-gray-500 text-xs">(from product)</span>
                  </label>
                  <input
                    type="number"
                    value={newInterestRate}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    🔒 Interest rate is set by the selected loan product
                  </p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Reason for Restructuring <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                rows={3}
                placeholder="e.g., Client facing temporary financial difficulty, needs extended repayment period..."
                required
              />
            </div>

            {/* Waive Penalties Option */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="waivePenalties"
                  checked={waivePenalties}
                  onChange={(e) => setWaivePenalties(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <label htmlFor="waivePenalties" className="text-sm text-blue-900 dark:text-blue-300 cursor-pointer">
                    <strong>Waive Accumulated Penalties</strong>
                  </label>
                  <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                    Remove penalties from the outstanding balance as a goodwill gesture to help the client recover.
                  </p>
                </div>
              </div>
            </div>

            {/* Restructure Calculation */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="size-5 text-gray-700 dark:text-gray-300" />
                <h4 className="text-gray-900 dark:text-white">New Loan Terms</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Current Outstanding</span>
                  <span className="text-gray-900 dark:text-white">KES {restructure.currentOutstanding.toLocaleString()}</span>
                </div>
                {waivePenalties && restructure.currentPenalties > 0 && (
                  <>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Current Penalties</span>
                      <span className="text-gray-900 dark:text-white">KES {restructure.currentPenalties.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-emerald-600 dark:text-emerald-400">Less: Waived Penalties</span>
                      <span className="text-emerald-600 dark:text-emerald-400">-KES {restructure.savingsFromWaiver.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">New Principal Amount</span>
                  <span className="text-gray-900 dark:text-white">KES {restructure.newPrincipal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">New Interest Rate</span>
                  <span className="text-gray-900 dark:text-white">{newInterestRate}%</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">New Tenor</span>
                  <span className="text-gray-900 dark:text-white">{newTenor} months</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Interest</span>
                  <span className="text-gray-900 dark:text-white">KES {restructure.totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 px-4 rounded-lg mt-3">
                  <span className="text-amber-900 dark:text-amber-300">New Monthly Payment</span>
                  <span className="text-amber-900 dark:text-amber-300 text-xl">
                    KES {restructure.newMonthlyPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Total Amount to Repay</span>
                  <span className="text-gray-900 dark:text-white">
                    KES {restructure.totalNewAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {waivePenalties && restructure.savingsFromWaiver > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-900 dark:text-emerald-300">
                    Penalties waived: <strong>KES {restructure.savingsFromWaiver.toLocaleString()}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900 dark:text-amber-300">
                  <p className="mb-2">
                    <strong>Important Notice</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>The original loan will be closed and a new loan agreement created</li>
                    <li>A restructure record will be kept in the loan history</li>
                    <li>The client must agree to and sign the new terms</li>
                    <li>This action requires managerial approval</li>
                  </ul>
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
                  I confirm that the client agrees to the new terms: {newTenor} months at {newInterestRate}% interest 
                  with monthly payments of <strong>KES {restructure.newMonthlyPayment.toLocaleString()}</strong>.
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}