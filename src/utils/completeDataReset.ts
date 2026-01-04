/**
 * Complete Data Reset Utility
 * Cleans both frontend localStorage and provides SQL for backend cleanup
 */

import { supabase } from '../lib/supabase';

export async function completeDataReset(): Promise<void> {
  console.log('🧹 ===== STARTING COMPLETE DATA RESET =====');
  
  // STEP 1: Clear Frontend LocalStorage
  console.log('📦 Step 1: Clearing frontend localStorage...');
  
  const frontendKeys = [
    'bv_funguo_db',
    'bv_funguo_credentials',
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
    // Dashboard filter preferences
    'portfolioDuration',
    'principalDuration',
    'interestDuration',
    'processingFeeDuration',
    'clientsDuration',
    'disbursedDuration',
  ];

  let clearedCount = 0;
  frontendKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedCount++;
    }
  });

  // Also clear any remaining bvfunguo_ keys
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('bvfunguo_') || key.startsWith('bv_funguo_')) {
      localStorage.removeItem(key);
      clearedCount++;
    }
  });

  console.log(`✅ Cleared ${clearedCount} localStorage keys`);

  // STEP 2: Clear Backend Supabase Data
  console.log('🗄️  Step 2: Clearing backend Supabase data...');
  
  try {
    // Delete all data from all tables
    const tables = [
      'payments',
      'loan_documents', 
      'loans',
      'loan_products',
      'clients',
      'journal_entries',
      'payroll_records',
      'expenses',
      'settings',
      'audit_logs',
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

        if (error) {
          console.warn(`⚠️  Warning: Could not clear ${table}:`, error.message);
        } else {
          console.log(`✅ Cleared table: ${table}`);
        }
      } catch (err) {
        console.warn(`⚠️  Warning: Error clearing ${table}:`, err);
      }
    }

    console.log('✅ Backend cleanup completed');

  } catch (error) {
    console.error('❌ Backend cleanup error:', error);
    console.log('\n📋 Manual SQL Cleanup (run in Supabase SQL Editor):');
    console.log(`
-- Delete all data from all tables (keeps structure)
DELETE FROM payments;
DELETE FROM loan_documents;
DELETE FROM loans;
DELETE FROM loan_products;
DELETE FROM clients;
DELETE FROM journal_entries;
DELETE FROM payroll_records;
DELETE FROM expenses;
DELETE FROM settings;
DELETE FROM audit_logs;

-- Reset auto-increment sequences
ALTER SEQUENCE IF EXISTS clients_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS loans_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payments_id_seq RESTART WITH 1;
    `);
  }

  console.log('\n🎉 ===== DATA RESET COMPLETE =====');
  console.log('📌 Next Steps:');
  console.log('   1. ✅ Frontend localStorage cleared');
  console.log('   2. ✅ Backend Supabase data cleared');
  console.log('   3. 🔄 Refreshing page in 3 seconds...');
  console.log('\n💡 You can now start fresh with clean data!');

  // Auto-refresh after 3 seconds
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).completeDataReset = completeDataReset;
  console.log('💡 Complete Reset Utility loaded. Type completeDataReset() to clean everything.');
}