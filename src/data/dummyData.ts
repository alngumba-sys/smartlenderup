// Dummy Data for BV FUNGUO LTD Microfinance Platform

export interface Client {
  id: string;
  accountNumber: string;
  name: string;
  nationalId: string;
  phone: string;
  businessType: string;
  status: 'Current' | 'In Arrears' | 'Fully Paid';
  creditScore: number;
  gpsLocation: { lat: number; lng: number };
  groupAffiliation?: string;
  joinDate: string;
  totalPaid: number;
  openLoanBalance: number;
  predictedDefaultDate?: string;
  photo?: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  maxAmount: number;
  interestRate: number;
  interestType: 'Flat' | 'Declining';
  repaymentFrequency: 'Monthly' | 'Quarterly';
  tenorMonths: number;
}

export interface Loan {
  id: string;
  clientId: string;
  productId: string;
  principalAmount: number;
  disbursementDate: string;
  maturityDate: string;
  status: 'Active' | 'In Arrears' | 'Fully Paid' | 'Written Off';
  daysInArrears: number;
  outstandingBalance: number;
  loanOfficer: string;
  numberOfInstallments?: number;
  term?: number;
  installmentAmount?: number;
  totalRepayable?: number;
  firstRepaymentDate?: string;
  repaymentFrequency?: 'Monthly' | 'Weekly' | 'Bi-Weekly' | 'Daily' | 'Quarterly';
}

export interface Payment {
  id: string;
  loanId: string;
  clientId: string;
  date: string;
  amount: number;
  method: 'M-Pesa' | 'Bank Transfer' | 'Cash';
  transactionId: string;
  installmentNumber: number;
}

export interface Installment {
  loanId: string;
  installmentNo: number;
  dueDate: string;
  plannedAmount: number;
  principalComponent: number;
  interestComponent: number;
  status: 'Paid' | 'Late Paid' | 'Overdue' | 'Pending';
}

export interface SavingsAccount {
  id: string;
  clientId: string;
  clientName: string;
  productType: 'Standard Savings' | 'Fixed Deposit' | 'Target Savings';
  balance: number;
  interestRate: number;
  openDate: string;
  status: 'Active' | 'Dormant' | 'Closed';
}

// ============ CLIENTS ============
export const clients: Client[] = [];

// ============ LOAN PRODUCTS ============
export const loanProducts: LoanProduct[] = [];

// ============ LOANS ============
// Based on the screenshot data - exact loan details from View All Loans
export const loans: Loan[] = [];

// ============ PAYMENTS ============
// Based on the screenshot data - exact payment details from View Repayments
export const payments: Payment[] = [];

export const generateInstallments = (loanId: string): Installment[] => {
  const loan = loans.find(l => l.id === loanId);
  if (!loan) return [];
  
  // Only generate installments for approved or active loans
  if (loan.status === 'Pending' || loan.status === 'Rejected') {
    return [];
  }
  
  // Use loan's numberOfInstallments if available, otherwise calculate from term
  const numInstallments = loan.numberOfInstallments || loan.term;
  const installmentAmount = loan.installmentAmount || 0;
  const principalPerInstallment = Math.round(loan.principalAmount / numInstallments);
  const interestPerInstallment = Math.round((loan.totalRepayable - loan.principalAmount) / numInstallments);
  
  const installments: Installment[] = [];
  const loanPayments = payments.filter(p => p.loanId === loanId);
  
  for (let i = 0; i < numInstallments; i++) {
    // Calculate due date based on firstRepaymentDate and repayment frequency
    const dueDate = new Date(loan.firstRepaymentDate || loan.disbursementDate);
    
    if (loan.repaymentFrequency === 'Monthly') {
      dueDate.setMonth(dueDate.getMonth() + i);
    } else if (loan.repaymentFrequency === 'Weekly') {
      dueDate.setDate(dueDate.getDate() + (i * 7));
    } else if (loan.repaymentFrequency === 'Bi-Weekly') {
      dueDate.setDate(dueDate.getDate() + (i * 14));
    } else if (loan.repaymentFrequency === 'Daily') {
      dueDate.setDate(dueDate.getDate() + i);
    } else if (loan.repaymentFrequency === 'Quarterly') {
      dueDate.setMonth(dueDate.getMonth() + (i * 3));
    }
    
    const payment = loanPayments.find(p => p.installmentNumber === i + 1);
    const today = new Date();
    const isPaid = !!payment;
    const isOverdue = !isPaid && dueDate < today;
    const isPending = !isPaid && dueDate >= today;
    const isLatePaid = isPaid && payment && new Date(payment.date) > dueDate;
    
    installments.push({
      loanId,
      installmentNo: i + 1,
      dueDate: dueDate.toISOString().split('T')[0],
      plannedAmount: Math.round(installmentAmount),
      principalComponent: principalPerInstallment,
      interestComponent: interestPerInstallment,
      status: isPaid ? (isLatePaid ? 'Late Paid' : 'Paid') : (isOverdue ? 'Overdue' : 'Pending')
    });
  }
  
  return installments;
};

