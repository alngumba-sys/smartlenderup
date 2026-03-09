import { useState } from 'react';
import { 
  X, Calendar, DollarSign, User, Building2, PercentIcon, AlertCircle, 
  FileText, Shield, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Printer, CreditCard, TrendingUp, Wallet, MapPin, Mail, 
  Phone, MessageSquare, Upload, Download, Banknote, Activity, 
  TrendingDown, Info, CircleDollarSign, Star, AlertTriangle, History, Bug, RefreshCw
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner@2.0.3';
import { generateInstallments } from '../../data/dummyData';
import { getCurrencyCode, formatCurrency } from '../../utils/currencyUtils';
import { RecordPaymentModal } from './RecordPaymentModal';
import { DebugLoanDataModal } from './DebugLoanDataModal';
import { LoanRolloverModal } from './LoanRolloverModal';

interface ComprehensiveLoanDetailsModalProps {
  loanId: string;
  onClose: () => void;
}

export function ComprehensiveLoanDetailsModal({ loanId, onClose }: ComprehensiveLoanDetailsModalProps) {
  const { isDark } = useTheme();
  const { 
    loans, 
    clients, 
    loanProducts, 
    updateLoan,
    payments,
    collaterals,
    guarantors,
    loanDocuments,
    addRepayment,
    refreshData,
  } = useData();

  const loan = loans.find(l => l.id === loanId);
  const client = loan ? clients.find(c => c.id === loan.clientId || c.id === loan.clientUuid) : null;
  const product = loan ? loanProducts.find(p => p.id === loan.productId) : null;
  
  // ✅ Calculate correct interest for FLAT RATE per period
  const calculateCorrectInterest = (loanData: any) => {
    if (!loanData) return 0;
    
    const principal = loanData.principalAmount || loanData.amount || 0;
    const rate = loanData.interestRate || 0;
    const term = loanData.term || loanData.termPeriod || loanData.loanTerm || 1;
    
    // FLAT RATE: Interest = Principal × Rate × Term / 100
    // Example: 100,000 × 7.5% × 1 month = 7,500
    const correctInterest = (principal * rate * term) / 100;
    return Math.round(correctInterest);
  };
  
  // ✅ Smart calculation: Use DB if it has a discount, otherwise use formula
  const calculatedInterest = loan ? calculateCorrectInterest(loan) : 0;
  const calculatedTotal = loan ? (loan.principalAmount || 0) + calculatedInterest : 0;
  const dbTotal = loan?.totalRepayable || loan?.totalRepayment || 0;
  
  // 🔍 DEBUG: Log loan values to see what's wrong
  if (loan) {
    console.log('🔍 LOAN DETAILS DEBUG:', {
      loanNumber: loan.loanNumber,
      principal: loan.principalAmount,
      rate: loan.interestRate,
      term: loan.term,
      termPeriod: loan.termPeriod,
      loanTerm: loan.loanTerm,
      calculatedInterest: calculatedInterest,
      dbTotal: dbTotal,
      formula: `${loan.principalAmount} × ${loan.interestRate} × ${loan.term || loan.termPeriod || loan.loanTerm} / 100 = ${calculatedInterest}`
    });
  }
  
  // If DB total is significantly different from calculated (>1% difference), it might be:
  // 1. A discount (DB < calculated) → Use DB ✅
  // 2. Wrong old data (DB > calculated) → Use calculated ✅  
  const tolerance = calculatedTotal * 0.01; // 1% tolerance for rounding
  const hasDiscount = dbTotal > 0 && dbTotal < (calculatedTotal - tolerance);
  const hasWrongData = dbTotal > (calculatedTotal + tolerance);
  
  const correctTotalRepayable = hasDiscount ? dbTotal : calculatedTotal;
  // ✅ ALWAYS use calculated interest (never negative, even if DB has wrong totalRepayable)
  const correctInterest = calculatedInterest;
  
  // Generate installments directly from loan data
  const generateLoanInstallments = (loanData: any) => {
    if (!loanData) return [];
    
    // Only generate installments for approved or active loans
    if (loanData.status === 'Pending' || loanData.status === 'Rejected') {
      return [];
    }
    
    // Use loan's numberOfInstallments if available, otherwise calculate from term
    const numInstallments = loanData.numberOfInstallments || loanData.term || 12;
    const principalPerInstallment = Math.round(loanData.principalAmount / numInstallments);
    
    // ✅ Use total from database (handles discounts), calculate only if missing
    const totalRepayableForInstallments = loanData.totalRepayable || loanData.totalRepayment || (loanData.principalAmount + calculateCorrectInterest(loanData));
    // ✅ ALWAYS use calculated interest (never negative)
    const totalInterestForInstallments = calculateCorrectInterest(loanData);
    const interestPerInstallment = Math.round(totalInterestForInstallments / numInstallments);
    const installmentAmount = Math.round(totalRepayableForInstallments / numInstallments);
    
    const installments: any[] = [];
    const loanPayments = payments.filter((p: any) => p.loanId === loanId);
    
    for (let i = 0; i < numInstallments; i++) {
      // Calculate due date based on firstRepaymentDate and repayment frequency
      const dueDate = new Date(loanData.firstRepaymentDate || loanData.disbursementDate || new Date());
      
      const frequency = (loanData.repaymentFrequency || 'Monthly').toLowerCase();
      if (frequency === 'monthly') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else if (frequency === 'weekly') {
        dueDate.setDate(dueDate.getDate() + (i * 7));
      } else if (frequency === 'bi-weekly') {
        dueDate.setDate(dueDate.getDate() + (i * 14));
      } else if (frequency === 'daily') {
        dueDate.setDate(dueDate.getDate() + i);
      } else if (frequency === 'quarterly') {
        dueDate.setMonth(dueDate.getMonth() + (i * 3));
      } else {
        // Default to monthly
        dueDate.setMonth(dueDate.getMonth() + i);
      }
      
      const payment = loanPayments.find((p: any) => p.installmentNumber === i + 1);
      const today = new Date();
      const isPaid = !!payment;
      const isOverdue = !isPaid && dueDate < today;
      const isPending = !isPaid && dueDate >= today;
      const isLatePaid = isPaid && payment && new Date(payment.date) > dueDate;
      
      installments.push({
        loanId: loanData.id,
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
  
  const installments = loan ? generateLoanInstallments(loan) : [];
  
  // Filter data from context arrays
  const loanCollaterals = collaterals.filter((c: any) => c.loanId === loanId);
  const loanGuarantors = guarantors.filter((g: any) => g.loanId === loanId);
  const documents = loanDocuments.filter((d: any) => d.loanId === loanId);
  const loanPayments = payments.filter((p: any) => p.loanId === loanId);
  
  const currencyCode = getCurrencyCode();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'payments' | 'borrower' | 'documents' | 'risk'>('overview');
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [showRolloverModal, setShowRolloverModal] = useState(false);

  if (!loan || !client || !product) {
    return null;
  }

  // ✅ CRITICAL FIX: Read directly from loan table columns (paidAmount is the mapped field name)
  // DataContext maps amount_paid → paidAmount, principal_paid → principalPaid, interest_paid → interestPaid
  const totalPaid = loan.paidAmount ?? loan.amount_paid ?? loan.amountPaid ?? 0;
  const principalPaid = loan.principalPaid ?? loan.principal_paid ?? 0;
  const interestPaid = loan.interestPaid ?? loan.interest_paid ?? 0;
  
  // ✅ Calculate next payment due date and amount
  const installmentAmountValue = loan.installmentAmount || loan.monthlyPayment || 0;
  
  // Calculate how many installments have been paid
  const numberOfInstallmentsPaid = installmentAmountValue > 0 ? Math.floor(totalPaid / installmentAmountValue) : 0;
  
  // Calculate next payment due date by adding the appropriate period to first repayment date
  const calculateNextPaymentDate = () => {
    if (!loan.firstRepaymentDate) return loan.disbursementDate || '';
    if (loan.status === 'Paid') return ''; // No next payment if loan is paid
    
    const firstDate = new Date(loan.firstRepaymentDate);
    const frequency = (loan.repaymentFrequency || 'Monthly').toLowerCase();
    
    // Add periods based on number of payments made
    if (frequency === 'weekly') {
      firstDate.setDate(firstDate.getDate() + (numberOfInstallmentsPaid * 7));
    } else if (frequency === 'monthly') {
      firstDate.setMonth(firstDate.getMonth() + numberOfInstallmentsPaid);
    } else if (frequency === 'quarterly') {
      firstDate.setMonth(firstDate.getMonth() + (numberOfInstallmentsPaid * 3));
    } else {
      firstDate.setMonth(firstDate.getMonth() + numberOfInstallmentsPaid);
    }
    
    return firstDate.toISOString().split('T')[0];
  };
  
  const nextPaymentDue = calculateNextPaymentDate();
  const nextPaymentAmount = installmentAmountValue;
  
  // Calculate days overdue
  const today = new Date();
  const nextDue = nextPaymentDue ? new Date(nextPaymentDue) : today;
  const daysOverdue = loan.status === 'In Arrears' 
    ? Math.floor((today.getTime() - nextDue.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate credit score (simple example)
  const creditScore = loan.status === 'Active' && totalPaid > 0 ? 
    Math.min(850, 300 + Math.floor((totalPaid / loan.principalAmount) * 550)) : 
    loan.status === 'Paid' ? 850 : 650;

  // Calculate risk rating
  const getRiskRating = () => {
    if (loan.status === 'Paid') return { label: 'Low', color: 'emerald', score: 95 };
    if (loan.status === 'Written Off' || loan.status === 'Defaulted') return { label: 'Critical', color: 'red', score: 15 };
    if (daysOverdue > 90) return { label: 'High', color: 'red', score: 35 };
    if (daysOverdue > 30) return { label: 'Medium', color: 'amber', score: 60 };
    if (loan.status === 'Active' && totalPaid > 0) return { label: 'Low', color: 'emerald', score: 85 };
    return { label: 'Medium', color: 'amber', score: 70 };
  };

  const riskRating = getRiskRating();

  // Calculate outstanding balance and payoff quote using CORRECTED total
  // ✅ ALWAYS recalculate outstanding based on corrected total (don't trust DB balance)
  const outstandingBalance = Math.max(0, correctTotalRepayable - totalPaid);
  const earlyPaymentDiscount = 0; // You can add logic for early payment discounts
  const payoffQuote = outstandingBalance - earlyPaymentDiscount;

  // Generate receipt number
  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RCP-${timestamp}-${random}`;
  };

  // Handle record payment submission
  const handleRecordPayment = async (paymentData: any) => {
    if (!loan || !client) {
      console.error('Loan or client lookup failed');
      toast.error('Error recording payment', {
        description: 'Loan or client not found',
        duration: 4000,
      });
      return;
    }

    // Calculate principal and interest breakdown
    const amount = parseFloat(paymentData.amount);
    const principal = amount * 0.7; // Assuming 70% goes to principal
    const interest = amount * 0.3; // Assuming 30% goes to interest
    
    // Create the repayment object
    const repaymentRecord = {
      loanId: paymentData.loanId,
      clientId: loan.clientId,
      clientName: client.name,
      amount: amount,
      principal: principal,
      interest: interest,
      penalty: 0,
      paymentMethod: paymentData.paymentMethod as 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque',
      paymentReference: paymentData.mpesaCode || paymentData.transactionRef || `TXN${Date.now()}`,
      paymentDate: paymentData.paymentDate,
      receiptNumber: generateReceiptNumber(),
      receivedBy: 'Current User',
      notes: paymentData.notes || '',
      status: 'Approved' as const,
      bankAccountId: paymentData.destinationAccountId,
    };

    try {
      // Add the repayment to the context (this is async)
      await addRepayment(repaymentRecord);

      // Close the modal
      setShowRecordPayment(false);

      // Show success toast
      toast.success('Payment Recorded Successfully', {
        description: `${currencyCode} ${amount.toLocaleString()} recorded for ${client.name} via ${paymentData.paymentMethod}`,
        duration: 5000,
      });

      // ✅ Refresh data from Supabase to ensure UI is in sync with database
      console.log('🔄 Refreshing data after payment...');
      await refreshData();
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Error recording payment:', error);
      // Error toast is already shown by addRepayment
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-7xl h-[95vh] max-h-[900px] bg-[#FFF5E1] rounded-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                  <Banknote className="size-6 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">
                    Loan {loan.loanNumber || loan.loanId || loan.loan_id || loan.id}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {client.name} • {product.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="size-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-300 flex gap-1 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'schedule', label: 'Amortization Schedule' },
              { id: 'payments', label: 'Transaction History' },
              { id: 'borrower', label: 'Borrower Profile' },
              { id: 'documents', label: 'Documents' },
              { id: 'risk', label: 'Risk & Monitoring' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs font-semibold relative transition-colors ${
                  activeTab === tab.id
                    ? 'text-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 1. High-Level Summary (Snapshot) */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Loan Status */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="size-4 text-black" />
                        <span className="text-xs text-gray-600">Loan Status</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        loan.status === 'Active' || loan.status === 'Disbursed' ? 'bg-[#00FF00] text-black' :
                        loan.status === 'Paid' ? 'bg-[#00A676] text-white' :
                        loan.status === 'Pending' || loan.status === 'Pending Review' ? 'bg-[#FFC107] bg-opacity-20 text-black' :
                        loan.status === 'In Arrears' || loan.status === 'Overdue' ? 'bg-[#FF0000] text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>

                  {/* Outstanding Balance */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-black" />
                        <span className="text-xs text-gray-600">Outstanding Balance</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-black">
                      {formatCurrency(outstandingBalance)}
                    </p>
                  </div>

                  {/* Next Payment Due */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-black" />
                        <span className="text-xs text-gray-600">Next Payment Due</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-black">
                      {nextPaymentDue || 'N/A'}
                    </p>
                    <p className="text-lg font-bold text-[#00FF00]">
                      {formatCurrency(nextPaymentAmount)}
                    </p>
                  </div>

                  {/* Credit Score Impact */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="size-4 text-black" />
                        <span className="text-xs text-gray-600">Credit Score</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-black">
                        {creditScore}
                      </p>
                      <span className={`text-xs font-semibold ${
                        creditScore >= 750 ? 'text-[#00FF00]' :
                        creditScore >= 650 ? 'text-[#FFC107]' : 'text-[#FF0000]'
                      }`}>
                        {creditScore >= 750 ? 'Excellent' :
                         creditScore >= 650 ? 'Good' : 'Fair'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Core Loan Terms */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-black mb-4 flex items-center gap-2">
                    <FileText className="size-4" />
                    CORE LOAN TERMS
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Amount Borrowed</label>
                      <p className="text-xs font-semibold text-black">
                        {formatCurrency(loan.principalAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Arrangement Fees</label>
                      <p className="text-xs font-semibold text-black">
                        {formatCurrency(loan.arrangementFee || loan.processingFee || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Interest Rate (Flat Rate)</label>
                      <p className="text-xs font-semibold text-black">
                        {loan.interestRate}% per {(loan.termUnit || 'Months').toLowerCase().replace(/s$/, '')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Repayment Period</label>
                      <p className="text-xs font-semibold text-black">
                        {loan.term} {loan.termUnit}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Due Date</label>
                      <p className="text-xs font-semibold text-black">
                        {loan.firstRepaymentDate || loan.dueDate || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Total Repayment Duration</label>
                      <p className="text-xs font-semibold text-black">
                        {loan.term} {loan.term === 1 ? (loan.termUnit || 'Month').toLowerCase().replace(/s$/, '') : (loan.termUnit || 'Months').toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Total Potential Interest Payable</label>
                      <p className="text-xs font-semibold text-black">
                        {formatCurrency(correctInterest)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Total Amt Payable (Principal + Interest)</label>
                      <p className="text-xs font-semibold text-black">
                        {formatCurrency(correctTotalRepayable)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Repayment Frequency</label>
                      <p className="text-xs font-semibold text-black">
                        {loan.repaymentFrequency || 'Monthly'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Principal Paid Back</label>
                      <p className="text-xs font-semibold text-[#00FF00]">
                        {formatCurrency(principalPaid)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Interest Paid Back</label>
                      <p className="text-xs font-semibold text-[#00FF00]">
                        {formatCurrency(interestPaid)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Total Amount Repaid Back (P + I)</label>
                      <p className="text-xs font-semibold text-[#00FF00]">
                        {formatCurrency(totalPaid)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Application Date</label>
                      <p className="text-xs font-semibold text-black">
                        {loan.applicationDate || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Disbursement Date</label>
                      <p className="text-xs font-semibold text-black">
                        {loan.disbursementDate || 'Not disbursed'}
                      </p>
                    </div>
                  </div>

                  {/* Collateral Details */}
                  {loanCollaterals.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <h4 className="text-xs font-semibold text-black mb-2">
                        COLLATERAL DETAILS
                      </h4>
                      <div className="space-y-2">
                        {loanCollaterals.map((collateral: any) => (
                          <div key={collateral.id} className="p-3 border border-gray-300 rounded-lg bg-white">
                            <div className="flex justify-between">
                              <span className="text-xs font-semibold text-black">
                                {collateral.type}
                              </span>
                              <span className="text-xs font-semibold text-[#00FF00]">
                                {formatCurrency(collateral.value || 0)}
                              </span>
                            </div>
                            <p className="text-xs mt-1 text-gray-600">
                              {collateral.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Servicing & Financial Progress */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-black mb-4 flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    SERVICING & FINANCIAL PROGRESS
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Total Repayable</label>
                      <p className="text-lg font-bold text-black">
                        {formatCurrency(correctTotalRepayable)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Total Interest</label>
                      <p className="text-lg font-bold text-black">
                        {formatCurrency(correctInterest)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Total Paid</label>
                      <p className="text-lg font-bold text-[#00FF00]">
                        {formatCurrency(totalPaid)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1">Payoff Quote</label>
                      <p className="text-lg font-bold text-[#FFC107]">
                        {formatCurrency(payoffQuote)}
                      </p>
                      <p className="text-xs text-gray-600">
                        (as of today)
                      </p>
                    </div>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Payment Progress</span>
                      <span className="text-black font-semibold">
                        {((totalPaid / (loan.totalRepayable || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00FF00] transition-all duration-500"
                        style={{ width: `${Math.min((totalPaid / (loan.totalRepayable || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-black mb-4 flex items-center gap-2">
                    <CreditCard className="size-4" />
                    QUICK ACTIONS
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors flex items-center gap-2 text-xs font-medium"
                    >
                      <Calendar className="size-4" />
                      View Schedule
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors flex items-center gap-2 text-xs font-medium"
                    >
                      <Printer className="size-4" />
                      Print Statement
                    </button>
                    <button
                      onClick={() => setShowRolloverModal(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-xs font-medium"
                    >
                      <RefreshCw className="size-4" />
                      Roll over / Renew
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AMORTIZATION SCHEDULE TAB */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Calendar className="size-5 text-blue-600" />
                    Amortization Schedule
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            #
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Due Date
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Payment
                          </th>
                          <th className={`px-4 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            ✓
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Principal
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Interest
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Balance
                          </th>
                          <th className={`px-4 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {installments.map((inst, index) => {
                          // Calculate remaining balance after this payment
                          const remainingBalance = loan.principalAmount - ((inst.principalComponent || 0) * (index + 1));
                          
                          return (
                            <tr 
                              key={`${inst.loanId}-${inst.installmentNo}`}
                              className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-100'}`}
                            >
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {inst.installmentNo}
                              </td>
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {inst.dueDate}
                              </td>
                              <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {formatCurrency(inst.plannedAmount || 0)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={inst.status === 'Paid' || inst.status === 'Late Paid'}
                                  readOnly
                                  className="size-4 rounded border-gray-300 text-blue-600 cursor-not-allowed"
                                  title={inst.status === 'Paid' || inst.status === 'Late Paid' ? 'Reviewed' : 'Not reviewed'}
                                />
                              </td>
                              <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {formatCurrency(inst.principalComponent || 0)}
                              </td>
                              <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {formatCurrency(inst.interestComponent || 0)}
                              </td>
                              <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {formatCurrency(Math.max(0, remainingBalance))}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  inst.status === 'Late Paid' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                  inst.status === 'Overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {inst.status}
                                </span>
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

            {/* TRANSACTION HISTORY TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <History className="size-5 text-emerald-600" />
                    Transaction History
                  </h3>
                  
                  {loanPayments.length === 0 ? (
                    <div className="text-center py-8">
                      <CircleDollarSign className={`size-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No payments recorded yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loanPayments.map((payment: any) => (
                        <div 
                          key={payment.id}
                          className={`p-4 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Loan {loan.loanNumber || loan.id}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {payment.date}
                              </p>
                            </div>
                            <p className={`text-lg font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                          
                          {/* Payment method details */}
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {payment.paymentMethod === 'Bank Transfer' ? (
                              <>
                                • Bank Transfer
                                {payment.bankName && (
                                  <span> to {payment.bankName}</span>
                                )}
                                {payment.accountNumber && (
                                  <span>, Account {payment.accountNumber}</span>
                                )}
                              </>
                            ) : (
                              <>• {payment.paymentMethod || 'Cash'}</>
                            )}
                          </div>
                          
                          {payment.notes && (
                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {payment.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BORROWER PROFILE TAB */}
            {activeTab === 'borrower' && (
              <div className="space-y-4">
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <User className="size-5 text-blue-600" />
                    Borrower Profile
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Personal Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Full Name</label>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Email</label>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Phone</label>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.phone || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Address</label>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.address || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Standing */}
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Financial Standing
                      </h4>
                      <div className="space-y-3">
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Employment Status</label>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {client.employment_status || 'Self-Employed'}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Income</label>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {client.monthly_income ? formatCurrency(client.monthly_income) : 'N/A'}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Client Since</label>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {client.registrationDate || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guarantors */}
                  {loanGuarantors.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Users className="size-4" />
                        Guarantor Details
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {loanGuarantors.map((guarantor: any) => (
                          <div key={guarantor.id} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name</label>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {guarantor.name}
                                </p>
                              </div>
                              <div>
                                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ID NO / Chassis No.</label>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {guarantor.idNumber || guarantor.chassisNo || guarantor.nationalId || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tel No / Engine No.</label>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {guarantor.phone || guarantor.engineNo || guarantor.telephone || 'N/A'}
                                </p>
                              </div>
                            </div>
                            {guarantor.relationship && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-500">
                                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Relationship</label>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {guarantor.relationship}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="size-5 text-purple-600" />
                    Document Vault
                  </h3>
                  
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <Upload className={`size-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No documents uploaded yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {documents.map((doc: any) => (
                        <div 
                          key={doc.id}
                          className={`p-4 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <FileText className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {doc.name}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {doc.category} • Uploaded {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700">
                              <Download className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Compliance Status
                    </h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-5 text-emerald-600" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        KYC/AML verification completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RISK & MONITORING TAB */}
            {activeTab === 'risk' && (
              <div className="space-y-4">
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="size-5 text-red-600" />
                    Risk & Monitoring
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Risk Rating */}
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'}`}>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Risk Rating</label>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1">
                          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-500' : 'bg-gray-200'}`}>
                            <div 
                              className={`h-full bg-${riskRating.color}-500`}
                              style={{ width: `${riskRating.score}%` }}
                            />
                          </div>
                        </div>
                        <span className={`text-sm font-semibold text-${riskRating.color}-600`}>
                          {riskRating.score}
                        </span>
                      </div>
                      <p className={`text-sm font-medium mt-1 text-${riskRating.color}-600`}>
                        {riskRating.label} Risk
                      </p>
                    </div>

                    {/* Days Overdue */}
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'}`}>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Days Past Due</label>
                      <p className={`text-3xl font-semibold mt-2 ${
                        daysOverdue > 0 ? 'text-red-600' : isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {daysOverdue > 0 ? daysOverdue : 0}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {daysOverdue > 90 ? '90+ Days' : daysOverdue > 60 ? '60-90 Days' : daysOverdue > 30 ? '30-60 Days' : 'Current'}
                      </p>
                    </div>

                    {/* Default Probability */}
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'}`}>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Default Probability</label>
                      <p className={`text-3xl font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {100 - riskRating.score}%
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Based on payment history
                      </p>
                    </div>
                  </div>

                  {/* Delinquency Alerts */}
                  {daysOverdue > 0 && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                            Delinquency Alert
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                            This loan is {daysOverdue} days past due. Immediate action recommended to prevent default.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Covenant Tracking */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Covenant Tracking
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Timely payments
                        </span>
                        <span className="text-sm text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="size-4" />
                          Compliant
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Collateral maintained
                        </span>
                        <span className="text-sm text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="size-4" />
                          Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t flex justify-between ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Close
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <Printer className="size-4" />
                Print
              </button>
              <button
                onClick={() => setShowRecordPayment(true)}
                disabled={loan.status?.toLowerCase() === 'pending'}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  loan.status?.toLowerCase() === 'pending'
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title={loan.status?.toLowerCase() === 'pending' ? 'Cannot record payment for pending loans' : ''}
              >
                <DollarSign className="size-4" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <RecordPaymentModal
          isOpen={showRecordPayment}
          onClose={() => setShowRecordPayment(false)}
          onSubmit={handleRecordPayment}
          preselectedLoanId={loanId}
        />
      )}

      {/* Loan Rollover Modal */}
      {showRolloverModal && (
        <LoanRolloverModal
          isOpen={showRolloverModal}
          onClose={() => setShowRolloverModal(false)}
          loanId={loanId}
        />
      )}
    </>
  );
}