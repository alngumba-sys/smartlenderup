import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function DatabaseInspector() {
  const [loading, setLoading] = useState(false);
  const [sampleLoans, setSampleLoans] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [amountColumns, setAmountColumns] = useState<string[]>([]);

  const inspectDatabase = async () => {
    setLoading(true);
    try {
      // Fetch first 5 loans with ALL columns
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .limit(5);

      if (error) throw error;

      if (loans && loans.length > 0) {
        setSampleLoans(loans);
        
        // Get all column names from first loan
        const allColumns = Object.keys(loans[0]);
        setColumns(allColumns);

        // Find columns that might contain loan amounts
        const potentialAmountColumns = allColumns.filter(col => {
          const lowerCol = col.toLowerCase();
          return lowerCol.includes('amount') || 
                 lowerCol.includes('principal') || 
                 lowerCol.includes('loan') ||
                 lowerCol.includes('balance') ||
                 lowerCol.includes('repay') ||
                 lowerCol.includes('total');
        });
        setAmountColumns(potentialAmountColumns);

        console.log('All columns:', allColumns);
        console.log('Amount-related columns:', potentialAmountColumns);
        console.log('Sample loan data:', loans);

        toast.success('Database inspection complete');
      } else {
        toast.error('No loans found in database');
      }
    } catch (error) {
      console.error('Error inspecting database:', error);
      toast.error('Failed to inspect database');
    } finally {
      setLoading(false);
    }
  };

  const copyAmountToPrincipal = async (sourceColumn: string) => {
    if (!sourceColumn) {
      toast.error('Please select a source column');
      return;
    }

    const confirmMsg = `This will copy all values from "${sourceColumn}" to "principal_amount" for ALL loans. This cannot be undone easily. Continue?`;
    if (!confirm(confirmMsg)) {
      return;
    }

    setLoading(true);
    try {
      // Get all loans
      const { data: allLoans, error: fetchError } = await supabase
        .from('loans')
        .select('id, loan_number, ' + sourceColumn);

      if (fetchError) throw fetchError;

      let successCount = 0;
      let errorCount = 0;

      // Update each loan
      for (const loan of allLoans) {
        try {
          const sourceValue = loan[sourceColumn];
          
          const { error: updateError } = await supabase
            .from('loans')
            .update({ 
              principal_amount: sourceValue,
              updated_at: new Date().toISOString()
            })
            .eq('id', loan.id);

          if (updateError) throw updateError;
          successCount++;
        } catch (error) {
          console.error(`Error updating loan ${loan.loan_number}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} loan(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} loan(s)`);
      }

      // Re-inspect to show updated data
      await inspectDatabase();
    } catch (error) {
      console.error('Error copying amounts:', error);
      toast.error('Failed to copy amounts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-[#111120] flex items-center gap-2">
          <Database className="size-6" />
          Database Column Inspector
        </h2>
        <p className="text-gray-600 mt-1">
          Inspect the loans table structure to find where loan amounts are stored
        </p>
      </div>

      {/* Scan Button */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={inspectDatabase}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Search className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Inspecting...' : 'Inspect Database Structure'}
        </button>
      </div>

      {/* Results */}
      {columns.length > 0 && (
        <>
          {/* Amount Columns Found */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="size-5" />
              Amount-Related Columns Found ({amountColumns.length})
            </h3>
            <div className="space-y-2">
              {amountColumns.map(col => (
                <div key={col} className="bg-white rounded p-3 border border-blue-200">
                  <p className="font-mono text-sm text-blue-900 font-semibold mb-2">{col}</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p className="font-semibold mb-1">Sample values:</p>
                    {sampleLoans.slice(0, 3).map((loan, idx) => (
                      <p key={idx} className="font-mono">
                        Loan {loan.loan_number || loan.id?.slice(0, 8)}: {
                          loan[col] !== null && loan[col] !== undefined 
                            ? typeof loan[col] === 'number' 
                              ? loan[col].toLocaleString()
                              : String(loan[col])
                            : 'NULL'
                        }
                      </p>
                    ))}
                  </div>
                  
                  {/* Copy Button */}
                  {col !== 'principal_amount' && (
                    <button
                      onClick={() => copyAmountToPrincipal(col)}
                      disabled={loading}
                      className="mt-3 px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs disabled:opacity-50"
                    >
                      Copy "{col}" → "principal_amount" for ALL loans
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* All Columns */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              All Columns in Loans Table ({columns.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.map(col => (
                <div
                  key={col}
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    amountColumns.includes(col)
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* Sample Data */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Sample Loan Records (First 5)</h3>
            <pre className="text-xs font-mono text-gray-700 bg-gray-50 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(sampleLoans, null, 2)}
            </pre>
          </div>
        </>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">How to Fix the Issue</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>Click "Inspect Database Structure" to see all columns</li>
              <li>Look for columns with actual loan amount values (not NULL or 0)</li>
              <li>If you find a column with the correct amounts, click the "Copy" button next to it</li>
              <li>This will copy all values from that column to principal_amount</li>
              <li>After copying, refresh the Loans page to verify the data is correct</li>
              <li>Then re-run the Diagnostic tool to verify everything is working</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}