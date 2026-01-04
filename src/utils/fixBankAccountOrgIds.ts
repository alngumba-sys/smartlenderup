/**
 * Fix Bank Account Organization IDs
 * 
 * This utility updates all bank accounts to use the correct organization ID
 * from the currently logged-in user.
 */

import { supabase } from '../lib/supabase';

export async function fixBankAccountOrgIds(): Promise<void> {
  try {
    // Get current user's organization ID
    const storedUser = localStorage.getItem('bvfunguo_user');
    if (!storedUser) {
      console.error('❌ No user found in localStorage');
      return;
    }

    const user = JSON.parse(storedUser);
    const correctOrgId = user.organizationId;

    if (!correctOrgId) {
      console.error('❌ User does not have an organizationId');
      return;
    }

    console.log('🔧 Fixing bank account organization IDs...');
    console.log('   Correct Organization ID:', correctOrgId);

    // Get ALL bank accounts (regardless of organization)
    const { data: allAccounts, error: fetchError } = await supabase
      .from('bank_accounts')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching bank accounts:', fetchError);
      return;
    }

    console.log(`   Found ${allAccounts?.length || 0} total bank accounts`);

    if (!allAccounts || allAccounts.length === 0) {
      console.log('ℹ️  No bank accounts to fix');
      return;
    }

    // Filter accounts that have wrong organization ID
    const accountsToFix = allAccounts.filter(
      (acc) => acc.organization_id !== correctOrgId
    );

    console.log(`   Accounts to fix: ${accountsToFix.length}`);

    if (accountsToFix.length === 0) {
      console.log('✅ All bank accounts already have correct organization ID!');
      return;
    }

    // Update each account
    for (const account of accountsToFix) {
      console.log(`   Updating account: ${account.account_name} (${account.id})`);
      console.log(`      Old org ID: ${account.organization_id}`);
      console.log(`      New org ID: ${correctOrgId}`);

      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update({ organization_id: correctOrgId })
        .eq('id', account.id);

      if (updateError) {
        console.error(`   ❌ Error updating account ${account.id}:`, updateError);
      } else {
        console.log(`   ✅ Updated account ${account.id}`);
      }
    }

    console.log('🎉 Bank account organization IDs fixed!');
    console.log('   Please refresh the page to see your accounts.');
    
  } catch (error) {
    console.error('❌ Error in fixBankAccountOrgIds:', error);
  }
}

// Register as window function for easy access
if (typeof window !== 'undefined') {
  (window as any).fixBankAccountOrgIds = fixBankAccountOrgIds;
  console.log('🔧 Fix tool ready! Type: window.fixBankAccountOrgIds()');
}
