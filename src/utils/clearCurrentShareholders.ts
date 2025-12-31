// Auto-clear shareholders and contributions on load
// This runs once when imported

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

// Clear shareholders and their transactions immediately
try {
  // Clear shareholders and their transactions
  localStorage.removeItem(getStorageKey('bvfunguo_shareholders'));
  localStorage.removeItem(getStorageKey('bvfunguo_shareholder_transactions'));
  
  // Clear bank accounts and funding transactions
  localStorage.removeItem(getStorageKey('bvfunguo_bank_accounts'));
  localStorage.removeItem(getStorageKey('bvfunguo_funding_transactions'));
  
  console.log('✅ Successfully cleared all shareholders, contributions, and bank accounts');
} catch (error) {
  console.error('❌ Error clearing data:', error);
}

export {};
