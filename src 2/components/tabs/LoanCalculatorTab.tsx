import { Calculator, TrendingUp, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getCurrencySymbol, formatCurrency } from '../../utils/currencyUtils';

export function LoanCalculatorTab() {
  const { isDark } = useTheme();
  const { loanProducts } = useData();
  const currencySymbol = getCurrencySymbol();
  const [amount, setAmount] = useState<string>('0');
  const [product, setProduct] = useState<string>('');
  const [tenor, setTenor] = useState<string>('0');
  const [showSchedule, setShowSchedule] = useState(false);

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

  return (
    <div className={`p-6 space-y-6 transition-colors ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator className="size-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h2 className="text-gray-900 dark:text-white text-[20px]">Loan Calculator</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Calculate loan repayments and view amortization schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className={`p-6 rounded-lg shadow-sm border space-y-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Loan Details</h4>
          
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan Product</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
            >
              <option value="">Select a loan product</option>
              {loanProducts.length === 0 && (
                <option value="" disabled>No loan products available</option>
              )}
              {loanProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Loan Amount ({currencySymbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              min="0"
              max={selectedProduct?.maxAmount}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Max: {currencySymbol} {selectedProduct?.maxAmount.toLocaleString()}
            </p>
          </div>

          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Tenor (Months)
            </label>
            <input
              type="number"
              value={tenor}
              onChange={(e) => setTenor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              min="0"
              max={selectedProduct?.maxTenor}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Max: {selectedProduct?.maxTenor || 24} months
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            {selectedProduct ? (
              <>
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Interest Rate:</strong> {selectedProduct.interestRate}% p.a.
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Interest Type:</strong> {selectedProduct.interestType}
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Repayment:</strong> {selectedProduct.repaymentFrequency}
                </p>
              </>
            ) : (
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Select a loan product to view details
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className={`p-6 rounded-lg shadow-sm border space-y-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Calculation Results</h4>
          
          {result && (
            <>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">Monthly Payment</p>
                <p className="text-3xl text-blue-900 dark:text-blue-100">
                  {currencySymbol} {result.monthlyPayment.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Principal Amount</p>
                  <p className="text-gray-900 dark:text-white">{currencySymbol} {Number(amount).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Interest</p>
                  <p className="text-gray-900 dark:text-white">{currencySymbol} {result.totalInterest.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Repayment</p>
                  <p className="text-gray-900 dark:text-white">{currencySymbol} {result.totalRepayment.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Loan Duration</p>
                  <p className="text-gray-900 dark:text-white">{tenor} months</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-gray-900 dark:text-white mb-3">Repayment Schedule</h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
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
    </div>
  );
}