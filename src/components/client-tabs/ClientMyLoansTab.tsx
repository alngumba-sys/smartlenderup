import { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CurrencyDisplay } from '../CurrencyDisplay';

interface ClientMyLoansTabProps {
  clientId: string;
}

interface Loan {
  id: string;
  loan_number: string;
  principal_amount: number;
  outstanding_balance: number;
  total_repayable: number;
  interest_rate: number;
  disbursement_date: string;
  maturity_date: string;
  status: string;
  days_in_arrears: number;
  repayment_frequency: string;
  product_name: string;
  term: number;
  currency: string;
}

interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  principal_component: number;
  interest_component: number;
  payment_method: string;
  transaction_id: string;
  status: string;
}

interface AmortizationEntry {
  installment: number;
  due_date: string;
  payment_amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Late Paid';
}

export function ClientMyLoansTab({ clientId }: ClientMyLoansTabProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'payments' | 'schedule' | 'fees' | 'documents'>('details');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amortization, setAmortization] = useState<AmortizationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('KES');

  useEffect(() => {
    fetchLoans();
  }, [clientId]);

  useEffect(() => {
    if (selectedLoan) {
      fetchLoanDetails(selectedLoan);
    }
  }, [selectedLoan]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      // Fetch all loans for this client
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('client_id', clientId)
        .order('disbursement_date', { ascending: false });

      if (loansError) {
        console.error('Error fetching loans:', loansError);
        throw loansError;
      }

      const formattedLoans = loansData?.map((loan: any) => {
        // Handle different column name variations
        const principal = loan.principal_amount || loan.principalAmount || loan.amount || 0;
        const balance = loan.outstanding_balance || loan.outstandingBalance || loan.balance || 0;
        const rate = loan.interest_rate || loan.interestRate || loan.rate || 0;
        const term = loan.term || loan.loan_term_months || loan.loanTerm || 0;
        
        // Calculate total_repayable using formula: Interest = Principal × Rate × Term / 100
        const interest = (principal * rate * term) / 100;
        const total = principal + interest;
        
        return {
          ...loan,
          // Map to standard names
          principal_amount: principal,
          outstanding_balance: balance,
          total_repayable: total,
          interest_rate: rate,
          term: term,
          product_name: loan.loan_products?.name || 'N/A',
          currency
        };
      }) || [];

      setLoans(formattedLoans);
      setCurrency(formattedLoans[0]?.currency || 'KES');
      
      if (formattedLoans.length > 0 && !selectedLoan) {
        setSelectedLoan(formattedLoans[0].id);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanDetails = async (loanId: string) => {
    try {
      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('repayments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Generate amortization schedule
      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        const schedule = generateAmortizationSchedule(loan, paymentsData || []);
        setAmortization(schedule);
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    }
  };

  const generateAmortizationSchedule = (loan: Loan, payments: Payment[]): AmortizationEntry[] => {
    const schedule: AmortizationEntry[] = [];
    const numberOfInstallments = loan.term;
    const installmentAmount = Math.round(loan.total_repayable / numberOfInstallments);
    const principalPerInstallment = Math.round(loan.principal_amount / numberOfInstallments);
    const interestPerInstallment = Math.round((loan.total_repayable - loan.principal_amount) / numberOfInstallments);

    let remainingBalance = loan.principal_amount;
    const disbursementDate = new Date(loan.disbursement_date);

    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(disbursementDate);
      
      // Calculate due date based on frequency
      if (loan.repayment_frequency === 'Weekly') {
        dueDate.setDate(dueDate.getDate() + (i * 7));
      } else if (loan.repayment_frequency === 'Bi-Weekly') {
        dueDate.setDate(dueDate.getDate() + (i * 14));
      } else if (loan.repayment_frequency === 'Monthly') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else if (loan.repayment_frequency === 'Daily') {
        dueDate.setDate(dueDate.getDate() + i);
      } else if (loan.repayment_frequency === 'Quarterly') {
        dueDate.setMonth(dueDate.getMonth() + (i * 3));
      }

      remainingBalance = Math.max(0, remainingBalance - principalPerInstallment);

      // Check payment status
      const payment = payments.find((p, idx) => idx === i);
      const today = new Date();
      const isPaid = !!payment;
      const isOverdue = !isPaid && dueDate < today;
      const isPending = !isPaid && dueDate >= today;
      const isLatePaid = isPaid && payment && new Date(payment.payment_date) > dueDate;

      schedule.push({
        installment: i + 1,
        due_date: dueDate.toISOString().split('T')[0],
        payment_amount: installmentAmount,
        principal: principalPerInstallment,
        interest: interestPerInstallment,
        balance: remainingBalance,
        status: isPaid ? (isLatePaid ? 'Late Paid' : 'Paid') : (isOverdue ? 'Overdue' : 'Pending')
      });
    }

    return schedule;
  };

  const calculateInterestBreakdown = (loan: Loan) => {
    const totalInterest = loan.total_repayable - loan.principal_amount;
    const paidPayments = payments.reduce((sum, p) => sum + (p.interest_component || 0), 0);
    const remainingInterest = totalInterest - paidPayments;

    return {
      total: totalInterest,
      paid: paidPayments,
      remaining: remainingInterest,
      rate: loan.interest_rate
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      'Paid': { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      'Pending': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
      'Overdue': { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle },
      'Late Paid': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${config.color}`}>
        <Icon className="size-3" />
        {status}
      </span>
    );
  };

  const currentLoan = loans.find(l => l.id === selectedLoan);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your loans...</p>
        </div>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <FileText className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-[#111120] mb-2">No Loans Found</h3>
          <p className="text-gray-600">You don't have any loan records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#FFF5E1] min-h-full">
      {/* Loan Selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-[#111120] text-xl mb-4">Your Loans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => (
            <button
              key={loan.id}
              onClick={() => setSelectedLoan(loan.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedLoan === loan.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-600">Loan #{loan.loan_number}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  loan.status === 'Active' ? 'bg-green-100 text-green-700' :
                  loan.status === 'Paid' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {loan.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{loan.product_name}</p>
              <p className="text-lg text-[#111120] font-semibold">
                <CurrencyDisplay amount={loan.outstanding_balance} currency={currency} />
              </p>
              <p className="text-xs text-gray-500 mt-1">Outstanding Balance</p>
            </button>
          ))}
        </div>
      </div>

      {/* Loan Details */}
      {currentLoan && (
        <>
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {[
                  { id: 'details', label: 'Loan Details' },
                  { id: 'payments', label: 'Payment History' },
                  { id: 'schedule', label: 'Repayment Schedule' },
                  { id: 'fees', label: 'Interest & Fees' },
                  { id: 'documents', label: 'Documents' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[#111120] text-lg mb-4">Loan Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Loan Account Number</p>
                        <p className="text-[#111120] font-semibold">{currentLoan.loan_number}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Loan Product</p>
                        <p className="text-[#111120] font-semibold">{currentLoan.product_name}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Loan Status</p>
                        <p className="text-[#111120] font-semibold">{currentLoan.status}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-700 text-sm mb-1">Original Loan Amount</p>
                        <p className="text-blue-900 font-semibold text-lg">
                          <CurrencyDisplay amount={currentLoan.principal_amount} currency={currency} />
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-orange-700 text-sm mb-1">Current Outstanding Balance</p>
                        <p className="text-orange-900 font-semibold text-lg">
                          <CurrencyDisplay amount={currentLoan.outstanding_balance} currency={currency} />
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-red-700 text-sm mb-1">Total Amount Owed</p>
                        <p className="text-red-900 font-semibold text-lg">
                          <CurrencyDisplay amount={currentLoan.total_repayable} currency={currency} />
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Interest Rate</p>
                        <p className="text-[#111120] font-semibold">{currentLoan.interest_rate}% monthly</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Loan Start Date</p>
                        <p className="text-[#111120] font-semibold">
                          {new Date(currentLoan.disbursement_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Maturity Date</p>
                        <p className="text-[#111120] font-semibold">
                          {new Date(currentLoan.maturity_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Repayment Frequency</p>
                        <p className="text-[#111120] font-semibold">{currentLoan.repayment_frequency}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Number of Installments</p>
                        <p className="text-[#111120] font-semibold">{currentLoan.term}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Payment Method</p>
                        <p className="text-[#111120] font-semibold">M-Pesa</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                    <h4 className="text-[#111120] font-medium mb-4">Repayment Progress</h4>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Amount Paid</span>
                        <span className="text-[#111120] font-semibold">
                          {Math.round(((currentLoan.principal_amount - currentLoan.outstanding_balance) / currentLoan.principal_amount) * 100)}% Complete
                        </span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden border border-emerald-200">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                          style={{ 
                            width: `${((currentLoan.principal_amount - currentLoan.outstanding_balance) / currentLoan.principal_amount) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="text-lg text-emerald-700 font-semibold">
                          <CurrencyDisplay 
                            amount={currentLoan.principal_amount - currentLoan.outstanding_balance} 
                            currency={currency} 
                          />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="text-lg text-orange-700 font-semibold">
                          <CurrencyDisplay amount={currentLoan.outstanding_balance} currency={currency} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment History Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[#111120] text-lg">Payment History</h3>
                    <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                      <Download className="size-4" />
                      Export CSV
                    </button>
                  </div>

                  {payments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="size-12 mx-auto mb-3 text-gray-300" />
                      <p>No payments recorded yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Principal</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Interest</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Method</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Transaction ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-[#111120]">
                                <CurrencyDisplay amount={payment.amount} currency={currency} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <CurrencyDisplay amount={payment.principal_component || 0} currency={currency} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <CurrencyDisplay amount={payment.interest_component || 0} currency={currency} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{payment.payment_method || 'M-Pesa'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 font-mono">{payment.transaction_id || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm">
                                {getStatusBadge(payment.status || 'Paid')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Repayment Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[#111120] text-lg">Amortization Schedule</h3>
                    <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                      <Download className="size-4" />
                      Download Schedule
                    </button>
                  </div>

                  {amortization.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Calendar className="size-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No amortization schedule available</p>
                      <p className="text-sm text-gray-500 mt-1">Schedule will be generated once the loan is disbursed</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Due Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Payment</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Principal</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Interest</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Balance</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {amortization.map((entry) => (
                            <tr key={entry.installment} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{entry.installment}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(entry.due_date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-[#111120]">
                                <CurrencyDisplay amount={entry.payment_amount} currency={currency} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <CurrencyDisplay amount={entry.principal} currency={currency} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <CurrencyDisplay amount={entry.interest} currency={currency} />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <CurrencyDisplay amount={entry.balance} currency={currency} />
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {getStatusBadge(entry.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Interest & Fees Tab */}
              {activeTab === 'fees' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[#111120] text-lg mb-4">Interest Breakdown</h3>
                    {(() => {
                      const interestData = calculateInterestBreakdown(currentLoan);
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-blue-700 text-sm mb-2">Interest Rate</p>
                            <p className="text-blue-900 text-2xl font-semibold">{interestData.rate}%</p>
                            <p className="text-blue-600 text-xs mt-1">Monthly Flat Rate</p>
                          </div>
                          <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-orange-700 text-sm mb-2">Total Interest</p>
                            <p className="text-orange-900 text-2xl font-semibold">
                              <CurrencyDisplay amount={interestData.total} currency={currency} />
                            </p>
                            <p className="text-orange-600 text-xs mt-1">Lifetime Interest</p>
                          </div>
                          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-green-700 text-sm mb-2">Interest Paid</p>
                            <p className="text-green-900 text-2xl font-semibold">
                              <CurrencyDisplay amount={interestData.paid} currency={currency} />
                            </p>
                            <p className="text-green-600 text-xs mt-1">To Date</p>
                          </div>
                          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-red-700 text-sm mb-2">Interest Remaining</p>
                            <p className="text-red-900 text-2xl font-semibold">
                              <CurrencyDisplay amount={interestData.remaining} currency={currency} />
                            </p>
                            <p className="text-red-600 text-xs mt-1">Still Owed</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-[#111120] font-medium mb-3">Interest Calculation Formula</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Formula:</strong> Interest = Principal × Rate × Term / 100</p>
                      <p><strong>Calculation:</strong> {currentLoan.principal_amount.toLocaleString()} × {currentLoan.interest_rate}% × {currentLoan.term} / 100 = {(currentLoan.total_repayable - currentLoan.principal_amount).toLocaleString()}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        * This loan uses a flat interest rate model, where interest is calculated on the original principal amount throughout the loan term.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#111120] text-lg mb-4">Fees & Charges</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fee Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date Charged</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">Processing Fee</td>
                            <td className="px-4 py-3 text-sm text-[#111120] font-medium">
                              <CurrencyDisplay amount={0} currency={currency} />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(currentLoan.disbursement_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Paid</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-[#111120] text-lg mb-4">Loan Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Loan Agreement', type: 'PDF', date: currentLoan.disbursement_date, size: '245 KB' },
                      { name: 'Payment Schedule', type: 'PDF', date: currentLoan.disbursement_date, size: '128 KB' },
                      { name: 'Terms & Conditions', type: 'PDF', date: currentLoan.disbursement_date, size: '89 KB' }
                    ].map((doc, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-100 rounded-lg">
                            <FileText className="size-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[#111120] font-medium mb-1">{doc.name}</h4>
                            <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Added: {new Date(doc.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-white rounded-lg transition-colors" title="View">
                              <Eye className="size-4 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Download">
                              <Download className="size-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> All documents are securely stored and encrypted. You can download copies for your records at any time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}