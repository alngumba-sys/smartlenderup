import { Download, Printer, Calendar } from 'lucide-react';
import { getOrganizationName, getOrganizationLogo } from '../../utils/organizationUtils';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { useData } from '../../contexts/DataContext';

// Placeholder logo
const logo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzM0NzVkOSIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TEw8L3RleHQ+Cjwvc3ZnPg==';

interface ReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function CashFlowReport({ dateRange }: ReportProps) {
  const { loans, repayments, expenses, disbursements } = useData();
  const organizationName = getOrganizationName();
  const organizationLogo = getOrganizationLogo();
  
  // Calculate real cash flow data from actual loans and repayments
  // Only include approved repayments
  const approvedRepayments = repayments.filter(r => r.status === 'Approved');
  const totalRepaymentsPrincipal = approvedRepayments.reduce((sum, r) => sum + (r.principal || 0), 0);
  const totalInterestIncome = approvedRepayments.reduce((sum, r) => sum + (r.interest || 0), 0);
  const totalFeesIncome = 0; // From processing fees
  const totalPenaltyIncome = approvedRepayments.reduce((sum, r) => sum + (r.penalty || 0), 0);
  
  const totalInflows = totalRepaymentsPrincipal + totalInterestIncome + totalFeesIncome + totalPenaltyIncome;
  
