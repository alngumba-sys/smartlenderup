import { useState, useRef } from 'react';
import { Search, Plus, Calendar, AlertCircle, CheckCircle, XCircle, DollarSign, TrendingUp, PercentIcon, Wallet, User, Calculator, Upload, X, Info, Filter, Clock, MessageSquare, UserCheck, FileText, Send, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Edit, RefreshCw } from 'lucide-react';
import { generateInstallments, type LoanDocument, type Guarantor, type Collateral } from '../../data/dummyData';
// Import useData hook from DataContext - Version: 2025-01-11
import { useData } from '../../contexts/DataContext';
import { ComprehensiveLoanDetailsModal } from '../modals/ComprehensiveLoanDetailsModal';
import { NewLoanModal } from '../modals/NewLoanModal';
import { LoanCalculatorModal } from '../modals/LoanCalculatorModal';
import { BulkUploadModal } from '../modals/BulkUploadModal';
import { RepaymentScheduleModal } from '../modals/RepaymentScheduleModal';
import { DisbursementModal } from '../modals/DisbursementModal';
import { ViewToggle } from '../ViewToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
import { getCurrencySymbol, getCurrencyCode } from '../../utils/currencyUtils';
import { canCreateInTab, canEditInTab, canDeleteInTab, showPermissionError } from '../../utils/staffPermissions';
import { AIInsightPopover } from '../AIInsightPopover';

