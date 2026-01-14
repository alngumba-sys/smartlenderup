import { useState } from 'react';
import { Search, Plus, Calendar, AlertCircle, CheckCircle, XCircle, DollarSign, TrendingUp, PercentIcon, Wallet, User, Calculator, Upload, X, Info, Filter, Clock, MessageSquare, UserCheck, FileText, Send, Trash2 } from 'lucide-react';
import { generateInstallments, type LoanDocument, type Guarantor, type Collateral } from '../../data/dummyData';
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

// ✨ Professional redesign: Compact tables + Expected payments analytics
export function LoansTab() {
  const { isDark } = useTheme();
  const { 
    loans, 
    clients, 
    loanProducts, 
    addLoan,
    deleteLoan,
    loanDocuments,
    addLoanDocument,
    guarantors,
    addGuarantor,
    collaterals,
    addCollateral
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
  const [showCalculator, setShowCalculator] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [selectedLoanForComment, setSelectedLoanForComment] = useState<string | null>(null);
  const [showRepaymentSchedule, setShowRepaymentSchedule] = useState<string | null>(null);
  const [showDisbursementModal, setShowDisbursementModal] = useState<string | null>(null);
  
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
    const isConnected = await ensureSupabaseConnection('create loan application');
    if (!isConnected) {
      return; // Block the operation if offline
    }

    console.log('New loan created:', loanData);
    
    const client = clients.find(c => c.id === loanData.clientId);
    const product = loanProducts.find(p => p.id === loanData.productId);
    
    // Calculate loan details
    const principalAmount = parseFloat(loanData.principalAmount) || 0;
    const interestRate = parseFloat(loanData.interestRate) || 0;
    const term = parseInt(loanData.loanTerm) || 12;
    const termUnit = loanData.termUnit || 'Months';
    
    // Calculate total interest and repayable amount
    let totalInterest = 0;
    let installmentAmount = 0;
    const numberOfInstallments = termUnit === 'Months' ? term : 
                                  termUnit === 'Weeks' ? Math.ceil(term / 4) : 
                                  termUnit === 'Days' ? Math.ceil(term / 30) : term;
    
    if (product?.interestType === 'Flat') {
      totalInterest = principalAmount * (interestRate / 100);
      installmentAmount = (principalAmount + totalInterest) / numberOfInstallments;
    } else {
      // Reducing Balance
      const monthlyRate = (interestRate / 100) / 12;
      installmentAmount = (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfInstallments)) / 
                         (Math.pow(1 + monthlyRate, numberOfInstallments) - 1);
      totalInterest = (installmentAmount * numberOfInstallments) - principalAmount;
    }
    
    const totalRepayable = principalAmount + totalInterest;
    
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
      totalRepayable: Math.round(totalRepayable),
      installmentAmount: Math.round(installmentAmount),
      numberOfInstallments: numberOfInstallments,
      paidAmount: 0,
      outstandingBalance: Math.round(totalRepayable),
      principalOutstanding: principalAmount,
      interestOutstanding: Math.round(totalInterest),
      daysInArrears: 0,
      arrearsAmount: 0,
      overdueAmount: 0,
      penaltyAmount: 0,
      purpose: loanData.purpose || 'Not specified',
      createdBy: 'Current User',
      loanOfficer: 'Loan Officer',
      notes: loanData.notes || ''
    };
    
    // Save the loan to DataContext and get the generated ID
    const loanId = await addLoan(completeLoan);
    
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
      console.error('Error deleting loan:', error);
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

  // Calculate due date for loans
  const getDueDate = (loan: typeof loans[0]) => {
    const disbursementDate = new Date(loan.disbursementDate);
    const dueDate = new Date(disbursementDate);
    dueDate.setMonth(dueDate.getMonth() + (loan.termMonths || 12));
    return dueDate;
  };

  const isDueSoon = (loan: typeof loans[0]) => {
    const dueDate = getDueDate(loan);
    const today = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  };

  // Filter loans based on active sub-tab
  let displayLoans = loans;
  
  switch (activeSubTab) {
    case 'pending-review':
      displayLoans = loans.filter(loan => loan.status === 'Pending');
      break;
    case 'pending-disbursement':
      displayLoans = loans.filter(loan => loan.status === 'Approved');
      break;
    case 'active':
      displayLoans = loans.filter(loan => loan.status === 'Active' || loan.status === 'Disbursed');
      break;
    case 'settled':
      displayLoans = loans.filter(loan => loan.status === 'Fully Paid' || loan.status === 'Closed');
      break;
    case 'defaulted':
      displayLoans = loans.filter(loan => loan.status === 'Written Off' || (loan.daysInArrears || 0) >= 90);
      break;
    case 'due':
      displayLoans = loans.filter(loan => isDueSoon(loan) && loan.status === 'Active');
      break;
    case 'no-repayments':
      displayLoans = loans.filter(loan => (loan.paidAmount || 0) === 0 && loan.status === 'Active');
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
    const matchesSearch = loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesDate = isLoanInDateRange(loan);
    return matchesSearch && matchesStatus && matchesDate;
  }).reverse(); // Reverse to show newest loans first (at the top)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="size-5 text-emerald-600" />;
      case 'In Arrears':
        return <AlertCircle className="size-5 text-red-600" />;
      case 'Fully Paid':
        return <CheckCircle className="size-5 text-blue-600" />;
      default:
        return <XCircle className="size-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    // Normalize status for comparison
    const normalizedStatus = status.toLowerCase().trim();
    
    if (normalizedStatus === 'active') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    } else if (normalizedStatus === 'in arrears') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    } else if (normalizedStatus === 'fully paid') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (normalizedStatus === 'written off') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    } else if (normalizedStatus === 'pending') {
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    } else if (normalizedStatus === 'closed') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    } else if (normalizedStatus === 'approved') {
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
    } else if (normalizedStatus === 'disbursed') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
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

    loans.filter(loan => loan.status === 'Active' || loan.status === 'Disbursed').forEach(loan => {
      const firstRepaymentDate = new Date(loan.firstRepaymentDate);
      const installmentAmount = loan.installmentAmount || 0;
      const totalPrincipal = loan.principalAmount || 0;
      const totalInterest = loan.totalInterest || 0;
      
      const principalPerInstallment = totalPrincipal / loan.numberOfInstallments;
      const interestPerInstallment = totalInterest / loan.numberOfInstallments;

      for (let i = 0; i < loan.numberOfInstallments; i++) {
        const paymentDate = new Date(firstRepaymentDate);
        
        if (loan.repaymentFrequency === 'Monthly') {
          paymentDate.setMonth(paymentDate.getMonth() + i);
        } else if (loan.repaymentFrequency === 'Weekly') {
          paymentDate.setDate(paymentDate.getDate() + (i * 7));
        } else if (loan.repaymentFrequency === 'Daily') {
          paymentDate.setDate(paymentDate.getDate() + i);
        } else {
          paymentDate.setMonth(paymentDate.getMonth() + (i * 12));
        }
        
        paymentDate.setHours(0, 0, 0, 0);

        let status: 'Paid' | 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming' = 'Upcoming';
        const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const totalPaidInstallments = Math.floor((loan.paidAmount || 0) / installmentAmount);
        
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Loan Management</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage all loan applications and disbursements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalculator(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Calculator className="size-4" />
            Calculator
          </button>
          <button
            onClick={() => setShowNewLoanModal(true)}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
          >
            <Plus className="size-4" />
            Add Loan
          </button>
        </div>
      </div>

      {/* Sub-tabs - Single row with horizontal scrolling */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex whitespace-nowrap">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'all'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            View All
          </button>
          <button
            onClick={() => setActiveSubTab('pending-review')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'pending-review'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveSubTab('pending-disbursement')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'pending-disbursement'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Disbursement
          </button>
          <button
            onClick={() => setActiveSubTab('active')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'active'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveSubTab('settled')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'settled'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settled
          </button>
          <button
            onClick={() => setActiveSubTab('defaulted')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'defaulted'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Defaulted
          </button>
          <button
            onClick={() => setActiveSubTab('due')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'due'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Due
          </button>
          <button
            onClick={() => setActiveSubTab('no-repayments')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'no-repayments'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            No Repayments
          </button>
          <button
            onClick={() => setActiveSubTab('principal')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'principal'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Principal Outstanding
          </button>
          <button
            onClick={() => setActiveSubTab('1-month-late')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === '1-month-late'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            1 Month Late
          </button>
          <button
            onClick={() => setActiveSubTab('3-months-late')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === '3-months-late'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            3 Months Late
          </button>
          <button
            onClick={() => setActiveSubTab('guarantors')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'guarantors'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Guarantors
          </button>
          <button
            onClick={() => setActiveSubTab('comments')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'comments'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveSubTab('repayment-schedule')}
            className={`px-3 py-2 text-xs flex-shrink-0 ${
              activeSubTab === 'repayment-schedule'
                ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Repayment Schedule
          </button>
        </div>
      </div>

      {/* Summary Cards (for loan views) */}
      {activeSubTab !== 'guarantors' && activeSubTab !== 'comments' && activeSubTab !== 'repayment-schedule' && (() => {
        // Only count active/disbursed loans for metrics - USE ALL LOANS, not just filtered
        // ✅ Handle both status and loanStatus fields, case-insensitive
        const allActiveDisbursedLoans = loans.filter(l => {
          const status = (l.status || l.loanStatus || '').toLowerCase();
          return status === 'active' || status === 'disbursed';
        });
        
        return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Loans</p>
                <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {allActiveDisbursedLoans.length}
                </p>
              </div>
              <FileText className="size-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount</p>
                <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  KES {(allActiveDisbursedLoans.reduce((sum, l) => sum + (l.principalAmount || l.approvedAmount || l.requestedAmount || 0), 0) / 1000000).toFixed(2)}M
                </p>
              </div>
              <DollarSign className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Outstanding</p>
                <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  KES {((allActiveDisbursedLoans.reduce((sum, l) => sum + Math.abs(l.outstandingBalance || 0), 0)) / 1000000).toFixed(2)}M
                </p>
              </div>
              <TrendingUp className="size-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activeSubTab === 'due' ? 'Due Soon' : 
                   activeSubTab === 'no-repayments' ? 'No Payments' :
                   activeSubTab === '1-month-late' ? '1 Month Late' :
                   activeSubTab === '3-months-late' ? '3+ Months Late' :
                   'Active Loans'}
                </p>
                <p className={`text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {allActiveDisbursedLoans.filter(l => l.status === 'Active').length}
                </p>
              </div>
              <CheckCircle className="size-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        );
      })()}

      {/* Search and Filters (for loan views) */}
      {activeSubTab !== 'guarantors' && activeSubTab !== 'comments' && activeSubTab !== 'repayment-schedule' && (
        <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className={`size-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by loan ID or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Active">Active</option>
              <option value="Fully Paid">Fully Paid</option>
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
                const progress = principalAmt > 0 ? (paidAmt / principalAmt) * 100 : 0;
                
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(loan.status)}`}>
                        {loan.status}
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
                          KES {(principalAmt - paidAmt).toLocaleString()}
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
            <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
                  {activeSubTab === 'all' ? 'All Loans' :
                   activeSubTab === 'pending-review' ? 'Pending Review' :
                   activeSubTab === 'pending-disbursement' ? 'Pending Disbursement' :
                   activeSubTab === 'active' ? 'Active Loans' :
                   activeSubTab === 'settled' ? 'Settled Loans' :
                   activeSubTab === 'defaulted' ? 'Defaulted Loans' :
                   activeSubTab === 'due' ? 'Due Loans' :
                   activeSubTab === 'no-repayments' ? 'Loans with No Repayments' :
                   activeSubTab === 'principal' ? 'Principal Outstanding' :
                   activeSubTab === '1-month-late' ? '1 Month Late Loans' :
                   activeSubTab === '3-months-late' ? '3+ Months Late Loans' :
                   'Loans'} ({filteredLoans.length})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loan ID</th>
                      <th className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Request Date</th>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</th>
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Client ID</th>
                      <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount borrowed</th>
                      <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Interest</th>
                      <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Paid</th>
                      <th className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Outstanding</th>
                      <th className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                      <th className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.map(loan => {
                      const client = clients.find(c => c.id === loan.clientId);
                      const principalAmt = loan.principalAmount || 0;
                      const paidAmt = loan.paidAmount || 0;
                      return (
                        <tr key={loan.id} className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{loan.loanNumber || loan.id}</td>
                          <td className={`px-4 py-2 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {loan.applicationDate || loan.createdDate || '-'}
                          </td>
                          <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {loan.clientName || client?.name || client?.firstName + ' ' + client?.lastName || 'N/A'}
                          </td>
                          <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {client?.clientNumber || client?.client_number || loan.clientId || 'N/A'}
                          </td>
                          <td className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            KES {principalAmt.toLocaleString()}
                          </td>
                          <td className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            KES {(loan.totalInterest || 0).toLocaleString()}
                          </td>
                          <td className={`px-4 py-2 text-right text-xs text-emerald-600 dark:text-emerald-400`}>
                            KES {paidAmt.toLocaleString()}
                          </td>
                          <td className={`px-4 py-2 text-right text-xs text-orange-600 dark:text-orange-400`}>
                            KES {(principalAmt + (loan.totalInterest || 0) - paidAmt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(loan.status)}`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex gap-2 justify-center items-center flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🟢 Setting detailModalLoan to:', loan.id);
                                  setDetailModalLoan(loan.id);
                                }}
                                className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 text-xs cursor-pointer hover:underline"
                              >
                                View
                              </button>
                              {loan.status === 'Pending' && (
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
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
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
                      <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Borrower</th>
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
                    <th className={`px-4 py-2 text-left text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Borrower</th>
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
        console.log('📋 Rendering ComprehensiveLoanDetailsModal for loan:', detailModalLoan);
        return (
          <ComprehensiveLoanDetailsModal
            loanId={detailModalLoan}
            onClose={() => {
              console.log('🚪 Closing modal');
              setDetailModalLoan(null);
            }}
          />
        );
      })()}

      {showNewLoanModal && (
        <NewLoanModal
          onClose={() => setShowNewLoanModal(false)}
          onSubmit={handleNewLoan}
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