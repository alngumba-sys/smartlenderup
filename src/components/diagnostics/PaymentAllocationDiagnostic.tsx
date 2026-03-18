import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X, AlertTriangle, CheckCircle, Info, RefreshCw, Download } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../utils/currencyUtils';
import {
  generatePaymentAllocationReport,
  generatePaymentUpdates,
  identifyPaymentsNeedingFixes,
  logPaymentAllocationDiagnostic,
} from '../../utils/fixPaymentAllocations';
import { toast } from 'sonner@2.0.3';

interface PaymentAllocationDiagnosticProps {
  onClose: () => void;
}

export function PaymentAllocationDiagnostic({ onClose }: PaymentAllocationDiagnosticProps) {
  const { payments, loans, clients, updateRepayment } = useData();
  const currencySymbol = getCurrencySymbol();
  const [isFixing, setIsFixing] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [autoFixComplete, setAutoFixComplete] = useState(false);
  const [autoFixSkipped, setAutoFixSkipped] = useState(false);

  // Generate report and updates
  const report = generatePaymentAllocationReport(loans, payments);
  const paymentUpdates = generatePaymentUpdates(loans, payments);

  useEffect(() => {
    // Log diagnostic on mount
    logPaymentAllocationDiagnostic(loans, payments);
    
    // Auto-fix payments if there are any that need fixing
    // TEMPORARILY DISABLED - preventing auto-execution to avoid blocking the UI
    /*
    if (paymentUpdates.length > 0 && !autoFixComplete && !autoFixSkipped) {
      const timer = setTimeout(() => {
        handleAutoFix();
      }, 1000); // Wait 1 second before auto-fixing
      
      return () => clearTimeout(timer);
    }
    */
  }, []);

  const handleAutoFix = async () => {
    if (paymentUpdates.length === 0 || autoFixComplete || autoFixSkipped) {
      return;
    }

    setIsFixing(true);

    try {
      console.log(`🔧 AUTO-FIX: Starting automatic fix for ${paymentUpdates.length} payments...`);
      console.log('📦 Payment updates to process:', paymentUpdates.map(u => ({
        id: u.paymentId.slice(0, 8),
        principal: u.updates.principal,
        interest: u.updates.interest,
        penalty: u.updates.penalty,
      })));
      
      // Process all payments in parallel
      const updatePromises = paymentUpdates.map(({ paymentId, updates }) => {
        console.log(`🔄 Processing payment ${paymentId.slice(0, 8)}... with updates:`, updates);
        return Promise.resolve()
          .then(() => updateRepayment(paymentId, updates))
          .then(() => ({ status: 'success' as const, paymentId }))
          .catch((error) => ({ status: 'failed' as const, paymentId, error }));
      });

      const results = await Promise.all(updatePromises);

      // Count successes and failures
      const successCount = results.filter(r => r.status === 'success').length;
      const failCount = results.filter(r => r.status === 'failed').length;

      console.log(`✅ AUTO-FIX: Completed - ${successCount} succeeded, ${failCount} failed`);

      // Show single summary message
      if (successCount > 0 && failCount === 0) {
        toast.success('Auto-Fix Complete!', {
          description: `Successfully fixed ${successCount} payment${successCount !== 1 ? 's' : ''} with proper principal/interest allocation.`,
          duration: 6000,
        });
        setAutoFixComplete(true);
        
        // Close modal after showing success
        setTimeout(() => {
          onClose();
        }, 2500);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning('Auto-Fix Partial Success', {
          description: `Fixed ${successCount} payment(s) successfully. ${failCount} payment(s) failed. Check details below.`,
          duration: 6000,
        });
        console.error('Failed payments:', results.filter(r => r.status === 'failed'));
        setAutoFixComplete(true);
      } else {
        toast.error('Auto-Fix Failed', {
          description: 'Unable to fix payments automatically. You can try fixing them individually.',
          duration: 6000,
        });
        console.error('All payments failed:', results);
        setAutoFixSkipped(true);
      }
    } catch (error) {
      console.error('Error in auto-fix:', error);
      toast.error('Auto-Fix Error', {
        description: 'An error occurred during automatic fix. Try manual fix.',
      });
      setAutoFixSkipped(true);
    } finally {
      setIsFixing(false);
    }
  };

  const handleFixAllPayments = async () => {
    if (paymentUpdates.length === 0) {
      toast.info('No payments need fixing', {
        description: 'All payments already have proper allocation.',
      });
      return;
    }

    setIsFixing(true);

    try {
      // Process all payments in parallel
      const updatePromises = paymentUpdates.map(({ paymentId, updates }) =>
        Promise.resolve()
          .then(() => updateRepayment(paymentId, updates))
          .then(() => ({ status: 'success' as const, paymentId }))
          .catch((error) => ({ status: 'failed' as const, paymentId, error }))
      );

      const results = await Promise.all(updatePromises);

      // Count successes and failures
      const successCount = results.filter(r => r.status === 'success').length;
      const failCount = results.filter(r => r.status === 'failed').length;

      // Show single summary message
      if (successCount > 0 && failCount === 0) {
        toast.success('All Payments Fixed Successfully!', {
          description: `Successfully updated ${successCount} payment${successCount !== 1 ? 's' : ''} with proper principal/interest allocation.`,
          duration: 6000,
        });
      } else if (successCount > 0 && failCount > 0) {
        toast.warning('Partial Success', {
          description: `Updated ${successCount} payment(s) successfully. ${failCount} payment(s) failed to update.`,
          duration: 6000,
        });
        console.error('Failed payments:', results.filter(r => r.status === 'failed'));
      } else {
        toast.error('Fix Failed', {
          description: 'All payment updates failed. Check console for details.',
        });
        console.error('All payments failed:', results);
      }

      // Close modal after a delay
      if (successCount > 0) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error fixing payments:', error);
      toast.error('Failed to fix payments', {
        description: 'An error occurred while updating payment allocations.',
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleFixSinglePayment = async (paymentId: string) => {
    const paymentUpdate = paymentUpdates.find(u => u.paymentId === paymentId);
    if (!paymentUpdate) return;

    setIsFixing(true);

    try {
      await updateRepayment(paymentId, paymentUpdate.updates);
      
      toast.success('Payment Fixed!', {
        description: `Successfully allocated principal: ${formatCurrency(paymentUpdate.updates.principal || 0)}, interest: ${formatCurrency(paymentUpdate.updates.interest || 0)}`,
        duration: 4000,
      });

      // Refresh the page data after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error fixing payment:', error);
      toast.error('Failed to fix payment', {
        description: error.message || 'An error occurred while updating payment allocation.',
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      summary: {
        totalPayments: report.totalPayments,
        paymentsWithAllocation: report.paymentsWithAllocation,
        paymentsWithoutAllocation: report.paymentsWithoutAllocation,
        paymentsNeedingFix: report.paymentsNeedingFix,
        totalPrincipalAllocated: report.totalPrincipalAllocated,
        totalInterestAllocated: report.totalInterestAllocated,
        totalPenaltyAllocated: report.totalPenaltyAllocated,
        totalAllocated: report.totalAllocated,
      },
      paymentsNeedingFix: paymentUpdates.map(({ paymentId, updates }) => {
        const payment = payments.find(p => p.id === paymentId);
        const loan = loans.find(l => l.id === payment?.loanId || l.id === payment?.loan_id);
        const client = clients.find(c => c.id === payment?.clientId || c.id === payment?.client_id);
        
        return {
          paymentId,
          date: payment?.paymentDate || payment?.date,
          loanNumber: loan?.loanNumber || payment?.loanId,
          clientName: client?.name || payment?.clientName,
          totalAmount: payment?.amount || 0,
          calculatedPrincipal: updates.principal,
          calculatedInterest: updates.interest,
          calculatedPenalty: updates.penalty,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-allocation-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported', {
      description: 'Payment allocation report downloaded successfully.',
    });
  };

  // Analyze payments
  const analysisResults = payments.map((payment: any) => {
    const loan = loans.find(l => l.id === payment.loanId || l.id === payment.loan_id);
    const client = clients.find(c => c.id === payment.clientId || c.id === payment.client_id);
    
    const totalAmount = payment.amount || 0;
    const principalPaid = payment.principal || payment.principalAmount || payment.principalPortion || payment.principalPaid || 0;
    const interestPaid = payment.interest || payment.interestAmount || payment.interestPortion || payment.interestPaid || 0;
    const penaltyPaid = payment.penalty || payment.penaltyAmount || 0;
    
    const allocatedTotal = principalPaid + interestPaid + penaltyPaid;
    const hasAllocation = allocatedTotal > 0;
    const allocationMatch = Math.abs(allocatedTotal - totalAmount) < 0.01; // Within 1 cent
    
    return {
      id: payment.id,
      loanNumber: loan?.loanNumber || loan?.id || payment.loanId || payment.loan_id || 'Unknown',
      clientName: client?.name || payment.clientName || 'Unknown',
      date: payment.paymentDate || payment.date || 'Unknown',
      totalAmount,
      principalPaid,
      interestPaid,
      penaltyPaid,
      allocatedTotal,
      hasAllocation,
      allocationMatch,
      loanInterestOutstanding: loan?.interestOutstanding || 0,
      loanPrincipalOutstanding: loan?.principalOutstanding || 0,
    };
  });

  // Filter to show only payments without allocation if there are many
  const displayResults = showDetails 
    ? analysisResults 
    : analysisResults.filter(r => !r.hasAllocation).slice(0, 50);

  const totalPayments = payments.length;
  const paymentsWithAllocation = analysisResults.filter(r => r.hasAllocation).length;
  const paymentsWithoutAllocation = totalPayments - paymentsWithAllocation;
  const totalPrincipalPaid = analysisResults.reduce((sum, r) => sum + r.principalPaid, 0);
  const totalInterestPaid = analysisResults.reduce((sum, r) => sum + r.interestPaid, 0);
  const totalPenaltyPaid = analysisResults.reduce((sum, r) => sum + r.penaltyPaid, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Info className="size-8" />
            <div>
              <h2 className="text-2xl font-bold">Payment Allocation Diagnostic</h2>
              <p className="text-blue-100 text-sm">Analyzing principal and interest allocation in payment records</p>
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
          {/* Total Payments */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
              </div>
              <Info className="size-8 text-blue-500" />
            </div>
          </div>

          {/* With Allocation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">With Allocation</p>
                <p className="text-2xl font-bold text-green-900">{paymentsWithAllocation}</p>
                <p className="text-xs text-green-600">{totalPayments > 0 ? Math.round((paymentsWithAllocation / totalPayments) * 100) : 0}% of total</p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </div>

          {/* Without Allocation */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Without Allocation</p>
                <p className="text-2xl font-bold text-red-900">{paymentsWithoutAllocation}</p>
                <p className="text-xs text-red-600">{totalPayments > 0 ? Math.round((paymentsWithoutAllocation / totalPayments) * 100) : 0}% of total</p>
              </div>
              <AlertTriangle className="size-8 text-red-500" />
            </div>
          </div>

          {/* Total Allocated */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div>
              <p className="text-sm text-blue-700 mb-2">Total Allocated</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalPrincipalPaid)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Interest:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalInterestPaid)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Penalty:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalPenaltyPaid)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Info */}
        {paymentsWithoutAllocation > 0 && (
          <div className="px-6 pb-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Action Required</h3>
                  <p className="text-sm text-amber-800 mb-2">
                    {paymentsWithoutAllocation} payment{paymentsWithoutAllocation !== 1 ? 's' : ''} found without principal/interest allocation. 
                    This happens when:
                  </p>
                  <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                    <li>Payments were recorded before the allocation system was implemented</li>
                    <li>The loan's <code className="bg-amber-100 px-1 rounded">principalOutstanding</code> or <code className="bg-amber-100 px-1 rounded">interestOutstanding</code> fields are not set</li>
                    <li>The payment allocation utility was not used when recording the payment</li>
                  </ul>
                  <p className="text-sm text-amber-800 mt-2 font-semibold">
                    Click "Fix All Payments" below to automatically calculate and populate principal/interest allocation for all historical payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details Table */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Loan</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Client</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Total Amount</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Principal</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Interest</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Penalty</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayResults.map((result, index) => (
                  <tr 
                    key={result.id}
                    className={`border-t border-gray-200 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${!result.hasAllocation ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-gray-900">{result.date}</td>
                    <td className="px-4 py-3 text-gray-900 font-mono text-xs">{result.loanNumber}</td>
                    <td className="px-4 py-3 text-gray-900">{result.clientName}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-semibold">{formatCurrency(result.totalAmount)}</td>
                    <td className={`px-4 py-3 text-right ${result.principalPaid > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                      {formatCurrency(result.principalPaid)}
                    </td>
                    <td className={`px-4 py-3 text-right ${result.interestPaid > 0 ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                      {formatCurrency(result.interestPaid)}
                    </td>
                    <td className={`px-4 py-3 text-right ${result.penaltyPaid > 0 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                      {formatCurrency(result.penaltyPaid)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {result.hasAllocation ? (
                        result.allocationMatch ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            <CheckCircle className="size-3" />
                            Allocated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                            <AlertTriangle className="size-3" />
                            Partial
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          <AlertTriangle className="size-3" />
                          No Allocation
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!result.hasAllocation && (
                        <button
                          onClick={() => handleFixSinglePayment(result.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Fix
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
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

            {paymentsWithoutAllocation > 0 && (
              <button
                onClick={handleFixAllPayments}
                disabled={isFixing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Fixing Payments...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    Fix All Payments ({paymentsWithoutAllocation})
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