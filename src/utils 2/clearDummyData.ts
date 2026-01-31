// One-time utility to clear all dummy data from localStorage
// This will run once when imported and then can be removed

const clearDummyData = () => {
  // Check if we've already cleared data
  const alreadyCleared = localStorage.getItem('bvfunguo_data_cleared');
  
  if (alreadyCleared === 'true') {
    // Silently skip if already cleared
    return;
  }
  
  console.log('🗑️ Clearing all dummy data from localStorage...');
  
  // List all localStorage keys
  const keysToRemove = [
    'bvfunguo_clients',
    'bvfunguo_loans',
    'bvfunguo_loan_products',
    'bvfunguo_savings_accounts',
    'bvfunguo_savings_transactions',
    'bvfunguo_repayments',
    'bvfunguo_shareholders',
    'bvfunguo_shareholder_transactions',
    'bvfunguo_expenses',
    'bvfunguo_payees',
    'bvfunguo_bank_accounts',
    'bvfunguo_tasks',
    'bvfunguo_kyc_records',
    'bvfunguo_audit_logs',
    'bvfunguo_tickets',
    'bvfunguo_groups',
    'bvfunguo_approvals',
    'bvfunguo_disbursements',
    'bvfunguo_processing_fee_records',
    'bvfunguo_funding_transactions',
    'bvfunguo_payroll_runs',
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Mark as cleared FIRST before reload
  localStorage.setItem('bvfunguo_data_cleared', 'true');

  console.log('✅ All dummy data cleared!');
  
  // NO AUTO RELOAD - Let the app continue naturally
};

// Run immediately when imported
try {
  clearDummyData();
} catch (error) {
  console.error('Error in clearDummyData:', error);
}

export {};