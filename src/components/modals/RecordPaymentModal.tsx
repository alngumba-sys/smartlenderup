import { useState } from 'react';
import { X, DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode, getMobileMoneyProviders } from '../../utils/currencyUtils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  preselectedLoanId?: string;
}

export function RecordPaymentModal({ isOpen, onClose, onSubmit, preselectedLoanId }: RecordPaymentModalProps) {
  const { isDark } = useTheme();
  const { clients, loans, bankAccounts } = useData();
  const currencyCode = getCurrencyCode();
  const mobileMoneyProviders = getMobileMoneyProviders();
  const defaultProvider = mobileMoneyProviders[0] || 'Mobile Money';
  
  const [step, setStep] = useState<'form' | 'verify'>(preselectedLoanId ? 'form' : 'form');
  const [formData, setFormData] = useState({
    loanId: preselectedLoanId || '',
    paymentMethod: defaultProvider,
    amount: '',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    mpesaPhone: '',
    mpesaCode: '',
    bankAccountId: '',
    destinationAccountId: '' // New field for where payment was received
  });

  // Format number with commas
  const formatNumberWithCommas = (value: string) => {
    const numbers = value.replace(/[^\d.]/g, '');
    const parts = numbers.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '' || !isNaN(Number(rawValue))) {
      setFormData({ ...formData, amount: rawValue });
    }
  };

  // Handle payment method change and clear destination account if it's no longer valid
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPaymentMethod = e.target.value;
    const newIsMobileMoney = mobileMoneyProviders.includes(newPaymentMethod);
    
    // Check if the currently selected destination account is still valid
    const currentAccount = bankAccounts.find(acc => acc.id === formData.destinationAccountId);
    let shouldClearDestination = false;
    
    if (currentAccount) {
      if (newIsMobileMoney && currentAccount.accountType !== 'Mobile Money') {
        shouldClearDestination = true;
      } else if (!newIsMobileMoney && currentAccount.accountType !== 'Bank') {
        shouldClearDestination = true;
      }
    }
    
    setFormData({ 
      ...formData, 
      paymentMethod: newPaymentMethod,
      destinationAccountId: shouldClearDestination ? '' : formData.destinationAccountId
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate destination account is selected
    if (!formData.destinationAccountId) {
      alert('Please select where the payment was received (Bank Account or Mobile Money Account)');
      return;
    }
    
    // Validate that reference code is provided
    const isMobileMoney = mobileMoneyProviders.includes(formData.paymentMethod);
    if (isMobileMoney && !formData.mpesaCode) {
      alert('Mobile Money Code is required');
      return;
    }
    if (!isMobileMoney && !formData.transactionRef) {
      alert('Bank Reference is required');
      return;
    }
    
    // Move to verification step
    setStep('verify');
  };

  const handleConfirmPayment = () => {
    onSubmit(formData);
    // Reset form and close
    setStep('form');
    setFormData({
      loanId: '',
      paymentMethod: defaultProvider,
      amount: '',
      transactionRef: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
      mpesaPhone: '',
      mpesaCode: '',
      bankAccountId: '',
      destinationAccountId: ''
    });
  };

  const handleBack = () => {
    setStep('form');
  };

  if (!isOpen) return null;

  const selectedLoan = loans.find(l => l.id === formData.loanId);
  const selectedClient = selectedLoan ? clients.find(c => c.id === selectedLoan.clientId) : null;
  
  // Check if selected payment method is a mobile money provider
  const isMobileMoney = mobileMoneyProviders.includes(formData.paymentMethod);
  
  // Filter for loans that have been issued/disbursed and can receive payments
  const activeLoans = loans.filter(loan => 
    loan.status === 'Active' || 
    loan.status === 'Disbursed' || 
    loan.status === 'In Arrears'
  );

  // Filter destination accounts based on payment method
  // If Mobile Money payment → show only Mobile Money accounts
  // If Bank Transfer/Cheque → show only Bank accounts
  const destinationBankAccounts = bankAccounts.filter(acc => {
    // More flexible status check (handle both 'Active' and 'active')
    const isActive = acc.status && acc.status.toLowerCase() === 'active';
    if (!isActive) return false;
    
    if (isMobileMoney) {
      return acc.accountType === 'Mobile Money';
    } else {
      return acc.accountType === 'Bank';
    }
  });

  const selectedDestinationAccount = bankAccounts.find(acc => acc.id === formData.destinationAccountId);
  
  // Debug: Log available accounts when payment method changes
  console.log('Payment Method:', formData.paymentMethod);
  console.log('Is Mobile Money:', isMobileMoney);
  console.log('All Bank Accounts:', bankAccounts);
  console.log('Filtered Destination Accounts:', destinationBankAccounts);

  // Verification Step View
  if (step === 'verify') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 ${isDark ? 'dark' : ''}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-xl w-full max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h2 className="text-gray-900 dark:text-white text-lg">Verify Payment Details</h2>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Please review and confirm</p>
              </div>
            </div>
          </div>

          {/* Verification Content */}
          <div className="p-4 space-y-3">
            {/* Loan & Client Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-2">Loan & Client Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Client Name:</span>
                  <p className="text-gray-900 dark:text-white">{selectedLoan?.clientName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Loan ID:</span>
                  <p className="text-gray-900 dark:text-white">{selectedLoan?.loanNumber || selectedLoan?.id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Outstanding Balance:</span>
                  <p className="text-emerald-600 dark:text-emerald-400">{currencyCode} {(selectedLoan?.outstandingBalance || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Payment Amount:</span>
                  <p className="text-gray-900 dark:text-white">{currencyCode} {Number(formData.amount).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-2">Payment Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Payment Method:</span>
                  <p className="text-gray-900 dark:text-white">{formData.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Payment Date:</span>
                  <p className="text-gray-900 dark:text-white">{formData.paymentDate}</p>
                </div>
                {isMobileMoney ? (
                  <>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Phone Number:</span>
                      <p className="text-gray-900 dark:text-white">{formData.mpesaPhone}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Mobile Money Code:</span>
                      <p className="text-gray-900 dark:text-white font-mono">{formData.mpesaCode}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Bank Reference:</span>
                      <p className="text-gray-900 dark:text-white font-mono">{formData.transactionRef}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Destination Account */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-2">Payment Received To</h3>
              <div>
                <p className="text-gray-900 dark:text-white text-sm">
                  {selectedDestinationAccount?.accountType === 'Bank' && selectedDestinationAccount?.bankName 
                    ? selectedDestinationAccount.bankName 
                    : (selectedDestinationAccount?.name || 'N/A')}
                  {selectedDestinationAccount?.accountNumber && ` - ${selectedDestinationAccount.accountNumber}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Type: {selectedDestinationAccount?.accountType} | Current Balance: {currencyCode} {selectedDestinationAccount?.balance.toLocaleString()}
                </p>
              </div>
            </div>

            {formData.notes && (
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Additional Notes</h3>
                <p className="text-gray-900 dark:text-white text-sm">{formData.notes}</p>
              </div>
            )}

            {/* Warning Message */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-2 flex items-start gap-2">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Please verify all details are correct. This payment will be recorded and account balance updated.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end px-4 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
            >
              Back to Edit
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
            >
              <CheckCircle className="size-4" />
              Confirm & Record Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form Step View
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[rgb(208,239,255)] dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-white text-2xl">Record Payment</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Record a loan repayment from client</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
            <X className="size-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Loan Selection */}
            <div className="col-span-3">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Select Loan *</label>
              <select
                required
                value={formData.loanId}
                onChange={(e) => setFormData({ ...formData, loanId: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">Choose a loan...</option>
                {activeLoans
                  .map(loan => {
                    // Try to find client by matching various ID formats
                    const client = clients.find(c => 
                      c.id === loan.clientId || 
                      c.clientNumber === loan.clientId || 
                      c.client_number === loan.clientId
                    );
                    
                    // ✅ Use loan.loanId for user-friendly loan ID (LN00001 format)
                    const loanId = loan.loanId || loan.loan_id || 'N/A';
                    // Use loan.clientName which is already mapped from DB
                    const clientName = loan.clientName || (client?.name) || 'Unknown Client';
                    const outstanding = (loan.outstandingBalance || 0).toLocaleString();
                    
                    return (
                      <option key={loan.id} value={loan.id}>
                        {clientName} - {loanId} - Outstanding: {currencyCode} {outstanding}
                      </option>
                    );
                  })}
              </select>
              {activeLoans.length === 0 && (
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-1 flex items-center gap-1">
                  ⚠️ No active loans available. Only active loans can receive repayments.
                </p>
              )}
            </div>

            {/* Loan Details Display */}
            {selectedLoan && selectedClient && (
              <div className="col-span-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Client:</span>
                    <p className="text-gray-900 dark:text-white">{selectedClient.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Loan ID:</span>
                    <p className="text-gray-900 dark:text-white">{selectedLoan.loanId || selectedLoan.loanNumber || selectedLoan.loan_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Outstanding:</span>
                    <p className="text-emerald-700">{currencyCode} {(selectedLoan.outstandingBalance || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <p className="text-gray-900 dark:text-white">{selectedLoan.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            {/* Row 1: Payment Method + (Phone + Mobile Money Code) OR (Bank Account + Bank Reference) */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
              <select
                required
                value={formData.paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                {mobileMoneyProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            
            {isMobileMoney ? (
              <>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required={isMobileMoney}
                    value={formData.mpesaPhone}
                    onChange={(e) => setFormData({ ...formData, mpesaPhone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Mobile Money Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.mpesaCode}
                    onChange={(e) => setFormData({ ...formData, mpesaCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                    placeholder="e.g. SK12ABC34D"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Bank Reference / Cheque Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                    placeholder="Bank ref or Cheque no."
                  />
                </div>
              </>
            )}

            {/* Payment Received To (Destination Account) */}
            <div className="col-span-3">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Payment Received To (Company Account) *
              </label>
              <select
                required
                value={formData.destinationAccountId}
                onChange={(e) => setFormData({ ...formData, destinationAccountId: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">Select where payment was received...</option>
                {destinationBankAccounts.map(account => {
                  // For Bank accounts, show bank name; for Mobile Money, show account name
                  const displayName = account.accountType === 'Bank' && account.bankName 
                    ? account.bankName 
                    : account.name;
                  
                  return (
                    <option key={account.id} value={account.id}>
                      {displayName} ({account.accountType}) 
                      {account.accountNumber ? ` - ${account.accountNumber}` : ''} 
                      - Balance: {currencyCode} {account.balance.toLocaleString()}
                    </option>
                  );
                })}
              </select>
              {destinationBankAccounts.length === 0 && (
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                  ⚠️ No active {isMobileMoney ? 'mobile money' : 'bank'} accounts found. Please add a {isMobileMoney ? 'mobile money' : 'bank'} account in Settings.
                </p>
              )}
            </div>

            {/* Row 2: Amount, Payment Date */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount ({currencyCode}) *</label>
              <input
                type="text"
                required
                value={formData.amount ? formatNumberWithCommas(formData.amount) : ''}
                onChange={handleAmountChange}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Notes */}
            <div className="col-span-3">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-[#111120] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <DollarSign className="size-4" />
              Continue to Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}