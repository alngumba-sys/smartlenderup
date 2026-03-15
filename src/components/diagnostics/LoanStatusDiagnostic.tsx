import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Wrench, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface LoanDiagnostic {
  id: string;
  loan_number: string;
  client_name: string;
  status: string;
  principal_amount: number;
  total_repayable: number;
  paid_amount: number;
  outstanding_balance: number;
  calculated_outstanding: number;
  repayment_count: number;
  should_be_paid: boolean;
  status_mismatch: boolean;
  disbursement_date: string;
}

export function LoanStatusDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<LoanDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'mismatch'>('all');
  const [fixing, setFixing] = useState(false);
  const [fixingLoanIds, setFixingLoanIds] = useState<Set<string>>(new Set());
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);

      // Fetch all loans with client info - using * to get all columns
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select(`
          *,
          clients (
            id,
            first_name,
            last_name,
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;
      
      console.log('Sample loan data:', loansData?.[0]); // Debug: see actual column names

      // SAFETY CHECK: Detect if most loans have principal = 0
      const loansWithZeroPrincipal = loansData.filter((loan: any) => {
        const principal = loan.principal_amount || loan.amount || 0;
        return principal === 0;
      });

      if (loansWithZeroPrincipal.length > loansData.length * 0.5) {
        toast.error(
          `⚠️ DATA CORRUPTION: ${loansWithZeroPrincipal.length}/${loansData.length} loans have principal = 0. Use Recovery Tool first!`,
          { duration: 10000 }
        );
        console.error('CRITICAL: Over 50% of loans have principal_amount = 0');
      }

      // Fetch repayments count for each loan
      const { data: repaymentsData, error: repaymentsError } = await supabase
        .from('repayments')
        .select('loan_id, amount');

      if (repaymentsError) throw repaymentsError;

      // Process each loan
      const diagnosticResults: LoanDiagnostic[] = loansData.map((loan: any) => {
        // Get client name
        const clientData = loan.clients;
        const client_name = clientData?.business_name || 
          `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim() || 
          'Unknown Client';

        // Extract loan values with flexible column name handling
        const principal = loan.principal_amount || loan.amount || 0;
        const rate = loan.interest_rate || 0;
        const term = loan.duration_months || loan.term_months || loan.term_period || 0;
        
        // Calculate total repayable using the 7.5% formula
        const interest = (principal * rate * term) / 100;
        const total_repayable = principal + interest;

        // Get repayments for this loan
        const loanRepayments = repaymentsData?.filter(r => r.loan_id === loan.id) || [];
        const repayment_count = loanRepayments.length;
        const total_paid = loanRepayments.reduce((sum, r) => sum + (r.amount || 0), 0);

        // Calculate what outstanding should be
        const calculated_outstanding = Math.max(0, total_repayable - total_paid);

        // Determine if status should be "Paid"
        const should_be_paid = calculated_outstanding <= 0;

        // Check if there's a mismatch
        const current_status = (loan.status || '').toLowerCase().trim();
        const is_marked_as_paid = current_status === 'paid' || 
                                  current_status === 'fully paid' || 
                                  current_status === 'settled' || 
                                  current_status === 'closed' ||
                                  current_status === 'completed';
        const status_mismatch = should_be_paid !== is_marked_as_paid;

        return {
          id: loan.id,
          loan_number: loan.loan_number || 'N/A',
          client_name,
          status: loan.status || 'Unknown',
          principal_amount: principal,
          total_repayable,
          paid_amount: total_paid,
          outstanding_balance: loan.outstanding_balance || loan.balance || 0,
          calculated_outstanding,
          repayment_count,
          should_be_paid,
          status_mismatch,
          disbursement_date: loan.disbursed_at || loan.disbursement_date || 'N/A'
        };
      });

      setDiagnostics(diagnosticResults);
      setLastFetch(new Date());
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixLoanStatus = async (loanId: string, loanNumber: string, shouldBePaid: boolean, currentStatus: string) => {
    try {
      setFixingLoanIds(prev => new Set(prev).add(loanId));

      const newStatus = shouldBePaid ? 'Paid' : 'Active';
      
      console.log(`Fixing loan ${loanNumber}: ${currentStatus} → ${newStatus}`);

      // Update loan status using loan_number
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('loan_number', loanNumber);

      if (error) throw error;

      toast.success(`Loan ${loanNumber} status updated to "${newStatus}"`);
      
      // Refresh diagnostics
      await fetchDiagnostics();
    } catch (error) {
      console.error('Error fixing loan status:', error);
      toast.error(`Failed to update loan ${loanNumber}`);
    } finally {
      setFixingLoanIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(loanId);
        return newSet;
      });
    }
  };

  const fixAllMismatches = async () => {
    if (!confirm(`This will update ${mismatchLoans} loan(s) to their correct status. Continue?`)) {
      return;
    }

    setFixing(true);
    let successCount = 0;
    let errorCount = 0;

    const mismatchedLoans = diagnostics.filter(d => d.status_mismatch);

    for (const loan of mismatchedLoans) {
      try {
        const newStatus = loan.should_be_paid ? 'Paid' : 'Active';
        
        const { error } = await supabase
          .from('loans')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('loan_number', loan.loan_number);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error fixing loan ${loan.loan_number}:`, error);
        errorCount++;
      }
    }

    setFixing(false);

    if (successCount > 0) {
      toast.success(`Successfully updated ${successCount} loan(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} loan(s)`);
    }

    // Refresh diagnostics
    await fetchDiagnostics();
  };

  const fixShouldBePaid = async () => {
    const loansToFix = diagnostics.filter(d => d.should_be_paid && !d.status.toLowerCase().includes('paid'));
    
    if (loansToFix.length === 0) {
      toast.info('No loans need to be marked as Paid');
      return;
    }

    if (!confirm(`This will mark ${loansToFix.length} fully repaid loan(s) as "Paid". Continue?`)) {
      return;
    }

    setFixing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const loan of loansToFix) {
      try {
        const { error } = await supabase
          .from('loans')
          .update({ 
            status: 'Paid',
            updated_at: new Date().toISOString()
          })
          .eq('loan_number', loan.loan_number);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error fixing loan ${loan.loan_number}:`, error);
        errorCount++;
      }
    }

    setFixing(false);

    if (successCount > 0) {
      toast.success(`Successfully marked ${successCount} loan(s) as Paid`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} loan(s)`);
    }

    // Refresh diagnostics
    await fetchDiagnostics();
  };

  // Filter diagnostics
  const filteredDiagnostics = diagnostics.filter(d => {
    if (filter === 'paid') {
      const status = d.status.toLowerCase();
      return status === 'paid' || status === 'fully paid' || status === 'settled';
    }
    if (filter === 'mismatch') {
      return d.status_mismatch;
    }
    return true;
  });

  // Statistics
  const totalLoans = diagnostics.length;
  const paidLoans = diagnostics.filter(d => {
    const status = d.status.toLowerCase();
    return status === 'paid' || status === 'fully paid' || status === 'settled';
  }).length;
  const mismatchLoans = diagnostics.filter(d => d.status_mismatch).length;
  const shouldBePaidButNot = diagnostics.filter(d => d.should_be_paid && !d.status.toLowerCase().includes('paid')).length;
  const markedPaidButShouldntBe = diagnostics.filter(d => !d.should_be_paid && d.status.toLowerCase().includes('paid')).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="size-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading loan diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#111120] flex items-center gap-2">
            <Database className="size-6" />
            Loan Status Diagnostic Tool
          </h2>
          <p className="text-gray-600 mt-1">
            Analysis of all loan statuses and outstanding balances
            {lastFetch && (
              <span className="ml-2 text-xs text-gray-500">
                • Last updated: {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDiagnostics}
            disabled={loading || fixing}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Data Freshness Warning */}
      {lastFetch && (Date.now() - lastFetch.getTime()) > 60000 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Data May Be Stale</h3>
              <p className="text-sm text-yellow-700">
                This diagnostic data was fetched over a minute ago. Click "Refresh Data" to see the latest loan statuses from the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Loans</p>
          <p className="text-2xl text-[#111120] font-semibold">{totalLoans}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-sm mb-1">Marked as "Paid"</p>
          <p className="text-2xl text-blue-900 font-semibold">{paidLoans}</p>
          <p className="text-xs text-blue-600 mt-1">{totalLoans > 0 ? Math.round((paidLoans / totalLoans) * 100) : 0}% of total</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-orange-700 text-sm mb-1">Status Mismatches</p>
          <p className="text-2xl text-orange-900 font-semibold">{mismatchLoans}</p>
          <p className="text-xs text-orange-600 mt-1">Need attention</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-700 text-sm mb-1">Should Be Paid</p>
          <p className="text-2xl text-green-900 font-semibold">{shouldBePaidButNot}</p>
          <p className="text-xs text-green-600 mt-1">Fully repaid, not marked</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700 text-sm mb-1">Incorrectly Paid</p>
          <p className="text-2xl text-red-900 font-semibold">{markedPaidButShouldntBe}</p>
          <p className="text-xs text-red-600 mt-1">Marked paid with balance</p>
        </div>
      </div>

      {/* Action Buttons */}
      {mismatchLoans > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Status Corrections Available</h3>
                <p className="text-sm text-orange-700 mb-3">
                  {shouldBePaidButNot > 0 && (
                    <span className="block">{shouldBePaidButNot} loan(s) should be marked as "Paid"</span>
                  )}
                  {markedPaidButShouldntBe > 0 && (
                    <span className="block">{markedPaidButShouldntBe} loan(s) should be marked as "Active"</span>
                  )}
                </p>
                <div className="flex gap-2">
                  {shouldBePaidButNot > 0 && (
                    <button
                      onClick={fixShouldBePaid}
                      disabled={fixing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wrench className="size-4" />
                      Mark {shouldBePaidButNot} as Paid
                    </button>
                  )}
                  <button
                    onClick={fixAllMismatches}
                    disabled={fixing}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wrench className="size-4" />
                    {fixing ? 'Fixing...' : `Fix All ${mismatchLoans} Mismatches`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Loans ({diagnostics.length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'paid'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Marked as Paid ({paidLoans})
        </button>
        <button
          onClick={() => setFilter('mismatch')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'mismatch'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mismatches ({mismatchLoans})
        </button>
      </div>

      {/* Diagnostic Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Loan #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Current Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Principal</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Total Repayable</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Calculated O/S</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">DB O/S</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Repayments</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Should Be</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Analysis</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDiagnostics.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    No loans found matching the selected filter
                  </td>
                </tr>
              ) : (
                filteredDiagnostics.map((diagnostic) => {
                  const isCorrect = !diagnostic.status_mismatch;
                  const currentStatus = diagnostic.status.toLowerCase();
                  const isMarkedPaid = currentStatus.includes('paid') || currentStatus === 'settled' || currentStatus === 'closed';
                  const isFixing = fixingLoanIds.has(diagnostic.id);

                  return (
                    <tr key={diagnostic.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">{diagnostic.loan_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{diagnostic.client_name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          isMarkedPaid
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {diagnostic.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-mono">
                        {diagnostic.principal_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 font-mono">
                        {diagnostic.total_repayable.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={diagnostic.paid_amount > 0 ? 'text-green-700 font-semibold' : 'text-gray-500'}>
                          {diagnostic.paid_amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={diagnostic.calculated_outstanding === 0 ? 'text-green-700 font-semibold' : 'text-orange-700'}>
                          {diagnostic.calculated_outstanding.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 font-mono">
                        {diagnostic.outstanding_balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {diagnostic.repayment_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          diagnostic.should_be_paid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {diagnostic.should_be_paid ? 'PAID' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isCorrect ? (
                          <div className="flex items-center justify-center gap-1 text-green-600" title="Status is correct">
                            <CheckCircle className="size-4" />
                            <span className="text-xs">OK</span>
                          </div>
                        ) : diagnostic.should_be_paid && !isMarkedPaid ? (
                          <div className="flex items-center justify-center gap-1 text-orange-600" title="Should be marked as Paid">
                            <AlertTriangle className="size-4" />
                            <span className="text-xs">Mark Paid</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-red-600" title="Marked as Paid but has outstanding balance">
                            <XCircle className="size-4" />
                            <span className="text-xs">Wrong</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!isCorrect && (
                          <button
                            onClick={() => fixLoanStatus(diagnostic.id, diagnostic.loan_number, diagnostic.should_be_paid, diagnostic.status)}
                            disabled={isFixing || fixing}
                            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs flex items-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Wrench className="size-3" />
                            {isFixing ? 'Fixing...' : 'Fix'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-[#111120] mb-3">Legend & Explanations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700 mb-2"><strong>Calculated O/S:</strong> Total Repayable - Actual Repayments Received</p>
            <p className="text-gray-700 mb-2"><strong>DB O/S:</strong> Outstanding balance stored in database</p>
            <p className="text-gray-700"><strong>Should Be:</strong> What the status should be based on calculations</p>
          </div>
          <div>
            <p className="text-gray-700 mb-2"><strong className="text-green-600">✓ OK:</strong> Status matches calculated state</p>
            <p className="text-gray-700 mb-2"><strong className="text-orange-600">⚠ Mark Paid:</strong> Fully repaid but not marked as paid</p>
            <p className="text-gray-700"><strong className="text-red-600">✕ Wrong:</strong> Marked as paid but still has outstanding balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}