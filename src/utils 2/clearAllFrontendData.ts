/**
 * Clear All Frontend Data Utility
 * Removes all sample/demo data from localStorage and resets the application
 * 
 * Usage: Run this in the browser console:
 *   window.clearAllFrontendData()
 * 
 * Or import and call from code:
 *   import { clearAllFrontendData } from './utils/clearAllFrontendData';
 *   await clearAllFrontendData();
 */

export async function clearAllFrontendData(): Promise<void> {
  console.log('🧹 ===== CLEARING ALL FRONTEND DATA =====');
  
  // STEP 1: Clear all SmartLenderUp/BV Funguo data keys
  console.log('📦 Step 1: Clearing all data from localStorage...');
  
  const dataKeys = [
    // Main data stores
    'bv_funguo_db',
    'bv_funguo_credentials',
    'bvfunguo_clients',
    'bvfunguo_loans',
    'bvfunguo_loan_products',
    'bvfunguo_repayments',
    'bvfunguo_savings_accounts',
    'bvfunguo_savings_transactions',
    'bvfunguo_shareholders',
    'bvfunguo_shareholder_transactions',
    'bvfunguo_dividends',
    'bvfunguo_payees',
    'bvfunguo_expenses',
    'bvfunguo_bank_accounts',
    'bvfunguo_bank_transactions',
    'bvfunguo_funding_transactions',
    'bvfunguo_other_income',
    'bvfunguo_groups',
    'bvfunguo_group_members',
    'bvfunguo_approvals',
    'bvfunguo_notifications',
    'bvfunguo_audit_logs',
    'bvfunguo_disbursements',
    'bvfunguo_processing_fee_records',
    'bvfunguo_journal_entries',
    'bvfunguo_journal_entry_lines',
    'bvfunguo_employees',
    'bvfunguo_payroll_records',
    'bvfunguo_branches',
    
    // Dashboard filter preferences
    'portfolioDuration',
    'principalDuration',
    'interestDuration',
    'processingFeeDuration',
    'clientsDuration',
    'disbursedDuration',
    'revenueDuration',
    'profitDuration',
    'expensesDuration',
    'arrearsAmountDuration',
    'collectionRateDuration',
    'activeClientsDuration',
    
    // Settings and preferences
    'bvfunguo_settings',
    'bvfunguo_user_preferences',
    'bvfunguo_dashboard_settings',
    'bvfunguo_filter_settings',
    
    // Migration and version flags
    'bvfunguo_data_version',
    'bvfunguo_data_cleared',
    'bvfunguo_migrated',
    'bvfunguo_client_id_migrated',
    
    // Organizations
    'bv_funguo_organizations',
    'bv_funguo_current_organization',
    
    // Supabase sync flags
    'supabase_sync_enabled',
    'supabase_last_sync',
    'supabase_synced_tables',
  ];

  let clearedCount = 0;
  
  // Clear specific keys
  dataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`   ✓ Removed: ${key}`);
    }
  });

  // Clear any remaining bvfunguo_* and bv_funguo_* keys
  console.log('📦 Step 2: Scanning for remaining keys...');
  const allKeys = Object.keys(localStorage);
  let additionalCount = 0;
  
  allKeys.forEach(key => {
    if (
      (key.startsWith('bvfunguo_') || 
       key.startsWith('bv_funguo_') ||
       key.startsWith('smartlenderup_')) &&
      !dataKeys.includes(key)
    ) {
      localStorage.removeItem(key);
      additionalCount++;
      console.log(`   ✓ Removed additional: ${key}`);
    }
  });

  console.log(`✅ Cleared ${clearedCount} predefined keys`);
  console.log(`✅ Cleared ${additionalCount} additional keys`);
  console.log(`✅ Total: ${clearedCount + additionalCount} keys removed`);

  // STEP 3: Clear session storage
  console.log('📦 Step 3: Clearing sessionStorage...');
  const sessionKeys = Object.keys(sessionStorage);
  let sessionCount = 0;
  
  sessionKeys.forEach(key => {
    if (
      key.startsWith('bvfunguo_') || 
      key.startsWith('bv_funguo_') ||
      key.startsWith('smartlenderup_')
    ) {
      sessionStorage.removeItem(key);
      sessionCount++;
      console.log(`   ✓ Removed from session: ${key}`);
    }
  });
  
  console.log(`✅ Cleared ${sessionCount} session storage keys`);

  // STEP 4: Report IndexedDB (if any)
  console.log('📦 Step 4: Checking IndexedDB...');
  if ('indexedDB' in window) {
    try {
      const databases = await indexedDB.databases();
      const relevantDbs = databases.filter(db => 
        db.name?.includes('bvfunguo') || 
        db.name?.includes('smartlenderup')
      );
      
      if (relevantDbs.length > 0) {
        console.log('⚠️  Found IndexedDB databases (cannot auto-delete):');
        relevantDbs.forEach(db => {
          console.log(`   - ${db.name}`);
        });
        console.log('💡 Manually delete these in DevTools > Application > IndexedDB');
      } else {
        console.log('✅ No relevant IndexedDB databases found');
      }
    } catch (err) {
      console.log('⚠️  Could not check IndexedDB:', err);
    }
  }

  // STEP 5: Summary
  console.log('\\n✅ ===== FRONTEND DATA CLEARED =====');
  console.log('📊 Summary:');
  console.log(`   • LocalStorage: ${clearedCount + additionalCount} keys removed`);
  console.log(`   • SessionStorage: ${sessionCount} keys removed`);
  console.log('\\n📌 What was cleared:');
  console.log('   ✓ All client data');
  console.log('   ✓ All loan data');
  console.log('   ✓ All loan products');
  console.log('   ✓ All repayments');
  console.log('   ✓ All savings accounts & transactions');
  console.log('   ✓ All shareholders & transactions');
  console.log('   ✓ All bank accounts & transactions');
  console.log('   ✓ All expenses & payees');
  console.log('   ✓ All employees & payroll');
  console.log('   ✓ All journal entries');
  console.log('   ✓ All groups & memberships');
  console.log('   ✓ All approvals & notifications');
  console.log('   ✓ All audit logs');
  console.log('   ✓ All dashboard filters');
  console.log('   ✓ All settings & preferences');
  
  console.log('\\n⚠️  NOT CLEARED (preserved):');
  console.log('   • Supabase authentication tokens');
  console.log('   • User login session');
  console.log('   • Theme preferences');
  
  console.log('\\n🔄 Refreshing page in 3 seconds...');
  console.log('💡 Your app will now connect to Supabase with a clean slate!');

  // Auto-refresh after 3 seconds
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}

