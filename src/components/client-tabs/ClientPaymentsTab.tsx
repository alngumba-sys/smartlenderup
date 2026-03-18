import { useState, useEffect } from 'react';
import {
  Smartphone,
  Building2,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CurrencyDisplay } from '../CurrencyDisplay';
import { toast } from 'sonner';

interface ClientPaymentsTabProps {
  clientId: string;
}

interface Loan {
  id: string;
  loan_number: string;
  product_name: string;
  outstanding_balance: number;
  total_repayable: number;
  next_payment_amount: number;
  next_payment_date: string;
  minimum_payment: number;
}

export function ClientPaymentsTab({ clientId }: ClientPaymentsTabProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'bank'>('mpesa');
  const [paymentType, setPaymentType] = useState<'minimum' | 'full' | 'custom'>('minimum');
  const [customAmount, setCustomAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('KES');

  useEffect(() => {
    fetchActiveLoans();
  }, [clientId]);

  const fetchActiveLoans = async () => {
    try {
      // Fetch active loans
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('client_id', clientId)
        .in('status', ['Active', 'In Arrears'])
        .order('disbursement_date', { ascending: false });

      if (loansError) throw loansError;

      const formattedLoans = loansData?.map((loan: any) => {
        // Handle different column name variations
        const principal = loan.principal_amount || loan.principalAmount || loan.amount || 0;
        const balance = loan.outstanding_balance || loan.outstandingBalance || loan.balance || 0;
        const rate = loan.interest_rate || loan.interestRate || loan.rate || 0;
        const term = loan.term || loan.loan_term_months || loan.loanTerm || 0;
        
        // Calculate values
        const interest = (principal * rate * term) / 100;
        const total = principal + interest;
        const installmentAmount = Math.round(total / term);
        const minimumPayment = Math.round(installmentAmount * 0.5); // 50% of installment

        return {
          id: loan.id,
          loan_number: loan.loan_number,
          product_name: loan.loan_products?.name || 'N/A',
          outstanding_balance: balance,
          total_repayable: total,
          next_payment_amount: installmentAmount,
          minimum_payment: minimumPayment,
          currency
        };
      }) || [];

      setLoans(formattedLoans);
      setCurrency(loansData?.[0]?.organizations?.currency || 'KES');
      
      if (formattedLoans.length > 0) {
        setSelectedLoan(formattedLoans[0].id);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loans');
    }
  };

  const handlePayment = async () => {
    if (!selectedLoan) {
      toast.error('Please select a loan to pay');
      return;
    }

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }

    const loan = loans.find(l => l.id === selectedLoan);
    if (!loan) return;

    let paymentAmount = 0;
    if (paymentType === 'minimum') {
      paymentAmount = loan.minimum_payment;
    } else if (paymentType === 'full') {
      paymentAmount = loan.outstanding_balance;
    } else {
      paymentAmount = parseFloat(customAmount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        toast.error('Please enter a valid payment amount');
        return;
      }
    }

    setLoading(true);

    try {
      // In a real implementation, this would:
      // 1. Initiate M-Pesa STK push or generate bank payment reference
      // 2. Wait for payment confirmation
      // 3. Record payment in database

      // For now, we'll simulate the payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Payment initiated successfully! You will receive a prompt on your phone.');
      
      // Reset form
      setPaymentType('minimum');
      setCustomAmount('');
      setPhoneNumber('');
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentLoan = loans.find(l => l.id === selectedLoan);

  const getPaymentAmount = () => {
    if (!currentLoan) return 0;
    
    if (paymentType === 'minimum') return currentLoan.minimum_payment;
    if (paymentType === 'full') return currentLoan.outstanding_balance;
    return parseFloat(customAmount) || 0;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#FFF5E1] min-h-full">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-[#111120] text-2xl mb-2">Make a Payment</h1>
        <p className="text-gray-600">Choose your loan and payment method to get started</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Loan */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-[#111120] text-lg mb-4">Select Loan Account</h2>
            
            {loans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No active loans available for payment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <label
                    key={loan.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLoan === loan.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="loan"
                      value={loan.id}
                      checked={selectedLoan === loan.id}
                      onChange={(e) => setSelectedLoan(e.target.value)}
                      className="size-4 text-emerald-600 mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[#111120] font-medium">{loan.product_name}</p>
                          <p className="text-sm text-gray-600">Loan #{loan.loan_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Outstanding</p>
                          <p className="text-lg text-[#111120] font-semibold">
                            <CurrencyDisplay amount={loan.outstanding_balance} currency={currency} />
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Next Payment: <CurrencyDisplay amount={loan.next_payment_amount} currency={currency} /></span>
                        <span>Due: {new Date(loan.next_payment_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Amount */}
          {currentLoan && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[#111120] text-lg mb-4">Payment Amount</h2>
              
              <div className="space-y-3 mb-6">
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentType === 'minimum'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="amount"
                    value="minimum"
                    checked={paymentType === 'minimum'}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="size-4 text-emerald-600 mr-4"
                  />
                  <div className="flex-1">
                    <p className="text-[#111120] font-medium">Minimum Payment</p>
                    <p className="text-2xl text-emerald-600 font-semibold mt-1">
                      <CurrencyDisplay amount={currentLoan.minimum_payment} currency={currency} />
                    </p>
                  </div>
                </label>

                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentType === 'full'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="amount"
                    value="full"
                    checked={paymentType === 'full'}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="size-4 text-emerald-600 mr-4"
                  />
                  <div className="flex-1">
                    <p className="text-[#111120] font-medium">Pay Full Balance (Early Payoff)</p>
                    <p className="text-2xl text-blue-600 font-semibold mt-1">
                      <CurrencyDisplay amount={currentLoan.outstanding_balance} currency={currency} />
                    </p>
                  </div>
                </label>

                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentType === 'custom'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="amount"
                    value="custom"
                    checked={paymentType === 'custom'}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="size-4 text-emerald-600 mr-4"
                  />
                  <div className="flex-1">
                    <p className="text-[#111120] font-medium mb-2">Custom Amount</p>
                    {paymentType === 'custom' && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                          {currency}
                        </span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          onFocus={(e) => {
                            if (e.target.value === '0' || e.target.value === '0.00') e.target.value = '';
                            e.target.select();
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '') setCustomAmount('0');
                          }}
                          placeholder="Enter amount"
                          className="flex-1 px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {paymentType === 'custom' && customAmount && parseFloat(customAmount) < currentLoan.minimum_payment && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="size-5 text-orange-600 flex-shrink-0" />
                  <p className="text-sm text-orange-900">
                    Amount is below minimum payment of <CurrencyDisplay amount={currentLoan.minimum_payment} currency={currency} />
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          {currentLoan && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[#111120] text-lg mb-4">Payment Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="size-8 text-emerald-600 mx-auto mb-3" />
                  <p className="text-[#111120] font-medium text-center">M-Pesa</p>
                  <p className="text-sm text-gray-600 text-center mt-1">Pay via mobile money</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="size-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-[#111120] font-medium text-center">Bank Deposit</p>
                  <p className="text-sm text-gray-600 text-center mt-1">Pay via bank transfer</p>
                </button>
              </div>

              {/* M-Pesa Details */}
              {paymentMethod === 'mpesa' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">How M-Pesa Payment Works:</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-800">
                          <li>Enter your M-Pesa phone number above</li>
                          <li>Click "Make Payment" button</li>
                          <li>You'll receive an STK push on your phone</li>
                          <li>Enter your M-Pesa PIN to complete</li>
                          <li>Payment confirmation will be sent via SMS</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {paymentMethod === 'bank' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-[#111120] font-medium mb-4">Bank Account Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="text-[#111120] font-medium">Equity Bank Kenya</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="text-[#111120] font-medium">BV Funguo Ltd</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="text-[#111120] font-medium font-mono">1234567890</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Reference:</span>
                      <span className="text-[#111120] font-medium font-mono">{currentLoan.loan_number}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-900">
                      <strong>Important:</strong> Please use your loan number as the payment reference to ensure proper allocation.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !currentLoan || (paymentMethod === 'mpesa' && !phoneNumber)}
                className="w-full mt-6 px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5" />
                    Make Payment
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Payment Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-[#111120] text-lg mb-4">Payment Summary</h2>
            
            {currentLoan ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Loan Account</p>
                  <p className="text-[#111120] font-medium">{currentLoan.loan_number}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="text-[#111120] font-medium capitalize">{paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Deposit'}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
                  <p className="text-2xl text-[#111120] font-semibold">
                    <CurrencyDisplay amount={getPaymentAmount()} currency={currency} />
                  </p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">New Balance After Payment</p>
                  <p className="text-lg text-emerald-600 font-semibold">
                    <CurrencyDisplay 
                      amount={Math.max(0, currentLoan.outstanding_balance - getPaymentAmount())} 
                      currency={currency} 
                    />
                  </p>
                </div>

                {getPaymentAmount() >= currentLoan.outstanding_balance && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                      <div className="text-sm text-green-900">
                        <p className="font-medium mb-1">Loan Payoff</p>
                        <p>This payment will settle your loan in full.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Select a loan to view summary</p>
            )}
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-[#111120] font-medium mb-4">Payment History</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}