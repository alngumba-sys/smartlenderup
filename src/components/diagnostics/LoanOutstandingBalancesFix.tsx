import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X, AlertTriangle, CheckCircle, RefreshCw, Info, Download } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../utils/currencyUtils';
import {
  generateOutstandingBalancesReport,
  generateLoanUpdates,
  calculateLoanOutstandingBalances,
  identifyLoansNeedingFixes,
  logOutstandingBalancesDiagnostic,
} from '../../utils/fixLoanOutstandingBalances';
import { toast } from 'sonner';

interface LoanOutstandingBalancesFixProps {
  onClose: () => void;
}

export function LoanOutstandingBalancesFix({ onClose }: LoanOutstandingBalancesFixProps) {
  const { loans, payments, repayments, updateLoan } = useData();
  const currencySymbol = getCurrencySymbol();
  const [isFixing, setIsFixing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Combine payments and repayments
  const allPayments = [...(payments || []), ...(repayments || [])];

  // Generate report
  const report = generateOutstandingBalancesReport(loans, allPayments);
  const loanUpdates = generateLoanUpdates(loans, allPayments);

  useEffect(() => {
    // Log diagnostic on mount
    logOutstandingBalancesDiagnostic(loans, allPayments);
  }, []);

  const handleFixAllLoans = async () => {
    if (loanUpdates.length === 0) {
      toast.info('No loans need fixing', {
        description: 'All loans already have outstanding balances set.',
      });
      return;
    }

    setIsFixing(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Process each loan update
      for (const { loanId, updates } of loanUpdates) {
        try {
          await updateLoan(loanId, updates);
          successCount++;
        } catch (error) {
          console.error(`Failed to update loan ${loanId}:`, error);
          failCount++;
        }
      }

      // Show success message
      if (successCount > 0) {
        toast.success('Loans Fixed Successfully', {
          description: `Updated ${successCount} loan(s) with outstanding balances. ${
            failCount > 0 ? `${failCount} failed.` : ''
          }`,
          duration: 6000,
        });
      }

      if (failCount > 0) {
        toast.error('Some loans failed to update', {
          description: `${failCount} loan(s) could not be updated. Check console for details.`,
        });
      }

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error fixing loans:', error);
      toast.error('Failed to fix loans', {
        description: 'An error occurred while updating loan balances.',
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      summary: {
        totalLoans: report.totalLoans,
        loansWithAllocation: report.loansWithAllocation,
        loansWithoutAllocation: report.loansWithoutAllocation,
        loansNeedingFix: report.loansNeedingFix,
        totalPrincipalOutstanding: report.totalPrincipalOutstanding,
        totalInterestOutstanding: report.totalInterestOutstanding,
        totalOutstanding: report.totalOutstanding,
      },
      loansNeedingFix: loanUpdates.map(({ loanId, updates }) => {
        const loan = loans.find(l => l.id === loanId);
        return {
          loanId,
          loanNumber: loan?.loanNumber,
          clientName: loan?.clientName,
          principalOutstanding: updates.principalOutstanding,
          interestOutstanding: updates.interestOutstanding,
          totalOutstanding: updates.outstandingBalance,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-outstanding-balances-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported', {
      description: 'Outstanding balances report downloaded successfully.',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-8" />
            <div>
              <h2 className="text-2xl font-bold">Fix Loan Outstanding Balances</h2>
              <p className="text-emerald-100 text-sm">
                Calculate and populate principalOutstanding & interestOutstanding for existing loans
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Loans */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{report.totalLoans}</p>
              </div>
              <Info className="size-8 text-blue-500" />
            </div>
          </div>

          {/* With Allocation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Already Fixed</p>
                <p className="text-2xl font-bold text-green-900">{report.loansWithAllocation}</p>
                <p className="text-xs text-green-600">
                  {report.totalLoans > 0
                    ? Math.round((report.loansWithAllocation / report.totalLoans) * 100)
                    : 0}
                  % have balances set
                </p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </div>

          {/* Without Allocation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Need Fixing</p>
                <p className="text-2xl font-bold text-amber-900">{report.loansNeedingFix}</p>
                <p className="text-xs text-amber-600">
                  {report.totalLoans > 0
                    ? Math.round((report.loansNeedingFix / report.totalLoans) * 100)
                    : 0}
                  % missing balances
                </p>
              </div>
              <AlertTriangle className="size-8 text-amber-500" />
            </div>
          </div>

          {/* Total Outstanding */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div>
              <p className="text-sm text-blue-700 mb-2">Total Outstanding</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(report.totalPrincipalOutstanding)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Interest:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(report.totalInterestOutstanding)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-blue-300">
                  <span className="text-gray-700">Total:</span>
                  <span className="text-blue-900">
                    {formatCurrency(report.totalOutstanding)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Banner */}
        {report.loansNeedingFix > 0 ? (
          <div className="px-6 pb-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Action Required</h3>
                  <p className="text-sm text-amber-800 mb-2">
                    {report.loansNeedingFix} loan{report.loansNeedingFix !== 1 ? 's' : ''} found without
                    principal/interest outstanding balances.
                  </p>
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Why this matters:</strong> The payment allocation system needs these fields to
                    correctly split payments between principal and interest. Without them, new payments will
                    show as {currencySymbol} 0 for both principal and interest paid.
                  </p>
                  <p className="text-sm text-amber-800 font-semibold">
                    Click "Fix All Loans" below to automatically calculate and populate these values based on
                    existing payment history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">All Loans Are Up to Date!</h3>
                  <p className="text-sm text-green-800">
                    All active loans have principal and interest outstanding balances properly set. The payment
                    allocation system will work correctly for all new payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loans Needing Fix Table */}
        {report.loansNeedingFix > 0 && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Loans Needing Fix ({loanUpdates.length})
              </h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {showDetails && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr className="text-left text-sm">
                      <th className="px-4 py-3 font-semibold text-gray-700">Loan Number</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Client</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-right">
                        Principal Outstanding
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-right">
                        Interest Outstanding
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-right">
                        Total Outstanding
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanUpdates.map(({ loanId, updates }, index) => {
                      const loan = loans.find(l => l.id === loanId);
                      if (!loan) return null;

                      return (
                        <tr
                          key={loanId}
                          className={`border-t border-gray-200 text-sm ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-900 font-mono text-xs">
                            {loan.loanNumber || loanId}
                          </td>
                          <td className="px-4 py-3 text-gray-900">{loan.clientName}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                loan.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : loan.status === 'Disbursed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {loan.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                            {formatCurrency(updates.principalOutstanding || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-semibold">
                            {formatCurrency(updates.interestOutstanding || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 font-bold">
                            {formatCurrency(updates.outstandingBalance || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 px-6 py-4 flex justify-between items-center gap-3">
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Download className="size-4" />
            Export Report
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Close
            </button>

            {report.loansNeedingFix > 0 && (
              <button
                onClick={handleFixAllLoans}
                disabled={isFixing}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Fixing Loans...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    Fix All Loans ({report.loansNeedingFix})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
