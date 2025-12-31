import { useState, useEffect } from 'react';
import { Search, AlertCircle, Download, Upload, Database, RefreshCw, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface StorageData {
  key: string;
  orgId: string;
  tableName: string;
  recordCount: number;
  size: number;
  data: any;
}

export function DataRecoveryTool() {
  const { isDark } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [foundData, setFoundData] = useState<StorageData[]>([]);
  const [autoBackups, setAutoBackups] = useState<any[]>([]);
  const [currentOrg, setCurrentOrg] = useState<any>(null);

  useEffect(() => {
    // Get current organization
    try {
      const orgData = localStorage.getItem('current_organization');
      if (orgData) {
        setCurrentOrg(JSON.parse(orgData));
      }
    } catch (error) {
      console.error('Error getting org:', error);
    }
  }, []);

  const scanLocalStorage = () => {
    setScanning(true);
    const found: StorageData[] = [];
    const backups: any[] = [];

    try {
      // Scan all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Check for auto backups
        if (key.startsWith('auto_backup_')) {
          const timestamp = parseInt(key.replace('auto_backup_', ''));
          const data = localStorage.getItem(key);
          if (data) {
            backups.push({
              key,
              date: new Date(timestamp),
              size: new Blob([data]).size,
              data: JSON.parse(data)
            });
          }
          continue;
        }

        // Check for data tables
        if (key.includes('bvfunguo_') && !key.includes('version') && !key.includes('initialized')) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              const recordCount = Array.isArray(parsed) ? parsed.length : 0;
              
              // Extract org ID from key
              const parts = key.split('_');
              const orgId = parts[0];
              const tableName = key.replace(`${orgId}_`, '');

              if (recordCount > 0) {
                found.push({
                  key,
                  orgId,
                  tableName,
                  recordCount,
                  size: new Blob([data]).size,
                  data: parsed
                });
              }
            }
          } catch (error) {
            console.error(`Error parsing ${key}:`, error);
          }
        }
      }

      setFoundData(found.sort((a, b) => b.recordCount - a.recordCount));
      setAutoBackups(backups.sort((a, b) => b.date.getTime() - a.date.getTime()));
      
      toast.success(`Scan Complete`, {
        description: `Found ${found.length} tables with data and ${backups.length} backups`,
      });
    } catch (error) {
      console.error('Error scanning localStorage:', error);
      toast.error('Scan Failed', {
        description: 'Error scanning localStorage',
      });
    } finally {
      setScanning(false);
    }
  };

  const restoreTable = (item: StorageData) => {
    try {
      // Get current organization ID
      const orgData = localStorage.getItem('current_organization');
      if (!orgData) {
        toast.error('No Organization', {
          description: 'Please log in to an organization first',
        });
        return;
      }

      const org = JSON.parse(orgData);
      const currentOrgId = org.id || 'default';
      const targetKey = `${currentOrgId}_${item.tableName}`;

      // Restore the data to current organization
      localStorage.setItem(targetKey, JSON.stringify(item.data));

      toast.success('Table Restored', {
        description: `${item.tableName} with ${item.recordCount} records restored. Refresh page to see changes.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error restoring table:', error);
      toast.error('Restore Failed', {
        description: 'Failed to restore table data',
      });
    }
  };

  const restoreAllFromOrg = (orgId: string) => {
    if (!confirm(`Restore all data from organization "${orgId}"? This will add to your current data.`)) {
      return;
    }

    let restoredCount = 0;
    const orgTables = foundData.filter(item => item.orgId === orgId);

    try {
      const currentOrgData = localStorage.getItem('current_organization');
      if (!currentOrgData) {
        toast.error('Error', { description: 'No current organization found' });
        return;
      }

      const org = JSON.parse(currentOrgData);
      const currentOrgId = org.id || 'default';

      orgTables.forEach(item => {
        const targetKey = `${currentOrgId}_${item.tableName}`;
        localStorage.setItem(targetKey, JSON.stringify(item.data));
        restoredCount++;
      });

      toast.success('Data Restored', {
        description: `Restored ${restoredCount} tables. Refreshing page...`,
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error restoring org data:', error);
      toast.error('Restore Failed', {
        description: 'Failed to restore organization data',
      });
    }
  };

  const restoreBackup = (backup: any) => {
    if (!confirm(`Restore backup from ${backup.date.toLocaleString()}? This will replace current data.`)) {
      return;
    }

    try {
      const backupData = backup.data;
      if (!backupData.tables) {
        toast.error('Invalid Backup', {
          description: 'Backup format is invalid',
        });
        return;
      }

      // Get current org
      const currentOrgData = localStorage.getItem('current_organization');
      if (!currentOrgData) {
        toast.error('Error', { description: 'No current organization found' });
        return;
      }

      const org = JSON.parse(currentOrgData);
      const currentOrgId = org.id || 'default';

      // Restore all tables
      let restoredCount = 0;
      Object.keys(backupData.tables).forEach(tableName => {
        const targetKey = `${currentOrgId}_${tableName}`;
        localStorage.setItem(targetKey, JSON.stringify(backupData.tables[tableName]));
        restoredCount++;
      });

      toast.success('Backup Restored', {
        description: `Restored ${restoredCount} tables. Refreshing page...`,
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Restore Failed', {
        description: 'Failed to restore backup',
      });
    }
  };

  const exportFoundData = () => {
    const exportData = {
      export_date: new Date().toISOString(),
      scan_results: foundData,
      auto_backups: autoBackups.length,
      total_records: foundData.reduce((sum, item) => sum + item.recordCount, 0)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_recovery_scan_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Export Complete', {
      description: 'Scan results exported successfully',
    });
  };

  // Group data by organization
  const dataByOrg = foundData.reduce((acc, item) => {
    if (!acc[item.orgId]) {
      acc[item.orgId] = [];
    }
    acc[item.orgId].push(item);
    return acc;
  }, {} as Record<string, StorageData[]>);

  const totalRecords = foundData.reduce((sum, item) => sum + item.recordCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Data Recovery Tool
        </h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Scan and recover data from all organization contexts in localStorage
        </p>
      </div>

      {/* Current Organization Info */}
      {currentOrg && (
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start gap-2">
            <Database className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                Current Organization: {currentOrg.organization_name}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                ID: {currentOrg.id} | Country: {currentOrg.country}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scan Button */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
              Scan localStorage
            </h4>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Search for all data across all organization contexts
            </p>
          </div>
          <div className="flex gap-3">
            {foundData.length > 0 && (
              <button
                onClick={exportFoundData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="size-4" />
                Export Scan
              </button>
            )}
            <button
              onClick={scanLocalStorage}
              disabled={scanning}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Scan Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scan Results */}
      {foundData.length > 0 && (
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                Found Data
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {totalRecords.toLocaleString()} total records in {foundData.length} tables across {Object.keys(dataByOrg).length} organizations
              </p>
            </div>
          </div>

          {/* Data by Organization */}
          <div className="space-y-6">
            {Object.entries(dataByOrg).map(([orgId, tables]) => {
              const orgRecords = tables.reduce((sum, t) => sum + t.recordCount, 0);
              const isCurrentOrg = currentOrg && orgId === currentOrg.id;

              return (
                <div key={orgId} className={`p-4 rounded-lg border ${
                  isCurrentOrg 
                    ? isDark ? 'bg-emerald-900/20 border-emerald-700' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Organization: {orgId}
                        {isCurrentOrg && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            isDark ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-200 text-emerald-800'
                          }`}>
                            Current
                          </span>
                        )}
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {orgRecords.toLocaleString()} records in {tables.length} tables
                      </p>
                    </div>
                    {!isCurrentOrg && (
                      <button
                        onClick={() => restoreAllFromOrg(orgId)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                      >
                        Restore All
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {tables.map(table => (
                      <div key={table.key} className={`p-3 rounded border ${
                        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {table.tableName.replace('bvfunguo_', '').replace(/_/g, ' ')}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {table.recordCount} records • {(table.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          {!isCurrentOrg && (
                            <button
                              onClick={() => restoreTable(table)}
                              className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Auto Backups */}
      {autoBackups.length > 0 && (
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h4 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Available Backups ({autoBackups.length})
          </h4>
          <div className="space-y-2">
            {autoBackups.map(backup => (
              <div key={backup.key} className={`p-3 rounded border flex items-center justify-between ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {backup.date.toLocaleString()}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Size: {(backup.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => restoreBackup(backup)}
                  className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Found */}
      {!scanning && foundData.length === 0 && (
        <div className={`p-8 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <AlertCircle className={`size-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No data found. Click "Scan Now" to search for recoverable data.
          </p>
        </div>
      )}
    </div>
  );
}
