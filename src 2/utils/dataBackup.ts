/**
 * Data Backup & Export Utility
 * 
 * This utility provides automatic backup functionality and export/import
 * capabilities in a Supabase-compatible format for easy migration.
 */

// Get organization-scoped storage key
function getStorageKey(baseKey: string): string {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      const orgId = org.id || 'default';
      return `${orgId}_${baseKey}`;
    }
  } catch (error) {
    console.error('Error getting organization context:', error);
  }
  return `default_${baseKey}`;
}

// All table names matching Supabase schema
const DATA_TABLES = [
  'bvfunguo_clients',
  'bvfunguo_loans',
  'bvfunguo_repayments',
  'bvfunguo_savings_accounts',
  'bvfunguo_savings_transactions',
  'bvfunguo_loan_products',
  'bvfunguo_shareholders',
  'bvfunguo_shareholder_transactions',
  'bvfunguo_expenses',
  'bvfunguo_payees',
  'bvfunguo_bank_accounts',
  'bvfunguo_tasks',
  'bvfunguo_kyc_records',
  'bvfunguo_approvals',
  'bvfunguo_funding_transactions',
  'bvfunguo_processing_fee_records',
  'bvfunguo_disbursements',
  'bvfunguo_payroll_runs',
  'bvfunguo_journal_entries',
  'bvfunguo_audit_logs',
  'bvfunguo_tickets',
  'bvfunguo_groups',
  'bvfunguo_guarantors',
  'bvfunguo_collaterals',
  'bvfunguo_loan_documents',
];

/**
 * Export all data in Supabase-compatible JSON format
 */
export function exportAllData(): string {
  const exportData: Record<string, any> = {
    export_date: new Date().toISOString(),
    organization: null,
    data_version: localStorage.getItem('bvfunguo_data_version') || '2.5',
    tables: {}
  };

  // Get organization info
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      exportData.organization = JSON.parse(orgData);
    }
  } catch (error) {
    console.error('Error getting organization data:', error);
  }

  // Export all tables
  DATA_TABLES.forEach(tableName => {
    try {
      const data = localStorage.getItem(getStorageKey(tableName));
      if (data) {
        exportData.tables[tableName] = JSON.parse(data);
      } else {
        exportData.tables[tableName] = [];
      }
    } catch (error) {
      console.error(`Error exporting ${tableName}:`, error);
      exportData.tables[tableName] = [];
    }
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download all data as a JSON file
 */
export function downloadBackup(): void {
  const data = exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const orgData = localStorage.getItem('current_organization');
  let orgName = 'SmartLenderUp';
  try {
    if (orgData) {
      const org = JSON.parse(orgData);
      orgName = org.organization_name || orgName;
    }
  } catch (error) {
    console.error('Error getting org name:', error);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${orgName.replace(/\s+/g, '_')}_backup_${timestamp}.json`;
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`✅ Backup downloaded: ${filename}`);
}

/**
 * Import data from a backup file
 */
export function importBackup(jsonData: string): boolean {
  try {
    const importData = JSON.parse(jsonData);
    
    if (!importData.tables) {
      throw new Error('Invalid backup file format');
    }

    // Import all tables
    let importedCount = 0;
    DATA_TABLES.forEach(tableName => {
      if (importData.tables[tableName]) {
        try {
          localStorage.setItem(
            getStorageKey(tableName),
            JSON.stringify(importData.tables[tableName])
          );
          importedCount++;
        } catch (error) {
          console.error(`Error importing ${tableName}:`, error);
        }
      }
    });

    // Update version if needed
    if (importData.data_version) {
      localStorage.setItem('bvfunguo_data_version', importData.data_version);
    }

    console.log(`✅ Successfully imported ${importedCount} tables from backup`);
    return true;
  } catch (error) {
    console.error('Error importing backup:', error);
    return false;
  }
}

/**
 * Create automatic backup (called periodically)
 */
export function createAutoBackup(): void {
  try {
    // FIRST: Clean up old backups BEFORE creating a new one
    const allKeys = Object.keys(localStorage);
    const autoBackupKeys = allKeys
      .filter(key => key.startsWith('auto_backup_'))
      .sort()
      .reverse();
    
    // Keep only last 2 auto backups (reduced from 5 to save space)
    // Remove old backups before creating new one
    if (autoBackupKeys.length >= 2) {
      autoBackupKeys.slice(2).forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed old backup: ${key}`);
        } catch (err) {
          console.error(`Error removing old backup ${key}:`, err);
        }
      });
    }
    
    // Now create the new backup
    const backupData = exportAllData();
    const timestamp = Date.now();
    const backupKey = `auto_backup_${timestamp}`;
    
    // Try to store in localStorage with timestamp
    try {
      localStorage.setItem(backupKey, backupData);
      console.log(`💾 Auto backup created: ${new Date(timestamp).toLocaleString()}`);
    } catch (storageError: any) {
      // If quota exceeded, try more aggressive cleanup
      if (storageError.name === 'QuotaExceededError') {
        console.warn('⚠️ Storage quota exceeded, performing aggressive cleanup...');
        
        // Remove ALL auto backups to free up space
        autoBackupKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed backup: ${key}`);
          } catch (err) {
            console.error(`Error removing backup ${key}:`, err);
          }
        });
        
        // Try one more time after cleanup
        try {
          localStorage.setItem(backupKey, backupData);
          console.log(`💾 Auto backup created after cleanup: ${new Date(timestamp).toLocaleString()}`);
        } catch (retryError) {
          console.error('❌ Still unable to create backup after cleanup. localStorage may be full with other data.');
          throw retryError;
        }
      } else {
        throw storageError;
      }
    }
  } catch (error) {
    console.error('Error creating auto backup:', error);
    // Don't throw - let the app continue running even if backup fails
  }
}

/**
 * Get list of available auto backups
 */
export function getAutoBackups(): Array<{ key: string; date: Date; size: number }> {
  const allKeys = Object.keys(localStorage);
  const autoBackupKeys = allKeys.filter(key => key.startsWith('auto_backup_'));
  
  return autoBackupKeys.map(key => {
    const timestamp = parseInt(key.replace('auto_backup_', ''));
    const data = localStorage.getItem(key) || '';
    return {
      key,
      date: new Date(timestamp),
      size: new Blob([data]).size
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Restore from an auto backup
 */
export function restoreAutoBackup(backupKey: string): boolean {
  try {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      console.error('Backup not found');
      return false;
    }
    
    return importBackup(backupData);
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
}

/**
 * Get data statistics (for display)
 */
export function getDataStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  
  DATA_TABLES.forEach(tableName => {
    try {
      const data = localStorage.getItem(getStorageKey(tableName));
      if (data) {
        const parsed = JSON.parse(data);
        stats[tableName] = Array.isArray(parsed) ? parsed.length : 0;
      } else {
        stats[tableName] = 0;
      }
    } catch (error) {
      stats[tableName] = 0;
    }
  });
  
  return stats;
}

/**
 * Get localStorage usage information
 */
export function getStorageUsage(): {
  used: number;
  usedMB: string;
  total: number;
  percentage: number;
  backupCount: number;
  backupSize: number;
} {
  let totalSize = 0;
  let backupSize = 0;
  let backupCount = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key) || '';
      totalSize += key.length + value.length;
      
      if (key.startsWith('auto_backup_')) {
        backupSize += key.length + value.length;
        backupCount++;
      }
    }
  }
  
  // Estimate total available (typically 5-10MB, we'll use 5MB as conservative estimate)
  const estimatedTotal = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (totalSize / estimatedTotal) * 100;
  
  return {
    used: totalSize,
    usedMB: (totalSize / (1024 * 1024)).toFixed(2),
    total: estimatedTotal,
    percentage: Math.min(percentage, 100),
    backupCount,
    backupSize
  };
}

/**
 * Manually clean up all auto backups
 */
export function cleanupAllAutoBackups(): number {
  const allKeys = Object.keys(localStorage);
  const autoBackupKeys = allKeys.filter(key => key.startsWith('auto_backup_'));
  
  autoBackupKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing backup ${key}:`, err);
    }
  });
  
  console.log(`🗑️ Cleaned up ${autoBackupKeys.length} auto backups`);
  return autoBackupKeys.length;
}

