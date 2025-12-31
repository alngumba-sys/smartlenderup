import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { isValidUUID } from './uuidUtils';

/**
 * Database Cleanup Utilities
 * Functions to clean up invalid records and ensure database integrity
 */

/**
 * Removes all records with null or invalid UUIDs from a table
 * @param tableName - Name of the table to clean
 * @param orgId - Organization ID to filter by (optional)
 * @returns Number of records deleted
 */
export const cleanupInvalidRecords = async (
  tableName: string,
  orgId?: string
): Promise<{ success: boolean; deletedCount: number; error?: string }> => {
  try {
    console.log(`🧹 Cleaning up invalid records in ${tableName}...`);

    // Tables that don't have organization_id column
    const tablesWithoutOrgId = ['payments', 'mpesa_transactions'];
    const hasOrgIdColumn = !tablesWithoutOrgId.includes(tableName);

    // First, fetch all records to check for invalid IDs
    let query = hasOrgIdColumn 
      ? supabase.from(tableName).select('id, organization_id')
      : supabase.from(tableName).select('id');
    
    if (orgId && hasOrgIdColumn) {
      query = query.eq('organization_id', orgId);
    }

    const { data: records, error: fetchError } = await query;

    if (fetchError) {
      console.error(`Error fetching records from ${tableName}:`, fetchError);
      return { success: false, deletedCount: 0, error: fetchError.message };
    }

    if (!records || records.length === 0) {
      console.log(`✅ No records found in ${tableName}`);
      return { success: true, deletedCount: 0 };
    }

    // Find records with null or invalid UUIDs
    const invalidRecords = records.filter(record => !isValidUUID(record.id));

    if (invalidRecords.length === 0) {
      console.log(`✅ All ${records.length} records in ${tableName} have valid UUIDs`);
      return { success: true, deletedCount: 0 };
    }

    console.warn(`⚠️ Found ${invalidRecords.length} records with invalid IDs in ${tableName}`);

    // Delete invalid records
    const invalidIds = invalidRecords.map(r => r.id).filter(id => id !== null);

    if (invalidIds.length > 0) {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .in('id', invalidIds);

      if (deleteError) {
        console.error(`Error deleting invalid records from ${tableName}:`, deleteError);
        return { success: false, deletedCount: 0, error: deleteError.message };
      }
    }

    // Also delete any records where ID is explicitly null
    const { error: deleteNullError } = await supabase
      .from(tableName)
      .delete()
      .is('id', null);

    if (deleteNullError && deleteNullError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error(`Error deleting null ID records from ${tableName}:`, deleteNullError);
      return { success: false, deletedCount: invalidRecords.length, error: deleteNullError.message };
    }

    console.log(`✅ Cleaned up ${invalidRecords.length} invalid records from ${tableName}`);
    return { success: true, deletedCount: invalidRecords.length };

  } catch (error: any) {
    console.error(`Error in cleanup for ${tableName}:`, error);
    return { success: false, deletedCount: 0, error: error.message };
  }
};

/**
 * Cleans up all main tables in the database
 * @param orgId - Organization ID to filter by (optional)
 * @returns Summary of cleanup operations
 */
export const cleanupAllInvalidRecords = async (
  orgId?: string
): Promise<{
  success: boolean;
  summary: Record<string, { deletedCount: number; error?: string }>;
}> => {
  console.log('🧹 Starting comprehensive database cleanup...');

  const tables = [
    'clients',
    'loans',
    'loan_products',
    'payments',
    'savings_accounts',
    'savings_transactions',
    'groups',
    'guarantors',
    'collaterals',
    'loan_documents',
  ];

  const summary: Record<string, { deletedCount: number; error?: string }> = {};
  let allSuccess = true;

  for (const table of tables) {
    const result = await cleanupInvalidRecords(table, orgId);
    summary[table] = {
      deletedCount: result.deletedCount,
      error: result.error,
    };
    
    if (!result.success) {
      allSuccess = false;
    }
  }

  const totalDeleted = Object.values(summary).reduce(
    (sum, { deletedCount }) => sum + deletedCount,
    0
  );

  if (totalDeleted > 0) {
    console.log(`✅ Database cleanup complete: ${totalDeleted} invalid records removed`);
    toast.success('Database Cleaned', {
      description: `Removed ${totalDeleted} invalid records from the database.`,
    });
  } else {
    console.log('✅ Database cleanup complete: No invalid records found');
  }

  return { success: allSuccess, summary };
};

/**
 * Validates all UUIDs in localStorage and removes invalid entries
 * This helps prevent invalid data from being synced to Supabase
 */
export const cleanupLocalStorageUUIDs = (): {
  success: boolean;
  removedCount: number;
  details: Record<string, number>;
} => {
  console.log('🧹 Cleaning up localStorage UUIDs...');

  const details: Record<string, number> = {};
  let totalRemoved = 0;

  const keysToCheck = [
    'clients',
    'loans',
    'loanProducts',
    'repayments',
    'savingsAccounts',
    'savingsTransactions',
    'groups',
    'guarantors',
    'collaterals',
    'loanDocuments',
  ];

  for (const key of keysToCheck) {
    try {
      const data = localStorage.getItem(key);
      if (!data) continue;

      const items = JSON.parse(data);
      if (!Array.isArray(items)) continue;

      const validItems = items.filter((item: any) => {
        if (!item || !item.id) return false;
        return isValidUUID(item.id);
      });

      const removed = items.length - validItems.length;
      if (removed > 0) {
        localStorage.setItem(key, JSON.stringify(validItems));
        details[key] = removed;
        totalRemoved += removed;
        console.log(`  ✅ Removed ${removed} invalid ${key} from localStorage`);
      }
    } catch (error) {
      console.error(`Error cleaning localStorage key ${key}:`, error);
    }
  }

  if (totalRemoved > 0) {
    console.log(`✅ localStorage cleanup complete: ${totalRemoved} invalid items removed`);
  } else {
    console.log('✅ localStorage cleanup complete: No invalid items found');
  }

  return { success: true, removedCount: totalRemoved, details };
};

/**
 * Comprehensive cleanup that runs both database and localStorage cleanup
 * Call this on app initialization to ensure data integrity
 */
export const runComprehensiveCleanup = async (
  orgId?: string
): Promise<{
  success: boolean;
  databaseCleanup: Awaited<ReturnType<typeof cleanupAllInvalidRecords>>;
  localStorageCleanup: ReturnType<typeof cleanupLocalStorageUUIDs>;
}> => {
  console.log('🚀 Running comprehensive cleanup...');

  // Clean localStorage first to prevent re-syncing invalid data
  const localStorageCleanup = cleanupLocalStorageUUIDs();

  // Then clean the database
  const databaseCleanup = await cleanupAllInvalidRecords(orgId);

  const allSuccess = databaseCleanup.success && localStorageCleanup.success;

  if (allSuccess) {
    console.log('✅ Comprehensive cleanup complete');
  } else {
    console.warn('⚠️ Comprehensive cleanup completed with some errors');
  }

  return {
    success: allSuccess,
    databaseCleanup,
    localStorageCleanup,
  };
};