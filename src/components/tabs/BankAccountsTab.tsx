import { useState } from 'react';
import { Plus, Wallet, Trash2, Edit, RefreshCw, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
import { FundAccountModal, type FundAccountData } from '../modals/FundAccountModal';
import { BankAccountModal, type BankAccountFormData } from '../modals/BankAccountModal';
import { formatCurrency } from '../../utils/currencyUtils';
import { supabaseDataService } from '../../services/supabaseDataService';
import { toast } from 'sonner@2.0.3';
import { shortenReferenceUUID } from '../../utils/uuidUtils';
// TEMPORARILY DISABLED - causing loading issues
// import { DevMigrationPanel } from '../DevMigrationPanel';

export function BankAccountsTab() {
  const { 
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addShareholderTransaction,
    fundingTransactions,
    addFundingTransaction,
    shareholders,
    updateShareholder,
    loans,
    repayments
  } = useData();
  
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('🏦 BANKACCOUNTSTAB COMPONENT RENDERING');
  console.log('══════════════════════════════════════════════');
  console.log('   Bank accounts from context:', bankAccounts.length);
  console.log('   Bank accounts:', bankAccounts);
  console.log('');
  
  const [showFundAccountModal, setShowFundAccountModal] = useState(false);
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>(undefined);
  const [activeBank, setActiveBank] = useState<string>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const currencyCode = getCurrencyCode();

  const handleFundAccount = async (data: FundAccountData) => {
    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection('fund account');
    if (!isConnected) {
      return; // Block the operation if offline
    }

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

  const handleAddBankAccount = async (data: BankAccountFormData) => {
    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection('add bank account');
    if (!isConnected) {
      return; // Block the operation if offline
    }

    // Add the bank account using the addBankAccount function
    addBankAccount({
      name: data.name,
      accountType: data.accountType,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      branch: data.branch,
      currency: data.currency,
      openingBalance: data.openingBalance,
      openingDate: data.openingDate,
      status: data.status,
      description: data.description,
      createdBy: data.createdBy
    });

    setShowBankAccountModal(false);
    setEditingAccount(undefined);
    toast.success(`Successfully added ${data.name} bank account`);
  };

  const handleEditBankAccount = async (data: BankAccountFormData) => {
    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection('edit bank account');
    if (!isConnected) {
      return; // Block the operation if offline
    }

    if (!editingAccount) return;

    // Calculate opening balance difference to adjust current balance
    const oldOpeningBalance = editingAccount.openingBalance || 0;
    const newOpeningBalance = data.openingBalance || 0;
    const balanceDifference = newOpeningBalance - oldOpeningBalance;

    // Show warning if opening balance is changing
    if (balanceDifference !== 0) {
      const confirmed = window.confirm(
        `⚠️ Opening Balance Change\n\n` +
        `Old Opening Balance: ${formatCurrency(oldOpeningBalance, { showCode: true })}\n` +
        `New Opening Balance: ${formatCurrency(newOpeningBalance, { showCode: true })}\n\n` +
        `This will adjust the current balance by ${formatCurrency(Math.abs(balanceDifference), { showCode: true })}.\n\n` +
        `Current Balance: ${formatCurrency(editingAccount.balance, { showCode: true })}\n` +
        `New Balance: ${formatCurrency(editingAccount.balance + balanceDifference, { showCode: true })}\n\n` +
        `Do you want to continue?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    // Update the bank account including opening balance
    updateBankAccount(editingAccount.id, {
      name: data.name,
      accountType: data.accountType,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      branch: data.branch,
      status: data.status,
      description: data.description,
      openingBalance: newOpeningBalance,
      openingDate: data.openingDate,
      // Adjust current balance by the difference in opening balance
      balance: editingAccount.balance + balanceDifference
    });

    setShowBankAccountModal(false);
    setEditingAccount(undefined);
    
    if (balanceDifference !== 0) {
      toast.success(
        `Successfully updated ${data.name}. ` +
        `Opening balance adjusted by ${formatCurrency(Math.abs(balanceDifference), { showCode: true })}.`
      );
    } else {
      toast.success(`Successfully updated ${data.name} bank account`);
    }
  };

  // ✅ Recalculate all bank account balances based on transactions
  const handleRecalculateBalances = async () => {
    const isConnected = await ensureSupabaseConnection('recalculate balances');
    if (!isConnected) {
      return;
    }

    const confirmed = window.confirm(
      '🔄 Recalculate All Bank Account Balances\n\n' +
      'This will recalculate all bank account balances based on:\n' +
      '• Opening Balance\n' +
      '• Funding Transactions (Credits)\n' +
      '• Loan Disbursements (Debits)\n\n' +
      'Do you want to continue?'
    );

    if (!confirmed) return;

    let updatedCount = 0;

    // Recalculate each account
    bankAccounts.forEach(account => {
      // Calculate total credits (funding)
      const totalCredits = fundingTransactions
        .filter(t => t.bankAccountId === account.id && t.transactionType === 'Credit')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate total debits (loan disbursements)
      const totalDebits = loans
        .filter(l => l.bankAccountId === account.id && l.approvalStatus === 'Approved' && l.loanStatus !== 'Pending' && l.disbursementDate)
        .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);

      // Calculate correct balance
      const correctBalance = (account.openingBalance || 0) + totalCredits - totalDebits;

      // Update if balance is different
      if (account.balance !== correctBalance) {
        updateBankAccount(account.id, {
          balance: correctBalance
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      toast.success(`Successfully recalculated ${updatedCount} account${updatedCount > 1 ? 's' : ''}`);
    } else {
      toast.success('All account balances are already correct');
    }
  };

  // ✅ Delete ALL bank accounts and clear all data
  const handleDeleteAllAccounts = async () => {
    const isConnected = await ensureSupabaseConnection('delete all bank accounts');
    if (!isConnected) {
      return;
    }

    const totalAccounts = bankAccounts.length;
    const totalFunding = fundingTransactions.length;
    
    if (totalAccounts === 0) {
      toast.error('No bank accounts to delete');
      return;
    }

    const confirmed = window.confirm(
      '🚨 DELETE ALL BANK ACCOUNTS\n\n' +
      `This will permanently delete:\n` +
      `• ${totalAccounts} Bank Account${totalAccounts > 1 ? 's' : ''}\n` +
      `• ${totalFunding} Funding Transaction${totalFunding > 1 ? 's' : ''}\n\n` +
      '⚠️ WARNING: This action CANNOT be undone!\n\n' +
      'All loan disbursement references will remain but bank account links will be removed.\n\n' +
      'Type "DELETE ALL" in the next prompt to confirm.'
    );

    if (!confirmed) return;

    const confirmText = prompt('Type "DELETE ALL" to confirm:');
    
    if (confirmText !== 'DELETE ALL') {
      toast.error('Deletion cancelled - confirmation text did not match');
      return;
    }

    try {
      // Get current organization ID
      const orgData = localStorage.getItem('current_organization');
      if (!orgData) {
        toast.error('Organization not found');
        return;
      }
      const org = JSON.parse(orgData);

      // Delete all bank accounts from Supabase
      for (const account of bankAccounts) {
        await supabaseDataService.bankAccounts.delete(account.id, org.id);
      }

      // Delete all funding transactions from Supabase
      for (const transaction of fundingTransactions) {
        await supabaseDataService.fundingTransactions.delete(transaction.id, org.id);
      }

      toast.success(`Successfully deleted ${totalAccounts} account${totalAccounts > 1 ? 's' : ''} and ${totalFunding} transaction${totalFunding > 1 ? 's' : ''}`);
      
      // Reset to "All Accounts" view
      setActiveBank('all');
      
    } catch (error) {
      console.error('Error deleting all accounts:', error);
      toast.error('Failed to delete all accounts. Please try again.');
    }
  };

  // Get active bank accounts (individual accounts, not grouped by bank name)
  const activeBankAccounts = bankAccounts
    .filter(acc => acc.status && acc.status.toLowerCase() === 'active')
    .sort((a, b) => {
      const nameA = a.accountName || a.name || '';
      const nameB = b.accountName || b.name || '';
      return nameA.localeCompare(nameB);
    });

  console.log(' Active bank accounts for tabs:', activeBankAccounts.length);
  console.log('🔍 Active accounts:', activeBankAccounts.map(a => ({ id: a.id, name: a.accountName || a.name, status: a.status })));

  const grandTotal = activeBankAccounts
    .reduce((sum, acc) => sum + acc.balance, 0);

  // Filter accounts based on active bank tab
  const filteredAccounts = activeBank === 'all' 
    ? bankAccounts 
    : bankAccounts.filter(acc => acc.id === activeBank);

  // Calculate total for current tab
  const currentTabTotal = activeBank === 'all'
    ? grandTotal
    : activeBankAccounts.find(acc => acc.id === activeBank)?.balance || 0;

  // Get current account details for single account view
  const currentAccount = activeBank === 'all' 
    ? null
    : activeBankAccounts.find(acc => acc.id === activeBank);
  
  const currentAccountFunding = currentAccount
    ? fundingTransactions
        .filter(t => t.bankAccountId === currentAccount.id && t.transactionType === 'Credit')
        .reduce((total, t) => total + t.amount, 0)
    : 0;

  // Prepare statement transactions
  interface StatementTransaction {
    id: string;
    date: string;
    description: string;
    reference: string;
    debit: number;
    credit: number;
    balance: number;
    type: string;
    depositor?: string; // ✅ NEW: Depositor name
    sortOrder?: number; // ✅ NEW: Sort order for transactions
  }

  const getStatementTransactions = (): StatementTransaction[] => {
    const transactions: StatementTransaction[] = [];
    
    // ✅ Add initial account opening transactions (ALWAYS SHOW)
    const relevantAccounts = activeBank === 'all'
      ? activeBankAccounts
      : activeBankAccounts.filter(acc => acc.id === activeBank);
    
    relevantAccounts.forEach(account => {
      if (account.openingBalance > 0) {
        transactions.push({
          id: `opening-${account.id}`,
          date: account.createdAt || account.openingDate || account.createdDate || new Date().toISOString(), // ✅ Use full timestamp from createdAt
          description: `Initial Account Opening - ${account.bankName} (${account.accountNumber})`,
          reference: account.accountNumber,
          debit: 0,
          credit: account.openingBalance,
          balance: 0, // Will be calculated
          type: 'Opening Balance',
          depositor: 'System',
          sortOrder: 0 // ✅ Ensure opening balance is always first
        } as any);
      }
    });
    
    // Get funding transactions for current view
    const relevantFundingTransactions = activeBank === 'all'
      ? fundingTransactions
      : fundingTransactions.filter(t => t.bankAccountId === activeBank);

    // Add funding transactions
    relevantFundingTransactions.forEach((ft, index) => {
      const bankAccount = bankAccounts.find(b => b.id === ft.bankAccountId);
      transactions.push({
        id: ft.id,
        date: ft.date,
        description: ft.description || `${ft.source} - ${ft.paymentMethod}`,
        reference: ft.reference,
        debit: ft.transactionType === 'Debit' ? ft.amount : 0,
        credit: ft.transactionType === 'Credit' ? ft.amount : 0,
        balance: 0, // Will be calculated
        type: ft.transactionType === 'Credit' ? 'Funding' : 'Payment',
        depositor: ft.depositorName || ft.shareholderName || '-',
        sortOrder: index + 1 // ✅ Maintain insertion order
      } as any);
    });

    // Add loan disbursements (debits from bank account)
    const relevantLoans = activeBank === 'all'
      ? loans.filter(l => l.approvalStatus === 'Approved' && l.loanStatus !== 'Pending' && l.disbursementDate)
      : loans.filter(l => l.approvalStatus === 'Approved' && l.loanStatus !== 'Pending' && l.disbursementDate && l.bankAccountId === activeBank);

    console.log(`🔍 Found ${relevantLoans.length} loan disbursements for bank statement`);

    relevantLoans.forEach((loan, index) => {
      transactions.push({
        id: `loan-${loan.id}`,
        date: loan.disbursementDate,
        description: `Loan Disbursement - ${loan.borrowerName} (${loan.loanId})`,
        reference: loan.loanId,
        debit: loan.approvedAmount || loan.requestedAmount,
        credit: 0,
        balance: 0,
        type: 'Loan Disbursement',
        depositor: '-',
        sortOrder: relevantFundingTransactions.length + index + 1 // ✅ After funding transactions
      } as any);
    });

    // ✅ Add loan repayments (credits to bank account)
    const relevantRepayments = activeBank === 'all'
      ? repayments.filter(r => r.status === 'Approved')
      : repayments.filter(r => r.status === 'Approved' && r.bankAccountId === activeBank);

    console.log(`🔍 Found ${relevantRepayments.length} loan repayments for bank statement`);

    relevantRepayments.forEach((repayment, index) => {
      const loan = loans.find(l => l.id === repayment.loanId);
      transactions.push({
        id: `repayment-${repayment.id}`,
        date: repayment.paymentDate || repayment.createdDate,
        description: `Loan Repayment - ${repayment.clientName} (${repayment.receiptNumber})`,
        reference: repayment.paymentReference || repayment.receiptNumber,
        debit: 0,
        credit: repayment.amount,
        balance: 0,
        type: 'Loan Repayment',
        depositor: repayment.clientName,
        sortOrder: relevantFundingTransactions.length + relevantLoans.length + index + 1
      } as any);
    });

    console.log(`🔍 Total transactions before sort: ${transactions.length}`);

    // Sort by date (newest first), then by sortOrder (oldest first within same date)
    transactions.sort((a: any, b: any) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      // If same date, use sortOrder to maintain chronological order
      return a.sortOrder - b.sortOrder;
    });

    // Calculate running balance from oldest to newest
    // Create a proper chronological sort for calculation (oldest date first, oldest sortOrder first)
    const sortedByOldest = [...transactions].sort((a: any, b: any) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.sortOrder - b.sortOrder;
    });
    
    let runningBalance = 0;
    const balanceMap = new Map<string, number>();

    sortedByOldest.forEach(transaction => {
      runningBalance += transaction.credit - transaction.debit;
      balanceMap.set(transaction.id, runningBalance);
    });

    // Apply balances to the display-sorted transactions
    transactions.forEach(transaction => {
      transaction.balance = balanceMap.get(transaction.id) || 0;
    });

    // Return in newest first order (already sorted that way in original transactions array)
    return transactions;
  };

  const statementTransactions = getStatementTransactions();

  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600">Manage bank accounts and mobile money with funding tracking</p>
        </div>
        <div className="flex gap-2">
          {activeBank === 'all' && (
            <button
              onClick={() => setShowBankAccountModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus className="size-4" />
              Add Account
            </button>
          )}
          <button
            onClick={() => setShowFundAccountModal(true)}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
          >
            <Wallet className="size-4" />
            Fund Account
          </button>
          <button
            onClick={handleRecalculateBalances}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <RefreshCw className="size-4" />
            Recalculate Balances
          </button>
          <button
            onClick={handleDeleteAllAccounts}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
          >
            <Trash2 className="size-4" />
            Delete All Accounts
          </button>
        </div>
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
          {activeBankAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setActiveBank(acc.id)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeBank === acc.id
                  ? 'border-[#ec7347] text-[#ec7347]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {acc.bankName || acc.name || 'Unknown Account'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card for Active Tab */}
      <div className="bg-gradient-to-br from-[#020838] to-[#041056] rounded-lg p-6 text-white border border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#e8d1c9] text-sm">
            {activeBank === 'all' 
              ? 'Total Balance (All Accounts)' 
              : `${currentAccount?.bankName || currentAccount?.accountName || currentAccount?.name || 'Account'} Balance`}
          </p>
          {activeBank !== 'all' && currentAccount && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingAccount(currentAccount);
                  setShowBankAccountModal(true);
                }}
                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                title="Edit Account"
              >
                <Edit className="size-4" />
              </button>
              <button
                onClick={() => {
                  setAccountToDelete(currentAccount.id);
                  setShowDeleteConfirmation(true);
                  setDeleteConfirmationText('');
                }}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                title="Delete Account"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(currentTabTotal, { showCode: true, decimals: 0 })}
        </p>
        
        {/* Show all accounts breakdown for "All Accounts" view */}
        {activeBank === 'all' && (() => {
          // ✅ Group accounts by bank name and calculate total per bank
          const bankGroups = activeBankAccounts.reduce((groups, account) => {
            const bankName = account.bankName || account.name || 'Unknown Bank';
            if (!groups[bankName]) {
              groups[bankName] = {
                bankName,
                totalBalance: 0,
                accountCount: 0
              };
            }
            groups[bankName].totalBalance += account.balance;
            groups[bankName].accountCount += 1;
            return groups;
          }, {} as Record<string, { bankName: string; totalBalance: number; accountCount: number }>);

          const bankSummaries = Object.values(bankGroups);

          return (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {bankSummaries.map((bank) => (
                <div key={bank.bankName} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-[#e8d1c9] text-xs mb-1">{bank.bankName}</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(bank.totalBalance, { showCode: true, decimals: 0 })}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
        
        {/* Show single account details for individual account view - ALL IN ONE ROW */}
        {activeBank !== 'all' && currentAccount && (
          <div className="mt-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Account Type</p>
                <p className="text-sm font-semibold text-white">{currentAccount.accountType}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Bank Name</p>
                <p className="text-sm font-semibold text-white">{currentAccount.bankName || 'N/A'}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Account Number</p>
                <p className="text-sm font-mono text-white">{currentAccount.accountNumber || 'N/A'}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Branch</p>
                <p className="text-sm text-white">{currentAccount.branch || 'N/A'}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-[#e8d1c9] text-xs mb-1">Total Funding Received</p>
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(currentAccountFunding, { showCode: true, decimals: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Statement Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {activeBank === 'all' ? 'Combined Statement (All Accounts)' : `${currentAccount?.bankName || 'Account'} Statement`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {statementTransactions.length} transactions found
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depositor</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statementTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                statementTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {new Date(transaction.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {shortenReferenceUUID(transaction.reference)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                        transaction.type === 'Funding' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : transaction.type === 'Loan Disbursement'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {transaction.depositor || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {transaction.debit > 0 ? formatCurrency(transaction.debit, { showCode: false, decimals: 0 }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-emerald-600">
                      {transaction.credit > 0 ? formatCurrency(transaction.credit, { showCode: false, decimals: 0 }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(transaction.balance, { showCode: false, decimals: 0 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Account Modal */}
      {showFundAccountModal && (
        <FundAccountModal
          onClose={() => setShowFundAccountModal(false)}
          onSubmit={handleFundAccount}
        />
      )}

      {/* Add Bank Account Modal */}
      {showBankAccountModal && (
        <BankAccountModal
          onClose={() => setShowBankAccountModal(false)}
          onSubmit={editingAccount ? handleEditBankAccount : handleAddBankAccount}
          editingAccount={editingAccount}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && accountToDelete && (() => {
        const account = bankAccounts.find(a => a.id === accountToDelete);
        const accountNameToMatch = account?.bankName || account?.name || '';
        const isNameMatching = deleteConfirmationText.trim().toLowerCase() === accountNameToMatch.toLowerCase();
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Bank Account</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this account? This action cannot be undone.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 mb-1">Account Name</p>
                <p className="font-medium text-gray-900">{accountNameToMatch}</p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Account Number</p>
                <p className="font-medium text-gray-900">{account?.accountNumber}</p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Current Balance</p>
                <p className="font-medium text-gray-900">{formatCurrency(account?.balance || 0, { showCode: true })}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-semibold text-gray-900">{accountNameToMatch}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              
              <p className="text-sm text-red-600 mb-4">
                ⚠️ All related transactions will remain but will no longer be linked to this account.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setAccountToDelete(null);
                    setDeleteConfirmationText('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!isNameMatching) {
                      toast.error('Bank name does not match');
                      return;
                    }
                    
                    const isConnected = await ensureSupabaseConnection('delete bank account');
                    if (!isConnected) {
                      return;
                    }
                    
                    const accountName = account?.name || account?.bankName || 'Account';
                    deleteBankAccount(accountToDelete);
                    setShowDeleteConfirmation(false);
                    setAccountToDelete(null);
                    setDeleteConfirmationText('');
                    setActiveBank('all');
                    toast.success(`Successfully deleted ${accountName}`);
                  }}
                  disabled={!isNameMatching}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    isNameMatching 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="size-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Dev Migration Panel */}
      {/* TEMPORARILY DISABLED - causing loading issues
      <DevMigrationPanel />
      */}
    </div>
  );
}