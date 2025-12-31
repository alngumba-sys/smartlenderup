import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  createLoanDisbursementEntry,
  createLoanRepaymentEntry,
  createProcessingFeeEntry,
  createExpenseEntry,
  createCapitalContributionEntry,
  createDividendPaymentEntry,
  createOpeningBalanceEntry,
  createPayrollEntry,
  createFundingEntry,
} from '../utils/journalEntryHelpers';
import { 
  saveProjectState, 
  loadProjectState, 
  ProjectState,
  exportStateAsJSON,
} from '../utils/singleObjectSync';
import { migrateClientIds, applyMigration } from '../utils/migrateClientIds';
import { getCurrencyCode } from '../utils/currencyUtils';
import { toast } from 'sonner@2.0.3';
import { 
  autoCheckAndMigrate, 
  showMigrationNotification,
} from '../utils/simpleAutoMigration';

// ============= TYPE DEFINITIONS =============
// (Keep all your existing type definitions - Client, Loan, etc.)
// I'm keeping them the same as your original DataContext.tsx

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  city: string;
  county: string;
  occupation: string;
  employer: string;
  monthlyIncome: number;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: string;
  nextOfKin: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: 'Active' | 'Inactive' | 'Blacklisted';
  photo?: string;
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }[];
  groupMembership?: {
    groupId: string;
    groupName: string;
    role: string;
  };
  creditScore?: number;
  riskRating?: 'Low' | 'Medium' | 'High';
  clientType?: 'individual' | 'business';
  businessType?: string;
  branch?: string;
  joinDate: string;
  createdBy: string;
  lastUpdated: string;
}

// (Include all other interfaces from your original DataContext)
// For brevity, I'll just show the pattern

// ============= CONTEXT DEFINITION =============

interface DataContextType {
  // All your existing state
  clients: Client[];
  loans: any[];
  loanProducts: any[];
  repayments: any[];
  savingsAccounts: any[];
  savingsTransactions: any[];
  shareholders: any[];
  shareholderTransactions: any[];
  expenses: any[];
  payees: any[];
  bankAccounts: any[];
  fundingTransactions: any[];
  tasks: any[];
  kycRecords: any[];
  approvals: any[];
  disbursements: any[];
  processingFeeRecords: any[];
  payrollRuns: any[];
  journalEntries: any[];
  auditLogs: any[];
  tickets: any[];
  groups: any[];
  guarantors: any[];
  collaterals: any[];
  loanDocuments: any[];
  
  // All your existing methods
  addClient: (client: Client) => Promise<boolean>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  addLoan: (loan: any) => Promise<boolean>;
  updateLoan: (id: string, updates: any) => Promise<boolean>;
  // ... all other methods
  
