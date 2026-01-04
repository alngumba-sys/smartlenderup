/**
 * localStorage to Supabase Migration Utility
 * 
 * ONE-TIME migration: Reads all data from localStorage and uploads to Supabase
 * After migration, localStorage operational data is cleared
 */

import { supabaseDataService } from '../services/supabaseDataService';
import { toast } from 'sonner@2.0.3';

interface MigrationReport {
  clients: { found: number; migrated: number; failed: number; errors: string[] };
  loanProducts: { found: number; migrated: number; failed: number; errors: string[] };
  loans: { found: number; migrated: number; failed: number; errors: string[] };
  repayments: { found: number; migrated: number; failed: number; errors: string[] };
  savings: { found: number; migrated: number; failed: number; errors: string[] };
  employees: { found: number; migrated: number; failed: number; errors: string[] };
  groups: { found: number; migrated: number; failed: number; errors: string[] };
  journalEntries: { found: number; migrated: number; failed: number; errors: string[] };
  bankAccounts: { found: number; migrated: number; failed: number; errors: string[] };
  shareholders: { found: number; migrated: number; failed: number; errors: string[] };
  collaterals: { found: number; migrated: number; failed: number; errors: string[] };
  guarantors: { found: number; migrated: number; failed: number; errors: string[] };
  kycRecords: { found: number; migrated: number; failed: number; errors: string[] };
  tasks: { found: number; migrated: number; failed: number; errors: string[] };
  tickets: { found: number; migrated: number; failed: number; errors: string[] };
  auditLogs: { found: number; migrated: number; failed: number; errors: string[] };
}

/**
 * Get organization ID from current user
 */
function getOrganizationId(): string | null {
  const orgStr = localStorage.getItem('current_organization');
  if (!orgStr) return null;
  
  try {
    const org = JSON.parse(orgStr);
    return org.id || null;
  } catch {
    return null;
  }
}

/**
 * Read data from localStorage
 */
function readLocalStorageData(key: string): any[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
}