export const loanOfficers = [
  { id: 'LO-001', name: 'Victor Muthama', branch: 'Nairobi', email: 'victor.muthama@bvfunguo.co.ke', phone: '0756789012', role: 'Loan Officer' }
];

export const branches = ['Nairobi'];

// Analytics data
export const getPARData = () => {
  const totalPortfolio = loans.filter(l => l.status === 'Active' || l.status === 'In Arrears')
    .reduce((sum, l) => sum + l.outstandingBalance, 0);
  
  const par30 = loans.filter(l => l.daysInArrears >= 30)
    .reduce((sum, l) => sum + l.outstandingBalance, 0);
  
  const par90 = loans.filter(l => l.daysInArrears >= 90)
    .reduce((sum, l) => sum + l.outstandingBalance, 0);
  
  return {
    totalPortfolio,
    par30Ratio: totalPortfolio > 0 ? (par30 / totalPortfolio * 100).toFixed(2) : '0.00',
    par90Ratio: totalPortfolio > 0 ? (par90 / totalPortfolio * 100).toFixed(2) : '0.00',
    par30Amount: par30,
    par90Amount: par90
  };
};

export const getPortfolioTrend = () => {
  // Real data: Oct-Dec 2025 portfolio outstanding balances
  return [
    { month: 'Oct', portfolio: 500000, par30: 0 }, // 5 loans disbursed
    { month: 'Nov', portfolio: 230000, par30: 0 }, // 9 loans paid, 3 active
    { month: 'Dec', portfolio: 230000, par30: 0 }, // No changes yet
  ];
};

export const getLoansByProduct = () => {
  return loanProducts.map(product => ({
    name: product.name,
    count: loans.filter(l => l.productId === product.id && l.status !== 'Fully Paid').length,
    value: loans.filter(l => l.productId === product.id && l.status !== 'Fully Paid')
      .reduce((sum, l) => sum + l.outstandingBalance, 0)
  }));
};

export const getArrearsAging = () => {
  return [
    { range: '1-30 DPD', count: loans.filter(l => l.daysInArrears >= 1 && l.daysInArrears <= 30).length },
    { range: '31-60 DPD', count: loans.filter(l => l.daysInArrears >= 31 && l.daysInArrears <= 60).length },
    { range: '61-90 DPD', count: loans.filter(l => l.daysInArrears >= 61 && l.daysInArrears <= 90).length },
    { range: '90+ DPD', count: loans.filter(l => l.daysInArrears > 90).length },
  ];
};

export const getMonthlyDisbursements = () => {
  // Real data from screenshots
  return [
    { month: 'Oct', amount: 500000, count: 5 }, // 5 loans in Oct
    { month: 'Nov', amount: 455000, count: 7 }, // 7 loans in Nov
    { month: 'Dec', amount: 0, count: 0 }, // No disbursements yet
  ];
};

export const getCollectionRateByWeek = () => {
  // Real data: 100% collection on all matured loans
  return [
    { week: 'Week 1', collected: 387500, expected: 387500, rate: 100 }, // Nov week 1
    { week: 'Week 2', collected: 430250, expected: 430250, rate: 100 }, // Nov week 2
    { week: 'Week 3', collected: 0, expected: 0, rate: 100 }, // Nov week 3
    { week: 'Week 4', collected: 0, expected: 0, rate: 100 }, // Nov week 4
    { week: 'Week 5', collected: 0, expected: 0, rate: 100 }, // Dec
  ];
};