  // New methods for single-object sync
  saveAllData: () => Promise<boolean>;
  loadAllData: () => Promise<void>;
  exportData: () => void;
  isLoading: boolean;
  lastSyncTime: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

// ============= PROVIDER COMPONENT =============

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  
  // ============= STATE =============
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loanProducts, setLoanProducts] = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<any[]>([]);
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [shareholderTransactions, setShareholderTransactions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payees, setPayees] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [fundingTransactions, setFundingTransactions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [kycRecords, setKYCRecords] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [processingFeeRecords, setProcessingFeeRecords] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [guarantors, setGuarantors] = useState<any[]>([]);
  const [collaterals, setCollaterals] = useState<any[]>([]);
  const [loanDocuments, setLoanDocuments] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // ============= SINGLE-OBJECT SYNC FUNCTIONS =============

  /**
   * Save entire state to Supabase in ONE API call
   */
  const saveAllData = useCallback(async (): Promise<boolean> => {
    if (!currentUser?.organizationId) {
      console.warn('No organization ID available');
      return false;
    }

    const state: Partial<ProjectState> = {
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
      fundingTransactions,
      tasks,
      kycRecords,
      approvals,
      disbursements,
      processingFeeRecords,
      payrollRuns,
      journalEntries,
      auditLogs,
      tickets,
      groups,
      guarantors,
      collaterals,
      loanDocuments,
    };

    const success = await saveProjectState(currentUser.organizationId, state);
    
    if (success) {
      setLastSyncTime(new Date().toISOString());
      toast.success('All data saved to cloud');
    }
    
    return success;
  }, [
    currentUser,
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
    fundingTransactions,
    tasks,
    kycRecords,
    approvals,
    disbursements,
    processingFeeRecords,
    payrollRuns,
    journalEntries,
    auditLogs,
    tickets,
    groups,
    guarantors,
    collaterals,
    loanDocuments,
  ]);

  /**
   * Load entire state from Supabase in ONE API call
   */
  const loadAllData = useCallback(async () => {
    if (!currentUser?.organizationId) {
      console.warn('No organization ID available');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Loading all data from Supabase (Single-Object Sync)...');
      
      const state = await loadProjectState(currentUser.organizationId);
      
      if (state) {
        // ✅ Apply client ID migration if needed
        const migrationResult = migrateClientIds(
          state.clients || [],
          state.loans || []
        );
        
        let finalClients = state.clients || [];
        let finalLoans = state.loans || [];
        
        if (migrationResult.migratedCount > 0) {
          console.log(`🔄 Applying migration for ${migrationResult.migratedCount} client(s)...`);
          const { updatedClients, updatedLoans } = applyMigration(
            state.clients || [],
            state.loans || [],
            migrationResult.clientIdMap
          );
          finalClients = updatedClients;
          finalLoans = updatedLoans;
          
          toast.success(`Migrated ${migrationResult.migratedCount} client ID(s) to new format`);
        }
        
        // ✅ Set all state in one batch
        setClients(finalClients);
        setLoans(finalLoans);
        setLoanProducts(state.loanProducts || []);
        setRepayments(state.repayments || []);
        setSavingsAccounts(state.savingsAccounts || []);
        setSavingsTransactions(state.savingsTransactions || []);
        setShareholders(state.shareholders || []);
        setShareholderTransactions(state.shareholderTransactions || []);
        setExpenses(state.expenses || []);
        setPayees(state.payees || []);
        setBankAccounts(state.bankAccounts || []);
        setFundingTransactions(state.fundingTransactions || []);
        setTasks(state.tasks || []);
        setKYCRecords(state.kycRecords || []);
        setApprovals(state.approvals || []);
        setDisbursements(state.disbursements || []);
        setProcessingFeeRecords(state.processingFeeRecords || []);
        setPayrollRuns(state.payrollRuns || []);
        setJournalEntries(state.journalEntries || []);
        setAuditLogs(state.auditLogs || []);
        setTickets(state.tickets || []);
        setGroups(state.groups || []);
        setGuarantors(state.guarantors || []);
        setCollaterals(state.collaterals || []);
        setLoanDocuments(state.loanDocuments || []);
        
        setLastSyncTime(state.metadata?.lastUpdated || null);
        
        console.log('✅ All data loaded from Supabase successfully');
        toast.success('Data loaded from cloud database');
        
        // 🔧 AUTO SCHEMA CHECK & MIGRATION
        try {
          const migrationCheck = await autoCheckAndMigrate(currentUser?.organizationId);
          
          if (migrationCheck.needsMigration) {
            showMigrationNotification(
              migrationCheck.needsMigration,
              migrationCheck.results,
              migrationCheck.sql
            );
          }
        } catch (error) {
          console.warn('⚠️ Schema check failed:', error);
        }
      } else {
        console.warn('⚠️ No state loaded - starting with empty data');
        toast.info('No existing data found. Starting fresh.');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Export all data as JSON
   */
  const exportData = useCallback(() => {
    const state: ProjectState = {
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        organizationId: currentUser?.organizationId || '',
        schemaVersion: 1,
      },
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
      fundingTransactions,
      tasks,
      kycRecords,
      approvals,
      disbursements,
      processingFeeRecords,
      payrollRuns,
      journalEntries,
      auditLogs,
      tickets,
      groups,
      guarantors,
      collaterals,
      loanDocuments,
      settings: {},
    };
    
    exportStateAsJSON(state);
  }, [
    currentUser,
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
    fundingTransactions,
    tasks,
    kycRecords,
    approvals,
    disbursements,
    processingFeeRecords,
    payrollRuns,
    journalEntries,
    auditLogs,
    tickets,
    groups,
    guarantors,
    collaterals,
    loanDocuments,
  ]);

  // ============= LOAD DATA ON MOUNT =============
  useEffect(() => {
    loadAllData();
  }, []); // Empty dependency - only load once on mount

  // ============= AUTO-SAVE ON STATE CHANGES =============
  // Debounced auto-save: Save data automatically after changes
  useEffect(() => {
    if (isLoading || !currentUser?.organizationId) return;
    
    // Debounce: Wait 2 seconds after last change before saving
    const saveTimer = setTimeout(() => {
      saveAllData();
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [
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
    fundingTransactions,
    tasks,
    kycRecords,
    approvals,
    disbursements,
    processingFeeRecords,
    payrollRuns,
    journalEntries,
    auditLogs,
    tickets,
    groups,
    guarantors,
    collaterals,
    loanDocuments,
  ]);

  // ============= CRUD OPERATIONS =============
  // Now all CRUD operations just update local state
  // The auto-save effect will sync to Supabase automatically

  const addClient = async (client: Client): Promise<boolean> => {
    setClients(prev => [...prev, client]);
    // Auto-save will trigger via useEffect
    return true;
  };

  const updateClient = async (id: string, updates: Partial<Client>): Promise<boolean> => {
    setClients(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    return true;
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    setClients(prev => prev.filter(c => c.id !== id));
    return true;
  };

  const addLoan = async (loan: any): Promise<boolean> => {
    setLoans(prev => [...prev, loan]);
    return true;
  };

  const updateLoan = async (id: string, updates: any): Promise<boolean> => {
    setLoans(prev =>
      prev.map(l => (l.id === id ? { ...l, ...updates } : l))
    );
    return true;
  };

  // ... Add all other CRUD methods following the same pattern

  // ============= CONTEXT VALUE =============
  const value: DataContextType = {
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
    fundingTransactions,
    tasks,
    kycRecords,
    approvals,
    disbursements,
    processingFeeRecords,
    payrollRuns,
    journalEntries,
    auditLogs,
    tickets,
    groups,
    guarantors,
    collaterals,
    loanDocuments,
    
    addClient,
    updateClient,
    deleteClient,
    addLoan,
    updateLoan,
    // ... all other methods
    
    saveAllData,
    loadAllData,
    exportData,
    isLoading,
    lastSyncTime,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
