/**
 * One-time migration script to upload existing localStorage data to Supabase
 * 
 * HOW TO USE:
 * 1. Open browser console
 * 2. Type: window.migrateToSupabase()
 * 3. Wait for completion message
 * 
 * This will upload ALL your existing data from localStorage to Supabase
 */

import * as supabaseService from '../lib/supabaseService';
import { toast } from 'sonner@2.0.3';

const getStorageKey = (key: string) => {
  const org = localStorage.getItem('current_organization');
  if (org) {
    try {
      const orgData = JSON.parse(org);
      return `${key}_${orgData.id}`;
    } catch {
      return key;
    }
  }
  return key;
};

const safeParse = (key: string, fallback: any = []) => {
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key}`);
    return fallback;
  }
};

export const migrateToSupabase = async () => {
  console.log('🚀 Starting migration to Supabase...');
  
  try {
    // Load all data from localStorage
    const clients = safeParse('bvfunguo_clients');
    const loans = safeParse('bvfunguo_loans');
    const loanProducts = safeParse('bvfunguo_loan_products');
    const repayments = safeParse('bvfunguo_repayments');
    const savingsAccounts = safeParse('bvfunguo_savings_accounts');
    const savingsTransactions = safeParse('bvfunguo_savings_transactions');
    const shareholders = safeParse('bvfunguo_shareholders');
    const shareholderTransactions = safeParse('bvfunguo_shareholder_transactions');
    const expenses = safeParse('bvfunguo_expenses');
    const payees = safeParse('bvfunguo_payees');
    const bankAccounts = safeParse('bvfunguo_bank_accounts');
    const tasks = safeParse('bvfunguo_tasks');
    const kycRecords = safeParse('bvfunguo_kyc_records');
    const approvals = safeParse('bvfunguo_approvals');
    const fundingTransactions = safeParse('bvfunguo_funding_transactions');
    const processingFeeRecords = safeParse('bvfunguo_processing_fee_records');
    const disbursements = safeParse('bvfunguo_disbursements');
    const payrollRuns = safeParse('bvfunguo_payroll_runs');
    const journalEntries = safeParse('bvfunguo_journal_entries');
    const auditLogs = safeParse('bvfunguo_audit_logs');
    const tickets = safeParse('bvfunguo_tickets');
    const groups = safeParse('bvfunguo_groups');
    const guarantors = safeParse('bvfunguo_guarantors');
    const collaterals = safeParse('bvfunguo_collaterals');
    const loanDocuments = safeParse('bvfunguo_loan_documents');

    let successCount = 0;
    let errorCount = 0;

    // Migrate Clients
    console.log(`📝 Migrating ${clients.length} clients...`);
    for (const client of clients) {
      const success = await supabaseService.createClient(client);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Loan Products (before loans)
    console.log(`📝 Migrating ${loanProducts.length} loan products...`);
    for (const product of loanProducts) {
      const success = await supabaseService.createLoanProduct(product);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Loans
    console.log(`📝 Migrating ${loans.length} loans...`);
    for (const loan of loans) {
      const success = await supabaseService.createLoan(loan);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Repayments
    console.log(`📝 Migrating ${repayments.length} repayments...`);
    for (const repayment of repayments) {
      const success = await supabaseService.createRepayment(repayment);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Savings Accounts
    console.log(`📝 Migrating ${savingsAccounts.length} savings accounts...`);
    for (const account of savingsAccounts) {
      const success = await supabaseService.createSavingsAccount(account);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Savings Transactions
    console.log(`📝 Migrating ${savingsTransactions.length} savings transactions...`);
    for (const transaction of savingsTransactions) {
      const success = await supabaseService.createSavingsTransaction(transaction);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Shareholders
    console.log(`📝 Migrating ${shareholders.length} shareholders...`);
    for (const shareholder of shareholders) {
      const success = await supabaseService.createShareholder(shareholder);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Shareholder Transactions
    console.log(`📝 Migrating ${shareholderTransactions.length} shareholder transactions...`);
    for (const transaction of shareholderTransactions) {
      const success = await supabaseService.createShareholderTransaction(transaction);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Payees (before expenses)
    console.log(`📝 Migrating ${payees.length} payees...`);
    for (const payee of payees) {
      const success = await supabaseService.createPayee(payee);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Expenses
    console.log(`📝 Migrating ${expenses.length} expenses...`);
    for (const expense of expenses) {
      const success = await supabaseService.createExpense(expense);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Bank Accounts
    console.log(`📝 Migrating ${bankAccounts.length} bank accounts...`);
    for (const account of bankAccounts) {
      const success = await supabaseService.createBankAccount(account);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Tasks
    console.log(`📝 Migrating ${tasks.length} tasks...`);
    for (const task of tasks) {
      const success = await supabaseService.createTask(task);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate KYC Records
    console.log(`📝 Migrating ${kycRecords.length} KYC records...`);
    for (const record of kycRecords) {
      const success = await supabaseService.createKYCRecord(record);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Approvals
    console.log(`📝 Migrating ${approvals.length} approvals...`);
    for (const approval of approvals) {
      const success = await supabaseService.createApproval(approval);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Funding Transactions
    console.log(`📝 Migrating ${fundingTransactions.length} funding transactions...`);
    for (const transaction of fundingTransactions) {
      const success = await supabaseService.createFundingTransaction(transaction);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Processing Fee Records
    console.log(`📝 Migrating ${processingFeeRecords.length} processing fee records...`);
    for (const record of processingFeeRecords) {
      const success = await supabaseService.createProcessingFeeRecord(record);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Disbursements
    console.log(`📝 Migrating ${disbursements.length} disbursements...`);
    for (const disbursement of disbursements) {
      const success = await supabaseService.createDisbursement(disbursement);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Payroll Runs
    console.log(`📝 Migrating ${payrollRuns.length} payroll runs...`);
    for (const run of payrollRuns) {
      const success = await supabaseService.createPayrollRun(run);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Journal Entries
    console.log(`📝 Migrating ${journalEntries.length} journal entries...`);
    for (const entry of journalEntries) {
      const success = await supabaseService.createJournalEntry(entry);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Audit Logs
    console.log(`📝 Migrating ${auditLogs.length} audit logs...`);
    for (const log of auditLogs) {
      const success = await supabaseService.createAuditLog(log);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Tickets
    console.log(`📝 Migrating ${tickets.length} tickets...`);
    for (const ticket of tickets) {
      const success = await supabaseService.createTicket(ticket);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Groups
    console.log(`📝 Migrating ${groups.length} groups...`);
    for (const group of groups) {
      const success = await supabaseService.createGroup(group);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Guarantors
    console.log(`📝 Migrating ${guarantors.length} guarantors...`);
    for (const guarantor of guarantors) {
      const success = await supabaseService.createGuarantor(guarantor);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Collaterals
    console.log(`📝 Migrating ${collaterals.length} collaterals...`);
    for (const collateral of collaterals) {
      const success = await supabaseService.createCollateral(collateral);
      if (success) successCount++;
      else errorCount++;
    }

    // Migrate Loan Documents
    console.log(`📝 Migrating ${loanDocuments.length} loan documents...`);
    for (const document of loanDocuments) {
      const success = await supabaseService.createLoanDocument(document);
      if (success) successCount++;
      else errorCount++;
    }

    console.log('✅ Migration complete!');
    console.log(`✅ Successfully migrated: ${successCount} records`);
    console.log(`❌ Failed: ${errorCount} records`);

    toast.success('Migration Complete!', {
      description: `Migrated ${successCount} records to Supabase. ${errorCount} failures.`,
      duration: 10000,
    });

    return {
      success: true,
      successCount,
      errorCount
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    toast.error('Migration Failed', {
      description: 'Check console for details',
      duration: 10000,
    });
    return {
      success: false,
      error
    };
  }
};

// Register globally for console access
if (typeof window !== 'undefined') {
  (window as any).migrateToSupabase = migrateToSupabase;
  console.log('💡 Migration tool ready! Type window.migrateToSupabase() to start.');
}
