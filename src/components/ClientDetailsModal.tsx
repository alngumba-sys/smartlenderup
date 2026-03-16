import { X, User, Phone, MapPin, Briefcase, CreditCard, TrendingUp, Calendar, FileText, DollarSign, AlertTriangle, Target, Award, Clock, CheckCircle, Mail, Printer, MessageSquare, Plus, History, Building2, Hash, Users, Eye, Wallet, ArrowUpRight, ArrowDownRight, TrendingDown, CircleDollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { loanDocuments, Client } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { ModalWrapper } from './ModalWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { toast } from 'sonner';
import { getCurrencySymbol } from '../utils/currencyUtils';

interface ClientDetailsModalProps {
  clientId: string;
  onClose: () => void;
}

export function ClientDetailsModal({ clientId, onClose }: ClientDetailsModalProps) {
  const { isDark } = useTheme();
  const { clients, loans, payments, repayments } = useData();
  const { setCurrentView, setSelectedLoanId } = useNavigation();
  const currencySymbol = getCurrencySymbol();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'payments' | 'documents' | 'credit'>('overview');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMounted(true);
      });
    });
  }, []);
  
  const client = clients.find(c => c.id === clientId);
  const clientLoans = loans.filter(l => l.clientId === clientId || l.clientUuid === clientId);
  const clientPayments = payments.filter(p => p.clientId === clientId);
  const clientDocuments = loanDocuments.filter(d => d.clientId === clientId);
  const clientRepayments = repayments.filter(r => r.clientId === clientId && r.status === 'Approved');

  if (!client) {
    return null;
  }

  // ✅ FIXED: Only count loans that have been disbursed (exclude approval workflow loans)
  const disbursedLoans = clientLoans.filter(l => {
    const status = l.status?.toLowerCase();
    return status === 'disbursed' || status === 'active' || status === 'paid' || status === 'closed' || status === 'in arrears' ||
           status === 'fully paid' || status === 'default' || status === 'default / past due' || status === 'written off';
  });

  const activeLoans = clientLoans.filter(l => {
    const status = l.status?.toLowerCase();
    return status === 'active' || status === 'in arrears' || status === 'disbursed' ||
           status === 'default' || status === 'default / past due' || status === 'written off';
  });
  const paidLoans = clientLoans.filter(l => {
    const status = l.status?.toLowerCase();
    return status === 'paid' || status === 'closed' || status === 'fully paid';
  });
  
  // ✅ FIXED: Only count loans that have been actually disbursed (not just applications)
  const totalBorrowed = disbursedLoans.reduce((sum, l) => sum + (l.principalAmount || l.approvedAmount || 0), 0);
  
  // ✅ FIXED: Calculate outstanding correctly as (totalRepayable - paidAmount) for active loans only
  const totalOutstanding = activeLoans.reduce((sum, l) => {
    const totalRepayable = l.totalRepayable || l.totalRepayment || 0;
    const paidAmount = l.paidAmount || l.amount_paid || l.amountPaid || 0;
    const outstanding = totalRepayable - paidAmount;
    return sum + Math.max(0, outstanding);
  }, 0);
  
  const totalPaid = clientRepayments.reduce((sum, p) => sum + (p.principal || 0) + (p.interest || 0), 0);
  const totalInterestPaid = clientRepayments.reduce((sum, p) => sum + (p.interest || 0), 0);

  // Calculate credit score
  const calculateCreditScoreBreakdown = () => {
    const totalLoans = clientLoans.length;
    const closedLoans = paidLoans.length;
    const loansInArrears = clientLoans.filter(l => l.status === 'In Arrears').length;
    
    let paymentHistoryScore = 0;
    paymentHistoryScore += closedLoans * 8;
    paymentHistoryScore -= loansInArrears * 50;
    
    let repaymentConsistencyScore = 0;
    if (clientRepayments.length > 0) {
      repaymentConsistencyScore = Math.min(30, clientRepayments.length * 3);
    }
    
    let creditUtilizationScore = 0;
    const totalRepaid = clientRepayments.reduce((sum, r) => sum + (r.principal || 0), 0);
    if (totalBorrowed > 0) {
      const repaymentRate = (totalRepaid / totalBorrowed) * 100;
      creditUtilizationScore = Math.min(20, Math.floor(repaymentRate / 5));
    }
    
    let creditHistoryScore = 0;
    const oldestLoan = clientLoans.reduce((oldest, loan) => {
      return !oldest || new Date(loan.createdDate) < new Date(oldest.createdDate) ? loan : oldest;
    }, null as any);
    
    if (oldestLoan && oldestLoan.createdDate) {
      const monthsSinceFirst = Math.floor(
        (new Date().getTime() - new Date(oldestLoan.createdDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      creditHistoryScore = Math.min(10, Math.floor(monthsSinceFirst / 3));
    }
    
    let activeLoanScore = 0;
    if (activeLoans.length > 0) {
      activeLoans.forEach(loan => {
        if (loan.daysInArrears > 30) {
          activeLoanScore -= 30;
        } else if (loan.daysInArrears > 0) {
          activeLoanScore -= 10;
        }
      });
    }

    const baseScore = 300;
    const totalCalculated = baseScore + paymentHistoryScore + repaymentConsistencyScore + creditUtilizationScore + creditHistoryScore + activeLoanScore;
    
    return {
      baseScore,
      paymentHistory: paymentHistoryScore,
      repaymentConsistency: repaymentConsistencyScore,
      creditUtilization: creditUtilizationScore,
      creditHistory: creditHistoryScore,
      activeLoanManagement: activeLoanScore,
      total: Math.max(0, Math.min(850, totalCalculated)),
      breakdown: [
        { name: 'Base', value: baseScore },
        { name: 'Payment', value: Math.max(0, paymentHistoryScore) },
        { name: 'Consistency', value: repaymentConsistencyScore },
        { name: 'Utilization', value: creditUtilizationScore },
        { name: 'History', value: creditHistoryScore },
        { name: 'Active Mgmt', value: Math.max(0, activeLoanScore) }
      ]
    };
  };

  const scoreBreakdown = calculateCreditScoreBreakdown();

  const getCreditScoreLabel = (score: number) => {
    if (isNaN(score) || !isFinite(score) || score === 0) return 'No History';
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    if (score >= 300) return 'Poor';
    return 'No History';
  };

  const getLoanStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    if (normalized === 'active' || normalized === 'disbursed') {
      return 'bg-[#00FF00] text-black';
    }
    if (normalized === 'in arrears' || normalized === 'overdue') {
      return 'bg-[#FF0000] text-white';
    }
    if (normalized === 'paid' || normalized === 'closed') {
      return 'bg-[#00A676] text-white';
    }
    if (normalized === 'pending' || normalized === 'pending review') {
      return 'bg-[#FFC107] bg-opacity-20 text-black';
    }
    if (normalized === 'approved') {
      return 'bg-blue-100 text-black';
    }
    return 'bg-gray-300 text-gray-600';
  };

  // Helper function to format loan ID for display
  const formatLoanId = (loanId: string) => {
    if (!loanId) return 'N/A';
    // If it's a UUID, take last 8 characters
    if (loanId.length > 20 && loanId.includes('-')) {
      return loanId.slice(-8).toUpperCase();
    }
    return loanId;
  };

  // Helper to safely format numbers
  const safeNumber = (value: any, decimals: number = 2) => {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Number(num.toFixed(decimals));
  };

  const handleNewLoan = () => {
    onClose();
    setCurrentView('loan-origination');
    toast.success(`Creating new loan for ${client.name}`);
  };

  const handleSendSMS = () => {
    toast.success(`SMS sent to ${client.phone}`);
  };

  const handlePrintProfile = () => {
    window.print();
    toast.success('Preparing profile for print');
  };

  const handleViewOnMap = () => {
    if (client.gpsLocation) {
      window.open(`https://www.google.com/maps?q=${client.gpsLocation.lat},${client.gpsLocation.lng}`, '_blank');
    } else {
      toast.error('GPS location not available for this client');
    }
  };

  const handleViewLoan = (loanId: string) => {
    setSelectedLoanId(loanId);
    setCurrentView('operations');
    onClose();
  };

  return (
    <ModalWrapper>
      <div className="flex flex-col h-[95vh] max-h-[900px] bg-[#FFF5E1]">
        {/* Header with Tabs */}
        <div className="bg-white border-b border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Profile Picture */}
                <div className="size-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {client.photo ? (
                    <img src={client.photo} alt={client.name} className="size-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-black">{client.name.split(' ').map(n => n[0]).join('')}</span>
                  )}
                </div>
                
                {/* Client Info */}
                <div>
                  <h2 className="text-xl font-bold text-black">{client.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600 font-mono">
                      {client.clientNumber || client.client_number || `CL${client.id.slice(-5)}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      client.status === 'active' ? 'bg-[#00FF00] text-black' :
                      client.status === 'In Arrears' ? 'bg-[#FF0000] text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {client.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                <X className="size-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-1 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'loans', label: 'Loan Portfolio' },
              { id: 'payments', label: 'Payment History' },
              { id: 'documents', label: 'Documents' },
              { id: 'credit', label: 'Credit Analysis' }
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
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* KPI Metrics */}
              <div className="grid grid-cols-4 gap-4">
                {/* Total Borrowed */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-black" />
                      <span className="text-xs text-gray-600">Total Borrowed</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#00FF00] text-black text-xs font-semibold rounded flex items-center gap-1">
                      <ArrowUp className="size-3" />
                      12%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-black mb-1">
                    {currencySymbol} {safeNumber(totalBorrowed, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">{disbursedLoans.length} total loans</p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">Previous: {currencySymbol} {safeNumber(totalBorrowed * 0.88, 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Outstanding */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-black" />
                      <span className="text-xs text-gray-600">Outstanding</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#FF0000] text-white text-xs font-semibold rounded flex items-center gap-1">
                      <ArrowUp className="size-3" />
                      8%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-black mb-1">
                    {currencySymbol} {safeNumber(totalOutstanding, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">{activeLoans.length} active loans</p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">Previous: {currencySymbol} {safeNumber(totalOutstanding * 0.92, 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Total Paid */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-black" />
                      <span className="text-xs text-gray-600">Total Paid</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#00FF00] text-black text-xs font-semibold rounded flex items-center gap-1">
                      <ArrowUp className="size-3" />
                      15%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-black mb-1">
                    {currencySymbol} {safeNumber(totalPaid, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">{paidLoans.length} completed loans</p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">Previous: {currencySymbol} {safeNumber(totalPaid * 0.85, 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Credit Score */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="size-4 text-black" />
                      <span className="text-xs text-gray-600">Credit Score</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#00FF00] text-black text-xs font-semibold rounded flex items-center gap-1">
                      <ArrowUp className="size-3" />
                      5%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-black mb-1">
                    {scoreBreakdown.total}
                  </p>
                  <p className="text-xs text-gray-600">{getCreditScoreLabel(scoreBreakdown.total)}</p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">Previous: {Math.floor(scoreBreakdown.total * 0.95)}</p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-black mb-3 flex items-center gap-2">
                      <User className="size-4" />
                      PERSONAL INFORMATION
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Full Name</p>
                          <p className="text-xs font-semibold text-black">{client.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">National ID</p>
                          <p className="text-xs font-semibold text-black font-mono">{client.nationalId}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                          <p className="text-xs font-semibold text-black">{client.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Email</p>
                          <p className="text-xs font-semibold text-black">{client.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Business Type</p>
                          <p className="text-xs font-semibold text-black">{client.businessType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Branch</p>
                          <p className="text-xs font-semibold text-black">{client.branch}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Member Since</p>
                        <p className="text-xs font-semibold text-black">{client.joinDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-black mb-3 flex items-center gap-2">
                      <MapPin className="size-4" />
                      LOCATION
                    </h3>
                    {client.gpsLocation ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Latitude</p>
                            <p className="text-xs font-semibold text-black font-mono">{client.gpsLocation.lat.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Longitude</p>
                            <p className="text-xs font-semibold text-black font-mono">{client.gpsLocation.lng.toFixed(6)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleViewOnMap} 
                          className="w-full px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium"
                        >
                          View on Map
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">GPS location not available</p>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-black mb-3 flex items-center gap-2">
                      <CircleDollarSign className="size-4" />
                      FINANCIAL SUMMARY
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Total Loans</span>
                        <span className="text-xs font-bold text-black">{disbursedLoans.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Active Loans</span>
                        <span className="text-xs font-bold text-black">{activeLoans.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Paid Loans</span>
                        <span className="text-xs font-bold text-black">{paidLoans.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Total Payments Made</span>
                        <span className="text-xs font-bold text-black">{clientRepayments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Interest Paid</span>
                        <span className="text-xs font-bold text-black">{currencySymbol} {(totalInterestPaid / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                        <span className="text-xs text-gray-600">Repayment Rate</span>
                        <span className="text-xs font-bold text-[#00FF00]">
                          {totalBorrowed > 0 ? ((totalPaid / totalBorrowed) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Recent Activity */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-black mb-3 flex items-center gap-2">
                      <History className="size-4" />
                      RECENT ACTIVITY
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {clientRepayments.slice(-10).reverse().map((payment, idx) => {
                        const loan = loans.find(l => l.id === payment.loanId);
                        return (
                          <div key={idx} className="p-2 border border-gray-300 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="text-xs font-semibold text-black">Payment Received</p>
                                <p className="text-xs text-gray-600">
                                  {payment.date} • Loan ID: {formatLoanId(payment.loanId)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-[#00FF00]">
                                  +{currencySymbol} {safeNumber((payment.principal || 0) + (payment.interest || 0), 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600">{payment.method}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-black mb-3 flex items-center gap-2">
                      <FileText className="size-4" />
                      DOCUMENTS ({clientDocuments.length})
                    </h3>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {clientDocuments.length > 0 ? (
                        clientDocuments.map((doc) => (
                          <div key={doc.id} className="p-2 border border-gray-300 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-semibold text-black">{doc.type}</p>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                doc.status === 'Verified' ? 'bg-[#00FF00] text-black' :
                                doc.status === 'Rejected' ? 'bg-[#FF0000] text-white' :
                                'bg-gray-300 text-gray-600'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">Uploaded: {doc.uploadDate}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-600 text-center py-4">No documents uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Credit Score Breakdown */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-black mb-3 flex items-center gap-2">
                      <CreditCard className="size-4" />
                      CREDIT SCORE BREAKDOWN
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Total Score</span>
                        <span className="text-xs font-bold text-black">{scoreBreakdown.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Base Score</span>
                        <span className="text-xs font-bold text-black">{scoreBreakdown.baseScore}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Payment History</span>
                        <span className={`text-xs font-bold ${scoreBreakdown.paymentHistory >= 0 ? 'text-[#00FF00]' : 'text-[#FF0000]'}`}>
                          {scoreBreakdown.paymentHistory >= 0 ? '+' : ''}{scoreBreakdown.paymentHistory}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Repayment Consistency</span>
                        <span className="text-xs font-bold text-black">+{scoreBreakdown.repaymentConsistency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Credit Utilization</span>
                        <span className="text-xs font-bold text-black">+{scoreBreakdown.creditUtilization}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Credit History</span>
                        <span className="text-xs font-bold text-black">+{scoreBreakdown.creditHistory}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Active Loan Mgmt</span>
                        <span className={`text-xs font-bold ${scoreBreakdown.activeLoanManagement >= 0 ? 'text-[#00FF00]' : 'text-[#FF0000]'}`}>
                          {scoreBreakdown.activeLoanManagement >= 0 ? '+' : ''}{scoreBreakdown.activeLoanManagement}
                        </span>
                      </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="flex items-end gap-1 h-24">
                      {scoreBreakdown.breakdown.map((item, idx) => {
                        const maxValue = 300;
                        const height = Math.max((Math.abs(item.value) / maxValue) * 100, 5);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end h-20">
                              <div 
                                className="w-full bg-black rounded-t"
                                style={{ height: `${height}%` }}
                                title={`${item.name}: ${item.value}`}
                              />
                            </div>
                            <span className="text-[10px] text-gray-600 text-center">{item.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOANS TAB */}
          {activeTab === 'loans' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-black">LOAN PORTFOLIO</h3>
                <button 
                  onClick={handleNewLoan}
                  className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  New Loan Application
                </button>
              </div>

              {clientLoans.length > 0 ? (
                <div className="space-y-3">
                  {clientLoans.map((loan) => {
                    const progress = loan.principalAmount > 0 
                      ? ((loan.principalAmount - (loan.outstandingBalance || 0)) / loan.principalAmount) * 100 
                      : 0;
                    
                    return (
                      <div key={loan.id} className="bg-white border border-gray-300 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-black">Loan {formatLoanId(loan.id)}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getLoanStatusBadge(loan.status)}`}>
                                {loan.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {loan.productName} • Disbursed: {loan.disbursementDate || 'Pending'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewLoan(loan.id)}
                            className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium flex items-center gap-1"
                          >
                            <Eye className="size-3" />
                            View
                          </button>
                        </div>

                        <div className="grid grid-cols-5 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Principal</p>
                            <p className="text-xs font-bold text-black">{currencySymbol} {(loan.principalAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Outstanding</p>
                            <p className="text-xs font-bold text-[#FF0000]">{currencySymbol} {(loan.outstandingBalance || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Interest Rate</p>
                            <p className="text-xs font-bold text-black">{loan.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Loan Term</p>
                            <p className="text-xs font-bold text-black">{loan.loanTerm} {loan.loanTermUnit || 'Months'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Days Arrears</p>
                            <p className={`text-xs font-bold ${(loan.daysInArrears || 0) > 0 ? 'text-[#FF0000]' : 'text-[#00FF00]'}`}>
                              {loan.daysInArrears || 0}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Repayment Progress</span>
                            <span className="font-semibold text-black">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00FF00] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
                  <FileText className="size-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-xs text-gray-600 mb-4">No loans found for this client</p>
                  <button 
                    onClick={handleNewLoan}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium"
                  >
                    Create First Loan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black">PAYMENT HISTORY</h3>
              
              {clientRepayments.length > 0 ? (
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-300">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-black">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-black">Loan ID</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-black">Principal</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-black">Interest</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-black">Total</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-black">Method</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientRepayments.map((payment, idx) => (
                        <tr key={payment.id} className={`border-b border-gray-200 hover:bg-gray-50 ${idx === clientRepayments.length - 1 ? 'border-b-0' : ''}`}>
                          <td className="px-3 py-2 text-xs text-black">{payment.date}</td>
                          <td className="px-3 py-2 text-xs text-black font-mono">{formatLoanId(payment.loanId)}</td>
                          <td className="px-3 py-2 text-xs text-black">{currencySymbol} {(payment.principal || 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs text-black">{currencySymbol} {(payment.interest || 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs font-bold text-[#00FF00]">
                            {currencySymbol} {((payment.principal || 0) + (payment.interest || 0)).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-xs text-black">{payment.method}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-0.5 bg-[#00FF00] text-black text-xs font-semibold rounded uppercase">
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
                  <DollarSign className="size-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-xs text-gray-600">No payment history available</p>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-black">DOCUMENTS</h3>
                <button className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium flex items-center gap-2">
                  <Plus className="size-4" />
                  Upload Document
                </button>
              </div>

              {clientDocuments.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {clientDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="size-10 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="size-5 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-semibold text-black truncate">{doc.type}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 flex-shrink-0 ${
                              doc.status === 'Verified' ? 'bg-[#00FF00] text-black' :
                              doc.status === 'Rejected' ? 'bg-[#FF0000] text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Uploaded: {doc.uploadDate}</p>
                          <button className="text-xs text-black hover:underline font-medium">
                            View Document →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
                  <FileText className="size-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-xs text-gray-600 mb-4">No documents uploaded</p>
                  <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium">
                    Upload First Document
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CREDIT TAB */}
          {activeTab === 'credit' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black">CREDIT ANALYSIS</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Score Component Breakdown */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-black mb-4">SCORE COMPONENT BREAKDOWN</h4>
                  
                  {/* Simple Bar Chart */}
                  <div className="flex items-end gap-2 h-48 mb-3">
                    {scoreBreakdown.breakdown.map((item, idx) => {
                      const maxValue = 300;
                      const height = Math.max((Math.abs(item.value) / maxValue) * 100, 5);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end h-40">
                            <div 
                              className="w-full bg-black rounded-t bg-[#424141]"
                              style={{ height: `${height}%` }}
                              title={`${item.name}: ${item.value}`}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 text-center leading-tight">{item.name}</span>
                          <span className="text-[10px] font-bold text-black">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score Details */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-black mb-4">SCORE DETAILS</h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="border border-gray-300 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Total Score</p>
                      <p className="text-2xl font-bold text-black">{scoreBreakdown.total}</p>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Rating</p>
                      <p className="text-xl font-bold text-black">{getCreditScoreLabel(scoreBreakdown.total)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border border-gray-300 rounded">
                      <span className="text-xs text-gray-600">Closed Loans</span>
                      <span className="text-xs font-bold text-black">{paidLoans.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-gray-300 rounded">
                      <span className="text-xs text-gray-600">Loans in Arrears</span>
                      <span className="text-xs font-bold text-[#FF0000]">
                        {clientLoans.filter(l => l.status === 'In Arrears').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-gray-300 rounded">
                      <span className="text-xs text-gray-600">Total Repayments</span>
                      <span className="text-xs font-bold text-black">{clientRepayments.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-gray-300 rounded">
                      <span className="text-xs text-gray-600">Repayment Rate</span>
                      <span className="text-xs font-bold text-[#00FF00]">
                        {totalBorrowed > 0 ? ((totalPaid / totalBorrowed) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-gray-300 rounded">
                      <span className="text-xs text-gray-600">Account Age</span>
                      <span className="text-xs font-bold text-black">
                        {(() => {
                          if (clientLoans.length === 0) return '0 months';
                          const firstLoan = clientLoans.reduce((oldest, loan) => {
                            if (!loan.createdDate) return oldest;
                            if (!oldest || !oldest.createdDate) return loan;
                            return new Date(loan.createdDate) < new Date(oldest.createdDate) ? loan : oldest;
                          }, null as any);
                          if (!firstLoan || !firstLoan.createdDate) return '0 months';
                          const months = Math.floor(
                            (new Date().getTime() - new Date(firstLoan.createdDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
                          );
                          return isNaN(months) ? '0 months' : `${months} months`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-300 p-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={handleNewLoan}
              className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium flex items-center gap-2"
            >
              <Plus className="size-4" />
              New Loan
            </button>
            <button 
              onClick={handleSendSMS}
              className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-[#333333] transition-colors text-xs font-medium flex items-center gap-2"
            >
              <MessageSquare className="size-4" />
              Send SMS
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrintProfile}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium flex items-center gap-2"
            >
              <Printer className="size-4" />
              Print Profile
            </button>
            <button 
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}