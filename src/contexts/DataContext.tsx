import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
import { initializeAutoBackup } from '../utils/dataBackup';
// ✅ NEW: Use Single-Object Sync Pattern (replacing individual entity sync)
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

export interface Loan {
  id: string;
  clientId: string;
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
  status: 'Pending' | 'Approved' | 'Disbursed' | 'Active' | 'Fully Paid' | 'Closed' | 'Written Off' | 'Rejected';
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
  deleteLoan: (id: string) => void;
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
  deleteLoanProduct: (id: string) => void;
  getLoanProduct: (id: string) => LoanProduct | undefined;
  
  // Shareholders
  shareholders: Shareholder[];
  addShareholder: (shareholder: Omit<Shareholder, 'id' | 'totalDividends'>) => void;
  updateShareholder: (id: string, updates: Partial<Shareholder>) => void;
  deleteShareholder: (id: string) => void;
  getShareholder: (id: string) => Shareholder | undefined;
  
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
        
        await saveProjectState(currentUser.organizationId, projectState);
      } catch (error) {
        console.error('❌ Error syncing to Supabase:', error);
      } finally {
        isSyncingRef.current = false;
      }
    }, 1000); // Wait 1 second after last change
  }, [
    currentUser?.organizationId,
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
  
  // Load data from Supabase when user is ready (PRIMARY DATA SOURCE - Single-Object Sync)
  useEffect(() => {
    // Only load data if we have a logged-in user with an organization ID
    if (!currentUser?.organizationId) {
      console.log('⏳ Waiting for user authentication...');
      return;
    }
    
    const loadData = async () => {
      try {
        console.log('🔄 Loading entire project state from Supabase...');
        
        // ✅ Load entire state in ONE API call
        const projectState = await loadProjectState(currentUser.organizationId);
        
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
          
          // ✅ Set ALL state from the single project state object
          setClients(finalClients);
          setLoans(finalLoans);
          setLoanProducts(projectState.loanProducts || []);
          setRepayments(projectState.repayments || []);
          setSavingsAccounts(projectState.savingsAccounts || []);
          setSavingsTransactions(projectState.savingsTransactions || []);
          setShareholders(projectState.shareholders || []);
          setShareholderTransactions(projectState.shareholderTransactions || []);
          setExpenses(projectState.expenses || []);
          setPayees(projectState.payees || []);
          setBankAccounts(projectState.bankAccounts || []);
          setTasks(projectState.tasks || []);
          setKYCRecords(projectState.kycRecords || []);
          setApprovals(projectState.approvals || []);
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
          
          console.log('✅ All data loaded from Single-Object Sync successfully');
          toast.success('Data loaded from cloud database');
        } else {
          // Load failed - start with empty data
          console.warn('⚠️ Could not load project state - starting fresh');
          toast.info('Starting with fresh data');
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // If there's an error, start with empty data
        setClients([]);
        setLoanProducts([]);
        setShareholders([]);
        setPayees([]);
        toast.error('Error loading data. Please refresh the page.');
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
    // Generate 5-character ID: CL + 3-digit number (max 5 alphanumeric characters)
    const maxId = clients.reduce((max, client) => {
      const match = client.id.match(/^CL(\d{3})$/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const newId = `CL${String(maxId + 1).padStart(3, '0')}`;
    
    const newClient: Client = {
      ...clientData,
      id: newId,
      joinDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    
    // ✅ Update local state (debounced sync will handle Supabase automatically)
    setClients([...clients, newClient]);
    
    // Add audit log
    addAuditLog({
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
      action: 'Create Client',
      module: 'Client',
      entityType: 'Client',
      entityId: newId,
      changes: `New client "${newClient.name}" created`,
      ipAddress: '0.0.0.0',
      status: 'Success'
    });
    
    toast.success('Client created successfully');
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const client = clients.find(c => c.id === id);
    
    // ✅ Update local state (debounced sync handles Supabase)
    setClients(clients.map(c => 
      c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : c
    ));
    
    // Add audit log
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
    // ✅ No manual sync needed - debounced sync handles it
  };

  const deleteClient = (id: string) => {
    // ✅ Update local state (debounced sync handles Supabase)
    setClients(clients.filter(c => c.id !== id));
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id);
  };

  // ============= LOAN FUNCTIONS =============

  const addLoan = async (loanData: Omit<Loan, 'id' | 'applicationDate'>) => {
    // Generate unique ID with timestamp to prevent collisions
    const maxId = loans.reduce((max, loan) => {
      const match = loan.id.match(/^L(\d{3})/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits for uniqueness
    const newId = `L${String(maxId + 1).padStart(3, '0')}-${timestamp}`;
    
    const newLoan: Loan = {
      ...loanData,
      id: newId,
      applicationDate: new Date().toISOString().split('T')[0],
    };
    setLoans([...loans, newLoan]);
    
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
    
    setApprovals([...approvals, newApproval]);
    
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
    
    // Return the generated loan ID
    return newId;
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    // Find the full loan object and merge updates
    const updatedLoan = loans.find(l => l.id === id);
    if (!updatedLoan) {
      console.error(`Cannot update loan: loan with id ${id} not found`);
      return;
    }
    
    const fullUpdatedLoan = { ...updatedLoan, ...updates };
    
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
          reference: `Loan Disbursement - ${id}`,
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
    // ✅ Debounced sync handles Supabase automatically
  };

  const deleteLoan = (id: string) => {
    setLoans(loans.filter(l => l.id !== id));
    // ✅ Debounced sync handles Supabase automatically
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

  const addRepayment = (repaymentData: Omit<Repayment, 'id' | 'createdDate'>) => {
    const newRepayment: Repayment = {
      ...repaymentData,
      id: `RPY${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setRepayments([...repayments, newRepayment]);

    // Update loan balance and bank account
    const loan = loans.find(l => l.id === repaymentData.loanId);
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
    const newProduct: LoanProduct = {
      ...productData,
      id: `PRD${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    
    // ✅ Update local state (debounced sync handles Supabase)
    setLoanProducts([...loanProducts, newProduct]);
    toast.success('Loan product created successfully');
  };

  const updateLoanProduct = (id: string, updates: Partial<LoanProduct>) => {
    // ✅ Update local state (debounced sync handles Supabase)
    setLoanProducts(loanProducts.map(p => 
      p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : p
    ));
  };

  const deleteLoanProduct = (id: string) => {
    setLoanProducts(loanProducts.filter(p => p.id !== id));
  };

  const getLoanProduct = (id: string) => {
    return loanProducts.find(p => p.id === id);
  };

  // ============= SHAREHOLDER FUNCTIONS =============

  const addShareholder = (shareholderData: Omit<Shareholder, 'id' | 'totalDividends'>) => {
    const newShareholder: Shareholder = {
      ...shareholderData,
      id: `SH${Date.now()}`,
      totalDividends: 0,
    };
    setShareholders([...shareholders, newShareholder]);
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

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdDate'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `EXP${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
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

  const addPayee = (payeeData: Omit<Payee, 'id' | 'totalPaid' | 'createdDate'>) => {
    const newPayee: Payee = {
      ...payeeData,
      id: `PYE${Date.now()}`,
      totalPaid: 0,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setPayees([...payees, newPayee]);
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

  const addPayrollRun = (payrollData: Omit<PayrollRun, 'id' | 'createdDate'>) => {
    const newPayroll: PayrollRun = {
      ...payrollData,
      id: `PAY${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setPayrollRuns([...payrollRuns, newPayroll]);
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
            depositorName: JSON.parse(localStorage.getItem('current_user') || '{}').name || 'System',
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
          paidBy: JSON.parse(localStorage.getItem('current_user') || '{}').name || 'System',
          paidDate: paidDate,
          approvedBy: JSON.parse(localStorage.getItem('current_user') || '{}').name || 'System',
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

  const addBankAccount = (accountData: Omit<BankAccount, 'id' | 'balance' | 'createdDate' | 'lastUpdated'>) => {
    const newAccount: BankAccount = {
      ...accountData,
      id: `BANK${Date.now()}`,
      balance: accountData.openingBalance,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setBankAccounts([...bankAccounts, newAccount]);
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    const updatedAccount = {
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === id ? { ...acc, ...updatedAccount } : acc
    ));
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
  };

  const getBankAccount = (id: string) => {
    return bankAccounts.find(acc => acc.id === id);
  };

  // ============= FUNDING TRANSACTION FUNCTIONS =============

  const addFundingTransaction = (transactionData: Omit<FundingTransaction, 'id'>) => {
    const newTransaction: FundingTransaction = {
      ...transactionData,
      id: `FT${Date.now()}`,
    };
    setFundingTransactions([...fundingTransactions, newTransaction]);
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

  const updateApproval = (id: string, updates: Partial<Approval>) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteApproval = (id: string) => {
    setApprovals(approvals.filter(a => a.id !== id));
  };

  const getApproval = (id: string) => {
    return approvals.find(a => a.id === id);
  };

  const approveApproval = (id: string, approver: string, disbursementData?: { releaseDate: string; disbursementMethod: string; sourceOfFunds: string; accountNumber: string; notes?: string }) => {
    const approval = approvals.find(a => a.id === id);
    
    // For phase 1, 2, 3 advance to next phase and keep as pending
    // For phase 4 (disbursement), advance to phase 5 and mark as approved (Active Loan)
    // For phase 5, keep as is (already active)
    const currentPhase = approval?.phase || 1;
    const nextPhase = currentPhase < 5 ? (currentPhase + 1) as (1 | 2 | 3 | 4 | 5) : 5;
    const newStatus = currentPhase < 4 ? 'pending' : 'approved';
    
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
              reference: `LOAN-DISB-${approval.relatedId}`,
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

  const rejectApproval = (id: string, rejectionReason: string) => {
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