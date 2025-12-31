import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

/**
 * ============================================
 * SINGLE-OBJECT SYNC PATTERN
 * ============================================
 * 
 * Instead of saving individual entities to Supabase one by one,
 * we use a consolidated projectState JSON object that contains
 * ALL related data in a single KV store entry.
 * 
 * Benefits:
 * - ONE API call to save entire state
 * - ONE API call to load entire state
 * - Atomic updates (all or nothing)
 * - Simplified state management
 * - Reduced network overhead
 * - Faster app initialization
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ProjectState {
  // Metadata
  metadata: {
    version: string;
    lastUpdated: string;
    organizationId: string;
    schemaVersion: number;
  };
  
  // Core entities
  clients: any[];
  loans: any[];
  loanProducts: any[];
  repayments: any[];
  
  // Savings
  savingsAccounts: any[];
  savingsTransactions: any[];
  
  // Shareholders & Equity
  shareholders: any[];
  shareholderTransactions: any[];
  
  // Expenses & Payables
  expenses: any[];
  payees: any[];
  
  // Banking
  bankAccounts: any[];
  fundingTransactions: any[];
  
  // Operations
  tasks: any[];
  approvals: any[];
  disbursements: any[];
  tickets: any[];
  
  // Compliance & KYC
  kycRecords: any[];
  
  // Processing & Fees
  processingFeeRecords: any[];
  
  // HR & Payroll
  payrollRuns: any[];
  
  // Accounting
  journalEntries: any[];
  
  // Audit
  auditLogs: any[];
  
  // Groups & Lending
  groups: any[];
  guarantors: any[];
  collaterals: any[];
  loanDocuments: any[];
  
  // Settings (can be extended)
  settings?: {
    currency?: string;
    timezone?: string;
    fiscalYearStart?: string;
    defaultInterestRate?: number;
    defaultLoanTerm?: number;
    [key: string]: any;
  };
}

// ============================================
// CONFIGURATION
// ============================================

const PROJECT_STATE_TABLE = 'project_states';
const STATE_KEY_PREFIX = 'org_state_';

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Save entire project state in ONE API call
 */
export async function saveProjectState(
  organizationId: string,
  state: Partial<ProjectState>
): Promise<boolean> {
  try {
    console.log('💾 Saving entire project state to Supabase...');
    
    const projectState: ProjectState = {
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        organizationId,
        schemaVersion: 1,
      },
      clients: state.clients || [],
      loans: state.loans || [],
      loanProducts: state.loanProducts || [],
      repayments: state.repayments || [],
      savingsAccounts: state.savingsAccounts || [],
      savingsTransactions: state.savingsTransactions || [],
      shareholders: state.shareholders || [],
      shareholderTransactions: state.shareholderTransactions || [],
      expenses: state.expenses || [],
      payees: state.payees || [],
      bankAccounts: state.bankAccounts || [],
      fundingTransactions: state.fundingTransactions || [],
      tasks: state.tasks || [],
      approvals: state.approvals || [],
      disbursements: state.disbursements || [],
      tickets: state.tickets || [],
      kycRecords: state.kycRecords || [],
      processingFeeRecords: state.processingFeeRecords || [],
      payrollRuns: state.payrollRuns || [],
      journalEntries: state.journalEntries || [],
      auditLogs: state.auditLogs || [],
      groups: state.groups || [],
      guarantors: state.guarantors || [],
      collaterals: state.collaterals || [],
      loanDocuments: state.loanDocuments || [],
      settings: state.settings || {},
    };

    // Use upsert to create or update in one call
    const stateKey = `${STATE_KEY_PREFIX}${organizationId}`;
    
    const { error } = await supabase
      .from(PROJECT_STATE_TABLE)
      .upsert({
        id: stateKey,
        organization_id: organizationId,
        state: projectState,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      // Check if it's RLS error
      if (error.code === '42501') {
        console.error('❌ RLS Error: Add service key to .env file');
        console.error('   Get key from: Supabase Dashboard → Settings → API → service_role');
        console.error('   Add to .env: VITE_SUPABASE_SERVICE_KEY=your_key_here');
        console.error('   Then restart: npm run dev');
        toast.error('Database permission error. Check console for fix.');
      } else {
        console.error('❌ Error saving project state:', error);
        toast.error('Failed to save data to cloud');
      }
      return false;
    }

    console.log('✅ Project state saved successfully to Supabase');
    
    // Calculate and log size
    const stateSize = JSON.stringify(projectState).length;
    const sizeKB = (stateSize / 1024).toFixed(2);
    console.log(`📦 State size: ${sizeKB} KB`);
    
    return true;
  } catch (error) {
    console.error('❌ Exception saving project state:', error);
    toast.error('Error saving data');
    return false;
  }
}

/**
 * Load entire project state in ONE API call
 */
