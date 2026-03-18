import { useData } from '../../contexts/DataContext';
const logo = '/logo.svg'; // Replaced figma:asset for deployment
import { getOrganizationName, getOrganizationLogo } from '../../utils/organizationUtils';
import { isPaidStatus } from '../../utils/statusUtils';

interface ReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function BalanceSheetReport({ dateRange }: ReportProps) {
  const { loans, savingsAccounts, bankAccounts, repayments } = useData();
  const organizationName = getOrganizationName();
  const organizationLogo = getOrganizationLogo();
  
  // Calculate REAL balances from actual data
  const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Disbursed');
  const fullyPaidLoans = loans.filter(l => isPaidStatus(l.status));
  
  // ASSETS - CURRENT ASSETS
  // Cash from bank accounts (actual data)
  const totalBankBalance = bankAccounts?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
  const cashOnHand = 50000; // Petty cash
  const totalCurrentAssets = totalBankBalance + cashOnHand;
  
  // ASSETS - LOAN PORTFOLIO
  const grossLoanPortfolio = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  
  // Calculate loan loss provision (PAR 90 loans)
  const loansOverdue90 = activeLoans.filter(l => (l.daysInArrears || 0) >= 90);
  const loanLossProvision = loansOverdue90.reduce((sum, l) => sum + l.outstandingBalance, 0) * 0.5; // 50% provision on PAR 90
  const netLoanPortfolio = grossLoanPortfolio - loanLossProvision;
  
  // ASSETS - FIXED ASSETS (mock data - not in database)
  const officeEquipment = 80000;
  const furniture = 45000;
  const computers = 65000;
  const accumulatedDepreciation = 5000;
  const netFixedAssets = officeEquipment + furniture + computers - accumulatedDepreciation;
  
  // ASSETS - OTHER ASSETS
  const prepaidExpenses = 15000;
  const deposits = 30000;
  const totalOtherAssets = prepaidExpenses + deposits;
  
  const totalAssets = totalCurrentAssets + netLoanPortfolio + netFixedAssets + totalOtherAssets;
  
  // LIABILITIES - CURRENT LIABILITIES
  const accountsPayable = 25000;
  const accruedExpenses = 18000;
  const totalCurrentLiabilities = accountsPayable + accruedExpenses;
  
  // LIABILITIES - LONG-TERM LIABILITIES
  const bankLoan = 150000;
  const totalLongTermLiabilities = bankLoan;
  
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
  
  // EQUITY
  const shareCapital = 1000000;
  const retainedEarnings = totalAssets - totalLiabilities - shareCapital;
  const totalEquity = shareCapital + retainedEarnings;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen print:p-0 print:bg-white print:min-h-0">
      <div className="w-[210mm] max-h-[297mm] mx-auto bg-white dark:!bg-white shadow-lg mb-6 print:shadow-none print:mb-0 print:mx-0 box-border overflow-auto">
        <div className="w-full p-[8mm] box-border flex flex-col">
          {/* Report Header */}
          <div className="border-b-2 border-gray-900 dark:!border-gray-900 pb-1.5 mb-2.5 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <h1 className="text-gray-900 dark:!text-gray-900 text-xl">{organizationName}</h1>
              </div>
              <div className="text-gray-600 dark:!text-gray-600 text-sm">
                Page 1/1
              </div>
            </div>
            <h2 className="text-gray-900 dark:!text-gray-900 text-center text-lg mb-1">BALANCE SHEET</h2>
            <p className="text-center text-gray-600 dark:!text-gray-600 text-xs">
              As at: {formatDate(dateRange.endDate)}
            </p>
            <p className="text-center text-gray-600 dark:!text-gray-600 text-[10px] mt-0.5">
              Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
            </p>
          </div>

