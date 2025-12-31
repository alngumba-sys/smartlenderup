/**
 * Utility to completely reset the database and localStorage
 * This will delete all organizations, clients, loans, and other data
 */

import { db } from './database';

export function resetDatabase(): void {
  console.log('🔄 Resetting database...');
  
  // Clear the entire database
  const emptyDB = {
    organizations: [],
    clients: [],
    loans: [],
    loan_products: [],
    repayments: [],
    savings_accounts: [],
    savings_transactions: [],
    disbursements: [],
    groups: [],
    group_members: [],
    users: [],
    roles: [],
    permissions: [],
    audit_logs: [],
    notifications: [],
    mpesa_transactions: [],
    bank_accounts: [],
    bank_transactions: []
  };
  
  localStorage.setItem('bvfunguo_db', JSON.stringify(emptyDB));
  
  console.log('✅ Database reset complete - all data cleared');
  console.log('🔄 Refreshing page...');
  
  // Automatically refresh the page after 1 second
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Add to window for easy access from browser console
if (typeof window !== 'undefined') {
  (window as any).resetDatabase = resetDatabase;
  console.log('💡 Database reset utility loaded. Type resetDatabase() in console to clear all database data.');
}
