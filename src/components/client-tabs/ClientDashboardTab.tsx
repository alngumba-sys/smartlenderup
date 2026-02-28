import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock,
  FileText,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CurrencyDisplay } from '../CurrencyDisplay';
import { logAuditTrail } from '../../utils/auditLogger';

interface ClientDashboardTabProps {
  clientId: string;
}

interface LoanSummary {
  loan_number: string;
  product_name: string;
  principal_amount: number;
  outstanding_balance: number;
  total_repayable: number;
  interest_rate: number;
  disbursement_date: string;
  maturity_date: string;
  status: string;
  days_in_arrears: number;
  next_payment_date: string;
  next_payment_amount: number;
  repayment_frequency: string;
  currency: string;
}

interface PaymentSummary {
  total_paid: number;
  principal_paid: number;
  interest_paid: number;
  last_payment_date: string | null;
  last_payment_amount: number;
}

export function ClientDashboardTab({ clientId }: ClientDashboardTabProps) {
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [client, setClient] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('KES');

  useEffect(() => {
    fetchDashboardData();
    
    // Log dashboard view for audit trail
    logAuditTrail({
      user_id: clientId,
      user_type: 'client',
      action: 'VIEW_DASHBOARD',
      resource_type: 'profile',
      details: { view_timestamp: new Date().toISOString() }
    });
  }, [clientId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*, organizations(currency)')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);
      setCurrency(clientData.organizations?.currency || 'KES');

      // Fetch active loans
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('client_id', clientId)
        .in('status', ['Active', 'In Arrears'])
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
          currency,
          next_payment_date: calculateNextPaymentDate(loan),
          next_payment_amount: calculateNextPaymentAmount({
            ...loan,
            principal_amount: principal,
            outstanding_balance: balance,
            total_repayable: total,
            term: term
          })
        };
      }) || [];

      setLoans(formattedLoans);

      // Fetch payment summary
      const { data: paymentsData } = await supabase
        .from('repayments')
        .select('amount, principal_component, interest_component, payment_date')
        .eq('client_id', clientId)
        .order('payment_date', { ascending: false });

      if (paymentsData && paymentsData.length > 0) {
        const totalPaid = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
        const principalPaid = paymentsData.reduce((sum, p) => sum + (p.principal_component || 0), 0);
        const interestPaid = paymentsData.reduce((sum, p) => sum + (p.interest_component || 0), 0);

        setPayments({
          total_paid: totalPaid,
          principal_paid: principalPaid,
          interest_paid: interestPaid,
          last_payment_date: paymentsData[0].payment_date,
          last_payment_amount: paymentsData[0].amount
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPaymentDate = (loan: any): string => {
    // Calculate based on repayment frequency
    const disbursementDate = new Date(loan.disbursement_date);
    const today = new Date();
    
    let daysToAdd = 30; // Default monthly
    if (loan.repayment_frequency === 'Weekly') daysToAdd = 7;
    else if (loan.repayment_frequency === 'Bi-Weekly') daysToAdd = 14;
    else if (loan.repayment_frequency === 'Daily') daysToAdd = 1;
    else if (loan.repayment_frequency === 'Quarterly') daysToAdd = 90;

    const nextDate = new Date(disbursementDate);
    while (nextDate < today) {
      nextDate.setDate(nextDate.getDate() + daysToAdd);
    }

    return nextDate.toISOString().split('T')[0];
  };

  const calculateNextPaymentAmount = (loan: any): number => {
    // Simple calculation - can be enhanced with actual schedule
    const term = loan.repayment_frequency === 'Weekly' ? 52 : 
                 loan.repayment_frequency === 'Daily' ? 365 : 12;
    return Math.round(loan.total_repayable / term);
  };

  const calculateProgress = (loan: LoanSummary): number => {
    const paid = loan.principal_amount - loan.outstanding_balance;
    return Math.round((paid / loan.principal_amount) * 100);
  };

  const getStatusBadge = (status: string, daysInArrears: number) => {
    if (daysInArrears > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-200">
          <AlertTriangle className="size-4" />
          {daysInArrears} Days Overdue
        </span>
      );
    }
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
          <CheckCircle2 className="size-4" />
          Current
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
        <Clock className="size-4" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Unable to load client information.</p>
        </div>
      </div>
    );
  }

  const activeLoan = loans[0]; // Primary active loan

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#FFF5E1] min-h-full">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 lg:p-8 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">NEW PORTAL</div>
        </div>
        <h1 className="text-white text-2xl lg:text-3xl mb-2">
          Welcome back, {client.name?.split(' ')[0] || 'Client'}!
        </h1>
        <p className="text-emerald-50 text-lg">
          Here's your loan portfolio overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="size-6 text-blue-600" />
            </div>
            <span className="text-gray-600 text-sm">Total Outstanding</span>
          </div>
          <p className="text-2xl lg:text-3xl text-[#111120] font-semibold">
            <CurrencyDisplay amount={loans.reduce((sum, l) => sum + l.outstanding_balance, 0)} currency={currency} />
          </p>
        </div>

        {/* Active Loans */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <FileText className="size-6 text-emerald-600" />
            </div>
            <span className="text-gray-600 text-sm">Active Loans</span>
          </div>
          <p className="text-2xl lg:text-3xl text-[#111120] font-semibold">
            {loans.length}
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="size-6 text-green-600" />
            </div>
            <span className="text-gray-600 text-sm">Total Paid</span>
          </div>
          <p className="text-2xl lg:text-3xl text-[#111120] font-semibold">
            <CurrencyDisplay amount={payments?.total_paid || 0} currency={currency} />
          </p>
        </div>

        {/* Next Payment */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Calendar className="size-6 text-orange-600" />
            </div>
            <span className="text-gray-600 text-sm">Next Payment</span>
          </div>
          <p className="text-2xl lg:text-3xl text-[#111120] font-semibold">
            {activeLoan ? (
              <CurrencyDisplay amount={activeLoan.next_payment_amount} currency={currency} />
            ) : (
              'N/A'
            )}
          </p>
          {activeLoan && (
            <p className="text-sm text-gray-600 mt-1">
              Due: {new Date(activeLoan.next_payment_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Primary Loan Overview */}
      {activeLoan && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-[#111120] text-xl mb-2">Primary Loan Account</h2>
                <p className="text-gray-600">Loan #{activeLoan.loan_number}</p>
              </div>
              {getStatusBadge(activeLoan.status, activeLoan.days_in_arrears)}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Loan Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Loan Product</p>
                <p className="text-[#111120] font-medium">{activeLoan.product_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Original Amount</p>
                <p className="text-[#111120] font-medium">
                  <CurrencyDisplay amount={activeLoan.principal_amount} currency={currency} />
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Current Balance</p>
                <p className="text-[#111120] font-medium text-lg">
                  <CurrencyDisplay amount={activeLoan.outstanding_balance} currency={currency} />
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Repayable</p>
                <p className="text-[#111120] font-medium">
                  <CurrencyDisplay amount={activeLoan.total_repayable} currency={currency} />
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Interest Rate</p>
                <p className="text-[#111120] font-medium">{activeLoan.interest_rate}% monthly</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Repayment Frequency</p>
                <p className="text-[#111120] font-medium">{activeLoan.repayment_frequency}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Disbursement Date</p>
                <p className="text-[#111120] font-medium">
                  {new Date(activeLoan.disbursement_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Maturity Date</p>
                <p className="text-[#111120] font-medium">
                  {new Date(activeLoan.maturity_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Payment Method</p>
                <p className="text-[#111120] font-medium">M-Pesa</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">Repayment Progress</span>
                <span className="text-[#111120] font-semibold">{calculateProgress(activeLoan)}% Complete</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${calculateProgress(activeLoan)}%` }}
                />
              </div>
            </div>

            {/* Next Payment Alert */}
            {activeLoan.days_in_arrears === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Calendar className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-900 font-medium mb-1">Next Payment Due</p>
                    <p className="text-blue-800 text-sm">
                      <CurrencyDisplay amount={activeLoan.next_payment_amount} currency={currency} /> due on{' '}
                      {new Date(activeLoan.next_payment_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Overdue Alert */}
            {activeLoan.days_in_arrears > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-900 font-medium mb-1">Payment Overdue</p>
                    <p className="text-red-800 text-sm">
                      Your payment is {activeLoan.days_in_arrears} days overdue. Please make a payment as soon as possible to avoid late fees.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Active Loans */}
      {loans.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-[#111120] text-xl">All Active Loans</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Loan Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Next Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.loan_number} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#111120]">
                      {loan.loan_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {loan.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#111120] font-medium">
                      <CurrencyDisplay amount={loan.outstanding_balance} currency={currency} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(loan.status, loan.days_in_arrears)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(loan.next_payment_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Active Loans */}
      {loans.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <CreditCard className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-[#111120] mb-2">No Active Loans</h3>
          <p className="text-gray-600 mb-6">You don't have any active loans at the moment.</p>
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Apply for a New Loan
          </button>
        </div>
      )}

      {/* Last Payment Info */}
      {payments && payments.last_payment_date && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-[#111120] text-lg mb-4">Last Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Payment Date</p>
              <p className="text-[#111120] font-medium">
                {new Date(payments.last_payment_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Amount Paid</p>
              <p className="text-[#111120] font-medium">
                <CurrencyDisplay amount={payments.last_payment_amount} currency={currency} />
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Principal Component</p>
              <p className="text-[#111120] font-medium">
                <CurrencyDisplay amount={payments.principal_paid} currency={currency} />
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Interest Component</p>
              <p className="text-[#111120] font-medium">
                <CurrencyDisplay amount={payments.interest_paid} currency={currency} />
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}