  // Calculate outflows from disbursements
  const totalDisbursed = disbursements ? disbursements.reduce((sum, d) => sum + (d.amount || 0), 0) : 0;
  const operatingExpenses = expenses ? expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + (e.amount || 0), 0) : 0;
  const totalOutflows = totalDisbursed + operatingExpenses;
  const netCashFlow = totalInflows - totalOutflows;

  // Calculate monthly breakdown from real data
  const monthlyDataMap = new Map<string, { inflows: number; outflows: number; net: number }>();
  
  // Add disbursements (outflows)
  loans.forEach(loan => {
    const date = new Date(loan.disbursementDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyDataMap.has(monthKey)) {
      monthlyDataMap.set(monthKey, { inflows: 0, outflows: 0, net: 0 });
    }
    
    const data = monthlyDataMap.get(monthKey)!;
    data.outflows += loan.principalAmount;
  });
  
  // Add payments (inflows)
  approvedRepayments.forEach((repayment) => {
    const date = new Date(repayment.paymentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyDataMap.has(monthKey)) {
      monthlyDataMap.set(monthKey, { inflows: 0, outflows: 0, net: 0 });
    }
    
    const data = monthlyDataMap.get(monthKey)!;
    data.inflows += repayment.amount;
  });
  
  // Calculate net for each month
  monthlyDataMap.forEach(data => {
    data.net = data.inflows - data.outflows;
  });
  
  // Convert to array and sort by date
  const monthlyData = Array.from(monthlyDataMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString('en-GB', { month: 'long' }),
        ...data
      };
    });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen print:p-0 print:bg-white print:min-h-0">
      {/* A4 Page Container */}
      <div className="w-[210mm] max-h-[297mm] mx-auto bg-white dark:!bg-white shadow-lg mb-6 print:shadow-none print:mb-0 print:mx-0 box-border overflow-auto">
        {/* Report Container - Fits on screen, expandable for print */}
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
            <h2 className="text-gray-900 dark:!text-gray-900 text-center text-lg mb-1">CASH FLOW STATEMENT</h2>
            <p className="text-center text-gray-600 dark:!text-gray-600 text-xs">
              Period: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
            </p>
            <p className="text-center text-gray-600 dark:!text-gray-600 text-[10px] mt-0.5">
              Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
            </p>
          </div>

          {/* Cash Flow Summary */}
          <div className="mb-6">
            <h3 className="text-gray-900 dark:!text-gray-900 mb-3 pb-2 border-b border-gray-300 dark:!border-gray-300">Cash Flow Summary</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-emerald-50 dark:!bg-emerald-50 p-3 rounded border border-emerald-200 dark:!border-emerald-200">
                <p className="text-emerald-700 dark:!text-emerald-700 text-sm mb-1">Total Inflows</p>
                <p className="text-emerald-900 dark:!text-emerald-900 text-xl">{getCurrencyCode()} {totalInflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-red-50 dark:!bg-red-50 p-3 rounded border border-red-200 dark:!border-red-200">
                <p className="text-red-700 dark:!text-red-700 text-sm mb-1">Total Outflows</p>
                <p className="text-red-900 dark:!text-red-900 text-xl">{getCurrencyCode()} {totalOutflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className={`p-3 rounded border ${netCashFlow >= 0 ? 'bg-blue-50 dark:!bg-blue-50 border-blue-200 dark:!border-blue-200' : 'bg-orange-50 dark:!bg-orange-50 border-orange-200 dark:!border-orange-200'}`}>
                <p className={`text-sm mb-1 ${netCashFlow >= 0 ? 'text-blue-700 dark:!text-blue-700' : 'text-orange-700 dark:!text-orange-700'}`}>Net Cash Flow</p>
                <p className={`text-xl ${netCashFlow >= 0 ? 'text-blue-900 dark:!text-blue-900' : 'text-orange-900 dark:!text-orange-900'}`}>
                  {getCurrencyCode()} {netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Operating Activities */}
          <div className="mb-6">
            <h3 className="text-gray-900 dark:!text-gray-900 mb-3 pb-2 border-b border-gray-300 dark:!border-gray-300">Cash Flow from Operating Activities</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:!bg-gray-100 border-b border-gray-300 dark:!border-gray-300">
                  <th className="text-left p-2 text-gray-900 dark:!text-gray-900">Description</th>
                  <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Amount ({getCurrencyCode()})</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4">Cash Inflows:</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Loan Repayments (Principal)</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalRepaymentsPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Interest Income</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalInterestIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Fees Income</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalFeesIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Penalty Income</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalPenaltyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-gray-50 dark:!bg-gray-50 border-b border-gray-300 dark:!border-gray-300">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4">Total Cash Inflows</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalInflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4 pt-4">Cash Outflows:</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Loan Disbursements</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalDisbursed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-200 dark:!border-gray-200">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-8">Operating Expenses</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">50,000.00</td>
                </tr>
                <tr className="bg-gray-50 dark:!bg-gray-50 border-b border-gray-300 dark:!border-gray-300">
                  <td className="p-2 text-gray-900 dark:!text-gray-900 pl-4">Total Cash Outflows</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{totalOutflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-blue-100 dark:!bg-blue-100 border-t-2 border-gray-900 dark:!border-gray-900">
                  <td className="p-2 text-gray-900 dark:!text-gray-900">Net Cash Flow from Operating Activities</td>
                  <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Monthly Breakdown */}
          <div className="mb-6">
            <h3 className="text-gray-900 dark:!text-gray-900 mb-3 pb-2 border-b border-gray-300 dark:!border-gray-300">Monthly Cash Flow Analysis</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:!bg-gray-100 border-b border-gray-300 dark:!border-gray-300">
                  <th className="text-left p-2 text-gray-900 dark:!text-gray-900">Month</th>
                  <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Inflows ({getCurrencyCode()})</th>
                  <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Outflows ({getCurrencyCode()})</th>
                  <th className="text-right p-2 text-gray-900 dark:!text-gray-900">Net ({getCurrencyCode()})</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => (
                  <tr key={month.month} className="border-b border-gray-200 dark:!border-gray-200">
                    <td className="p-2 text-gray-900 dark:!text-gray-900">{month.month}</td>
                    <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{month.inflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right text-gray-900 dark:!text-gray-900">{month.outflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`p-2 text-right ${month.net >= 0 ? 'text-emerald-700 dark:!text-emerald-700' : 'text-red-700 dark:!text-red-700'}`}>
                      {month.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}