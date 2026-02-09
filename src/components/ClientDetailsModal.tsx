import { X, User, Phone, MapPin, Briefcase, CreditCard, TrendingUp, Calendar, FileText, DollarSign, AlertTriangle, Target, Award, Clock, CheckCircle, Mail, Printer, MessageSquare, Plus, History } from 'lucide-react';
import { loanDocuments, Client } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { ModalWrapper } from './ModalWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { toast } from 'sonner';

interface ClientDetailsModalProps {
  clientId: string;
  onClose: () => void;
}

export function ClientDetailsModal({ clientId, onClose }: ClientDetailsModalProps) {
  const { isDark } = useTheme();
  const { clients, loans, payments, repayments } = useData();
  const { setCurrentView, setSelectedLoanId } = useNavigation();
  
  // Add mounted state to prevent chart rendering before container dimensions are ready
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state after component mounts
  useEffect(() => {
    // Use double requestAnimationFrame to ensure layout is fully complete
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

  const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'In Arrears');
  const totalBorrowed = clientLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);
  const onTimePayments = clientPayments.length; // Simplified
  const paymentRate = clientPayments.length > 0 ? 95 : 0; // Mock

  // Calculate credit score breakdown
  const calculateCreditScoreBreakdown = () => {
    const totalLoans = clientLoans.length;
    const closedLoans = clientLoans.filter(l => l.status === 'Fully Paid' || l.status === 'Closed').length;
    const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed').length;
    const loansInArrears = clientLoans.filter(l => l.status === 'In Arrears').length;
    
    // 1. Payment History (up to 240 points from base 300 + additions)
    let paymentHistoryScore = 0;
    paymentHistoryScore += closedLoans * 8; // Up to 40 points
    paymentHistoryScore -= loansInArrears * 50; // Penalty
    
    // 2. Repayment Consistency (up to 30 points)
    let repaymentConsistencyScore = 0;
    if (clientRepayments.length > 0) {
      repaymentConsistencyScore = Math.min(30, clientRepayments.length * 3);
    }
    
    // 3. Credit Utilization (up to 20 points)
    let creditUtilizationScore = 0;
    const totalRepaid = clientRepayments.reduce((sum, r) => sum + (r.principal || 0), 0);
    if (totalBorrowed > 0) {
      const repaymentRate = (totalRepaid / totalBorrowed) * 100;
      creditUtilizationScore = Math.min(20, Math.floor(repaymentRate / 5));
    }
    
    // 4. Credit History Length (up to 10 points)
    let creditHistoryScore = 0;
    const oldestLoan = clientLoans.reduce((oldest, loan) => {
      return !oldest || new Date(loan.createdDate) < new Date(oldest.createdDate) ? loan : oldest;
    }, null as any);
    
    if (oldestLoan) {
      const monthsSinceFirst = Math.floor(
        (new Date().getTime() - new Date(oldestLoan.createdDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      creditHistoryScore = Math.min(10, Math.floor(monthsSinceFirst / 3));
    }
    
    // 5. Active loan management (bonus/penalty)
    let activeLoanScore = 0;
    if (activeLoans > 0) {
      clientLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed').forEach(loan => {
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
        { name: 'Base Score', value: baseScore, color: '#8b5cf6', maxValue: 300 },
        { name: 'Payment History', value: Math.max(0, paymentHistoryScore), color: '#22c55e', maxValue: 40 },
        { name: 'Repayment Consistency', value: repaymentConsistencyScore, color: '#3b82f6', maxValue: 30 },
        { name: 'Credit Utilization', value: creditUtilizationScore, color: '#06b6d4', maxValue: 20 },
        { name: 'Credit History', value: creditHistoryScore, color: '#eab308', maxValue: 10 },
        { name: 'Active Loan Mgmt', value: activeLoanScore, color: activeLoanScore < 0 ? '#ef4444' : '#10b981', maxValue: 0 }
      ],
      details: {
        closedLoans,
        loansInArrears,
        totalRepayments: clientRepayments.length,
        repaymentRate: totalBorrowed > 0 ? ((totalRepaid / totalBorrowed) * 100).toFixed(1) : '0',
        accountAge: oldestLoan ? Math.floor((new Date().getTime() - new Date(oldestLoan.createdDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
      }
    };
  };

  const scoreBreakdown = calculateCreditScoreBreakdown();

  const getCreditScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-500';    // Excellent: 800-850
    if (score >= 740) return 'text-blue-500';     // Very Good: 740-799
    if (score >= 670) return 'text-cyan-500';     // Good: 670-739
    if (score >= 580) return 'text-yellow-500';   // Fair: 580-669
    if (score >= 300) return 'text-orange-500';   // Poor: 300-579
    return 'text-gray-500';                        // No history
  };

  const getCreditScoreLabel = (score: number) => {
    if (score >= 800) return 'Excellent';    // 800-850
    if (score >= 740) return 'Very Good';    // 740-799
    if (score >= 670) return 'Good';         // 670-739
    if (score >= 580) return 'Fair';         // 580-669
    if (score >= 300) return 'Poor';         // 300-579
    return 'No History';
  };

  const getCreditScoreBgColor = (score: number) => {
    if (score >= 800) return 'bg-green-500';      // Excellent: 800-850
    if (score >= 740) return 'bg-blue-500';       // Very Good: 740-799
    if (score >= 670) return 'bg-cyan-500';       // Good: 670-739
    if (score >= 580) return 'bg-yellow-500';     // Fair: 580-669
    if (score >= 300) return 'bg-orange-500';     // Poor: 300-579
    return 'bg-gray-500';                          // No history
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good Standing': return 'bg-emerald-100 text-emerald-800';
      case 'In Arrears': return 'bg-red-100 text-red-800';
      case 'Fully Paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handler for New Loan Application
  const handleNewLoan = () => {
    onClose();
    setCurrentView('loan-origination');
    toast.success(`Creating new loan for ${client.name}`);
  };

  // Handler for Send SMS
  const handleSendSMS = () => {
    toast.success(`SMS sent to ${client.phone}`);
  };

  // Handler for Print Profile
  const handlePrintProfile = () => {
    window.print();
    toast.success('Preparing profile for print');
  };

  // Handler for View on Map
  const handleViewOnMap = () => {
    if (client.gpsLocation) {
      window.open(`https://www.google.com/maps?q=${client.gpsLocation.lat},${client.gpsLocation.lng}`, '_blank');
    } else {
      toast.error('GPS location not available for this client');
    }
  };

  return (
    <ModalWrapper>
      <div className="flex flex-col h-[90vh] max-h-[800px]">
        {/* Professional Header with Gradient */}
        <div className="p-5 border-b-2 border-emerald-600/20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 flex-shrink-0 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="size-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white overflow-hidden shadow-lg ring-4 ring-white/20">
                {client.photo ? (
                  <img src={client.photo} alt={client.name} className="size-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">{client.name.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold tracking-wide">{client.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-emerald-300 font-mono text-sm bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                    {client.clientNumber || client.client_number || `CL${client.id.slice(-5)}`}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium shadow-sm ${
                    client.status === 'active' ? 'bg-emerald-500 text-white' :
                    client.status === 'In Arrears' ? 'bg-red-500 text-white' :
                    client.status === 'Fully Paid' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {client.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Compact Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Personal Info & Credit Score Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                    <User className="size-4 text-blue-600 dark:text-blue-400" />
                    Personal Info
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">National ID:</span>
                      <span className="text-gray-900 dark:text-white">{client.nationalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                      <span className="text-gray-900 dark:text-white">{client.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Business:</span>
                      <span className="text-gray-900 dark:text-white text-right">{client.businessType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Branch:</span>
                      <span className="text-gray-900 dark:text-white">{client.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Join Date:</span>
                      <span className="text-gray-900 dark:text-white">{client.joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* Credit Score Compact */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                    <CreditCard className="size-4 text-purple-600 dark:text-purple-400" />
                    Credit Score
                  </h3>
                  <div className="text-center">
                    <div className={`text-4xl mb-1 font-bold ${getCreditScoreColor(client.creditScore || 300)}`}>
                      {client.creditScore || 300}
                    </div>
                    <div className={`text-sm mb-2 font-medium ${getCreditScoreColor(client.creditScore || 300)}`}>
                      {getCreditScoreLabel(client.creditScore || 300)}
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getCreditScoreBgColor(client.creditScore || 300)}`}
                        style={{ width: `${((client.creditScore || 300) - 300) / (850 - 300) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Financial Summary
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-blue-600 dark:text-blue-400 text-xs">Borrowed</p>
                    <p className="text-blue-900 dark:text-blue-300 text-sm mt-0.5">KES {(totalBorrowed / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                    <p className="text-amber-600 dark:text-amber-400 text-xs">Outstanding</p>
                    <p className="text-amber-900 dark:text-amber-300 text-sm mt-0.5">KES {(totalOutstanding / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                    <p className="text-emerald-600 dark:text-emerald-400 text-xs">Paid</p>
                    <p className="text-emerald-900 dark:text-emerald-300 text-sm mt-0.5">KES {(totalPaid / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <p className="text-purple-600 dark:text-purple-400 text-xs">Rate</p>
                    <p className="text-purple-900 dark:text-purple-300 text-sm mt-0.5">{paymentRate}%</p>
                  </div>
                </div>
              </div>

              {/* Loan History Compact */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex-1">
                <h3 className="text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <FileText className="size-4 text-blue-600 dark:text-blue-400" />
                  Loan History ({clientLoans.length})
                </h3>
                <div className="overflow-auto max-h-[200px]">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-gray-700 dark:text-gray-300">ID</th>
                        <th className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">Principal</th>
                        <th className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">Balance</th>
                        <th className="px-2 py-1.5 text-center text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientLoans.map((loan) => (
                        <tr key={loan.id} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="px-2 py-1.5 text-gray-900 dark:text-white">{loan.id}</td>
                          <td className="px-2 py-1.5 text-right text-gray-900 dark:text-white">
                            {(loan.principalAmount / 1000).toFixed(0)}K
                          </td>
                          <td className="px-2 py-1.5 text-right text-gray-900 dark:text-white">
                            {(loan.outstandingBalance / 1000).toFixed(0)}K
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${ 
                              loan.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                              loan.status === 'In Arrears' ? 'bg-red-100 text-red-800' :
                              loan.status === 'Fully Paid' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Recent Payments */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Recent Payments (Last 10)
                </h3>
                <div className="space-y-1.5 max-h-[180px] overflow-auto">
                  {clientPayments.slice(-10).reverse().map((payment) => {
                    const loan = loans.find(l => l.id === payment.loanId);
                    return (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                        <div>
                          <p className="text-gray-900 dark:text-white">{payment.date}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">{loan?.id} • {payment.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-900 dark:text-emerald-300">KES {(payment.amount / 1000).toFixed(1)}K</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">#{payment.installmentNumber}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents & Location Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Documents */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                    <FileText className="size-4 text-amber-600 dark:text-amber-400" />
                    Documents ({clientDocuments.length})
                  </h3>
                  <div className="space-y-1.5 max-h-[100px] overflow-auto">
                    {clientDocuments.map((doc) => (
                      <div key={doc.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-gray-900 dark:text-white text-xs">{doc.type}</p>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                            doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{doc.uploadDate}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-900 dark:text-white text-sm mb-2">Location</h3>
                  <div className="text-xs">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">GPS Coordinates</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                      {client.gpsLocation ? (
                        <>Lat: {client.gpsLocation.lat.toFixed(4)}<br/>Lng: {client.gpsLocation.lng.toFixed(4)}</>
                      ) : (
                        'Not available'
                      )}
                    </p>
                    <button onClick={handleViewOnMap} className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      View on Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Credit Score Breakdown */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-1.5">
                  <CreditCard className="size-4 text-purple-600 dark:text-purple-400" />
                  Credit Score Breakdown
                </h3>
                <div className="space-y-1.5 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Score:</span>
                    <span className={`${getCreditScoreColor(scoreBreakdown.total)}`}>{scoreBreakdown.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Base Score:</span>
                    <span className="text-gray-900 dark:text-white">{scoreBreakdown.baseScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Payment History:</span>
                    <span className="text-gray-900 dark:text-white">{scoreBreakdown.paymentHistory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Repayment Consistency:</span>
                    <span className="text-gray-900 dark:text-white">{scoreBreakdown.repaymentConsistency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Credit Utilization:</span>
                    <span className="text-gray-900 dark:text-white">{scoreBreakdown.creditUtilization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Credit History:</span>
                    <span className="text-gray-900 dark:text-white">{scoreBreakdown.creditHistory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Active Loan Mgmt:</span>
                    <span className="text-gray-900 dark:text-white">{scoreBreakdown.activeLoanManagement}</span>
                  </div>
                </div>
                <div className="h-[160px]">
                  {isMounted && <ResponsiveContainer width="100%" height={160} aspect={undefined}>
                    <BarChart
                      data={scoreBreakdown.breakdown}
                      margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 9 }}
                        stroke="#9ca3af"
                      />
                      <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {scoreBreakdown.breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          <div className="flex gap-2">
            <button onClick={handleNewLoan} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              New Loan Application
            </button>
            <button onClick={handleSendSMS} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Send SMS
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrintProfile} className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
              Print Profile
            </button>
            <button onClick={onClose} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}