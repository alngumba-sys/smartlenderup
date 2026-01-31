/**
 * Developer Migration Tools
 * Run these functions from the browser console to update data
 */

import { supabase } from '../lib/supabase';

export interface DateUpdateConfig {
  organizationId: string;
  newDate: string; // Format: YYYY-MM-DDTHH:mm:ss
}

/**
 * Update all KCB bank transactions (opening balance + funding) to October 1, 2025
 * Keeps the original time, only changes the date
 */
export async function updateKCBTransactionDates(config: DateUpdateConfig) {
  const { organizationId } = config;
  const targetDate = '2025-10-01';
  
  console.log(`🔄 Starting KCB transaction date update to ${targetDate}...`);
  
  try {
    // 1. Get the KCB bank account
    const { data: kcbAccount, error: accountError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .ilike('bank_name', '%KCB%')
      .single();
    
    if (accountError || !kcbAccount) {
      console.error('❌ KCB account not found:', accountError);
      return { success: false, error: 'KCB account not found' };
    }
    
    console.log('✅ Found KCB account:', kcbAccount.account_number);
    
    // 2. Update bank account created_at to Oct 1, 2025 (keeping original time)
    const originalCreatedAt = new Date(kcbAccount.created_at);
    const newCreatedAt = new Date(targetDate + 'T' + originalCreatedAt.toISOString().split('T')[1]);
    
    const { error: updateAccountError } = await supabase
      .from('bank_accounts')
      .update({ 
        created_at: newCreatedAt.toISOString()
      })
      .eq('id', kcbAccount.id);
    
    if (updateAccountError) {
      console.error('❌ Error updating bank account:', updateAccountError);
      return { success: false, error: updateAccountError };
    }
    
    console.log('✅ Updated bank account created_at');
    
    // 3. Get all funding transactions for KCB account
    const { data: fundingTransactions, error: fundingError } = await supabase
      .from('funding_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('bank_account_id', kcbAccount.id);
    
    if (fundingError) {
      console.error('❌ Error fetching funding transactions:', fundingError);
      return { success: false, error: fundingError };
    }
    
    console.log(`✅ Found ${fundingTransactions?.length || 0} funding transactions`);
    
    // 4. Update each funding transaction date
    if (fundingTransactions && fundingTransactions.length > 0) {
      for (const transaction of fundingTransactions) {
        const originalDate = new Date(transaction.date);
        const newTransactionDate = new Date(targetDate + 'T' + originalDate.toISOString().split('T')[1]);
        
        const { error: updateError } = await supabase
          .from('funding_transactions')
          .update({ date: newTransactionDate.toISOString() })
          .eq('id', transaction.id);
        
        if (updateError) {
          console.error(`❌ Error updating transaction ${transaction.id}:`, updateError);
        } else {
          console.log(`✅ Updated transaction ${transaction.id} to ${newTransactionDate.toISOString()}`);
        }
      }
    }
    
    console.log('✅ Successfully updated all KCB transaction dates!');
    return { success: true, accountId: kcbAccount.id, updatedTransactions: fundingTransactions?.length || 0 };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Link all approved loan repayments to the bank account
 */
export async function linkRepaymentsToBank(config: { organizationId: string; bankAccountId: string }) {
  const { organizationId, bankAccountId } = config;
  
  console.log(`🔄 Linking loan repayments to bank account...`);
  
  try {
    // Get all approved repayments that use Bank Transfer but don't have a bank account linked
    const { data: repayments, error: repaymentsError } = await supabase
      .from('repayments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'Approved')
      .or('bank_account_id.is.null,payment_method.eq.Bank Transfer');
    
    if (repaymentsError) {
      console.error('❌ Error fetching repayments:', repaymentsError);
      return { success: false, error: repaymentsError };
    }
    
    console.log(`✅ Found ${repayments?.length || 0} repayments to update`);
    
    // Update each repayment
    if (repayments && repayments.length > 0) {
      for (const repayment of repayments) {
        const { error: updateError } = await supabase
          .from('repayments')
          .update({ 
            bank_account_id: bankAccountId,
            payment_method: 'Bank Transfer'
          })
          .eq('id', repayment.id);
        
        if (updateError) {
          console.error(`❌ Error updating repayment ${repayment.id}:`, updateError);
        } else {
          console.log(`✅ Updated repayment ${repayment.receipt_number} to use bank account`);
        }
      }
    }
    
    console.log('✅ Successfully linked all repayments to bank account!');
    return { success: true, updatedRepayments: repayments?.length || 0 };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error };
  }
}

// Make functions available in window for console access
if (typeof window !== 'undefined') {
  (window as any).devMigration = {
    updateKCBTransactionDates,
    linkRepaymentsToBank
  };
  
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║  Developer Migration Tools Loaded                          ║
  ╚════════════════════════════════════════════════════════════╝
  
  Available functions:
  
  1. Update KCB transaction dates to Oct 1, 2025:
     window.devMigration.updateKCBTransactionDates({
       organizationId: 'your-org-id',
       newDate: '2025-10-01T09:08:00'
     });
  
  2. Link all repayments to bank account:
     window.devMigration.linkRepaymentsToBank({
       organizationId: 'your-org-id',
       bankAccountId: 'your-bank-account-id'
     });
  `);
}
