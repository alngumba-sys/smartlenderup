import { useState, useEffect } from 'react';
import { AlertCircle, X, ExternalLink, Database, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function DatabaseSetupNotice() {
  const [showNotice, setShowNotice] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [copied, setCopied] = useState(false);
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);
  const [cannotDismiss, setCannotDismiss] = useState(false);

  useEffect(() => {
    checkDatabaseSchema();
    
    // Re-check every 10 seconds to catch runtime errors
    const interval = setInterval(checkDatabaseSchema, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkDatabaseSchema = async () => {
    try {
      setIsChecking(true);
      const errors: string[] = [];

      // Test critical tables and columns
      const testQueries = [
        { table: 'organizations', column: 'password_hash' },
        { table: 'clients', column: 'business_name' },
        { table: 'loans', column: 'outstanding_principal' },
        { table: 'funding_transactions', column: 'user_id' },
        { table: 'repayments', column: 'principal_paid' },
        { table: 'loan_products', column: 'min_amount' }
      ];

      for (const test of testQueries) {
        try {
          const { error } = await supabase
            .from(test.table)
            .select(test.column)
            .limit(0);

          if (error) {
            if (error.code === '42P01') {
              errors.push(`❌ Table "${test.table}" does not exist`);
              setCannotDismiss(true); // Cannot dismiss if tables are missing
            } else if (error.code === '42703') {
              errors.push(`❌ Column "${test.column}" missing from "${test.table}" table`);
              setCannotDismiss(true); // Cannot dismiss if critical columns are missing
            }
          }
        } catch (err) {
          console.error(`Error checking ${test.table}.${test.column}:`, err);
        }
      }

      setSchemaErrors(errors);
      setShowNotice(errors.length > 0);
      setIsChecking(false);
    } catch (err) {
      console.error('Error checking database schema:', err);
      setIsChecking(false);
    }
  };

  const copyFilePath = () => {
    navigator.clipboard.writeText('/supabase/COMPLETE_DATABASE_SETUP.sql');
    setCopied(true);
    toast.success('File path copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openSupabaseDashboard = () => {
    // Get Supabase URL from environment or config
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
      window.open(`https://supabase.com/dashboard/project/${projectRef}/sql/new`, '_blank');
    } else {
      window.open('https://supabase.com/dashboard', '_blank');
    }
  };

  if (isChecking) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Database className="w-4 h-4 text-gray-400 opacity-50 animate-pulse" />
      </div>
    );
  }

  if (!showNotice) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Database Setup Required</h2>
                <p className="text-red-100 mt-1">Your Supabase database needs to be initialized</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Schema Errors */}
          {schemaErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Detected Issues:</h3>
              <ul className="space-y-1 text-sm text-red-800">
                {schemaErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Why This Is Needed */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Why is this needed?</h3>
            <p className="text-sm text-blue-800">
              Your Supabase database doesn't have the proper table structure yet. The platform needs 34 tables 
              with specific columns to store all your microfinance data (clients, loans, payments, etc.). 
              Running the setup script will create all required tables automatically.
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">📋 Step-by-Step Setup Guide</h3>
            
            {/* Step 1 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Open Supabase SQL Editor</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Go to your Supabase project dashboard and open the SQL Editor
                  </p>
                  <button
                    onClick={openSupabaseDashboard}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Supabase Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Locate the Setup File</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Open this file in your code editor (VS Code, etc.)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-900 text-green-400 px-4 py-2 rounded-lg text-sm font-mono">
                      /supabase/COMPLETE_DATABASE_SETUP.sql
                    </code>
                    <button
                      onClick={copyFilePath}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Path
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Copy the Entire File</h4>
                  <p className="text-sm text-gray-600">
                    Select all content (Ctrl+A or Cmd+A) and copy it (Ctrl+C or Cmd+C)
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Run in Supabase SQL Editor</h4>
                  <ul className="text-sm text-gray-600 space-y-2 mt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Click "New Query" in Supabase SQL Editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Paste the copied SQL code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Click "RUN" button (bottom right) or press Ctrl+Enter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Wait for "Success. No rows returned" message</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Refresh This Page</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    After the SQL runs successfully, refresh this page (F5 or Cmd+R) to start using the platform
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What Gets Created */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ What gets created:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
              <div>• Organizations & Staff</div>
              <div>• Clients & Groups</div>
              <div>• Loan Products</div>
              <div>• Loans & Repayments</div>
              <div>• Bank Accounts</div>
              <div>• Shareholders</div>
              <div>• Accounting (Chart of Accounts)</div>
              <div>• Expenses & Payroll</div>
              <div>• Journal Entries</div>
              <div>• KYC Records</div>
              <div>• Tasks & Tickets</div>
              <div>• Audit Logs</div>
              <div>• Guarantors & Collaterals</div>
              <div>• Disbursements</div>
              <div>• Approvals Workflow</div>
              <div>• Savings Accounts</div>
              <div>• Credit Scoring</div>
              <div>• Institutions & Branches</div>
              <div>• Payments & Notifications</div>
              <div>• And 15 more tables...</div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>This is a ONE-TIME setup. You only need to run this once per Supabase project.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>The script uses "CREATE TABLE IF NOT EXISTS" so it's safe to run multiple times.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>All your data will be stored securely in your own Supabase database.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>This process takes about 5-10 seconds to complete.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Need help? Check the browser console (F12) for detailed logs.
            </p>
            <button
              onClick={() => {
                setShowNotice(false);
                toast.info('You can proceed, but some features may not work until the database is set up properly.');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              disabled={cannotDismiss}
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}