/**
 * ============================================
 * MIGRATION UTILITY: Remove Old Sync Calls
 * ============================================
 * 
 * This file documents all the syncToSupabase() calls that need to be removed
 * from DataContext.tsx now that we're using Single-Object Sync Pattern.
 * 
 * The debounced sync automatically handles all syncing, so individual
 * syncToSupabase() calls are no longer needed.
 */

// All syncToSupabase calls to be removed:
const SYNC_CALLS_TO_REMOVE = [
  // Line references (approximate):
  'syncToSupabase in addLoan (lines ~1319-1329)',
  'syncToSupabase in updateLoan (line ~1429)',
  'syncToSupabase in deleteLoan (line ~1436)',
  'syncToSupabase in addGuarantor (line ~1491)',
  'syncToSupabase in addCollateral (line ~1512)',
  'syncToSupabase in addLoanDocument (line ~1533)',
  'syncToSupabase in addRepayment (line ~1714)',
  'syncToSupabase in addLoanProduct (line ~2015)',
  'syncToSupabase in updateLoanProduct (line ~2036)',
  'syncToSupabase in deleteLoanProduct (line ~2049)',
  'syncToSupabase in addShareholder (line ~2067)',
  'syncToSupabase in updateShareholder (line ~2076)',
  'syncToSupabase in deleteShareholder (line ~2084)',
  'syncToSupabase in addShareholderTransaction (line ~2138)',
  'syncToSupabase in updateShareholderTransaction (line ~2147)',
  'syncToSupabase in deleteShareholderTransaction (line ~2155)',
  'syncToSupabase in addExpense (line ~2220)',
  'syncToSupabase in updateExpense (line ~2227)',
  'syncToSupabase in deleteExpense (line ~2234)',
  'syncToSupabase in approveExpense (line ~2253)',
  'syncToSupabase in addPayee (line ~2324)',
  'syncToSupabase in updatePayee (line ~2333)',
  'syncToSupabase in deletePayee (line ~2341)',
  'syncToSupabase in addPayrollRun (line ~2359)',
  'syncToSupabase in updatePayrollRun (line ~2368)',
  'syncToSupabase in addBankAccount (line ~2557)',
  'syncToSupabase in updateBankAccount (line ~2573)',
  'syncToSupabase in deleteBankAccount (line ~2581)',
  'syncToSupabase in addFundingTransaction (line ~2598)',
  'syncToSupabase in addTask (line ~2619)',
  'syncToSupabase in updateTask (line ~2628)',
  'syncToSupabase in deleteTask (line ~2636)',
  'syncToSupabase in addKYCRecord (line ~2653)',
  'syncToSupabase in updateKYCRecord (line ~2662)',
  'syncToSupabase in deleteKYCRecord (line ~2670)',
  'syncToSupabase in addAuditLog (line ~2688)',
  'syncToSupabase in addTicket (line ~2704)',
  'syncToSupabase in updateTicket (line ~2713)',
  'syncToSupabase in deleteTicket (line ~2721)',
  'syncToSupabase in addGroup (line ~2738)',
  'syncToSupabase in updateGroup (line ~2747)',
  'syncToSupabase in deleteGroup (line ~2755)',
  'syncToSupabase in addApproval (line ~2832)',
  'syncToSupabase in updateApproval (line ~2841)',
  'syncToSupabase in deleteApproval (line ~2849)',
  'syncToSupabase in addDisbursement (line ~2945)',
  'syncToSupabase in updateDisbursement (line ~2954)',
  'syncToSupabase in deleteDisbursement (line ~2962)',
  'syncToSupabase in addProcessingFeeRecord (line ~2981)',
  'syncToSupabase in updateProcessingFeeRecord (line ~2990)',
  'syncToSupabase in deleteProcessingFeeRecord (line ~2998)',
  'syncToSupabase in addJournalEntry (line ~3036)',
  'syncToSupabase in bank account update (line ~1375)',
  'syncToSupabase in funding transaction (line ~1398)',
];

/**
 * Instructions:
 * 
 * All of these calls should be REMOVED from DataContext.tsx
 * 
 * Replace patterns like:
 * 
 * await syncToSupabase('create', 'client', newClient);
 * 
 * With:
 * 
 * // ✅ No manual sync needed - debounced sync handles it automatically
 * 
 * Or simply remove the line entirely.
 */

export const MIGRATION_COMPLETE = 'Remove all syncToSupabase calls from DataContext.tsx';