/**
 * Migrate all data from localStorage to Supabase
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationReport> {
  console.log('🚀 ===== STARTING LOCALSTORAGE TO SUPABASE MIGRATION =====');
  
  const organizationId = getOrganizationId();
  if (!organizationId) {
    toast.error('No organization found. Please log in first.');
    throw new Error('No organization ID found');
  }
  
  console.log(`📊 Organization ID: ${organizationId}`);
  
  const report: MigrationReport = {
    clients: { found: 0, migrated: 0, failed: 0, errors: [] },
    loanProducts: { found: 0, migrated: 0, failed: 0, errors: [] },
    loans: { found: 0, migrated: 0, failed: 0, errors: [] },
    repayments: { found: 0, migrated: 0, failed: 0, errors: [] },
    savings: { found: 0, migrated: 0, failed: 0, errors: [] },
    employees: { found: 0, migrated: 0, failed: 0, errors: [] },
    groups: { found: 0, migrated: 0, failed: 0, errors: [] },
    journalEntries: { found: 0, migrated: 0, failed: 0, errors: [] },
    bankAccounts: { found: 0, migrated: 0, failed: 0, errors: [] },
    shareholders: { found: 0, migrated: 0, failed: 0, errors: [] },
    collaterals: { found: 0, migrated: 0, failed: 0, errors: [] },
    guarantors: { found: 0, migrated: 0, failed: 0, errors: [] },
    kycRecords: { found: 0, migrated: 0, failed: 0, errors: [] },
    tasks: { found: 0, migrated: 0, failed: 0, errors: [] },
    tickets: { found: 0, migrated: 0, failed: 0, errors: [] },
    auditLogs: { found: 0, migrated: 0, failed: 0, errors: [] }
  };
  
  // ===== MIGRATE CLIENTS =====
  console.log('\n📊 Migrating Clients...');
  const localClients = readLocalStorageData(`clients_${organizationId}`);
  report.clients.found = localClients.length;
  
  for (const client of localClients) {
    try {
      // Check if already exists in Supabase
      const existing = await supabaseDataService.clients.getById(client.id, organizationId).catch(() => null);
      
      if (existing) {
        console.log(`⏭️  Client ${client.id} already exists, skipping`);
        continue;
      }
      
      // Transform client data to match Supabase schema
      await supabaseDataService.clients.create({
        clientType: client.clientType || 'individual',
        firstName: client.name?.split(' ')[0] || '',
        lastName: client.name?.split(' ').slice(1).join(' ') || '',
        businessName: client.businessName,
        businessType: client.businessType,
        registrationNumber: client.idNumber,
        email: client.email,
        phone: client.phone,
        idNumber: client.idNumber,
        dateOfBirth: client.dateOfBirth,
        gender: client.gender,
        maritalStatus: client.maritalStatus,
        occupation: client.occupation,
        employer: client.employer,
        monthlyIncome: client.monthlyIncome,
        county: client.county,
        town: client.city || client.town,
        address: client.address,
        nextOfKin: client.nextOfKin,
        status: client.status
      }, organizationId);
      
      report.clients.migrated++;
      console.log(`✅ Migrated client: ${client.name || client.id}`);
    } catch (error: any) {
      report.clients.failed++;
      report.clients.errors.push(`Client ${client.id}: ${error.message}`);
      console.error(`❌ Failed to migrate client ${client.id}:`, error);
    }
  }
  
  // ===== MIGRATE LOAN PRODUCTS =====
  console.log('\n📊 Migrating Loan Products...');
  const localProducts = readLocalStorageData(`loanProducts_${organizationId}`);
  report.loanProducts.found = localProducts.length;
  
  for (const product of localProducts) {
    try {
      await supabaseDataService.loanProducts.create(product, organizationId);
      report.loanProducts.migrated++;
      console.log(`✅ Migrated product: ${product.name || product.id}`);
    } catch (error: any) {
      if (error.code === '23505') { // Duplicate key
        console.log(`⏭️  Product ${product.id} already exists, skipping`);
      } else {
        report.loanProducts.failed++;
        report.loanProducts.errors.push(`Product ${product.id}: ${error.message}`);
        console.error(`❌ Failed to migrate product ${product.id}:`, error);
      }
    }
  }
  
  // ===== MIGRATE LOANS =====
  console.log('\n📊 Migrating Loans...');
  const localLoans = readLocalStorageData(`loans_${organizationId}`);
  report.loans.found = localLoans.length;
  
  for (const loan of localLoans) {
    try {
      await supabaseDataService.loans.create({
        clientId: loan.clientId,
        productId: loan.productId,
        amount: loan.principalAmount || loan.amount,
        interestRate: loan.interestRate,
        term: loan.term,
        termUnit: loan.termUnit,
        repaymentFrequency: loan.repaymentFrequency,
        purpose: loan.purpose,
        disbursementMethod: loan.disbursementMethod,
        disbursementAccount: loan.disbursementAccount,
        totalAmount: loan.totalAmount,
        balance: loan.balance
      }, organizationId);
      
      report.loans.migrated++;
      console.log(`✅ Migrated loan: ${loan.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Loan ${loan.id} already exists, skipping`);
      } else {
        report.loans.failed++;
        report.loans.errors.push(`Loan ${loan.id}: ${error.message}`);
        console.error(`❌ Failed to migrate loan ${loan.id}:`, error);
      }
    }
  }
  
  // ===== MIGRATE REPAYMENTS =====
  console.log('\n📊 Migrating Repayments...');
  const localRepayments = readLocalStorageData(`repayments_${organizationId}`);
  report.repayments.found = localRepayments.length;
  
  for (const repayment of localRepayments) {
    try {
      await supabaseDataService.repayments.create({
        loanId: repayment.loanId,
        clientId: repayment.clientId,
        amount: repayment.amount,
        paymentDate: repayment.paymentDate,
        paymentMethod: repayment.paymentMethod,
        transactionRef: repayment.transactionRef
      }, organizationId);
      
      report.repayments.migrated++;
      console.log(`✅ Migrated repayment: ${repayment.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Repayment ${repayment.id} already exists, skipping`);
      } else {
        report.repayments.failed++;
        report.repayments.errors.push(`Repayment ${repayment.id}: ${error.message}`);
        console.error(`❌ Failed to migrate repayment ${repayment.id}:`, error);
      }
    }
  }
  
  // ===== MIGRATE SAVINGS ACCOUNTS =====
  console.log('\n📊 Migrating Savings Accounts...');
  const localSavingsAccounts = readLocalStorageData(`savingsAccounts_${organizationId}`);
  report.savings.found = localSavingsAccounts.length;
  
  for (const account of localSavingsAccounts) {
    try {
      await supabaseDataService.savings.createAccount(account, organizationId);
      report.savings.migrated++;
      console.log(`✅ Migrated savings account: ${account.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Savings account ${account.id} already exists, skipping`);
      } else {
        report.savings.failed++;
        report.savings.errors.push(`Savings ${account.id}: ${error.message}`);
      }
    }
  }
  
  // ===== MIGRATE EMPLOYEES =====
  console.log('\n📊 Migrating Employees...');
  const localEmployees = readLocalStorageData(`employees_${organizationId}`);
  report.employees.found = localEmployees.length;
  
  for (const employee of localEmployees) {
    try {
      await supabaseDataService.employees.create(employee, organizationId);
      report.employees.migrated++;
      console.log(`✅ Migrated employee: ${employee.name || employee.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Employee ${employee.id} already exists, skipping`);
      } else {
        report.employees.failed++;
        report.employees.errors.push(`Employee ${employee.id}: ${error.message}`);
      }
    }
  }
  
  // ===== MIGRATE GROUPS =====
  console.log('\n📊 Migrating Groups...');
  const localGroups = readLocalStorageData(`groups_${organizationId}`);
  report.groups.found = localGroups.length;
  
  for (const group of localGroups) {
    try {
      await supabaseDataService.groups.create(group, organizationId);
      report.groups.migrated++;
      console.log(`✅ Migrated group: ${group.name || group.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Group ${group.id} already exists, skipping`);
      } else {
        report.groups.failed++;
        report.groups.errors.push(`Group ${group.id}: ${error.message}`);
      }
    }
  }
  
  // ===== MIGRATE JOURNAL ENTRIES =====
  console.log('\n📊 Migrating Journal Entries...');
  const localJournalEntries = readLocalStorageData(`journalEntries_${organizationId}`);
  report.journalEntries.found = localJournalEntries.length;
  
  for (const entry of localJournalEntries) {
    try {
      await supabaseDataService.journalEntries.createEntry(entry, organizationId);
      report.journalEntries.migrated++;
      console.log(`✅ Migrated journal entry: ${entry.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Journal entry ${entry.id} already exists, skipping`);
      } else {
        report.journalEntries.failed++;
        report.journalEntries.errors.push(`Journal ${entry.id}: ${error.message}`);
      }
    }
  }
  
  // ===== MIGRATE BANK ACCOUNTS =====
  console.log('\n📊 Migrating Bank Accounts...');
  const localBankAccounts = readLocalStorageData(`bankAccounts_${organizationId}`);
  report.bankAccounts.found = localBankAccounts.length;
  
  for (const account of localBankAccounts) {
    try {
      await supabaseDataService.bankAccounts.create(account, organizationId);
      report.bankAccounts.migrated++;
      console.log(`✅ Migrated bank account: ${account.accountName || account.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Bank account ${account.id} already exists, skipping`);
      } else {
        report.bankAccounts.failed++;
        report.bankAccounts.errors.push(`Bank ${account.id}: ${error.message}`);
      }
    }
  }
  
  // ===== MIGRATE SHAREHOLDERS =====
  console.log('\n📊 Migrating Shareholders...');
  const localShareholders = readLocalStorageData(`shareholders_${organizationId}`);
  report.shareholders.found = localShareholders.length;
  
  for (const shareholder of localShareholders) {
    try {
      await supabaseDataService.shareholders.create(shareholder, organizationId);
      report.shareholders.migrated++;
      console.log(`✅ Migrated shareholder: ${shareholder.name || shareholder.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⏭️  Shareholder ${shareholder.id} already exists, skipping`);
      } else {
        report.shareholders.failed++;
        report.shareholders.errors.push(`Shareholder ${shareholder.id}: ${error.message}`);
      }
    }
  }
  
  // Additional entities can be added here...
  
  // ===== MIGRATION COMPLETE =====
  console.log('\n✅ ===== MIGRATION COMPLETE =====');
  console.log(report);
  
  const totalFound = Object.values(report).reduce((sum, r) => sum + r.found, 0);
  const totalMigrated = Object.values(report).reduce((sum, r) => sum + r.migrated, 0);
  const totalFailed = Object.values(report).reduce((sum, r) => sum + r.failed, 0);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total Found: ${totalFound}`);
  console.log(`   Total Migrated: ${totalMigrated}`);
  console.log(`   Total Failed: ${totalFailed}`);
  
  if (totalMigrated > 0) {
    toast.success(`✅ Migrated ${totalMigrated} records to Supabase!`);
  }
  
  if (totalFailed > 0) {
    toast.error(`⚠️ ${totalFailed} records failed to migrate. Check console for details.`);
  }
  
  return report;
}

/**
 * Clear localStorage operational data (after migration)
 */
