import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Database, Wrench, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function LoanRecoveryTool() {
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [corruptedLoans, setCorruptedLoans] = useState<any[]>([]);

  const scanForCorruption = async () => {
    setLoading(true);
    try {
      // Fetch all loans and check for principal_amount = 0 or NULL
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('All loans raw data:', loans);

      // Find loans with corrupted principal
      const corrupted = loans.filter((loan: any) => {
        const principal = loan.principal_amount || loan.amount || 0;
        return principal === 0;
      });

      setCorruptedLoans(corrupted);
      
      if (corrupted.length > 0) {
        toast.error(`Found ${corrupted.length} loan(s) with principal_amount = 0`);
      } else {
        toast.success('No corrupted loans found');
      }
    } catch (error) {
      console.error('Error scanning loans:', error);
      toast.error('Failed to scan loans');
    } finally {
      setLoading(false);
    }
  };

  const resetAllToDisbursed = async () => {
    if (!confirm('This will reset ALL loans currently marked as "Paid" back to "Disbursed". Continue?')) {
      return;
    }

    setFixing(true);
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'Disbursed', updated_at: new Date().toISOString() })
        .eq('status', 'Paid');

      if (error) throw error;

      toast.success('All Paid loans reset to Disbursed');
    } catch (error) {
      console.error('Error resetting statuses:', error);
      toast.error('Failed to reset loan statuses');
    } finally {
      setFixing(false);
    }
  };

  const resetToActive = async () => {
    if (!confirm('This will reset ALL loans currently marked as "Paid" back to "Active". Continue?')) {
      return;
    }

    setFixing(true);
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'Active', updated_at: new Date().toISOString() })
        .eq('status', 'Paid');

      if (error) throw error;

      toast.success('All Paid loans reset to Active');
    } catch (error) {
      console.error('Error resetting statuses:', error);
      toast.error('Failed to reset loan statuses');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-[#111120] flex items-center gap-2">
          <Database className="size-6" />
          Loan Recovery Tool
        </h2>
        <p className="text-gray-600 mt-1">Emergency tool to recover incorrectly marked loans</p>
      </div>

      {/* Critical Warning */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Data Corruption Detected</h3>
            <p className="text-sm text-red-700 mb-3">
              All loans are showing "Amount borrowed = KES 0.00" which caused the diagnostic tool 
              to incorrectly mark them as Paid. This indicates either:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mb-4">
              <li>The <code className="bg-red-100 px-1 rounded">principal_amount</code> column is NULL or 0 in the database</li>
              <li>Column name mismatch between code and database schema</li>
              <li>Data migration issue that cleared principal amounts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Diagnostic Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-[#111120]">Step 1: Scan Database</h3>
        <p className="text-sm text-gray-600">
          First, scan the database to identify which loans have principal_amount = 0
        </p>
        <button
          onClick={scanForCorruption}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Scanning...' : 'Scan for Corrupted Data'}
        </button>

        {corruptedLoans.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 font-semibold mb-2">
              Found {corruptedLoans.length} loan(s) with principal_amount = 0:
            </p>
            <div className="text-xs text-yellow-700 space-y-1 max-h-40 overflow-auto">
              {corruptedLoans.slice(0, 10).map((loan) => (
                <div key={loan.id} className="font-mono">
                  {loan.loan_number || loan.id} - Status: {loan.status}
                </div>
              ))}
              {corruptedLoans.length > 10 && (
                <p className="text-yellow-600">...and {corruptedLoans.length - 10} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recovery Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-[#111120]">Step 2: Reset Loan Statuses</h3>
        <p className="text-sm text-gray-600 mb-3">
          Choose how to reset the incorrectly marked loans:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Option A: Reset to "Disbursed"</h4>
            <p className="text-sm text-gray-600 mb-3">
              Sets all currently "Paid" loans back to "Disbursed" status
            </p>
            <button
              onClick={resetAllToDisbursed}
              disabled={fixing}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wrench className="size-4" />
              {fixing ? 'Resetting...' : 'Reset to Disbursed'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Option B: Reset to "Active"</h4>
            <p className="text-sm text-gray-600 mb-3">
              Sets all currently "Paid" loans back to "Active" status
            </p>
            <button
              onClick={resetToActive}
              disabled={fixing}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wrench className="size-4" />
              {fixing ? 'Resetting...' : 'Reset to Active'}
            </button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Step 3: Fix Root Cause</h3>
        <p className="text-sm text-blue-700 mb-2">
          After resetting statuses, you need to fix the principal_amount data corruption:
        </p>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Check your Supabase database schema - verify the column name for loan principal</li>
          <li>If the column is named differently, update the code to use the correct name</li>
          <li>If data was lost, you may need to manually restore principal amounts from backups</li>
          <li>Re-run the diagnostic tool ONLY after principal amounts are restored</li>
        </ol>
      </div>
    </div>
  );
}