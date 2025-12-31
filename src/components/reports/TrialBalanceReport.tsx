import { useData } from '../../contexts/DataContext';
const logo = '/logo.svg'; // Replaced figma:asset for deployment
import { getOrganizationName, getOrganizationLogo } from '../../utils/organizationUtils';

interface ReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function TrialBalanceReport({ dateRange }: ReportProps) {
  const { loans, payments } = useData();
  const organizationName = getOrganizationName();
  const organizationLogo = getOrganizationLogo();

  const trialBalanceData = [
    // Assets
    { code: '1000', account: 'Cash on Hand', debit: 2450000, credit: 0 },
    { code: '1010', account: 'Bank Accounts - KCB', debit: 5250000, credit: 0 },
    { code: '1020', account: 'Bank Accounts - Equity Bank', debit: 3500000, credit: 0 },
    // Only include loans that have been DISBURSED (completed all 5 approval steps) and are in Active/Disbursed status
    { code: '1100', account: 'Loan Portfolio - Outstanding', debit: loans.filter(l => l.status === 'Active' || l.status === 'Disbursed').reduce((sum, l) => sum + l.outstandingBalance, 0), credit: 0 },
    { code: '1110', account: 'Interest Receivable', debit: 850000, credit: 0 },
    { code: '1200', account: 'Fixed Assets', debit: 1850000, credit: 0 },
    { code: '1210', account: 'Accumulated Depreciation', debit: 0, credit: 420000 },
    
    // Liabilities
    { code: '2000', account: 'Client Deposits', debit: 0, credit: 3250000 },
    { code: '2100', account: 'Accounts Payable', debit: 0, credit: 185000 },
    { code: '2110', account: 'Accrued Expenses', debit: 0, credit: 145000 },
    { code: '2200', account: 'Long-Term Debt', debit: 0, credit: 4500000 },
    
    // Equity
    { code: '3000', account: 'Share Capital', debit: 0, credit: 5000000 },
    { code: '3100', account: 'Retained Earnings', debit: 0, credit: 2850000 },
    
    // Revenue
    { code: '4000', account: 'Interest Income', debit: 0, credit: 4250000 },
    { code: '4100', account: 'Fees Income', debit: 0, credit: 325000 },
    { code: '4200', account: 'Penalty Income', debit: 0, credit: 185000 },
    
    // Expenses
    { code: '5000', account: 'Salaries & Benefits', debit: 1250000, credit: 0 },
    { code: '5100', account: 'Rent & Utilities', debit: 350000, credit: 0 },
    { code: '5200', account: 'Marketing Expenses', debit: 125000, credit: 0 },
    { code: '5300', account: 'Administrative Expenses', debit: 180000, credit: 0 },
    { code: '5400', account: 'Depreciation Expense', debit: 95000, credit: 0 },
    { code: '5500', account: 'Loan Loss Provision', debit: 420000, credit: 0 },
  ];

  const totalDebits = trialBalanceData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredits = trialBalanceData.reduce((sum, item) => sum + item.credit, 0);
  const difference = totalDebits - totalCredits;

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
                <img src={organizationLogo || logo} alt="Organization Logo" className="size-12" />
                <h1 className="text-gray-900 dark:!text-gray-900 text-xl">{organizationName}</h1>
              </div>
              <div className="text-gray-600 dark:!text-gray-600 text-sm">
                Page 1/1
              </div>
            </div>
            <h2 className="text-gray-900 dark:!text-gray-900 text-center text-lg mb-1">TRIAL BALANCE</h2>
            <p className="text-center text-gray-600 dark:!text-gray-600 text-xs">
              As at: {formatDate(dateRange.endDate)}
            </p>
            <p className="text-center text-gray-600 dark:!text-gray-600 text-[10px] mt-0.5">
              Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
            </p>
          </div>

          {/* Balance Check */}
          {difference !== 0 && (
            <div className="mb-4 bg-red-50 dark:!bg-red-50 border border-red-200 dark:!border-red-200 p-3 rounded">
              <p className="text-red-900 dark:!text-red-900 text-sm">
                <strong>Warning:</strong> Trial Balance does not balance. Difference: KES {Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Trial Balance Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:!bg-gray-100 border-b border-gray-300 dark:!border-gray-300">
                <th className="text-left p-2 text-gray-900 dark:!text-gray-900 w-20">Code</th>
                <th className="text-left p-2 text-gray-900 dark:!text-gray-900">Account Name</th>
                <th className="text-right p-2 text-gray-900 dark:!text-gray-900 w-32">Debit (KES)</th>
                <th className="text-right p-2 text-gray-900 dark:!text-gray-900 w-32">Credit (KES)</th>
              </tr>
            </thead>
            <tbody>
              {trialBalanceData.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900">{item.code}</td>
                  <td className="p-2 text-gray-900 dark:!text-gray-900">{item.account}</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">
                    {item.debit > 0 ? item.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">
                    {item.credit > 0 ? item.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-100 dark:!bg-blue-100 border-t-2 border-gray-900 dark:!border-gray-900">
                <td className="p-2 text-gray-900 dark:!text-gray-900" colSpan={2}>TOTALS</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              {difference !== 0 && (
                <tr className="bg-red-50 dark:!bg-red-50">
                  <td className="p-2 text-gray-900 dark:!text-gray-900" colSpan={2}>DIFFERENCE</td>
                  <td className="p-2 text-right text-red-900 dark:!text-red-900" colSpan={2}>
                    {Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:!bg-gray-50 p-3 rounded border border-gray-200 dark:!border-gray-200">
              <p className="text-gray-600 dark:!text-gray-600 text-sm mb-1">Total Debits</p>
              <p className="text-gray-900 dark:!text-gray-900 text-lg">KES {totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-gray-50 dark:!bg-gray-50 p-3 rounded border border-gray-200 dark:!border-gray-200">
              <p className="text-gray-600 dark:!text-gray-600 text-sm mb-1">Total Credits</p>
              <p className="text-gray-900 dark:!text-gray-900 text-lg">KES {totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`p-3 rounded border ${difference === 0 ? 'bg-emerald-50 dark:!bg-emerald-50 border-emerald-200 dark:!border-emerald-200' : 'bg-red-50 dark:!bg-red-50 border-red-200 dark:!border-red-200'}`}>
              <p className={`text-sm mb-1 ${difference === 0 ? 'text-emerald-700 dark:!text-emerald-700' : 'text-red-700 dark:!text-red-700'}`}>Balance Status</p>
              <p className={`text-lg ${difference === 0 ? 'text-emerald-900 dark:!text-emerald-900' : 'text-red-900 dark:!text-red-900'}`}>
                {difference === 0 ? 'BALANCED' : 'OUT OF BALANCE'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 dark:!border-gray-300 text-xs text-gray-700 dark:!text-gray-700">
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