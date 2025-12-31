import { useState } from 'react';
import { FileText, CheckCircle, Upload, AlertCircle, Calculator, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { loanProducts } from '../../data/dummyData';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';

interface ClientApplyTabProps {
  clientId: string;
}

export function ClientApplyTab({ clientId }: ClientApplyTabProps) {
  const { addLoan, clients } = useData();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [desiredTenor, setDesiredTenor] = useState('');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  
  // Calculator states
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcAmount, setCalcAmount] = useState<string>('0');
  const [calcProduct, setCalcProduct] = useState<string>('PROD-001');
  const [calcTenor, setCalcTenor] = useState<string>('0');
  const [showSchedule, setShowSchedule] = useState(false);

  const client = clients.find(c => c.id === clientId);
  const product = loanProducts.find(p => p.id === selectedProduct);
  const calcSelectedProduct = loanProducts.find(p => p.id === calcProduct);
  
  // Calculate loan details for calculator
  const calculateLoan = () => {
    if (!calcSelectedProduct) return null;

    const amountNum = Number(calcAmount);
    const tenorNum = Number(calcTenor);

    if (amountNum <= 0 || tenorNum <= 0) return null;

    const rate = calcSelectedProduct.interestRate / 100;
    let totalInterest = 0;
    let monthlyPayment = 0;
    
    if (calcSelectedProduct.interestType === 'Flat') {
      totalInterest = amountNum * rate;
      monthlyPayment = (amountNum + totalInterest) / tenorNum;
    } else {
      // Reducing Balance
      const monthlyRate = rate / 12;
      monthlyPayment = (amountNum * monthlyRate * Math.pow(1 + monthlyRate, tenorNum)) / 
                       (Math.pow(1 + monthlyRate, tenorNum) - 1);
      totalInterest = (monthlyPayment * tenorNum) - amountNum;
    }

    const totalRepayment = amountNum + totalInterest;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalRepayment: Math.round(totalRepayment)
    };
  };

  const calcResult = calculateLoan();

  // Generate amortization schedule
  const generateSchedule = () => {
    if (!calcSelectedProduct || !calcResult) return [];
    
    const amountNum = Number(calcAmount);
    const tenorNum = Number(calcTenor);
    
    const schedule = [];
    let balance = amountNum;
    const monthlyPayment = calcResult.monthlyPayment;
    
    if (calcSelectedProduct.interestType === 'Flat') {
      const monthlyPrincipal = amountNum / tenorNum;
      const monthlyInterest = calcResult.totalInterest / tenorNum;
      
      for (let i = 1; i <= tenorNum; i++) {
        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal: Math.round(monthlyPrincipal),
          interest: Math.round(monthlyInterest),
          balance: Math.round(balance - monthlyPrincipal)
        });
        balance -= monthlyPrincipal;
      }
    } else {
      // Reducing Balance
      const monthlyRate = calcSelectedProduct.interestRate / 100 / 12;
      
      for (let i = 1; i <= tenorNum; i++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        balance -= principal;
        
        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal: Math.round(principal),
          interest: Math.round(interest),
          balance: Math.round(Math.max(0, balance))
        });
      }
    }
    
    return schedule;
  };

  const schedule = generateSchedule();

  if (!client) return <div className="p-6">Client not found</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && product && requestedAmount && loanPurpose && desiredTenor) {
      // Calculate loan details
      const principalAmount = parseFloat(requestedAmount);
      const interestRate = product.interestRate;
      const term = parseInt(desiredTenor);
      
      // Calculate total interest and repayable amount
      let totalInterest = 0;
      let installmentAmount = 0;
      const numberOfInstallments = term;
      
      if (product.interestType === 'Flat') {
        totalInterest = principalAmount * (interestRate / 100);
        installmentAmount = (principalAmount + totalInterest) / numberOfInstallments;
      } else {
        // Reducing Balance
        const monthlyRate = (interestRate / 100) / 12;
        installmentAmount = (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfInstallments)) / 
                           (Math.pow(1 + monthlyRate, numberOfInstallments) - 1);
        totalInterest = (installmentAmount * numberOfInstallments) - principalAmount;
      }
      
      const totalRepayable = principalAmount + totalInterest;
      
      // Calculate dates
      const disbursementDate = new Date().toISOString().split('T')[0];
      const firstRepaymentDate = new Date();
      firstRepaymentDate.setMonth(firstRepaymentDate.getMonth() + 1);
      
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + term);
      
      // Create complete loan object
      const completeLoan = {
        clientId: client.id,
        clientName: client.name,
        productId: selectedProduct,
        productName: product.name,
        principalAmount: principalAmount,
        interestRate: interestRate,
        interestType: product.interestType,
        term: term,
        termUnit: 'Months' as const,
        repaymentFrequency: product.repaymentFrequency,
        disbursementDate: disbursementDate,
        firstRepaymentDate: firstRepaymentDate.toISOString().split('T')[0],
        maturityDate: maturityDate.toISOString().split('T')[0],
        status: 'Pending' as const,
        collateral: [],
        guarantors: [],
        totalInterest: Math.round(totalInterest),
        totalRepayable: Math.round(totalRepayable),
        installmentAmount: Math.round(installmentAmount),
        numberOfInstallments: numberOfInstallments,
        paidAmount: 0,
        outstandingBalance: Math.round(totalRepayable),
        principalOutstanding: principalAmount,
        interestOutstanding: Math.round(totalInterest),
        daysInArrears: 0,
        arrearsAmount: 0,
        overdueAmount: 0,
        penaltyAmount: 0,
        purpose: loanPurpose,
        createdBy: client.name,
        loanOfficer: 'Assigned Loan Officer',
        notes: ''
      };
      
      // Save the loan
      await addLoan(completeLoan);
      
      // Show success message
      toast.success('Loan Application Submitted Successfully!', {
        description: `Your loan application for KES ${principalAmount.toLocaleString()} has been submitted for review.`,
        duration: 5000,
      });
      
      setApplicationSubmitted(true);
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  if (applicationSubmitted) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
          <h2 className="text-gray-900 mb-2">Application Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your loan application has been received and is being reviewed. 
            You will receive an SMS notification within 1-2 business days regarding the status.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
            <p className="text-blue-900 text-sm">
              <strong>Application Reference:</strong> APP-{Date.now().toString().slice(-6)}
            </p>
          </div>
          <button
            onClick={() => setApplicationSubmitted(false)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Apply for a Loan</h2>
        <p className="text-gray-600">Select a loan product and complete your application</p>
      </div>

      {/* Loan Calculator - Collapsible */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calculator className="size-6 text-blue-600" />
            <div className="text-left">
              <h3 className="text-gray-900">Loan Calculator</h3>
              <p className="text-gray-600 text-sm">Calculate your loan repayments before applying</p>
            </div>
          </div>
          {showCalculator ? (
            <ChevronUp className="size-5 text-gray-600" />
          ) : (
            <ChevronDown className="size-5 text-gray-600" />
          )}
        </button>

        {showCalculator && (
          <div className="border-t border-gray-200 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-4">
                <h4 className="text-gray-900">Loan Details</h4>
                
                <div>
                  <label className="block text-gray-700 mb-2">Loan Product</label>
                  <select
                    value={calcProduct}
                    onChange={(e) => setCalcProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {loanProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Loan Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1000"
                    max={calcSelectedProduct?.maxAmount}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Max: KES {calcSelectedProduct?.maxAmount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Tenor (Months)
                  </label>
                  <input
                    type="number"
                    value={calcTenor}
                    onChange={(e) => setCalcTenor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="24"
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="text-blue-900 mb-2">Product Information</h5>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-900">
                      <strong>Interest Rate:</strong> {calcSelectedProduct?.interestRate}% p.a.
                    </p>
                    <p className="text-blue-900">
                      <strong>Interest Type:</strong> {calcSelectedProduct?.interestType}
                    </p>
                    <p className="text-blue-900">
                      <strong>Repayment Frequency:</strong> {calcSelectedProduct?.repaymentFrequency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                <h4 className="text-gray-900">Calculation Results</h4>
                
                {calcResult && (
                  <>
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-800 mb-2">Monthly Payment</p>
                      <p className="text-4xl text-emerald-900">
                        KES {calcResult.monthlyPayment.toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Principal Amount</p>
                        <p className="text-gray-900 text-lg">KES {calcAmount.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                        <p className="text-gray-900 text-lg">KES {calcResult.totalInterest.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Repayment</p>
                        <p className="text-gray-900 text-lg">KES {calcResult.totalRepayment.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Loan Duration</p>
                        <p className="text-gray-900 text-lg">{calcTenor} months</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="size-4" />
                      {showSchedule ? 'Hide' : 'View'} Repayment Schedule
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Amortization Schedule */}
            {showSchedule && schedule.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-gray-900 mb-4">Repayment Schedule</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-700">Month</th>
                          <th className="px-4 py-3 text-right text-gray-700">Payment</th>
                          <th className="px-4 py-3 text-right text-gray-700">Principal</th>
                          <th className="px-4 py-3 text-right text-gray-700">Interest</th>
                          <th className="px-4 py-3 text-right text-gray-700">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((row) => (
                          <tr key={row.month} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900">{row.month}</td>
                            <td className="px-4 py-3 text-right text-gray-900">
                              KES {row.payment.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900">
                              KES {row.principal.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900">
                              KES {row.interest.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900">
                              KES {row.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Total Payments</p>
                      <p className="text-blue-900 text-lg">{schedule.length} months</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Total Amount Paid</p>
                      <p className="text-blue-900 text-lg">KES {calcResult?.totalRepayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Total Interest Paid</p>
                      <p className="text-blue-900 text-lg">KES {calcResult?.totalInterest.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Eligibility Check */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
        <h3 className="text-gray-900 mb-3">Your Eligibility Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Credit Score</p>
            <p className="text-emerald-900 text-2xl">{client.creditScore || 300}</p>
            <p className="text-emerald-700 text-sm">
              {client.creditScore >= 80 ? 'Excellent' : client.creditScore >= 60 ? 'Good' : 'Fair'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Eligible Amount</p>
            <p className="text-emerald-900 text-2xl">
              Up to KES {client.creditScore >= 80 ? '150K' : client.creditScore >= 60 ? '100K' : '50K'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Processing Time</p>
            <p className="text-emerald-900 text-2xl">1-2 days</p>
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-gray-900">Select Loan Product</h3>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loanProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedProduct === prod.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-gray-900">{prod.name}</h4>
                {selectedProduct === prod.id && (
                  <CheckCircle className="size-5 text-emerald-600" />
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3">{prod.description}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Amount:</span>
                  <span className="text-gray-900">KES {prod.maxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="text-gray-900">{prod.interestRate}% {prod.interestType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Repayment:</span>
                  <span className="text-gray-900">{prod.repaymentFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenor:</span>
                  <span className="text-gray-900">{prod.tenorMonths} months</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      {selectedProduct && product && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-gray-900">Application Details - {product.name}</h3>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            {/* Requested Amount */}
            <div>
              <label className="block text-gray-700 mb-2">
                Requested Loan Amount (KES) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                max={product.maxAmount}
                required
                placeholder={`Max: ${product.maxAmount.toLocaleString()}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-gray-600 text-sm mt-1">
                Maximum allowed: KES {product.maxAmount.toLocaleString()}
              </p>
            </div>

            {/* Loan Purpose */}
            <div>
              <label className="block text-gray-700 mb-2">
                Purpose of Loan <span className="text-red-600">*</span>
              </label>
              <textarea
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                required
                rows={3}
                placeholder="Please describe how you plan to use this loan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Desired Tenor */}
            <div>
              <label className="block text-gray-700 mb-2">
                Desired Repayment Period <span className="text-red-600">*</span>
              </label>
              <select
                value={desiredTenor}
                onChange={(e) => setDesiredTenor(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select period...</option>
                <option value={product.tenorMonths.toString()}>{product.tenorMonths} months (Standard)</option>
                {product.tenorMonths > 3 && (
                  <option value={(product.tenorMonths / 2).toString()}>{product.tenorMonths / 2} months</option>
                )}
              </select>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-gray-700 mb-2">
                Supporting Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                <Upload className="size-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 text-sm mb-1">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-xs">
                  Business permit, updated photos, or other relevant documents
                </p>
              </div>
            </div>

            {/* Loan Calculator */}
            {requestedAmount && desiredTenor && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-blue-900 mb-3">Estimated Repayment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Loan Amount:</span>
                    <span className="text-blue-900">KES {parseFloat(requestedAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Interest ({product.interestRate}% {product.interestType}):</span>
                    <span className="text-blue-900">
                      KES {Math.round(parseFloat(requestedAmount) * (product.interestRate / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="text-blue-900">Total Repayment:</span>
                    <span className="text-blue-900">
                      KES {Math.round(parseFloat(requestedAmount) * (1 + product.interestRate / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-900">
                      {product.repaymentFrequency} Installment:
                    </span>
                    <span className="text-blue-900 text-lg">
                      KES {Math.round(
                        (parseFloat(requestedAmount) * (1 + product.interestRate / 100)) /
                        (parseInt(desiredTenor) / (product.repaymentFrequency === 'Monthly' ? 1 : 3))
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1"
                  id="terms"
                />
                <label htmlFor="terms" className="text-gray-700 text-sm">
                  I confirm that the information provided is accurate and I agree to the{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700">terms and conditions</a>{' '}
                  of SmartLenderUp. I understand that this loan will be subject to approval and 
                  the terms specified in the loan agreement.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!requestedAmount || !loanPurpose || !desiredTenor}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FileText className="size-5" />
              Submit Application
            </button>
          </div>
        </form>
      )}

      {/* Help Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-600 text-sm mb-2">
              If you have questions about the application process or need assistance, please contact:
            </p>
            <div className="text-sm space-y-1">
              <p className="text-gray-900">Helpline: <strong>0800 123 456</strong></p>
              <p className="text-gray-900">Email: <strong>support@abcmicrofinance.co.ke</strong></p>
              <p className="text-gray-900">Your Loan Officer: <strong>{client.branch} Branch</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}