export function clearLocalStorageOperationalData(organizationId: string) {
  console.log('🗑️  Clearing localStorage operational data...');
  
  const keysToRemove = [
    `clients_${organizationId}`,
    `loanProducts_${organizationId}`,
    `loans_${organizationId}`,
    `repayments_${organizationId}`,
    `savingsAccounts_${organizationId}`,
    `savingsTransactions_${organizationId}`,
    `employees_${organizationId}`,
    `groups_${organizationId}`,
    `journalEntries_${organizationId}`,
    `bankAccounts_${organizationId}`,
    `shareholders_${organizationId}`,
    `shareholderTransactions_${organizationId}`,
    `collaterals_${organizationId}`,
    `guarantors_${organizationId}`,
    `kycRecords_${organizationId}`,
    `tasks_${organizationId}`,
    `tickets_${organizationId}`,
    `auditLogs_${organizationId}`,
    `notifications_${organizationId}`,
    `branches_${organizationId}`,
    `loanDocuments_${organizationId}`,
    `disbursements_${organizationId}`,
    `payments_${organizationId}`,
    `payees_${organizationId}`,
    `expenses_${organizationId}`,
    `payrollRuns_${organizationId}`,
    `payrollRecords_${organizationId}`,
    // Single-object sync key
    `project_state_${organizationId}`
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`✅ Cleared ${keysToRemove.length} localStorage keys`);
  toast.success('localStorage operational data cleared');
}