// ✨ Professional redesign: Compact tables + Expected payments analytics
export function LoansTab() {
  const { isDark } = useTheme();
  const { 
    loans, 
    clients, 
    loanProducts, 
    addLoan,
    updateLoan,
    deleteLoan,
    loanDocuments,
    addLoanDocument,
    guarantors,
    addGuarantor,
    collaterals,
    addCollateral,
    refreshData,
    fixLoanPrincipals,
    payees
  } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pending-review' | 'pending-disbursement' | 'active' | 'settled' | 'defaulted' | 'due' | 'no-repayments' | 'principal' | '1-month-late' | '3-months-late' | 'guarantors' | 'comments' | 'repayment-schedule'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [detailModalLoan, setDetailModalLoan] = useState<string | null>(null);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [selectedLoanForComment, setSelectedLoanForComment] = useState<string | null>(null);
  const [showRepaymentSchedule, setShowRepaymentSchedule] = useState<string | null>(null);
  const [showDisbursementModal, setShowDisbursementModal] = useState<string | null>(null);
  const [selectedInsightCard, setSelectedInsightCard] = useState<string | null>(null);
  
  // Refs for each KPI card to position the popover
  const totalLoansRef = useRef<HTMLDivElement>(null);
  const totalAmountRef = useRef<HTMLDivElement>(null);
  const outstandingRef = useRef<HTMLDivElement>(null);
  const activeLoansRef = useRef<HTMLDivElement>(null);
  const pendingReviewRef = useRef<HTMLDivElement>(null);
  const pendingDisbursementRef = useRef<HTMLDivElement>(null);
  const paidLoansRef = useRef<HTMLDivElement>(null);
  const defaultsRef = useRef<HTMLDivElement>(null);
  
  // Get dynamic currency
  const currencySymbol = getCurrencySymbol();
  const currencyCode = getCurrencyCode();
  
  // Helper function to normalize status (handle both lowercase and capitalized)
  const isActiveStatus = (status: string) => {
    const normalized = status?.toLowerCase();
    return normalized === 'active' || normalized === 'in arrears' || normalized === 'overdue';
  };
  
  // ✅ Helper to calculate CORRECT interest for FLAT RATE per period
  const calculateCorrectInterest = (loan: any) => {
    const principal = loan.principalAmount || loan.amount || 0;
    const rate = loan.interestRate || 0;
    const term = loan.term || loan.termPeriod || loan.loanTerm || loan.termMonths || 1;
    
    // FLAT RATE: Interest = Principal × Rate × Term / 100
    // Example: 100,000 × 7.5% × 1 month = 7,500
    const correctInterest = (principal * rate * term) / 100;
    return Math.round(correctInterest);
  };
  
  // Upcoming payments timeframe
  const [upcomingPaymentsTimeframe, setUpcomingPaymentsTimeframe] = useState<'today' | 'this-week' | 'next-7-days' | 'this-month'>('next-7-days');
  
  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Delete confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<{ id: string; status: string; clientName?: string } | null>(null);
  
  // Comment form state
  const [commentLoanId, setCommentLoanId] = useState('');
  const [commentText, setCommentText] = useState('');
  
  // Loan comments state
  const [loanComments, setLoanComments] = useState<Array<{
    id: string;
    loanId: string;
    clientName: string;
    comment: string;
    commentedBy: string;
    date: string;
    time: string;
  }>>([]);

  const handleNewLoan = async (loanData: any) => {
    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection(editingLoanId ? 'update loan application' : 'create loan application');
    if (!isConnected) {
      return; // Block the operation if offline
    }
    
    const client = clients.find(c => c.id === loanData.clientId);
    const product = loanProducts.find(p => p.id === loanData.productId);
    
    // Calculate loan details
    const principalAmount = parseFloat(loanData.principalAmount) || 0;
    const interestRate = parseFloat(loanData.interestRate) || 0;
    const term = parseInt(loanData.loanTerm) || 12;
    const termUnit = loanData.termUnit || 'Months';
    const facilitationFee = parseFloat(loanData.facilitationFee) || 0;
    
    // Calculate total interest and repayable amount
    let totalInterest = 0;
    let installmentAmount = 0;
    const numberOfInstallments = termUnit === 'Months' ? term : 
                                  termUnit === 'Weeks' ? Math.ceil(term / 4) : 
                                  termUnit === 'Days' ? Math.ceil(term / 30) : term;
    
    if (product?.interestType === 'Flat') {
      // Flat rate: Monthly interest rate × number of months
      // Note: interestRate is per month (e.g., 10% per month), not APR
      totalInterest = principalAmount * (interestRate / 100) * term;
      installmentAmount = (principalAmount + totalInterest) / numberOfInstallments;
    } else {
      // Reducing Balance
      const monthlyRate = (interestRate / 100) / 12;
      installmentAmount = (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfInstallments)) / 
                         (Math.pow(1 + monthlyRate, numberOfInstallments) - 1);
      totalInterest = (installmentAmount * numberOfInstallments) - principalAmount;
    }
    
    let totalRepayable = principalAmount + totalInterest;
    
    // Calculate discount if provided
    let discountAmount = 0;
    let finalTotalRepayable = totalRepayable;
    let finalOutstandingBalance = totalRepayable;
    
    if (loanData.discountType && loanData.discountValue) {
      const discountValue = parseFloat(loanData.discountValue) || 0;
      const discountAppliedTo = loanData.discountAppliedTo || 'total_repayable';
      
      if (loanData.discountType === 'percentage') {
        // Percentage discount (capped at 100%)
        const percentage = Math.min(discountValue, 100);
        if (discountAppliedTo === 'total_repayable') {
          discountAmount = (totalRepayable * percentage) / 100;
          finalTotalRepayable = totalRepayable - discountAmount;
          finalOutstandingBalance = finalTotalRepayable;
        } else {
          // Apply to balance (same as total_repayable for new loans)
          discountAmount = (totalRepayable * percentage) / 100;
          finalOutstandingBalance = totalRepayable - discountAmount;
          finalTotalRepayable = totalRepayable; // Total repayable stays the same, only balance is reduced
        }
      } else {
        // Fixed amount discount
        if (discountAppliedTo === 'total_repayable') {
          discountAmount = Math.min(discountValue, totalRepayable);
          finalTotalRepayable = totalRepayable - discountAmount;
          finalOutstandingBalance = finalTotalRepayable;
        } else {
          // Apply to balance
          discountAmount = Math.min(discountValue, totalRepayable);
          finalOutstandingBalance = totalRepayable - discountAmount;
          finalTotalRepayable = totalRepayable; // Total repayable stays the same
        }
      }
      
      // Recalculate installment if total repayable changed
      if (discountAppliedTo === 'total_repayable') {
        installmentAmount = finalTotalRepayable / numberOfInstallments;
      }
    }
    
    // Calculate dates
    const disbursementDate = loanData.disbursementDate || new Date().toISOString().split('T')[0];
    const firstRepaymentDate = new Date(disbursementDate);
    firstRepaymentDate.setMonth(firstRepaymentDate.getMonth() + 1);
    
    const maturityDate = new Date(disbursementDate);
    if (termUnit === 'Months') {
      maturityDate.setMonth(maturityDate.getMonth() + term);
    } else if (termUnit === 'Weeks') {
      maturityDate.setDate(maturityDate.getDate() + (term * 7));
    } else if (termUnit === 'Days') {
      maturityDate.setDate(maturityDate.getDate() + term);
    } else {
      maturityDate.setFullYear(maturityDate.getFullYear() + term);
    }
    
    // Create complete loan object
    const completeLoan = {
      clientId: loanData.clientId,
      clientName: client?.name || 'Unknown Client',
      productId: loanData.productId,
      productName: product?.name || 'Unknown Product',
      principalAmount: principalAmount,
      interestRate: interestRate,
      interestType: product?.interestType || 'Flat',
      term: term,
      termUnit: termUnit as 'Days' | 'Weeks' | 'Months' | 'Years',
      repaymentFrequency: product?.repaymentFrequency || 'Monthly',
      disbursementDate: disbursementDate,
      firstRepaymentDate: firstRepaymentDate.toISOString().split('T')[0],
      maturityDate: maturityDate.toISOString().split('T')[0],
      status: 'Pending' as const,
      facilitationFee: facilitationFee,
      staffMemberId: loanData.staffMemberId || null,
      staffMemberName: loanData.staffMemberId ? payees.find(p => p.id === loanData.staffMemberId)?.name || null : null,
      collateral: loanData.collateralType && loanData.collateralValue ? [{
        type: loanData.collateralType,
        description: loanData.collateralType,
        value: parseFloat(loanData.collateralValue) || 0
      }] : [],
      guarantors: loanData.guarantorName && loanData.guarantorPhone ? [{
        name: loanData.guarantorName,
        phone: loanData.guarantorPhone,
        idNumber: '',
        relationship: 'Guarantor'
      }] : [],
      totalInterest: Math.round(totalInterest),
      totalRepayable: Math.round(finalTotalRepayable),
      installmentAmount: Math.round(installmentAmount),
      numberOfInstallments: numberOfInstallments,
      paidAmount: 0,
      outstandingBalance: Math.round(finalOutstandingBalance),
      principalOutstanding: principalAmount,
      interestOutstanding: Math.round(totalInterest),
      daysInArrears: 0,
      arrearsAmount: 0,
      overdueAmount: 0,
      penaltyAmount: 0,
      purpose: loanData.purpose || 'Not specified',
      createdBy: 'Current User',
      loanOfficer: 'Loan Officer',
      notes: loanData.notes || '',
      discountType: loanData.discountType || null,
      discountValue: loanData.discountValue ? parseFloat(loanData.discountValue) : null,
      discountAmount: discountAmount > 0 ? Math.round(discountAmount) : null,
      discountAppliedTo: loanData.discountAppliedTo || null
    };
    
    
    // Save the loan to DataContext and get the generated ID
    let loanId: string;
    if (editingLoanId) {
      // Update existing loan
      updateLoan(editingLoanId, completeLoan);
      loanId = editingLoanId;
      toast.success('Loan Updated Successfully!', {
        description: `
          Client: ${client?.name || 'Unknown'}
          Amount: KES ${principalAmount.toLocaleString()}
          New Total Interest: KES ${Math.round(totalInterest).toLocaleString()}
        `,
        duration: 6000,
      });
      // Clear editing state
      setEditingLoanId(null);
      return; // Exit early for updates
    } else {
      // Create new loan
      loanId = await addLoan(completeLoan);
    }
    
    // Save uploaded documents to loanDocuments array
    if (loanData.documents && loanData.documents.length > 0) {
      loanData.documents.forEach((doc: any) => {
        // Map document category to LoanDocument type
        const mapCategoryToType = (category: string): LoanDocument['type'] => {
          const mapping: Record<string, LoanDocument['type']> = {
            'National ID': 'National ID',
            'Passport': 'Passport Photo',
            'Bank Statement (3 months)': 'Bank Statement',
            'Bank Statement (6 months)': 'Bank Statement',
            'Business Permit/License': 'Business Permit',
            'Tax Certificate/PIN': 'KRA PIN',
            'Collateral Document': 'Collateral Photo',
            'Photo/Selfie': 'Passport Photo',
          };
          return mapping[category] || 'National ID';
        };

        const newDocument: LoanDocument = {
          id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          loanId: loanId,
          clientId: loanData.clientId,
          type: mapCategoryToType(doc.category),
          fileName: doc.name,
          fileSize: `${(doc.size / 1024).toFixed(1)} KB`,
          uploadDate: doc.uploadDate,
          uploadedBy: 'Current User',
          status: 'Pending'
        };
        addLoanDocument(newDocument);
      });
    }
    
    // Save guarantor to guarantors array
    if (loanData.guarantorName && loanData.guarantorPhone) {
      const newGuarantor: Guarantor = {
        id: `GUAR-${Date.now()}`,
        loanId: loanId,
        name: loanData.guarantorName,
        nationalId: '',
        phone: loanData.guarantorPhone,
        relationship: 'Guarantor',
        guaranteedAmount: principalAmount,
        signatureDate: new Date().toISOString().split('T')[0],
        witnessName: 'Loan Officer'
      };
      addGuarantor(newGuarantor);
    }
    
    // Save collateral to collaterals array
    if (loanData.collateralType && loanData.collateralValue) {
      const newCollateral: Collateral = {
        id: `COL-${Date.now()}`,
        loanId: loanId,
        type: loanData.collateralType as any,
        description: loanData.collateralType,
        estimatedValue: parseFloat(loanData.collateralValue) || 0,
        verifiedBy: 'Loan Officer',
        verificationDate: new Date().toISOString().split('T')[0]
      };
      addCollateral(newCollateral);
    }
    
    // Show success toast with comprehensive details
    toast.success('Loan Application Created Successfully!', {
      description: `
        Client: ${client?.name || 'Unknown'}
        Amount: KES ${principalAmount.toLocaleString()}
        Product: ${product?.name || 'Unknown'}
        Documents: ${loanData.documents?.length || 0} uploaded
        Credit Score: ${loanData.creditScore || 'N/A'}
        Interest Rate: ${interestRate}%
      `,
      duration: 6000,
    });
  };

  // Get actual loan guarantors from loan data
  const loanGuarantors = loans
    .filter(loan => loan.guarantors && loan.guarantors.length > 0) // Only loans with guarantors
    .map(loan => {
      const client = clients.find(c => c.id === loan.clientId);
      
      return {
        loanId: loan.id,
        clientName: client?.name || '',
        loanAmount: loan.principalAmount || 0,
        guarantors: loan.guarantors || []
      };
    });

  // Handler for adding loan comments
  const handleAddComment = () => {
    if (!commentLoanId || !commentText.trim()) {
      toast.error('Please select a loan and enter a comment');
      return;
    }

    const loan = loans.find(l => l.id === commentLoanId);
    const client = clients.find(c => c.id === loan?.clientId);
    
    if (!loan || !client) {
      toast.error('Invalid loan selected');
      return;
    }

    const now = new Date();
    const newComment = {
      id: `CMT-${Date.now()}`,
      loanId: commentLoanId,
      clientName: client.name,
      comment: commentText,
      commentedBy: 'Current User', // Replace with actual logged-in user
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setLoanComments([...loanComments, newComment]);
    
    toast.success('Comment added successfully', {
      description: `Comment added to loan ${commentLoanId}`,
    });
    
    // Reset form and close modal
    setCommentLoanId('');
    setCommentText('');
    setShowAddCommentModal(false);
  };

  // Handler for deleting pending loans
  const handleDeleteLoan = (loanId: string, loanStatus: string, clientName?: string) => {
    if (loanStatus !== 'Pending') {
      toast.error('Cannot delete loan', {
        description: 'Only loans in Pending status can be deleted',
      });
      return;
    }

    // Open confirmation modal
    setLoanToDelete({ id: loanId, status: loanStatus, clientName });
    setShowDeleteConfirmation(true);
  };

  // Confirm deletion
  const confirmDeleteLoan = async () => {
    if (!loanToDelete) return;

    try {
      await deleteLoan(loanToDelete.id);
      // Toast is already shown in deleteLoan function
      setShowDeleteConfirmation(false);
      setLoanToDelete(null);
    } catch (error) {
      // Error is already handled in deleteLoan with toast
      setShowDeleteConfirmation(false);
      setLoanToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDeleteLoan = () => {
    setShowDeleteConfirmation(false);
    setLoanToDelete(null);
  };

  // Date filtering helper
  const isLoanInDateRange = (loan: typeof loans[0]) => {
    if (dateFilter === 'all') return true;
    
    const disbursementDate = new Date(loan.disbursementDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (dateFilter) {
      case 'today':
        return disbursementDate.toDateString() === today.toDateString();
      case 'yesterday':
        return disbursementDate.toDateString() === yesterday.toDateString();
      case 'thisWeek':
        return disbursementDate >= weekAgo && disbursementDate <= today;
      case 'thisMonth':
        return disbursementDate >= monthStart && disbursementDate <= today;
      case 'custom':
        if (!customStartDate || !customEndDate) return true;
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        return disbursementDate >= startDate && disbursementDate <= endDate;
      default:
        return true;
    }
  };

  // Helper function to calculate accurate days in arrears based on disbursement date and repayment frequency
  const calculateDaysInArrears = (loan: any): number => {
    if (!loan.disbursementDate || loan.status === 'Paid') {
      return 0;
    }
    
    const today = new Date();
    const disbursementDate = new Date(loan.disbursementDate);
    
    // Calculate first payment due date based on repayment frequency
    const firstPaymentDue = new Date(disbursementDate);
    const frequency = loan.repaymentFrequency?.toLowerCase() || 'monthly';
    
    switch (frequency) {
      case 'daily':
        firstPaymentDue.setDate(disbursementDate.getDate() + 1);
        break;
      case 'weekly':
        firstPaymentDue.setDate(disbursementDate.getDate() + 7);
        break;
      case 'bi-weekly':
        firstPaymentDue.setDate(disbursementDate.getDate() + 14);
        break;
      case 'monthly':
      default:
        firstPaymentDue.setMonth(disbursementDate.getMonth() + 1);
        break;
    }
    
    // If we haven't reached the first payment due date, no arrears
    if (today < firstPaymentDue) {
      return 0;
    }
    
    // Calculate the expected number of payments that should have been made
    const daysSinceDisbursement = Math.floor((today.getTime() - disbursementDate.getTime()) / (1000 * 60 * 60 * 24));
    let expectedPayments = 0;
    
    switch (frequency) {
      case 'daily':
        expectedPayments = daysSinceDisbursement;
        break;
      case 'weekly':
        expectedPayments = Math.floor(daysSinceDisbursement / 7);
        break;
      case 'bi-weekly':
        expectedPayments = Math.floor(daysSinceDisbursement / 14);
        break;
      case 'monthly':
      default:
        const monthsDiff = (today.getFullYear() - disbursementDate.getFullYear()) * 12 + 
                          (today.getMonth() - disbursementDate.getMonth());
        expectedPayments = Math.max(0, monthsDiff);
        break;
    }
    
    // Calculate expected amount to have been paid
    const correctInterest = calculateCorrectInterest(loan);
    const totalDue = (loan.principalAmount || 0) + correctInterest;
    const totalInstallments = loan.numberOfInstallments || loan.termMonths || 12;
    const installmentAmount = totalDue / totalInstallments;
    const expectedPaid = installmentAmount * expectedPayments;
    
    // If actual paid amount is less than expected, calculate days in arrears
    const actualPaid = loan.paidAmount || 0;
    
    if (actualPaid >= expectedPaid) {
      return 0; // No arrears
    }
    
    // Calculate how many installments are overdue
    const unpaidInstallments = Math.ceil((expectedPaid - actualPaid) / installmentAmount);
    
    // Calculate days in arrears based on frequency
    switch (frequency) {
      case 'daily':
        return unpaidInstallments;
      case 'weekly':
        return unpaidInstallments * 7;
      case 'bi-weekly':
        return unpaidInstallments * 14;
      case 'monthly':
      default:
        return unpaidInstallments * 30;
    }
  };

  // Calculate due date for loans
  const getDueDate = (loan: typeof loans[0]) => {
    const disbursementDate = new Date(loan.disbursementDate);
    const dueDate = new Date(disbursementDate);
    dueDate.setMonth(dueDate.getMonth() + (loan.termMonths || 12));
    return dueDate;
  };

  const isDueSoon = (loan: typeof loans[0]) => {
    // Calculate dynamic days in arrears
    const daysInArrears = calculateDaysInArrears(loan);
    
    // Check if loan is active (case-insensitive)
    const isActive = loan.status?.toLowerCase() === 'active';
    
    if (!isActive) return false;
    
    // Check if loan has overdue payments (days in arrears > 0)
    if (daysInArrears > 0) {
      return true; // Loan has overdue payments
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If loan has a nextPaymentDate field, check if payment is due within 7 days
    if (loan.nextPaymentDate) {
      const nextPayment = new Date(loan.nextPaymentDate);
      nextPayment.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.floor((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7; // Due within next 7 days
    }
    
    // Otherwise check based on full loan term (legacy) - due within next 30 days
    const dueDate = getDueDate(loan);
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  };

  // Filter loans based on active sub-tab
  let displayLoans = loans;
  

  
  switch (activeSubTab) {
    case 'pending-review':
      displayLoans = loans.filter(loan => loan.status === 'Pending');
      break;
    case 'pending-disbursement':
      displayLoans = loans.filter(loan => loan.status === 'Approved' || loan.status === 'approved');
      break;
    case 'active':
      // ✅ FIXED: Only show truly active loans, exclude Paid/Closed loans
      displayLoans = loans.filter(loan => {
        const status = (loan.status || '').toLowerCase().trim();
        // Include: Active, Disbursed, In Arrears
        const isActiveStatus = status === 'active' || status === 'disbursed' || status === 'in arrears';
        // Exclude: Paid, Closed, Fully Paid, etc.
        const isPaidStatus = status === 'paid' || status === 'closed' || status === 'fully paid';
        
        return isActiveStatus && !isPaidStatus;
      });
      break;
    case 'settled':
      // Include loans with status 'Paid', 'Closed', OR loans where balance is 0
      displayLoans = loans.filter(loan => {
        const status = (loan.status || '').toLowerCase();
        const isPaid = status === 'paid' || 
               status === 'closed' ||
               (loan.balance !== undefined && parseFloat(loan.balance.toString()) === 0) ||
               (loan.outstandingBalance !== undefined && parseFloat(loan.outstandingBalance.toString()) === 0);
        
        return isPaid;
      });
      break;
    case 'defaulted':
      displayLoans = loans.filter(loan => {
        const status = (loan.status || '').toLowerCase();
        const isPaid = status === 'paid' || status === 'closed' || status === 'fully paid';
        const outstandingBalance = loan.outstandingBalance || 0;
        
        // Exclude paid loans (status = Paid OR outstanding = 0)
        if (isPaid || outstandingBalance <= 0) return false;
        
        // Only include loans that are truly defaulted
        return loan.status === 'Written Off' || 
               loan.status === 'Default' ||
               loan.status === 'Default / Past Due' ||
               (loan.daysInArrears || 0) >= 90;
      });
      break;
    case 'due':
      displayLoans = loans.filter(loan => {
        // Exclude paid loans (outstanding = 0 or status = Paid)
        const principalAmt = loan.principalAmount || 0;
        const paidAmt = loan.paidAmount || 0;
        const interestAmt = calculateCorrectInterest(loan);
        const totalRepayable = principalAmt + interestAmt;
        const outstanding = Math.max(0, totalRepayable - paidAmt);
        const status = (loan.status || '').toLowerCase();
        const isPaid = status === 'paid' || status === 'closed' || status === 'fully paid' || outstanding <= 0;
        
        if (isPaid) return false;
        
        return isDueSoon(loan) && loan.status === 'Active';
      });
      break;
    case 'no-repayments':
      // ✅ Show loans with zero repayments (paidAmount = 0), excluding Paid/Closed loans
      displayLoans = loans.filter(loan => {
        const status = (loan.status || '').toLowerCase().trim();
        const isPaidStatus = status === 'paid' || status === 'closed' || status === 'fully paid';
        const hasNoPayments = (loan.paidAmount || 0) === 0;
        
        // Include loans with 0 payments that are Active, Disbursed, or In Arrears
        // Exclude loans that are Paid, Closed, Pending, Approved, Rejected
        const isActiveLoan = status === 'active' || status === 'disbursed' || status === 'in arrears';
        
        return hasNoPayments && isActiveLoan && !isPaidStatus;
      });
      break;
    case 'principal':
      displayLoans = loans.filter(loan => loan.status === 'Active');
      break;
    case '1-month-late':
      displayLoans = loans.filter(loan => (loan.daysInArrears || 0) >= 30 && (loan.daysInArrears || 0) < 90);
      break;
    case '3-months-late':
      displayLoans = loans.filter(loan => (loan.daysInArrears || 0) >= 90);
      break;
    default:
      displayLoans = loans;
  }

  const filteredLoans = displayLoans.filter(loan => {
    const client = clients.find(c => c.id === loan.clientId);
    const clientName = loan.clientName || (client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : '') || client?.name || '';
    const matchesSearch = searchTerm === '' || 
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (loan.loanNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesDate = isLoanInDateRange(loan);
    
    return matchesSearch && matchesStatus && matchesDate;
  }).reverse(); // Reverse to show newest loans first (at the top)

  // Sort the filtered loans
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'loanId':
        aValue = a.loanNumber || a.id;
        bValue = b.loanNumber || b.id;
        break;
      case 'requestDate':
        aValue = new Date(a.applicationDate || a.createdDate || 0).getTime();
        bValue = new Date(b.applicationDate || b.createdDate || 0).getTime();
        break;
      case 'clientName':
        const clientA = clients.find(c => c.id === a.clientId);
        const clientB = clients.find(c => c.id === b.clientId);
        aValue = (a.clientName || clientA?.name || clientA?.firstName + ' ' + clientA?.lastName || '').toLowerCase();
        bValue = (b.clientName || clientB?.name || clientB?.firstName + ' ' + clientB?.lastName || '').toLowerCase();
        break;
      case 'clientId':
        const cA = clients.find(c => c.id === a.clientId);
        const cB = clients.find(c => c.id === b.clientId);
        aValue = cA?.clientNumber || cA?.client_number || '';
        bValue = cB?.clientNumber || cB?.client_number || '';
        break;
      case 'amount':
        aValue = a.principalAmount || 0;
        bValue = b.principalAmount || 0;
        break;
      case 'interest':
        aValue = a.totalInterest || 0;
        bValue = b.totalInterest || 0;
        break;
      case 'paid':
        aValue = a.paidAmount || 0;
        bValue = b.paidAmount || 0;
        break;
      case 'outstanding':
        const outstandingA = (a.principalAmount || 0) + (a.totalInterest || 0) - (a.paidAmount || 0);
        const outstandingB = (b.principalAmount || 0) + (b.totalInterest || 0) - (b.paidAmount || 0);
        aValue = outstandingA;
        bValue = outstandingB;
        break;
      case 'status':
        const statusA = ((a.principalAmount || 0) + (a.totalInterest || 0) - (a.paidAmount || 0)) <= 0 ? 'Paid' : a.status;
        const statusB = ((b.principalAmount || 0) + (b.totalInterest || 0) - (b.paidAmount || 0)) <= 0 ? 'Paid' : b.status;
        aValue = statusA.toLowerCase();
        bValue = statusB.toLowerCase();
        break;
      default:
        return 0;
    }

    // Compare values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc'
        ? (aValue > bValue ? 1 : aValue < bValue ? -1 : 0)
        : (bValue > aValue ? 1 : bValue < aValue ? -1 : 0);
    }
  });

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="size-3 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="size-3" />
      : <ArrowDown className="size-3" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="size-5 text-emerald-600" />;
      case 'In Arrears':
        return <AlertCircle className="size-5 text-red-600" />;
      case 'Paid':
        return <CheckCircle className="size-5 text-blue-600" />;
      default:
        return <XCircle className="size-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    // Normalize status for comparison
    const normalizedStatus = status.toLowerCase().trim();
    
    if (normalizedStatus === 'active') {
      return 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white';
    } else if (normalizedStatus === 'in arrears') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    } else if (normalizedStatus === 'paid' || normalizedStatus === 'settled') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (normalizedStatus === 'written off') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    } else if (normalizedStatus === 'pending') {
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    } else if (normalizedStatus === 'closed') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    } else if (normalizedStatus === 'approved') {
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';

    } else if (normalizedStatus === 'rejected') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalLoansAmount = loans.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0);
  const totalPaidAmount = loans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0);
  const totalOutstanding = totalLoansAmount - totalPaidAmount;
  const dueLoans = loans.filter(loan => isDueSoon(loan) && loan.status === 'Active');
  const noRepaymentLoans = loans.filter(loan => (loan.paidAmount || 0) === 0 && loan.status === 'Active');
  const oneMonthLate = loans.filter(loan => (loan.daysInArrears || 0) >= 30 && (loan.daysInArrears || 0) < 90);
  const threeMonthsLate = loans.filter(loan => (loan.daysInArrears || 0) >= 90);

  // Calculate expected payments for different time periods
  const calculateExpectedPayments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    let expectedToday = 0;
    let expectedTomorrow = 0;
    let expectedThisWeek = 0;
    let expectedThisMonth = 0;
    
    loans.filter(loan => loan.status === 'Active').forEach(loan => {
      const installmentAmount = loan.installmentAmount || 0;
      const firstRepaymentDate = new Date(loan.firstRepaymentDate);
      
      // Calculate all payment dates based on repayment frequency
      for (let i = 0; i < loan.numberOfInstallments; i++) {
        const paymentDate = new Date(firstRepaymentDate);
        
        if (loan.repaymentFrequency === 'Monthly') {
          paymentDate.setMonth(paymentDate.getMonth() + i);
        } else if (loan.repaymentFrequency === 'Weekly') {
          paymentDate.setDate(paymentDate.getDate() + (i * 7));
        } else if (loan.repaymentFrequency === 'Daily') {
          paymentDate.setDate(paymentDate.getDate() + i);
        }
        
        paymentDate.setHours(0, 0, 0, 0);
        
        // Check if payment is expected in different periods
        if (paymentDate.getTime() === today.getTime()) {
          expectedToday += installmentAmount;
        }
        if (paymentDate.getTime() === tomorrow.getTime()) {
          expectedTomorrow += installmentAmount;
        }
        if (paymentDate >= today && paymentDate <= weekEnd) {
          expectedThisWeek += installmentAmount;
        }
        if (paymentDate >= today && paymentDate <= monthEnd) {
          expectedThisMonth += installmentAmount;
        }
      }
    });
    
    return {
      today: expectedToday,
      tomorrow: expectedTomorrow,
      thisWeek: expectedThisWeek,
      thisMonth: expectedThisMonth
    };
  };
  
  const expectedPayments = calculateExpectedPayments();

  // Generate complete repayment schedule with individual installments
  const generateRepaymentSchedule = () => {
    const schedule: Array<{
      paymentDate: Date;
      loanId: string;
      clientName: string;
      installmentNumber: number;
      installmentAmount: number;
      principalAmount: number;
      interestAmount: number;
      status: 'Paid' | 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming';
      daysOverdue: number;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    loans.filter(loan => isActiveStatus(loan.status)).forEach(loan => {
      // Robust date handling (like DashboardTab)
      let firstRepaymentDate;
      if (loan.firstRepaymentDate && !isNaN(new Date(loan.firstRepaymentDate).getTime())) {
        firstRepaymentDate = new Date(loan.firstRepaymentDate);
      } else if (loan.disbursementDate && !isNaN(new Date(loan.disbursementDate).getTime())) {
        // Fallback: Disbursement date + 1 month (or based on frequency)
        firstRepaymentDate = new Date(loan.disbursementDate);
        const frequency = (loan.repaymentFrequency || 'Monthly').toLowerCase();
        if (frequency.includes('week')) firstRepaymentDate.setDate(firstRepaymentDate.getDate() + 7);
        else if (frequency.includes('daily')) firstRepaymentDate.setDate(firstRepaymentDate.getDate() + 1);
        else firstRepaymentDate.setMonth(firstRepaymentDate.getMonth() + 1);
      } else {
        return; // Skip if no valid dates
      }

      // Robust installment calculation (like DashboardTab)
      const numInstallments = loan.numberOfInstallments || loan.term || 12;
      let installmentAmount = loan.installmentAmount || 0;
      
      // Calculate installment amount if missing
      if (!installmentAmount && numInstallments > 0) {
        const principal = loan.principalAmount || 0;
        const interest = calculateCorrectInterest(loan);
        installmentAmount = (principal + interest) / numInstallments;
      }
      
      const totalPrincipal = loan.principalAmount || 0;
      const totalInterest = calculateCorrectInterest(loan);
      
      const principalPerInstallment = totalPrincipal / numInstallments;
      const interestPerInstallment = totalInterest / numInstallments;

      for (let i = 0; i < numInstallments; i++) {
        const paymentDate = new Date(firstRepaymentDate);
        
        // Handle frequency case-insensitive (like DashboardTab)
        const frequency = (loan.repaymentFrequency || 'Monthly').toLowerCase();
        
        if (frequency.includes('month')) {
          paymentDate.setMonth(paymentDate.getMonth() + i);
        } else if (frequency.includes('week')) {
          paymentDate.setDate(paymentDate.getDate() + (i * 7));
        } else if (frequency.includes('daily')) {
          paymentDate.setDate(paymentDate.getDate() + i);
        } else {
          paymentDate.setMonth(paymentDate.getMonth() + (i * 12));
        }
        
        paymentDate.setHours(0, 0, 0, 0);

        let status: 'Paid' | 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming' = 'Upcoming';
        const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const totalPaidInstallments = Math.floor((loan.paidAmount || 0) / (installmentAmount || 1));
        
        if (i < totalPaidInstallments) {
          status = 'Paid';
        } else if (paymentDate < today) {
          status = 'Overdue';
        } else if (paymentDate.getTime() === today.getTime()) {
          status = 'Due Today';
        } else if (daysDiff >= -7 && daysDiff < 0) {
          status = 'Due Soon';
        }

        schedule.push({
          paymentDate,
          loanId: loan.id,
          clientName: loan.clientName || '',
          installmentNumber: i + 1,
          installmentAmount,
          principalAmount: principalPerInstallment,
          interestAmount: interestPerInstallment,
          status,
          daysOverdue: status === 'Overdue' ? daysDiff : 0
        });
      }
    });

    return schedule.sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime());
  };

  const repaymentSchedule = generateRepaymentSchedule();
  
  const overduePayments = repaymentSchedule.filter(p => p.status === 'Overdue');
  const dueTodayPayments = repaymentSchedule.filter(p => p.status === 'Due Today');
  const dueSoonPayments = repaymentSchedule.filter(p => p.status === 'Due Soon');
  const paidPayments = repaymentSchedule.filter(p => p.status === 'Paid');
  
  const overdueAmount = overduePayments.reduce((sum, p) => sum + p.installmentAmount, 0);
  const dueTodayAmount = dueTodayPayments.reduce((sum, p) => sum + p.installmentAmount, 0);
  const dueSoonAmount = dueSoonPayments.reduce((sum, p) => sum + p.installmentAmount, 0);

  // Calculate upcoming payments based on selected timeframe
  const getUpcomingPayments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let endDate = new Date(today);
    
    switch (upcomingPaymentsTimeframe) {
      case 'today':
        // Same day
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this-week':
        // Until end of current week (Sunday)
        const dayOfWeek = today.getDay();
        const daysUntilSunday = 7 - dayOfWeek;
        endDate.setDate(today.getDate() + daysUntilSunday);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'next-7-days':
        // Next 7 days from today
        endDate.setDate(today.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this-month':
        // Until end of current month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }
    
    return repaymentSchedule.filter(p => {
      const paymentDate = new Date(p.paymentDate);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate >= today && paymentDate <= endDate && p.status !== 'Paid';
    });
  };

  const upcomingPayments = getUpcomingPayments();
  const upcomingPaymentsAmount = upcomingPayments.reduce((sum, p) => sum + p.installmentAmount, 0);

  // AI Insights data for each card type
  const getAIInsights = (cardType: string, data?: any) => {
    const insights: Record<string, { icon: string; title: string; description: string; trend?: 'up' | 'down' | 'neutral' }[]> = {
      'total-loans': [
        { icon: '📈', title: 'Growth Trend', description: `${data?.growth || 12}% increase compared to last month`, trend: 'up' },
        { icon: '🎯', title: 'Target Progress', description: `${data?.targetProgress || 87}% of quarterly loan disbursement target achieved`, trend: 'up' }
      ],
      'total-amount': [
        { icon: '💰', title: 'Portfolio Value', description: `${currencyCode} ${((data?.total || 0) / 1000000).toFixed(2)}M represents strong portfolio health`, trend: 'neutral' },
        { icon: '📊', title: 'Average Loan Size', description: `${currencyCode} ${(data?.avgSize || 97692).toLocaleString()} per loan, ${data?.avgChange || 5}% higher than industry average`, trend: 'up' }
      ],
      'outstanding': [
        { icon: '⚠️', title: 'Collection Priority', description: `${data?.highRisk || 15}% of outstanding loans require immediate attention`, trend: 'down' },
        { icon: '📉', title: 'Recovery Rate', description: `${data?.recoveryRate || 78}% collection efficiency in the last 30 days`, trend: 'up' }
      ],
      'active-loans': [
        { icon: '✅', title: 'Healthy Portfolio', description: `${data?.onTime || 92}% of active loans are making timely payments`, trend: 'up' },
        { icon: '🔄', title: 'Repayment Velocity', description: `Average ${data?.avgDays || 3.2} days early payment across active portfolio`, trend: 'up' }
      ],
      'pending-review': [
        { icon: '⏱️', title: 'Processing Time', description: `Average review time is ${data?.avgReviewTime || 2.1} days, ${data?.faster || 18}% faster than last month`, trend: 'up' },
        { icon: '🎓', title: 'Approval Rate', description: `${data?.approvalRate || 73}% of reviewed applications get approved`, trend: 'neutral' }
      ],
      'pending-disbursement': [
        { icon: '💳', title: 'Cash Flow Ready', description: `${currencyCode} ${((data?.readyAmount || 0) / 1000000).toFixed(2)}M approved and ready for disbursement`, trend: 'neutral' },
        { icon: '⚡', title: 'Disbursement Speed', description: `Average ${data?.avgDisbursementTime || 1.3} days from approval to disbursement`, trend: 'up' }
      ],
      'paid-loans': [
        { icon: '🌟', title: 'Success Rate', description: `${data?.successRate || 96}% of loans fully repaid with zero defaults`, trend: 'up' },
        { icon: '🔁', title: 'Repeat Customers', description: `${data?.repeatRate || 68}% of paid borrowers have applied for new loans`, trend: 'up' }
      ],
      'defaults': [
        { icon: '🚨', title: 'Risk Mitigation', description: `${data?.mitigationSuccess || 45}% of at-risk loans recovered before default`, trend: 'up' },
        { icon: '📋', title: 'Recovery Action', description: `${data?.inRecovery || 2} loans currently in active recovery process`, trend: 'neutral' }
      ]
    };
    return insights[cardType] || [];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header - Premium fintech styling */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Loan Management</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage all loan applications and disbursements</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCalculator(true)}
            className="px-4 py-2.5 bg-[#0066FF] text-white rounded-xl hover:bg-[#0052CC] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <Calculator className="size-4" />
            Calculator
          </button>
          <button
            onClick={() => {
              if (!canCreateInTab('operations_loans')) {
                showPermissionError();
                return;
              }
              setShowNewLoanModal(true);
            }}
            className="px-4 py-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="size-4" />
            Add Loan
          </button>
        </div>
      </div>

      {/* Upcoming Payments Summary - Modern card with subtle gradient */}
      <div className={`p-5 rounded-2xl border transition-all duration-200 ${
        isDark 
          ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700/40 shadow-lg shadow-blue-900/20' 
          : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-600/20' : 'bg-white shadow-sm'}`}>
                <Clock className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>
                  Upcoming Payments
                </p>
                <p className={`text-xs ${isDark ? 'text-blue-300/60' : 'text-blue-600/70'}`}>
                  Payments expected in selected timeframe
                </p>
              </div>
            </div>
            <div className={`h-12 w-px ${isDark ? 'bg-blue-600/30' : 'bg-blue-300/50'}`} />
            <div>
              <p className={`text-3xl font-bold ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>
                {(upcomingPayments?.length || 0).toLocaleString()}
              </p>
              <p className={`text-xs font-medium ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
                Payment{upcomingPayments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className={`h-12 w-px ${isDark ? 'bg-blue-600/30' : 'bg-blue-300/50'}`} />
            <div>
              <p className={`text-3xl font-bold ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>
                {currencySymbol} {upcomingPaymentsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs font-medium ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
                Total Expected
              </p>
            </div>
          </div>
          
          {/* Timeframe Selector - Premium pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setUpcomingPaymentsTimeframe('today')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                upcomingPaymentsTimeframe === 'today'
                  ? 'bg-[#0066FF] text-white shadow-md' 
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 shadow-sm'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setUpcomingPaymentsTimeframe('this-week')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                upcomingPaymentsTimeframe === 'this-week'
                  ? 'bg-[#0066FF] text-white shadow-md' 
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 shadow-sm'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setUpcomingPaymentsTimeframe('next-7-days')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                upcomingPaymentsTimeframe === 'next-7-days'
                  ? 'bg-[#0066FF] text-white shadow-md' 
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 shadow-sm'
              }`}
            >
              Next 7 Days
            </button>
            <button
              onClick={() => setUpcomingPaymentsTimeframe('this-month')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                upcomingPaymentsTimeframe === 'this-month'
                  ? 'bg-[#0066FF] text-white shadow-md' 
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 shadow-sm'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tabs - Clean modern tabs with active indicator */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
        <div className="flex whitespace-nowrap gap-1">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'all'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            View All
          </button>
          <button
            onClick={() => setActiveSubTab('pending-review')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'pending-review'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveSubTab('pending-disbursement')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'pending-disbursement'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Pending Disbursement
          </button>
          <button
            onClick={() => setActiveSubTab('active')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'active'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveSubTab('settled')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'settled'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setActiveSubTab('defaulted')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'defaulted'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Defaulted
          </button>
          <button
            onClick={() => setActiveSubTab('due')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'due'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Due / Upcoming Loans (within 7 days)
          </button>
          <button
            onClick={() => setActiveSubTab('no-repayments')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'no-repayments'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            No Repayments
          </button>
          <button
            onClick={() => setActiveSubTab('principal')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'principal'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Principal Outstanding
          </button>
          <button
            onClick={() => setActiveSubTab('1-month-late')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === '1-month-late'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            1 Month Late
          </button>
          <button
            onClick={() => setActiveSubTab('3-months-late')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === '3-months-late'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            3 Months Late
          </button>
          <button
            onClick={() => setActiveSubTab('guarantors')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'guarantors'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Guarantors
          </button>
          <button
            onClick={() => setActiveSubTab('comments')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'comments'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveSubTab('repayment-schedule')}
            className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 transition-all duration-200 ${
              activeSubTab === 'repayment-schedule'
                ? 'border-[#22C55E] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Repayment Schedule
          </button>
        </div>
      </div>

      {/* Summary Cards (for loan views) */}
      {activeSubTab !== 'guarantors' && activeSubTab !== 'comments' && activeSubTab !== 'repayment-schedule' && (() => {
        // ✅ Show statistics for the CURRENT TAB's filtered loans, not all loans
        const tabFilteredLoans = filteredLoans || []; // Use filteredLoans which respects the active sub-tab
        
        // For "View All" tab, show total count of ALL loans (including pending/approved)
        // For other tabs, show disbursed loans only
        const allActiveDisbursedLoans = activeSubTab === 'all' 
          ? tabFilteredLoans 
          : tabFilteredLoans.filter(l => {
              const status = (l.status || '').toLowerCase().trim();
              return status !== 'pending' && status !== 'approved' && status !== 'rejected' && status !== '';
            });
        
        // For outstanding calculation, calculate dynamically based on amounts
        const loansWithOutstanding = allActiveDisbursedLoans.filter(l => {
          const principalAmt = l.principalAmount || 0;
          const paidAmt = l.paidAmount || 0;
          const totalInterest = l.totalInterest || 0;
          const calculatedOutstanding = principalAmt + totalInterest - paidAmt;
          // Include loan if it has outstanding balance
          return calculatedOutstanding > 0;
        });
        
        // Active loans: those with Active or In Arrears status
        const activeLoans = allActiveDisbursedLoans.filter(l => {
          const status = (l.status || '').toLowerCase().trim();
          return status === 'active' || status === 'in arrears';
        });
        
        // Pending Review loans (application submitted but not yet reviewed)
        const pendingReviewLoans = loans.filter(l => {
          const status = (l.status || '').toLowerCase().trim();
          return status === 'pending' || status === 'pending review' || status === 'submitted';
        });
        
        // Pending Disbursement loans (approved but not yet disbursed)
        const pendingDisbursementLoans = loans.filter(l => {
          const status = (l.status || '').toLowerCase().trim();
          return status === 'approved' && !l.disbursementDate;
        });
        
        // Paid loans
        const paidLoans = loans.filter(l => {
          const status = (l.status || '').toLowerCase().trim();
          return status === 'paid' || status === 'fully paid' || status === 'closed';
        });
        
        // Defaulted loans (loans that are severely overdue)
        const defaultedLoans = loans.filter(l => {
          const status = (l.status || '').toLowerCase().trim();
          return status === 'defaulted' || status === 'default' || status === 'written off';
        });
        
        return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {/* Total Loans - Blue accent */}
          <div 
            ref={totalLoansRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'total-loans' ? null : 'total-loans')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700/30 hover:border-blue-600/50' : 'bg-gradient-to-br from-blue-50 to-white border-blue-200/60 hover:border-blue-300 shadow-sm'
            } ${selectedInsightCard === 'total-loans' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-blue-300/70' : 'text-blue-600/70'}`}>Total Loans</p>
                <p className={`font-bold ${isDark ? 'text-blue-100' : 'text-blue-900'} text-[20px]`}>
                  {allActiveDisbursedLoans.length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                <FileText className={`size-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'total-loans' && (
              <AIInsightPopover
                insights={getAIInsights('total-loans', { growth: 12, targetProgress: 87 })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={totalLoansRef}
                cardTitle="Total Loans"
              />
            )}
          </div>

          {/* Total Amount - Blue accent */}
          <div 
            ref={totalAmountRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'total-amount' ? null : 'total-amount')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700/30 hover:border-blue-600/50' : 'bg-gradient-to-br from-blue-50 to-white border-blue-200/60 hover:border-blue-300 shadow-sm'
            } ${selectedInsightCard === 'total-amount' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-blue-300/70' : 'text-blue-600/70'}`}>Total Amount</p>
                <p className={`font-bold ${isDark ? 'text-blue-100' : 'text-blue-900'} text-[20px]`}>
                  KES {(allActiveDisbursedLoans.reduce((sum, l) => sum + (l.principalAmount || l.approvedAmount || l.requestedAmount || 0), 0) / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                <DollarSign className={`size-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'total-amount' && (
              <AIInsightPopover
                insights={getAIInsights('total-amount', { 
                  total: allActiveDisbursedLoans.reduce((sum, l) => sum + (l.principalAmount || l.approvedAmount || l.requestedAmount || 0), 0),
                  avgSize: 97692,
                  avgChange: 5
                })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={totalAmountRef}
                cardTitle="Total Amount"
              />
            )}
          </div>

          {/* Outstanding - Orange accent */}
          <div 
            ref={outstandingRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'outstanding' ? null : 'outstanding')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700/30 hover:border-orange-600/50' : 'bg-gradient-to-br from-orange-50 to-white border-orange-200/60 hover:border-orange-300 shadow-sm'
            } ${selectedInsightCard === 'outstanding' ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-orange-300/70' : 'text-orange-600/70'}`}>Outstanding</p>
                <p className={`font-bold ${isDark ? 'text-orange-100' : 'text-orange-900'} text-[20px]`}>
                  KES {((loansWithOutstanding.reduce((sum, l) => sum + Math.abs(l.outstandingBalance || 0), 0)) / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-600/20' : 'bg-orange-100'}`}>
                <TrendingUp className={`size-4 ${isDark ? 'text-orange-300' : 'text-orange-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'outstanding' && (
              <AIInsightPopover
                insights={getAIInsights('outstanding', { 
                  highRisk: 15,
                  recoveryRate: 78
                })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={outstandingRef}
                cardTitle="Outstanding"
              />
            )}
          </div>

          {/* Active Loans - Green accent */}
          <div 
            ref={activeLoansRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'active-loans' ? null : 'active-loans')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-700/30 hover:border-emerald-600/50' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200/60 hover:border-emerald-300 shadow-sm'
            } ${selectedInsightCard === 'active-loans' ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-300/70' : 'text-emerald-600/70'}`}>
                  {activeSubTab === 'due' ? 'Due / Upcoming' : 
                   activeSubTab === 'no-repayments' ? 'No Payments' :
                   activeSubTab === '1-month-late' ? '1 Month Late' :
                   activeSubTab === '3-months-late' ? '3+ Months Late' :
                   'Active Loans'}
                </p>
                <p className={`font-bold ${isDark ? 'text-emerald-100' : 'text-emerald-900'} text-[16px]`}>
                  {activeLoans.length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-600/20' : 'bg-emerald-100'}`}>
                <CheckCircle className={`size-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'active-loans' && (
              <AIInsightPopover
                insights={getAIInsights('active-loans', { 
                  onTime: 92,
                  avgDays: 3.2
                })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={activeLoansRef}
                cardTitle="Active Loans"
              />
            )}
          </div>

          {/* Pending Review - Amber accent */}
          <div 
            ref={pendingReviewRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'pending-review' ? null : 'pending-review')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-700/30 hover:border-amber-600/50' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200/60 hover:border-amber-300 shadow-sm'
            } ${selectedInsightCard === 'pending-review' ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-amber-300/70' : 'text-amber-600/70'}`}>Pending Review</p>
                <p className={`font-bold ${isDark ? 'text-amber-100' : 'text-amber-900'} text-[20px]`}>
                  {pendingReviewLoans.length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-600/20' : 'bg-amber-100'}`}>
                <Clock className={`size-4 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'pending-review' && (
              <AIInsightPopover
                insights={getAIInsights('pending-review', { 
                  avgReviewTime: 2.1,
                  faster: 18,
                  approvalRate: 73
                })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={pendingReviewRef}
                cardTitle="Pending Review"
              />
            )}
          </div>

          {/* Pending Disbursement - Cyan accent */}
          <div 
            ref={pendingDisbursementRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'pending-disbursement' ? null : 'pending-disbursement')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-700/30 hover:border-cyan-600/50' : 'bg-gradient-to-br from-cyan-50 to-white border-cyan-200/60 hover:border-cyan-300 shadow-sm'
            } ${selectedInsightCard === 'pending-disbursement' ? 'ring-2 ring-cyan-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-cyan-300/70' : 'text-cyan-600/70'}`}>Pending Disbursement</p>
                <p className={`font-bold ${isDark ? 'text-cyan-100' : 'text-cyan-900'} text-[20px]`}>
                  {pendingDisbursementLoans.length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-600/20' : 'bg-cyan-100'}`}>
                <Wallet className={`size-4 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'pending-disbursement' && (
              <AIInsightPopover
                insights={getAIInsights('pending-disbursement', { 
                  readyAmount: 0,
                  avgDisbursementTime: 1.3
                })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={pendingDisbursementRef}
                cardTitle="Pending Disbursement"
              />
            )}
          </div>

          {/* Paid Loans - Green accent */}
          <div 
            ref={paidLoansRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'paid-loans' ? null : 'paid-loans')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-700/30 hover:border-emerald-600/50' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200/60 hover:border-emerald-300 shadow-sm'
            } ${selectedInsightCard === 'paid-loans' ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-300/70' : 'text-emerald-600/70'}`}>Paid Loans</p>
                <p className={`font-bold ${isDark ? 'text-emerald-100' : 'text-emerald-900'} text-[20px]`}>
                  {paidLoans.length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-600/20' : 'bg-emerald-100'}`}>
                <CheckCircle className={`size-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'paid-loans' && (
              <AIInsightPopover
                insights={getAIInsights('paid-loans', { 
                  successRate: 96,
                  repeatRate: 68
                })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={paidLoansRef}
                cardTitle="Paid Loans"
              />
            )}
          </div>

          {/* Defaults - Red accent */}
          <div 
            ref={defaultsRef}
            onClick={() => setSelectedInsightCard(selectedInsightCard === 'defaults' ? null : 'defaults')}
            className={`relative p-5 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isDark ? 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700/30 hover:border-red-600/50' : 'bg-gradient-to-br from-red-50 to-white border-red-200/60 hover:border-red-300 shadow-sm'
            } ${selectedInsightCard === 'defaults' ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-red-300/70' : 'text-red-600/70'}`}>Defaults</p>
                <p className={`font-bold ${isDark ? 'text-red-100' : 'text-red-900'} text-[20px]`}>
                  {defaultedLoans.length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-red-600/20' : 'bg-red-100'}`}>
                <XCircle className={`size-4 ${isDark ? 'text-red-300' : 'text-red-600'}`} />
              </div>
            </div>
            {selectedInsightCard === 'defaults' && (
              <AIInsightPopover
                insights={getAIInsights('defaults', { 
                  mitigationSuccess: 45,
                  inRecovery: 2
                })}
                onClose={() => setSelectedInsightCard(null)}
                targetRef={defaultsRef}
                cardTitle="Defaults"
              />
            )}
          </div>
        </div>
        );
      })()}

      {/* Search and Filters (for loan views) - Modern styling */}
      {activeSubTab !== 'guarantors' && activeSubTab !== 'comments' && activeSubTab !== 'repayment-schedule' && (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className={`size-4 absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by loan ID or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF] text-sm transition-all duration-200 ${
                  isDark ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white'
                }`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF] text-sm font-medium transition-all duration-200 ${
                isDark ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
              }`}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Active">Active</option>
              <option value="Paid">Paid</option>
              <option value="Closed">Closed</option>
              <option value="Written Off">Written Off</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
      )}

      {/* Loans List/Grid */}
      {activeSubTab !== 'guarantors' && activeSubTab !== 'comments' && activeSubTab !== 'repayment-schedule' && (
        <>
          {viewMode === 'tile' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLoans.map(loan => {
                const client = clients.find(c => c.id === loan.clientId);
                const principalAmt = loan.principalAmount || 0;
                const paidAmt = loan.paidAmount || 0;
                // ✅ Smart calculation: Use DB if it has a discount, otherwise use formula
                const calculatedInterest = calculateCorrectInterest(loan);
                const calculatedTotal = principalAmt + calculatedInterest;
                const dbTotal = loan.totalRepayable || loan.totalRepayment || 0;
                const tolerance = calculatedTotal * 0.01;
                const hasDiscount = dbTotal > 0 && dbTotal < (calculatedTotal - tolerance);
                const totalRepayable = hasDiscount ? dbTotal : calculatedTotal;
                // ✅ ALWAYS recalculate outstanding based on corrected total (don't trust DB balance)
                const outstandingAmt = Math.max(0, totalRepayable - paidAmt);
                const progress = totalRepayable > 0 ? (paidAmt / totalRepayable) * 100 : 0;
                
                // Convert "Settled" to "Paid" for display
                const displayStatus = loan.status?.toLowerCase() === 'settled' ? 'Paid' : loan.status;
                
                return (
                  <div
                    key={loan.id}
                    onClick={() => setDetailModalLoan(loan.id)}
                    className={`p-5 rounded-lg border cursor-pointer hover:shadow-lg transition-all ${
                      isDark ? 'bg-gray-800 border-gray-700 hover:border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{loan.loanNumber || loan.id}</p>
                        <p className={isDark ? 'text-white' : 'text-gray-900'}>{client?.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(displayStatus)}`}>
                        {displayStatus}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loan Amount</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>KES {principalAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Paid</span>
                        <span className="text-emerald-600 dark:text-emerald-400">KES {paidAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Outstanding</span>
                        <span className="text-orange-600 dark:text-orange-400">
                          KES {outstandingAmt.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>Progress</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{progress.toFixed(0)}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {(loan.daysInArrears || 0) > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="size-4" />
                        <span>{loan.daysInArrears} days in arrears</span>
                      </div>
                    )}

                    {loan.status === 'Pending' && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLoan(loan.id, loan.status, client?.name);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4" />
                          Delete Loan
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-gray-50/80'}`}>
                <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activeSubTab === 'all' ? 'All Loans' :
                   activeSubTab === 'pending-review' ? 'Pending Review' :
                   activeSubTab === 'pending-disbursement' ? 'Pending Disbursement' :
                   activeSubTab === 'active' ? 'Active Loans' :
                   activeSubTab === 'settled' ? 'Paid Loans' :
                   activeSubTab === 'defaulted' ? 'Defaulted Loans' :
                   activeSubTab === 'due' ? 'Due / Upcoming Loans (within 7 days)' :
                   activeSubTab === 'no-repayments' ? 'Loans with No Repayments' :
                   activeSubTab === 'principal' ? 'Principal Outstanding' :
                   activeSubTab === '1-month-late' ? '1 Month Late Loans' :
                   activeSubTab === '3-months-late' ? '3+ Months Late Loans' :
                   'Loans'}{activeSubTab === 'due' ? '' : ` (${filteredLoans.length})`}
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th 
                        className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('loanId')}
                      >
                        <div className="flex items-center gap-1.5">
                          Loan ID
                          {getSortIcon('loanId')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('requestDate')}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          Request Date
                          {getSortIcon('requestDate')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('clientName')}
                      >
                        <div className="flex items-center gap-1.5">
                          Client Name
                          {getSortIcon('clientName')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('clientId')}
                      >
                        <div className="flex items-center gap-1.5">
                          Client ID
                          {getSortIcon('clientId')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Amount borrowed
                          {getSortIcon('amount')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Processing Fee
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('interest')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Interest
                          {getSortIcon('interest')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('paid')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Paid
                          {getSortIcon('paid')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('outstanding')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Outstanding
                          {getSortIcon('outstanding')}
                        </div>
                      </th>
                      <th 
                        className={`px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th className={`px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLoans.map(loan => {
                      const client = clients.find(c => c.id === loan.clientId);
                      const principalAmt = loan.principalAmount || 0;
                      const paidAmt = loan.paidAmount || 0;
                      // ✅ Smart calculation: Use DB if it has a discount, otherwise use formula
                      const calculatedInterest = calculateCorrectInterest(loan);
                      
                      // 🔍 DEBUG for LN001
                      if (loan.loanNumber === 'LN001') {
                        const debugInfo = {
                          principal: principalAmt,
                          rate: loan.interestRate,
                          term: loan.term,
                          termPeriod: loan.termPeriod,
                          loanTerm: loan.loanTerm,
                          calculatedInterest: calculatedInterest,
                          formula: `${principalAmt} × ${loan.interestRate} × ${loan.term || loan.termPeriod || loan.loanTerm || 1} / 100 = ${calculatedInterest}`
                        };
                      }
                      
                      const calculatedTotal = principalAmt + calculatedInterest;
                      const dbTotal = loan.totalRepayable || loan.totalRepayment || 0;
                      const tolerance = calculatedTotal * 0.01;
                      const hasDiscount = dbTotal > 0 && dbTotal < (calculatedTotal - tolerance);
                      const totalRepayable = hasDiscount ? dbTotal : calculatedTotal;
                      // ✅ ALWAYS use calculated interest (never negative)
                      const interestAmount = calculatedInterest;
                      // ✅ ALWAYS recalculate outstanding based on corrected total (don't trust DB balance)
                      const outstandingAmt = Math.max(0, totalRepayable - paidAmt);
                      // Determine actual display status: if outstanding is 0 or less, show "Paid"
                      // Also convert "Settled" to "Paid"
                      let displayStatus = loan.status;
                      if (outstandingAmt <= 0) {
                        displayStatus = 'Paid';
                      } else if (loan.status?.toLowerCase() === 'settled') {
                        displayStatus = 'Paid';
                      }
                      
                      return (
                        <tr key={loan.id} className={`border-t ${isDark ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'} transition-colors duration-150`}>
                          <td className={`px-5 py-3.5 text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{loan.loanNumber || loan.id}</td>
                          <td className={`px-5 py-3.5 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {loan.applicationDate || loan.createdDate || '-'}
                          </td>
                          <td className={`px-5 py-3.5 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                            {loan.clientName || client?.name || client?.firstName + ' ' + client?.lastName || 'N/A'}
                          </td>
                          <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {client?.clientNumber || client?.client_number || loan.clientId || 'N/A'}
                          </td>
                          <td className={`px-5 py-3.5 text-right text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                            {principalAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className={`px-5 py-3.5 text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {(loan.processing_fee || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className={`px-5 py-3.5 text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {interestAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className={`px-5 py-3.5 text-right text-sm font-semibold text-emerald-700 dark:text-emerald-400`}>
                            {paidAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className={`px-5 py-3.5 text-right text-sm font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            {outstandingAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="px-5 py-3.5 text-center"><span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>{displayStatus}</span></td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex gap-2 justify-center items-center flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDetailModalLoan(loan.id);
                                }}
                                className="dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs cursor-pointer hover:underline text-emerald-700"
                              >
                                View
                              </button>
                              {loan.status === 'Pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!canEditInTab('operations_loans')) {
                                        showPermissionError();
                                        return;
                                      }
                                      setEditingLoanId(loan.id);
                                      setShowNewLoanModal(true);
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs flex items-center gap-1"
                                    title="Edit loan"
                                  >
                                    <Edit className="size-3" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteLoan(loan.id, loan.status, client?.name);
                                    }}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs flex items-center gap-1"
                                    title="Delete loan"
                                  >
                                    <Trash2 className="size-3" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className={`sticky bottom-0 ${isDark ? 'bg-gray-800 border-t-2 border-gray-600' : 'bg-gray-100 border-t-2 border-gray-300'}`}>
                    <tr className="font-semibold">
                      <td className={`px-4 py-3 text-xs ${isDark ? 'text-gray-200' : 'text-gray-900'}`} colSpan={4}>
                        TOTAL
                      </td>
                      <td className={`px-4 py-3 text-right text-xs ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        KES {sortedLoans.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className={`px-4 py-3 text-right text-xs ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        KES {sortedLoans.reduce((sum, loan) => sum + (loan.processing_fee || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className={`px-4 py-3 text-right text-xs ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        KES {sortedLoans.reduce((sum, loan) => sum + calculateCorrectInterest(loan), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className={`px-4 py-3 text-right text-xs text-emerald-800 dark:text-emerald-500 font-semibold`}>
                        KES {sortedLoans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className={`px-4 py-3 text-right text-xs text-orange-600 dark:text-orange-400 font-semibold`}>
                        KES {sortedLoans.reduce((sum, loan) => {
                          const principalAmt = loan.principalAmount || 0;
                          const paidAmt = loan.paidAmount || 0;
                          const correctInterest = calculateCorrectInterest(loan);
                          // ✅ Apply SAME logic as individual rows: use DB total if it has discount
                          const calculatedTotal = principalAmt + correctInterest;
                          const dbTotal = loan.totalRepayable || loan.totalRepayment || 0;
                          const tolerance = calculatedTotal * 0.01;
                          const hasDiscount = dbTotal > 0 && dbTotal < (calculatedTotal - tolerance);
                          const totalRepayable = hasDiscount ? dbTotal : calculatedTotal;
                          const outstandingAmt = Math.max(0, totalRepayable - paidAmt);
                          return sum + outstandingAmt;
                        }, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className={`px-4 py-3 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`} colSpan={2}>
                        {sortedLoans.length} {sortedLoans.length === 1 ? 'Loan' : 'Loans'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Guarantors Tab */}
      {activeSubTab === 'guarantors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Guarantors</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {loanGuarantors.reduce((sum, lg) => sum + lg.guarantors.length, 0)}
                  </p>
                </div>
                <UserCheck className="size-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loans with Guarantors</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {loanGuarantors.length}
                  </p>
                </div>
                <FileText className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Loan Amount</p>
                  <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    KES {(loanGuarantors.reduce((sum, lg) => sum + lg.loanAmount, 0) / 1000000).toFixed(2)}M
                  </p>
                </div>
                <DollarSign className="size-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Loan Guarantors ({loanGuarantors.length})</h3>
            </div>
            {loanGuarantors.length === 0 ? (
              <div className="p-8 text-center">
                <UserCheck className={`size-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No loans with guarantors found</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Guarantors will appear here when loans include guarantor information</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan ID</th>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client</th>
                      <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan Amount</th>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Guarantor Name</th>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ID Number</th>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Relationship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanGuarantors.flatMap(lg => 
                      lg.guarantors.map((guarantor, index) => (
                        <tr key={`${lg.loanId}-${index}`} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                          {index === 0 && (
                            <>
                              <td rowSpan={lg.guarantors.length} className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{lg.loanId}</td>
                              <td rowSpan={lg.guarantors.length} className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{lg.clientName}</td>
                              <td rowSpan={lg.guarantors.length} className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                KES {lg.loanAmount.toLocaleString()}
                              </td>
                            </>
                          )}
                          <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{guarantor.name}</td>
                          <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{guarantor.phone}</td>
                          <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{guarantor.idNumber || 'N/A'}</td>
                          <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{guarantor.relationship || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Comments Tab */}
      {activeSubTab === 'comments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
              <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Comments</p>
                    <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {loanComments.length}
                    </p>
                  </div>
                  <MessageSquare className="size-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loans with Comments</p>
                    <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {[...new Set(loanComments.map(c => c.loanId))].length}
                    </p>
                  </div>
                  <FileText className="size-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddCommentModal(true)}
              className="px-[16px] py-[7px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="size-4" />
              Add Comment
            </button>
          </div>

          {loanComments.length === 0 ? (
            <div className={`p-12 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <MessageSquare className={`size-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>No Comments Yet</p>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Start adding comments to track important notes and updates on loan applications
              </p>
              <button
                onClick={() => setShowAddCommentModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="size-4" />
                Add First Comment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {loanComments.map(comment => (
                <div key={comment.id} className={`p-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <MessageSquare className={`size-4 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{comment.clientName}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {comment.loanId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{comment.date}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{comment.time}</p>
                    </div>
                  </div>
                  <p className={`text-xs mb-2 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{comment.comment}</p>
                  <div className="flex items-center gap-1">
                    <User className={`size-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`} />
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      By: <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>{comment.commentedBy}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Repayment Schedule Tab */}
      {activeSubTab === 'repayment-schedule' && (
        <div className="space-y-6">
          {/* Status Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                    <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>Overdue</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-200 text-red-800'}`}>
                    {overduePayments.length}
                  </span>
                </div>
                <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  KES {overdueAmount.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Not paid yet
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-orange-600 dark:text-orange-400" />
                    <p className={`text-xs ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Due Today</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-200 text-orange-800'}`}>
                    {dueTodayPayments.length}
                  </span>
                </div>
                <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  KES {dueTodayAmount.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Expected today
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-blue-600 dark:text-blue-400" />
                    <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Due Soon</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-200 text-blue-800'}`}>
                    {dueSoonPayments.length}
                  </span>
                </div>
                <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  KES {dueSoonAmount.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Next 7 days
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-700' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
                    <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Paid</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-200 text-emerald-800'}`}>
                    {paidPayments.length}
                  </span>
                </div>
                <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {paidPayments.length}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  of {repaymentSchedule.length} installments
                </p>
              </div>
            </div>

          {/* Date-Based Repayment Schedule Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Payment Schedule by Date ({repaymentSchedule.length} installments)</h3>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment Date</th>
                    <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client</th>
                    <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan ID</th>
                    <th className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Inst. #</th>
                    <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                    <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Principal</th>
                    <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Interest</th>
                    <th className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {repaymentSchedule.map((payment, index) => {
                    const getPaymentStatusColor = (status: string) => {
                      switch (status) {
                        case 'Paid':
                          return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
                        case 'Overdue':
                          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
                        case 'Due Today':
                          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
                        case 'Due Soon':
                          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
                        default:
                          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                      }
                    };

                    const getRowColor = (status: string) => {
                      switch (status) {
                        case 'Overdue':
                          return isDark ? 'bg-red-900/10 border-red-800' : 'bg-red-50 border-red-100';
                        case 'Due Today':
                          return isDark ? 'bg-orange-900/10 border-orange-800' : 'bg-orange-50 border-orange-100';
                        default:
                          return isDark ? 'border-gray-700' : 'border-gray-100';
                      }
                    };

                    return (
                      <tr key={`${payment.loanId}-${index}`} className={`border-t ${getRowColor(payment.status)} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {payment.paymentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{payment.clientName}</td>
                        <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{payment.loanId}</td>
                        <td className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{payment.installmentNumber}</td>
                        <td className={`px-4 py-2 text-right text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          KES {payment.installmentAmount.toLocaleString()}
                        </td>
                        <td className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {payment.principalAmount.toLocaleString()}
                        </td>
                        <td className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {payment.interestAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className={`px-4 py-2 text-center text-xs ${
                          payment.status === 'Overdue' 
                            ? 'text-red-600 dark:text-red-400' 
                            : isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {payment.status === 'Overdue' ? `+${payment.daysOverdue}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          title="Bulk Upload Loans"
          acceptedFormats=".csv,.xlsx"
        />
      )}

      {detailModalLoan && (() => {
        return (
          <ComprehensiveLoanDetailsModal
            loanId={detailModalLoan}
            onClose={() => {
              setDetailModalLoan(null);
            }}
          />
        );
      })()}

      {showNewLoanModal && (
        <NewLoanModal
          onClose={() => {
            setShowNewLoanModal(false);
            setEditingLoanId(null);
          }}
          onSubmit={handleNewLoan}
          editingLoanId={editingLoanId}
        />
      )}

      {showCalculator && (
        <LoanCalculatorModal
          onClose={() => setShowCalculator(false)}
        />
      )}

      {showRepaymentSchedule && (() => {
        const loan = loans.find(l => l.id === showRepaymentSchedule);
        return loan ? (
          <RepaymentScheduleModal
            loan={loan}
            onClose={() => setShowRepaymentSchedule(null)}
          />
        ) : null;
      })()}

      {showDisbursementModal && (() => {
        const loan = loans.find(l => l.id === showDisbursementModal);
        return loan ? (
          <DisbursementModal
            loan={loan}
            onClose={() => setShowDisbursementModal(null)}
          />
        ) : null;
      })()}

      {/* Add Comment Modal */}
      {showAddCommentModal && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}
          onClick={() => {
            setShowAddCommentModal(false);
            setCommentLoanId('');
            setCommentText('');
          }}
        >
          <div 
            className={`rounded-lg shadow-xl w-full max-w-md ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Add Loan Comment</h3>
                <button
                  onClick={() => {
                    setShowAddCommentModal(false);
                    setCommentLoanId('');
                    setCommentText('');
                  }}
                  className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan ID</label>
                  <select 
                    value={commentLoanId}
                    onChange={(e) => setCommentLoanId(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select loan...</option>
                    {loans.map(loan => {
                      const client = clients.find(c => c.id === loan.clientId);
                      return (
                        <option key={loan.id} value={loan.id}>
                          {loan.loanNumber || loan.id} - {client?.name || 'Unknown Client'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Comment</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                    }`}
                    rows={4}
                    placeholder="Enter comment..."
                  />
                </div>
                <button 
                  onClick={handleAddComment}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && loanToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cancelDeleteLoan}
        >
          <div 
            className={`rounded-lg shadow-xl w-full max-w-md ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
            style={{
              backgroundColor: isDark ? '#111120' : '#ffffff',
              borderColor: isDark ? '#1e2f42' : '#e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header with Icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Delete Loan
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={cancelDeleteLoan}
                  className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Loan Details */}
              <div className={`p-4 rounded-lg mb-6 ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Loan ID:
                    </span>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {loanToDelete.id}
                    </span>
                  </div>
                  {loanToDelete.clientName && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Client:
                      </span>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loanToDelete.clientName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Status:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {loanToDelete.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className={`p-3 rounded-lg mb-6 border-l-4 border-red-500 ${
                isDark ? 'bg-red-900/20' : 'bg-red-50'
              }`}>
                <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                  Are you sure you want to delete this loan? All associated data including documents, guarantors, and collateral information will be permanently removed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteLoan}
                  className={`flex-1 px-4 py-2.5 rounded-lg border transition-colors ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteLoan}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="size-4" />
                  Delete Loan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}