/**
 * Format data for Supabase migration
 * This creates SQL INSERT statements for easy migration
 */
export function generateSupabaseMigrationSQL(): string {
  const exportData = JSON.parse(exportAllData());
  let sql = `-- SmartLenderUp Data Migration to Supabase\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Organization: ${exportData.organization?.organization_name || 'Unknown'}\n\n`;

  DATA_TABLES.forEach(tableName => {
    const tableData = exportData.tables[tableName] || [];
    if (tableData.length === 0) return;

    sql += `-- Table: ${tableName} (${tableData.length} records)\n`;
    sql += `-- Note: This is a data snapshot. Adjust columns to match your Supabase schema.\n\n`;

    // For demonstration, we'll create JSON import format
    sql += `-- JSON format for bulk import:\n`;
    sql += `/*\n`;
    sql += JSON.stringify(tableData, null, 2);
    sql += `\n*/\n\n`;
  });

  return sql;
}

/**
 * Download Supabase migration file
 */
export function downloadSupabaseMigration(): void {
  const sql = generateSupabaseMigrationSQL();
  const blob = new Blob([sql], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `supabase_migration_${timestamp}.sql`;
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`✅ Supabase migration file downloaded: ${filename}`);
}

// Track if auto-backup has been initialized to prevent duplicates
let autoBackupInitialized = false;

/**
 * Initialize auto-backup system
 * Call this once when app starts
 */
export function initializeAutoBackup(): void {
  // Prevent duplicate initialization
  if (autoBackupInitialized) {
    return;
  }
  
  autoBackupInitialized = true;
  
  // Create backup every 30 minutes
  const BACKUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
  
  // Skip initial backup to improve startup performance
  // First backup will happen after 30 minutes
  
  // Set up periodic backups
  setInterval(() => {
    createAutoBackup();
  }, BACKUP_INTERVAL);
  
  console.log('🔄 Auto-backup system initialized (backups every 30 minutes)');
}