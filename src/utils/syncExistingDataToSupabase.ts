/**
 * Sync Existing LocalStorage Data to Supabase
 * 
 * This utility syncs data that was created before Supabase sync was enabled
 * 
 * Usage: Run in browser console:
 *   window.syncExistingDataToSupabase()
 */

import { syncToSupabase } from './supabaseSync';
import { toast } from 'sonner@2.0.3';

export async function syncExistingDataToSupabase(): Promise<void> {
  console.log('🔄 ===== SYNCING EXISTING DATA TO SUPABASE =====');
  
  let totalSynced = 0;
  let totalFailed = 0;
  
  try {
    // Sync Shareholders
    const shareholdersData = localStorage.getItem('bvfunguo_shareholders');
    if (shareholdersData) {
      const shareholders = JSON.parse(shareholdersData);
      console.log(`📊 Found ${shareholders.length} shareholders to sync`);
      
      for (const shareholder of shareholders) {
        try {
          const success = await syncToSupabase('create', 'shareholder', shareholder);
          if (success) {
            totalSynced++;
            console.log(`✅ Synced shareholder: ${shareholder.name} (ID: ${shareholder.id})`);
          } else {
            totalFailed++;
            console.warn(`⚠️ Failed to sync shareholder: ${shareholder.name}`);
          }
        } catch (err) {
          totalFailed++;
          console.error(`❌ Error syncing shareholder ${shareholder.name}:`, err);
        }
      }
    }
    
    // Sync Shareholder Transactions
    const shareholderTransactionsData = localStorage.getItem('bvfunguo_shareholder_transactions');
    if (shareholderTransactionsData) {
      const transactions = JSON.parse(shareholderTransactionsData);
      console.log(`📊 Found ${transactions.length} shareholder transactions to sync`);
      
      for (const transaction of transactions) {
        try {
          const success = await syncToSupabase('create', 'shareholder_transaction', transaction);
          if (success) {
            totalSynced++;
            console.log(`✅ Synced transaction: ${transaction.type} - ${transaction.amount}`);
          } else {
            totalFailed++;
            console.warn(`⚠️ Failed to sync transaction: ${transaction.id}`);
          }
        } catch (err) {
          totalFailed++;
          console.error(`❌ Error syncing transaction ${transaction.id}:`, err);
        }
      }
    }
    
    // Sync Clients
    const clientsData = localStorage.getItem('bvfunguo_clients');
    if (clientsData) {
      const clients = JSON.parse(clientsData);
      console.log(`📊 Found ${clients.length} clients to sync`);
      
      for (const client of clients) {
        try {
          const success = await syncToSupabase('create', 'client', client);
          if (success) {
            totalSynced++;
            console.log(`✅ Synced client: ${client.name} (ID: ${client.id})`);
          } else {
            totalFailed++;
            console.warn(`⚠️ Failed to sync client: ${client.name}`);
          }
        } catch (err) {
          totalFailed++;
          console.error(`❌ Error syncing client ${client.name}:`, err);
        }
      }
    }
    
    // Sync Loans
    const loansData = localStorage.getItem('bvfunguo_loans');
    if (loansData) {
      const loans = JSON.parse(loansData);
      console.log(`📊 Found ${loans.length} loans to sync`);
      
      for (const loan of loans) {
        try {
          const success = await syncToSupabase('create', 'loan', loan);
          if (success) {
            totalSynced++;
            console.log(`✅ Synced loan: ${loan.id}`);
          } else {
            totalFailed++;
            console.warn(`⚠️ Failed to sync loan: ${loan.id}`);
          }
        } catch (err) {
          totalFailed++;
          console.error(`❌ Error syncing loan ${loan.id}:`, err);
        }
      }
    }
    
    // Sync Loan Products
    const loanProductsData = localStorage.getItem('bvfunguo_loan_products');
    if (loanProductsData) {
      const loanProducts = JSON.parse(loanProductsData);
      console.log(`📊 Found ${loanProducts.length} loan products to sync`);
      
      for (const product of loanProducts) {
        try {
          const success = await syncToSupabase('create', 'loan_product', product);
          if (success) {
            totalSynced++;
            console.log(`✅ Synced loan product: ${product.name}`);
          } else {
            totalFailed++;
            console.warn(`⚠️ Failed to sync loan product: ${product.name}`);
          }
        } catch (err) {
          totalFailed++;
          console.error(`❌ Error syncing loan product ${product.name}:`, err);
        }
      }
    }
    
    // Sync Bank Accounts
    const bankAccountsData = localStorage.getItem('bvfunguo_bank_accounts');
    if (bankAccountsData) {
      const bankAccounts = JSON.parse(bankAccountsData);
      console.log(`📊 Found ${bankAccounts.length} bank accounts to sync`);
      
      for (const account of bankAccounts) {
        try {
          const success = await syncToSupabase('create', 'bank_account', account);
          if (success) {
            totalSynced++;
            console.log(`✅ Synced bank account: ${account.accountName}`);
          } else {
            totalFailed++;
            console.warn(`⚠️ Failed to sync bank account: ${account.accountName}`);
          }
        } catch (err) {
          totalFailed++;
          console.error(`❌ Error syncing bank account ${account.accountName}:`, err);
        }
      }
    }
    
    // Sync Expenses
    const expensesData = localStorage.getItem('bvfunguo_expenses');
    if (expensesData) {
      const expenses = JSON.parse(expensesData);
      console.log(`📊 Found ${expenses.length} expenses to sync`);
      
      for (const expense of expenses) {
        try {
          const success = await syncToSupabase('create', 'expense', expense);
          if (success) {
            totalSynced++;
            console.log(`✅ Synced expense: ${expense.category}`);
          } else {
            totalFailed++;
            console.warn(`⚠️ Failed to sync expense: ${expense.id}`);
          }
        } catch (err) {
          totalFailed++;
          console.error(`❌ Error syncing expense ${expense.id}:`, err);
        }
      }
    }
    
    console.log('\n✅ ===== SYNC COMPLETE =====');
    console.log(`📊 Summary:`);
    console.log(`   • Synced: ${totalSynced} records`);
    console.log(`   • Failed: ${totalFailed} records`);
    
    if (totalSynced > 0) {
      toast.success(`Successfully synced ${totalSynced} records to Supabase!`);
    }
    
    if (totalFailed > 0) {
      toast.warning(`Failed to sync ${totalFailed} records. Check console for details.`);
    }
    
    console.log('\n💡 Tip: Refresh the page to see your data loaded from Supabase');
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
    toast.error('Error syncing data to Supabase. Check console for details.');
  }
}

