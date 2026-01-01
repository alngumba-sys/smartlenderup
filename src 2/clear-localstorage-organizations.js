// =====================================================
// CLEAR LOCALSTORAGE ORGANIZATIONS
// =====================================================
// Run this in your browser console to remove all
// organization data from localStorage
// =====================================================

(function clearLocalStorageOrganizations() {
  console.log('🧹 Cleaning up localStorage organizations...');
  
  // 1. Remove the entire bv_funguo_db (contains all local data)
  const dbData = localStorage.getItem('bv_funguo_db');
  if (dbData) {
    console.log('❌ Removing bv_funguo_db (local database)');
    localStorage.removeItem('bv_funguo_db');
  }
  
  // 2. Remove current organization context
  const currentOrg = localStorage.getItem('current_organization');
  if (currentOrg) {
    console.log('❌ Removing current_organization');
    localStorage.removeItem('current_organization');
  }
  
  // 3. Remove saved credentials (optional - keeps you logged in)
  // Uncomment the next 4 lines if you want to clear saved login credentials too
  // const credentials = localStorage.getItem('bv_funguo_credentials');
  // if (credentials) {
  //   console.log('❌ Removing bv_funguo_credentials');
  //   localStorage.removeItem('bv_funguo_credentials');
  // }
  
  // 4. Verify cleanup
  console.log('\n✅ Cleanup complete!');
  console.log('📊 Verification:');
  console.log('  - bv_funguo_db:', localStorage.getItem('bv_funguo_db') || 'null (✓ removed)');
  console.log('  - current_organization:', localStorage.getItem('current_organization') || 'null (✓ removed)');
  
  // 5. Show summary
  console.log('\n📝 Summary:');
  console.log('  ✅ All organization data removed from localStorage');
  console.log('  ✅ Organizations now only stored in Supabase');
  console.log('  ℹ️  Refresh page to complete cleanup');
  
  return {
    success: true,
    message: 'Organizations removed from localStorage. Refresh the page.',
    action: 'Please refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)'
  };
})();