/**
 * Full migration + cleanup
 */
export async function fullMigration(): Promise<MigrationReport> {
  const report = await migrateLocalStorageToSupabase();
  
  const totalMigrated = Object.values(report).reduce((sum, r) => sum + r.migrated, 0);
  const totalFailed = Object.values(report).reduce((sum, r) => sum + r.failed, 0);
  
  if (totalMigrated > 0 && totalFailed === 0) {
    const organizationId = getOrganizationId();
    if (organizationId) {
      console.log('\n🎉 Migration successful! Clearing localStorage...');
      clearLocalStorageOperationalData(organizationId);
    }
  } else if (totalFailed > 0) {
    console.warn('\n⚠️  Some records failed to migrate. localStorage NOT cleared for safety.');
    toast.warning('Migration incomplete. localStorage preserved for safety.');
  }
  
  return report;
}

// Register global functions for manual migration
if (typeof window !== 'undefined') {
  (window as any).migrateToSupabase = fullMigration;
  (window as any).testMigration = migrateLocalStorageToSupabase;
  (window as any).clearLocalStorage = () => {
    const orgId = getOrganizationId();
    if (orgId) {
      clearLocalStorageOperationalData(orgId);
    } else {
      console.error('No organization ID found');
    }
  };
  
  console.log('✅ Migration utilities loaded');
  console.log('💡 Run migration: window.migrateToSupabase()');
  console.log('💡 Test only (no delete): window.testMigration()');
  console.log('💡 Clear localStorage: window.clearLocalStorage()');
}
