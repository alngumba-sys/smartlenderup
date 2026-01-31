import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Printer, RefreshCw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode, formatCurrency } from '../../utils/currencyUtils';

type ViewMode = 'funding' | 'ledger' | 'cashflow';

export function FinancialStatementsTab() {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const { 
    bankAccounts, 
    fundingTransactions, 
    loans, 
    repayments,
    journalEntries 
  } = useData();

  const [viewMode, setViewMode] = useState<ViewMode>('funding');
  const [selectedPeriod, setSelectedPeriod] = useState('2026');

  // ============================================
  // FUNDING ACCOUNTS CALCULATIONS
  // ============================================
  const calculateFundingAccountMetrics = () => {
    const activeAccounts = bankAccounts.filter(acc => acc.status === 'Active');
    
    return activeAccounts.map(account => {
      // Get all funding transactions (credits)
      const credits = fundingTransactions
        .filter(t => t.bankAccountId === account.id && t.transactionType === 'Credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Get all loan disbursements (debits)
      const debits = loans
        .filter(l => l.bankAccountId === account.id && l.approvalStatus === 'Approved' && l.disbursementDate)
        .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
      
      // Get loan repayments (credits back to account)
      const repaymentsCredits = repayments
        .filter(r => r.bankAccountId === account.id && r.status === 'Approved')
        .reduce((sum, r) => sum + r.amount, 0);
      
      // Total Credited = Initial Balance + Funding + Repayments
      const totalCredited = (account.openingBalance || 0) + credits + repaymentsCredits;
      
      // Total Debited = Loan Disbursements
      const totalDebited = debits;
      
      // Active Balance = Total Credited - Total Debited
      const activeBalance = totalCredited - totalDebited;
      
      return {
        id: account.id,
        name: account.name || account.bankName,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        branch: account.branch,
        activeBalance,
        totalDebited,
        totalCredited
      };
    });
  };

  // ============================================
  // GENERAL LEDGER CALCULATIONS
  // ============================================
  const calculateGeneralLedgerAccounts = () => {
    const ledgerAccounts: any[] = [];

    // 1. LOANS RECEIVABLE (ASSET ACCOUNT)
    const totalDisbursed = loans
      .filter(l => l.approvalStatus === 'Approved' && l.disbursementDate)
      .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    
    const totalPrincipalRepaid = repayments
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + (r.principalAmount || 0), 0);

    ledgerAccounts.push({
      code: '1100',
      name: 'Loans Receivable',
      type: 'ASSET',
      debits: totalDisbursed,
      credits: totalPrincipalRepaid,
      balance: totalDisbursed - totalPrincipalRepaid
    });

    // 2. INTEREST INCOME (INCOME ACCOUNT)
    const totalInterestReceived = repayments
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + (r.interestAmount || 0), 0);

    ledgerAccounts.push({
      code: '4100',
      name: 'Interest Income',
      type: 'INCOME',
      debits: 0,
      credits: totalInterestReceived,
      balance: totalInterestReceived
    });

    // 3. PROCESSING FEE REVENUE / SERVICE FEES (INCOME ACCOUNT)
    const totalProcessingFees = loans
      .filter(l => l.approvalStatus === 'Approved' && l.disbursementDate)
      .reduce((sum, l) => sum + (l.processingFee || 0), 0);

    ledgerAccounts.push({
      code: '4200',
      name: 'Service Fees',
      type: 'INCOME',
      debits: 0,
      credits: totalProcessingFees,
      balance: totalProcessingFees
    });

    // 4. OTHER INCOME - SERVICE FEES (Same as above, might be duplicate)
    ledgerAccounts.push({
      code: '4210',
      name: 'Other Income: Service Fees',
      type: 'INCOME',
      debits: 0,
      credits: totalProcessingFees,
      balance: totalProcessingFees
    });

    // 5. PENALTY INCOME (INCOME ACCOUNT)
    const totalPenalties = repayments
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + (r.penaltyAmount || 0), 0);

    ledgerAccounts.push({
      code: '4300',
      name: 'Penalty Income',
      type: 'INCOME',
      debits: 0,
      credits: totalPenalties,
      balance: totalPenalties
    });

    // 6. BAD DEBT RECOVERY (INCOME ACCOUNT)
    // This would come from write-offs that were later recovered
    const totalBadDebtRecovery = repayments
      .filter(r => r.status === 'Approved' && r.notes?.toLowerCase().includes('recovery'))
      .reduce((sum, r) => sum + r.amount, 0);

    ledgerAccounts.push({
      code: '4400',
      name: 'Bad Debt Recovery',
      type: 'INCOME',
      debits: 0,
      credits: totalBadDebtRecovery,
      balance: totalBadDebtRecovery
    });

    // 7. OTHER INCOME - INVESTMENT INCOME
    // This comes from shareholder capital or other funding sources
    const investmentIncome = fundingTransactions
      .filter(t => t.source === 'Investment' || t.source === 'Other Income')
      .reduce((sum, t) => sum + t.amount, 0);

    ledgerAccounts.push({
      code: '4500',
      name: 'Other Income: Investment Income',
      type: 'INCOME',
      debits: 0,
      credits: investmentIncome,
      balance: investmentIncome
    });

    return ledgerAccounts;
  };

  // ============================================
  // CASH FLOW CALCULATIONS
  // ============================================
  const calculateCashFlow = () => {
    // Opening Balance (assumed starting capital)
    const openingBalance = 1000000; // KES 1M initial capital

    // Cash Inflows (Operating Activities)
    const loanRepayments = repayments
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const processingFeesCollected = loans
      .filter(l => l.approvalStatus === 'Approved' && l.disbursementDate)
      .reduce((sum, l) => sum + (l.processingFee || 0), 0);
    
    const otherIncome = fundingTransactions
      .filter(t => t.source === 'Investment' || t.source === 'Other Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInflows = loanRepayments + processingFeesCollected + otherIncome;

    // Cash Outflows (Operating Activities)
    const loanDisbursements = loans
      .filter(l => l.approvalStatus === 'Approved' && l.disbursementDate)
      .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    
    const totalOutflows = loanDisbursements;

    // Net Cash Flow
    const netCashFlow = totalInflows - totalOutflows;

    // Closing Balance
    const closingBalance = openingBalance + netCashFlow;

    return {
      openingBalance,
      totalInflows,
      loanRepayments,
      processingFeesCollected,
      otherIncome,
      totalOutflows,
      loanDisbursements,
      netCashFlow,
      closingBalance
    };
  };

  const fundingAccounts = calculateFundingAccountMetrics();
  const ledgerAccounts = calculateGeneralLedgerAccounts();
  const cashFlowData = calculateCashFlow();

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900 dark:text-white text-2xl font-bold">Financial Statements</h2>
          <p className="text-gray-600 dark:text-gray-400">View funding accounts, general ledger, and cash flow statements</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
          </select>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
            <Download className="size-4" />
            Export
          </button>
          <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm">
            <Printer className="size-4" />
            Print
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('funding')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              viewMode === 'funding'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Funding Accounts
          </button>
          <button
            onClick={() => setViewMode('ledger')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              viewMode === 'ledger'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            General Ledger
          </button>
          <button
            onClick={() => setViewMode('cashflow')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              viewMode === 'cashflow'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Cash Flow Statement
          </button>
        </div>
      </div>

      {/* FUNDING ACCOUNTS VIEW */}
      {viewMode === 'funding' && (
        <div className="space-y-4">
          <div className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Funding Accounts ({fundingAccounts.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-750' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Account Name</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Type</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Account Number</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Branch</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Active Balance</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Total Debited</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Total Credited</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {fundingAccounts.map((account) => (
                    <tr key={account.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {account.name}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {account.accountType}
                      </td>
                      <td className={`px-4 py-3 text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {account.accountNumber || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {account.branch || '-'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        account.activeBalance >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {currencyCode} {account.activeBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currencyCode} {account.totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currencyCode} {account.totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className={`font-bold ${isDark ? 'bg-gray-750' : 'bg-gray-100'}`}>
                    <td colSpan={4} className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      TOTAL
                    </td>
                    <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currencyCode} {fundingAccounts.reduce((sum, acc) => sum + acc.activeBalance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currencyCode} {fundingAccounts.reduce((sum, acc) => sum + acc.totalDebited, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currencyCode} {fundingAccounts.reduce((sum, acc) => sum + acc.totalCredited, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GENERAL LEDGER VIEW */}
      {viewMode === 'ledger' && (
        <div className="space-y-4">
          <div className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                General Ledger Accounts ({ledgerAccounts.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-750' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Code</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Account Name</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Type</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Debits</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Credits</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Balance</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {ledgerAccounts.map((account) => (
                    <tr key={account.code} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {account.code}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {account.name}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          account.type === 'ASSET' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {account.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {account.debits > 0 
                          ? `${currencyCode} ${account.debits.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                          : '-'}
                      </td>
                      <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {account.credits > 0 
                          ? `${currencyCode} ${account.credits.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                          : '-'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        account.balance >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {currencyCode} {Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CASH FLOW STATEMENT VIEW */}
      {viewMode === 'cashflow' && (
        <div className="space-y-4">
          <div className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-semibold text-lg text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cash Flow Statement
              </h3>
              <p className={`text-sm text-center mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Year Ended December 31, {selectedPeriod}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Opening Balance */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-blue-50'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Opening Balance (Jan 1, {selectedPeriod})
                  </span>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currencyCode} {cashFlowData.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Operating Activities */}
              <div>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Cash Flows from Operating Activities
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center pl-4">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loan Repayments Received</span>
                    <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {currencyCode} {cashFlowData.loanRepayments.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pl-4">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Processing Fees Collected</span>
                    <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {currencyCode} {cashFlowData.processingFeesCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pl-4">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Other Income</span>
                    <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {currencyCode} {cashFlowData.otherIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pl-4">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loan Disbursements</span>
                    <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      ({currencyCode} {cashFlowData.loanDisbursements.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                    </span>
                  </div>
                  
                  {/* Net Cash Flow from Operations */}
                  <div className={`flex justify-between items-center pt-3 mt-3 border-t ${
                    isDark ? 'border-gray-700' : 'border-gray-300'
                  }`}>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Net Cash Flow (Yearly)
                    </span>
                    <span className={`text-lg font-bold ${
                      cashFlowData.netCashFlow >= 0 
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {currencyCode} {cashFlowData.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Closing Balance */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-emerald-50'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Closing Balance (Dec 31, {selectedPeriod})
                  </span>
                  <span className={`text-lg font-bold ${
                    cashFlowData.closingBalance >= 0 
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {currencyCode} {cashFlowData.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
