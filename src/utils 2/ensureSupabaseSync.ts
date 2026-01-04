/**
 * Comprehensive Supabase Sync Utility
 * 
 * This utility ensures ALL clients, loans, and products are properly saved to Supabase
 * - Syncs current in-memory data
 * - Migrates any remaining localStorage data
 * - Provides detailed progress reporting
 * - Handles errors gracefully
 */

import * as supabaseService from '../lib/supabaseService';
import { toast } from 'sonner@2.0.3';

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

// Safe JSON parse with fallback
const safeParse = (key: string, fallback: any = []) => {
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key}:`, e);
    return fallback;
  }
};

export interface SyncResult {
  success: boolean;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    entity: string;
    id: string;
    error: string;
  }>;
  details: {
    clients: { total: number; synced: number; failed: number };
    loans: { total: number; synced: number; failed: number };
    loanProducts: { total: number; synced: number; failed: number };
  };
}

/**
 * Sync clients to Supabase
 */
async function syncClients(clients: any[]): Promise<{ synced: number; failed: number; errors: any[] }> {
  console.log(`📝 Syncing ${clients.length} clients to Supabase...`);
  let synced = 0;
  let failed = 0;
  const errors: any[] = [];

  for (const client of clients) {
    try {
      const success = await supabaseService.createClient(client);
      if (success) {
        synced++;
      } else {
        failed++;
        errors.push({
          entity: 'client',
          id: client.id || 'unknown',
          error: 'Sync returned false'
        });
      }
    } catch (error: any) {
      failed++;
      errors.push({
        entity: 'client',
        id: client.id || 'unknown',
        error: error.message || 'Unknown error'
      });
      console.error(`Error syncing client ${client.id}:`, error);
    }
  }

  return { synced, failed, errors };
}

/**
 * Sync loan products to Supabase
 */
async function syncLoanProducts(products: any[]): Promise<{ synced: number; failed: number; errors: any[] }> {
  console.log(`📝 Syncing ${products.length} loan products to Supabase...`);
  let synced = 0;
  let failed = 0;
  const errors: any[] = [];

  for (const product of products) {
    try {
      const success = await supabaseService.createLoanProduct(product);
      if (success) {
        synced++;
      } else {
        failed++;
        errors.push({
          entity: 'loan_product',
          id: product.id || 'unknown',
          error: 'Sync returned false'
        });
      }
    } catch (error: any) {
      failed++;
      errors.push({
        entity: 'loan_product',
        id: product.id || 'unknown',
        error: error.message || 'Unknown error'
      });
      console.error(`Error syncing loan product ${product.id}:`, error);
    }
  }

  return { synced, failed, errors };
}

/**
 * Sync loans to Supabase
 */
async function syncLoans(loans: any[]): Promise<{ synced: number; failed: number; errors: any[] }> {
  console.log(`📝 Syncing ${loans.length} loans to Supabase...`);
  let synced = 0;
  let failed = 0;
  const errors: any[] = [];

  for (const loan of loans) {
    try {
      const success = await supabaseService.createLoan(loan);
      if (success) {
        synced++;
      } else {
        failed++;
        errors.push({
          entity: 'loan',
          id: loan.id || 'unknown',
          error: 'Sync returned false'
        });
      }
    } catch (error: any) {
      failed++;
      errors.push({
        entity: 'loan',
        id: loan.id || 'unknown',
        error: error.message || 'Unknown error'
      });
      console.error(`Error syncing loan ${loan.id}:`, error);
    }
  }

  return { synced, failed, errors };
}

/**
 * Main function to ensure all data is synced to Supabase
 * Accepts current state data and also checks localStorage for any remaining data
 */
export async function ensureSupabaseSync(
  currentClients: any[] = [],
  currentLoans: any[] = [],
  currentLoanProducts: any[] = []
): Promise<SyncResult> {
  console.log('🚀 Starting comprehensive Supabase sync...');
  toast.info('Starting sync to Supabase...', { duration: 3000 });

  try {
    // Combine current state with any data from localStorage
    const localClients = safeParse('bvfunguo_clients', []);
    const localLoans = safeParse('bvfunguo_loans', []);
    const localLoanProducts = safeParse('bvfunguo_loan_products', []);

    // Merge data (deduplicate by ID)
    const allClients = mergeArrays(currentClients, localClients, 'id');
    const allLoans = mergeArrays(currentLoans, localLoans, 'id');
    const allLoanProducts = mergeArrays(currentLoanProducts, localLoanProducts, 'id');

    console.log(`📊 Total data to sync:
      - Clients: ${allClients.length} (${currentClients.length} in state + ${localClients.length} in localStorage)
      - Loans: ${allLoans.length} (${currentLoans.length} in state + ${localLoans.length} in localStorage)
      - Loan Products: ${allLoanProducts.length} (${currentLoanProducts.length} in state + ${localLoanProducts.length} in localStorage)
    `);

    // Sync in proper order (dependencies matter!)
    // 1. Clients first (loans depend on clients)
    const clientsResult = await syncClients(allClients);
    
    // 2. Loan Products (loans depend on products)
    const productsResult = await syncLoanProducts(allLoanProducts);
    
    // 3. Loans last (depend on both clients and products)
    const loansResult = await syncLoans(allLoans);

    // Aggregate results
    const totalRecords = allClients.length + allLoans.length + allLoanProducts.length;
    const successCount = clientsResult.synced + productsResult.synced + loansResult.synced;
    const errorCount = clientsResult.failed + productsResult.failed + loansResult.failed;
    const allErrors = [...clientsResult.errors, ...productsResult.errors, ...loansResult.errors];

    const result: SyncResult = {
      success: errorCount === 0,
      totalRecords,
      successCount,
      errorCount,
      errors: allErrors,
      details: {
        clients: {
          total: allClients.length,
          synced: clientsResult.synced,
          failed: clientsResult.failed
        },
        loans: {
          total: allLoans.length,
          synced: loansResult.synced,
          failed: loansResult.failed
        },
        loanProducts: {
          total: allLoanProducts.length,
          synced: productsResult.synced,
          failed: productsResult.failed
        }
      }
    };

    // Log results
    console.log('✅ Sync complete!');
    console.log(`📊 Results:
      - Total records: ${totalRecords}
      - Successfully synced: ${successCount}
      - Failed: ${errorCount}
      
      Details:
      - Clients: ${clientsResult.synced}/${allClients.length} synced
      - Loan Products: ${productsResult.synced}/${allLoanProducts.length} synced
      - Loans: ${loansResult.synced}/${allLoans.length} synced
    `);

    // Show toast with results
    if (errorCount === 0) {
      toast.success('All data synced to Supabase!', {
        description: `${successCount} records synced successfully.`,
        duration: 5000,
      });
    } else {
      toast.warning('Sync completed with errors', {
        description: `${successCount} succeeded, ${errorCount} failed. Check console for details.`,
        duration: 8000,
      });
      // Log errors to console
      console.error('Sync errors:', allErrors);
    }

    return result;
  } catch (error: any) {
    console.error('❌ Sync failed:', error);
    toast.error('Sync failed', {
      description: error.message || 'Unknown error occurred',
      duration: 5000,
    });
    
    return {
      success: false,
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [{
        entity: 'system',
        id: 'N/A',
        error: error.message || 'Unknown error'
      }],
      details: {
        clients: { total: 0, synced: 0, failed: 0 },
        loans: { total: 0, synced: 0, failed: 0 },
        loanProducts: { total: 0, synced: 0, failed: 0 }
      }
    };
  }
}

/**
 * Merge two arrays, deduplicating by a key field
 * Prefers items from the first array (current state)
 */
function mergeArrays(arr1: any[], arr2: any[], keyField: string): any[] {
  const merged = [...arr1];
  const existingIds = new Set(arr1.map(item => item[keyField]));
  
  // Add items from arr2 that don't exist in arr1
  for (const item of arr2) {
    if (!existingIds.has(item[keyField])) {
      merged.push(item);
      existingIds.add(item[keyField]);
    }
  }
  
  return merged;
}

/**
 * Quick check to see if sync is needed
 */
export function checkSyncNeeded(): boolean {
  const localClients = safeParse('bvfunguo_clients', []);
  const localLoans = safeParse('bvfunguo_loans', []);
  const localLoanProducts = safeParse('bvfunguo_loan_products', []);
  
  return localClients.length > 0 || localLoans.length > 0 || localLoanProducts.length > 0;
}

/**
 * Get counts of local data that might need syncing
 */
export function getLocalDataCounts() {
  return {
    clients: safeParse('bvfunguo_clients', []).length,
    loans: safeParse('bvfunguo_loans', []).length,
    loanProducts: safeParse('bvfunguo_loan_products', []).length
  };
}

// Register globally for console access
if (typeof window !== 'undefined') {
  (window as any).ensureSupabaseSync = ensureSupabaseSync;
  (window as any).checkSyncNeeded = checkSyncNeeded;
  (window as any).getLocalDataCounts = getLocalDataCounts;
  console.log('💡 Sync utilities ready!');
  console.log('  - window.ensureSupabaseSync() - Sync all data to Supabase');
  console.log('  - window.checkSyncNeeded() - Check if sync is needed');
  console.log('  - window.getLocalDataCounts() - Get local data counts');
}