/**
 * Sync only shareholders (quick fix for the current issue)
 */
export async function syncShareholdersOnly(): Promise<void> {
  console.log('🔄 Syncing shareholders to Supabase...');
  
  try {
    const shareholdersData = localStorage.getItem('bvfunguo_shareholders');
    if (!shareholdersData) {
      console.log('❌ No shareholders found in localStorage');
      toast.info('No shareholders to sync');
      return;
    }
    
    const shareholders = JSON.parse(shareholdersData);
    console.log(`📊 Found ${shareholders.length} shareholders`);
    
    let synced = 0;
    let failed = 0;
    
    for (const shareholder of shareholders) {
      try {
        console.log(`🔄 Syncing: ${shareholder.name}...`);
        const success = await syncToSupabase('create', 'shareholder', shareholder);
        
        if (success) {
          synced++;
          console.log(`✅ Synced: ${shareholder.name}`);
        } else {
          failed++;
          console.warn(`⚠️ Failed: ${shareholder.name}`);
        }
      } catch (err) {
        failed++;
        console.error(`❌ Error syncing ${shareholder.name}:`, err);
      }
    }
    
    console.log(`\n✅ Sync complete: ${synced} synced, ${failed} failed`);
    
    if (synced > 0) {
      toast.success(`✅ Synced ${synced} shareholders to Supabase!`);
      console.log('💡 Check Supabase Table Editor to see your shareholders');
    }
    
    if (failed > 0) {
      toast.warning(`⚠️ ${failed} shareholders failed to sync`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    toast.error('Failed to sync shareholders');
  }
}

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).syncExistingDataToSupabase = syncExistingDataToSupabase;
  (window as any).syncShareholdersOnly = syncShareholdersOnly;
  
  console.log('💡 Sync utilities loaded:');
  console.log('   • syncExistingDataToSupabase() - Sync all data');
  console.log('   • syncShareholdersOnly() - Sync just shareholders');
}

export default syncExistingDataToSupabase;
