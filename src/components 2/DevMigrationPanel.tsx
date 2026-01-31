import { useState } from 'react';
import { Calendar, Link, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

export function DevMigrationPanel() {
  const { bankAccounts, repayments, loans } = useData();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);

  const getCurrentOrgId = () => {
    const orgData = localStorage.getItem('current_organization');
    if (!orgData) return null;
    return JSON.parse(orgData).id;
  };

  const updateKCBDates = async () => {
    const orgId = getCurrentOrgId();
    if (!orgId) {
      return { success: false, message: '❌ Organization not found' };
    }

    const targetDate = '2025-10-01';

    try {
      // Find KCB account
      const kcbAccount = bankAccounts.find(acc => 
        acc.bankName?.toUpperCase().includes('KCB') || 
        acc.name?.toUpperCase().includes('KCB')
      );

      if (!kcbAccount) {
        return { success: false, message: '❌ KCB account not found' };
      }

      // Update bank account created_at and opening_date
      const originalCreatedAt = new Date(kcbAccount.createdAt || kcbAccount.createdDate || new Date());
      const newCreatedAt = new Date(targetDate + 'T' + originalCreatedAt.toISOString().split('T')[1]);

      const { error: accountError } = await supabase
        .from('bank_accounts')
        .update({ 
          created_at: newCreatedAt.toISOString()
        })
        .eq('id', kcbAccount.id);

      if (accountError) {
        return { success: false, message: '❌ Error updating account: ' + accountError.message };
      }

      // Get and update funding transactions
      const { data: fundingTransactions, error: fundingError } = await supabase
        .from('funding_transactions')
        .select('*')
        .eq('organization_id', orgId)
        .eq('bank_account_id', kcbAccount.id);

      if (fundingError) {
        return { success: false, message: '❌ Error fetching funding transactions: ' + fundingError.message };
      }

      let updatedCount = 0;
      if (fundingTransactions && fundingTransactions.length > 0) {
        for (const transaction of fundingTransactions) {
          const originalDate = new Date(transaction.date);
          const newTransactionDate = new Date(targetDate + 'T' + originalDate.toISOString().split('T')[1]);

          const { error: updateError } = await supabase
            .from('funding_transactions')
            .update({ date: newTransactionDate.toISOString() })
            .eq('id', transaction.id);

          if (!updateError) {
            updatedCount++;
          }
        }
      }

      return { 
        success: true, 
        message: `✅ Updated KCB account and ${updatedCount} transactions to Oct 1, 2025`,
        details: { accountId: kcbAccount.id, transactionsUpdated: updatedCount }
      };

    } catch (error: any) {
      return { success: false, message: '❌ Unexpected error: ' + error.message };
    }
  };

  const linkRepaymentsToBank = async () => {
    const orgId = getCurrentOrgId();
    if (!orgId) {
      return { success: false, message: '❌ Organization not found' };
    }

    try {
      // Find KCB account
      const kcbAccount = bankAccounts.find(acc => 
        acc.bankName?.toUpperCase().includes('KCB') || 
        acc.name?.toUpperCase().includes('KCB')
      );

      if (!kcbAccount) {
        return { success: false, message: '❌ KCB account not found' };
      }

      // Get all approved repayments
      const { data: allRepayments, error: repaymentsError } = await supabase
        .from('repayments')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'Approved');

      if (repaymentsError) {
        return { success: false, message: '❌ Error fetching repayments: ' + repaymentsError.message };
      }

      let updatedCount = 0;
      if (allRepayments && allRepayments.length > 0) {
        for (const repayment of allRepayments) {
          const { error: updateError } = await supabase
            .from('repayments')
            .update({ 
              bank_account_id: kcbAccount.id,
              payment_method: 'Bank Transfer'
            })
            .eq('id', repayment.id);

          if (!updateError) {
            updatedCount++;
          }
        }
      }

      return { 
        success: true, 
        message: `✅ Linked ${updatedCount} repayments to KCB bank account`,
        details: { bankAccountId: kcbAccount.id, repaymentsLinked: updatedCount }
      };

    } catch (error: any) {
      return { success: false, message: '❌ Unexpected error: ' + error.message };
    }
  };

  const runAllMigrations = async () => {
    setIsRunning(true);
    setResults([]);

    const migrationResults: MigrationResult[] = [];

    // Step 1: Update KCB dates
    toast.info('Step 1: Updating KCB transaction dates...');
    const result1 = await updateKCBDates();
    migrationResults.push(result1);
    
    if (result1.success) {
      toast.success(result1.message);
    } else {
      toast.error(result1.message);
    }

    // Step 2: Link repayments to bank
    toast.info('Step 2: Linking repayments to bank account...');
    const result2 = await linkRepaymentsToBank();
    migrationResults.push(result2);
    
    if (result2.success) {
      toast.success(result2.message);
    } else {
      toast.error(result2.message);
    }

    setResults(migrationResults);
    setIsRunning(false);

    // Show final status
    const allSuccess = migrationResults.every(r => r.success);
    if (allSuccess) {
      toast.success('🎉 All migrations completed successfully!', {
        description: 'Refreshing page in 2 seconds...',
        duration: 2000
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toast.error('Some migrations failed. Check the results below.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-6 border border-purple-700 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">🛠️ Developer Migration Tools</h3>
          <p className="text-purple-200 text-sm">
            Update transaction dates and link repayments to bank accounts
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="size-4 text-blue-300" />
            <span className="text-sm font-medium">Update KCB Dates to Oct 1, 2025</span>
          </div>
          <p className="text-xs text-purple-200">
            Changes all KCB opening balance and funding transaction dates to October 1, 2025 (keeps original times)
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <Link className="size-4 text-emerald-300" />
            <span className="text-sm font-medium">Link Repayments to Bank Account</span>
          </div>
          <p className="text-xs text-purple-200">
            Links all approved loan repayments to KCB bank account and sets payment method to "Bank Transfer"
          </p>
        </div>
      </div>

      <button
        onClick={runAllMigrations}
        disabled={isRunning}
        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
          isRunning
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        }`}
      >
        {isRunning ? (
          <>
            <Loader className="size-5 animate-spin" />
            Running Migrations...
          </>
        ) : (
          <>
            <CheckCircle className="size-5" />
            Run All Migrations
          </>
        )}
      </button>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-purple-200">Results:</h4>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                result.success
                  ? 'bg-emerald-900/30 border-emerald-600'
                  : 'bg-red-900/30 border-red-600'
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="size-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="size-4 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{result.message}</p>
                  {result.details && (
                    <pre className="text-xs text-purple-200 mt-1 opacity-70">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-amber-900/30 border border-amber-600 rounded-lg">
        <p className="text-xs text-amber-200">
          ⚠️ <strong>Note:</strong> This will update your database directly. The page will refresh automatically after successful completion.
        </p>
      </div>
    </div>
  );
}