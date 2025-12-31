/**
 * Utility to clear all SmartLenderUp application data from localStorage
 * This will remove all cached application data and reset to fresh state
 */

export function clearAllApplicationData(): void {
  // List of all known localStorage keys used by the application
  const keys = [
    'bvfunguo_clients',
    'bvfunguo_loans',
    'bvfunguo_loan_products',
    'bvfunguo_repayments',
    'bvfunguo_savings_accounts',
    'bvfunguo_savings_transactions',
    'bvfunguo_shareholders',
    'bvfunguo_dividends',
    'bvfunguo_payees',
    'bvfunguo_expenses',
    'bvfunguo_bank_accounts',
    'bvfunguo_bank_transactions',
    'bvfunguo_other_income',
    'bvfunguo_groups',
    'bvfunguo_group_members',
    'bvfunguo_approvals',
    'bvfunguo_notifications',
    'bvfunguo_audit_logs',
    'bvfunguo_disbursements',
    'bvfunguo_processing_fee_records',
  ];

  // Remove all known keys
  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  // Also scan for any keys that start with 'bvfunguo_' that we might have missed
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('bvfunguo_')) {
      localStorage.removeItem(key);
    }
  });

  console.log('✅ All application data cleared from localStorage');
  console.log('📋 Cleared ' + (keys.length + allKeys.filter(k => k.startsWith('bvfunguo_')).length) + ' storage keys');
  console.log('🔄 Please refresh the page (F5 or Ctrl+R) to start with a clean state');
  
  // Automatically refresh the page after 2 seconds
  setTimeout(() => {
    console.log('🔄 Auto-refreshing page...');
    window.location.reload();
  }, 2000);
}

// Add to window for easy access from browser console
if (typeof window !== 'undefined') {
  (window as any).clearAppData = clearAllApplicationData;
  console.log('💡 localStorage clear utility loaded. Type clearAppData() in console to clear all data.');
}