import { useState } from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { loanProducts, generateInstallments } from '../../data/dummyData';
import { useData } from '../../contexts/DataContext';

interface ClientLoansTabProps {
  clientId: string;
}

export function ClientLoansTab({ clientId }: ClientLoansTabProps) {
  const { clients, loans, payments } = useData();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  
  const client = clients.find(c => c.id === clientId);
  const clientLoans = loans.filter(l => l.clientId === clientId);
  const activeLoans = clientLoans.filter(l => l.status !== 'Fully Paid');
  const pastLoans = clientLoans.filter(l => l.status === 'Fully Paid');

  const selectedLoan = clientLoans.find(l => l.id === (selectedLoanId || activeLoans[0]?.id));
  const selectedProduct = selectedLoan ? loanProducts.find(p => p.id === selectedLoan.productId) : null;
  const installments = selectedLoan ? generateInstallments(selectedLoan.id) : [];
  const loanPayments = selectedLoan ? payments.filter(p => p.loanId === selectedLoan.id) : [];

  if (!client) return <div className="p-6">Client not found</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="size-4 text-emerald-600" />;
      case 'Late Paid':
        return <CheckCircle className="size-4 text-amber-600" />;
      case 'Overdue':
        return <AlertCircle className="size-4 text-red-600" />;
      case 'Pending':
        return <Clock className="size-4 text-gray-600" />;
      default:
        return <XCircle className="size-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'Late Paid':
        return 'bg-amber-100 text-amber-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">My Loans</h2>
        <p className="text-gray-600">View your loan history and payment schedules</p>
      </div>

      {/* Loan Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              className="px-6 py-3 border-b-2 border-emerald-600 text-emerald-700 whitespace-nowrap"
            >
              Active Loans ({activeLoans.length})
            </button>
            <button
              className="px-6 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              Loan History ({pastLoans.length})
            </button>
          </div>
        </div>

        {/* Active Loans List */}
        <div className="p-4 md:p-6">
          {activeLoans.length > 0 ? (
            <div className="space-y-3">
              {activeLoans.map((loan) => {
                const product = loanProducts.find(p => p.id === loan.productId);
                return (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedLoanId === loan.id || (selectedLoanId === null && loan === activeLoans[0])
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="size-5 text-emerald-600" />
                          <span className="text-gray-900">{product?.name}</span>
                        </div>
                        <p className="text-gray-600 text-sm">Loan ID: {loan.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">Outstanding Balance</p>
                        <p className="text-gray-900 text-xl">KES {loan.outstandingBalance.toLocaleString()}</p>
                      </div>
                    </div>
                    {loan.daysInArrears > 0 && (
                      <div className="mt-3 p-2 bg-red-100 rounded text-red-800 text-sm flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        <span>{loan.daysInArrears} days overdue</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <CreditCard className="size-12 mx-auto mb-3 text-gray-400" />
              <p>You don&apos;t have any active loans</p>
            </div>
          )}
        </div>
      </div>

      {/* Loan Details */}
      {selectedLoan && selectedProduct && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Loan Header */}
          <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-gray-900">{selectedProduct.name}</h3>
                <p className="text-gray-600 text-sm">Account: {selectedLoan.id}</p>
              </div>
              <div className={`px-3 py-1 rounded ${
                selectedLoan.status.toLowerCase().trim() === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                selectedLoan.status.toLowerCase().trim() === 'in arrears' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                selectedLoan.status.toLowerCase().trim() === 'fully paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                selectedLoan.status.toLowerCase().trim() === 'pending' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                'bg-blue-100 text-blue-800'
              }`}>
                {selectedLoan.status}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Original Amount</p>
                <p className="text-gray-900">KES {selectedLoan.principalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Interest Rate</p>
                <p className="text-gray-900">{selectedProduct.interestRate}% {selectedProduct.interestType}</p>
              </div>
              <div>
                <p className="text-gray-600">Disbursed</p>
                <p className="text-gray-900">{selectedLoan.disbursementDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Maturity</p>
                <p className="text-gray-900">{selectedLoan.maturityDate}</p>
              </div>
            </div>
          </div>

          {/* Repayment Schedule */}
          <div className="p-4 md:p-6">
            <h4 className="text-gray-900 mb-4">Repayment Schedule</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-700">#</th>
                    <th className="px-3 py-2 text-left text-gray-700">Due Date</th>
                    <th className="px-3 py-2 text-right text-gray-700">Amount</th>
                    <th className="px-3 py-2 text-right text-gray-700">Principal</th>
                    <th className="px-3 py-2 text-right text-gray-700">Interest</th>
                    <th className="px-3 py-2 text-center text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((installment) => (
                    <tr key={installment.installmentNo} className="border-t border-gray-100">
                      <td className="px-3 py-3 text-gray-900">{installment.installmentNo}</td>
                      <td className="px-3 py-3 text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3 text-gray-400" />
                          {installment.dueDate}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-gray-900">
                        {installment.plannedAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-600">
                        {installment.principalComponent.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-600">
                        {installment.interestComponent.toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(installment.status)}
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(installment.status)}`}>
                            {installment.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
            <h4 className="text-gray-900 mb-4">Payment History</h4>
            {loanPayments.length > 0 ? (
              <div className="space-y-2">
                {loanPayments.map((payment) => (
                  <div key={payment.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-gray-900">Installment #{payment.installmentNumber}</p>
                        <p className="text-gray-600 text-sm">{payment.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-gray-900">KES {payment.amount.toLocaleString()}</p>
                          <p className="text-gray-600 text-xs">{payment.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-xs">Transaction ID</p>
                          <p className="text-gray-900 text-xs font-mono">{payment.transactionId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No payments recorded yet</p>
            )}
          </div>
        </div>
      )}

      {/* Past Loans */}
      {pastLoans.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-gray-900">Fully Paid Loans</h3>
          </div>
          <div className="p-4 md:p-6 space-y-3">
            {pastLoans.map((loan) => {
              const product = loanProducts.find(p => p.id === loan.productId);
              return (
                <div key={loan.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="size-5 text-blue-600" />
                        <span className="text-gray-900">{product?.name}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{loan.id}</p>
                      <p className="text-gray-600 text-sm">
                        {loan.disbursementDate} - {loan.maturityDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Principal</p>
                      <p className="text-gray-900">KES {loan.principalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}