/**
 * 🔍 COMPREHENSIVE BANK ACCOUNTS DEBUGGER
 * 
 * Run this in your browser console to diagnose the issue
 */

(async function debugBankAccounts() {
  console.log('🔍 ========================================');
  console.log('🔍 BANK ACCOUNTS COMPREHENSIVE DEBUG');
  console.log('🔍 ========================================\n');

  // Step 1: Check organization
  console.log('📊 STEP 1: Organization Check');
  const orgData = localStorage.getItem('current_organization');
  if (!orgData) {
    console.error('❌ No organization found in localStorage!');
    return;
  }
  const org = JSON.parse(orgData);
  console.log('✅ Organization ID:', org.id);
  console.log('✅ Organization Name:', org.organization_name || org.name);
  console.log('');

  // Step 2: Check Supabase connection
  console.log('📊 STEP 2: Supabase Connection Check');
  try {
    const { supabase } = await import('./lib/supabase.js');
    console.log('✅ Supabase module loaded');

    // Step 3: Query database directly
    console.log('\n📊 STEP 3: Direct Database Query');
    const { data: bankAccounts, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('organization_id', org.id);

    if (error) {
      console.error('❌ Database query error:', error);
      return;
    }

    console.log(`✅ Found ${bankAccounts?.length || 0} bank accounts in database`);
    
    if (bankAccounts && bankAccounts.length > 0) {
      console.log('\n📋 RAW DATABASE DATA:');
      bankAccounts.forEach((acc, index) => {
        console.log(`\n--- Account ${index + 1} ---`);
        console.log('  ID:', acc.id);
        console.log('  account_name:', acc.account_name || '❌ MISSING');
        console.log('  account_number:', acc.account_number || '❌ MISSING');
        console.log('  bank_name:', acc.bank_name || '❌ MISSING');
        console.log('  branch:', acc.branch || '(empty)');
        console.log('  account_type:', acc.account_type || '❌ MISSING');
        console.log('  balance:', acc.balance || '(null)');
        console.log('  currency:', acc.currency || '(null)');
        console.log('  status:', acc.status || '(null)');
        console.log('  created_at:', acc.created_at);
      });
    } else {
      console.log('ℹ️ No accounts found in database');
      console.log('💡 This is why the UI shows "0 Bank Accounts"');
      console.log('💡 You need to create a new account');
    }

    // Step 4: Check React state
    console.log('\n📊 STEP 4: React State Check');
    const dataContext = window.__dataContext;
    if (dataContext && dataContext.bankAccounts) {
      console.log(`✅ Found ${dataContext.bankAccounts.length} bank accounts in React state`);
      
      if (dataContext.bankAccounts.length > 0) {
        console.log('\n📋 REACT STATE DATA:');
        dataContext.bankAccounts.forEach((acc, index) => {
          console.log(`\n--- Account ${index + 1} ---`);
          console.log('  ID:', acc.id);
          console.log('  accountName:', acc.accountName || '❌ MISSING');
          console.log('  accountNumber:', acc.accountNumber || '❌ MISSING');
          console.log('  bankName:', acc.bankName || '❌ MISSING');
          console.log('  branch:', acc.branch || '(empty)');
          console.log('  accountType:', acc.accountType || '❌ MISSING');
          console.log('  balance:', acc.balance || 0);
          console.log('  currency:', acc.currency || '(empty)');
          console.log('  status:', acc.status || '❌ MISSING');
          console.log('  createdDate:', acc.createdDate);
        });

        // Check filter conditions
        console.log('\n📊 STEP 5: Filter Check');
        const bankTypeAccounts = dataContext.bankAccounts.filter(acc => acc.accountType === 'Bank');
        const activeAccounts = dataContext.bankAccounts.filter(acc => acc.status === 'Active');
        const bankAndActive = dataContext.bankAccounts.filter(acc => acc.accountType === 'Bank' && acc.status === 'Active');

        console.log(`✅ Accounts with accountType="Bank": ${bankTypeAccounts.length}`);
        console.log(`✅ Accounts with status="Active": ${activeAccounts.length}`);
        console.log(`✅ Accounts with BOTH (Bank + Active): ${bankAndActive.length}`);
        
        if (bankAndActive.length === 0 && dataContext.bankAccounts.length > 0) {
          console.log('\n⚠️  PROBLEM FOUND!');
          console.log('You have accounts but they don\'t pass the filter');
          console.log('Reasons:');
          if (bankTypeAccounts.length === 0) {
            console.log('  ❌ None have accountType="Bank"');
            console.log('  💡 They might have:', dataContext.bankAccounts[0]?.accountType);
          }
          if (activeAccounts.length === 0) {
            console.log('  ❌ None have status="Active"');
            console.log('  💡 They might have:', dataContext.bankAccounts[0]?.status);
          }
        }
      }
    } else {
      console.log('❌ React state not accessible');
      console.log('💡 Try: window.__dataContext = useData() in a component');
    }

    // Step 6: Summary
    console.log('\n📊 STEP 6: Summary');
    console.log('Database accounts:', bankAccounts?.length || 0);
    console.log('React state accounts:', dataContext?.bankAccounts?.length || 'N/A');
    console.log('Filtered (Bank + Active):', dataContext?.bankAccounts?.filter(acc => acc.accountType === 'Bank' && acc.status === 'Active').length || 'N/A');

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (!bankAccounts || bankAccounts.length === 0) {
      console.log('1. Create a new bank account');
      console.log('2. Make sure to select "Bank" as Account Type');
      console.log('3. Refresh the page after creating');
    } else if (bankAccounts.length > 0 && (!dataContext?.bankAccounts || dataContext.bankAccounts.length === 0)) {
      console.log('1. Accounts exist in database but not loading to React state');
      console.log('2. Check console for loading errors');
      console.log('3. Try hard refresh: Ctrl+Shift+R');
    } else if (dataContext?.bankAccounts?.length > 0 && dataContext.bankAccounts.filter(acc => acc.accountType === 'Bank' && acc.status === 'Active').length === 0) {
      console.log('1. Accounts are loading but not passing the filter');
      console.log('2. Check accountType and status values');
      console.log('3. May need to update the mapping code');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }

  console.log('\n🔍 ========================================');
  console.log('🔍 DEBUG COMPLETE');
  console.log('🔍 ========================================');
})();