export const getClientsByBranch = () => {
  return [
    { branch: 'Nairobi', clients: clients.length, activeLoans: loans.filter(l => l.status === 'Active').length }
  ];
};

export const getLoanStatusDistribution = () => {
  return [
    { status: 'Active', count: loans.filter(l => l.status === 'Active').length, color: '#10b981' },
    { status: 'In Arrears', count: loans.filter(l => l.status === 'In Arrears').length, color: '#f59e0b' },
    { status: 'Paid Off', count: loans.filter(l => l.status === 'Fully Paid').length, color: '#3b82f6' },
    { status: 'Written Off', count: loans.filter(l => l.status === 'Written Off').length, color: '#ef4444' },
  ];
};

// ============ EXTENDED FEATURES ============

// Collateral Management
export interface Collateral {
  id: string;
  loanId: string;
  type: 'Land Title' | 'Vehicle Logbook' | 'Household Items' | 'Business Equipment' | 'Guarantor';
  description: string;
  estimatedValue: number;
  documentNumber?: string;
  location?: string;
  verifiedBy: string;
  verificationDate: string;
  photos?: string[];
}

export const collaterals: Collateral[] = [];

// Guarantor Management
export interface Guarantor {
  id: string;
  loanId: string;
  name: string;
  nationalId: string;
  phone: string;
  relationship: string;
  employer?: string;
  monthlyIncome?: number;
  guaranteedAmount: number;
  signatureDate: string;
  witnessName: string;
}

export const guarantors: Guarantor[] = [];

// Loan Documents
export interface LoanDocument {
  id: string;
  loanId: string;
  clientId: string;
  type: 'National ID' | 'Business Permit' | 'KRA PIN' | 'Loan Agreement' | 'Collateral Photo' | 'Bank Statement' | 'Passport Photo' | 'Guarantor ID' | 'Site Visit Report';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  expiryDate?: string;
}

export const loanDocuments: LoanDocument[] = [];

// Loan Approval Workflow
export interface LoanApproval {
  id: string;
  loanId: string;
  stage: 'Application' | 'Field Verification' | 'Credit Committee' | 'Manager Approval' | 'Disbursement';
  status: 'Pending' | 'Approved' | 'Rejected' | 'On Hold';
  approver: string;
  approverRole: string;
  comments: string;
  date: string;
}

export const loanApprovals: LoanApproval[] = [];

// SMS Reminders
export interface SMSReminder {
  id: string;
  clientId: string;
  loanId: string;
  type: 'Payment Reminder' | 'Overdue Notice' | 'Disbursement Confirmation' | 'Payment Received';
  message: string;
  scheduledDate: string;
  sentDate?: string;
  status: 'Scheduled' | 'Sent' | 'Failed';
}

export const smsReminders: SMSReminder[] = [];

// Collection Activities
export interface CollectionActivity {
  id: string;
  loanId: string;
  clientId: string;
  activityType: 'Phone Call' | 'SMS' | 'Field Visit' | 'Demand Letter' | 'Payment Promise';
  date: string;
  performedBy: string;
  notes: string;
  promisedAmount?: number;
  promisedDate?: string;
  outcome: 'Successful' | 'No Response' | 'Promise to Pay' | 'Disputed' | 'Refused';
}

export const collectionActivities: CollectionActivity[] = [];

