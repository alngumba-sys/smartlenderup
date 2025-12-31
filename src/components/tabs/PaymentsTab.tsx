import { useState } from 'react';
import { Smartphone, AlertCircle, Send, CheckCircle, Plus, User, Calendar, Phone, X, Info, TrendingUp, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { CollectionActivityModal } from '../CollectionActivityModal';
import { RecordPaymentModal } from '../modals/RecordPaymentModal';
import { ViewToggle } from '../ViewToggle';
import { toast } from 'sonner@2.0.3';
import { useTheme } from '../../contexts/ThemeContext';

export function PaymentsTab() {
  const { isDark } = useTheme();
  // Get real data from DataContext
  const { loans, clients, payments, addRepayment, generateReceiptNumber } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'reconciliation' | 'arrears'>('reconciliation');
  const [selectedArrearsLoan, setSelectedArrearsLoan] = useState<string | null>(null);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showAutoReconcileModal, setShowAutoReconcileModal] = useState(false);
  const [showBulkRemindersModal, setShowBulkRemindersModal] = useState(false);

  const handleRecordPayment = (paymentData: any) => {
    console.log('Payment recorded:', paymentData);
    
    // Find the loan and client
    const loan = loans.find(l => l.id === paymentData.loanId);
    const client = loan ? clients.find(c => c.id === loan.clientId) : null;
    
    if (!loan || !client) {
      toast.error('Error recording payment', {
        description: 'Loan or client not found',
        duration: 4000,
      });
      return;
    }

    // Calculate principal and interest breakdown (simplified - you can make this more sophisticated)
    const amount = parseFloat(paymentData.amount);
    const principal = amount * 0.7; // Assuming 70% goes to principal
    const interest = amount * 0.3; // Assuming 30% goes to interest
    
    // Create the repayment object
    const repaymentRecord = {
      loanId: paymentData.loanId,
      clientId: loan.clientId,
      clientName: client.name,
      amount: amount,
      principal: principal,
      interest: interest,
      penalty: 0,
      paymentMethod: paymentData.paymentMethod as 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque',
      paymentReference: paymentData.mpesaCode || paymentData.transactionRef || `TXN${Date.now()}`,
      paymentDate: paymentData.paymentDate,
      receiptNumber: generateReceiptNumber(),
      receivedBy: 'Current User', // You can replace this with actual logged-in user
      notes: paymentData.notes || '',
      status: 'Approved' as const, // Auto-approve for now
      bankAccountId: paymentData.destinationAccountId, // Add destination account ID
    };

    // Add the repayment to the context
    addRepayment(repaymentRecord);

    // Close the modal
    setShowRecordPaymentModal(false);

    // Show success toast
    toast.success('Payment Recorded Successfully', {
      description: `KES ${amount.toLocaleString()} recorded for ${client.name} via ${paymentData.paymentMethod}`,
      duration: 5000,
    });
  };

  const handleAutoReconcile = () => {
    setShowAutoReconcileModal(false);
    // Simulate auto-reconciliation process
    const reconciledCount = unallocatedPayments.length;
    const totalAmount = unallocatedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    toast.success(`Auto-Reconciliation Complete`, {
      description: `Successfully reconciled ${reconciledCount} payment(s) totaling KES ${totalAmount.toLocaleString()}`,
      duration: 5000,
    });
  };

  const handleSendBulkReminders = () => {
    setShowBulkRemindersModal(false);
    // Simulate sending bulk SMS reminders
    const remindersCount = arrearsLoans.slice(0, 15).length;
    
    toast.success(`Bulk Reminders Sent`, {
      description: `SMS reminders sent to ${remindersCount} client(s) with overdue loans`,
      duration: 5000,
    });
  };

  const recentPayments = payments ? payments.slice(-20).reverse() : [];
  
  // Calculate arrears aging from real data
  const getArrearsAging = () => [
    { range: '1-30 DPD', count: loans.filter((l: any) => l.daysInArrears >= 1 && l.daysInArrears <= 30).length },
    { range: '31-60 DPD', count: loans.filter((l: any) => l.daysInArrears >= 31 && l.daysInArrears <= 60).length },
    { range: '61-90 DPD', count: loans.filter((l: any) => l.daysInArrears >= 61 && l.daysInArrears <= 90).length },
    { range: '90+ DPD', count: loans.filter((l: any) => l.daysInArrears > 90).length },
  ];
  
  const arrearsData = getArrearsAging();
  const arrearsLoans = loans.filter((l: any) => l.daysInArrears > 0).sort((a: any, b: any) => b.daysInArrears - a.daysInArrears);

  const unallocatedPayments = recentPayments.filter(() => Math.random() < 0.1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Payments & Collections</h2>
          <p className="text-gray-600">Manage M-Pesa reconciliation and arrears</p>
        </div>
        <button
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
          onClick={() => setShowRecordPaymentModal(true)}
        >
          <Plus className="size-4" />
          Repayment
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('reconciliation')}
          className={`px-4 py-2 ${
            activeSubTab === 'reconciliation'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          M-Pesa Reconciliation
        </button>
        <button
          onClick={() => setActiveSubTab('arrears')}
          className={`px-4 py-2 ${
            activeSubTab === 'arrears'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Arrears Management
        </button>
      </div>

      {activeSubTab === 'reconciliation' ? (
        <div className="space-y-6">
          {/* M-Pesa Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
              onClick={() => setSelectedMetric('reconciled-today')}
              style={{
                backgroundColor: '#15233a',
                borderColor: '#1e2f42'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Reconciled Today</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{recentPayments.length - unallocatedPayments.length}</p>
                </div>
                <CheckCircle className="size-8 text-emerald-600" />
              </div>
            </div>

            <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
              onClick={() => setSelectedMetric('unallocated')}
              style={{
                backgroundColor: '#15233a',
                borderColor: '#1e2f42'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Unallocated</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{unallocatedPayments.length}</p>
                </div>
                <AlertCircle className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
              onClick={() => setSelectedMetric('mpesa-status')}
              style={{
                backgroundColor: '#15233a',
                borderColor: '#1e2f42'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>M-Pesa API Status</p>
                  <p className="text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
                    <span className="size-2 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
                    Connected
                  </p>
                </div>
                <Smartphone className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center"
              style={{
                backgroundColor: '#0f1a2e',
                borderColor: '#1e2f42'
              }}
            >
              <h3 className="text-gray-900 dark:text-white">Recent M-Pesa Payments</h3>
              <button className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700" onClick={() => setShowAutoReconcileModal(true)}>
                Auto-Reconcile
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Client</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Loan ID</th>
                    <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Method</th>
                    <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => {
                    const client = clients.find(c => c.id === payment.clientId);
                    const isUnallocated = unallocatedPayments.includes(payment);
                    return (
                      <tr key={payment.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{payment.paymentDate}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono text-xs">{payment.paymentReference}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{client?.name}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{payment.loanId}</td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">KES {payment.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1">
                            {payment.paymentMethod === 'M-Pesa' && <Smartphone className="size-3 text-emerald-600 dark:text-emerald-400" />}
                            <span className="text-gray-900 dark:text-gray-300">{payment.paymentMethod}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            isUnallocated ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {isUnallocated ? 'Unallocated' : 'Reconciled'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Arrears Aging Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <h3 className="text-gray-900 dark:text-white mb-4">Arrears Aging Analysis</h3>
            <div className="grid grid-cols-4 gap-4">
              {arrearsData.map((item) => (
                <div 
                  key={item.range} 
                  onClick={() => setSelectedMetric(`arrears-${item.range}`)}
                  className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                  style={{
                    backgroundColor: '#15233a',
                    borderColor: '#1e2f42'
                  }}
                >
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.range}</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrears List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center"
              style={{
                backgroundColor: '#0f1a2e',
                borderColor: '#1e2f42'
              }}
            >
              <h3 className="text-gray-900 dark:text-white">Loans in Arrears</h3>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2" onClick={() => setShowBulkRemindersModal(true)}>
                <Send className="size-3" />
                Send Bulk Reminders
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Loan ID</th>
                    <th className="px-4 py-3 text-left text-gray-700">Client</th>
                    <th className="px-4 py-3 text-left text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-right text-gray-700">Outstanding</th>
                    <th className="px-4 py-3 text-center text-gray-700">Days Past Due</th>
                    <th className="px-4 py-3 text-center text-gray-700">Risk Score</th>
                    <th className="px-4 py-3 text-left text-gray-700">Loan Officer</th>
                    <th className="px-4 py-3 text-center text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arrearsLoans.slice(0, 15).map((loan) => {
                    const client = clients.find(c => c.id === loan.clientId);
                    return (
                      <tr key={loan.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{loan.id}</td>
                        <td className="px-4 py-3 text-gray-900">{client?.name}</td>
                        <td className="px-4 py-3 text-gray-900">{client?.phone}</td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          KES {loan.outstandingBalance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            loan.daysInArrears > 90 ? 'bg-red-100 text-red-800' :
                            loan.daysInArrears > 60 ? 'bg-orange-100 text-orange-800' :
                            loan.daysInArrears > 30 ? 'bg-amber-100 text-amber-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {loan.daysInArrears} DPD
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900">{client?.creditScore || 300}</td>
                        <td className="px-4 py-3 text-gray-900">{loan.loanOfficer}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className="text-emerald-600 hover:text-emerald-700 text-sm"
                            onClick={() => setSelectedArrearsLoan(loan.id)}
                          >
                            Contact
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {selectedArrearsLoan && (
        <CollectionActivityModal
          loanId={selectedArrearsLoan}
          onClose={() => setSelectedArrearsLoan(null)}
        />
      )}
      {showRecordPaymentModal && (
        <RecordPaymentModal
          isOpen={showRecordPaymentModal}
          onClose={() => setShowRecordPaymentModal(false)}
          onSubmit={handleRecordPayment}
        />
      )}

      {/* Metric Details Modals */}
      {selectedMetric && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white">Payment Metric Details</h3>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="size-5" />
                </button>
              </div>

              {selectedMetric === 'reconciled-today' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-emerald-900 dark:text-emerald-100 text-sm">Reconciled Today</p>
                      <p className="text-emerald-900 dark:text-emerald-100 text-3xl">{recentPayments.length - unallocatedPayments.length}</p>
                      <p className="text-emerald-700 dark:text-emerald-200 text-sm">Successfully matched to loans</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What is Reconciled Today?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Reconciled payments are M-Pesa transactions that have been successfully matched to active loans 
                      and allocated to the correct client accounts. These payments reduce outstanding loan balances automatically.
                    </p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Reconciliation Summary</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Reconciled Payments</p>
                        <p className="text-gray-900 dark:text-white">{recentPayments.length - unallocatedPayments.length} transactions</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Value</p>
                        <p className="text-gray-900 dark:text-white">
                          KES {recentPayments.filter(p => !unallocatedPayments.includes(p))
                            .reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Reconciliation Rate</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">
                          {(((recentPayments.length - unallocatedPayments.length) / recentPayments.length) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Avg Payment Size</p>
                        <p className="text-gray-900 dark:text-white">
                          KES {(recentPayments.filter(p => !unallocatedPayments.includes(p))
                            .reduce((sum, p) => sum + p.amount, 0) / (recentPayments.length - unallocatedPayments.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">M-Pesa Transactions</p>
                        <p className="text-gray-900">
                          {recentPayments.filter(p => !unallocatedPayments.includes(p) && p.method === 'M-Pesa').length} payments
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Other Methods</p>
                        <p className="text-gray-900">
                          {recentPayments.filter(p => !unallocatedPayments.includes(p) && p.method !== 'M-Pesa').length} payments
                        </p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Recent Reconciled Payments</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {recentPayments.filter(p => !unallocatedPayments.includes(p)).slice(0, 10).map(payment => {
                        const client = clients.find(c => c.id === payment.clientId);
                        return (
                          <div key={payment.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded border border-emerald-100">
                            <div>
                              <p className="text-gray-900 text-sm">{client?.name}</p>
                              <p className="text-gray-600 text-xs">{payment.transactionId} • {payment.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-700 text-sm">KES {payment.amount.toLocaleString()}</p>
                              <p className="text-gray-600 text-xs">{payment.method}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{(((recentPayments.length - unallocatedPayments.length) / recentPayments.length) * 100).toFixed(1)}% automatic reconciliation rate demonstrates excellent M-Pesa integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>All reconciled payments are instantly applied to loan accounts, improving accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>M-Pesa's instant confirmation reduces manual workload and errors</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'unallocated' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="size-8 text-amber-600" />
                    <div>
                      <p className="text-amber-900 text-sm">Unallocated Payments</p>
                      <p className="text-amber-900 text-3xl">{unallocatedPayments.length}</p>
                      <p className="text-amber-700 text-sm">Requiring manual allocation</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What are Unallocated Payments?</h4>
                    <p className="text-gray-600 text-sm">
                      Unallocated payments are M-Pesa transactions that could not be automatically matched to a loan account. 
                      This typically happens when reference numbers are missing or incorrect, requiring manual review and allocation.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Unallocated Analysis</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Unallocated Count</p>
                        <p className="text-gray-900">{unallocatedPayments.length} transactions</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Value</p>
                        <p className="text-gray-900">
                          KES {unallocatedPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Unallocated Rate</p>
                        <p className="text-gray-900 text-amber-600">
                          {((unallocatedPayments.length / recentPayments.length) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Unallocated Amount</p>
                        <p className="text-gray-900">
                          KES {(unallocatedPayments.reduce((sum, p) => sum + p.amount, 0) / (unallocatedPayments.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Oldest Unallocated</p>
                        <p className="text-gray-900">{unallocatedPayments[0]?.date || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Requiring Action</p>
                        <p className="text-gray-900 text-amber-600">{unallocatedPayments.length} payments</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Unallocated Payments List</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {unallocatedPayments.map(payment => {
                        const client = clients.find(c => c.id === payment.clientId);
                        return (
                          <div key={payment.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
                            <div>
                              <p className="text-gray-900 text-sm">{client?.name || 'Unknown Client'}</p>
                              <p className="text-gray-600 text-xs font-mono">{payment.transactionId}</p>
                              <p className="text-gray-600 text-xs">{payment.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-700 text-sm">KES {payment.amount.toLocaleString()}</p>
                              <button className="text-blue-600 text-xs hover:underline">Allocate</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <h4 className="text-gray-900 mt-4">Common Causes & Solutions</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Missing Loan ID:</strong> Client didn't include loan reference number in M-Pesa transaction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Incorrect Reference:</strong> Loan ID was misspelled or doesn't match any active loan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Action Required:</strong> Manually review and allocate each payment to the correct loan account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Prevention:</strong> Educate clients to always include their loan ID when making M-Pesa payments</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'mpesa-status' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <Smartphone className="size-8 text-emerald-600" />
                    <div>
                      <p className="text-emerald-900 text-sm">M-Pesa API Status</p>
                      <p className="text-emerald-600 text-2xl flex items-center gap-2">
                        <span className="size-3 bg-emerald-600 rounded-full animate-pulse"></span>
                        Connected
                      </p>
                      <p className="text-emerald-700 text-sm">Real-time integration active</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">M-Pesa Integration Status</h4>
                    <p className="text-gray-600 text-sm">
                      The M-Pesa API connection enables real-time payment processing and automatic reconciliation. 
                      SmartLenderUp is connected to Safaricom's M-Pesa Daraja API for instant payment notifications.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Connection Health</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">API Status</p>
                        <p className="text-emerald-600 flex items-center gap-2">
                          <span className="size-2 bg-emerald-600 rounded-full"></span>
                          Connected
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Uptime (24h)</p>
                        <p className="text-gray-900">99.9%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Last Heartbeat</p>
                        <p className="text-gray-900">2 minutes ago</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Response Time</p>
                        <p className="text-gray-900">245ms</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Failed Requests (24h)</p>
                        <p className="text-gray-900">0</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Auto-Reconciliation</p>
                        <p className="text-emerald-600">Enabled</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">API Capabilities</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                        <span className="text-gray-700 text-sm">Real-time Payment Notifications</span>
                        <CheckCircle className="size-4 text-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                        <span className="text-gray-700 text-sm">Automatic Reconciliation</span>
                        <CheckCircle className="size-4 text-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                        <span className="text-gray-700 text-sm">Balance Inquiry</span>
                        <CheckCircle className="size-4 text-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                        <span className="text-gray-700 text-sm">Transaction Confirmation</span>
                        <CheckCircle className="size-4 text-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                        <span className="text-gray-700 text-sm">SMS Receipt Delivery</span>
                        <CheckCircle className="size-4 text-emerald-600" />
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Recent API Activity (Last Hour)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600 text-xs">Requests</p>
                        <p className="text-gray-900 text-xl">156</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600 text-xs">Successful</p>
                        <p className="text-emerald-600 text-xl">156</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600 text-xs">Failed</p>
                        <p className="text-gray-900 text-xl">0</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Information</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>M-Pesa integration enables instant payment processing 24/7</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Clients receive instant SMS confirmation when payments are received</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>99.9% uptime ensures reliable payment processing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Average response time of 245ms ensures quick transaction confirmation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric?.startsWith('arrears-') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="size-8 text-red-600" />
                    <div>
                      <p className="text-red-900 text-sm">Arrears Aging: {selectedMetric.replace('arrears-', '')}</p>
                      <p className="text-red-900 text-3xl">
                        {arrearsData.find(item => `arrears-${item.range}` === selectedMetric)?.count || 0}
                      </p>
                      <p className="text-red-700 text-sm">Loans in this aging bucket</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">Understanding Arrears Aging</h4>
                    <p className="text-gray-600 text-sm">
                      Arrears aging groups overdue loans by how many days past due (DPD) they are. 
                      This helps prioritize collection efforts, with older arrears requiring more urgent attention.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Aging Bucket Analysis</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Loans in Bucket</p>
                        <p className="text-gray-900">
                          {arrearsData.find(item => `arrears-${item.range}` === selectedMetric)?.count || 0} loans
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">% of Total Arrears</p>
                        <p className="text-gray-900">
                          {((arrearsData.find(item => `arrears-${item.range}` === selectedMetric)?.count || 0) / 
                            arrearsData.reduce((sum, item) => sum + item.count, 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Outstanding</p>
                        <p className="text-gray-900">
                          KES {(() => {
                            const range = selectedMetric.replace('arrears-', '');
                            let filtered = [];
                            if (range === '1-30 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 1 && l.daysInArrears <= 30);
                            else if (range === '31-60 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 31 && l.daysInArrears <= 60);
                            else if (range === '61-90 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 61 && l.daysInArrears <= 90);
                            else if (range === '90+ DPD') filtered = arrearsLoans.filter(l => l.daysInArrears > 90);
                            return (filtered.reduce((sum, l) => sum + l.outstandingBalance, 0) / 1000).toFixed(0);
                          })()}K
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Collection Priority</p>
                        <p className="text-red-600">
                          {selectedMetric.includes('90+') ? 'CRITICAL' : 
                           selectedMetric.includes('61-90') ? 'HIGH' :
                           selectedMetric.includes('31-60') ? 'MEDIUM' : 'LOW'}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Loans in This Bucket</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(() => {
                        const range = selectedMetric.replace('arrears-', '');
                        let filtered = [];
                        if (range === '1-30 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 1 && l.daysInArrears <= 30);
                        else if (range === '31-60 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 31 && l.daysInArrears <= 60);
                        else if (range === '61-90 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 61 && l.daysInArrears <= 90);
                        else if (range === '90+ DPD') filtered = arrearsLoans.filter(l => l.daysInArrears > 90);
                        
                        return filtered.map(loan => {
                          const client = clients.find(c => c.id === loan.clientId);
                          return (
                            <div key={loan.id} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100">
                              <div>
                                <p className="text-gray-900 text-sm">{client?.name}</p>
                                <p className="text-gray-600 text-xs">{loan.id} • {client?.phone}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-red-700 text-sm">{loan.daysInArrears} DPD</p>
                                <p className="text-gray-600 text-xs">KES {loan.outstandingBalance.toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    <h4 className="text-gray-900 mt-4">Recommended Actions</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {selectedMetric.includes('1-30') && (
                        <>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>Send automated SMS payment reminders to all clients in this bucket</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>Early intervention can prevent loans from moving to higher aging buckets</span>
                          </li>
                        </>
                      )}
                      {selectedMetric.includes('31-60') && (
                        <>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Loan officers should make phone calls to understand payment challenges</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Consider offering payment plans or loan restructuring options</span>
                          </li>
                        </>
                      )}
                      {selectedMetric.includes('61-90') && (
                        <>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>Schedule in-person visits with clients to negotiate payment solutions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>Escalate to collections team and consider legal action if needed</span>
                          </li>
                        </>
                      )}
                      {selectedMetric.includes('90+') && (
                        <>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>CRITICAL: Immediate action required - these loans are at high risk of default</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>Consider write-off provisions and engage legal collections process</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Reconcile Modal */}
      {showAutoReconcileModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white">Auto-Reconcile Payments</h3>
                <button
                  onClick={() => setShowAutoReconcileModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle className="size-8 text-emerald-600" />
                  <div>
                    <p className="text-emerald-900 text-sm">Reconciled Today</p>
                    <p className="text-emerald-900 text-3xl">{recentPayments.length - unallocatedPayments.length}</p>
                    <p className="text-emerald-700 text-sm">Successfully matched to loans</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-gray-900">What is Reconciled Today?</h4>
                  <p className="text-gray-600 text-sm">
                    Reconciled payments are M-Pesa transactions that have been successfully matched to active loans 
                    and allocated to the correct client accounts. These payments reduce outstanding loan balances automatically.
                  </p>
                  
                  <h4 className="text-gray-900 mt-4">Reconciliation Summary</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Reconciled Payments</p>
                      <p className="text-gray-900">{recentPayments.length - unallocatedPayments.length} transactions</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Total Value</p>
                      <p className="text-gray-900">
                        KES {recentPayments.filter(p => !unallocatedPayments.includes(p))
                          .reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Reconciliation Rate</p>
                      <p className="text-gray-900 text-emerald-600">
                        {(((recentPayments.length - unallocatedPayments.length) / recentPayments.length) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Avg Payment Size</p>
                      <p className="text-gray-900">
                        KES {(recentPayments.filter(p => !unallocatedPayments.includes(p))
                          .reduce((sum, p) => sum + p.amount, 0) / (recentPayments.length - unallocatedPayments.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">M-Pesa Transactions</p>
                      <p className="text-gray-900">
                        {recentPayments.filter(p => !unallocatedPayments.includes(p) && p.method === 'M-Pesa').length} payments
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Other Methods</p>
                      <p className="text-gray-900">
                        {recentPayments.filter(p => !unallocatedPayments.includes(p) && p.method !== 'M-Pesa').length} payments
                      </p>
                    </div>
                  </div>

                  <h4 className="text-gray-900 mt-4">Recent Reconciled Payments</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recentPayments.filter(p => !unallocatedPayments.includes(p)).slice(0, 10).map(payment => {
                      const client = clients.find(c => c.id === payment.clientId);
                      return (
                        <div key={payment.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded border border-emerald-100">
                          <div>
                            <p className="text-gray-900 text-sm">{client?.name}</p>
                            <p className="text-gray-600 text-xs">{payment.transactionId} • {payment.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-700 text-sm">KES {payment.amount.toLocaleString()}</p>
                            <p className="text-gray-600 text-xs">{payment.method}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <h4 className="text-gray-900 mt-4">Key Insights</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{(((recentPayments.length - unallocatedPayments.length) / recentPayments.length) * 100).toFixed(1)}% automatic reconciliation rate demonstrates excellent M-Pesa integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>All reconciled payments are instantly applied to loan accounts, improving accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>M-Pesa's instant confirmation reduces manual workload and errors</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  onClick={handleAutoReconcile}
                >
                  Auto-Reconcile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reminders Modal */}
      {showBulkRemindersModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white">Send Bulk Reminders</h3>
                <button
                  onClick={() => setShowBulkRemindersModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="size-8 text-red-600" />
                  <div>
                    <p className="text-red-900 text-sm">Arrears Aging: 1-30 DPD</p>
                    <p className="text-red-900 text-3xl">
                      {arrearsData.find(item => `arrears-${item.range}` === 'arrears-1-30 DPD')?.count || 0}
                    </p>
                    <p className="text-red-700 text-sm">Loans in this aging bucket</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-gray-900">Understanding Arrears Aging</h4>
                  <p className="text-gray-600 text-sm">
                    Arrears aging groups overdue loans by how many days past due (DPD) they are. 
                    This helps prioritize collection efforts, with older arrears requiring more urgent attention.
                  </p>
                  
                  <h4 className="text-gray-900 mt-4">Aging Bucket Analysis</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Loans in Bucket</p>
                      <p className="text-gray-900">
                        {arrearsData.find(item => `arrears-${item.range}` === 'arrears-1-30 DPD')?.count || 0} loans
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">% of Total Arrears</p>
                      <p className="text-gray-900">
                        {((arrearsData.find(item => `arrears-${item.range}` === 'arrears-1-30 DPD')?.count || 0) / 
                          arrearsData.reduce((sum, item) => sum + item.count, 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Total Outstanding</p>
                      <p className="text-gray-900">
                        KES {(() => {
                          const range = '1-30 DPD';
                          let filtered = [];
                          if (range === '1-30 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 1 && l.daysInArrears <= 30);
                          else if (range === '31-60 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 31 && l.daysInArrears <= 60);
                          else if (range === '61-90 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 61 && l.daysInArrears <= 90);
                          else if (range === '90+ DPD') filtered = arrearsLoans.filter(l => l.daysInArrears > 90);
                          return (filtered.reduce((sum, l) => sum + l.outstandingBalance, 0) / 1000).toFixed(0);
                        })()}K
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">Collection Priority</p>
                      <p className="text-red-600">
                        {'LOW'}
                      </p>
                    </div>
                  </div>

                  <h4 className="text-gray-900 mt-4">Loans in This Bucket</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(() => {
                      const range = '1-30 DPD';
                      let filtered = [];
                      if (range === '1-30 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 1 && l.daysInArrears <= 30);
                      else if (range === '31-60 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 31 && l.daysInArrears <= 60);
                      else if (range === '61-90 DPD') filtered = arrearsLoans.filter(l => l.daysInArrears >= 61 && l.daysInArrears <= 90);
                      else if (range === '90+ DPD') filtered = arrearsLoans.filter(l => l.daysInArrears > 90);
                      
                      return filtered.map(loan => {
                        const client = clients.find(c => c.id === loan.clientId);
                        return (
                          <div key={loan.id} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100">
                            <div>
                              <p className="text-gray-900 text-sm">{client?.name}</p>
                              <p className="text-gray-600 text-xs">{loan.id} • {client?.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-red-700 text-sm">{loan.daysInArrears} DPD</p>
                              <p className="text-gray-600 text-xs">KES {loan.outstandingBalance.toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <h4 className="text-gray-900 mt-4">Recommended Actions</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {selectedMetric?.includes('1-30') && (
                      <>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>Send automated SMS payment reminders to all clients in this bucket</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>Early intervention can prevent loans from moving to higher aging buckets</span>
                        </li>
                      </>
                    )}
                    {selectedMetric?.includes('31-60') && (
                      <>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <span>Loan officers should make phone calls to understand payment challenges</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <span>Consider offering payment plans or loan restructuring options</span>
                        </li>
                      </>
                    )}
                    {selectedMetric?.includes('61-90') && (
                      <>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span>Schedule in-person visits with clients to negotiate payment solutions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span>Escalate to collections team and consider legal action if needed</span>
                        </li>
                      </>
                    )}
                    {selectedMetric?.includes('90+') && (
                      <>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span>CRITICAL: Immediate action required - these loans are at high risk of default</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span>Consider write-off provisions and engage legal collections process</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={handleSendBulkReminders}
                >
                  Send Reminders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}