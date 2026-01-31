import { useState } from 'react';
import { Download, Upload, Database, HardDrive, Clock, FileJson, AlertCircle, CheckCircle, Trash2, RefreshCw, Search, Cloud } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner@2.0.3';
import {
  downloadBackup,
  importBackup,
  getDataStats,
  getAutoBackups,
  restoreAutoBackup,
  downloadSupabaseMigration,
  createAutoBackup
} from '../utils/dataBackup';
import { getLocalDataCounts, checkSyncNeeded } from '../utils/ensureSupabaseSync';
import { DataRecoveryTool } from './DataRecoveryTool';

export function DataBackupPanel() {
  const { isDark } = useTheme();
  const { clients, loans, loanProducts, syncAllToSupabase } = useData();
  const [isImporting, setIsImporting] = useState(false);
  const [showAutoBackups, setShowAutoBackups] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const dataStats = getDataStats();
  const autoBackups = getAutoBackups();
  const localDataCounts = getLocalDataCounts();
  const syncNeeded = checkSyncNeeded();

  const handleExportBackup = () => {
    try {
      downloadBackup();
      toast.success('Backup Downloaded Successfully', {
        description: 'Your complete data backup has been downloaded as JSON',
        duration: 5000,
      });
    } catch (error) {
      toast.error('Backup Failed', {
        description: 'Failed to create backup. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importBackup(jsonData);
        
        if (success) {
          toast.success('Backup Restored Successfully', {
            description: 'Your data has been restored. Refreshing page...',
            duration: 3000,
          });
          
          // Reload page to reflect imported data
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toast.error('Import Failed', {
            description: 'Invalid backup file or corrupted data',
            duration: 5000,
          });
        }
      } catch (error) {
        toast.error('Import Failed', {
          description: 'Failed to parse backup file',
          duration: 5000,
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      toast.error('Import Failed', {
        description: 'Failed to read backup file',
        duration: 5000,
      });
      setIsImporting(false);
    };

    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleExportSupabaseMigration = () => {
    try {
      downloadSupabaseMigration();
      toast.success('Migration File Downloaded', {
        description: 'Supabase-ready migration file has been downloaded',
        duration: 5000,
      });
    } catch (error) {
      toast.error('Export Failed', {
        description: 'Failed to generate migration file',
        duration: 5000,
      });
    }
  };

  const handleRestoreAutoBackup = (backupKey: string, date: Date) => {
    if (!confirm(`Are you sure you want to restore backup from ${date.toLocaleString()}? This will replace all current data.`)) {
      return;
    }

    const success = restoreAutoBackup(backupKey);
    if (success) {
      toast.success('Auto Backup Restored', {
        description: 'Backup restored successfully. Refreshing page...',
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toast.error('Restore Failed', {
        description: 'Failed to restore auto backup',
        duration: 5000,
      });
    }
  };

  const handleManualBackup = () => {
    try {
      createAutoBackup();
      toast.success('Manual Backup Created', {
        description: 'A manual backup has been created and saved locally',
        duration: 3000,
      });
      // Trigger re-render to show new backup
      setShowAutoBackups(false);
      setTimeout(() => setShowAutoBackups(true), 100);
    } catch (error) {
      toast.error('Backup Failed', {
        description: 'Failed to create manual backup',
        duration: 5000,
      });
    }
  };

  const handleSyncToSupabase = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await syncAllToSupabase();
      
      if (result.success) {
        toast.success('Sync Complete!', {
          description: `Successfully synced ${result.successCount} records to Supabase.`,
          duration: 5000,
        });
      } else {
        toast.warning('Sync Completed with Errors', {
          description: `Synced ${result.successCount} records. ${result.errorCount} failed. Check console for details.`,
          duration: 8000,
        });
      }
    } catch (error: any) {
      toast.error('Sync Failed', {
        description: error.message || 'Failed to sync data to Supabase',
        duration: 5000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const totalRecords = Object.values(dataStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Data Backup & Recovery
        </h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Export, import, and manage your data backups. All data is stored locally and ready for Supabase migration.
        </p>
      </div>

      {/* Data Statistics */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Database className={`size-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h4 className={isDark ? 'text-white' : 'text-gray-900'}>Current Database</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total: {totalRecords.toLocaleString()} records across {Object.keys(dataStats).length} tables
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(dataStats).slice(0, 8).map(([table, count]) => (
            <div key={table} className={`p-3 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {table.replace('bvfunguo_', '').replace(/_/g, ' ')}
              </p>
              <p className={`text-lg mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {count.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Actions */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h4 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Backup Actions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Full Backup */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-lg border border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-left group"
          >
            <div className="flex items-start gap-3">
              <Download className="size-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Download Full Backup
                </h5>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                  Export all data as JSON file for safekeeping
                </p>
              </div>
            </div>
          </button>

          {/* Import Backup */}
          <label className="p-4 rounded-lg border border-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left cursor-pointer group">
            <div className="flex items-start gap-3">
              <Upload className="size-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-blue-700 dark:text-blue-400 font-medium">
                  Restore from Backup
                </h5>
                <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                  Import previously exported backup file
                </p>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={isImporting}
              className="hidden"
            />
          </label>

          {/* Export Supabase Migration */}
          <button
            onClick={handleExportSupabaseMigration}
            className="p-4 rounded-lg border border-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left group"
          >
            <div className="flex items-start gap-3">
              <FileJson className="size-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-purple-700 dark:text-purple-400 font-medium">
                  Supabase Migration File
                </h5>
                <p className="text-sm text-purple-600 dark:text-purple-500 mt-1">
                  Export data in Supabase-ready format
                </p>
              </div>
            </div>
          </button>

          {/* Manual Backup Now */}
          <button
            onClick={handleManualBackup}
            className="p-4 rounded-lg border border-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left group"
          >
            <div className="flex items-start gap-3">
              <RefreshCw className="size-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-amber-700 dark:text-amber-400 font-medium">
                  Create Manual Backup
                </h5>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                  Create an immediate local backup
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Auto Backups */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h4 className={isDark ? 'text-white' : 'text-gray-900'}>
              Automatic Backups
            </h4>
          </div>
          <button
            onClick={() => setShowAutoBackups(!showAutoBackups)}
            className={`px-3 py-1 text-sm rounded ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showAutoBackups ? 'Hide' : 'Show'} ({autoBackups.length})
          </button>
        </div>

        <div className={`flex items-start gap-2 p-3 rounded mb-4 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            Automatic backups are created every 30 minutes and stored locally. The last 5 backups are kept.
          </p>
        </div>

        {showAutoBackups && autoBackups.length > 0 && (
          <div className="space-y-2">
            {autoBackups.map((backup) => (
              <div
                key={backup.key}
                className={`p-3 rounded border flex items-center justify-between ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HardDrive className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {backup.date.toLocaleString()}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Size: {(backup.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRestoreAutoBackup(backup.key, backup.date)}
                  className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}

        {showAutoBackups && autoBackups.length === 0 && (
          <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No automatic backups available yet. They will be created automatically every 30 minutes.
          </p>
        )}
      </div>

      {/* Supabase Cloud Sync */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Cloud className={`size-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <div>
            <h4 className={isDark ? 'text-white' : 'text-gray-900'}>Supabase Cloud Sync</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sync all data to Supabase cloud database
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`p-4 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Memory</p>
            <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{clients.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Clients</p>
          </div>
          <div className={`p-4 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Memory</p>
            <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{loans.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loans</p>
          </div>
          <div className={`p-4 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Memory</p>
            <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{loanProducts.length}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loan Products</p>
          </div>
        </div>

        {syncNeeded && (
          <div className={`flex items-start gap-2 p-3 rounded mb-4 ${isDark ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
            <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                Local storage data detected! You have {localDataCounts.clients} clients, {localDataCounts.loans} loans, and {localDataCounts.loanProducts} loan products in localStorage that should be synced.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSyncToSupabase}
          disabled={isSyncing}
          className={`w-full p-4 rounded-lg border transition-colors text-left ${
            isSyncing
              ? 'border-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
              : 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <Cloud className={`size-6 flex-shrink-0 ${isSyncing ? 'text-gray-400' : 'text-purple-600'} ${isSyncing ? 'animate-pulse' : ''}`} />
            <div className="flex-1">
              <h5 className={`font-medium ${isSyncing ? 'text-gray-500' : 'text-purple-700 dark:text-purple-400'}`}>
                {isSyncing ? 'Syncing to Supabase...' : 'Sync All Data to Supabase'}
              </h5>
              <p className={`text-sm mt-1 ${isSyncing ? 'text-gray-400' : 'text-purple-600 dark:text-purple-500'}`}>
                {isSyncing 
                  ? 'Please wait while we sync your data to the cloud...'
                  : 'Upload all clients, loans, and products to Supabase database'
                }
              </p>
            </div>
            {isSyncing && (
              <RefreshCw className="size-5 text-purple-600 animate-spin" />
            )}
          </div>
        </button>

        <div className={`flex items-start gap-2 p-3 rounded mt-4 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>Note:</strong> Data is automatically synced to Supabase when you create, update, or delete records. 
            Use this button to ensure all existing data (including any from localStorage) is fully synchronized.
          </p>
        </div>
      </div>

      {/* Data Security Notice */}
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
        <div className="flex gap-3">
          <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className={`${isDark ? 'text-green-300' : 'text-green-800'}`}>
              Your Data is Safe
            </h5>
            <p className={`text-sm mt-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              All data is automatically saved to your browser's local storage and backed up every 30 minutes.
              The data format is compatible with Supabase, making migration seamless when you're ready.
              Regular backups ensure you never lose your work.
            </p>
          </div>
        </div>
      </div>

      {/* Data Recovery Tool */}
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className={`${isDark ? 'text-red-300' : 'text-red-800'}`}>
              Data Recovery Tool
            </h5>
            <p className={`text-sm mt-1 mb-3 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              If you have lost your data, use the recovery tool to scan and restore from all available sources.
            </p>
            <button
              onClick={() => setShowRecovery(!showRecovery)}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-2"
            >
              <Search className="size-4" />
              {showRecovery ? 'Hide' : 'Open'} Recovery Tool
            </button>
          </div>
        </div>
      </div>

      {/* Data Recovery Panel */}
      {showRecovery && (
        <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <DataRecoveryTool />
        </div>
      )}
    </div>
  );
}