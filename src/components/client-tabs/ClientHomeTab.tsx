import { CheckCircle, AlertTriangle, DollarSign, Smartphone, TrendingUp, Bell } from 'lucide-react';
import { loanProducts } from '../../data/dummyData';
import { useData } from '../../contexts/DataContext';

interface ClientHomeTabProps {
  clientId: string;
}

export function ClientHomeTab({ clientId }: ClientHomeTabProps) {
  const { clients, loans, payments } = useData();
  const client = clients.find(c => c.id === clientId);
  const clientLoans = loans.filter(l => l.clientId === clientId && l.status !== 'Fully Paid');
  const activeLoan = clientLoans[0];
  const product = activeLoan ? loanProducts.find(p => p.id === activeLoan.productId) : null;

  if (!client) return <div className="p-6">Client not found</div>;

  // Calculate next payment details
  const getNextPayment = () => {
    if (!activeLoan || !product) return null;
    
    const totalAmount = activeLoan.principalAmount * (1 + product.interestRate / 100);
    const numInstallments = product.tenorMonths / (product.repaymentFrequency === 'Monthly' ? 1 : 3);
    const installmentAmount = Math.round(totalAmount / numInstallments);
    
    const disbursementDate = new Date(activeLoan.disbursementDate);
    const monthsToAdd = product.repaymentFrequency === 'Monthly' ? 1 : 3;
    
    // Calculate which installment we're on
    const clientPayments = payments.filter(p => p.loanId === activeLoan.id);
    const nextInstallment = clientPayments.length + 1;
    
    const nextDate = new Date(disbursementDate);
    nextDate.setMonth(nextDate.getMonth() + (nextInstallment - 1) * monthsToAdd);
    
    return {
      amount: installmentAmount,
      date: nextDate.toISOString().split('T')[0],
      installmentNumber: nextInstallment
    };
  };

  const nextPayment = getNextPayment();
  const savingsBalance = 25000; // Mock savings balance

  const getStatusIcon = () => {
    if (client.status === 'Good Standing') {
      return <CheckCircle className="size-8 text-emerald-600" />;
    } else if (client.status === 'In Arrears') {
      return <AlertTriangle className="size-8 text-red-600" />;
    } else {
      return <CheckCircle className="size-8 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    if (client.status === 'Good Standing') return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    if (client.status === 'In Arrears') return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-6 md:p-8 rounded-lg">
        <h2 className="text-white mb-2">Welcome back, {client.name.split(' ')[0]}!</h2>
        <p className="text-emerald-50">Here&apos;s your account overview</p>
      </div>

      {/* Status Widget */}
      <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm opacity-80">Account Status</p>
            <p className="text-2xl">{client.status}</p>
          </div>
        </div>
      </div>

      {/* Outstanding Loan Summary */}
      {activeLoan && product ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 mb-4">Active Loan Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-5 text-blue-600" />
                <span className="text-blue-900 text-sm">Current Loan Balance</span>
              </div>
              <p className="text-blue-900 text-2xl">KES {activeLoan.outstandingBalance.toLocaleString()}</p>
              <p className="text-blue-700 text-sm mt-1">Loan: {activeLoan.id}</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="size-5 text-emerald-600" />
                <span className="text-emerald-900 text-sm">Next Payment Due</span>
              </div>
              {nextPayment && (
                <>
                  <p className="text-emerald-900 text-2xl">KES {nextPayment.amount.toLocaleString()}</p>
                  <p className="text-emerald-700 text-sm mt-1">Due: {nextPayment.date}</p>
                </>
              )}
            </div>
          </div>

          {activeLoan.daysInArrears === 0 ? (
            <button className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
              <Smartphone className="size-5" />
              Make Payment via M-Pesa
            </button>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="size-5" />
                <span>Payment Overdue</span>
              </div>
              <p className="text-red-700 text-sm mb-3">
                Your payment is {activeLoan.daysInArrears} days overdue. Please make a payment as soon as possible.
              </p>
              <button className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                <Smartphone className="size-5" />
                Pay Now via M-Pesa
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">You don&apos;t have any active loans</p>
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Apply for a Loan
          </button>
        </div>
      )}

      {/* Savings Balance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">My Savings</h3>
          <TrendingUp className="size-5 text-purple-600" />
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-purple-900 text-sm mb-1">Total Savings Balance</p>
          <p className="text-purple-900 text-3xl">KES {savingsBalance.toLocaleString()}</p>
          <p className="text-purple-700 text-sm mt-2">Interest Rate: 5% per annum</p>
        </div>
      </div>

      {/* Notifications & Alerts */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="size-5 text-gray-600" />
          <h3 className="text-gray-900">Notifications & Alerts</h3>
        </div>
        <div className="space-y-3">
          {activeLoan && nextPayment && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-900 text-sm">
                Payment reminder: Your next installment of KES {nextPayment.amount.toLocaleString()} is due on {nextPayment.date}
              </p>
              <p className="text-blue-700 text-xs mt-1">Sent 3 days ago</p>
            </div>
          )}
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-emerald-900 text-sm">
              Your loan application for {product?.name} was approved and disbursed successfully
            </p>
            <p className="text-emerald-700 text-xs mt-1">Sent {activeLoan?.disbursementDate}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-900 text-sm">
              Thank you for being a valued SmartLenderUp client! You&apos;re eligible for higher loan amounts.
            </p>
            <p className="text-gray-600 text-xs mt-1">Sent 2025-11-15</p>
          </div>
        </div>
      </div>

      {/* M-Pesa Payment Instructions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-gray-900 mb-4">How to Pay via M-Pesa</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>1. Go to M-Pesa menu on your phone</p>
          <p>2. Select Lipa na M-Pesa, then Paybill</p>
          <p>3. Enter Business Number: <strong className="text-emerald-700">400200</strong></p>
          <p>4. Enter Account Number: <strong className="text-emerald-700">{client.id}</strong></p>
          <p>5. Enter Amount: <strong className="text-emerald-700">KES {nextPayment?.amount.toLocaleString() || '0'}</strong></p>
          <p>6. Enter your M-Pesa PIN and confirm</p>
          <p className="pt-2 text-emerald-700">You will receive a confirmation SMS from M-Pesa</p>
        </div>
      </div>
    </div>
  );
}