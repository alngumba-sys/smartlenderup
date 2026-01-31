import { useState } from 'react';
import { 
  X, Calendar, DollarSign, User, Building2, PercentIcon, AlertCircle, 
  FileText, Shield, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Printer, CreditCard, TrendingUp, Wallet, MapPin, Mail, 
  Phone, MessageSquare, Upload, Download, Banknote, Activity, 
  TrendingDown, Info, CircleDollarSign, Star, AlertTriangle, History
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner@2.0.3';
import { generateInstallments } from '../../data/dummyData';
import { getCurrencyCode, formatCurrency } from '../../utils/currencyUtils';
import { RecordPaymentModal } from './RecordPaymentModal';

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
  } = useData();

  const loan = loans.find(l => l.id === loanId);
  const client = loan ? clients.find(c => c.id === loan.clientId || c.id === loan.clientUuid) : null;
  const product = loan ? loanProducts.find(p => p.id === loan.productId) : null;
  const installments = loan ? generateInstallments(loanId) : [];
  
  // Filter data from context arrays
  const loanCollaterals = collaterals.filter((c: any) => c.loanId === loanId);
  const loanGuarantors = guarantors.filter((g: any) => g.loanId === loanId);
  const documents = loanDocuments.filter((d: any) => d.loanId === loanId);
  const loanPayments = payments.filter((p: any) => p.loanId === loanId);
  
  const currencyCode = getCurrencyCode();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'payments' | 'borrower' | 'documents' | 'risk'>('overview');
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);

  if (!loan || !client || !product) {
    return null;
  }

  // Calculate loan metrics
  const totalPaid = loanPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const nextPaymentDue = loan.firstRepaymentDate || loan.disbursementDate;
  const nextPaymentAmount = loan.installmentAmount || loan.monthlyPayment || 0;
  
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
    if (loan.status === 'Paid' || loan.status === 'Settled') return { label: 'Low', color: 'emerald', score: 95 };
    if (loan.status === 'Written Off' || loan.status === 'Defaulted') return { label: 'Critical', color: 'red', score: 15 };
    if (daysOverdue > 90) return { label: 'High', color: 'red', score: 35 };
    if (daysOverdue > 30) return { label: 'Medium', color: 'amber', score: 60 };
    if (loan.status === 'Active' && totalPaid > 0) return { label: 'Low', color: 'emerald', score: 85 };
    return { label: 'Medium', color: 'amber', score: 70 };
  };

  const riskRating = getRiskRating();

  // Calculate payoff quote
  const earlyPaymentDiscount = 0; // You can add logic for early payment discounts
  const payoffQuote = loan.outstandingBalance - earlyPaymentDiscount;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-7xl max-h-[95vh] rounded-lg shadow-xl overflow-hidden flex flex-col ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-r from-[#020838] to-[#041056] border-gray-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-500/20'}`}>
                <Banknote className={`size-6 ${isDark ? 'text-emerald-400' : 'text-white'}`} />
              </div>
              <div>
                <h2 className={`text-xl ${isDark ? 'text-white' : 'text-white'}`}>
                  Loan {loan.loanNumber || loan.loanId || loan.loan_id || loan.id}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-200'}`}>
                  {client.name} • {product.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-white/10 text-white'
              }`}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className={`px-6 border-b flex gap-1 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? isDark ? 'border-emerald-500 text-emerald-400' : 'border-emerald-600 text-emerald-700'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? isDark ? 'border-emerald-500 text-emerald-400' : 'border-emerald-600 text-emerald-700'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Amortization Schedule
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? isDark ? 'border-emerald-500 text-emerald-400' : 'border-emerald-600 text-emerald-700'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Transaction History
            </button>
            <button
              onClick={() => setActiveTab('borrower')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'borrower'
                  ? isDark ? 'border-emerald-500 text-emerald-400' : 'border-emerald-600 text-emerald-700'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Borrower Profile
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? isDark ? 'border-emerald-500 text-emerald-400' : 'border-emerald-600 text-emerald-700'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'risk'
                  ? isDark ? 'border-emerald-500 text-emerald-400' : 'border-emerald-600 text-emerald-700'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Risk & Monitoring
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 1. High-Level Summary (Snapshot) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Loan Status */}
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loan Status</span>
                      <Activity className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        loan.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        loan.status === 'Paid' || loan.status === 'Settled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        loan.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        loan.status === 'In Arrears' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>

                  {/* Outstanding Balance */}
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Outstanding Balance</span>
                      <DollarSign className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(loan.outstandingBalance || 0)}
                    </p>
                  </div>

                  {/* Next Payment Due */}
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Next Payment Due</span>
                      <Calendar className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {nextPaymentDue || 'N/A'}
                    </p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatCurrency(nextPaymentAmount)}
                    </p>
                  </div>

                  {/* Credit Score Impact */}
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Credit Score</span>
                      <Star className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {creditScore}
                      </p>
                      <span className={`text-xs ${
                        creditScore >= 750 ? 'text-emerald-600' :
                        creditScore >= 650 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {creditScore >= 750 ? 'Excellent' :
                         creditScore >= 650 ? 'Good' : 'Fair'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Core Loan Terms */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="size-5 text-emerald-600" />
                    Core Loan Terms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount Borrowed</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(loan.principalAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Arrangement Fees</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(loan.arrangementFee || loan.processingFee || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Interest Rate (APR)</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loan.interestRate}% per annum
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Repayment Period</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loan.term} {loan.termUnit}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Due Date</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loan.firstRepaymentDate || loan.dueDate || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Repayment Duration</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loan.termUnit === 'Months' ? loan.term : loan.termUnit === 'Weeks' ? Math.ceil(loan.term / 4) : Math.ceil(loan.term / 30)} months
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Potential Interest Payable</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(loan.totalInterest || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Amt Payable (Principal + Interest)</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(loan.totalRepayable || loan.totalRepayment || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Repayment Frequency</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loan.repaymentFrequency || 'Monthly'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Principal Paid Back</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-emerald-600' : 'text-emerald-600'}`}>
                        {formatCurrency(loan.paidAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Interest Paid Back</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-emerald-600' : 'text-emerald-600'}`}>
                        {formatCurrency(loan.interestPaid || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount Repaid Back (P + I)</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-emerald-600' : 'text-emerald-600'}`}>
                        {formatCurrency(totalPaid)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Application Date</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loan.applicationDate || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Disbursement Date</label>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loan.disbursementDate || 'Not disbursed'}
                      </p>
                    </div>
                  </div>

                  {/* Collateral Details */}
                  {loanCollaterals.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Collateral Details
                      </h4>
                      <div className="space-y-2">
                        {loanCollaterals.map((collateral: any) => (
                          <div key={collateral.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
                            <div className="flex justify-between">
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {collateral.type}
                              </span>
                              <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {formatCurrency(collateral.value || 0)}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {collateral.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Servicing & Financial Progress */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="size-5 text-blue-600" />
                    Servicing & Financial Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Repayable</label>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(loan.totalRepayable || loan.totalRepayment || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Interest</label>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(loan.totalInterest || 0)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Paid</label>
                      <p className={`text-lg font-semibold ${isDark ? 'text-emerald-600' : 'text-emerald-600'}`}>
                        {formatCurrency(totalPaid)}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payoff Quote</label>
                      <p className={`text-lg font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        {formatCurrency(payoffQuote)}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        (as of today)
                      </p>
                    </div>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Payment Progress</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {((totalPaid / (loan.totalRepayable || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${Math.min((totalPaid / (loan.totalRepayable || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <CreditCard className="size-5 text-purple-600" />
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowRecordPayment(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <DollarSign className="size-4" />
                      Make a Payment
                    </button>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      <Calendar className="size-4" />
                      View Schedule
                    </button>
                    <button
                      onClick={() => window.print()}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      <Printer className="size-4" />
                      Print Statement
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
                        {installments.map((inst, index) => (
                          <tr 
                            key={inst.id}
                            className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-100'}`}
                          >
                            <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {index + 1}
                            </td>
                            <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {inst.dueDate}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {formatCurrency(inst.installmentAmount)}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {formatCurrency(inst.principalDue)}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {formatCurrency(inst.interestDue)}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {formatCurrency(inst.balance)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                inst.status === 'Overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {inst.status}
                              </span>
                            </td>
                          </tr>
                        ))}
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
                                Payment #{payment.receiptNumber || payment.transactionId || payment.id}
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
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
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
          onClose={() => setShowRecordPayment(false)}
          preSelectedLoanId={loanId}
        />
      )}
    </>
  );
}