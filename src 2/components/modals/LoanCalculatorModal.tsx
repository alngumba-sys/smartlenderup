import { X, Calculator, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface LoanCalculatorModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export function LoanCalculatorModal({ isOpen = true, onClose }: LoanCalculatorModalProps) {
  const { isDark } = useTheme();
  const { loanProducts } = useData();
  const currencyCode = getCurrencyCode();
  
  const [amount, setAmount] = useState<string>('');
  const [product, setProduct] = useState<string>('');
  const [tenor, setTenor] = useState<string>('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Set default product when loan products load
  useEffect(() => {
    if (loanProducts.length > 0 && !product) {
      setProduct(loanProducts[0].id);
    }
  }, [loanProducts, product]);

  const selectedProduct = loanProducts.find(p => p.id === product);
  
  // Calculate loan details
  const calculateLoan = () => {
    if (!selectedProduct) return null;

    const amountNum = Number(amount);
    const tenorNum = Number(tenor);

    if (amountNum <= 0 || tenorNum <= 0) return null;

    const rate = selectedProduct.interestRate / 100;
    let totalInterest = 0;
    let monthlyPayment = 0;
    
    if (selectedProduct.interestType === 'Flat') {
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

  const result = calculateLoan();

  // Generate amortization schedule
  const generateSchedule = () => {
    if (!selectedProduct || !result) return [];
    
    const amountNum = Number(amount);
    const tenorNum = Number(tenor);
    
    const schedule = [];
    let balance = amountNum;
    const monthlyPayment = result.monthlyPayment;
    
    if (selectedProduct.interestType === 'Flat') {
      const monthlyPrincipal = amountNum / tenorNum;
      const monthlyInterest = result.totalInterest / tenorNum;
      
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
      const monthlyRate = selectedProduct.interestRate / 100 / 12;
      
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
  const amountNum = Number(amount);
  const tenorNum = Number(tenor);

  const handleApplyClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmApply = () => {
    // Handle the loan application submission here
    alert('Loan application submitted successfully!');
    setShowConfirmation(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calculator className="size-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white text-[24px]">Loan Calculator</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          {loanProducts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="size-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h4 className="text-gray-900 dark:text-white mb-2">No Loan Products Available</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please create loan products in Admin → Loan Products before using the calculator.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                  <h4 className="text-gray-900 dark:text-white">Loan Details</h4>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Loan Product</label>
                    <select
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    >
                      {loanProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Loan Amount ({currencyCode})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm"
                      min="1000"
                      max={selectedProduct?.maxAmount}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Max: {currencyCode} {selectedProduct?.maxAmount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Tenor (Months)
                    </label>
                    <input
                      type="number"
                      value={tenor}
                      onChange={(e) => setTenor(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm"
                      min="1"
                      max="24"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      <strong>Interest Rate:</strong> {selectedProduct?.interestRate}% p.a.
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      <strong>Interest Type:</strong> {selectedProduct?.interestType}
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      <strong>Repayment:</strong> {selectedProduct?.repaymentFrequency}
                    </p>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                  <h4 className="text-gray-900 dark:text-white">Calculation Results</h4>
                  
                  {result && (
                    <>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">Monthly Payment</p>
                        <p className="text-3xl text-blue-900 dark:text-blue-100">
                          {currencyCode} {result.monthlyPayment.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Principal Amount</p>
                          <p className="text-gray-900 dark:text-white">{currencyCode} {amountNum.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Total Interest</p>
                          <p className="text-gray-900 dark:text-white">{currencyCode} {result.totalInterest.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Total Repayment</p>
                          <p className="text-gray-900 dark:text-white">{currencyCode} {result.totalRepayment.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Loan Duration</p>
                          <p className="text-gray-900 dark:text-white">{tenorNum} months</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowSchedule(!showSchedule)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
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
                <div className="mt-6">
                  <h4 className="text-gray-900 dark:text-white mb-3">Repayment Schedule</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Month</th>
                            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Payment</th>
                            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Principal</th>
                            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Interest</th>
                            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedule.map((row) => (
                            <tr key={row.month} className="border-t border-gray-200 dark:border-gray-700">
                              <td className="px-4 py-2 text-gray-900 dark:text-white">{row.month}</td>
                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                {row.payment.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                {row.principal.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                {row.interest.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                {row.balance.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={handleApplyClick}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Apply for This Loan
                </button>
              </div>

              {/* Confirmation Modal */}
              {showConfirmation && result && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="size-6 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-gray-900 dark:text-white text-[20px]">Confirm Loan Application</h3>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Please review the loan details below and confirm if you want to proceed with this application.
                    </p>

                    {/* High-Level Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 p-4 mb-4">
                      <h4 className="text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                        Loan Application Summary
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Product</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Loan Amount</p>
                          <p className="text-gray-900 dark:text-white">{currencyCode} {amountNum.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Loan Duration</p>
                          <p className="text-gray-900 dark:text-white">{tenorNum} months</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Interest Rate</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct?.interestRate}% ({selectedProduct?.interestType})</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-300 dark:border-gray-600 mt-4 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 dark:text-gray-300">Monthly Payment:</span>
                          <span className="text-blue-900 dark:text-blue-300 text-xl">{currencyCode} {result.monthlyPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 dark:text-gray-300">Total Interest:</span>
                          <span className="text-gray-900 dark:text-white">{currencyCode} {result.totalInterest.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">Total Repayment:</span>
                          <span className="text-gray-900 dark:text-white">{currencyCode} {result.totalRepayment.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                      <p className="text-amber-900 dark:text-amber-300 text-sm">
                        <strong>Important:</strong> By confirming, you agree to make {tenorNum} monthly payments of {currencyCode} {result.monthlyPayment.toLocaleString()} 
                        each until the loan is fully repaid. This is a binding commitment.
                      </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmApply}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                      >
                        <Check className="size-4" />
                        Yes, Apply for This Loan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}