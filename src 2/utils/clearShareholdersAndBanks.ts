// Utility to clear shareholders and bank accounts for the current organization
// This is useful when starting fresh with a new company

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

function clearShareholdersAndBanksData(): void {
  const confirmed = confirm(
    '⚠️ WARNING: This will permanently delete all shareholders, shareholder transactions, bank accounts, and funding transactions for the current organization.\n\n' +
    'This action cannot be undone!\n\n' +
    'Are you sure you want to continue?'
  );
  
  if (!confirmed) {
    console.log('❌ Operation cancelled');
    return;
  }

  try {
    // Clear shareholders and their transactions
    localStorage.removeItem(getStorageKey('bvfunguo_shareholders'));
    localStorage.removeItem(getStorageKey('bvfunguo_shareholder_transactions'));
    
    // Clear bank accounts and funding transactions
    localStorage.removeItem(getStorageKey('bvfunguo_bank_accounts'));
    localStorage.removeItem(getStorageKey('bvfunguo_funding_transactions'));
    
    console.log('✅ Successfully cleared:');
    console.log('  - All shareholders');
    console.log('  - All shareholder transactions');
    console.log('  - All bank accounts');
    console.log('  - All funding transactions');
    console.log('\n🔄 Please refresh the page to see the changes.');
    
    // Auto-refresh after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Add to window for easy access from browser console
if (typeof window !== 'undefined') {
  (window as any).clearShareholdersAndBanks = clearShareholdersAndBanksData;
  console.log('💡 To clear all shareholders and bank accounts, run: clearShareholdersAndBanks()');
}

export {};