import { useData } from '../../contexts/DataContext';
import { CheckCircle, XCircle, Calculator } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currencyUtils';

export function LoanAmountTest() {
  const { loans } = useData();
  const currencySymbol = getCurrencySymbol();
  
  // Test loans to verify
  const testLoanNumbers = ['5276', '5344', '5224'];
  const testLoans = loans.filter(l => testLoanNumbers.includes(l.loanNumber || ''));
  
  // Expected values (from CSV)
  const expectedValues: Record<string, { principal: number; total: number }> = {
    '5276': { principal: 35000, total: 38500 },
    '5344': { principal: 33000, total: 36300 },
    '5224': { principal: 300000, total: 360000 }
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="size-6 text-blue-600" />
        <h3 className="font-bold text-lg">Loan Amount Verification Test</h3>
      </div>
      
      <div className="space-y-4">
        {testLoans.length === 0 && (
          <div className="text-red-600 flex items-center gap-2">
            <XCircle className="size-5" />
            <span>No test loans found. Looking for loans: {testLoanNumbers.join(', ')}</span>
          </div>
        )}
        
        {testLoans.map(loan => {
          const loanNum = loan.loanNumber || '';
          const expected = expectedValues[loanNum];
          if (!expected) return null;
          
          const actualPrincipal = loan.principalAmount || 0;
          const actualTotal = loan.totalRepayable || 0;
          
          const principalMatch = Math.abs(actualPrincipal - expected.principal) < 1;
          const totalMatch = Math.abs(actualTotal - expected.total) < 1;
          
          return (
            <div key={loan.id} className="border border-gray-200 rounded p-4">
              <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                Loan #{loanNum}
                {principalMatch && totalMatch ? (
                  <span className="text-green-600 flex items-center gap-1 text-sm">
                    <CheckCircle className="size-4" />
                    CORRECT
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1 text-sm">
                    <XCircle className="size-4" />
                    MISMATCH
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-600">Principal Amount:</div>
                  <div className={`flex items-center gap-2 ${principalMatch ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="font-mono">{currencySymbol} {actualPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {principalMatch ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expected: {currencySymbol} {expected.principal.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-600">Total Repayable:</div>
                  <div className={`flex items-center gap-2 ${totalMatch ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="font-mono">{currencySymbol} {actualTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {totalMatch ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expected: {currencySymbol} {expected.total.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                Rate: {loan.interestRate}% × Term: {loan.term} months = Interest: {currencySymbol} {((actualTotal - actualPrincipal)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="font-semibold text-blue-900 mb-2">✨ Calculation Formula:</div>
          <code className="text-blue-800">
            Principal = Total ÷ (1 + (Rate × Term / 100))
          </code>
          <div className="text-xs text-blue-700 mt-1">
            Example: 38,500 ÷ (1 + (7.5 × 1 / 100)) = 38,500 ÷ 1.075 = 35,813.95 ≈ 35,000
          </div>
        </div>
      </div>
    </div>
  );
}
