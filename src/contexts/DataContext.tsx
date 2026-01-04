import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth, type User } from './AuthContext';
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
import { initializeAutoBackup } from '../utils/dataBackup';
// ✅ NEW: Supabase-First Architecture
import { supabaseDataService } from '../services/supabaseDataService';
// ✅ DEPRECATED: Old sync patterns (keeping for backwards compatibility during transition)
import { saveProjectState, loadProjectState, type ProjectState } from '../utils/singleObjectSync';
import { ensureSupabaseSync, type SyncResult } from '../utils/ensureSupabaseSync';
import { migrateClientIds, applyMigration } from '../utils/migrateClientIds';
import { getCurrencyCode } from '../utils/currencyUtils';
import { toast } from 'sonner@2.0.3';
import { 
  autoCheckAndMigrate, 
  showMigrationNotification,
  downloadMigrationSQL
} from '../utils/simpleAutoMigration';

// ============= TYPE DEFINITIONS =============

export interface Client {
  id: string;
  clientNumber?: string; // CL001 format
  client_number?: string; // snake_case alias from Supabase
  name: string;
  firstName?: string;
  lastName?: string;
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
  status: 'Active' | 'Inactive' | 'Blacklisted' | 'Good Standing' | 'In Arrears' | 'Fully Paid' | 'Current';
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
  // Additional aliases and properties for backwards compatibility
  clientId?: string;
  fullName?: string;
  phoneNumber?: string;
  nationalId?: string;
  businessName?: string;
  bank?: string;
  gpsLocation?: { lat: number; lng: number };
  town?: string;
  groupAffiliation?: string;
  description?: string;
  accountNumber?: string;
  totalPaid?: number;
  openLoanBalance?: number;
  predictedDefaultDate?: string;
}

export interface Loan {
  id: string;
  loanNumber?: string; // Loan number like LN001, LN002, etc.
  clientId: string;
  clientUuid?: string; // Actual client UUID for Supabase operations
  clientName: string;
  productId: string;
  productName: string;
  principalAmount: number;
  interestRate: number;
  interestType: 'Flat' | 'Reducing Balance' | 'Declining Balance';
  term: number;
  termUnit: 'Days' | 'Weeks' | 'Months' | 'Years';
  repaymentFrequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly';
  disbursementDate: string;
  firstRepaymentDate: string;
  maturityDate: string;
  status: 'Pending' | 'Approved' | 'Disbursed' | 'Active' | 'Fully Paid' | 'Closed' | 'Written Off' | 'Rejected' | 'In Arrears' | 'Under Review' | 'Need Approval' | 'Pending Disbursement';
  approvedBy?: string;
  approvedDate?: string;
  disbursedBy?: string;
  disbursedDate?: string;
  paymentSource?: string; // Bank account ID from which loan was disbursed
  collateral?: {
    type: string;
    description: string;
    value: number;
  }[];
  guarantors?: {
    name: string;
    phone: string;
    idNumber: string;
    relationship: string;
  }[];
  totalInterest: number;
  totalRepayable: number;
  installmentAmount: number;
  numberOfInstallments: number;
  paidAmount: number;
  outstandingBalance: number;
  principalOutstanding?: number;
  interestOutstanding?: number;
  daysInArrears: number;
  arrearsAmount: number;
  overdueAmount?: number;
  penaltyAmount: number;
  purpose: string;
  applicationDate: string;
  createdBy: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  loanOfficer?: string;
  notes?: string;
  createdDate?: string;
  lastUpdated?: string;
  // Additional aliases and properties for backwards compatibility
  loanId?: string;
  loanAmount?: number;
  loanType?: string;
  clientType?: 'Individual' | 'Group';
  loanTerm?: number;
  termMonths?: number;
  tenor?: number;
  processingFeePercentage?: number;
  amount?: number;
  arrears?: number;
}

export interface Repayment {
  id: string;
  loanId: string;
  clientId: string;
  clientName: string;
  amount: number;
  principal: number;
  interest: number;
  penalty: number;
  paymentMethod: 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque';
  paymentReference: string;
  paymentDate: string;
  receiptNumber: string;
  receivedBy: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedDate?: string;
  createdDate: string;
  bankAccountId?: string; // Bank account to which repayment was credited
  // Additional aliases for backwards compatibility
  date?: string;
  method?: string;
  transactionId?: string;
  installmentNumber?: number;
  principalPaid?: number;
}

export interface Savings {
  id: string;
  accountNumber: string;
  clientId: string;
  clientName: string;
  accountType: 'Regular Savings' | 'Fixed Deposit' | 'Target Savings' | 'Emergency Fund';
  balance: number;
  interestRate: number;
  openingDate: string;
  status: 'Active' | 'Dormant' | 'Closed';
  minimumBalance: number;
  targetAmount?: number;
  maturityDate?: string;
  totalDeposits: number;
  totalWithdrawals: number;
  interestEarned: number;
  lastTransactionDate?: string;
}

export interface SavingsTransaction {
  id: string;
  accountId: string;
  accountNumber: string;
  clientId: string;
  clientName: string;
  type: 'Deposit' | 'Withdrawal' | 'Interest' | 'Fee';
  amount: number;
  balance: number;
  paymentMethod?: 'M-Pesa' | 'Cash' | 'Bank Transfer';
  paymentReference?: string;
  transactionDate: string;
  receiptNumber: string;
  processedBy: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedDate?: string;
  createdDate: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  interestRate: number;
  interestType: 'Flat' | 'Reducing Balance' | 'Declining Balance';
  minTerm: number;
  maxTerm: number;
  defaultTerm: number;
  termUnit: 'Days' | 'Weeks' | 'Months' | 'Years';
  repaymentFrequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly';
  processingFee: number;
  processingFeeType: 'Percentage' | 'Fixed';
  insuranceFee: number;
  insuranceFeeType: 'Percentage' | 'Fixed';
  penaltyRate: number;
  gracePeriod: number;
  collateralRequired: boolean;
  guarantorsRequired: number;
  status: 'Active' | 'Inactive';
  createdDate: string;
  lastUpdated: string;
  // Aliases for backwards compatibility
  minTenor?: number;
  maxTenor?: number;
  tenorMonths?: number;
  requiresCollateral?: boolean;
  requiresGuarantor?: boolean;
  minGuarantors?: number;
  insuranceFeeRate?: number;
  loanNumberFormat?: string;
  isActive?: boolean;
  disbursementMethod?: string;
}

export interface Shareholder {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  shareCapital: number;
  ownershipPercentage: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
  totalDividends: number;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface ShareholderTransaction {
  id: string;
  shareholderId: string;
  shareholderName: string;
  type: 'Capital Contribution' | 'Dividend Payment' | 'Capital Withdrawal';
  amount: number;
  paymentMethod: 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque';
  paymentReference: string;
  transactionDate: string;
  receiptNumber: string;
  processedBy: string;
  notes?: string;
  bankAccountId?: string;
  createdDate: string;
  status?: 'pending' | 'completed' | 'cancelled';
  date?: string;
}

export interface Expense {
  id: string;
  category: 'Operational' | 'Administrative' | 'Marketing' | 'IT & Technology' | 'Utilities' | 'Rent' | 'Salaries & Wages' | 'Other';
  subcategory: string;
  amount: number;
  payeeId?: string;
  payeeName: string;
  paymentMethod: 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque';
  paymentReference: string;
  expenseDate: string;
  description: string;
  attachments?: string[];
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  approvedBy?: string;
  approvedDate?: string;
  paidBy?: string;
  paidDate?: string;
  receiptNumber?: string;
  createdBy: string;
  createdDate: string;
  bankAccountId?: string; // Bank account from which expense was paid
  paymentType?: 'Salary/Wage' | 'Service Fee' | 'Consulting Fee' | 'Allowance' | 'Bonus' | 'Reimbursement' | 'Other'; // For employee/contractor payments
  notes?: string;
  recordedBy?: string;
}

export interface Payee {
  id: string;
  name: string;
  type: 'Vendor' | 'Supplier' | 'Service Provider' | 'Employee' | 'Contractor' | 'Other';
  category?: 'Employee' | 'Utilities' | 'Rent' | 'Services' | 'Suppliers' | 'Other';
  email?: string;
  phone: string;
  address?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  mpesaNumber?: string;
  taxPin?: string;
  kraPin?: string;
  contactPerson?: string;
  totalPaid: number;
  lastPaymentDate?: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

// Payroll Management
export interface PayrollRun {
  id: string;
  period: string; // e.g., "January 2025"
  payDate: string;
  employees: PayrollEmployee[];
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Paid' | 'Cancelled';
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  paidDate?: string;
  bankAccountId?: string;
  notes?: string;
}

export interface PayrollEmployee {
  id: string;
  payeeId: string;
  employeeName: string;
  position?: string;
  baseSalary: number;
  allowances: {
    name: string;
    amount: number;
  }[];
  deductions: {
    name: string;
    amount: number;
    type: 'NSSF' | 'NHIF' | 'PAYE' | 'Loan' | 'Advance' | 'Other';
  }[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  paymentMethod: string;
  paymentReference?: string;
  status: 'Pending' | 'Paid';
}

// Task Management
export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedTo: string;
  assignedBy: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  notes?: string;
}

// KYC Records
export interface KYCRecord {
  id: string;
  clientId: string;
  clientName: string;
  status: 'Complete' | 'Incomplete' | 'Pending Review' | 'Expired';
  riskRating: 'Low' | 'Medium' | 'High';
  lastReviewDate: string;
  nextReviewDate: string;
  nationalIdVerified: boolean;
  addressVerified: boolean;
  phoneVerified: boolean;
  biometricsCollected: boolean;
  documentsOnFile: string[];
  reviewedBy: string;
  notes?: string;
}

// Audit Trail
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  changes?: string;
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Warning';
}

// Support Tickets
export interface Ticket {
  id: string;
  ticketNumber: string;
  clientId?: string;
  clientName?: string;
  subject: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Escalated';
  channel: 'Phone' | 'Email' | 'SMS' | 'Walk-in' | 'Web';
  assignedTo: string;
  createdDate: string;
  updatedDate: string;
  resolvedDate?: string;
  resolution?: string;
  resolutionNotes?: string;
}

// Groups (Chamas)
export interface Group {
  id: string;
  name: string;
  registrationDate: string;
  location: string;
  meetingDay: string;
  meetingTime: string;
  chairperson: string;
  chairpersonPhone: string;
  secretary: string;
  secretaryPhone: string;
  treasurer: string;
  treasurerPhone: string;
  totalMembers: number;
  activeMembers: number;
  groupStatus: 'Active' | 'Inactive' | 'Suspended';
  totalLoans: number;
  totalSavings: number;
  defaultRate: number;
}

export interface Approval {
  id: string;
  supabaseId?: string; // UUID from Supabase database
  type: 'loan_application' | 'loan_restructure' | 'loan_writeoff' | 'client_onboarding' | 'disbursement' | 'savings_withdrawal';
  title: string;
  description: string;
  requestedBy: string;
  requestDate: string;
  amount?: number;
  clientId: string;
  clientName: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  approver?: string;
  approvalDate?: string;
  rejectionReason?: string;
  relatedId: string;
  phase: 1 | 2 | 3 | 4 | 5;
  // Disbursement data (saved when advancing from Phase 3 to Phase 4)
  disbursementData?: {
    releaseDate: string;
    disbursementMethod: string;
    sourceOfFunds: string;
    accountNumber: string;
    notes?: string;
  };
  // Additional properties
  stage?: string;
  approverRole?: string;
  date?: string;
  comments?: string;
}

export interface Disbursement {
  id: string;
  loanId: string;
  clientId: string;
  clientName: string;
  amount: number;
  scheduledDate: string;
  actualDate?: string;
  channel: 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque';
  mpesaNumber?: string;
  bankName?: string;
  accountNumber?: string;
  reference?: string;
  status: 'Scheduled' | 'Processing' | 'Completed' | 'Failed';
  processedBy?: string;
  notes?: string;
  createdDate: string;
  createdBy: string;
}

export interface ProcessingFeeRecord {
  id: string;
  loanId: string;
  clientId: string;
  clientName: string;
  amount: number;
  percentage: number;
  loanAmount: number;
  recordedDate: string;
  recordedBy: string;
  status: 'Pending' | 'Collected' | 'Waived';
  waivedBy?: string;
  waivedReason?: string;
  paymentMethod?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  accountType: 'Bank' | 'Cash' | 'Mobile Money';
  bankName?: string;
  accountNumber?: string;
  branch?: string;
  currency: string;
  balance: number;
  openingBalance: number;
  openingDate: string;
  status: 'Active' | 'Inactive' | 'Closed';
  description?: string;
  createdDate: string;
  createdBy: string;
  lastUpdated: string;
}

export interface FundingTransaction {
  id: string;
  bankAccountId: string;
  amount: number;
  date: string;
  reference: string;
  description: string;
  source: string;
  shareholderId?: string;
  shareholderName?: string;
  paymentMethod?: 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque';
  depositorName?: string;
  transactionType: 'Credit' | 'Debit'; // Credit for funding, Debit for disbursements
  relatedLoanId?: string; // Link to loan if this is a disbursement
  mpesaDetails?: {
    transactionCode: string;
    phoneNumber?: string;
  };
}

// Journal Entry System for Double-Entry Bookkeeping
export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g., "JE-2025-001"
  date: string;
  description: string;
  reference?: string; // Reference to source transaction (loan ID, repayment ID, etc.)
  sourceType: 'Loan Disbursement' | 'Loan Repayment' | 'Expense' | 'Capital Contribution' | 'Dividend Payment' | 'Processing Fee' | 'Penalty' | 'Opening Balance' | 'Manual Entry' | 'Payroll' | 'Funding';
  sourceId?: string; // ID of the source transaction
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'Draft' | 'Posted' | 'Reversed';
  createdBy: string;
  createdDate: string;
  postedDate?: string;
  reversedDate?: string;
  reversedBy?: string;
  reversalReason?: string;
  notes?: string;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

// Compliance Reports
export interface ComplianceReport {
  id: string;
  reportType: string;
  reportDate: string;
  reportingPeriod: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  submittedTo: string;
  submittedBy: string;
  submissionDate?: string;
  approvalDate?: string;
  comments?: string;
  issuesIdentified?: number;
  findings?: string;
  notes?: string;
}

// Staff Management
export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  branch: string;
  role: string;
  photo?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdDate: string;
  loginRestrictions?: {
    workDays: string[];
    workStartTime: string;
    workEndTime: string;
    ipAddress?: string;
    country?: string;
  };
  permissions?: {
    backdating: boolean;
    postdating: boolean;
    repaymentsNeedApproval: boolean;
    savingsNeedApproval: boolean;
  };
}

// ============= CONTEXT DEFINITION =============

interface DataContextType {
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'joinDate' | 'lastUpdated'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  calculateClientCreditScore: (clientId: string) => number;
  updateAllClientCreditScores: () => void;
  
