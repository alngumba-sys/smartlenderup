import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrencyCode } from '../utils/currencyUtils';

export function CashFlowAnalysis() {
  const { isDark } = useTheme();
  const { journalEntries } = useData();
  const currencyCode = getCurrencyCode();

  // Flatten all lines from Posted journal entries
  const allLines = journalEntries
    .filter(entry => entry.status === 'Posted')
    .flatMap(entry => entry.lines);

  // Calculate cash inflows (Revenue accounts: credit entries)
  // Revenue accounts typically have codes starting with 4xxx
  const totalCashInflow = allLines
    .filter(line => {
      const accountCode = line.accountCode || '';
      // Revenue accounts (4xxx) - credits increase revenue
      const isRevenueAccount = accountCode.startsWith('4');
      return isRevenueAccount && line.credit > 0;
    })
    .reduce((sum, line) => sum + line.credit, 0);

  // Calculate cash outflows (Expense accounts: debit entries)
  // Expense accounts typically have codes starting with 5xxx, 6xxx, or 7xxx
  const totalCashOutflow = allLines
    .filter(line => {
      const accountCode = line.accountCode || '';
      // Expense accounts (5xxx, 6xxx, 7xxx) - debits increase expenses
      const isExpenseAccount = accountCode.startsWith('5') || 
                              accountCode.startsWith('6') || 
                              accountCode.startsWith('7');
      return isExpenseAccount && line.debit > 0;
    })
    .reduce((sum, line) => sum + line.debit, 0);

  // Calculate net cash flow
  const netCashFlow = totalCashInflow - totalCashOutflow;

  // Calculate cash flow ratio (inflow / outflow)
  const cashFlowRatio = totalCashOutflow > 0 
    ? (totalCashInflow / totalCashOutflow) * 100 
    : totalCashInflow > 0 ? 100 : 0;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 ${
      isDark ? 'border-blue-800' : 'border-blue-200'
    } p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-600 rounded-lg">
          <Activity className="size-6 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Cash Flow Analysis
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Income vs Expenses from Journal Entries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash Inflow */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${
          isDark ? 'border-emerald-700' : 'border-emerald-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-emerald-600" />
            <p className={`text-xs font-medium uppercase ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Cash Inflow
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {currencyCode} {totalCashInflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Revenue & Income
          </p>
        </div>

        {/* Total Cash Outflow */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${
          isDark ? 'border-red-700' : 'border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="size-4 text-red-600" />
            <p className={`text-xs font-medium uppercase ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Cash Outflow
            </p>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {currencyCode} {totalCashOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Expenses & Costs
          </p>
        </div>

        {/* Net Cash Flow */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${
          netCashFlow >= 0 
            ? (isDark ? 'border-blue-700' : 'border-blue-200')
            : (isDark ? 'border-amber-700' : 'border-amber-200')
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`size-4 ${
              netCashFlow >= 0 ? 'text-blue-600' : 'text-amber-600'
            }`} />
            <p className={`text-xs font-medium uppercase ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Net Cash Flow
            </p>
          </div>
          <p className={`text-2xl font-bold ${
            netCashFlow >= 0 
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-amber-700 dark:text-amber-400'
          }`}>
            {netCashFlow >= 0 ? '+' : ''}{currencyCode} {netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {netCashFlow >= 0 ? 'Positive' : 'Negative'} Flow
          </p>
        </div>

        {/* Cash Flow Ratio */}
        <div className={`bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 rounded-lg p-4 border-2 ${
          isDark ? 'border-indigo-500' : 'border-indigo-300'
        } shadow-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="size-4 text-white" />
            <p className="text-xs font-medium text-white uppercase">
              Cash Flow Ratio
            </p>
          </div>
          <p className="text-2xl font-bold text-white">
            {cashFlowRatio.toFixed(1)}%
          </p>
          <p className="text-xs text-indigo-200 mt-1">
            {cashFlowRatio >= 100 ? 'Healthy' : cashFlowRatio >= 80 ? 'Good' : 'Needs Attention'}
          </p>
        </div>
      </div>

      {/* Formula Display */}
      <div className={`mt-4 bg-white dark:bg-gray-800 rounded-lg p-3 border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <p className={`text-xs font-mono text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {currencyCode} {totalCashInflow.toLocaleString()}
          </span>
          <span className="text-gray-400 mx-2">-</span>
          <span className="text-red-700 dark:text-red-400 font-semibold">
            {currencyCode} {totalCashOutflow.toLocaleString()}
          </span>
          <span className="text-gray-400 mx-2">=</span>
          <span className={`font-bold ${
            netCashFlow >= 0 
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-amber-700 dark:text-amber-400'
          }`}>
            {currencyCode} {netCashFlow.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Info Box */}
      {journalEntries.length === 0 && (
        <div className={`mt-4 p-3 rounded-lg border ${
          isDark 
            ? 'bg-amber-900/20 border-amber-700' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-xs ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
            <strong>ℹ️ No journal entries found.</strong> Cash flow analysis is calculated from journal entries. 
            Add income (revenue) and expense transactions to see your cash flow.
          </p>
        </div>
      )}
    </div>
  );
}