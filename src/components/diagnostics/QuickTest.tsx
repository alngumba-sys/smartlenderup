import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function QuickTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testDataFetch = async () => {
    setLoading(true);
    try {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('loan_number, principal_amount, amount, status')
        .limit(5);

      if (error) throw error;

      console.log('Test results:', loans);
      setResults(loans);

      const hasValidAmounts = loans.every((l: any) => (l.principal_amount || 0) > 0);
      
      if (hasValidAmounts) {
        toast.success('✅ All loans have valid principal amounts!');
      } else {
        toast.warning('⚠️ Some loans still have principal_amount = 0');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Quick Data Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test if principal amounts are being read correctly from the database
      </p>
      
      <button
        onClick={testDataFetch}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">Sample Results:</h4>
          {results.map((loan: any, idx: number) => (
            <div key={idx} className="text-xs font-mono bg-gray-50 p-2 rounded flex items-start gap-2">
              {(loan.principal_amount || 0) > 0 ? (
                <CheckCircle className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{loan.loan_number}</p>
                <p className="text-gray-600">
                  principal_amount: {loan.principal_amount || 'NULL'} | 
                  amount: {loan.amount || 'NULL'} | 
                  status: {loan.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
