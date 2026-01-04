// =====================================================
// QUICK DATABASE SETUP CHECK
// =====================================================
// Copy and paste this in browser console to verify setup
// =====================================================

(async function checkSetup() {
  console.log('🔍 Checking SmartLenderUp Setup...\n');
  
  // 1. Check if Supabase is connected
  if (!window.supabase) {
    console.error('❌ Supabase not connected!');
    return;
  }
  console.log('✅ Supabase connected');
  
  // 2. Check organizations table exists
  const { data: orgs, error: orgError } = await window.supabase
    .from('organizations')
    .select('id')
    .limit(1);
  
  if (orgError) {
    console.error('❌ Organizations table error:', orgError.message);
    if (orgError.code === '42P01') {
      console.log('💡 Run /COMPLETE_DATABASE_RESET.sql in Supabase');
    }
    return;
  }
  console.log('✅ Organizations table exists');
  
  // 3. Check for password_hash column
  const { data: testOrg, error: colError } = await window.supabase
    .from('organizations')
    .select('password_hash, username')
    .limit(1);
  
  if (colError) {
    console.error('❌ Missing columns:', colError.message);
    console.log('💡 Run /QUICK_FIX_AUTH_COLUMNS.sql in Supabase');
    return;
  }
  console.log('✅ Authentication columns exist (password_hash, username)');
  
  // 4. Count organizations
  const { count } = await window.supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Organizations in database: ${count || 0}`);
  
  // 5. Check localStorage
  const localOrg = localStorage.getItem('current_organization');
  if (localOrg) {
    const org = JSON.parse(localOrg);
    console.log('📦 localStorage organization:', org.organization_name);
    
    // Verify it exists in database
    const { data: dbOrg, error: verifyError } = await window.supabase
      .from('organizations')
      .select('organization_name')
      .eq('id', org.id)
      .maybeSingle();
    
    if (dbOrg) {
      console.log('✅ Organization synced to database');
    } else {
      console.warn('⚠️  Organization in localStorage but NOT in database!');
      console.log('💡 Run: window.checkAndFixOrganization()');
    }
  } else {
    console.log('📦 No organization in localStorage (not logged in)');
  }
  
  // Summary
  console.log('\n✅ SETUP CHECK COMPLETE!');
  console.log('🚀 You can now register and login\n');
})();