// Loan Restructuring
export interface LoanRestructure {
  id: string;
  loanId: string;
  requestDate: string;
  reason: string;
  originalMaturityDate: string;
  newMaturityDate: string;
  originalInstallment: number;
  newInstallment: number;
  approvedBy: string;
  approvalDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const loanRestructures: LoanRestructure[] = [];

// Penalties and Fees
export interface LoanFee {
  id: string;
  loanId: string;
  feeType: 'Late Payment Penalty' | 'Processing Fee' | 'Insurance Premium' | 'Early Repayment Fee' | 'Restructuring Fee';
  amount: number;
  appliedDate: string;
  status: 'Pending' | 'Paid' | 'Waived';
  paidDate?: string;
  waivedBy?: string;
  waivedReason?: string;
}

export const loanFees: LoanFee[] = [];

// Insurance
export interface LoanInsurance {
  id: string;
  loanId: string;
  clientId: string;
  insuranceType: 'Credit Life' | 'Loan Protection' | 'Business Insurance';
  provider: string;
  policyNumber: string;
  premium: number;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Claimed';
}

export const loanInsurance: LoanInsurance[] = [];

// ============ GROUP LENDING (CHAMAS) ============

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

export const groups: Group[] = [];

export interface GroupMeeting {
  id: string;
  groupId: string;
  meetingDate: string;
  attendance: number;
  collectionsAmount: number;
  disbursementsAmount: number;
  finesCollected: number;
  notes: string;
  conductedBy: string;
}

export const groupMeetings: GroupMeeting[] = [];

export interface GroupDocument {
  id: string;
  groupId: string;
  type: 'Group Constitution' | 'Registration Certificate' | 'Meeting Minutes' | 'Member List' | 'Financial Statement' | 'Group Photo' | 'Bank Account Details' | 'Savings Records';
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  expiryDate?: string;
}

export const groupDocuments: GroupDocument[] = [];

// ============ SMS CAMPAIGNS ============

export interface SMSCampaign {
  id: string;
  name: string;
  type: 'Payment Reminder' | 'Promotional' | 'Overdue Alert' | 'Meeting Reminder' | 'Custom';
  targetAudience: string;
  scheduledDate: string;
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Failed';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  message: string;
  createdBy: string;
  costEstimate: number;
}

export const smsCampaigns: SMSCampaign[] = [];

// ============ STAFF PERFORMANCE ============

export interface StaffPerformance {
  id: string;
  staffId: string;
  name: string;
  role: string;
  branch: string;
  activeClients: number;
  newClientsThisMonth: number;
  loansDisbursedThisMonth: number;
  disbursementAmountThisMonth: number;
  portfolioAtRisk: number;
  collectionRate: number;
  targetAchievement: number;
  commissionEarned: number;
  rating: 1 | 2 | 3 | 4 | 5;
  lastEvaluation: string;
}

export const staffPerformance: StaffPerformance[] = [];

export interface CommissionStructure {
  tier: string;
  minDisbursement: number;
  maxDisbursement: number;
  rate: number;
  bonusCondition?: string;
  bonusAmount?: number;
}

export const commissionStructure: CommissionStructure[] = [
  { tier: 'Bronze', minDisbursement: 0, maxDisbursement: 200000, rate: 2.5 },
  { tier: 'Silver', minDisbursement: 200001, maxDisbursement: 400000, rate: 3.0, bonusCondition: 'PAR < 3%', bonusAmount: 5000 },
  { tier: 'Gold', minDisbursement: 400001, maxDisbursement: 600000, rate: 3.5, bonusCondition: 'PAR < 3%', bonusAmount: 8000 },
  { tier: 'Platinum', minDisbursement: 600001, maxDisbursement: 999999999, rate: 4.0, bonusCondition: 'PAR < 3%', bonusAmount: 12000 }
];

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

export const auditLogs: AuditLog[] = [];

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

export const tasks: Task[] = [];

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

export const tickets: Ticket[] = [];

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

export const kycRecords: KYCRecord[] = [];

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
}

export const complianceReports: ComplianceReport[] = [];

// ============ EXPENSES & PAYEES ============

export interface Expense {
  id: string;
  date: string;
  category: string;
  payee: string;
  amount: number;
  description: string;
  paymentMethod: 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque';
  approvedBy: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  receiptNumber?: string;
}

export const expenses: Expense[] = [];

export interface Payee {
  id: string;
  name: string;
  category: string;
  phone: string;
  email?: string;
  accountNumber?: string;
  bank?: string;
  totalPaid: number;
  lastPaymentDate?: string;
}

export const payees: Payee[] = [];

// ============ SAVINGS ACCOUNTS ============
// Realistic savings account data for BV FUNGUO LTD clients
export const savingsAccounts: SavingsAccount[] = [];