import { X, AlertCircle, Calendar, CreditCard, Building2, Smartphone, FileText, Info, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getMobileMoneyProviders, getCurrencyCode } from '../../utils/currencyUtils';

interface PhaseAdvanceModalProps {
  onClose: () => void;
  onConfirm: (data: PhaseAdvanceData) => void;
  currentPhase: 1 | 2 | 3 | 4;
  applicantName: string;
  loanAmount?: number;
  loanId: string;
}

export interface PhaseAdvanceData {
  notes?: string;
  releaseDate?: string;
  disbursementMethod?: string;
  sourceOfFunds?: string;
  accountNumber?: string;
}

export function PhaseAdvanceModal({ 
  onClose, 
  onConfirm, 
  currentPhase, 
  applicantName,
  loanAmount,
  loanId
}: PhaseAdvanceModalProps) {
  const { isDark } = useTheme();
  const { bankAccounts, clients, loans } = useData();
  const [notes, setNotes] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [disbursementMethod, setDisbursementMethod] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [accountNumberOption, setAccountNumberOption] = useState('registered'); // 'registered' or 'other'
  const [accountNumber, setAccountNumber] = useState('');

  // Get mobile money providers for the current country
  const mobileMoneyProviders = getMobileMoneyProviders();
  const currencyCode = getCurrencyCode();

  // Set default disbursement method when mobile money providers are loaded
  useEffect(() => {
    if (mobileMoneyProviders.length > 0 && !disbursementMethod) {
      setDisbursementMethod(mobileMoneyProviders[0].toLowerCase().replace(/\s+/g, '_'));
    }
  }, [mobileMoneyProviders]);

  // Get active bank accounts
  const activeAccounts = bankAccounts.filter(account => account.status === 'Active');

  // Find the client for this loan to get their registered phone/bank account
  const client = clients.find(c => c.name === applicantName);
  const registeredPhone = client?.phone || '';
  const registeredBankAccount = ''; // Clients don't have bank accounts yet, but we'll add support for it

  // Get selected account and check if it has sufficient funds
  const selectedAccount = activeAccounts.find(account => account.name === sourceOfFunds);
  const availableBalance = selectedAccount?.balance || 0;
  const hasInsufficientFunds = selectedAccount && loanAmount && availableBalance < loanAmount;

  // Check if current disbursement method is mobile money
  const isMobileMoneyMethod = disbursementMethod !== 'bank_transfer';

  // Auto-populate account number when disbursement method changes or option changes
  useEffect(() => {
    if (accountNumberOption === 'registered') {
      if (isMobileMoneyMethod) {
        setAccountNumber(registeredPhone);
      } else {
        setAccountNumber(registeredBankAccount);
      }
    } else {
      setAccountNumber('');
    }
  }, [disbursementMethod, accountNumberOption, registeredPhone, registeredBankAccount, isMobileMoneyMethod]);

  const getNextPhaseName = () => {
    const phaseNames = {
      1: 'Under Review',
      2: 'Approved for Disbursement',
      3: 'Ready for Disbursing',
      4: 'Active'
    };
    return phaseNames[currentPhase as keyof typeof phaseNames];
  };

  const getCurrentPhaseName = () => {
    const phaseNames = {
      1: 'Loan Requested',
      2: 'Under Review',
      3: 'Approved for Disbursement',
      4: 'Ready for Disbursing'
    };
    return phaseNames[currentPhase as keyof typeof phaseNames];
  };

  const handleConfirm = () => {
    const data: PhaseAdvanceData = {
      notes: notes || undefined,
    };

    // Add disbursement-specific fields if moving to disbursement phase
    if (currentPhase === 3) {
      data.releaseDate = releaseDate;
      data.disbursementMethod = disbursementMethod;
      // Use the selected account name as source of funds
      data.sourceOfFunds = sourceOfFunds;
      data.accountNumber = accountNumber;
    }

    onConfirm(data);
  };

  const isValid = () => {
    // For disbursement phase, require additional fields
    if (currentPhase === 3) {
      return releaseDate && accountNumber && sourceOfFunds && !hasInsufficientFunds;
    }
    return true;
  };

  // Get friendly name for the selected disbursement method
  const getDisbursementMethodName = () => {
    if (disbursementMethod === 'bank_transfer') {
      return 'Bank Transfer';
    }
    // Convert snake_case back to Title Case
    const provider = mobileMoneyProviders.find(
      p => p.toLowerCase().replace(/\s+/g, '_') === disbursementMethod
    );
    return provider || 'Mobile Money';
  };

  // Find the loan to get processing fee information
  const loan = loans.find(l => l.id === loanId);
  const processingFeePercentage = loan?.processingFeePercentage || 10; // Default 10%
  const processingFee = loanAmount ? (loanAmount * processingFeePercentage) / 100 : 0;
  const netDisbursementAmount = loanAmount ? loanAmount - processingFee : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto ${ isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${ isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
              <ArrowRight className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Advance to {getNextPhaseName()} Phase
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {loanId} - {applicantName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded transition-colors ${ isDark 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Info Banner */}
          <div className={`flex gap-2 p-2 rounded ${ isDark 
              ? 'bg-blue-900/20 border border-blue-700' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <AlertCircle className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                Moving from <span className="font-semibold">{getCurrentPhaseName()}</span> to <span className="font-semibold">{getNextPhaseName()}</span>
                {loanAmount && <span className="ml-1">• {currencyCode} {loanAmount.toLocaleString()}</span>}
              </p>
            </div>
          </div>

          {/* Disbursement-specific fields (Phase 3 → 4) */}
          {currentPhase === 3 && (
            <div className="space-y-2.5">
              <div className={`p-2 rounded ${ isDark ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'
              }`}>
                <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                  Disbursement Details Required
                </p>
              </div>

              {/* Loan Amount Breakdown */}
              {loanAmount && (
                <div className={`p-3 rounded border ${isDark ? 'bg-blue-900/10 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                  <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                    Loan Amount Breakdown
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Principal (Applied):
                      </span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currencyCode} {loanAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Processing Fee ({processingFeePercentage}%):
                      </span>
                      <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        - {currencyCode} {processingFee.toLocaleString()}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center pt-1.5 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                      <span className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                        Net Cash to Client:
                      </span>
                      <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {currencyCode} {netDisbursementAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={`mt-2 pt-2 border-t text-xs ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
                    <Info className="size-3 inline mr-1" />
                    Processing fee is deducted upfront. Interest is calculated on full principal of {currencyCode} {loanAmount.toLocaleString()}.
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Release Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${ isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2 rounded border text-sm ${ isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Disbursement Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={disbursementMethod}
                  onChange={(e) => setDisbursementMethod(e.target.value)}
                  className={`w-full px-3 py-2 rounded border text-sm ${ isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {mobileMoneyProviders.map(provider => (
                    <option key={provider.toLowerCase().replace(/\s+/g, '_')} value={provider.toLowerCase().replace(/\s+/g, '_')}>
                      {provider}
                    </option>
                  ))}
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isMobileMoneyMethod ? `Client's ${getDisbursementMethodName()} Number` : "Client's Bank Account Number"} <span className="text-red-500">*</span>
                </label>
                <select
                  value={accountNumberOption}
                  onChange={(e) => setAccountNumberOption(e.target.value)}
                  className={`w-full px-3 py-2 rounded border text-sm mb-1.5 ${ isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="registered">
                    {isMobileMoneyMethod 
                      ? `Registered Phone: ${registeredPhone || 'Not available'}` 
                      : `Registered Bank Account: ${registeredBankAccount || 'Not available'}`}
                  </option>
                  <option value="other">Other (Enter manually)</option>
                </select>
                
                {accountNumberOption === 'other' && (
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={
                      isMobileMoneyMethod ? 'Phone number' : 'Account number'
                    }
                    className={`w-full px-3 py-2 rounded border text-sm ${ isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                )}
                
                {accountNumberOption === 'registered' && accountNumber && (
                  <div className={`p-2 rounded text-sm ${ isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-700'
                  }`}>
                    {accountNumber}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Source of Funds <span className="text-red-500">*</span>
                </label>
                <select
                  value={sourceOfFunds}
                  onChange={(e) => setSourceOfFunds(e.target.value)}
                  className={`w-full px-3 py-2 rounded border text-sm ${ isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select source of funds</option>
                  {activeAccounts.map((account) => (
                    <option key={account.id} value={account.name}>
                      {account.name} - {currencyCode} {account.balance.toLocaleString()} ({account.accountType}{account.bankName ? ` - ${account.bankName}` : ''})
                    </option>
                  ))}
                </select>
                
                {/* Show selected account balance */}
                {selectedAccount && (
                  <div className={`mt-1.5 p-2 rounded ${ isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Current Balance:
                      </span>
                      <span className={`text-sm font-medium ${ hasInsufficientFunds 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {currencyCode} {selectedAccount.balance.toLocaleString()}
                      </span>
                    </div>
                    {loanAmount && (
                      <>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Disbursement:
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {currencyCode} {loanAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className={`flex items-center justify-between mt-1 pt-1 border-t ${ isDark ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            After Disbursement:
                          </span>
                          <span className={`text-sm font-medium ${ hasInsufficientFunds 
                              ? 'text-red-600 dark:text-red-400' 
                              : isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {currencyCode} {(selectedAccount.balance - loanAmount).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Insufficient Funds Warning */}
              {hasInsufficientFunds && (
                <div className={`flex gap-2 p-2 rounded ${ isDark 
                    ? 'bg-red-900/20 border border-red-700' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <AlertCircle className="size-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-900'}`}>
                      Insufficient funds in selected account. Please choose a different account or add funds.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes (all phases) */}
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes {currentPhase !== 3 && '(Optional)'}
            </label>
            <div className="relative">
              <FileText className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${ isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Add notes about advancing to ${getNextPhaseName()} phase...`}
                className={`w-full pl-10 pr-3 py-2 rounded border text-sm ${ isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-2 p-4 border-t ${ isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded border transition-colors text-sm ${ isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid()}
            className={`flex-1 px-4 py-2 rounded flex items-center justify-center gap-1.5 transition-colors text-sm ${ isValid()
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="size-4" />
            Advance to {getNextPhaseName()}
          </button>
        </div>
      </div>
    </div>
  );
}