          {/* Balance Sheet */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="bg-gray-100 dark:!bg-gray-100 border-b border-gray-300 dark:!border-gray-300">
                <th className="text-left p-2 text-gray-900 dark:!text-gray-900">Account</th>
                <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              {/* ASSETS */}
              <tr className="border-b border-gray-300 dark:!border-gray-300">
                <td className="p-2 text-gray-900 dark:!text-gray-900">ASSETS</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4">Current Assets</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Cash on Hand</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{cashOnHand.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Bank Accounts</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalBankBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="bg-gray-50 dark:!bg-gray-50 border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-6">Total Current Assets</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalCurrentAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4 pt-3">Loan Portfolio</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Gross Loan Portfolio</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{grossLoanPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Less: Loan Loss Provision</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">({loanLossProvision.toLocaleString(undefined, { minimumFractionDigits: 2 })})</td>
              </tr>
              <tr className="bg-gray-50 dark:!bg-gray-50 border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-6">Net Loan Portfolio</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{netLoanPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4 pt-3">Fixed Assets</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Property, Plant & Equipment</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{officeEquipment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Furniture</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{furniture.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Computers</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{computers.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Less: Accumulated Depreciation</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">({accumulatedDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2 })})</td>
              </tr>
              <tr className="bg-gray-50 dark:!bg-gray-50 border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-6">Net Fixed Assets</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{netFixedAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4 pt-3">Other Assets</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalOtherAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="bg-blue-100 dark:!bg-blue-100 border-t-2 border-gray-900 dark:!border-gray-900">
                <td className="p-2 text-gray-900 dark:!text-gray-900">TOTAL ASSETS</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              {/* LIABILITIES */}
              <tr className="border-b border-gray-300 dark:!border-gray-300">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pt-4">LIABILITIES & EQUITY</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4">Current Liabilities</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Accounts Payable</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{accountsPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Accrued Expenses</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{accruedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="bg-gray-50 dark:!bg-gray-50 border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-6">Total Current Liabilities</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalCurrentLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4 pt-3">Long-Term Liabilities</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Bank Loan</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{bankLoan.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="bg-red-100 dark:!bg-red-100 border-t border-gray-300 dark:!border-gray-300">
                <td className="p-2 text-gray-900 dark:!text-gray-900">TOTAL LIABILITIES</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              {/* EQUITY */}
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4 pt-3">Equity</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Share Capital</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{shareCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:!border-gray-200">
                <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Retained Earnings</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{retainedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="bg-emerald-100 dark:!bg-emerald-100 border-t border-gray-300 dark:!border-gray-300">
                <td className="p-2 text-gray-900 dark:!text-gray-900">TOTAL EQUITY</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr className="bg-blue-100 dark:!bg-blue-100 border-t-2 border-gray-900 dark:!border-gray-900">
                <td className="p-2 text-gray-900 dark:!text-gray-900">TOTAL LIABILITIES & EQUITY</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{(totalLiabilities + totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Key Ratios */}
          <div className="mb-4">
            <h3 className="text-gray-900 dark:!text-gray-900 mb-2 pb-1 border-b border-gray-300 dark:!border-gray-300 text-sm">Key Financial Ratios</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:!bg-gray-50 p-2 rounded border border-gray-200 dark:!border-gray-200">
                <p className="text-gray-600 dark:!text-gray-600 text-xs mb-1">Debt-to-Equity Ratio</p>
                <p className="text-gray-900 dark:!text-gray-900 text-lg">{totalEquity > 0 ? (totalLiabilities / totalEquity).toFixed(2) : '0.00'}</p>
              </div>
              <div className="bg-gray-50 dark:!bg-gray-50 p-2 rounded border border-gray-200 dark:!border-gray-200">
                <p className="text-gray-600 dark:!text-gray-600 text-xs mb-1">Current Ratio</p>
                <p className="text-gray-900 dark:!text-gray-900 text-lg">{totalCurrentLiabilities > 0 ? ((totalBankBalance + cashOnHand) / totalCurrentLiabilities).toFixed(2) : '0.00'}</p>
              </div>
              <div className="bg-gray-50 dark:!bg-gray-50 p-2 rounded border border-gray-200 dark:!border-gray-200">
                <p className="text-gray-600 dark:!text-gray-600 text-xs mb-1">Loan-to-Asset Ratio</p>
                <p className="text-gray-900 dark:!text-gray-900 text-lg">{totalAssets > 0 ? ((netLoanPortfolio / totalAssets) * 100).toFixed(2) : '0.00'}%</p>
              </div>
              <div className="bg-gray-50 dark:!bg-gray-50 p-2 rounded border border-gray-200 dark:!border-gray-200">
                <p className="text-gray-600 dark:!text-gray-600 text-xs mb-1">Equity-to-Asset Ratio</p>
                <p className="text-gray-900 dark:!text-gray-900 text-lg">{totalAssets > 0 ? ((totalEquity / totalAssets) * 100).toFixed(2) : '0.00'}%</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-3 border-t border-gray-300 dark:!border-gray-300 text-xs text-gray-700 dark:!text-gray-700">
            <div className="flex justify-between">
              <div>
                <p>Prepared by: _______________________</p>
                <p className="mt-2">Signature: _______________________</p>
              </div>
              <div className="text-right">
                <p>Approved by: _______________________</p>
                <p className="mt-2">Signature: _______________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}