import * as supabaseService from '../lib/supabaseService';
import { toast } from 'sonner';
import { SUPABASE_CONFIG, logSync, notifySync } from '../config/supabaseConfig';

// Configuration - now using centralized config
const SYNC_ENABLED = SUPABASE_CONFIG.ENABLED;
const SHOW_SYNC_TOASTS = SUPABASE_CONFIG.SHOW_SYNC_NOTIFICATIONS;

/**
 * Syncs data to Supabase as PRIMARY data store
 * LocalStorage is only used for caching
 * 
 * IMPORTANT: This function now writes to Supabase FIRST
 * LocalStorage is updated separately as a cache layer
 */
export const syncToSupabase = async (
  operation: 'create' | 'update' | 'delete',
  entity: string,
  data: any,
  id?: string
): Promise<boolean> => {
  if (!SYNC_ENABLED) {
    console.warn('⚠️ Supabase sync is disabled. Data will only be stored locally.');
    return false;
  }

  // Add validation for data
  if (!data && operation !== 'delete') {
    console.error(`Error syncing ${entity} to Supabase: data is ${data === null ? 'null' : 'undefined'}`);
    toast.error(`Cannot save ${entity.replace('_', ' ')}: No data provided`);
    return false;
  }

  // Log the sync operation
  logSync(operation.toUpperCase(), entity, { id, dataKeys: data ? Object.keys(data) : [] });

  try {
    let success = false;

    switch (entity) {
      case 'client':
        if (operation === 'create') {
          success = await supabaseService.createClient(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateClient(id, data);
        } else if (operation === 'delete' && id) {
          success = await supabaseService.deleteClient(id);
        }
        break;

      case 'loan':
        if (operation === 'create') {
          success = await supabaseService.createLoan(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateLoan(id, data);
        } else if (operation === 'delete' && id) {
          success = await supabaseService.deleteLoan(id);
        }
        break;

      case 'loan_product':
        if (operation === 'create') {
          success = await supabaseService.createLoanProduct(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateLoanProduct(id, data);
        } else if (operation === 'delete' && id) {
          success = await supabaseService.deleteLoanProduct(id);
        }
        break;

      case 'repayment':
        if (operation === 'create') {
          success = await supabaseService.createRepayment(data);
        }
        break;

      case 'savings_account':
        if (operation === 'create') {
          success = await supabaseService.createSavingsAccount(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateSavingsAccount(id, data);
        }
        break;

      case 'savings_transaction':
        if (operation === 'create') {
          success = await supabaseService.createSavingsTransaction(data);
        }
        break;

      case 'shareholder':
        if (operation === 'create') {
          success = await supabaseService.createShareholder(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateShareholder(id, data);
        }
        break;

      case 'shareholder_transaction':
        if (operation === 'create') {
          success = await supabaseService.createShareholderTransaction(data);
        }
        break;

      case 'expense':
        if (operation === 'create') {
          success = await supabaseService.createExpense(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateExpense(id, data);
        }
        break;

      case 'payee':
        if (operation === 'create') {
          success = await supabaseService.createPayee(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updatePayee(id, data);
        }
        break;

      case 'bank_account':
        if (operation === 'create') {
          success = await supabaseService.createBankAccount(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateBankAccount(id, data);
        }
        break;

      case 'task':
        if (operation === 'create') {
          success = await supabaseService.createTask(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateTask(id, data);
        }
        break;

      case 'kyc_record':
        if (operation === 'create') {
          success = await supabaseService.createKYCRecord(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateKYCRecord(id, data);
        }
        break;

      case 'approval':
        if (operation === 'create') {
          success = await supabaseService.createApproval(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateApproval(id, data);
        }
        break;

      case 'funding_transaction':
        if (operation === 'create') {
          success = await supabaseService.createFundingTransaction(data);
        }
        break;

      case 'processing_fee_record':
        if (operation === 'create') {
          success = await supabaseService.createProcessingFeeRecord(data);
        }
        break;

      case 'disbursement':
        if (operation === 'create') {
          success = await supabaseService.createDisbursement(data);
        }
        break;

      case 'payroll_run':
        if (operation === 'create') {
          success = await supabaseService.createPayrollRun(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updatePayrollRun(id, data);
        }
        break;

      case 'journal_entry':
        if (operation === 'create') {
          success = await supabaseService.createJournalEntry(data);
        }
        break;

      case 'audit_log':
        if (operation === 'create') {
          success = await supabaseService.createAuditLog(data);
        }
        break;

      case 'ticket':
        if (operation === 'create') {
          success = await supabaseService.createTicket(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateTicket(id, data);
        }
        break;

      case 'group':
        if (operation === 'create') {
          success = await supabaseService.createGroup(data);
        } else if (operation === 'update' && id) {
          success = await supabaseService.updateGroup(id, data);
        }
        break;

      case 'guarantor':
        if (operation === 'create') {
          success = await supabaseService.createGuarantor(data);
        }
        break;

      case 'collateral':
        if (operation === 'create') {
          success = await supabaseService.createCollateral(data);
        }
        break;

      case 'loan_document':
        if (operation === 'create') {
          success = await supabaseService.createLoanDocument(data);
        }
        break;

      default:
        console.warn(`No Supabase sync handler for entity: ${entity}`);
        return;
    }

    if (SHOW_SYNC_TOASTS) {
      if (success) {
        console.log(`✅ Synced ${entity} to Supabase`);
      } else {
        console.warn(`⚠️ Failed to sync ${entity} to Supabase`);
        // Show error for critical entities like loan products
        if (entity === 'loan_product' || entity === 'client' || entity === 'loan') {
          toast.error(`Failed to save ${entity.replace('_', ' ')} to cloud database`);
        }
      }
    }
    
    return success;
  } catch (error) {
    console.error(`Error syncing ${entity} to Supabase:`, error);
    // Show error toast for critical failures
    if (entity === 'loan_product' || entity === 'client' || entity === 'loan') {
      toast.error(`Error saving ${entity.replace('_', ' ')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return false;
  }
};

/**
 * Loads initial data from Supabase
 * Returns data or null if fetch fails (will fallback to localStorage)
 */
export const loadFromSupabase = async () => {
  if (!SYNC_ENABLED) return null;

  try {
    console.log('🔄 Loading data from Supabase...');
    
    // ❌ DISABLED: Clean up any records with invalid (non-UUID) IDs before loading data
    // This was deleting records with alphanumeric IDs like "CL001" which are now the standard format
    // await supabaseService.cleanupAllInvalidRecords();
    
    const [
      clients,
      loans,
      loanProducts,
      repayments,
      savingsAccounts,
      savingsTransactions,
      shareholders,
      shareholderTransactions,
      expenses,
      payees,
      bankAccounts,
      tasks,
      kycRecords,
      approvals,
      fundingTransactions,
      processingFeeRecords,
      disbursements,
      payrollRuns,
      journalEntries,
      auditLogs,
      tickets,
      groups,
      guarantors,
      collaterals,
      loanDocuments,
    ] = await Promise.all([
      supabaseService.fetchClients(),
      supabaseService.fetchLoans(),
      supabaseService.fetchLoanProducts(),
      supabaseService.fetchRepayments(),
      supabaseService.fetchSavingsAccounts(),
      supabaseService.fetchSavingsTransactions(),
      supabaseService.fetchShareholders(),
      supabaseService.fetchShareholderTransactions(),
      supabaseService.fetchExpenses(),
      supabaseService.fetchPayees(),
      supabaseService.fetchBankAccounts(),
      supabaseService.fetchTasks(),
      supabaseService.fetchKYCRecords(),
      supabaseService.fetchApprovals(),
      supabaseService.fetchFundingTransactions(),
      supabaseService.fetchProcessingFeeRecords(),
      supabaseService.fetchDisbursements(),
      supabaseService.fetchPayrollRuns(),
      supabaseService.fetchJournalEntries(),
      supabaseService.fetchAuditLogs(),
      supabaseService.fetchTickets(),
      supabaseService.fetchGroups(),
      supabaseService.fetchGuarantors(),
      supabaseService.fetchCollaterals(),
      supabaseService.fetchLoanDocuments(),
    ]);

    console.log('✅ Data loaded from Supabase successfully');

    return {
      clients,
      loans,
      loanProducts,
      repayments,
      savingsAccounts,
      savingsTransactions,
      shareholders,
      shareholderTransactions,
      expenses,
      payees,
      bankAccounts,
      tasks,
      kycRecords,
      approvals,
      fundingTransactions,
      processingFeeRecords,
      disbursements,
      payrollRuns,
      journalEntries,
      auditLogs,
      tickets,
      groups,
      guarantors,
      collaterals,
      loanDocuments,
    };
  } catch (error) {
    console.error('Error loading from Supabase:', error);
    return null;
  }
};