import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { BankAccountsSection } from '../sections/BankAccountsSection';
import { FundAccountModal, FundAccountData } from '../modals/FundAccountModal';
import { toast } from 'sonner@2.0.3';
import { getCurrencyCode, formatCurrency } from '../../utils/currencyUtils';

export function BankAccountsTab() {
  const { 
    bankAccounts,
    updateBankAccount,
    addShareholderTransaction,
    fundingTransactions,
    addFundingTransaction,
    shareholders,
    updateShareholder
  } = useData();
  
  const [showFundAccountModal, setShowFundAccountModal] = useState(false);
  const [activeBank, setActiveBank] = useState<string>('all');
  const currencyCode = getCurrencyCode();

  const handleFundAccount = (data: FundAccountData) => {
    // Find the bank account
    const bankAccount = bankAccounts.find(acc => acc.id === data.bankAccountId);
    
    if (!bankAccount) {
      toast.error('Bank account not found');
      return;
    }

    // Update the bank account balance
    updateBankAccount(data.bankAccountId, {
      balance: bankAccount.balance + data.amount
    });

    // Store the funding transaction in global context
    addFundingTransaction({
      bankAccountId: data.bankAccountId,
      amount: data.amount,
      date: data.date,
      reference: data.reference,
      description: data.description,
      source: data.source,
      shareholderId: data.shareholderId,
      shareholderName: data.shareholderName,
      paymentMethod: data.paymentMethod,
      depositorName: data.depositorName,
      transactionType: 'Credit',
      relatedLoanId: undefined
    });

    // If it's shareholder capital, also create a shareholder transaction
    if (data.source === 'Shareholder Capital' && data.shareholderId) {
      // addShareholderTransaction automatically updates shareCapital
      addShareholderTransaction({
        shareholderId: data.shareholderId,
        shareholderName: data.shareholderName || '',
        type: 'Capital Contribution',
        amount: data.amount,
        date: data.date,
        description: `Capital deposit via ${data.paymentMethod}${data.mpesaDetails ? ` - ${data.mpesaDetails.transactionCode}` : ''}`,
        reference: data.reference,
        recordedBy: 'Admin'
      });
    }

    // Update the depositor shareholder's capital contribution (for all deposits by shareholders)
    if (data.depositorName && data.source !== 'Shareholder Capital') {
      const depositorShareholder = shareholders.find(s => s.name.toLowerCase().trim() === data.depositorName.toLowerCase().trim());
      if (depositorShareholder) {
        // addShareholderTransaction automatically updates shareCapital
        addShareholderTransaction({
          shareholderId: depositorShareholder.id,
          shareholderName: depositorShareholder.name,
          type: 'Capital Contribution',
          amount: data.amount,
          date: data.date,
          description: `Capital deposit via ${data.paymentMethod}${data.mpesaDetails ? ` - ${data.mpesaDetails.transactionCode}` : ''}`,
          reference: data.reference,
          recordedBy: 'Admin'
        });
      }
    }
    
    toast.success(`Successfully funded ${bankAccount.name} with ${formatCurrency(data.amount, { showCode: true })}`);
  };

  // Get unique banks
  const uniqueBanks = Array.from(new Set(
    bankAccounts
      .filter(acc => acc.accountType === 'Bank' && acc.status === 'Active')
      .map(acc => acc.bankName || 'Unknown Bank')
  )).sort();

  // Get mobile money accounts  
  const hasMobileMoney = bankAccounts.some(acc => acc.accountType === 'Mobile Money' && acc.status === 'Active');

  // Calculate totals by bank
  const bankTotals = bankAccounts
    .filter(acc => acc.accountType === 'Bank' && acc.status === 'Active')
    .reduce((acc, bank) => {
      const bankName = bank.bankName || 'Unknown Bank';
      if (!acc[bankName]) {
        acc[bankName] = 0;
      }
      acc[bankName] += bank.balance;
      return acc;
    }, {} as Record<string, number>);

  const cashTotal = bankAccounts
    .filter(acc => acc.accountType === 'Cash' && acc.status === 'Active')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const mobileMoneyTotal = bankAccounts
    .filter(acc => acc.accountType === 'Mobile Money' && acc.status === 'Active')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const grandTotal = bankAccounts
    .filter(acc => acc.status === 'Active')
    .reduce((sum, acc) => sum + acc.balance, 0);

  // Filter accounts based on active bank tab
  const filteredAccounts = activeBank === 'all' 
    ? bankAccounts 
    : activeBank === 'M-Pesa'
    ? bankAccounts.filter(acc => acc.accountType === 'Mobile Money')
    : bankAccounts.filter(acc => acc.bankName === activeBank);

  // Calculate total for current tab
  const currentTabTotal = activeBank === 'all'
    ? grandTotal
    : activeBank === 'M-Pesa'
    ? mobileMoneyTotal
    : bankTotals[activeBank] || 0;

  // Calculate stats for single bank view
  const currentBankAccounts = activeBank === 'all' 
    ? []
    : activeBank === 'M-Pesa'
    ? bankAccounts.filter(acc => acc.accountType === 'Mobile Money' && acc.status === 'Active')
    : bankAccounts.filter(acc => acc.bankName === activeBank && acc.status === 'Active');
  
  const currentBankAccountCount = currentBankAccounts.length;
  
  const currentBankTotalFunding = currentBankAccounts.reduce((sum, acc) => {
    const accountFunding = fundingTransactions
      .filter(t => t.bankAccountId === acc.id && t.transactionType === 'Credit')
      .reduce((total, t) => total + t.amount, 0);
    return sum + accountFunding;
  }, 0);

  // Find the main funder account (account with most funding)
  const mainFunderAccount = currentBankAccounts.reduce<typeof currentBankAccounts[0] | null>((max, acc) => {
    const accFunding = fundingTransactions
      .filter(t => t.bankAccountId === acc.id && t.transactionType === 'Credit')
      .reduce((total, t) => total + t.amount, 0);
    
    if (!max) return acc;
    
    const maxFunding = fundingTransactions
      .filter(t => t.bankAccountId === max.id && t.transactionType === 'Credit')
      .reduce((total, t) => total + t.amount, 0);
    
    return accFunding > maxFunding ? acc : max;
  }, null);

  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600">Manage bank accounts and mobile money with funding tracking</p>
        </div>
        <button
          onClick={() => setShowFundAccountModal(true)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Wallet className="size-4" />
          Fund Account
        </button>
      </div>

      {/* Account Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveBank('all')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeBank === 'all'
                ? 'border-[#ec7347] text-[#ec7347]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Accounts
          </button>
          {uniqueBanks.map((bankName) => (
            <button
              key={bankName}
              onClick={() => setActiveBank(bankName)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeBank === bankName
                  ? 'border-[#ec7347] text-[#ec7347]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {bankName}
            </button>
          ))}
          {hasMobileMoney && (
            <button
              onClick={() => setActiveBank('M-Pesa')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeBank === 'M-Pesa'
                  ? 'border-[#ec7347] text-[#ec7347]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              M-Pesa
            </button>
          )}
        </div>
      </div>

      {/* Summary Card for Active Tab */}
      <div className="bg-gradient-to-br from-[#020838] to-[#041056] rounded-lg p-6 text-white border border-gray-700">
        <p className="text-[#e8d1c9] text-sm mb-1">
          {activeBank === 'all' ? 'Total Balance (All Accounts)' : `${activeBank} Total Balance`}
        </p>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(currentTabTotal, { showCode: true, decimals: 0 })}
        </p>
        
        {/* Show bank breakdown for "All Banks" view */}
        {activeBank === 'all' && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(bankTotals).map(([bankName, total]) => (
              <div key={bankName} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">{bankName}</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(total, { showCode: true, decimals: 0 })}
                </p>
              </div>
            ))}
            {cashTotal > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Cash in Hand</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(cashTotal, { showCode: true, decimals: 0 })}
                </p>
              </div>
            )}
            {hasMobileMoney && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Mobile Money</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(mobileMoneyTotal, { showCode: true, decimals: 0 })}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Show single bank stats for individual bank view */}
        {activeBank !== 'all' && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Main Funder Account</p>
                {mainFunderAccount ? (
                  <div className="text-sm text-white">
                    <p>Account Number: {mainFunderAccount.accountNumber || 'N/A'}</p>
                    {mainFunderAccount.branch && <p>Branch: {mainFunderAccount.branch}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-white">No funding yet</p>
                )}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Number of Accounts</p>
                <p className="text-lg font-semibold text-white">
                  {currentBankAccountCount}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Total Funding Received</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(currentBankTotalFunding, { showCode: true, decimals: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Accounts Section */}
      <BankAccountsSection 
        fundingTransactions={fundingTransactions} 
        filteredAccounts={filteredAccounts}
        showAddButton={activeBank === 'all'}
      />

      {/* Fund Account Modal */}
      {showFundAccountModal && (
        <FundAccountModal
          onClose={() => setShowFundAccountModal(false)}
          onSubmit={handleFundAccount}
        />
      )}
    </div>
  );
}