export async function loadProjectState(
  organizationId: string
): Promise<ProjectState | null> {
  try {
    console.log('📥 Loading entire project state from Supabase...');
    
    const stateKey = `${STATE_KEY_PREFIX}${organizationId}`;
    
    const { data, error } = await supabase
      .from(PROJECT_STATE_TABLE)
      .select('state, updated_at')
      .eq('id', stateKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No state found - return empty state
        console.log('ℹ️ No existing state found. Starting fresh.');
        return createEmptyState(organizationId);
      }
      
      if (error.code === '42501') {
        console.error('❌ RLS Error: Add service key to .env file');
        console.error('   Get key from: Supabase Dashboard → Settings → API → service_role');
        console.error('   Add to .env: VITE_SUPABASE_SERVICE_KEY=your_key_here');
        console.error('   Then restart: npm run dev');
      } else {
        console.error('❌ Error loading project state:', error);
      }
      return null;
    }

    if (!data || !data.state) {
      console.warn('⚠️ Empty state returned from Supabase');
      return createEmptyState(organizationId);
    }

    console.log('✅ Project state loaded successfully from Supabase');
    console.log(`📅 Last updated: ${data.updated_at}`);
    
    const state = data.state as ProjectState;
    
    // Calculate and log size
    const stateSize = JSON.stringify(state).length;
    const sizeKB = (stateSize / 1024).toFixed(2);
    console.log(`📦 State size: ${sizeKB} KB`);
    
    // Log entity counts
    console.log('📊 Entity counts:', {
      clients: state.clients?.length || 0,
      loans: state.loans?.length || 0,
      loanProducts: state.loanProducts?.length || 0,
      repayments: state.repayments?.length || 0,
      savingsAccounts: state.savingsAccounts?.length || 0,
      shareholders: state.shareholders?.length || 0,
      expenses: state.expenses?.length || 0,
      bankAccounts: state.bankAccounts?.length || 0,
      tasks: state.tasks?.length || 0,
      approvals: state.approvals?.length || 0,
    });
    
    return state;
  } catch (error) {
    console.error('❌ Exception loading project state:', error);
    toast.error('Error loading data from cloud');
    return null;
  }
}

/**
 * Create empty state structure
 */
function createEmptyState(organizationId: string): ProjectState {
  return {
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      organizationId,
      schemaVersion: 1,
    },
    clients: [],
    loans: [],
    loanProducts: [],
    repayments: [],
    savingsAccounts: [],
    savingsTransactions: [],
    shareholders: [],
    shareholderTransactions: [],
    expenses: [],
    payees: [],
    bankAccounts: [],
    fundingTransactions: [],
    tasks: [],
    approvals: [],
    disbursements: [],
    tickets: [],
    kycRecords: [],
    processingFeeRecords: [],
    payrollRuns: [],
    journalEntries: [],
    auditLogs: [],
    groups: [],
    guarantors: [],
    collaterals: [],
    loanDocuments: [],
    settings: {},
  };
}

/**
 * Delete project state (for cleanup/reset)
 */
export async function deleteProjectState(organizationId: string): Promise<boolean> {
  try {
    const stateKey = `${STATE_KEY_PREFIX}${organizationId}`;
    
    const { error } = await supabase
      .from(PROJECT_STATE_TABLE)
      .delete()
      .eq('id', stateKey);

    if (error) {
      console.error('❌ Error deleting project state:', error);
      return false;
    }

    console.log('✅ Project state deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Exception deleting project state:', error);
    return false;
  }
}

/**
 * Get state metadata without loading full state
 */
export async function getStateMetadata(organizationId: string) {
  try {
    const stateKey = `${STATE_KEY_PREFIX}${organizationId}`;
    
    const { data, error } = await supabase
      .from(PROJECT_STATE_TABLE)
      .select('updated_at, state->metadata')
      .eq('id', stateKey)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      lastUpdated: data.updated_at,
      metadata: data['metadata'],
    };
  } catch (error) {
    console.error('Error fetching state metadata:', error);
    return null;
  }
}

/**
 * Batch update: Merge changes into existing state
 * This allows partial updates without loading entire state first
 */
export async function mergeProjectState(
  organizationId: string,
  updates: Partial<ProjectState>
): Promise<boolean> {
  try {
    // Load current state
    const currentState = await loadProjectState(organizationId);
    
    if (!currentState) {
      // If no state exists, just save the updates as new state
      return await saveProjectState(organizationId, updates);
    }

    // Merge updates into current state
    const mergedState: ProjectState = {
      ...currentState,
      ...updates,
      metadata: {
        ...currentState.metadata,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Save merged state
    return await saveProjectState(organizationId, mergedState);
  } catch (error) {
    console.error('Error merging project state:', error);
    return false;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Export state as JSON file (for backup)
 */
export function exportStateAsJSON(state: ProjectState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `smartlenderup-state-${state.metadata.organizationId}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success('State exported successfully');
}

/**
 * Import state from JSON file
 */
export async function importStateFromJSON(
  file: File,
  organizationId: string
): Promise<boolean> {
  try {
    const text = await file.text();
    const state = JSON.parse(text) as ProjectState;
    
    // Update organization ID and timestamp
    state.metadata.organizationId = organizationId;
    state.metadata.lastUpdated = new Date().toISOString();
    
    // Save to Supabase
    const success = await saveProjectState(organizationId, state);
    
    if (success) {
      toast.success('State imported successfully');
    }
    
    return success;
  } catch (error) {
    console.error('Error importing state:', error);
    toast.error('Error importing state file');
    return false;
  }
}