  // Loans
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'applicationDate'>) => string;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => Promise<void>;
  getLoan: (id: string) => Loan | undefined;
  settleLoanEarly: (id: string, settlementDate: string, paymentMethod: string, settlementAmount: number) => void;
  restructureLoan: (restructureData: {
    loanId: string;
    restructureDate: string;
    newTenor: number;
    newInterestRate: number;
    newPrincipal: number;
    newMonthlyPayment: number;
    reason: string;
    waivePenalties: boolean;
  }) => void;
  getClientLoans: (clientId: string) => Loan[];
  approveLoan: (id: string, approvedBy: string) => void;
  disburseLoan: (id: string, disbursedBy: string, disbursementDate: string) => void;
  
  // Repayments
  repayments: Repayment[];
  addRepayment: (repayment: Omit<Repayment, 'id' | 'createdDate'>) => void;
  updateRepayment: (id: string, updates: Partial<Repayment>) => void;
  deleteRepayment: (id: string) => void;
  getLoanRepayments: (loanId: string) => Repayment[];
  approveRepayment: (id: string, approvedBy: string, bankAccountId?: string) => void;
  
  // Alias for backward compatibility
  payments: Repayment[];
  
  // Savings
  savingsAccounts: Savings[];
  addSavingsAccount: (account: Omit<Savings, 'id' | 'balance' | 'totalDeposits' | 'totalWithdrawals' | 'interestEarned'>) => void;
  updateSavingsAccount: (id: string, updates: Partial<Savings>) => void;
  deleteSavingsAccount: (id: string) => void;
  getSavingsAccount: (id: string) => Savings | undefined;
  getClientSavingsAccounts: (clientId: string) => Savings[];
  
  // Savings Transactions
  savingsTransactions: SavingsTransaction[];
  addSavingsTransaction: (transaction: Omit<SavingsTransaction, 'id' | 'createdDate' | 'balance'>) => void;
  updateSavingsTransaction: (id: string, updates: Partial<SavingsTransaction>) => void;
  deleteSavingsTransaction: (id: string) => void;
  getAccountTransactions: (accountId: string) => SavingsTransaction[];
  approveSavingsTransaction: (id: string, approvedBy: string) => void;
  
  // Loan Products
  loanProducts: LoanProduct[];
  addLoanProduct: (product: Omit<LoanProduct, 'id' | 'createdDate' | 'lastUpdated'>) => Promise<void>;
  updateLoanProduct: (id: string, updates: Partial<LoanProduct>) => Promise<void>;
  deleteLoanProduct: (id: string) => Promise<void>;
  getLoanProduct: (id: string) => LoanProduct | undefined;
  
  // Shareholders
  shareholders: Shareholder[];
  addShareholder: (shareholder: Omit<Shareholder, 'id' | 'totalDividends'>) => void;
  updateShareholder: (id: string, updates: Partial<Shareholder>) => void;
  deleteShareholder: (id: string) => void;
  getShareholder: (id: string) => Shareholder | undefined;
  refreshShareholders: () => Promise<void>; // ✅ NEW: Fetch fresh shareholders from database
  
  // Shareholder Transactions
  shareholderTransactions: ShareholderTransaction[];
  addShareholderTransaction: (transaction: Omit<ShareholderTransaction, 'id' | 'createdDate'>) => void;
  updateShareholderTransaction: (id: string, updates: Partial<ShareholderTransaction>) => void;
  deleteShareholderTransaction: (id: string) => void;
  getShareholderTransactions: (shareholderId: string) => ShareholderTransaction[];
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdDate'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpense: (id: string) => Expense | undefined;
  approveExpense: (id: string, approvedBy: string) => void;
  payExpense: (id: string, paidBy: string, receiptNumber: string, bankAccountId?: string) => void;
  
  // Payees
  payees: Payee[];
  addPayee: (payee: Omit<Payee, 'id' | 'totalPaid' | 'createdDate'>) => void;
  updatePayee: (id: string, updates: Partial<Payee>) => void;
  deletePayee: (id: string) => void;
  getPayee: (id: string) => Payee | undefined;
  
  // Bank Accounts
  bankAccounts: BankAccount[];
  addBankAccount: (account: Omit<BankAccount, 'id' | 'balance' | 'createdDate' | 'lastUpdated'>) => void;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  getBankAccount: (id: string) => BankAccount | undefined;
  
  // Funding Transactions
  fundingTransactions: FundingTransaction[];
  addFundingTransaction: (transaction: Omit<FundingTransaction, 'id'>) => void;
  getFundingTransactions: (bankAccountId?: string) => FundingTransaction[];
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdDate'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  
  // KYC Records
  kycRecords: KYCRecord[];
  addKYCRecord: (record: Omit<KYCRecord, 'id'>) => void;
  updateKYCRecord: (id: string, updates: Partial<KYCRecord>) => void;
  deleteKYCRecord: (id: string) => void;
  getClientKYCRecord: (clientId: string) => KYCRecord | undefined;
  
  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  // Support Tickets
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdDate' | 'updatedDate'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  getTicket: (id: string) => Ticket | undefined;
  
  // Groups (Chamas)
  groups: Group[];
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  getGroup: (id: string) => Group | undefined;
  
  // Approvals
  approvals: Approval[];
  addApproval: (approval: Omit<Approval, 'id'>) => void;
  updateApproval: (id: string, updates: Partial<Approval>) => void;
  deleteApproval: (id: string) => void;
  getApproval: (id: string) => Approval | undefined;
  approveApproval: (id: string, approver: string, disbursementData?: { releaseDate: string; disbursementMethod: string; sourceOfFunds: string; accountNumber: string; notes?: string }) => void;
  rejectApproval: (id: string, rejectionReason: string) => void;
  seedSampleApprovals: () => void;
  syncLoansWithApprovals: () => void;
  
  // Disbursements
  disbursements: Disbursement[];
  addDisbursement: (disbursement: Omit<Disbursement, 'id' | 'createdDate'>) => void;
  updateDisbursement: (id: string, updates: Partial<Disbursement>) => void;
  deleteDisbursement: (id: string) => void;
  getDisbursement: (id: string) => Disbursement | undefined;
  getLoanDisbursements: (loanId: string) => Disbursement[];
  
  // Guarantors
  guarantors: any[];
  addGuarantor: (guarantor: any) => void;
  updateGuarantor: (id: string, updates: any) => void;
  deleteGuarantor: (id: string) => void;
  getLoanGuarantors: (loanId: string) => any[];
  
  // Collaterals  
  collaterals: any[];
  addCollateral: (collateral: any) => void;
  updateCollateral: (id: string, updates: any) => void;
  deleteCollateral: (id: string) => void;
  getLoanCollaterals: (loanId: string) => any[];
  
  // Loan Documents
  loanDocuments: any[];
  addLoanDocument: (document: any) => void;
  deleteLoanDocument: (id: string) => void;
  getLoanDocuments: (loanId: string) => any[];
  
  // Processing Fee Records
  processingFeeRecords: ProcessingFeeRecord[];
  addProcessingFeeRecord: (record: Omit<ProcessingFeeRecord, 'id' | 'recordedDate'>) => void;
  updateProcessingFeeRecord: (id: string, updates: Partial<ProcessingFeeRecord>) => void;
  deleteProcessingFeeRecord: (id: string) => void;
  getProcessingFeeRecord: (id: string) => ProcessingFeeRecord | undefined;
  getLoanProcessingFeeRecords: (loanId: string) => ProcessingFeeRecord[];
  
  // Payroll
  payrollRuns: PayrollRun[];
  addPayrollRun: (payroll: Omit<PayrollRun, 'id' | 'createdDate'>) => void;
  updatePayrollRun: (id: string, updates: Partial<PayrollRun>) => void;
  deletePayrollRun: (id: string) => void;
  getPayrollRun: (id: string) => PayrollRun | undefined;
  processPayroll: (id: string, paidDate: string, bankAccountId?: string) => void;
  
  // Journal Entries
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'>) => void;
  getJournalEntry: (id: string) => JournalEntry | undefined;
  getJournalEntriesByDate: (startDate: string, endDate: string) => JournalEntry[];
  getJournalEntriesByAccount: (accountCode: string) => JournalEntry[];
  reverseJournalEntry: (id: string, reversedBy: string, reason: string) => void;
  
  // Utility functions
  generateReceiptNumber: () => string;
  generateAccountNumber: () => string;
  refreshData: () => void;
  clearAllData: () => void;
  clearShareholdersAndBanks: () => void;
  syncAllToSupabase: () => Promise<SyncResult>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ============= PROVIDER COMPONENT =============

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<Savings[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [shareholderTransactions, setShareholderTransactions] = useState<ShareholderTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kycRecords, setKYCRecords] = useState<KYCRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [processingFeeRecords, setProcessingFeeRecords] = useState<ProcessingFeeRecord[]>([]);
  const [fundingTransactions, setFundingTransactions] = useState<FundingTransaction[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [guarantors, setGuarantors] = useState<any[]>([]);
  const [collaterals, setCollaterals] = useState<any[]>([]);
  const [loanDocuments, setLoanDocuments] = useState<any[]>([]);

  // ============= SINGLE-OBJECT SYNC PATTERN =============
  // Debounced sync to avoid excessive API calls
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  
  /**
   * 🚀 DEBOUNCED SYNC: Batches all state changes and syncs in ONE API call
   * Waits 1 second after last change before syncing
   */
  const debouncedSyncToSupabase = useCallback(() => {
    if (!currentUser?.organizationId) return;
    
    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    // Set new timeout
    syncTimeoutRef.current = setTimeout(async () => {
      if (isSyncingRef.current) return;
      
      try {
        isSyncingRef.current = true;
        
        const projectState: Partial<ProjectState> = {
          // ⚠️ SKIP: Don't sync clients to project_states - they're in individual table
          // clients,
          // ⚠️ SKIP: Don't sync loans to project_states - they're in individual table
          // loans,
          loanProducts,
          repayments,
          savingsAccounts,
          savingsTransactions,
          // ⚠️ SKIP: Don't sync shareholders to project_states - they're in individual table
          // shareholders,
          shareholderTransactions,
          expenses,
          // ⚠️ SKIP: Don't sync payees to project_states - they're in individual table
          // payees,
          // ⚠️ SKIP: Don't sync bank accounts to project_states - they're in individual table
          // bankAccounts,
          fundingTransactions,
          tasks,
          approvals,
          disbursements,
          tickets,
          kycRecords,
          processingFeeRecords,
          payrollRuns,
          journalEntries,
          auditLogs,
          groups,
          guarantors,
          collaterals,
          loanDocuments,
        };
        
        console.log('💾 SYNCING TO SUPABASE project_states...');
        console.log('   🏦 Funding Transactions to sync:', fundingTransactions.length);
        console.log('   ⚠️ Clients NOT synced here - managed in individual table');
        console.log('   ⚠️ Loans NOT synced here - managed in individual table');
        console.log('   ⚠️ Bank Accounts NOT synced here - managed in individual table');
        console.log('   ��️ Shareholders NOT synced here - managed in individual table');
        
        await saveProjectState(currentUser.organizationId, projectState, currentUser.id);
        
        console.log('✅ SYNC COMPLETE to project_states table');
        console.log('   ✓ Clients, Loans, Funding Transactions all saved to database');
      } catch (error) {
        console.error('❌ Error syncing to Supabase:', error);
      } finally {
        isSyncingRef.current = false;
      }
    }, 1000); // Wait 1 second after last change
  }, [
    currentUser?.organizationId,
    // ⚠️ SKIP: clients managed in individual table, not project_states
    // clients,
    // ⚠️ SKIP: loans managed in individual table, not project_states
    // loans,
    loanProducts,
    repayments,
    savingsAccounts,
    savingsTransactions,
    // ⚠️ SKIP: shareholders managed in individual table, not project_states
    // shareholders,
    shareholderTransactions,
    expenses,
    payees,
    // ⚠️ SKIP: bankAccounts managed in individual table, not project_states
    // bankAccounts,
    fundingTransactions,
    tasks,
    approvals,
    disbursements,
    tickets,
    kycRecords,
    processingFeeRecords,
    payrollRuns,
    journalEntries,
    auditLogs,
    groups,
    guarantors,
    collaterals,
    loanDocuments,
  ]);
  
  // ✅ Auto-sync whenever ANY state changes (debounced)
  useEffect(() => {
    debouncedSyncToSupabase();
  }, [debouncedSyncToSupabase]);
  
  // ✅ CRITICAL: Force save data before page unload/refresh to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Cancel any pending debounced sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      // Force immediate sync before page closes
      if (currentUser?.organizationId && !isSyncingRef.current) {
        try {
          isSyncingRef.current = true;
          
          const projectState: Partial<ProjectState> = {
            // ⚠️ SKIP: Don't sync clients to project_states - they're in individual table
            // clients,
            // ⚠️ SKIP: Don't sync loans to project_states - they're in individual table
            // loans,
            loanProducts,
            repayments,
            savingsAccounts,
            savingsTransactions,
            shareholderTransactions,
            expenses,
            // ⚠️ SKIP: Don't sync payees to project_states - they're in individual table
            // payees,
            fundingTransactions,
            tasks,
            approvals,
            disbursements,
            tickets,
            kycRecords,
            processingFeeRecords,
            payrollRuns,
            journalEntries,
            auditLogs,
            groups,
            guarantors,
            collaterals,
            loanDocuments,
          };
          
          console.log('💾 FORCE SAVING before page unload...');
          await saveProjectState(currentUser.organizationId, projectState, currentUser.id);
          console.log('✅ Data saved successfully before unload');
        } catch (error) {
          console.error('❌ Error saving before unload:', error);
        } finally {
          isSyncingRef.current = false;
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    currentUser?.organizationId,
    // ⚠️ SKIP: clients managed in individual table, not project_states
    // clients,
    // ⚠️ SKIP: loans managed in individual table, not project_states
    // loans,
    loanProducts,
    repayments,
    savingsAccounts,
    savingsTransactions,
    shareholderTransactions,
    expenses,
    // ⚠️ SKIP: payees managed in individual table, not project_states
    // payees,
    fundingTransactions,
    tasks,
    approvals,
    disbursements,
    tickets,
    kycRecords,
    processingFeeRecords,
    payrollRuns,
    journalEntries,
    auditLogs,
    groups,
    guarantors,
    collaterals,
    loanDocuments,
  ]);
  
  // Load data from Supabase when user is ready (PRIMARY DATA SOURCE - Single-Object Sync)
  useEffect(() => {
    // Only load data if we have a logged-in user with an organization ID
    if (!currentUser?.organizationId) {
      console.log('⏳ Waiting for user authentication...');
      console.log('   currentUser:', currentUser);
      console.log('   organizationId:', currentUser?.organizationId);
      return;
    }
    
    const loadData = async () => {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('🚀 LOADDATA() FUNCTION STARTED');
      console.log('═══════════════════════════════════════════════');
      console.log('   Organization ID:', currentUser.organizationId);
      console.log('   User:', currentUser.name);
      console.log('');
      
      try {
        console.log('🔄 Loading entire project state from Supabase...');
        console.log('   Organization ID:', currentUser.organizationId);
        
        // ✅ Load entire state in ONE API call
        const projectState = await loadProjectState(currentUser.organizationId);
        
        console.log('📦 Project State loaded:');
        console.log('   Is truthy:', !!projectState);
        console.log('   Type:', typeof projectState);
        console.log('   Has data:', projectState ? Object.keys(projectState).length : 0);
        console.log('');
        
        if (projectState) {
          // Successfully loaded from Supabase
          console.log('✅ Setting state from Single-Object Sync');
          
          // 🔄 Run client ID migration (UUID → CL001 format)
          const migrationResult = migrateClientIds(
            projectState.clients || [],
            projectState.loans || []
          );
          
          let finalClients = projectState.clients || [];
          let finalLoans = projectState.loans || [];
          
          if (migrationResult.migratedCount > 0) {
            console.log(`🔄 Applying migration for ${migrationResult.migratedCount} client(s)...`);
            const { updatedClients, updatedLoans } = applyMigration(
              projectState.clients || [],
              projectState.loans || [],
              migrationResult.clientIdMap
            );
            finalClients = updatedClients;
            finalLoans = updatedLoans;
            
            console.log('✅ Migration applied to local state (will auto-sync)');
            toast.success(`Migrated ${migrationResult.migratedCount} client ID(s) to new format`);
          }
          
          // 🔄 Normalize clients - ensure they have a 'name' field
          finalClients = finalClients.map(client => {
            // If client already has a name field, use it
            // Otherwise, construct from firstName/lastName
            if (!client.name || client.name.trim() === '') {
              const firstName = client.firstName || client.first_name || '';
              const lastName = client.lastName || client.last_name || '';
              client.name = `${firstName} ${lastName}`.trim() || 'Unknown';
            }
            return client;
          });
          
          // 🔄 Normalize bank accounts - ensure they have required fields
          const normalizedBankAccounts = (projectState.bankAccounts || []).map((account: any) => ({
            ...account,
            status: account.status || 'Active', // ✅ Default to Active if missing
            balance: account.balance ?? 0,
            openingBalance: account.openingBalance ?? 0,
            currency: account.currency || getCurrencyCode(),
            createdDate: account.createdDate || new Date().toISOString().split('T')[0],
            lastUpdated: account.lastUpdated || new Date().toISOString().split('T')[0],
          }));
          
          console.log('✅ Normalized bank accounts:', normalizedBankAccounts.length);
          console.log('   Active accounts:', normalizedBankAccounts.filter((a: any) => a.status === 'Active').length);
          if (normalizedBankAccounts.length > 0) {
            console.log('   First account status:', normalizedBankAccounts[0].status);
          }
          
          // ✅ Set ALL state from the single project state object
          // ⚠️ SKIP: Don't load clients from project_states - will load from individual table below
          // setClients(finalClients);
          // ⚠️ SKIP: Don't load loans from project_states - will load from individual table below
          // setLoans(finalLoans);
          // ⚠️ Don't set loan products yet - will load from individual table below
          setRepayments(projectState.repayments || []);
          setSavingsAccounts(projectState.savingsAccounts || []);
          setSavingsTransactions(projectState.savingsTransactions || []);
          // ⚠️ SKIP: Don't load shareholders from project_states - will load from individual table below
          // setShareholders(projectState.shareholders || []);
          setShareholderTransactions(projectState.shareholderTransactions || []);
          setExpenses(projectState.expenses || []);
          // ⚠️ SKIP: Don't load payees from project_states - will load from individual table below
          // setPayees(projectState.payees || []);
          // ⚠️ SKIP: Don't load bank accounts from project_states - will load from individual table below
          // setBankAccounts(normalizedBankAccounts);
          setTasks(projectState.tasks || []);
          setKYCRecords(projectState.kycRecords || []);
          // ⚠️ SKIP: Don't load approvals from project_states - will load from individual table below
          // setApprovals(projectState.approvals || []);
          setFundingTransactions(projectState.fundingTransactions || []);
          setProcessingFeeRecords(projectState.processingFeeRecords || []);
          setDisbursements(projectState.disbursements || []);
          setPayrollRuns(projectState.payrollRuns || []);
          setJournalEntries(projectState.journalEntries || []);
          setAuditLogs(projectState.auditLogs || []);
          setTickets(projectState.tickets || []);
          setGroups(projectState.groups || []);
          setGuarantors(projectState.guarantors || []);
          setCollaterals(projectState.collaterals || []);
          setLoanDocuments(projectState.loanDocuments || []);
          
          console.log('✅ DATA LOADED FROM DATABASE (project_states):');
          console.log('   🏦 Funding Transactions:', (projectState.fundingTransactions || []).length);
          console.log('   ⚠️  Clients NOT loaded from project_states - will load from individual table');
          console.log('   ⚠️  Loans NOT loaded from project_states - will load from individual table');
          console.log('   ⚠️  Approvals NOT loaded from project_states - will load from individual table');
          console.log('   ℹ️  All data loaded and persisted from Supabase project_states');
          
          console.log('🔍 DEBUG: About to load individual tables...');
          console.log('🔍 DEBUG: Current user org ID:', currentUser.organizationId);
          
          // ✅ NEW: Fetch loan products from individual table (Supabase-first)
          try {
            console.log('🔄 Loading loan products from individual table...');
            const supabaseLoanProducts = await supabaseDataService.loanProducts.getAll(currentUser.organizationId);
            
            if (supabaseLoanProducts && supabaseLoanProducts.length > 0) {
              console.log(`✅ Loaded ${supabaseLoanProducts.length} loan products from individual table`);
              
              // Map Supabase schema to frontend LoanProduct type
              const mappedProducts = supabaseLoanProducts.map((p: any) => ({
                id: p.id, // Use actual database UUID for updates
                productCode: p.product_code,
                name: p.name,
                code: p.product_code || '',
                description: p.description || '',
                minAmount: p.min_amount || 0,
                maxAmount: p.max_amount || 0,
                defaultAmount: 0,
                minTerm: p.min_term || 1,
                maxTerm: p.max_term || 12,
                defaultTerm: p.max_term || 12,
                termUnit: p.term_unit || 'Months',
                interestRate: p.interest_rate || 0,
                interestType: p.interest_type || 'Flat',
                repaymentFrequency: p.repayment_frequency || 'Monthly',
                processingFee: p.processing_fee_percentage || p.processing_fee_fixed || 0,
                processingFeeType: p.processing_fee_percentage > 0 ? 'Percentage' : 'Fixed',
                insuranceFee: p.insurance_fee_fixed || 0,
                insuranceFeeType: 'Fixed',
                penaltyRate: 0,
                gracePeriod: 0,
                collateralRequired: p.collateral_required || false,
                guarantorsRequired: p.guarantor_required ? 1 : 0,
                status: p.status === 'active' ? 'Active' : 'Inactive',
                createdDate: p.created_at?.split('T')[0] || '',
                lastUpdated: p.updated_at?.split('T')[0] || '',
                // Aliases for backwards compatibility
                minTenor: p.min_term || 1,
                maxTenor: p.max_term || 12,
                tenorMonths: p.max_term || 12,
                requiresCollateral: p.collateral_required || false
              }));
              
              setLoanProducts(mappedProducts);
            } else {
              console.log('ℹ️ No loan products found in individual table');
              setLoanProducts([]);
            }
          } catch (error) {
            console.error('❌ Error loading loan products from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setLoanProducts([]);
          }
          
          // ✅ CRITICAL: Load bank accounts from individual table ONLY (NOT from project_states)
          try {
            console.log('');
            console.log('🏦 ========================================');
            console.log('🏦 LOADING BANK ACCOUNTS FROM INDIVIDUAL TABLE');
            console.log('🏦 ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: bank_accounts');
            console.log('   Calling: supabaseDataService.bankAccounts.getAll()');
            
            const supabaseBankAccounts = await supabaseDataService.bankAccounts.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabaseBankAccounts);
            console.log('   Type:', typeof supabaseBankAccounts);
            console.log('   Is Array:', Array.isArray(supabaseBankAccounts));
            console.log('   Length:', supabaseBankAccounts?.length);
            
            if (supabaseBankAccounts && supabaseBankAccounts.length > 0) {
              console.log(`✅ Loaded ${supabaseBankAccounts.length} bank accounts from individual table`);
              
              // Map Supabase schema to frontend BankAccount type
              const mappedBankAccounts = supabaseBankAccounts.map((b: any) => ({
                id: b.id,
                name: b.account_name || b.bank_name || b.name || 'Unnamed Account', // ✅ Fallback chain for name
                accountNumber: b.account_number || '',
                bankName: b.bank_name || '',
                branch: b.branch || '',
                accountType: b.account_type || 'Bank', // ✅ Fixed: use valid type 'Bank' not 'Checking'
                currency: b.currency || 'KES',
                openingBalance: b.opening_balance || b.balance || 0,
                balance: b.balance || b.current_balance || 0,
                openingDate: b.opening_date?.split('T')[0] || b.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                status: b.status || 'Active',
                createdDate: b.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                createdBy: b.created_by || 'System',
                lastUpdated: b.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              }));
              
              console.log('   Mapped accounts:', mappedBankAccounts);
              console.log('   Account names:', mappedBankAccounts.map((a: any) => ({ id: a.id, name: a.name, bankName: a.bankName, status: a.status })));
              console.log('   Setting bank accounts state...');
              setBankAccounts(mappedBankAccounts);
              console.log('   ✅ State updated!');
            } else {
              console.log('ℹ️ No bank accounts found in individual table');
              setBankAccounts([]);
            }
          } catch (error) {
            console.error('❌ Error loading bank accounts from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setBankAccounts([]);
          }
          
          // ✅ CRITICAL: Load shareholders from individual table ONLY (NOT from project_states)
          try {
            console.log('');
            console.log('👥 ========================================');
            console.log('👥 LOADING SHAREHOLDERS FROM INDIVIDUAL TABLE');
            console.log('👥 ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: shareholders');
            console.log('   Calling: supabaseDataService.shareholders.getAll()');
            
            const supabaseShareholders = await supabaseDataService.shareholders.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabaseShareholders);
            console.log('   Type:', typeof supabaseShareholders);
            console.log('   Is Array:', Array.isArray(supabaseShareholders));
            console.log('   Length:', supabaseShareholders?.length);
            
            if (supabaseShareholders && supabaseShareholders.length > 0) {
              console.log(`✅ Loaded ${supabaseShareholders.length} shareholders from individual table`);
              
              // Map Supabase schema to frontend Shareholder type
              const mappedShareholders = supabaseShareholders.map((s: any) => ({
                id: s.id,
                name: s.shareholder_name || s.name || 'Unknown',
                idNumber: s.id_number || '',
                phone: s.phone || '',
                email: s.email || '',
                address: s.address || '',
                sharesOwned: s.total_shares || 0,
                sharePercentage: s.share_percentage || 0,
                investmentAmount: s.share_value || 0,
                investmentDate: s.investment_date || s.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                status: s.status || 'active',
                totalDividends: s.total_dividends || 0,
                shareCapital: s.share_capital || 0
              }));
              
              setShareholders(mappedShareholders);
            } else {
              console.log('ℹ️ No shareholders found in individual table');
              setShareholders([]);
            }
          } catch (error) {
            console.error('❌ Error loading shareholders from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setShareholders([]);
          }
          
          // ✅ CRITICAL: Load funding transactions from individual table ONLY (NOT from project_states)
          try {
            console.log('');
            console.log('💰 ========================================');
            console.log('💰 LOADING FUNDING TRANSACTIONS FROM INDIVIDUAL TABLE');
            console.log('💰 ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: funding_transactions');
            console.log('   Calling: supabaseDataService.fundingTransactions.getAll()');
            
            const supabaseFundingTransactions = await supabaseDataService.fundingTransactions.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabaseFundingTransactions);
            console.log('   Type:', typeof supabaseFundingTransactions);
            console.log('   Is Array:', Array.isArray(supabaseFundingTransactions));
            console.log('   Length:', supabaseFundingTransactions?.length);
            
            if (supabaseFundingTransactions && supabaseFundingTransactions.length > 0) {
              console.log(`✅ Loaded ${supabaseFundingTransactions.length} funding transactions from individual table`);
              
              // Map Supabase schema to frontend FundingTransaction type
              const mappedTransactions = supabaseFundingTransactions.map((ft: any) => ({
                id: ft.id,
                bankAccountId: ft.bank_account_id,
                amount: ft.amount,
                date: ft.date?.split('T')[0] || new Date().toISOString().split('T')[0],
                reference: ft.reference || '',
                description: ft.description || '',
                source: ft.source || 'External Deposit',
                shareholderId: ft.shareholder_id || undefined,
                shareholderName: ft.shareholder_name || undefined,
                paymentMethod: ft.payment_method || 'Bank Transfer',
                depositorName: ft.depositor_name || undefined,
                transactionType: ft.transaction_type || 'Credit',
                relatedLoanId: ft.related_loan_id || undefined
              }));
              
              setFundingTransactions(mappedTransactions);
            } else {
              console.log('ℹ️ No funding transactions found in individual table');
              setFundingTransactions([]);
            }
          } catch (error) {
            console.error('❌ Error loading funding transactions from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setFundingTransactions([]);
          }
          
          // ✅ NEW: Fetch expenses from individual table (Supabase-first)
          try {
            console.log('🔄 Loading expenses from individual table...');
            const supabaseExpenses = await supabaseDataService.expenses.getAll(currentUser.organizationId);
            
            if (supabaseExpenses && supabaseExpenses.length > 0) {
              console.log(`✅ Loaded ${supabaseExpenses.length} expenses from individual table`);
              
              // Map Supabase schema to frontend Expense type
              const mappedExpenses = supabaseExpenses.map((e: any) => ({
                id: e.id,
                category: e.expense_category || e.category || 'General',
                subcategory: e.subcategory || '',
                description: e.description || '',
                amount: e.amount || 0,
                paymentMethod: e.payment_method || 'Cash',
                paymentReference: e.payment_reference || '',
                paymentType: e.payment_type || '',
                status: e.status || 'Pending',
                expenseDate: e.expense_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                createdDate: e.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                createdBy: e.created_by || 'System',
                payeeId: e.payee_id || '',
                payeeName: e.payee_name || '',
                bankAccountId: e.bank_account_id || '',
                receiptNumber: e.receipt_number || '',
                notes: e.notes || '',
                approvedBy: e.approved_by || null,
                approvedDate: e.approved_date?.split('T')[0] || null,
                paidBy: e.paid_by || null,
                paidDate: e.paid_date?.split('T')[0] || null,
              }));
              
              setExpenses(mappedExpenses);
            } else {
              console.log('ℹ️ No expenses found in individual table');
              setExpenses([]);
            }
          } catch (error) {
            console.error('❌ Error loading expenses from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setExpenses([]);
          }
          
          // ✅ CRITICAL: Load clients from individual table (Supabase-first)
          try {
            console.log('');
            console.log('👥 ========================================');
            console.log('👥 LOADING CLIENTS FROM INDIVIDUAL TABLE');
            console.log('👥 ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: clients');
            console.log('   Calling: supabaseDataService.clients.getAll()');
            
            const supabaseClients = await supabaseDataService.clients.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabaseClients);
            console.log('   Type:', typeof supabaseClients);
            console.log('   Is Array:', Array.isArray(supabaseClients));
            console.log('   Length:', supabaseClients?.length);
            
            if (supabaseClients && supabaseClients.length > 0) {
              console.log(`✅ Loaded ${supabaseClients.length} clients from individual table`);
              
              // Map Supabase schema to frontend Client type
              const mappedClients = supabaseClients.map((c: any) => ({
                id: c.id,
                clientNumber: c.client_number, // CL001 format
                client_number: c.client_number, // snake_case alias
                clientId: c.client_number || c.client_id || c.id,
                name: c.client_type === 'group' 
                  ? c.group_name 
                  : `${c.first_name || ''} ${c.last_name || ''}`.trim(),
                firstName: c.first_name || '',
                lastName: c.last_name || '',
                businessName: c.business_name || '',
                groupName: c.group_name || '',
                email: c.email || '',
                phone: c.phone || '',
                idNumber: c.id_number || c.registration_number || '',
                address: c.address || '',
                city: c.city || '',
                county: c.county || '',
                occupation: c.occupation || '',
                employer: c.employer || '',
                monthlyIncome: c.monthly_income || 0,
                dateOfBirth: c.date_of_birth || '',
                gender: c.gender || '',
                maritalStatus: c.marital_status || '',
                registrationDate: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                status: c.status || 'Active',
                creditScore: c.credit_score || 0,
                riskRating: c.risk_rating || 'Medium',
                clientType: c.client_type || 'individual',
                kycStatus: c.kyc_status || 'Pending',
                kycVerifiedDate: c.kyc_verified_date || '',
                kycVerifiedBy: c.kyc_verified_by || '',
                notes: c.notes || '',
                attachments: c.attachments || [],
                businessType: c.business_type || '',
                registrationNumber: c.registration_number || '',
                taxPin: c.tax_pin || '',
                mpesaNumber: c.mpesa_number || '',
                bankAccount: c.bank_account ? {
                  bankName: c.bank_account.bank_name || c.bank_account.bankName || '',
                  accountNumber: c.bank_account.account_number || c.bank_account.accountNumber || '',
                  accountName: c.bank_account.account_name || c.bank_account.accountName || ''
                } : undefined,
                // Group-specific fields
                numberOfMembers: c.number_of_members || 0,
                chairpersonName: c.chairperson_name || '',
                chairpersonPhone: c.chairperson_phone || '',
                secretaryName: c.secretary_name || '',
                secretaryPhone: c.secretary_phone || '',
                treasurerName: c.treasurer_name || '',
                treasurerPhone: c.treasurer_phone || '',
                registrationCertificate: c.registration_certificate || '',
                groupConstitution: c.group_constitution || '',
                meetingMinutes: c.meeting_minutes || '',
                memberList: c.member_list || []
              }));
              
              setClients(mappedClients);
              console.log('   ✅ Clients state updated with', mappedClients.length, 'clients');
            } else {
              console.log('ℹ️ No clients found in individual table');
              setClients([]);
              console.log('   ✅ Clients state set to empty array');
            }
          } catch (error) {
            console.error('❌ Error loading clients from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setClients([]);
            console.log('   ⚠️  Clients state set to empty array due to error');
          }
          
          // ✅ CRITICAL: Load loans from individual table (Supabase-first)
          try {
            console.log('');
            console.log('💰 ========================================');
            console.log('💰 LOADING LOANS FROM INDIVIDUAL TABLE');
            console.log('💰 ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: loans');
            console.log('   Calling: supabaseDataService.loans.getAll()');
            
            const supabaseLoans = await supabaseDataService.loans.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabaseLoans);
            console.log('   Type:', typeof supabaseLoans);
            console.log('   Is Array:', Array.isArray(supabaseLoans));
            console.log('   Length:', supabaseLoans?.length);
            
            if (supabaseLoans && supabaseLoans.length > 0) {
              console.log(`✅ Loaded ${supabaseLoans.length} loans from individual table`);
              
              // Map Supabase schema to frontend Loan type
              const mappedLoans = supabaseLoans.map((l: any) => {
                // Capitalize status properly
                const capitalizeStatus = (status: string) => {
                  if (!status) return 'Pending';
                  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                };
                
                // ✅ CALCULATE totalInterest from database values
                const principalAmount = l.amount || 0;
                const totalRepayable = l.total_amount || 0;
                const calculatedInterest = totalRepayable - principalAmount;
                
                // ✅ CALCULATE outstandingBalance from database values
                const paidAmount = l.amount_paid || 0;
                const calculatedOutstanding = totalRepayable - paidAmount;
                
                return {
                  id: l.id, // ✅ Use UUID for operations
                  loanNumber: l.loan_number || l.id, // User-friendly loan ID (LN00001)
                  loanId: l.loan_number || l.id, // ✅ Alias for loanNumber for consistency
                  loan_id: l.loan_number || l.id, // ✅ Snake_case alias
                  clientId: l.client?.client_number || l.client_id || '',
                  clientUuid: l.client_id || '', // ✅ Store the actual UUID for Supabase operations
                  clientName: l.client ? `${l.client.first_name} ${l.client.last_name}` : l.client_name || '',
                  productId: l.product_id || '', // ✅ Use product_id (UUID) not product_code
                  productName: l.product?.product_name || l.product_name || '',
                  principalAmount: principalAmount,
                  interestRate: l.interest_rate || l.product?.interest_rate || 0,
                  interestType: 'Flat',
                  term: l.term_period || 0,
                  termUnit: l.term_period_unit ? (l.term_period_unit.charAt(0).toUpperCase() + l.term_period_unit.slice(1)) : 'Months',
                  repaymentFrequency: l.repayment_frequency ? (l.repayment_frequency.charAt(0).toUpperCase() + l.repayment_frequency.slice(1)) : 'Monthly',
                  applicationDate: l.application_date?.split('T')[0] || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                  approvedDate: l.approval_date?.split('T')[0] || '',
                  disbursementDate: l.disbursement_date?.split('T')[0] || '',
                  firstRepaymentDate: '',
                  maturityDate: '',
                  status: capitalizeStatus(l.status),
                  installmentAmount: 0,
                  monthlyPayment: 0,
                  totalInterest: calculatedInterest, // ✅ FIXED: Calculate from total_amount - amount
                  totalRepayable: totalRepayable,
                  totalRepayment: totalRepayable,
                  numberOfInstallments: 0,
                  paidAmount: paidAmount,
                  outstandingBalance: calculatedOutstanding,
                  principalOutstanding: calculatedOutstanding,
                  interestOutstanding: 0,
                  createdBy: '',
                  loanOfficer: '',
                  purpose: l.purpose || '',
                  notes: '',
                  interestMethod: 'Flat Rate',
                  guarantorRequired: false,
                  collateralRequired: false,
                  paymentSource: '',
                  gracePeriod: 0,
                  latePaymentPenalty: 0,
                  daysInArrears: 0,
                  arrearsAmount: 0,
                  overdueAmount: 0,
                  penaltyAmount: 0,
                  collateral: [],
                  guarantors: []
                };
              });
              
              setLoans(mappedLoans);
              console.log('   ✅ Loans state updated with', mappedLoans.length, 'loans');
            } else {
              console.log('ℹ️ No loans found in individual table');
              setLoans([]);
              console.log('   ✅ Loans state set to empty array');
            }
          } catch (error) {
            console.error('❌ Error loading loans from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setLoans([]);
            console.log('   ⚠️  Loans state set to empty array due to error');
          }
          
          // ✅ CRITICAL: Load approvals from individual table (Supabase-first)
          try {
            console.log('');
            console.log('✅ ========================================');
            console.log('✅ LOADING APPROVALS FROM INDIVIDUAL TABLE');
            console.log('✅ ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: approvals');
            console.log('   Calling: supabaseDataService.approvals.getAll()');
            
            const supabaseApprovals = await supabaseDataService.approvals.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabaseApprovals);
            console.log('   Type:', typeof supabaseApprovals);
            console.log('   Is Array:', Array.isArray(supabaseApprovals));
            console.log('   Length:', supabaseApprovals?.length);
            
            if (supabaseApprovals && supabaseApprovals.length > 0) {
              console.log(`✅ Loaded ${supabaseApprovals.length} approvals from individual table`);
              
              // Map Supabase schema to frontend Approval type
              const mappedApprovals = supabaseApprovals.map((a: any) => ({
                id: a.id,
                supabaseId: a.id, // Store Supabase UUID for future updates
                type: a.type || 'loan_application',
                title: a.title || '',
                description: a.description || '',
                requestedBy: a.requested_by || '',
                requestDate: a.request_date?.split('T')[0] || a.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                amount: a.amount || undefined,
                clientId: a.client_id || '',
                clientName: a.client_name || '',
                status: a.status || 'pending',
                priority: a.priority || 'medium',
                approver: a.approver || a.approver_name || undefined,
                approvalDate: a.approval_date?.split('T')[0] || undefined,
                rejectionReason: a.rejection_reason || undefined,
                relatedId: a.related_id || a.loan_id || '',
                phase: a.phase || 1,
                disbursementData: a.disbursement_data || undefined,
                stage: a.stage || undefined,
                approverRole: a.approver_role || undefined,
                date: a.created_at?.split('T')[0] || undefined,
                comments: a.comments || undefined
              }));
              
              setApprovals(mappedApprovals);
              console.log('   ✅ Approvals state updated with', mappedApprovals.length, 'approvals');
            } else {
              console.log('ℹ️ No approvals found in individual table');
              setApprovals([]);
              console.log('   ✅ Approvals state set to empty array');
            }
          } catch (error) {
            console.error('❌ Error loading approvals from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setApprovals([]);
            console.log('   ⚠️  Approvals state set to empty array due to error');
          }
          
          // ✅ CRITICAL: Load repayments from individual table (Supabase-first)
          try {
            console.log('');
            console.log('💰 ========================================');
            console.log('💰 LOADING REPAYMENTS FROM INDIVIDUAL TABLE');
            console.log('💰 ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: repayments');
            console.log('   Calling: supabaseDataService.repayments.getAll()');
            
            const supabaseRepayments = await supabaseDataService.repayments.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabaseRepayments);
            console.log('   Type:', typeof supabaseRepayments);
            console.log('   Is Array:', Array.isArray(supabaseRepayments));
            console.log('   Length:', supabaseRepayments?.length);
            
            if (supabaseRepayments && supabaseRepayments.length > 0) {
              console.log(`✅ Loaded ${supabaseRepayments.length} repayments from individual table`);
              console.log('   First repayment:', supabaseRepayments[0]);
              
              // Map Supabase schema to frontend Repayment type (NO joining - just field mapping)
              const mappedRepayments = supabaseRepayments.map((r: any) => {
                return {
                  id: r.id,
                  loanId: r.loan_id, // Keep UUID for joining later in components
                  loan_id: r.loan_id, // Snake_case alias
                  clientId: r.client_id, // Keep UUID for joining later in components
                  client_id: r.client_id, // Snake_case alias
                  amount: r.amount || 0,
                  principal: r.principal_amount || 0,
                  interest: r.interest_amount || 0,
                  penalty: r.penalty_amount || 0,
                  paymentMethod: r.payment_method || 'Cash',
                  payment_method: r.payment_method, // Snake_case alias
                  transactionRef: r.transaction_ref || '',
                  paymentReference: r.transaction_ref || '',
                  paymentDate: r.payment_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                  payment_date: r.payment_date?.split('T')[0], // Snake_case alias
                  receiptNumber: r.receipt_number || '',
                  receivedBy: r.received_by || 'System',
                  recordedBy: r.received_by || 'System', // Alternative field name
                  recorded_by: r.received_by, // Snake_case alias
                  notes: r.notes || '',
                  status: r.status === 'completed' ? 'Approved' : (r.status || 'Pending'),
                  bankAccountId: r.bank_account_id || '',
                  bank_account_id: r.bank_account_id, // Snake_case alias
                  createdDate: r.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                  created_at: r.created_at,
                };
              });
              
              setRepayments(mappedRepayments);
              console.log('   ✅ Repayments state updated with', mappedRepayments.length, 'repayments');
              console.log('   Sample mapped repayment:', mappedRepayments[0]);
            } else {
              console.log('ℹ️ No repayments found in individual table');
              setRepayments([]);
              console.log('   ✅ Repayments state set to empty array');
            }
          } catch (error) {
            console.error('❌ Error loading repayments from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setRepayments([]);
            console.log('   ⚠️  Repayments state set to empty array due to error');
          }
          
          // ✅ CRITICAL: Load payees from individual table ONLY (NOT from project_states)
          try {
            console.log('');
            console.log('👥 ========================================');
            console.log('👥 LOADING PAYEES FROM INDIVIDUAL TABLE');
            console.log('👥 ========================================');
            console.log('   Organization ID:', currentUser.organizationId);
            console.log('   Table: payees');
            console.log('   Calling: supabaseDataService.payees.getAll()');
            
            const supabasePayees = await supabaseDataService.payees.getAll(currentUser.organizationId);
            
            console.log('   ✅ Query complete!');
            console.log('   Raw response:', supabasePayees);
            console.log('   Type:', typeof supabasePayees);
            console.log('   Is Array:', Array.isArray(supabasePayees));
            console.log('   Length:', supabasePayees?.length);
            
            if (supabasePayees && supabasePayees.length > 0) {
              console.log(`✅ Loaded ${supabasePayees.length} payees from individual table`);
              
              // Map Supabase schema to frontend Payee type
              const mappedPayees = supabasePayees.map((p: any) => ({
                id: p.id,
                name: p.payee_name || p.name || '',
                type: p.payee_type || p.type || '',
                phone: p.phone || '',
                email: p.email || '',
                category: p.category || 'Other',
                status: p.status === 'active' ? 'Active' : (p.status || 'Active'),
                totalPaid: p.total_paid || 0,
                createdDate: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                // Additional fields that may exist
                contactPerson: p.contact_person || '',
                physicalAddress: p.address || '',
                bankName: p.bank_name || '',
                accountNumber: p.account_number || ''
              }));
              
              console.log('   Mapped payees:', mappedPayees);
              console.log('   Setting payees state...');
              setPayees(mappedPayees);
              console.log('   ✅ Payees state updated with', mappedPayees.length, 'payees');
            } else {
              console.log('ℹ️ No payees found in individual table');
              setPayees([]);
              console.log('   ✅ Payees state set to empty array');
            }
          } catch (error) {
            console.error('❌ Error loading payees from Supabase:', error);
            toast.error('Database not reachable. Check your internet connection.');
            setPayees([]);
            console.log('   ⚠️  Payees state set to empty array due to error');
          }
          
          console.log('✅ All data loaded from Supabase successfully');
          // Remove toast notification on data load to avoid duplicate notifications on login
        } else {
          // ❌ NO FALLBACK - Supabase connection required
          console.error('❌ Could not load project state from Supabase');
          toast.error('Database not reachable. Check your internet connection.');
          
          // Set empty arrays - NO mock data, NO localStorage fallback
          setClients([]);
          setLoans([]);
          setLoanProducts([]);
          setRepayments([]);
          setSavingsAccounts([]);
          setSavingsTransactions([]);
          setShareholders([]);
          setShareholderTransactions([]);
          setExpenses([]);
          setPayees([]);
          setBankAccounts([]);
          setTasks([]);
          setKYCRecords([]);
          setApprovals([]);
          setFundingTransactions([]);
          setProcessingFeeRecords([]);
          setDisbursements([]);
          setPayrollRuns([]);
          setJournalEntries([]);
          setAuditLogs([]);
          setTickets([]);
          setGroups([]);
          setGuarantors([]);
          setCollaterals([]);
          setLoanDocuments([]);
        }
      } catch (error) {
        console.error('❌ Error loading data from Supabase:', error);
        toast.error('Database not reachable. Check your internet connection.');
        
        // ❌ NO FALLBACK - Set empty arrays, NO mock data
        setClients([]);
        setLoans([]);
        setLoanProducts([]);
        setRepayments([]);
        setSavingsAccounts([]);
        setSavingsTransactions([]);
        setShareholders([]);
        setShareholderTransactions([]);
        setExpenses([]);
        setPayees([]);
        setBankAccounts([]);
        setTasks([]);
        setKYCRecords([]);
        setApprovals([]);
        setFundingTransactions([]);
        setProcessingFeeRecords([]);
        setDisbursements([]);
        setPayrollRuns([]);
        setJournalEntries([]);
        setAuditLogs([]);
        setTickets([]);
        setGroups([]);
        setGuarantors([]);
        setCollaterals([]);
        setLoanDocuments([]);
      }
    };

    loadData();
    
    // Initialize auto-backup system ONCE per session
    const backupInitialized = sessionStorage.getItem('backup_initialized');
    if (!backupInitialized) {
      initializeAutoBackup();
      sessionStorage.setItem('backup_initialized', 'true');
    }
  }, [currentUser?.organizationId]); // ✅ Re-run when user/org changes

  // ✅ SINGLE-OBJECT SYNC PATTERN - ALL data synced automatically
  // Debounced auto-sync handles ALL updates in ONE API call (1 second after last change)

  // Create initial funding transactions for bank accounts with opening balances
  useEffect(() => {
    // Only run once when bankAccounts and fundingTransactions are both loaded
    if (bankAccounts.length > 0 && fundingTransactions.length === 0) {
      const initialTransactions: FundingTransaction[] = [];
      
      bankAccounts.forEach(account => {
        if (account.openingBalance > 0) {
          initialTransactions.push({
            id: `FT-OPENING-${account.id}`,
            bankAccountId: account.id,
            amount: account.openingBalance,
            date: account.openingDate,
            reference: `OB-${account.id.slice(-6)}`,
            description: `Opening Balance - ${account.name}`,
            source: 'Opening Balance',
            transactionType: 'Credit',
            paymentMethod: 'Bank Transfer'
          });
        }
      });
      
      if (initialTransactions.length > 0) {
        setFundingTransactions(initialTransactions);
      }
    }
  }, [bankAccounts, fundingTransactions.length]);

  // Create journal entries for opening balances
  useEffect(() => {
    // Only run when bankAccounts exist and we don't have many journal entries yet
    if (bankAccounts.length > 0 && journalEntries.length < 10) {
      bankAccounts.forEach(account => {
        if (account.openingBalance > 0) {
          // Check if we already have a journal entry for this opening balance
          const existingEntry = journalEntries.find(je => 
            je.sourceType === 'Opening Balance' && je.sourceId === account.id
          );
          
          if (!existingEntry) {
            const journalEntryData = createOpeningBalanceEntry(
              account.id,
              account.name,
              account.openingBalance,
              account.openingDate,
              account.createdBy
            );
            addJournalEntry(journalEntryData);
          }
        }
      });
    }
  }, [bankAccounts.length]);

  // Create processing fee records for existing active loans that don't have them
  useEffect(() => {
    // Only run when loans, loanProducts, and processingFeeRecords are all loaded
    if (loans.length > 0 && loanProducts.length > 0) {
      const newProcessingFeeRecords: ProcessingFeeRecord[] = [];
      
      // Check each active/disbursed loan
      loans.forEach(loan => {
        if ((loan.status === 'Active' || loan.status === 'Disbursed') && loan.disbursedDate) {
          // Check if this loan already has a processing fee record
          const existingRecord = processingFeeRecords.find(r => r.loanId === loan.id);
          
          if (!existingRecord) {
            // Get the loan product to calculate processing fee
            const loanProduct = loanProducts.find(p => p.id === loan.productId);
            
            if (loanProduct && loanProduct.processingFee > 0) {
              const processingFeeAmount = loanProduct.processingFeeType === 'Percentage'
                ? (loan.principalAmount * loanProduct.processingFee) / 100
                : loanProduct.processingFee;
              
              // Create the processing fee record
              newProcessingFeeRecords.push({
                id: `PFR${Date.now()}-${loan.id}`,
                loanId: loan.id,
                clientId: loan.clientId,
                clientName: loan.clientName,
                amount: processingFeeAmount,
                percentage: loanProduct.processingFeeType === 'Percentage' ? loanProduct.processingFee : 0,
                loanAmount: loan.principalAmount,
                recordedDate: loan.disbursedDate,
                recordedBy: loan.disbursedBy || 'System',
                status: 'Collected',
                paymentMethod: 'Bank Transfer'
              });
            }
          }
        }
      });
      
      // Add new processing fee records if any
      if (newProcessingFeeRecords.length > 0) {
        console.log(`🔄 Creating ${newProcessingFeeRecords.length} missing processing fee record(s)`);
        setProcessingFeeRecords([...processingFeeRecords, ...newProcessingFeeRecords]);
      }
    }
  }, [loans.length, loanProducts.length, processingFeeRecords.length]);

  // ============= UTILITY FUNCTIONS =============

  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    return `RCP${timestamp}`;
  };

  const generateAccountNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SAV${timestamp}${random}`;
  };

  const refreshData = () => {
    // Trigger a re-render by updating state
    setClients([...clients]);
    setLoans([...loans]);
  };

  const clearAllData = () => {
    // Clear all state
    setClients([]);
    setLoans([]);
    setLoanProducts([]);
    setSavingsAccounts([]);
    setSavingsTransactions([]);
    setRepayments([]);
    setShareholders([]);
    setShareholderTransactions([]);
    setExpenses([]);
    setPayees([]);
    setBankAccounts([]);
    setTasks([]);
    setKYCRecords([]);
    setAuditLogs([]);
    setTickets([]);
    setGroups([]);
    setApprovals([]);
    setDisbursements([]);
    setProcessingFeeRecords([]);
    setFundingTransactions([]);
    setPayrollRuns([]);

    // ✅ NO localStorage clearing needed - data lives in Supabase
    
    console.log('✅ All data cleared from React state (Supabase remains unchanged)');
  };

  const clearShareholdersAndBanks = () => {
    // Clear shareholders and their transactions
    setShareholders([]);
    setShareholderTransactions([]);
    
    // Clear bank accounts and funding transactions
    setBankAccounts([]);
    setFundingTransactions([]);
    
    // ✅ NO localStorage clearing needed - data lives in Supabase
    
    console.log('✅ Shareholders and bank accounts cleared from React state');
  };

  // Sync all data to Supabase (manual trigger)
  const syncAllToSupabase = async (): Promise<SyncResult> => {
    console.log('🔄 Manually triggering comprehensive Supabase sync...');
    return await ensureSupabaseSync(clients, loans, loanProducts);
  };

  // ============= CLIENT FUNCTIONS =============

  const addClient = async (clientData: Omit<Client, 'id' | 'joinDate' | 'lastUpdated'>) => {
    try {
      console.log('🔵 Creating client with Supabase-first approach...');
      console.log('📋 Client data received in DataContext.addClient:', clientData);
      console.log('  → firstName:', clientData.firstName);
      console.log('  → lastName:', clientData.lastName);
      console.log('  → name:', clientData.name);
      
      // ✅ 1. WRITE TO SUPABASE FIRST
      const supabaseClient = await supabaseDataService.clients.create(
        clientData,
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Client created in Supabase:', supabaseClient);
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      // Map Supabase schema to frontend Client type
      const newClient: Client = {
        id: supabaseClient.client_number || supabaseClient.id,
        clientNumber: supabaseClient.client_number, // CL001 format
        client_number: supabaseClient.client_number, // snake_case alias
        name: supabaseClient.business_name || `${supabaseClient.first_name} ${supabaseClient.last_name}`.trim(),
        firstName: supabaseClient.first_name || '',
        lastName: supabaseClient.last_name || '',
        email: supabaseClient.email || '',
        phone: supabaseClient.phone || '',
        idNumber: supabaseClient.id_number || '',
        address: supabaseClient.address || '',
        city: supabaseClient.town || '',
        county: supabaseClient.county || '',
        occupation: supabaseClient.occupation || '',
        employer: supabaseClient.employer || '',
        monthlyIncome: supabaseClient.monthly_income || 0,
        dateOfBirth: supabaseClient.date_of_birth || '',
        gender: supabaseClient.gender || 'Other',
        maritalStatus: supabaseClient.marital_status || '',
        nextOfKin: {
          name: supabaseClient.next_of_kin_name || '',
          relationship: supabaseClient.next_of_kin_relationship || '',
          phone: supabaseClient.next_of_kin_phone || ''
        },
        status: supabaseClient.status || 'Active',
        clientType: supabaseClient.client_type || 'individual',
        businessName: supabaseClient.business_name || '',
        businessType: supabaseClient.business_type || '',
        joinDate: supabaseClient.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        lastUpdated: supabaseClient.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        createdBy: currentUser?.id || 'system',
        branch: clientData.branch || 'Main Branch'
      };
      
      setClients([...clients, newClient]);
      
      // ✅ 3. ADD AUDIT LOG
      addAuditLog({
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'System',
        action: 'Create Client',
        module: 'Client',
        entityType: 'Client',
        entityId: newClient.id,
        changes: `New client "${newClient.name}" created`,
        ipAddress: '0.0.0.0',
        status: 'Success'
      });
      
      toast.success('✅ Client created successfully in Supabase');
      return newClient;
      
    } catch (error: any) {
      console.error('❌ Error creating client:', error);
      toast.error(`Failed to create client: ${error.message}`);
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>, options?: { silent?: boolean }) => {
    try {
      const client = clients.find(c => c.id === id);
      
      console.log('🔵 Updating client with Supabase-first approach...');
      
      // ✅ 1. WRITE TO SUPABASE FIRST
      // Map frontend updates to Supabase schema
      const supabaseUpdates: any = {};
      if (updates.name) {
        const nameParts = updates.name.split(' ');
        supabaseUpdates.first_name = nameParts[0] || '';
        supabaseUpdates.last_name = nameParts.slice(1).join(' ') || '';
      }
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;
      if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status.toLowerCase();
      if (updates.monthlyIncome !== undefined) supabaseUpdates.monthly_income = updates.monthlyIncome;
      if (updates.address !== undefined) supabaseUpdates.address = updates.address;
      if (updates.city !== undefined) supabaseUpdates.town = updates.city;
      if (updates.county !== undefined) supabaseUpdates.county = updates.county;
      if (updates.occupation !== undefined) supabaseUpdates.occupation = updates.occupation;
      if (updates.employer !== undefined) supabaseUpdates.employer = updates.employer;
      // Skip creditScore - not in Supabase schema (frontend only)
      // if (updates.creditScore !== undefined) supabaseUpdates.credit_score = updates.creditScore;
      
      // Only update if there are changes
      if (Object.keys(supabaseUpdates).length > 0) {
        await supabaseDataService.clients.update(
          id,
          supabaseUpdates,
          currentUser?.organizationId || ''
        );
        
        console.log('✅ Client updated in Supabase');
      }
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      setClients(clients.map(c => 
        c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : c
      ));
      
      // ✅ 3. ADD AUDIT LOG
      if (client) {
        addAuditLog({
          userId: currentUser?.id || 'system',
          userName: currentUser?.name || 'System',
          action: 'Update Client',
          module: 'Client',
          entityType: 'Client',
          entityId: id,
          changes: `Updated client "${client.name}": ${Object.keys(updates).join(', ')}`,
          ipAddress: '0.0.0.0',
          status: 'Success'
        });
      }
      
      // Only show toast if not silent (e.g., not automatic credit score updates)
      if (!options?.silent) {
        toast.success('✅ Client updated successfully');
      }
      
    } catch (error: any) {
      console.error('❌ Error updating client:', error);
      // Don't show error toast or throw if it's just a "not found" error
      if (error.message && error.message.includes('0 rows')) {
        console.warn('⚠️  Client not found in Supabase, but continuing...');
        return; // Don't throw, just return
      }
      toast.error(`Failed to update client: ${error.message}`);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      console.log('🔵 Deleting client with Supabase-first approach...');
      
      // ✅ 1. DELETE FROM SUPABASE FIRST
      await supabaseDataService.clients.delete(
        id,
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Client deleted from Supabase');
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      setClients(clients.filter(c => c.id !== id));
      
      toast.success('✅ Client deleted successfully');
      
    } catch (error: any) {
      console.error('❌ Error deleting client:', error);
      toast.error(`Failed to delete client: ${error.message}`);
      throw error;
    }
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id);
  };

  // ============= LOAN FUNCTIONS =============

  const addLoan = async (loanData: Omit<Loan, 'id' | 'applicationDate'>) => {
    try {
      console.log('🔵 Creating loan with Supabase-first approach...');
      
      // ✅ 1. WRITE TO SUPABASE FIRST
      const supabaseLoan = await supabaseDataService.loans.create(
        loanData,
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Loan created in Supabase:', supabaseLoan);
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      const newLoan: Loan = {
        ...loanData,
        id: supabaseLoan.id, // ✅ Use UUID for operations
        loanNumber: supabaseLoan.loan_number || supabaseLoan.id, // Add loan number as separate field
        applicationDate: supabaseLoan.application_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      };
      setLoans([...loans, newLoan]);
      
      const newId = newLoan.id;
    
    // Automatically create an approval for this loan application
    const approvalMaxId = approvals.reduce((max, approval) => {
      const match = approval.id.match(/^APR(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const approvalTimestamp = Date.now().toString().slice(-6);
    const approvalId = `APR${String(approvalMaxId + 1).padStart(3, '0')}-${approvalTimestamp}`;
    
    // Determine priority based on loan amount
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    if (loanData.principalAmount > 500000) {
      priority = 'urgent';
    } else if (loanData.principalAmount > 200000) {
      priority = 'high';
    } else if (loanData.principalAmount < 50000) {
      priority = 'low';
    }
    
    const newApproval: Approval = {
      id: approvalId,
      type: 'loan_application',
      title: `Loan Application - ${loanData.clientName}`,
      description: `${loanData.productName} loan application for KES ${loanData.principalAmount.toLocaleString()} over ${loanData.term} ${loanData.termUnit.toLowerCase()}`,
      requestedBy: loanData.createdBy,
      requestDate: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      amount: loanData.principalAmount,
      clientId: loanData.clientId,
      clientName: loanData.clientName,
      status: 'pending',
      priority: priority,
      relatedId: newId,
      phase: 1 // Application Review phase
    };
    
    // ✅ Save approval to Supabase FIRST
    let supabaseUuid: string | undefined;
    try {
      const supabaseApproval = await supabaseDataService.approvals.create(
        newApproval,
        currentUser?.organizationId || ''
      );
      supabaseUuid = supabaseApproval.id;
      console.log('�� Approval created in Supabase:', supabaseApproval);
    } catch (error: any) {
      console.error('❌ Error creating approval in Supabase:', error);
      // Don't fail the loan creation if approval fails
    }
    
    // ✅ Update React state with Supabase UUID
    setApprovals([...approvals, { ...newApproval, supabaseId: supabaseUuid }]);
    
    // Calculate and record processing fee
    const product = loanProducts.find(p => p.id === loanData.productId);
    if (product && product.processingFee > 0) {
      const feeAmount = product.processingFeeType === 'Percentage'
        ? (loanData.principalAmount * product.processingFee) / 100
        : product.processingFee;
      
      const newProcessingFeeRecord: ProcessingFeeRecord = {
        id: `PFR${Date.now()}`,
        loanId: newId,
        clientId: loanData.clientId,
        clientName: loanData.clientName,
        amount: feeAmount,
        percentage: product.processingFeeType === 'Percentage' ? product.processingFee : 0,
        loanAmount: loanData.principalAmount,
        recordedDate: new Date().toISOString().split('T')[0],
        recordedBy: loanData.createdBy,
        status: 'Pending', // Will be Collected when loan is disbursed
      };
      
      setProcessingFeeRecords([...processingFeeRecords, newProcessingFeeRecord]);
      // ✅ No manual sync needed - debounced sync handles all entities automatically
    }
    
      // Add audit log
      addAuditLog({
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'System',
        action: 'Create Loan Application',
        module: 'Loan',
        entityType: 'Loan',
        entityId: newId,
        changes: `New loan application for ${loanData.clientName} - KES ${loanData.principalAmount.toLocaleString()}`,
        ipAddress: '0.0.0.0',
        status: 'Success'
      });
      
      toast.success('✅ Loan created successfully in Supabase');
      
      // Return the generated loan ID
      return newId;
      
    } catch (error: any) {
      console.error('❌ Error creating loan:', error);
      toast.error(`Failed to create loan: ${error.message}`);
      throw error;
    }
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    // Find the full loan object and merge updates
    const updatedLoan = loans.find(l => l.id === id);
    if (!updatedLoan) {
      console.error(`Cannot update loan: loan with id ${id} not found`);
      return;
    }
    
    const fullUpdatedLoan = { ...updatedLoan, ...updates };
    
    // ✅ UPDATE APPROVALS TABLE WHEN STATUS CHANGES
    if (updates.status && updates.status !== updatedLoan.status) {
      const relatedApproval = approvals.find(a => a.relatedId === id);
      
      if (relatedApproval) {
        const statusLower = updates.status.toLowerCase();
        let newPhase = relatedApproval.phase;
        let newStatus = relatedApproval.status;
        
        // Map loan status to approval phase and status
        if (statusLower === 'pending' || statusLower === 'under review') {
          newPhase = 1; // Step 1: Auto-Assessment
          newStatus = 'pending';
        } else if (statusLower === 'need approval') {
          newPhase = 2; // Step 2: Manager Approval
          newStatus = 'pending';
        } else if (statusLower === 'approved') {
          newPhase = 3; // Step 3: Disbursement (Approved for Disbursement)
          newStatus = 'pending';
        } else if (statusLower === 'disbursed' || statusLower === 'active') {
          newPhase = 5; // Active Loans
          newStatus = 'approved';
        } else if (statusLower === 'rejected') {
          newStatus = 'rejected';
        }
        
        // Update the approval record
        setApprovals(approvals.map(a => 
          a.relatedId === id 
            ? { 
                ...a, 
                phase: newPhase, 
                status: newStatus,
                ...(newStatus === 'approved' && { approvalDate: new Date().toISOString() }),
                ...(updates.status === 'Disbursed' && { approver: currentUser?.name || 'System' })
              }
            : a
        ));
        
        console.log(`✅ Updated approval record for loan ${id}: Phase ${newPhase}, Status ${newStatus}`);
        
        // ✅ SYNC TO SUPABASE - IMMEDIATE AND ROBUST
        if (currentUser?.organizationId) {
          // Get the Supabase UUID from the approval record
          const supabaseApprovalId = (relatedApproval as any).supabaseId || relatedApproval.id;
          
          // ✅ CRITICAL: Ensure database update with better error handling
          const updateApprovalInDB = async () => {
            try {
              const updateData = {
                step: newPhase,
                phase: newPhase, // Update both old and new workflow fields
                approval_status: newStatus, // Old workflow field
                status: newStatus, // New workflow field - CRITICAL FOR DB SYNC
                loan_id: id,
                ...(newStatus === 'approved' && { 
                  approval_date: new Date().toISOString(),
                  approved_at: new Date().toISOString()
                }),
                ...(updates.status === 'Disbursed' && { 
                  // ✅ Don't set approver_id - it causes foreign key constraint errors
                  // approver_id should only be set if user exists in users table
                  approver: currentUser.name 
                })
              };
              
              console.log('🔄 [DB UPDATE] Updating approval status in Supabase:', {
                approvalId: supabaseApprovalId,
                loanId: id,
                newPhase,
                newStatus,
                updateData
              });
              
              const result = await supabaseDataService.approvals.update(
                supabaseApprovalId, 
                updateData, 
                currentUser.organizationId
              );
              
              console.log('✅ [DB UPDATE] Approval status successfully synced to Supabase database');
              console.log('   📊 Updated approval fields:', Object.keys(updateData));
              console.log('   ✓ Phase:', newPhase);
              console.log('   ✓ Status:', newStatus);
              
              return result;
            } catch (error: any) {
              console.error('❌ CRITICAL: Error syncing approval status to Supabase database:', error);
              console.error('   Approval ID:', supabaseApprovalId);
              console.error('   Loan ID:', id);
              console.error('   Organization ID:', currentUser.organizationId);
              console.error('   Error message:', error.message);
              console.error('   Error details:', error);
              
              // Show error to user
              toast.error(`Failed to update approval status in database: ${error.message}`);
              throw error;
            }
          };
          
          // Execute the update immediately (non-blocking but with comprehensive logging)
          updateApprovalInDB();
        }
      } else {
        // If no approval exists, create one
        const priority: 'low' | 'medium' | 'high' | 'urgent' = 
          fullUpdatedLoan.principalAmount > 500000 ? 'urgent' :
          fullUpdatedLoan.principalAmount > 200000 ? 'high' :
          fullUpdatedLoan.principalAmount < 50000 ? 'low' : 'medium';
        
        const approvalMaxId = approvals.reduce((max, approval) => {
          const match = approval.id.match(/^APR(\d+)$/);
          return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);
        const approvalId = `APR${String(approvalMaxId + 1).padStart(3, '0')}`;
        
        const statusLower = updates.status.toLowerCase();
        let phase = 1;
        let status: 'pending' | 'approved' | 'rejected' = 'pending';
        
        if (statusLower === 'need approval') phase = 2;
        else if (statusLower === 'approved') phase = 3;
        else if (statusLower === 'disbursed' || statusLower === 'active') {
          phase = 5;
          status = 'approved';
        } else if (statusLower === 'rejected') status = 'rejected';
        
        const newApproval: Approval = {
          id: approvalId,
          type: 'loan_application',
          title: `Loan Application - ${fullUpdatedLoan.clientName || 'Unknown Client'}`,
          description: `${fullUpdatedLoan.productName || 'Loan'} loan application for KES ${(fullUpdatedLoan.principalAmount || 0).toLocaleString()} over ${fullUpdatedLoan.term || 0} ${(fullUpdatedLoan.termUnit || 'months').toLowerCase()}`,
          requestedBy: fullUpdatedLoan.createdBy,
          requestDate: fullUpdatedLoan.applicationDate + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          amount: fullUpdatedLoan.principalAmount,
          clientId: fullUpdatedLoan.clientId,
          clientName: fullUpdatedLoan.clientName,
          status: status,
          priority: priority,
          relatedId: id,
          phase: phase
        };
        
        setApprovals([...approvals, newApproval]);
        console.log(`✅ Created new approval record for loan ${id}: Phase ${phase}, Status ${status}`);
        
        // ✅ SYNC TO SUPABASE - IMMEDIATE AND ROBUST
        if (currentUser?.organizationId) {
          const createApprovalInDB = async () => {
            try {
              console.log('🔄 [DB CREATE] Creating new approval in Supabase database');
              
              const supabaseApproval = await supabaseDataService.approvals.create({
                loan_id: id,
                step: phase,
                phase: phase, // Set both old and new workflow fields
                approval_status: status, // Old workflow field
                status: status, // New workflow field - CRITICAL FOR DB SYNC
                approver_id: currentUser.id,
                ...(status === 'approved' && { 
                  approval_date: new Date().toISOString(),
                  approved_at: new Date().toISOString()
                })
              }, currentUser.organizationId);
              
              console.log('✅ [DB CREATE] New approval successfully created in Supabase database');
              console.log('   📝 Approval ID:', supabaseApproval.id);
              console.log('   ✓ Phase:', phase);
              console.log('   ✓ Status:', status);
              
              // Store the Supabase UUID in the local approval for future updates
              setApprovals(prev => prev.map(a => 
                a.relatedId === id ? { ...a, supabaseId: supabaseApproval.id } : a
              ));
              
              return supabaseApproval;
            } catch (error: any) {
              console.error('❌ CRITICAL: Error creating approval in Supabase database:', error);
              console.error('   Loan ID:', id);
              console.error('   Organization ID:', currentUser.organizationId);
              console.error('   Error message:', error.message);
              console.error('   Error details:', error);
              
              toast.error(`Failed to create approval in database: ${error.message}`);
              throw error;
            }
          };
          
          // Execute the creation immediately (non-blocking but with comprehensive logging)
          createApprovalInDB();
        }
      }
    }
    
    // Check if loan is being disbursed
    const isBeingDisbursed = updates.status === 'Disbursed' && updatedLoan.status !== 'Disbursed';
    
    if (isBeingDisbursed && updates.paymentSource) {
      // Deduct from bank account
      const bankAccount = bankAccounts.find(acc => acc.id === updates.paymentSource);
      if (bankAccount) {
        const newBalance = bankAccount.balance - updatedLoan.principalAmount;
        
        // Update bank account balance
        setBankAccounts(bankAccounts.map(acc => 
          acc.id === updates.paymentSource 
            ? { ...acc, balance: newBalance, lastUpdated: new Date().toISOString() }
            : acc
        ));
        
        // Create funding transaction record (Debit)
        const disbursementTransaction: FundingTransaction = {
          id: `FT-DISB-${id}-${Date.now()}`,
          bankAccountId: updates.paymentSource,
          amount: updatedLoan.principalAmount,
          date: updates.disbursementDate || new Date().toISOString().split('T')[0],
          reference: `Loan Disbursement - ${id.split('-')[0]}`, // ✅ Shorten UUID to first segment
          description: `Loan disbursed to ${updatedLoan.clientName} (${updatedLoan.clientId})`,
          source: 'Loan Disbursement',
          transactionType: 'Debit',
          relatedLoanId: id,
          paymentMethod: bankAccount.accountType === 'Mobile Money' ? 'M-Pesa' : 'Bank Transfer'
        };
        
        setFundingTransactions([...fundingTransactions, disbursementTransaction]);
        
        // Create journal entry for disbursement
        const journalEntryData = createLoanDisbursementEntry(
          updatedLoan, 
          updates.disbursementDate || new Date().toISOString().split('T')[0], 
          currentUser?.name || 'System'
        );
        addJournalEntry(journalEntryData);
        
        // Add audit log
        addAuditLog({
          userId: currentUser?.id || 'system',
          userName: currentUser?.name || 'System',
          action: 'Disburse Loan',
          module: 'Loan',
          entityType: 'Loan',
          entityId: id,
          changes: `Loan disbursed from ${bankAccount.name} to ${updatedLoan.clientName} - ${getCurrencyCode()} ${updatedLoan.principalAmount.toLocaleString()}. Account balance: ${getCurrencyCode()} ${newBalance.toLocaleString()}`,
          ipAddress: '0.0.0.0',
          status: 'Success'
        });
        
        // Show success toast
        toast.success(`Loan disbursed successfully! ${getCurrencyCode()} ${updatedLoan.principalAmount.toLocaleString()} deducted from ${bankAccount.name}`);
      }
    }
    
    setLoans(loans.map(l => l.id === id ? fullUpdatedLoan : l));
    
    // ✅ UPDATE SUPABASE - IMMEDIATE AND ROBUST
    if (currentUser?.organizationId) {
      const updateLoanInDB = async () => {
        try {
          console.log('🔄 [DB UPDATE] Updating loan in Supabase database:', {
            loanId: id,
            updates: updates,
            organizationId: currentUser.organizationId
          });
          
          await supabaseDataService.loans.update(id, updates, currentUser.organizationId);
          
          console.log('✅ [DB UPDATE] Loan successfully updated in Supabase database');
          console.log('   📝 Loan ID:', id);
          console.log('   📊 Updated fields:', Object.keys(updates));
          if (updates.status) {
            console.log('   ✓ Status updated to:', updates.status);
          }
        } catch (error: any) {
          console.error('❌ CRITICAL: Error updating loan in Supabase database:', error);
          console.error('   Loan ID:', id);
          console.error('   Organization ID:', currentUser.organizationId);
          console.error('   Updates:', updates);
          console.error('   Error message:', error.message);
          console.error('   Error details:', error);
          
          toast.error(`Failed to update loan in database: ${error.message}`);
        }
      };
      
      // Execute the update immediately (non-blocking but with comprehensive logging)
      updateLoanInDB();
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      console.log('[DB DELETE] 🗑️ Deleting loan from Supabase:', id);
      
      // ✅ 1. DELETE FROM SUPABASE FIRST
      if (!currentUser?.organizationId) {
        throw new Error('No organization selected');
      }
      
      await supabaseDataService.loans.delete(id, currentUser.organizationId);
      console.log('[DB DELETE] ✅ Successfully deleted loan from database');
      
      // ✅ 2. UPDATE LOCAL STATE (for fast UI)
      setLoans(loans.filter(l => l.id !== id));
      
      toast.success('Loan deleted successfully');
    } catch (error: any) {
      console.error('[DB DELETE] ❌ Error deleting loan:', error);
      
      // Show user-facing error notification
      if (error.message?.includes('offline') || error.message?.includes('network')) {
        toast.error('Database not reachable. Check your internet connection.');
      } else {
        toast.error(`Failed to delete loan: ${error.message}`);
      }
      
      throw error;
    }
  };

  const getLoan = (id: string) => {
    return loans.find(l => l.id === id);
  };

  const settleLoanEarly = (id: string, settlementDate: string, paymentMethod: string, settlementAmount: number) => {
    // Update the loan to "Fully Paid" status
    setLoans(loans.map(l => 
      l.id === id ? {
        ...l,
        status: 'Fully Paid',
        outstandingBalance: 0,
        paidAmount: l.totalRepayable,
        lastPaymentDate: settlementDate,
        lastPaymentAmount: settlementAmount,
        notes: `${l.notes ? l.notes + '\n' : ''}Early settlement completed on ${settlementDate} via ${paymentMethod}. Settlement amount: KES ${settlementAmount.toLocaleString()}`
      } : l
    ));
    
    // Add a repayment record for the settlement
    const loan = loans.find(l => l.id === id);
    if (loan) {
      const newRepayment: Repayment = {
        id: `REP${Date.now()}`,
        loanId: id,
        clientId: loan.clientId,
        clientName: loan.clientName,
        amount: settlementAmount,
        paymentDate: settlementDate,
        paymentMethod: paymentMethod as 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque',
        receiptNumber: generateReceiptNumber(),
        principalPaid: Math.round(settlementAmount * 0.7),
        interestPaid: Math.round(settlementAmount * 0.2),
        penaltyPaid: Math.round(settlementAmount * 0.1),
        notes: `Early loan settlement - Full payment`,
        recordedBy: 'System',
        recordedDate: settlementDate
      };
      
      setRepayments([...repayments, newRepayment]);
    }
  };

  const getClientLoans = (clientId: string) => {
    return loans.filter(l => l.clientId === clientId);
  };

  // ============= GUARANTOR FUNCTIONS =============

  const addGuarantor = (guarantor: any) => {
    setGuarantors([...guarantors, guarantor]);
  };

  const updateGuarantor = (id: string, updates: any) => {
    setGuarantors(guarantors.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGuarantor = (id: string) => {
    setGuarantors(guarantors.filter(g => g.id !== id));
  };

  const getLoanGuarantors = (loanId: string) => {
    return guarantors.filter(g => g.loanId === loanId);
  };

  // ============= COLLATERAL FUNCTIONS =============

  const addCollateral = (collateral: any) => {
    setCollaterals([...collaterals, collateral]);
  };

  const updateCollateral = (id: string, updates: any) => {
    setCollaterals(collaterals.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCollateral = (id: string) => {
    setCollaterals(collaterals.filter(c => c.id !== id));
  };

  const getLoanCollaterals = (loanId: string) => {
    return collaterals.filter(c => c.loanId === loanId);
  };

  // ============= LOAN DOCUMENT FUNCTIONS =============

  const addLoanDocument = (document: any) => {
    setLoanDocuments([...loanDocuments, document]);
  };

  const deleteLoanDocument = (id: string) => {
    setLoanDocuments(loanDocuments.filter(d => d.id !== id));
  };

  const getLoanDocuments = (loanId: string) => {
    return loanDocuments.filter(d => d.loanId === loanId);
  };

  const restructureLoan = (restructureData: {
    loanId: string;
    restructureDate: string;
    newTenor: number;
    newInterestRate: number;
    newPrincipal: number;
    newMonthlyPayment: number;
    reason: string;
    waivePenalties: boolean;
  }) => {
    const loan = loans.find(l => l.id === restructureData.loanId);
    if (!loan) return;

    // Update the existing loan with new terms
    setLoans(loans.map(l => 
      l.id === restructureData.loanId ? {
        ...l,
        principalAmount: restructureData.newPrincipal,
        interestRate: restructureData.newInterestRate,
        term: restructureData.newTenor,
        installmentAmount: restructureData.newMonthlyPayment,
        numberOfInstallments: restructureData.newTenor,
        totalRepayable: restructureData.newMonthlyPayment * restructureData.newTenor,
        totalInterest: (restructureData.newMonthlyPayment * restructureData.newTenor) - restructureData.newPrincipal,
        outstandingBalance: restructureData.newMonthlyPayment * restructureData.newTenor,
        penaltyAmount: restructureData.waivePenalties ? 0 : l.penaltyAmount,
        daysInArrears: 0,
        arrearsAmount: 0,
        maturityDate: new Date(
          new Date(restructureData.restructureDate).setMonth(
            new Date(restructureData.restructureDate).getMonth() + restructureData.newTenor
          )
        ).toISOString().split('T')[0],
        notes: `${l.notes ? l.notes + '\n' : ''}Loan restructured on ${restructureData.restructureDate}. Reason: ${restructureData.reason}. New terms: ${restructureData.newTenor} months at ${restructureData.newInterestRate}% interest${restructureData.waivePenalties ? ' (penalties waived)' : ''}.`
      } : l
    ));
  };

  const approveLoan = (id: string, approvedBy: string) => {
    const loan = loans.find(l => l.id === id);
    setLoans(loans.map(l => 
      l.id === id ? {
        ...l,
        status: 'Approved',
        approvedBy,
        approvedDate: new Date().toISOString().split('T')[0]
      } : l
    ));
    
    // Add audit log
    if (loan) {
      addAuditLog({
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'System',
        action: 'Approve Loan',
        module: 'Loan',
        entityType: 'Loan',
        entityId: id,
        changes: `Loan approved for ${loan.clientName} - KES ${loan.principalAmount.toLocaleString()}`,
        ipAddress: '0.0.0.0',
        status: 'Success'
      });
    }
  };

  const disburseLoan = (id: string, disbursedBy: string, disbursementDate: string) => {
    const loan = loans.find(l => l.id === id);
    
    setLoans(loans.map(l => 
      l.id === id ? {
        ...l,
        status: 'Active',
        disbursedBy,
        disbursedDate: disbursementDate,
        disbursementDate: disbursementDate
      } : l
    ));

    // Create journal entry for loan disbursement
    if (loan) {
      const journalEntryData = createLoanDisbursementEntry(loan, disbursementDate, disbursedBy);
      addJournalEntry(journalEntryData);
      
      // Add audit log
      addAuditLog({
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'System',
        action: 'Disburse Loan',
        module: 'Loan',
        entityType: 'Loan',
        entityId: id,
        changes: `Loan disbursed to ${loan.clientName} - KES ${loan.principalAmount.toLocaleString()}`,
        ipAddress: '0.0.0.0',
        status: 'Success'
      });
    }
  };

  // ============= REPAYMENT FUNCTIONS =============

  const addRepayment = async (repaymentData: Omit<Repayment, 'id' | 'createdDate'>) => {
    try {
      console.log('🔵 Creating repayment with Supabase-first approach...');
      
      // Get the loan to find the client UUID
      const loan = loans.find(l => l.id === repaymentData.loanId);
      const clientUuid = (loan as any)?.clientUuid || repaymentData.clientId;
      
      console.log('📊 Repayment Data:', {
        loanId: repaymentData.loanId,
        clientId: repaymentData.clientId,
        clientUuid: clientUuid,
        amount: repaymentData.amount
      });
      
      // ✅ 1. WRITE TO SUPABASE FIRST
      const supabaseRepayment = await supabaseDataService.repayments.create(
        {
          loanId: repaymentData.loanId,
          clientId: clientUuid, // Use the actual UUID for Supabase
          amount: repaymentData.amount,
          paymentDate: repaymentData.paymentDate,
          paymentMethod: repaymentData.paymentMethod,
          transactionRef: repaymentData.paymentReference,
          principalAmount: repaymentData.principal || 0,
          interestAmount: repaymentData.interest || 0,
          penaltyAmount: repaymentData.penalty || 0,
          receivedBy: repaymentData.receivedBy || currentUser?.name || 'System'
        },
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Repayment created in Supabase:', supabaseRepayment);
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      const newRepayment: Repayment = {
        ...repaymentData,
        id: supabaseRepayment.id || `RPY${Date.now()}`,
        createdDate: supabaseRepayment.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      };
      setRepayments([...repayments, newRepayment]);

    // Update loan balance and bank account (loan already declared above)
    if (loan && newRepayment.status === 'Approved') {
      updateLoan(loan.id, {
        paidAmount: loan.paidAmount + repaymentData.amount,
        outstandingBalance: loan.outstandingBalance - repaymentData.amount,
        lastPaymentDate: repaymentData.paymentDate,
        status: (loan.outstandingBalance - repaymentData.amount) <= 0 ? 'Fully Paid' : loan.status
      });
      
      // If bankAccountId provided, credit to bank account
      if (newRepayment.bankAccountId) {
        const bankAccount = bankAccounts.find(b => b.id === newRepayment.bankAccountId);
        if (bankAccount) {
          // Increase bank account balance
          updateBankAccount(bankAccount.id, {
            balance: bankAccount.balance + newRepayment.amount
          });
          
          // Create funding transaction record
          addFundingTransaction({
            bankAccountId: bankAccount.id,
            amount: newRepayment.amount,
            date: newRepayment.paymentDate,
            reference: newRepayment.paymentReference,
            description: `Loan Repayment - ${newRepayment.clientName} (Principal: ${newRepayment.principal.toLocaleString()}, Interest: ${newRepayment.interest.toLocaleString()}, Penalty: ${newRepayment.penalty.toLocaleString()})`,
            source: 'Loan Repayment',
            paymentMethod: newRepayment.paymentMethod as 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque',
            depositorName: newRepayment.clientName,
            transactionType: 'Credit',
            relatedLoanId: newRepayment.loanId
          });
        }
      }
      
      // Create journal entry for repayment
      const journalEntryData = createLoanRepaymentEntry(newRepayment, loan.clientName, repaymentData.receivedBy || 'System');
      addJournalEntry(journalEntryData);
      
      // Recalculate client's credit score after successful payment
      setTimeout(() => {
        const updatedScore = calculateClientCreditScore(repaymentData.clientId);
        updateClient(repaymentData.clientId, { creditScore: updatedScore });
      }, 100);
    }
    
      // Add audit log
      if (loan) {
        addAuditLog({
          userId: currentUser?.id || 'system',
          userName: currentUser?.name || 'System',
          action: 'Record Loan Payment',
          module: 'Payment',
          entityType: 'Repayment',
          entityId: newRepayment.id,
          changes: `Payment of KES ${repaymentData.amount.toLocaleString()} for loan ${loan.id} - ${loan.clientName}`,
          ipAddress: '0.0.0.0',
          status: 'Success'
        });
      }
      
      toast.success('✅ Repayment recorded successfully in Supabase');
      
    } catch (error: any) {
      console.error('❌ Error creating repayment:', error);
      toast.error(`Failed to record repayment: ${error.message}`);
      throw error;
    }
  };

  const updateRepayment = (id: string, updates: Partial<Repayment>) => {
    setRepayments(repayments.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRepayment = (id: string) => {
    const repayment = repayments.find(r => r.id === id);
    if (repayment && repayment.status === 'Approved') {
      // Revert loan balance
      const loan = loans.find(l => l.id === repayment.loanId);
      if (loan) {
        updateLoan(loan.id, {
          paidAmount: loan.paidAmount - repayment.amount,
          outstandingBalance: loan.outstandingBalance + repayment.amount
        });
      }
    }
    setRepayments(repayments.filter(r => r.id !== id));
  };

  const getLoanRepayments = (loanId: string) => {
    return repayments.filter(r => r.loanId === loanId);
  };

  const approveRepayment = (id: string, approvedBy: string, bankAccountId?: string) => {
    const repayment = repayments.find(r => r.id === id);
    if (repayment) {
      setRepayments(repayments.map(r => 
        r.id === id ? {
          ...r,
          status: 'Approved',
          approvedBy,
          approvedDate: new Date().toISOString().split('T')[0],
          bankAccountId: bankAccountId || r.bankAccountId
        } : r
      ));

      // Update loan balance
      const loan = loans.find(l => l.id === repayment.loanId);
      if (loan) {
        updateLoan(loan.id, {
          paidAmount: loan.paidAmount + repayment.amount,
          outstandingBalance: loan.outstandingBalance - repayment.amount,
          lastPaymentDate: repayment.paymentDate,
          status: (loan.outstandingBalance - repayment.amount) <= 0 ? 'Fully Paid' : loan.status
        });
        
        // If bankAccountId provided, credit to bank account
        const accountId = bankAccountId || repayment.bankAccountId;
        if (accountId) {
          const bankAccount = bankAccounts.find(b => b.id === accountId);
          if (bankAccount) {
            // Increase bank account balance
            updateBankAccount(bankAccount.id, {
              balance: bankAccount.balance + repayment.amount
            });
            
            // Create funding transaction record
            addFundingTransaction({
              bankAccountId: bankAccount.id,
              amount: repayment.amount,
              date: new Date().toISOString().split('T')[0],
              reference: repayment.paymentReference,
              description: `Loan Repayment Approved - ${repayment.clientName} (Principal: ${repayment.principal.toLocaleString()}, Interest: ${repayment.interest.toLocaleString()}, Penalty: ${repayment.penalty.toLocaleString()})`,
              source: 'Loan Repayment',
              paymentMethod: repayment.paymentMethod as 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque',
              depositorName: repayment.clientName,
              transactionType: 'Credit',
              relatedLoanId: repayment.loanId
            });
          }
        }
        
        // Create journal entry for repayment
        const journalEntryData = createLoanRepaymentEntry(repayment, loan.clientName, approvedBy);
        addJournalEntry(journalEntryData);
        
        // Recalculate client's credit score
        setTimeout(() => {
          const updatedScore = calculateClientCreditScore(repayment.clientId);
          updateClient(repayment.clientId, { creditScore: updatedScore });
        }, 100);
      }
    }
  };

  // ============= CREDIT SCORE CALCULATION =============

  const calculateClientCreditScore = (clientId: string): number => {
    const clientLoans = loans.filter(l => l.clientId === clientId);
    const clientRepayments = repayments.filter(r => r.clientId === clientId && r.status === 'Approved');
    
    // If no loan history, return 0
    if (clientLoans.length === 0) {
      return 0;
    }

    let score = 300; // Base score for having loan history

    // 1. Payment History (40 points) - Most important factor
    const totalLoans = clientLoans.length;
    const closedLoans = clientLoans.filter(l => l.status === 'Fully Paid' || l.status === 'Closed').length;
    const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed').length;
    const loansInArrears = clientLoans.filter(l => l.status === 'In Arrears').length;
    
    // Positive: Successfully closed loans
    score += closedLoans * 8; // Up to 40 points for 5+ closed loans
    
    // Negative: Loans in arrears
    score -= loansInArrears * 50; // Heavy penalty for defaults
    
    // 2. Repayment Consistency (30 points)
    if (clientRepayments.length > 0) {
      const onTimePayments = clientRepayments.length;
      score += Math.min(30, onTimePayments * 3); // 3 points per payment, max 30
    }

    // 3. Credit Utilization (20 points)
    const totalBorrowed = clientLoans.reduce((sum, l) => sum + l.principalAmount, 0);
    const totalRepaid = clientRepayments.reduce((sum, r) => sum + r.principal, 0);
    if (totalBorrowed > 0) {
      const repaymentRate = (totalRepaid / totalBorrowed) * 100;
      score += Math.min(20, Math.floor(repaymentRate / 5)); // Up to 20 points for 100% repayment rate
    }

    // 4. Credit History Length (10 points)
    const oldestLoan = clientLoans.reduce((oldest, loan) => {
      return !oldest || new Date(loan.createdDate) < new Date(oldest.createdDate) ? loan : oldest;
    }, null as Loan | null);
    
    if (oldestLoan) {
      const monthsSinceFirst = Math.floor(
        (new Date().getTime() - new Date(oldestLoan.createdDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      score += Math.min(10, Math.floor(monthsSinceFirst / 3)); // 1 point per 3 months, max 10
    }

    // 5. Active loan management (bonus/penalty)
    if (activeLoans > 0) {
      clientLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed').forEach(loan => {
        if (loan.daysInArrears > 30) {
          score -= 30; // Penalty for being more than 30 days late
        } else if (loan.daysInArrears > 0) {
          score -= 10; // Minor penalty for being late
        }
      });
    }

    // Ensure score is within 0-850 range
    return Math.max(0, Math.min(850, score));
  };

  const updateAllClientCreditScores = () => {
    clients.forEach(client => {
      const newScore = calculateClientCreditScore(client.id);
      if (newScore !== client.creditScore) {
        updateClient(client.id, { creditScore: newScore });
      }
    });
  };

  // ============= SAVINGS FUNCTIONS =============

  const addSavingsAccount = (accountData: Omit<Savings, 'id' | 'balance' | 'totalDeposits' | 'totalWithdrawals' | 'interestEarned'>) => {
    const newAccount: Savings = {
      ...accountData,
      id: `SAV${Date.now()}`,
      balance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      interestEarned: 0,
    };
    setSavingsAccounts([...savingsAccounts, newAccount]);
  };

  const updateSavingsAccount = (id: string, updates: Partial<Savings>) => {
    setSavingsAccounts(savingsAccounts.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteSavingsAccount = (id: string) => {
    setSavingsAccounts(savingsAccounts.filter(a => a.id !== id));
  };

  const getSavingsAccount = (id: string) => {
    return savingsAccounts.find(a => a.id === id);
  };

  const getClientSavingsAccounts = (clientId: string) => {
    return savingsAccounts.filter(a => a.clientId === clientId);
  };

  // ============= SAVINGS TRANSACTION FUNCTIONS =============

  const addSavingsTransaction = (transactionData: Omit<SavingsTransaction, 'id' | 'createdDate' | 'balance'>) => {
    const account = savingsAccounts.find(a => a.id === transactionData.accountId);
    if (!account) return;

    const newBalance = transactionData.type === 'Deposit' || transactionData.type === 'Interest'
      ? account.balance + transactionData.amount
      : account.balance - transactionData.amount;

    const newTransaction: SavingsTransaction = {
      ...transactionData,
      id: `STX${Date.now()}`,
      balance: newBalance,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setSavingsTransactions([...savingsTransactions, newTransaction]);

    // Update account balance if approved
    if (newTransaction.status === 'Approved') {
      updateSavingsAccount(account.id, {
        balance: newBalance,
        totalDeposits: transactionData.type === 'Deposit' 
          ? account.totalDeposits + transactionData.amount 
          : account.totalDeposits,
        totalWithdrawals: transactionData.type === 'Withdrawal' 
          ? account.totalWithdrawals + transactionData.amount 
          : account.totalWithdrawals,
        interestEarned: transactionData.type === 'Interest'
          ? account.interestEarned + transactionData.amount
          : account.interestEarned,
        lastTransactionDate: transactionData.transactionDate
      });
    }
  };

  const updateSavingsTransaction = (id: string, updates: Partial<SavingsTransaction>) => {
    setSavingsTransactions(savingsTransactions.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteSavingsTransaction = (id: string) => {
    const transaction = savingsTransactions.find(t => t.id === id);
    if (transaction && transaction.status === 'Approved') {
      // Revert account balance
      const account = savingsAccounts.find(a => a.id === transaction.accountId);
      if (account) {
        const balanceChange = transaction.type === 'Deposit' || transaction.type === 'Interest'
          ? -transaction.amount
          : transaction.amount;
        
        updateSavingsAccount(account.id, {
          balance: account.balance + balanceChange,
          totalDeposits: transaction.type === 'Deposit' 
            ? account.totalDeposits - transaction.amount 
            : account.totalDeposits,
          totalWithdrawals: transaction.type === 'Withdrawal' 
            ? account.totalWithdrawals - transaction.amount 
            : account.totalWithdrawals
        });
      }
    }
    setSavingsTransactions(savingsTransactions.filter(t => t.id !== id));
  };

  const getAccountTransactions = (accountId: string) => {
    return savingsTransactions.filter(t => t.accountId === accountId);
  };

  const approveSavingsTransaction = (id: string, approvedBy: string) => {
    const transaction = savingsTransactions.find(t => t.id === id);
    if (transaction) {
      setSavingsTransactions(savingsTransactions.map(t => 
        t.id === id ? {
          ...t,
          status: 'Approved',
          approvedBy,
          approvedDate: new Date().toISOString().split('T')[0]
        } : t
      ));

      // Update account balance
      const account = savingsAccounts.find(a => a.id === transaction.accountId);
      if (account) {
        updateSavingsAccount(account.id, {
          balance: transaction.balance,
          totalDeposits: transaction.type === 'Deposit' 
            ? account.totalDeposits + transaction.amount 
            : account.totalDeposits,
          totalWithdrawals: transaction.type === 'Withdrawal' 
            ? account.totalWithdrawals + transaction.amount 
            : account.totalWithdrawals,
          lastTransactionDate: transaction.transactionDate
        });
      }
    }
  };

  // ============= LOAN PRODUCT FUNCTIONS =============

  const addLoanProduct = async (productData: Omit<LoanProduct, 'id' | 'createdDate' | 'lastUpdated'>) => {
    try {
      console.log('🔵 Creating loan product with Supabase-first approach...');
      
      // ✅ 1. WRITE TO SUPABASE FIRST
      const supabaseProduct = await supabaseDataService.loanProducts.create(
        productData,
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Loan product created in Supabase:', supabaseProduct);
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      const newProduct: LoanProduct = {
        ...productData,
        id: supabaseProduct.id || `PRD${Date.now()}`,
        code: supabaseProduct.product_code || '',
        productCode: supabaseProduct.product_code,
        createdDate: supabaseProduct.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        lastUpdated: supabaseProduct.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      };
      
      setLoanProducts([...loanProducts, newProduct]);
      toast.success('✅ Loan product created successfully in Supabase');
      
    } catch (error: any) {
      console.error('❌ Error creating loan product:', error);
      toast.error(`Failed to create loan product: ${error.message}`);
      throw error;
    }
  };

  const updateLoanProduct = async (id: string, updates: Partial<LoanProduct>) => {
    try {
      console.log('🔵 Updating loan product with Supabase-first approach...');
      
      // ✅ 1. UPDATE IN SUPABASE FIRST
      if (currentUser?.organizationId) {
        // Map frontend field names to database field names
        const dbUpdates: any = {
          updated_at: new Date().toISOString()
        };
        
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.minAmount !== undefined) dbUpdates.min_amount = updates.minAmount;
        if (updates.maxAmount !== undefined) dbUpdates.max_amount = updates.maxAmount;
        if (updates.minTerm !== undefined) dbUpdates.min_term = updates.minTerm;
        if (updates.maxTerm !== undefined) dbUpdates.max_term = updates.maxTerm;
        if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
        if (updates.interestType !== undefined) dbUpdates.interest_type = updates.interestType;
        if (updates.repaymentFrequency !== undefined) dbUpdates.repayment_frequency = updates.repaymentFrequency;
        if (updates.processingFee !== undefined) {
          if (updates.processingFeeType === 'Percentage') {
            dbUpdates.processing_fee_percentage = updates.processingFee;
            dbUpdates.processing_fee_fixed = 0;
          } else {
            dbUpdates.processing_fee_fixed = updates.processingFee;
            dbUpdates.processing_fee_percentage = 0;
          }
        }
        if (updates.status !== undefined) dbUpdates.status = updates.status.toLowerCase();
        
        await supabaseDataService.loanProducts.update(
          id,
          dbUpdates,
          currentUser.organizationId
        );
        
        console.log('✅ Loan product updated in Supabase');
      }
      
      // ✅ 2. UPDATE LOCAL STATE (for fast UI)
      setLoanProducts(loanProducts.map(p => 
        p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : p
      ));
      
    } catch (error: any) {
      console.error('❌ Error updating loan product:', error);
      toast.error(`Failed to update loan product: ${error.message}`);
      throw error;
    }
  };

  const deleteLoanProduct = async (id: string) => {
    try {
      console.log('[DB DELETE] 🗑️ Deleting loan product from Supabase:', id);
      
      // ✅ 1. DELETE FROM SUPABASE FIRST
      if (!currentUser?.organizationId) {
        throw new Error('No organization selected');
      }
      
      await supabaseDataService.loanProducts.delete(id, currentUser.organizationId);
      console.log('[DB DELETE] ✅ Successfully deleted loan product from database');
      
      // ✅ 2. UPDATE LOCAL STATE (for fast UI)
      setLoanProducts(loanProducts.filter(p => p.id !== id));
      
      toast.success('Loan product deleted successfully');
    } catch (error: any) {
      console.error('[DB DELETE] ❌ Error deleting loan product:', error);
      
      // Show user-facing error notification
      if (error.message?.includes('offline') || error.message?.includes('network')) {
        toast.error('Database not reachable. Check your internet connection.');
      } else {
        toast.error(`Failed to delete loan product: ${error.message}`);
      }
      
      throw error;
    }
  };

  const getLoanProduct = (id: string) => {
    return loanProducts.find(p => p.id === id);
  };

  // ============= SHAREHOLDER FUNCTIONS =============

  const addShareholder = async (shareholderData: Omit<Shareholder, 'id' | 'totalDividends'>) => {
    try {
      console.log('👥 Creating shareholder with Supabase-first approach...');
      
      // ✅ 1. WRITE TO SUPABASE FIRST (using actual schema columns)
      const supabaseShareholder = await supabaseDataService.shareholders.create(
        {
          shareholder_name: shareholderData.name,
          shareholder_type: 'individual', // Default type
          id_number: shareholderData.idNumber || '',
          phone: shareholderData.phone || '',
          email: shareholderData.email || '',
          total_shares: shareholderData.sharesOwned || 0,
          share_value: shareholderData.investmentAmount || 0,
          status: shareholderData.status || 'active'
        },
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Shareholder created in Supabase:', supabaseShareholder);
      
      // ✅ 2. UPDATE REACT STATE
      const newShareholder: Shareholder = {
        id: supabaseShareholder.id,
        name: supabaseShareholder.shareholder_name,
        idNumber: supabaseShareholder.id_number || '',
        phone: supabaseShareholder.phone || '',
        email: supabaseShareholder.email || '',
        address: '', // Address field not in database
        sharesOwned: supabaseShareholder.total_shares || 0,
        sharePercentage: shareholderData.sharePercentage || 0, // Not in DB, use frontend value
        investmentAmount: supabaseShareholder.share_value || 0,
        investmentDate: shareholderData.investmentDate || new Date().toISOString().split('T')[0],
        status: supabaseShareholder.status,
        totalDividends: 0
      };
      
      setShareholders([...shareholders, newShareholder]);
      toast.success('Shareholder created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating shareholder:', error);
      toast.error('Database not reachable. Check your internet connection.');
    }
  };

  const updateShareholder = (id: string, updates: Partial<Shareholder>) => {
    setShareholders(shareholders.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteShareholder = (id: string) => {
    setShareholders(shareholders.filter(s => s.id !== id));
  };

  const getShareholder = (id: string) => {
    return shareholders.find(s => s.id === id);
  };

  // ✅ NEW: Refresh shareholders from database
  const refreshShareholders = async () => {
    try {
      console.log('��� Refreshing shareholders from database...');
      
      if (!currentUser?.organizationId) {
        console.warn('⚠️ No organization ID available for refreshing shareholders');
        toast.error('No organization ID available');
        return;
      }
      
      // ✅ Load shareholders from individual shareholders table (NOT project_states)
      const supabaseShareholders = await supabaseDataService.shareholders.getAll(currentUser.organizationId);
      
      console.log('📊 Raw shareholders from Supabase:', supabaseShareholders);
      
      if (supabaseShareholders && supabaseShareholders.length > 0) {
        // Map Supabase schema to frontend Shareholder type
        const mappedShareholders = supabaseShareholders.map((s: any) => ({
          id: s.id,
          name: s.shareholder_name || s.name || 'Unknown',
          idNumber: s.id_number || '',
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || '',
          sharesOwned: s.total_shares || 0,
          sharePercentage: s.share_percentage || 0,
          investmentAmount: s.share_value || 0,
          investmentDate: s.investment_date || s.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: s.status || 'active',
          totalDividends: s.total_dividends || 0,
          shareCapital: s.share_capital || 0
        }));
        
        console.log(`✅ Refreshed ${mappedShareholders.length} shareholders from database`);
        setShareholders(mappedShareholders);
        // Remove toast notification to avoid duplicate toasts on login
      } else {
        console.log('ℹ️ No shareholders found in database');
        setShareholders([]);
        // Remove toast notification to avoid duplicate toasts on login
      }
    } catch (error: any) {
      console.error('❌ Error refreshing shareholders:', error);
      toast.error('Database not reachable. Check your internet connection.');
    }
  };

  // ============= SHAREHOLDER TRANSACTION FUNCTIONS =============

  const addShareholderTransaction = (transactionData: Omit<ShareholderTransaction, 'id' | 'createdDate'>) => {
    const newTransaction: ShareholderTransaction = {
      ...transactionData,
      id: `SHT${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setShareholderTransactions([...shareholderTransactions, newTransaction]);

    // Update shareholder totals
    const shareholder = shareholders.find(s => s.id === transactionData.shareholderId);
    if (shareholder) {
      if (transactionData.type === 'Capital Contribution') {
        updateShareholder(shareholder.id, {
          shareCapital: shareholder.shareCapital + transactionData.amount
        });
      } else if (transactionData.type === 'Dividend Payment') {
        updateShareholder(shareholder.id, {
          totalDividends: shareholder.totalDividends + transactionData.amount
        });
      } else if (transactionData.type === 'Capital Withdrawal') {
        updateShareholder(shareholder.id, {
          shareCapital: shareholder.shareCapital - transactionData.amount
        });
      }
    }

    // Update bank account balance if bankAccountId is provided
    if (transactionData.bankAccountId) {
      const bankAccount = bankAccounts.find(b => b.id === transactionData.bankAccountId);
      if (bankAccount) {
        if (transactionData.type === 'Capital Contribution') {
          // Increase bank account balance for capital contributions
          updateBankAccount(bankAccount.id, {
            balance: bankAccount.balance + transactionData.amount
          });
        } else if (transactionData.type === 'Dividend Payment' || transactionData.type === 'Capital Withdrawal') {
          // Decrease bank account balance for dividend payments and withdrawals
          updateBankAccount(bankAccount.id, {
            balance: bankAccount.balance - transactionData.amount
          });
        }
      }
    }
  };

  const updateShareholderTransaction = (id: string, updates: Partial<ShareholderTransaction>) => {
    setShareholderTransactions(shareholderTransactions.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteShareholderTransaction = (id: string) => {
    setShareholderTransactions(shareholderTransactions.filter(t => t.id !== id));
  };

  const getShareholderTransactions = (shareholderId: string) => {
    return shareholderTransactions.filter(t => t.shareholderId === shareholderId);
  };

  // ============= EXPENSE FUNCTIONS =============

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdDate'>) => {
    try {
      console.log('💸 Creating expense with Supabase-first approach...');
      console.log('📋 Expense data:', expenseData);
      
      // ✅ 1. WRITE TO SUPABASE FIRST (with all fields)
      const supabaseExpense = await supabaseDataService.expenses.create(
        {
          category: expenseData.category,
          description: expenseData.description,
          amount: expenseData.amount,
          expense_date: expenseData.expenseDate,
          payment_method: expenseData.paymentMethod,
          payee_id: expenseData.payeeId || null,
          payment_reference: expenseData.paymentReference || null,
          bank_account_id: expenseData.bankAccountId || null,
          subcategory: expenseData.subcategory || null,
          payment_type: expenseData.paymentType || null,
          created_by: expenseData.createdBy || 'System',
          status: expenseData.status || 'Approved'
        },
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Expense created in Supabase:', supabaseExpense);
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      // Note: Additional fields (payeeName, bankAccountId, receiptNumber, etc.)
      // are stored in React state only until the schema is updated
      const newExpense: Expense = {
        id: supabaseExpense.id,
        category: supabaseExpense.category,
        description: supabaseExpense.description,
        amount: supabaseExpense.amount,
        expenseDate: supabaseExpense.payment_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        paymentMethod: supabaseExpense.payment_method,
        paymentReference: expenseData.paymentReference || '',
        payeeId: supabaseExpense.payee_id,
        payeeName: expenseData.payeeName || '',
        bankAccountId: expenseData.bankAccountId || '',
        receiptNumber: expenseData.receiptNumber || '',
        status: (supabaseExpense.status || 'Approved') as 'Pending' | 'Approved' | 'Paid' | 'Rejected',
        createdBy: expenseData.createdBy,
        createdDate: supabaseExpense.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        approvedBy: expenseData.approvedBy || null,
        approvedDate: expenseData.approvedDate || null,
        paidBy: expenseData.paidBy || null,
        paidDate: expenseData.paidDate || null,
        notes: expenseData.notes || ''
      };
      
      setExpenses([...expenses, newExpense]);

    // If expense is Paid and has a bankAccountId, deduct from bank account
    if (newExpense.status === 'Paid' && newExpense.bankAccountId) {
      const bankAccount = bankAccounts.find(b => b.id === newExpense.bankAccountId);
      if (bankAccount) {
        // Reduce bank account balance
        updateBankAccount(bankAccount.id, {
          balance: bankAccount.balance - newExpense.amount
        });
        
        // Create funding transaction record
        addFundingTransaction({
          bankAccountId: bankAccount.id,
          amount: newExpense.amount,
          date: newExpense.expenseDate,
          reference: newExpense.paymentReference || `EXP-${newExpense.id}`,
          description: `Expense: ${newExpense.description} - ${newExpense.payeeName}`,
          source: 'Expense Payment',
          paymentMethod: newExpense.paymentMethod as 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque',
          depositorName: newExpense.paidBy || newExpense.createdBy,
          transactionType: 'Debit'
        });
        
        // Update paid fields when recording as paid immediately
        newExpense.paidBy = newExpense.createdBy;
        newExpense.paidDate = newExpense.expenseDate;
        newExpense.approvedBy = newExpense.createdBy;
        newExpense.approvedDate = newExpense.expenseDate;
        
        // Update payee total
        if (newExpense.payeeId) {
          const payee = payees.find(p => p.id === newExpense.payeeId);
          if (payee) {
            updatePayee(payee.id, {
              totalPaid: payee.totalPaid + newExpense.amount,
              lastPaymentDate: newExpense.expenseDate
            });
          }
        }
      }
    }

      // Create journal entry for expense (when status is Paid or if auto-approved)
      if (newExpense.status === 'Paid' || newExpense.status === 'Approved') {
        const journalEntryData = createExpenseEntry(newExpense, expenseData.createdBy);
        addJournalEntry(journalEntryData);
      }
      
      toast.success('Expense created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating expense:', error);
      toast.error('Database not reachable. Check your internet connection.');
      throw error;
    }
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const getExpense = (id: string) => {
    return expenses.find(e => e.id === id);
  };

  const approveExpense = (id: string, approvedBy: string) => {
    const updatedExpense = {
      status: 'Approved' as const,
      approvedBy,
      approvedDate: new Date().toISOString().split('T')[0]
    };
    
    setExpenses(expenses.map(e => 
      e.id === id ? { ...e, ...updatedExpense } : e
    ));
  };

  const payExpense = (id: string, paidBy: string, receiptNumber: string, bankAccountId?: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setExpenses(expenses.map(e => 
        e.id === id ? {
          ...e,
          status: 'Paid',
          paidBy,
          paidDate: new Date().toISOString().split('T')[0],
          receiptNumber,
          bankAccountId: bankAccountId || e.bankAccountId
        } : e
      ));

      // If bankAccountId provided, deduct from bank account
      if (bankAccountId || expense.bankAccountId) {
        const accountId = bankAccountId || expense.bankAccountId!;
        const bankAccount = bankAccounts.find(b => b.id === accountId);
        if (bankAccount) {
          // Reduce bank account balance
          updateBankAccount(bankAccount.id, {
            balance: bankAccount.balance - expense.amount
          });
          
          // Create funding transaction record
          addFundingTransaction({
            bankAccountId: bankAccount.id,
            amount: expense.amount,
            date: new Date().toISOString().split('T')[0],
            reference: expense.paymentReference || receiptNumber,
            description: `Expense Payment: ${expense.description} - ${expense.payeeName}`,
            source: 'Expense Payment',
            paymentMethod: expense.paymentMethod as 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque',
            depositorName: paidBy,
            transactionType: 'Debit'
          });
        }
      }

      // Create journal entry for expense payment
      const journalEntryData = createExpenseEntry(expense, paidBy);
      addJournalEntry(journalEntryData);

      // Update payee total
      if (expense.payeeId) {
        const payee = payees.find(p => p.id === expense.payeeId);
        if (payee) {
          updatePayee(payee.id, {
            totalPaid: payee.totalPaid + expense.amount,
            lastPaymentDate: new Date().toISOString().split('T')[0]
          });
        }
      }
    }
  };

  // ============= PAYEE FUNCTIONS =============

  const addPayee = async (payeeData: Omit<Payee, 'id' | 'totalPaid' | 'createdDate'>) => {
    try {
      console.log('💰 Creating payee with Supabase-first approach...');
      console.log('   Payee data:', payeeData);
      
      // ✅ 1. WRITE TO SUPABASE FIRST - Map all fields correctly
      const supabasePayee = await supabaseDataService.payees.create(
        {
          payee_name: payeeData.name,
          payee_type: payeeData.type,
          phone: payeeData.phone || '',
          email: payeeData.email || '',
          address: (payeeData as any).physicalAddress || (payeeData as any).address || '',
          bank_name: (payeeData as any).bankName || '',
          account_number: (payeeData as any).accountNumber || '',
          category: (payeeData as any).category || 'Other'
        },
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Payee created in Supabase:', supabasePayee);
      
      // ✅ 2. If type is Employee, also save to employees table
      if (payeeData.type === 'Employee') {
        console.log('👤 Creating employee record for Employee type payee...');
        try {
          // Split name into first_name and last_name
          const nameParts = payeeData.name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          const employeeData = {
            first_name: firstName,
            last_name: lastName,
            phone: payeeData.phone || '',
            email: payeeData.email || '',
            bank_name: (payeeData as any).bankName || '',
            account_number: (payeeData as any).accountNumber || '',
            // Store additional info in allowances JSONB field
            allowances: {
              kra_pin: (payeeData as any).kraPin || '',
              physical_address: (payeeData as any).physicalAddress || (payeeData as any).address || '',
              mpesa_number: (payeeData as any).mpesaNumber || '',
              contact_person: (payeeData as any).contactPerson || '',
              notes: (payeeData as any).notes || '',
              payee_id: supabasePayee.id // Link to payee record
            }
          };
          
          const supabaseEmployee = await supabaseDataService.employees.create(
            employeeData,
            currentUser?.organizationId || ''
          );
          
          console.log('✅ Employee record created in Supabase:', supabaseEmployee);
        } catch (employeeError) {
          console.error('⚠️ Warning: Failed to create employee record:', employeeError);
        }
      }
      
      // ✅ 3. UPDATE REACT STATE
      const newPayee: Payee = {
        id: supabasePayee.id,
        name: supabasePayee.payee_name,
        type: supabasePayee.payee_type,
        phone: supabasePayee.phone || '',
        email: supabasePayee.email || '',
        category: supabasePayee.category || (payeeData as any).category || 'Other',
        status: supabasePayee.status || 'Active',
        totalPaid: 0,
        createdDate: supabasePayee.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      } as Payee;
      
      setPayees([...payees, newPayee]);
      toast.success(payeeData.type === 'Employee' ? 'Employee created successfully!' : 'Payee created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating payee:', error);
      toast.error('Database not reachable. Check your internet connection.');
    }
  };

  const updatePayee = (id: string, updates: Partial<Payee>) => {
    setPayees(payees.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePayee = (id: string) => {
    setPayees(payees.filter(p => p.id !== id));
  };

  const getPayee = (id: string) => {
    return payees.find(p => p.id === id);
  };

  // ============= PAYROLL FUNCTIONS =============

  const addPayrollRun = async (payrollData: Omit<PayrollRun, 'id' | 'createdDate'>) => {
    try {
      // ✅ 1. CREATE PAYROLL RUN IN SUPABASE
      const supabaseRun = await supabaseDataService.payroll.createRun(
        {
          payroll_period: payrollData.period,
          payroll_date: payrollData.payDate,
          total_gross: payrollData.totalGrossPay,
          total_deductions: payrollData.totalDeductions,
          total_net: payrollData.totalNetPay,
          status: payrollData.status?.toLowerCase() || 'draft'
        },
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Payroll run created in Supabase:', supabaseRun);
      
      // ✅ 2. UPDATE REACT STATE
      const newPayroll: PayrollRun = {
        id: supabaseRun.id,
        period: supabaseRun.payroll_period,
        payDate: supabaseRun.payroll_date?.split('T')[0] || payrollData.payDate,
        employees: payrollData.employees,
        totalGrossPay: supabaseRun.total_gross,
        totalDeductions: supabaseRun.total_deductions,
        totalNetPay: supabaseRun.total_net,
        status: (supabaseRun.status.charAt(0).toUpperCase() + supabaseRun.status.slice(1)) as any,
        createdBy: payrollData.createdBy,
        createdDate: supabaseRun.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        notes: payrollData.notes || ''
      };
      
      setPayrollRuns([...payrollRuns, newPayroll]);
      
    } catch (error) {
      console.error('❌ Error creating payroll run:', error);
      toast.error('Database not reachable. Check your internet connection.');
      throw error;
    }
  };

  const updatePayrollRun = (id: string, updates: Partial<PayrollRun>) => {
    setPayrollRuns(payrollRuns.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePayrollRun = (id: string) => {
    setPayrollRuns(payrollRuns.filter(p => p.id !== id));
  };

  const getPayrollRun = (id: string) => {
    return payrollRuns.find(p => p.id === id);
  };

  const processPayroll = (id: string, paidDate: string, bankAccountId?: string) => {
    const payroll = payrollRuns.find(p => p.id === id);
    if (payroll) {
      // If bankAccountId provided, deduct from bank account
      if (bankAccountId) {
        const bankAccount = bankAccounts.find(b => b.id === bankAccountId);
        if (bankAccount) {
          // Reduce bank account balance
          updateBankAccount(bankAccount.id, {
            balance: bankAccount.balance - payroll.totalNetPay
          });
          
          // Create funding transaction record
          addFundingTransaction({
            bankAccountId: bankAccount.id,
            amount: payroll.totalNetPay,
            date: paidDate,
            reference: `PAYROLL-${id.slice(-6)}`,
            description: `Payroll Payment: ${payroll.period}`,
            source: 'Payroll Payment',
            paymentMethod: 'Bank Transfer',
            depositorName: currentUser?.name || 'System',
            transactionType: 'Debit'
          });
        }
      }

      // Update payroll status
      setPayrollRuns(payrollRuns.map(p => 
        p.id === id ? {
          ...p,
          status: 'Paid',
          paidDate,
          bankAccountId
        } : p
      ));

      // Create consolidated journal entry for entire payroll
      const journalEntryData = createPayrollEntry(
        payroll.period,
        payroll.totalGrossPay,
        payroll.totalDeductions,
        payroll.totalNetPay,
        paidDate,
        payroll.createdBy,
        id
      );
      addJournalEntry(journalEntryData);

      // Update all employee statuses in the payroll and create expenses
      payroll.employees.forEach(emp => {
        // Create expense record for each employee
        const expenseData: Omit<Expense, 'id' | 'createdDate'> = {
          expenseDate: paidDate,
          payeeId: emp.payeeId,
          payeeName: emp.employeeName,
          category: 'Salaries & Wages',
          subcategory: 'Salaries & Wages',
          description: `Salary payment for ${payroll.period}`,
          amount: emp.netPay,
          paymentMethod: emp.paymentMethod,
          paymentReference: emp.paymentReference || `PAY-${id.slice(-6)}`,
          receiptNumber: '',
          status: 'Paid',
          paidBy: currentUser?.name || 'System',
          paidDate: paidDate,
          approvedBy: currentUser?.name || 'System',
          approvedDate: paidDate,
          createdBy: payroll.createdBy,
          bankAccountId: bankAccountId
        };
        // Don't create journal entries for individual employee expenses since we created consolidated entry
        const originalAddExpense = addExpense;
        setExpenses([...expenses, { ...expenseData, id: `EXP${Date.now()}-${Math.random()}`, createdDate: paidDate }]);

        // Update payee totalPaid
        const payee = payees.find(p => p.id === emp.payeeId);
        if (payee) {
          updatePayee(payee.id, {
            totalPaid: payee.totalPaid + emp.netPay,
            lastPaymentDate: paidDate
          });
        }
      });
    }
  };

  // ============= JOURNAL ENTRY FUNCTIONS =============

  const generateJournalEntryNumber = (): string => {
    const year = new Date().getFullYear();
    const count = journalEntries.filter(je => je.entryNumber.startsWith(`JE-${year}-`)).length + 1;
    return `JE-${year}-${String(count).padStart(4, '0')}`;
  };

  const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'>) => {
    const totalDebit = entryData.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entryData.lines.reduce((sum, line) => sum + line.credit, 0);
    
    const newEntry: JournalEntry = {
      ...entryData,
      id: `JE${Date.now()}`,
      entryNumber: generateJournalEntryNumber(),
      totalDebit,
      totalCredit,
      createdDate: new Date().toISOString().split('T')[0],
    };
    
    setJournalEntries([...journalEntries, newEntry]);
  };

  const getJournalEntry = (id: string) => {
    return journalEntries.find(je => je.id === id);
  };

  const getJournalEntriesByDate = (startDate: string, endDate: string) => {
    return journalEntries.filter(je => je.date >= startDate && je.date <= endDate && je.status === 'Posted');
  };

  const getJournalEntriesByAccount = (accountCode: string) => {
    return journalEntries.filter(je => 
      je.status === 'Posted' && je.lines.some(line => line.accountCode === accountCode)
    );
  };

  const reverseJournalEntry = (id: string, reversedBy: string, reason: string) => {
    const entry = journalEntries.find(je => je.id === id);
    if (entry && entry.status === 'Posted') {
      // Mark original as reversed
      setJournalEntries(journalEntries.map(je => 
        je.id === id ? {
          ...je,
          status: 'Reversed' as const,
          reversedBy,
          reversedDate: new Date().toISOString().split('T')[0],
          reversalReason: reason
        } : je
      ));

      // Create reversing entry with debits and credits swapped
      const reversingLines: JournalEntryLine[] = entry.lines.map(line => ({
        ...line,
        id: `LINE${Date.now()}-${Math.random()}`,
        debit: line.credit,
        credit: line.debit,
      }));

      const reversingEntry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdDate' | 'totalDebit' | 'totalCredit'> = {
        date: new Date().toISOString().split('T')[0],
        description: `REVERSAL: ${entry.description}`,
        reference: entry.entryNumber,
        sourceType: entry.sourceType,
        sourceId: entry.sourceId,
        lines: reversingLines,
        status: 'Posted',
        createdBy: reversedBy,
        postedDate: new Date().toISOString().split('T')[0],
        notes: `Reversal of ${entry.entryNumber}. Reason: ${reason}`,
      };

      addJournalEntry(reversingEntry);
    }
  };

  // ============= BANK ACCOUNT FUNCTIONS =============

  const addBankAccount = async (accountData: Omit<BankAccount, 'id' | 'balance' | 'createdDate' | 'lastUpdated'>) => {
    try {
      console.log('🏦 Creating bank account with Supabase-first approach...');
      console.log('📋 Bank account data:', accountData);
      
      // ✅ 1. WRITE TO SUPABASE FIRST - Use only columns that exist
      const supabaseBankAccount = await supabaseDataService.bankAccounts.create(
        {
          account_name: accountData.name, // ✅ Fixed: use accountData.name
          account_number: accountData.accountNumber,
          bank_name: accountData.bankName,
          branch: accountData.branch || '',
          account_type: accountData.accountType
          // NOTE: balance, currency, status NOT stored in DB (columns don't exist)
        },
        currentUser?.organizationId || ''
      );
      
      console.log('✅ Bank account created in Supabase:', supabaseBankAccount);
      
      // ✅ 2. UPDATE REACT STATE (for fast UI)
      const newAccount: BankAccount = {
        id: supabaseBankAccount.id,
        name: supabaseBankAccount.account_name, // ✅ Fixed: set as 'name' not 'accountName'
        accountNumber: supabaseBankAccount.account_number || '',
        bankName: supabaseBankAccount.bank_name || '',
        branch: supabaseBankAccount.branch || '',
        accountType: supabaseBankAccount.account_type || 'Bank',
        currency: accountData.currency || getCurrencyCode(),
        openingBalance: accountData.openingBalance || 0,
        balance: accountData.openingBalance || 0,
        openingDate: accountData.openingDate || new Date().toISOString().split('T')[0],
        status: accountData.status || 'Active',
        description: accountData.description,
        createdDate: supabaseBankAccount.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        createdBy: accountData.createdBy || 'System',
        lastUpdated: supabaseBankAccount.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      };
      
      console.log('🔄 Current bankAccounts count:', bankAccounts.length);
      setBankAccounts([...bankAccounts, newAccount]);
      console.log('✅ Bank account added to React state. New count will be:', bankAccounts.length + 1);
      console.log('⏰ Debounced sync will trigger in 1 second...');
      
      toast.success('Bank account created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating bank account:', error);
      toast.error('Database not reachable. Check your internet connection.');
    }
  };

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    if (!currentUser?.organizationId) {
      toast.error('No organization found');
      return;
    }

    const updatedAccount = {
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Update local state immediately
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === id ? { ...acc, ...updatedAccount } : acc
    ));

    // Save to Supabase
    try {
      console.log('💾 Updating bank account in Supabase:', { id, updates: updatedAccount });
      await supabaseDataService.bankAccounts.update(id, updatedAccount, currentUser.organizationId);
      console.log('✅ Bank account updated in Supabase');
    } catch (error) {
      console.error('❌ Error updating bank account in Supabase:', error);
      toast.error('Failed to update bank account in database');
      // Revert local state
      setBankAccounts(bankAccounts);
    }
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
  };

  const getBankAccount = (id: string) => {
    return bankAccounts.find(acc => acc.id === id);
  };

  // ============= FUNDING TRANSACTION FUNCTIONS =============

  const addFundingTransaction = async (transactionData: Omit<FundingTransaction, 'id'>) => {
    if (!currentUser?.organizationId || !currentUser?.id) {
      toast.error('No organization found');
      return;
    }

    const newTransaction: FundingTransaction = {
      ...transactionData,
      id: `FT${Date.now()}`,
    };
    
    // Update local state immediately
    setFundingTransactions([...fundingTransactions, newTransaction]);

    // Save to Supabase
    try {
      console.log('💾 Saving funding transaction to Supabase:', newTransaction);
      const savedTransaction = await supabaseDataService.fundingTransactions.create(
        transactionData,
        currentUser.organizationId,
        currentUser.id
      );
      console.log('✅ Funding transaction saved to Supabase:', savedTransaction);
      
      // Update local state with Supabase ID
      setFundingTransactions(prev => 
        prev.map(t => t.id === newTransaction.id 
          ? { ...t, id: savedTransaction.id } 
          : t
        )
      );
    } catch (error) {
      console.error('❌ Error saving funding transaction to Supabase:', error);
      toast.error('Database not reachable. Check your internet connection.');
      // Revert local state
      setFundingTransactions(fundingTransactions);
    }
  };

  const getFundingTransactions = (bankAccountId?: string) => {
    if (bankAccountId) {
      return fundingTransactions.filter(t => t.bankAccountId === bankAccountId);
    }
    return fundingTransactions;
  };

  // ============= TASK FUNCTIONS =============

  const addTask = (taskData: Omit<Task, 'id' | 'createdDate'>) => {
    const newTask: Task = {
      ...taskData,
      id: `TSK${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getTask = (id: string) => {
    return tasks.find(t => t.id === id);
  };

  // ============= KYC RECORD FUNCTIONS =============

  const addKYCRecord = (recordData: Omit<KYCRecord, 'id'>) => {
    const newRecord: KYCRecord = {
      ...recordData,
      id: `KYC${Date.now()}`,
    };
    setKYCRecords([...kycRecords, newRecord]);
  };

  const updateKYCRecord = (id: string, updates: Partial<KYCRecord>) => {
    setKYCRecords(kycRecords.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteKYCRecord = (id: string) => {
    setKYCRecords(kycRecords.filter(r => r.id !== id));
  };

  const getClientKYCRecord = (clientId: string) => {
    return kycRecords.find(r => r.clientId === clientId);
  };

  // ============= AUDIT LOG FUNCTIONS =============

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `AUD${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0],
    };
    setAuditLogs([...auditLogs, newLog]);
  };

  // ============= SUPPORT TICKET FUNCTIONS =============

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdDate' | 'updatedDate'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `TCK${Date.now()}`,
      ticketNumber: `TCK-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
    };
    setTickets([...tickets, newTicket]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTicket = (id: string) => {
    setTickets(tickets.filter(t => t.id !== id));
  };

  const getTicket = (id: string) => {
    return tickets.find(t => t.id === id);
  };

  // ============= GROUP FUNCTIONS =============

  const addGroup = (groupData: Omit<Group, 'id'>) => {
    const newGroup: Group = {
      ...groupData,
      id: `GRP${Date.now()}`,
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const getGroup = (id: string) => {
    return groups.find(g => g.id === id);
  };

  // ============= APPROVAL FUNCTIONS =============

  const addApproval = (approvalData: Omit<Approval, 'id'>) => {
    const newApproval: Approval = {
      ...approvalData,
      id: `APR${Date.now()}`,
    };
    setApprovals([...approvals, newApproval]);
  };

  const updateApproval = async (id: string, updates: Partial<Approval>) => {
    try {
      // ✅ Find the approval with Supabase UUID
      const approval = approvals.find(a => a.id === id);
      
      if (approval && approval.supabaseId) {
        // If we have a Supabase UUID, update in Supabase
        await supabaseDataService.approvals.update(
          approval.supabaseId,
          updates,
          currentUser?.organizationId || ''
        );
        console.log('✅ Approval updated in Supabase');
      }
    } catch (error: any) {
      console.error('❌ Error updating approval in Supabase:', error);
      // Don't fail the update if Supabase fails
    }
    
    // ✅ Update React state
    setApprovals(approvals.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteApproval = (id: string) => {
    setApprovals(approvals.filter(a => a.id !== id));
  };

  const getApproval = (id: string) => {
    return approvals.find(a => a.id === id);
  };

  const approveApproval = async (id: string, approver: string, disbursementData?: { releaseDate: string; disbursementMethod: string; sourceOfFunds: string; accountNumber: string; notes?: string }) => {
    const approval = approvals.find(a => a.id === id);
    
    // For phase 1, 2, 3 advance to next phase and keep as pending
    // For phase 4 (disbursement), advance to phase 5 and mark as approved (Active Loan)
    // For phase 5, keep as is (already active)
    const currentPhase = approval?.phase || 1;
    const nextPhase = currentPhase < 5 ? (currentPhase + 1) as (1 | 2 | 3 | 4 | 5) : 5;
    const newStatus = currentPhase < 4 ? 'pending' : 'approved';
    
    // ✅ Update approval in Supabase if we have a UUID
    if (approval && approval.supabaseId) {
      try {
        await supabaseDataService.approvals.update(
          approval.supabaseId,
          {
            status: newStatus,
            approver: currentPhase >= 2 ? approver : undefined,
            approvalDate: currentPhase >= 2 ? new Date().toISOString().split('T')[0] : undefined,
            phase: nextPhase,
            disbursementData: currentPhase === 3 && disbursementData ? disbursementData : approval.disbursementData
          },
          currentUser?.organizationId || ''
        );
        console.log('✅ Approval advanced in Supabase');
      } catch (error: any) {
        console.error('❌ Error updating approval in Supabase:', error);
      }
    }
    
    // ✅ Update React state
    setApprovals(approvals.map(a => 
      a.id === id ? {
        ...a,
        status: newStatus,
        approver: currentPhase >= 2 ? approver : undefined,
        approvalDate: currentPhase >= 2 ? new Date().toISOString().split('T')[0] : undefined,
        phase: nextPhase,
        // Save disbursement data when advancing from Phase 3 to Phase 4
        disbursementData: currentPhase === 3 && disbursementData ? disbursementData : a.disbursementData
      } : a
    ));
    
    // If this is a loan application approval at phase 2, update the loan status to Approved (Pending Disbursement)
    if (approval && approval.type === 'loan_application' && approval.relatedId && currentPhase === 2) {
      const loan = loans.find(l => l.id === approval.relatedId);
      if (loan) {
        setLoans(loans.map(l => 
          l.id === approval.relatedId ? {
            ...l,
            status: 'Approved',
            approvedBy: approver,
            approvedDate: new Date().toISOString().split('T')[0]
          } : l
        ));
      }
    }
    
    // If this is a loan being disbursed (phase 4 -> 5), update the loan status to Active
    // AND reduce the bank account balance and create funding transaction
    if (approval && approval.type === 'loan_application' && approval.relatedId && currentPhase === 4) {
      const loan = loans.find(l => l.id === approval.relatedId);
      if (loan) {
        // Calculate processing fee FIRST
        const loanProduct = loanProducts.find(p => p.id === loan.productId);
        let processingFeeAmount = 0;
        
        if (loanProduct && loanProduct.processingFee > 0) {
          processingFeeAmount = loanProduct.processingFeeType === 'Percentage'
            ? (loan.principalAmount * loanProduct.processingFee) / 100
            : loanProduct.processingFee;
        }
        
        // Calculate net disbursement amount (principal - processing fee)
        // Client receives: Principal - Processing Fee
        // Client repays: Full Principal Amount
        const netDisbursementAmount = loan.principalAmount - processingFeeAmount;
        
        console.log('💰 Loan Disbursement:', {
          loanId: loan.id,
          principalAmount: loan.principalAmount,
          processingFee: processingFeeAmount,
          netDisbursement: netDisbursementAmount,
          note: `Client receives ${netDisbursementAmount.toLocaleString()} but repays ${loan.principalAmount.toLocaleString()}`
        });
        
        setLoans(loans.map(l => 
          l.id === approval.relatedId ? {
            ...l,
            status: 'Active',
            disbursedBy: approver,
            disbursedDate: new Date().toISOString().split('T')[0]
          } : l
        ));
        
        // Reduce bank account balance when loan is actually disbursed (Phase 4 -> 5)
        // Use the disbursement data saved in Phase 3
        const savedDisbursementData = approval.disbursementData;
        if (savedDisbursementData && savedDisbursementData.sourceOfFunds && approval.amount) {
          const accountToDebit = bankAccounts.find(acc => acc.name === savedDisbursementData.sourceOfFunds);
          if (accountToDebit) {
            // Deduct only the NET amount (after deducting processing fee) from bank account
            // The processing fee stays as revenue - never leaves the bank
            setBankAccounts(bankAccounts.map(acc =>
              acc.name === savedDisbursementData.sourceOfFunds
                ? { ...acc, balance: acc.balance - netDisbursementAmount }
                : acc
            ));
            
            // Create a debit funding transaction for the NET disbursement amount
            addFundingTransaction({
              bankAccountId: accountToDebit.id,
              amount: netDisbursementAmount,
              date: savedDisbursementData.releaseDate || new Date().toISOString().split('T')[0],
              reference: `LOAN-DISB-${approval.relatedId.split('-')[0]}`, // ✅ Shorten UUID to first segment
              description: `Loan Disbursement - ${approval.clientName} (Net: ${netDisbursementAmount.toLocaleString()}, Processing Fee: ${processingFeeAmount.toLocaleString()} retained as revenue)`,
              source: 'Loan Disbursement',
              paymentMethod: savedDisbursementData.disbursementMethod as 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque',
              depositorName: approver,
              transactionType: 'Debit',
              relatedLoanId: approval.relatedId
            });
          }
        }
        
        // Create processing fee record when loan is disbursed
        if (loanProduct && loanProduct.processingFee > 0) {
          // Create the processing fee record
          const newProcessingFeeRecord: ProcessingFeeRecord = {
            id: `PFR${Date.now()}`,
            loanId: loan.id,
            clientId: loan.clientId,
            clientName: loan.clientName,
            amount: processingFeeAmount,
            percentage: loanProduct.processingFeeType === 'Percentage' ? loanProduct.processingFee : 0,
            loanAmount: loan.principalAmount,
            recordedDate: new Date().toISOString().split('T')[0],
            recordedBy: approver,
            status: 'Collected',
            paymentMethod: savedDisbursementData?.disbursementMethod || 'Bank Transfer'
          };
          
          setProcessingFeeRecords([...processingFeeRecords, newProcessingFeeRecord]);
        }
      }
    }
  };

  const rejectApproval = async (id: string, rejectionReason: string) => {
    const approval = approvals.find(a => a.id === id);
    
    // ✅ Update approval in Supabase if we have a UUID
    if (approval && approval.supabaseId) {
      try {
        await supabaseDataService.approvals.update(
          approval.supabaseId,
          {
            status: 'rejected',
            rejectionReason,
            approvalDate: new Date().toISOString().split('T')[0]
          },
          currentUser?.organizationId || ''
        );
        console.log('✅ Approval rejected in Supabase');
      } catch (error: any) {
        console.error('❌ Error rejecting approval in Supabase:', error);
      }
    }
    
    // ✅ Update React state
    setApprovals(approvals.map(a => 
      a.id === id ? {
        ...a,
        status: 'rejected',
        rejectionReason,
        approvalDate: new Date().toISOString().split('T')[0]
      } : a
    ));
  };

  const seedSampleApprovals = () => {
    const sampleApprovals: Approval[] = [
      {
        id: 'APR-PHASE1-001',
        type: 'loan_application',
        title: `Loan Application - Sarah Mwangi`,
        description: `Business loan application for KES 50,000 over 12 months`,
        requestedBy: 'Victor Muthama',
        requestDate: '2024-12-20 10:30',
        amount: 50000,
        clientId: 'CLI-001',
        clientName: 'Sarah Mwangi',
        status: 'pending',
        priority: 'high',
        relatedId: 'LOAN-NEW-001',
        phase: 1
      },
      {
        id: 'APR-PHASE2-001',
        type: 'loan_application',
        title: `Loan Application - James Omondi`,
        description: `Agricultural loan application for KES 100,000 over 18 months`,
        requestedBy: 'Victor Muthama',
        requestDate: '2024-12-19 14:20',
        amount: 100000,
        clientId: 'CLI-002',
        clientName: 'James Omondi',
        status: 'pending',
        priority: 'medium',
        relatedId: 'LOAN-NEW-002',
        phase: 2
      },
      {
        id: 'APR-PHASE3-001',
        type: 'loan_application',
        title: `Loan Application - Grace Njeri`,
        description: `Personal loan application for KES 75,000 over 9 months`,
        requestedBy: 'Ben Mbuvi',
        requestDate: '2024-12-18 09:15',
        amount: 75000,
        clientId: 'CLI-003',
        clientName: 'Grace Njeri',
        status: 'pending',
        priority: 'urgent',
        relatedId: 'LOAN-NEW-003',
        phase: 3
      },
      {
        id: 'APR-PHASE4-001',
        type: 'disbursement',
        title: `Disbursement - Peter Kamau`,
        description: `Loan disbursement for Peter Kamau - KES 60,000`,
        requestedBy: 'Management Team',
        requestDate: '2024-12-17 16:45',
        amount: 60000,
        clientId: 'CLI-004',
        clientName: 'Peter Kamau',
        status: 'pending',
        priority: 'high',
        relatedId: 'LOAN-001',
        phase: 4
      }
    ];
    
    setApprovals(sampleApprovals);
    
    // Also create corresponding pending loan records for Phase 1 approvals
    const samplePendingLoans: Loan[] = [];
    
    // Get first 4 clients for the pending loans
    const sampleClients = clients.slice(0, 4);
    const businessProduct = loanProducts.find(p => p.name.includes('Business'));
    const personalProduct = loanProducts.find(p => p.name.includes('Personal'));
    
    if (sampleClients.length >= 4 && businessProduct && personalProduct) {
      // Loan 1: Sarah Mwangi - Phase 1 (Pending)
      const loan1Client = sampleClients[0];
      samplePendingLoans.push({
        id: 'LOAN-NEW-001',
        clientId: loan1Client.id,
        clientName: loan1Client.name,
        productId: businessProduct.id,
        productName: businessProduct.name,
        principalAmount: 50000,
        interestRate: businessProduct.interestRate,
        interestType: businessProduct.interestType,
        term: 12,
        termUnit: 'Months',
        repaymentFrequency: 'Monthly',
        disbursementDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        firstRepaymentDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pending',
        totalInterest: 50000 * (businessProduct.interestRate / 100),
        totalRepayable: 50000 + (50000 * (businessProduct.interestRate / 100)),
        installmentAmount: (50000 + (50000 * (businessProduct.interestRate / 100))) / 12,
        numberOfInstallments: 12,
        paidAmount: 0,
        outstandingBalance: 50000 + (50000 * (businessProduct.interestRate / 100)),
        principalOutstanding: 50000,
        interestOutstanding: 50000 * (businessProduct.interestRate / 100),
        daysInArrears: 0,
        arrearsAmount: 0,
        penaltyAmount: 0,
        purpose: 'Business Expansion',
        applicationDate: '2024-12-20',
        createdBy: 'Victor Muthama',
        loanOfficer: 'Victor Muthama'
      });
      
      // Loan 2: James Omondi - Phase 2 (Pending)
      const loan2Client = sampleClients[1];
      samplePendingLoans.push({
        id: 'LOAN-NEW-002',
        clientId: loan2Client.id,
        clientName: loan2Client.name,
        productId: businessProduct.id,
        productName: businessProduct.name,
        principalAmount: 100000,
        interestRate: businessProduct.interestRate,
        interestType: businessProduct.interestType,
        term: 18,
        termUnit: 'Months',
        repaymentFrequency: 'Monthly',
        disbursementDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        firstRepaymentDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + 548 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pending',
        totalInterest: 100000 * (businessProduct.interestRate / 100),
        totalRepayable: 100000 + (100000 * (businessProduct.interestRate / 100)),
        installmentAmount: (100000 + (100000 * (businessProduct.interestRate / 100))) / 18,
        numberOfInstallments: 18,
        paidAmount: 0,
        outstandingBalance: 100000 + (100000 * (businessProduct.interestRate / 100)),
        principalOutstanding: 100000,
        interestOutstanding: 100000 * (businessProduct.interestRate / 100),
        daysInArrears: 0,
        arrearsAmount: 0,
        penaltyAmount: 0,
        purpose: 'Agricultural Investment',
        applicationDate: '2024-12-19',
        createdBy: 'Victor Muthama',
        loanOfficer: 'Victor Muthama'
      });
      
      // Loan 3: Grace Njeri - Phase 3 (Approved - ready for disbursement)
      const loan3Client = sampleClients[2];
      samplePendingLoans.push({
        id: 'LOAN-NEW-003',
        clientId: loan3Client.id,
        clientName: loan3Client.name,
        productId: personalProduct.id,
        productName: personalProduct.name,
        principalAmount: 75000,
        interestRate: personalProduct.interestRate,
        interestType: personalProduct.interestType,
        term: 9,
        termUnit: 'Months',
        repaymentFrequency: 'Monthly',
        disbursementDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        firstRepaymentDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Approved',
        approvedBy: 'Manager',
        approvedDate: '2024-12-19',
        totalInterest: 75000 * (personalProduct.interestRate / 100),
        totalRepayable: 75000 + (75000 * (personalProduct.interestRate / 100)),
        installmentAmount: (75000 + (75000 * (personalProduct.interestRate / 100))) / 9,
        numberOfInstallments: 9,
        paidAmount: 0,
        outstandingBalance: 75000 + (75000 * (personalProduct.interestRate / 100)),
        principalOutstanding: 75000,
        interestOutstanding: 75000 * (personalProduct.interestRate / 100),
        daysInArrears: 0,
        arrearsAmount: 0,
        penaltyAmount: 0,
        purpose: 'Personal Use',
        applicationDate: '2024-12-18',
        createdBy: 'Ben Mbuvi',
        loanOfficer: 'Ben Mbuvi'
      });
      
      // Loan 4: Peter Kamau - Phase 4 (Approved - ready for disbursement)
      const loan4Client = sampleClients[3];
      samplePendingLoans.push({
        id: 'LOAN-NEW-004',
        clientId: loan4Client.id,
        clientName: loan4Client.name,
        productId: personalProduct.id,
        productName: personalProduct.name,
        principalAmount: 60000,
        interestRate: personalProduct.interestRate,
        interestType: personalProduct.interestType,
        term: 6,
        termUnit: 'Months',
        repaymentFrequency: 'Monthly',
        disbursementDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        firstRepaymentDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + 183 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Approved',
        approvedBy: 'Manager',
        approvedDate: '2024-12-18',
        totalInterest: 60000 * (personalProduct.interestRate / 100),
        totalRepayable: 60000 + (60000 * (personalProduct.interestRate / 100)),
        installmentAmount: (60000 + (60000 * (personalProduct.interestRate / 100))) / 6,
        numberOfInstallments: 6,
        paidAmount: 0,
        outstandingBalance: 60000 + (60000 * (personalProduct.interestRate / 100)),
        principalOutstanding: 60000,
        interestOutstanding: 60000 * (personalProduct.interestRate / 100),
        daysInArrears: 0,
        arrearsAmount: 0,
        penaltyAmount: 0,
        purpose: 'Home Improvement',
        applicationDate: '2024-12-17',
        createdBy: 'Management Team',
        loanOfficer: 'Management Team'
      });
      
      // Add the sample pending loans to the loans array
      setLoans(prevLoans => [...prevLoans, ...samplePendingLoans]);
    }
  };

  // Sync loans with approvals - ensure all pending loans have approval records
  const syncLoansWithApprovals = () => {
    const newApprovals: Approval[] = [];
    
    // Find all loans that need approvals
    loans.forEach(loan => {
      // Only process Pending loans
      if (loan.status !== 'Pending') return;
      
      // Check if an approval already exists for this loan
      const hasApproval = approvals.some(approval => approval.relatedId === loan.id);
      
      if (!hasApproval) {
        // Determine priority based on loan amount
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
        if (loan.principalAmount > 500000) {
          priority = 'urgent';
        } else if (loan.principalAmount > 200000) {
          priority = 'high';
        } else if (loan.principalAmount < 50000) {
          priority = 'low';
        }
        
        // Generate approval ID
        const approvalMaxId = [...approvals, ...newApprovals].reduce((max, approval) => {
          const match = approval.id.match(/^APR(\d+)$/);
          return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);
        const approvalId = `APR${String(approvalMaxId + 1).padStart(3, '0')}`;
        
        // Create approval for this loan
        const newApproval: Approval = {
          id: approvalId,
          type: 'loan_application',
          title: `Loan Application - ${loan.clientName || 'Unknown Client'}`,
          description: `${loan.productName || 'Loan'} loan application for KES ${(loan.principalAmount || 0).toLocaleString()} over ${loan.term || 0} ${(loan.termUnit || 'months').toLowerCase()}`,
          requestedBy: loan.createdBy,
          requestDate: loan.applicationDate + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          amount: loan.principalAmount,
          clientId: loan.clientId,
          clientName: loan.clientName,
          status: 'pending',
          priority: priority,
          relatedId: loan.id,
          phase: 1 // Application Review phase
        };
        
        newApprovals.push(newApproval);
      }
    });
    
    // Add new approvals if any were created
    if (newApprovals.length > 0) {
      setApprovals([...approvals, ...newApprovals]);
      console.log(`✅ Synced ${newApprovals.length} loan(s) with approval records`);
    }
  };

  // ============= DISBURSEMENT FUNCTIONS =============

  const addDisbursement = (disbursementData: Omit<Disbursement, 'id' | 'createdDate'>) => {
    const newDisbursement: Disbursement = {
      ...disbursementData,
      id: `DIS${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setDisbursements([...disbursements, newDisbursement]);
  };

  const updateDisbursement = (id: string, updates: Partial<Disbursement>) => {
    setDisbursements(disbursements.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDisbursement = (id: string) => {
    setDisbursements(disbursements.filter(d => d.id !== id));
  };

  const getDisbursement = (id: string) => {
    return disbursements.find(d => d.id === id);
  };

  const getLoanDisbursements = (loanId: string) => {
    return disbursements.filter(d => d.loanId === loanId);
  };

  // ============= PROCESSING FEE RECORD FUNCTIONS =============

  const addProcessingFeeRecord = (recordData: Omit<ProcessingFeeRecord, 'id' | 'recordedDate'>) => {
    const newRecord: ProcessingFeeRecord = {
      ...recordData,
      id: `PFR${Date.now()}`,
      recordedDate: new Date().toISOString().split('T')[0],
    };
    setProcessingFeeRecords([...processingFeeRecords, newRecord]);
  };

  const updateProcessingFeeRecord = (id: string, updates: Partial<ProcessingFeeRecord>) => {
    setProcessingFeeRecords(processingFeeRecords.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteProcessingFeeRecord = (id: string) => {
    setProcessingFeeRecords(processingFeeRecords.filter(r => r.id !== id));
  };

  const getProcessingFeeRecord = (id: string) => {
    return processingFeeRecords.find(r => r.id === id);
  };

  const getLoanProcessingFeeRecords = (loanId: string) => {
    return processingFeeRecords.filter(r => r.loanId === loanId);
  };

  // ============= CONTEXT VALUE =============

  const value: DataContextType = {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    
    loans,
    addLoan,
    updateLoan,
    deleteLoan,
    getLoan,
    settleLoanEarly,
    restructureLoan,
    getClientLoans,
    approveLoan,
    disburseLoan,
    
    repayments,
    addRepayment,
    updateRepayment,
    deleteRepayment,
    getLoanRepayments,
    approveRepayment,
    
    // Alias for backward compatibility
    payments: repayments,
    
    savingsAccounts,
    addSavingsAccount,
    updateSavingsAccount,
    deleteSavingsAccount,
    getSavingsAccount,
    getClientSavingsAccounts,
    
    savingsTransactions,
    addSavingsTransaction,
    updateSavingsTransaction,
    deleteSavingsTransaction,
    getAccountTransactions,
    approveSavingsTransaction,
    
    loanProducts,
    addLoanProduct,
    updateLoanProduct,
    deleteLoanProduct,
    getLoanProduct,
    
    shareholders,
    addShareholder,
    updateShareholder,
    deleteShareholder,
    getShareholder,
    refreshShareholders,
    
    shareholderTransactions,
    addShareholderTransaction,
    updateShareholderTransaction,
    deleteShareholderTransaction,
    getShareholderTransactions,
    
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    approveExpense,
    payExpense,
    
    payees,
    addPayee,
    updatePayee,
    deletePayee,
    getPayee,
    
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    getBankAccount,
    
    fundingTransactions,
    addFundingTransaction,
    getFundingTransactions,
    
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    
    kycRecords,
    addKYCRecord,
    updateKYCRecord,
    deleteKYCRecord,
    getClientKYCRecord,
    
    auditLogs,
    addAuditLog,
    
    tickets,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicket,
    
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroup,
    
    approvals,
    addApproval,
    updateApproval,
    deleteApproval,
    getApproval,
    approveApproval,
    rejectApproval,
    seedSampleApprovals,
    syncLoansWithApprovals,
    
    disbursements,
    addDisbursement,
    updateDisbursement,
    deleteDisbursement,
    getDisbursement,
    getLoanDisbursements,
    
    guarantors,
    addGuarantor,
    updateGuarantor,
    deleteGuarantor,
    getLoanGuarantors,
    
    collaterals,
    addCollateral,
    updateCollateral,
    deleteCollateral,
    getLoanCollaterals,
    
    loanDocuments,
    addLoanDocument,
    deleteLoanDocument,
    getLoanDocuments,
    
    processingFeeRecords,
    addProcessingFeeRecord,
    updateProcessingFeeRecord,
    deleteProcessingFeeRecord,
    getProcessingFeeRecord,
    getLoanProcessingFeeRecords,
    
    payrollRuns,
    addPayrollRun,
    updatePayrollRun,
    deletePayrollRun,
    getPayrollRun,
    processPayroll,
    
    journalEntries,
    addJournalEntry,
    getJournalEntry,
    getJournalEntriesByDate,
    getJournalEntriesByAccount,
    reverseJournalEntry,
    
    calculateClientCreditScore,
    updateAllClientCreditScores,
    
    generateReceiptNumber,
    generateAccountNumber,
    refreshData,
    clearAllData,
    clearShareholdersAndBanks,
    syncAllToSupabase,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ============= CUSTOM HOOK =============

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}