/**
 * Clear all data WITHOUT refreshing (for programmatic use)
 */
export function clearAllFrontendDataNoRefresh(): void {
  console.log('🧹 Clearing frontend data (no refresh)...');
  
  // Get all keys first
  const allKeys = Object.keys(localStorage);
  
  // Remove data keys
  let count = 0;
  allKeys.forEach(key => {
    if (
      key.startsWith('bvfunguo_') || 
      key.startsWith('bv_funguo_') ||
      key.startsWith('smartlenderup_') ||
      key.includes('Duration') // Dashboard filters
    ) {
      // Preserve auth tokens
      if (!key.includes('auth') && !key.includes('token') && !key.includes('session')) {
        localStorage.removeItem(key);
        count++;
      }
    }
  });
  
  console.log(`✅ Cleared ${count} keys (no refresh)`);
}

/**
 * Clear EVERYTHING including auth (nuclear option)
 */
export async function clearEverything(): Promise<void> {
  console.log('☢️  ===== NUCLEAR RESET: CLEARING EVERYTHING =====');
  console.log('⚠️  This will log you out and clear ALL data!');
  
  // Confirm with user
  const confirmed = window.confirm(
    '🚨 NUCLEAR RESET 🚨\\n\\n' +
    'This will clear EVERYTHING including:\\n' +
    '• All application data\\n' +
    '• Your login session\\n' +
    '• All preferences\\n\\n' +
    'You will need to log in again.\\n\\n' +
    'Are you absolutely sure?'
  );
  
  if (!confirmed) {
    console.log('❌ Nuclear reset cancelled');
    return;
  }
  
  // Clear localStorage
  localStorage.clear();
  console.log('✅ LocalStorage completely cleared');
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✅ SessionStorage completely cleared');
  
  // Clear cookies
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  console.log('✅ Cookies cleared');
  
  console.log('\\n☢️  EVERYTHING CLEARED');
  console.log('🔄 Redirecting to login in 2 seconds...');
  
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
}

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).clearAllFrontendData = clearAllFrontendData;
  (window as any).clearAllFrontendDataNoRefresh = clearAllFrontendDataNoRefresh;
  (window as any).clearEverything = clearEverything;
  
  console.log('💡 Frontend Data Clear Utilities loaded:');
  console.log('   • clearAllFrontendData() - Clear all data & refresh');
  console.log('   • clearAllFrontendDataNoRefresh() - Clear data without refresh');
  console.log('   • clearEverything() - Nuclear option (clears auth too)');
}

export default clearAllFrontendData;
