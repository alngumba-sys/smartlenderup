import { useState } from 'react';
import { Database, Download, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  autoCheckAndMigrate,
  showMigrationNotification,
  downloadMigrationSQL,
  type MigrationCheckResult,
} from '../utils/simpleAutoMigration';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';

export function SchemaMigrationPanel() {
  const { currentUser } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<MigrationCheckResult[] | null>(null);
  const [migrationSQL, setMigrationSQL] = useState<string>('');
  const [needsMigration, setNeedsMigration] = useState(false);

  const runSchemaCheck = async () => {
    setIsChecking(true);
    setResults(null);
    setMigrationSQL('');

    try {
      toast.info('🔍 Checking database schema...', { duration: 2000 });

      const migrationCheck = await autoCheckAndMigrate(currentUser?.organizationId);

      setResults(migrationCheck.results);
      setMigrationSQL(migrationCheck.sql);
      setNeedsMigration(migrationCheck.needsMigration);

      if (migrationCheck.needsMigration) {
        const tablesWithMissing = migrationCheck.results.filter(
          (r) => r.missingColumns.length > 0
        );
        const totalMissing = tablesWithMissing.reduce(
          (sum, r) => sum + r.missingColumns.length,
          0
        );

        toast.warning(`⚠️ Found ${totalMissing} missing columns`, {
          description: `${tablesWithMissing.length} tables need migration`,
        });
      } else {
        toast.success('✅ Schema is up to date!', {
          description: 'All tables have required columns',
        });
      }
    } catch (error: any) {
      console.error('Schema check error:', error);
      toast.error('Failed to check schema', {
        description: error.message || 'Unknown error',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const copySQLToClipboard = () => {
    if (migrationSQL) {
      // Try modern clipboard API first, fallback to legacy method
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(migrationSQL)
          .then(() => {
            toast.success('✅ SQL copied to clipboard', {
              description: 'Paste it in Supabase SQL Editor',
            });
          })
          .catch((err) => {
            console.error('Clipboard error:', err);
            // Fallback to textarea method
            copyToClipboardFallback(migrationSQL);
          });
      } else {
        // Use fallback for non-secure contexts
        copyToClipboardFallback(migrationSQL);
      }
    }
  };

  const copyToClipboardFallback = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast.success('✅ SQL copied to clipboard', {
        description: 'Paste it in Supabase SQL Editor',
      });
    } catch (err) {
      console.error('Fallback copy failed:', err);
      toast.error('Copy failed', {
        description: 'Please use the Download button instead',
      });
    }
    document.body.removeChild(textarea);
  };

  const downloadSQL = () => {
    if (migrationSQL) {
      downloadMigrationSQL(migrationSQL);
    }
  };

  const tablesWithMissing = results?.filter((r) => r.missingColumns.length > 0) || [];
  const totalMissing = tablesWithMissing.reduce(
    (sum, r) => sum + r.missingColumns.length,
    0
  );

  return (
    <Card className="p-6 bg-[#1a1a2e] border-[#2a2a4e]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg text-white">Database Schema Migration</h3>
              <p className="text-sm text-gray-400">
                Automatically detect and fix missing database columns
              </p>
            </div>
          </div>
        </div>

        {/* Check Button */}
        <Button
          onClick={runSchemaCheck}
          disabled={isChecking}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking Schema...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Check Database Schema
            </>
          )}
        </Button>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-[#111120] border border-[#2a2a4e] rounded-lg">
              <div className="flex items-center gap-3">
                {needsMigration ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <div>
                  <p className="text-sm text-white">
                    {needsMigration
                      ? `${totalMissing} Missing Columns Found`
                      : 'Schema is Up to Date'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {needsMigration
                      ? `${tablesWithMissing.length} tables need migration`
                      : 'All tables have required columns'}
                  </p>
                </div>
              </div>

              {needsMigration && (
                <div className="flex gap-2">
                  <Button
                    onClick={copySQLToClipboard}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                  >
                    Copy SQL
                  </Button>
                  <Button
                    onClick={downloadSQL}
                    variant="outline"
                    size="sm"
                    className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {/* Detailed Results */}
            {needsMigration && tablesWithMissing.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm text-gray-300">Tables Needing Migration:</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tablesWithMissing.map((table) => (
                    <div
                      key={table.tableName}
                      className="p-3 bg-[#111120] border border-[#2a2a4e] rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white font-mono">
                          {table.tableName}
                        </span>
                        <span className="text-xs text-yellow-400">
                          {table.missingColumns.length} missing
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {table.missingColumns.map((col) => (
                          <span
                            key={col}
                            className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded font-mono"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {needsMigration && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-sm text-blue-400 mb-2">📋 How to Apply Migration:</h4>
                <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Click "Copy SQL" or "Download" to get the migration script</li>
                  <li>Go to Supabase Dashboard → SQL Editor</li>
                  <li>Paste the SQL and click "Run"</li>
                  <li>Wait for confirmation, then refresh this page</li>
                </ol>
                <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded">
                  <p className="text-xs text-green-400">
                    💡 <strong>Quick Fix:</strong> Pre-generated migration file:{' '}
                    <code className="bg-black/30 px-1 rounded">/supabase/QUICK_FIX.sql</code>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    📖 Step-by-step guide:{' '}
                    <code className="bg-black/30 px-1 rounded">/HOW_TO_FIX_DATABASE.md</code>
                  </p>
                </div>
              </div>
            )}

            {/* SQL Preview */}
            {needsMigration && migrationSQL && (
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors">
                  View SQL Migration Script →
                </summary>
                <div className="mt-2 p-4 bg-[#0d0d15] border border-[#2a2a4e] rounded-lg overflow-x-auto">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                    {migrationSQL}
                  </pre>
                </div>
              </details>
            )}
          </div>
        )}

        {/* Help Text */}
        {!results && (
          <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">What does this do?</strong>
              <br />
              This tool checks your Supabase database tables for missing columns. If any
              are found, it generates the SQL needed to add them automatically. No more
              manual column additions!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}