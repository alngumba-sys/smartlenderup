import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface InterestPaidBackDiagnosticProps {
  onClose: () => void;
}

export function InterestPaidBackDiagnostic({ onClose }: InterestPaidBackDiagnosticProps) {
  const { loans, payments } = useData();
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    analyzeInterestPaidBack();
  }, [loans, payments]);

  const analyzeInterestPaidBack = () => {
    // Filter disbursed loans only
    const disbursedLoans = loans.filter((l: any) => 
      l.disbursementDate && l.status !== 'Rejected'
    );

    // Calculate interest paid back from payment records
    const paymentDetails: any[] = [];
    let totalInterestFromPayments = 0;

    payments.forEach((p: any) => {
      const loan = loans.find((l: any) => l.id === p.loanId);
      
      // Only count payments for disbursed, non-rejected loans
      if (!loan || !loan.disbursementDate || loan.status === 'Rejected') {
        return;
      }

      // Try all possible field names for interest paid
      const interestPaid = 
        p.interest || 
        p.interestPaid || 
        p.interestPortion || 
        p.interest_paid || 
        0;

      totalInterestFromPayments += interestPaid;

      if (interestPaid > 0 || p.amount > 0) {
        paymentDetails.push({
          paymentId: p.id,
          loanNumber: loan.loanNumber || loan.id,
          clientName: loan.clientName || 'Unknown',
          receiptNumber: p.receiptNumber || p.receipt_number || 'N/A',
          paymentDate: p.paymentDate || p.payment_date,
          totalAmount: p.amount || 0,
          interestPaid,
          principalPaid: p.principal || p.principalPaid || p.principalPortion || p.principal_paid || 0,
          // Show what fields were found
          fieldsFound: {
            interest: p.interest !== undefined,
            interestPaid: p.interestPaid !== undefined,
            interestPortion: p.interestPortion !== undefined,
            interest_paid: p.interest_paid !== undefined,
          }
        });
      }
    });

    // Calculate total interest that should be paid (Potential Interest Payable)
    let totalPotentialInterest = 0;
    const loanInterestBreakdown: any[] = [];

    disbursedLoans.forEach((l: any) => {
      const principal = l.principalAmount || l.amount || 0;
      const rate = l.interestRate || 0;
      const term = l.term || l.termPeriod || l.loanTerm || l.termMonths || 1;
      const calculatedInterest = (principal * rate * term) / 100;
      
      totalPotentialInterest += calculatedInterest;

      // Get interest paid for this specific loan
      const loanPayments = payments.filter((p: any) => p.loanId === l.id);
      const loanInterestPaid = loanPayments.reduce((sum: number, p: any) => {
        return sum + (p.interest || p.interestPaid || p.interestPortion || p.interest_paid || 0);
      }, 0);

      loanInterestBreakdown.push({
        loanNumber: l.loanNumber || l.id,
        clientName: l.clientName || 'Unknown',
        principal,
        rate,
        term,
        potentialInterest: calculatedInterest,
        interestPaid: loanInterestPaid,
        interestOutstanding: Math.max(0, calculatedInterest - loanInterestPaid),
        percentagePaid: calculatedInterest > 0 ? (loanInterestPaid / calculatedInterest * 100) : 0,
      });
    });

    setAnalysis({
      totalInterestFromPayments,
      totalPotentialInterest,
      interestOutstanding: totalPotentialInterest - totalInterestFromPayments,
      collectionRate: totalPotentialInterest > 0 ? (totalInterestFromPayments / totalPotentialInterest * 100) : 0,
      paymentDetails: paymentDetails.sort((a, b) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      ),
      loanInterestBreakdown: loanInterestBreakdown.sort((a, b) => b.interestPaid - a.interestPaid),
      totalPayments: paymentDetails.length,
      totalLoans: disbursedLoans.length,
    });
  };

  if (!analysis) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <p className="text-gray-600">Analyzing interest payments...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isCorrect = Math.abs(analysis.totalInterestFromPayments - 352200) < 1; // Expected from spreadsheet

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-emerald-500 to-emerald-600">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Interest Paid Back Diagnostic</h2>
              <p className="text-emerald-100 text-sm">Detailed analysis of all interest payments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 mb-1">Expected (Spreadsheet)</p>
              <p className="text-xl font-bold text-blue-600">KSh 352,200.00</p>
              <p className="text-[10px] text-gray-500 mt-1">From your Excel file</p>
            </div>
            
            <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${
              isCorrect ? 'border-green-500' : 'border-orange-500'
            }`}>
              <p className="text-xs text-gray-600 mb-1">System Calculated</p>
              <p className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(analysis.totalInterestFromPayments)}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">From payment records</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <p className="text-xs text-gray-600 mb-1">Collection Rate</p>
              <p className="text-xl font-bold text-purple-600">
                {analysis.collectionRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Interest collected vs potential</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
              <p className="text-xs text-gray-600 mb-1">Interest Outstanding</p>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(analysis.interestOutstanding)}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Still to be collected</p>
            </div>
          </div>

          {/* Status Message */}
          <div className={`mt-4 p-4 rounded-lg border-2 flex items-start gap-3 ${
            isCorrect 
              ? 'bg-green-50 border-green-300' 
              : 'bg-orange-50 border-orange-300'
          }`}>
            {isCorrect ? (
              <CheckCircle className="size-6 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-6 text-orange-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`font-semibold ${isCorrect ? 'text-green-900' : 'text-orange-900'}`}>
                {isCorrect 
                  ? '✅ Interest Paid Back Matches Spreadsheet!' 
                  : '⚠️ Discrepancy Detected'}
              </h3>
              <p className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {isCorrect
                  ? 'The system calculation matches your spreadsheet exactly. All interest payments are being tracked correctly.'
                  : `Difference: ${formatCurrency(Math.abs(analysis.totalInterestFromPayments - 352200))}. This may be due to missing payment records or incorrect interest allocations in the database.`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button className="px-6 py-3 border-b-2 border-emerald-600 text-emerald-600 font-semibold">
            Payment Details ({analysis.totalPayments})
          </button>
          <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
            By Loan ({analysis.totalLoans})
          </button>
        </div>

        {/* Payment Details Table */}
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Receipt #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Loan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Client</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Amount</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Principal Paid</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Interest Paid</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analysis.paymentDetails.map((payment: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-900">{payment.paymentDate}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{payment.receiptNumber}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{payment.loanNumber}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{payment.clientName}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                    {formatCurrency(payment.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    {formatCurrency(payment.principalPaid)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                    {formatCurrency(payment.interestPaid)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      {payment.fieldsFound.interest && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded" title="interest field found">i</span>
                      )}
                      {payment.fieldsFound.interestPaid && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded" title="interestPaid field found">iP</span>
                      )}
                      {payment.fieldsFound.interestPortion && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded" title="interestPortion field found">iPo</span>
                      )}
                      {payment.fieldsFound.interest_paid && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded" title="interest_paid field found">i_p</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold sticky bottom-0">
              <tr>
                <td colSpan={7} className="px-4 py-3 text-right text-gray-900">TOTAL INTEREST PAID BACK:</td>
                <td className="px-4 py-3 text-right text-emerald-600 text-lg">
                  {formatCurrency(analysis.totalInterestFromPayments)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p><strong>Data Source:</strong> Repayments table in Supabase</p>
              <p className="mt-1"><strong>Formula:</strong> Sum of interest_paid from all payment records for disbursed loans</p>
              <p className="mt-1 text-xs">
                <strong>Fields checked:</strong> interest, interestPaid, interestPortion, interest_paid
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
