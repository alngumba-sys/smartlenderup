import React, { useState } from 'react';
import { Building2, Users, TrendingUp, DollarSign, AlertTriangle, ChevronRight, ArrowLeft, Plus, Edit2, Trash2, AlertCircle, ExternalLink, Copy, Check, UserPlus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { AddInstitutionModal } from '../modals/AddInstitutionModal';
import { AssignClientsModal } from '../modals/AssignClientsModal';
import { toast } from 'sonner@2.0.3';

export function InstitutionsTab() {
  const { isDark } = useTheme();
  const { clients, loans, institutions, addInstitution, updateInstitution, deleteInstitution } = useData();
  const { currentOrganization } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<any>(null);
  const [showSetupBanner, setShowSetupBanner] = useState(true);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [assigningInstitution, setAssigningInstitution] = useState<any>(null);

  // Get currency symbol based on organization currency
  const getCurrencySymbol = (currency: string): string => {
    const symbols: { [key: string]: string } = {
      'KES': 'KSh',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ZAR': 'R',
      'NGN': '₦',
      'TZS': 'TSh',
      'UGX': 'USh',
      'RWF': 'FRw',
      'ETB': 'Br',
      'GHS': 'GH₵',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'MWK': 'MK'
    };
    return symbols[currency] || currency;
  };

  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${getCurrencySymbol(currentOrganization?.currency || 'KES')} 0`;
    }
    
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `${getCurrencySymbol(currentOrganization?.currency || 'KES')} ${formatted}`;
  };

  // Generate AI insight for an institution
  const getAIInsight = (data: any): string => {
    const { clientCount, activeLoans, parRate, totalOutstanding, totalDisbursed, paidLoans, loanCount, avgCreditScore } = data;
    
    // Calculate repayment rate
    const repaymentRate = loanCount > 0 ? (paidLoans / loanCount) * 100 : 0;
    
    // Calculate average loan per client
    const avgLoanPerClient = clientCount > 0 ? activeLoans / clientCount : 0;
    
    // Generate insight based on data patterns
    if (parRate === 0 && activeLoans > 0) {
      return `✨ Excellent performance! All ${activeLoans} active loans are current with zero delinquency.`;
    } else if (parRate < 2) {
      return `💚 Strong portfolio health with ${parRate.toFixed(1)}% PAR - well below industry average.`;
    } else if (parRate > 10) {
      return `⚠️ High risk: ${parRate.toFixed(1)}% PAR requires immediate attention to prevent defaults.`;
    } else if (repaymentRate > 80 && paidLoans > 5) {
      return `📈 ${repaymentRate.toFixed(0)}% loan completion rate demonstrates excellent client reliability.`;
    } else if (avgCreditScore > 700) {
      return `⭐ Premium client base with ${avgCreditScore.toFixed(0)} avg credit score - ideal for growth.`;
    } else if (avgLoanPerClient > 1.5) {
      return `🔄 High engagement: Clients averaging ${avgLoanPerClient.toFixed(1)} loans - strong repeat business.`;
    } else if (totalOutstanding > totalDisbursed * 0.7 && activeLoans > 0) {
      return `💰 ${((totalOutstanding/totalDisbursed)*100).toFixed(0)}% of disbursed amount outstanding - healthy loan utilization.`;
    } else if (clientCount > 20) {
      return `🎯 Large portfolio of ${clientCount} clients provides good risk diversification.`;
    } else if (activeLoans === 0 && clientCount > 0) {
      return `💡 Opportunity: ${clientCount} dormant clients ready for re-engagement campaigns.`;
    } else {
      return `📊 Stable institution with ${clientCount} clients and ${formatCurrency(totalOutstanding)} in play.`;
    }
  };

  // Group clients by employer/institution
  const getInstitutions = () => {
    const institutionMap: { [key: string]: any[] } = {};
    
    clients.forEach(client => {
      const institution = client.employer || 'Self-Employed';
      if (!institutionMap[institution]) {
        institutionMap[institution] = [];
      }
      institutionMap[institution].push(client);
    });

    // Convert to array and calculate metrics
    return Object.entries(institutionMap)
      .map(([name, institutionClients]) => {
        // Get all loans for clients in this institution
        const clientIds = institutionClients.map(c => c.id);
        const institutionLoans = loans.filter(l => {
          const loanClientUuid = l.clientUuid || l.client_uuid;
          return clientIds.includes(loanClientUuid);
        });
        
        // Calculate metrics
        // Note: Status values are capitalized (Active, Pending, Paid, etc.)
        const activeLoans = institutionLoans.filter(l => {
          const status = l.status || '';
          return status === 'Active' || status === 'In Arrears' || status === 'Disbursed';
        });
        
        const totalDisbursed = institutionLoans
          .filter(l => {
            const status = l.status || '';
            // Only count loans that have actually been disbursed
            return (status === 'Disbursed' || status === 'Active' || status === 'In Arrears' || 
                    status === 'Completed' || status === 'Paid' || status === 'Defaulted') && 
                   (l.disbursementDate || l.disbursement_date || l.disbursedDate || l.disbursed_date);
          })
          .reduce((sum, l) => sum + (l.principalAmount || l.principal_amount || l.amount || 0), 0);
        
        const totalOutstanding = activeLoans.reduce((sum, l) => {
          const balance = l.outstandingBalance || l.outstanding_balance || l.balance || 0;
          return sum + balance;
        }, 0);
        
        const paidLoans = institutionLoans.filter(l => {
          const status = l.status || '';
          return status === 'Paid' || status === 'Completed' || status === 'Fully Paid';
        });
        
        // Calculate PAR (Portfolio at Risk - loans overdue > 30 days)
        const today = new Date();
        const parLoans = activeLoans.filter(l => {
          if (!l.nextPaymentDate) return false;
          const nextPaymentDate = new Date(l.nextPaymentDate);
          const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysOverdue > 30;
        });
        const parAmount = parLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
        const parRate = totalOutstanding > 0 ? (parAmount / totalOutstanding) * 100 : 0;

        // Calculate average credit score
        const avgCreditScore = institutionClients.reduce((sum, c) => sum + (c.creditScore || 0), 0) / institutionClients.length;

        return {
          name,
          clientCount: institutionClients.length,
          clients: institutionClients,
          loanCount: institutionLoans.length,
          activeLoans: activeLoans.length,
          paidLoans: paidLoans.length,
          totalDisbursed,
          totalOutstanding,
          parRate,
          parAmount,
          avgCreditScore
        };
      })
      .sort((a, b) => b.totalDisbursed - a.totalDisbursed); // Sort by total disbursed
  };

  const institutionsList = getInstitutions();
  
  // Build institution data for detail view
  const getInstitutionData = () => {
    if (!selectedInstitution) return null;
    
    // Check if it's from the grouped list (by employer)
    const groupedInst = institutionsList.find(i => i.name === selectedInstitution);
    if (groupedInst) return groupedInst;
    
    // Check if it's a managed institution (by institutionId)
    const managedInst = institutions.find(i => i.name === selectedInstitution);
    if (managedInst) {
      // Build the metrics for this managed institution
      const institutionClients = clients.filter(c => c.institutionId === managedInst.id);
      const clientIds = institutionClients.map(c => c.id);
      const institutionLoans = loans.filter(l => {
        const loanClientUuid = l.clientUuid || l.client_uuid;
        return clientIds.includes(loanClientUuid);
      });
      
      const activeLoans = institutionLoans.filter(l => {
        const status = l.status || '';
        return status === 'Active' || status === 'In Arrears' || status === 'Disbursed';
      });
      
      const totalDisbursed = institutionLoans
        .filter(l => {
          const status = l.status || '';
          return (status === 'Disbursed' || status === 'Active' || status === 'In Arrears' || 
                  status === 'Completed' || status === 'Paid' || status === 'Defaulted') && 
                 (l.disbursementDate || l.disbursement_date || l.disbursedDate || l.disbursed_date);
        })
        .reduce((sum, l) => sum + (l.principalAmount || l.principal_amount || l.amount || 0), 0);
      
      const totalOutstanding = activeLoans.reduce((sum, l) => {
        const balance = l.outstandingBalance || l.outstanding_balance || l.balance || 0;
        return sum + balance;
      }, 0);
      
      const paidLoans = institutionLoans.filter(l => {
        const status = l.status || '';
        return status === 'Paid' || status === 'Completed' || status === 'Fully Paid';
      });
      
      // Calculate PAR
      const today = new Date();
      const parLoans = activeLoans.filter(l => {
        if (!l.nextPaymentDate) return false;
        const nextPaymentDate = new Date(l.nextPaymentDate);
        const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysOverdue > 30;
      });
      const parAmount = parLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
      const parRate = totalOutstanding > 0 ? (parAmount / totalOutstanding) * 100 : 0;
      
      const avgCreditScore = institutionClients.length > 0 
        ? institutionClients.reduce((sum, c) => sum + (c.creditScore || 0), 0) / institutionClients.length 
        : 0;
      
      return {
        name: managedInst.name,
        clientCount: institutionClients.length,
        clients: institutionClients,
        loanCount: institutionLoans.length,
        activeLoans: activeLoans.length,
        paidLoans: paidLoans.length,
        totalDisbursed,
        totalOutstanding,
        parRate,
        parAmount,
        avgCreditScore
      };
    }
    
    return null;
  };
  
  const selectedInst = getInstitutionData();

  // If an institution is selected, show detail view
  if (selectedInstitution && selectedInst) {
    const institutionClients = selectedInst.clients;
    const clientIds = institutionClients.map((c: any) => c.id);
    const institutionLoans = loans.filter(l => {
      const loanClientUuid = l.clientUuid || l.client_uuid;
      return clientIds.includes(loanClientUuid);
    });

    // Debug logging
    console.log('Institution:', selectedInstitution);
    console.log('Client IDs:', clientIds);
    console.log('All loans sample:', loans.slice(0, 3));
    console.log('First loan full object:', loans[0]);
    console.log('Filtered institution loans:', institutionLoans);
    console.log('Institution clients:', institutionClients);

    return (
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm p-6`}>
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedInstitution(null)}
            className={`flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <ArrowLeft className="size-4" />
            Back to Institutions
          </button>
          
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-700/30' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200'}`}>
              <Building2 className={`size-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedInst.name}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Institution Performance Overview
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Users className={`size-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Clients</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedInst.clientCount}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={`size-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Loans</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {selectedInst.activeLoans}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={`size-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Disbursed</span>
            </div>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(selectedInst.totalDisbursed)}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`size-4 ${selectedInst.parRate > 5 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-cyan-400' : 'text-cyan-600')}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>PAR Rate</span>
            </div>
            <p className={`text-2xl font-bold ${selectedInst.parRate > 5 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-cyan-400' : 'text-cyan-600')}`}>
              {selectedInst.parRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Outstanding Balance</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(selectedInst.totalOutstanding)}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Avg Credit Score</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedInst.avgCreditScore.toFixed(0)}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Loans</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedInst.loanCount} <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>({selectedInst.paidLoans} paid)</span>
            </p>
          </div>
        </div>

        {/* AI Insight */}
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 mb-6">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>AI Insight</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {getAIInsight(selectedInst)}
          </p>
        </div>

        {/* Clients List */}
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
            Clients ({selectedInst.clientCount})
          </h3>
          <div className={`overflow-hidden rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Client Name
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Phone
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Credit Score
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Active Loans
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Outstanding
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {selectedInst.clients.map((client: any) => {
                  const clientLoans = institutionLoans.filter(l => (l.clientUuid || l.client_uuid) === client.id);
                  const activeClientLoans = clientLoans.filter(l => 
                    l.status === 'Active' || l.status === 'In Arrears' || l.status === 'Disbursed'
                  );
                  const clientOutstanding = activeClientLoans.reduce((sum, l) => sum + (l.outstandingBalance || l.outstanding_balance || l.balance || 0), 0);

                  return (
                    <tr key={client.id} className={isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {client.name}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {client.phone}
                      </td>
                      <td className={`px-4 py-3 text-sm`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.creditScore >= 700 
                            ? isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-100 text-cyan-800'
                            : client.creditScore >= 600
                            ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                            : isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {client.creditScore}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {activeClientLoans.length}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(clientOutstanding)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Main view - list of all institutions
  return (
    <>
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm p-6`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Institutions & Organizations
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Manage institutions and view client groupings
            </p>
          </div>
          <button
            onClick={() => {
              setEditingInstitution(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="size-4" />
            Add Institution
          </button>
        </div>

        {/* Two Column Layout: Managed Institutions | Client Groupings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Managed Institutions Section */}
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
              <Building2 className="size-4" />
              Managed Institutions ({institutions.length})
            </h3>
            <div className="space-y-3">
              {institutions.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'} border-2 border-dashed rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <Building2 className="size-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No managed institutions</p>
                  <p className="text-xs mt-1">Click "Add Institution" to create one</p>
                </div>
              ) : (
                institutions.map((institution) => {
                  // Get clients assigned to this institution
                  const institutionClients = clients.filter(c => c.institutionId === institution.id);
                  const clientIds = institutionClients.map(c => c.id);
                  const institutionLoans = loans.filter(l => {
                    const loanClientUuid = l.clientUuid || l.client_uuid;
                    return clientIds.includes(loanClientUuid);
                  });
                  
                  const activeLoans = institutionLoans.filter(l => {
                    const status = l.status || '';
                    return status === 'Active' || status === 'In Arrears' || status === 'Disbursed';
                  });
                  
                  const totalDisbursed = institutionLoans
                    .filter(l => {
                      const status = l.status || '';
                      return (status === 'Disbursed' || status === 'Active' || status === 'In Arrears' || 
                              status === 'Completed' || status === 'Paid' || status === 'Defaulted') && 
                             (l.disbursementDate || l.disbursement_date || l.disbursedDate || l.disbursed_date);
                    })
                    .reduce((sum, l) => sum + (l.principalAmount || l.principal_amount || l.amount || 0), 0);
                  
                  const totalOutstanding = activeLoans.reduce((sum, l) => {
                    const balance = l.outstandingBalance || l.outstanding_balance || l.balance || 0;
                    return sum + balance;
                  }, 0);

                  const paidLoans = institutionLoans.filter(l => {
                    const status = l.status || '';
                    return status === 'Paid' || status === 'Completed' || status === 'Fully Paid';
                  });

                  const today = new Date();
                  const parLoans = activeLoans.filter(l => {
                    if (!l.nextPaymentDate) return false;
                    const nextPaymentDate = new Date(l.nextPaymentDate);
                    const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
                    return daysOverdue > 30;
                  });
                  const parAmount = parLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
                  const parRate = totalOutstanding > 0 ? (parAmount / totalOutstanding) * 100 : 0;

                  const avgCreditScore = institutionClients.length > 0 
                    ? institutionClients.reduce((sum, c) => sum + (c.creditScore || 0), 0) / institutionClients.length 
                    : 0;

                  const institutionData = {
                    clientCount: institutionClients.length,
                    activeLoans: activeLoans.length,
                    parRate,
                    totalOutstanding,
                    totalDisbursed,
                    paidLoans: paidLoans.length,
                    loanCount: institutionLoans.length,
                    avgCreditScore
                  };

                  return (
                    <div
                      key={institution.id}
                      onClick={() => setSelectedInstitution(institution.name)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isDark 
                          ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-700/30 hover:bg-emerald-900/30 hover:border-emerald-600/50' 
                          : 'bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2.5 rounded-lg ${isDark ? 'bg-emerald-900/40' : 'bg-emerald-100'}`}>
                            <Building2 className={`size-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                              {institution.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {institution.type}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                institution.status === 'Active'
                                  ? isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-100 text-cyan-800'
                                  : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {institution.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningInstitution(institution);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-emerald-900/20 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'
                            }`}
                            title="Add clients"
                          >
                            <UserPlus className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingInstitution(institution);
                              setShowAddModal(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (institutionClients.length > 0) {
                                toast.error(`Cannot delete institution with ${institutionClients.length} assigned client(s)`);
                              } else if (confirm(`Are you sure you want to delete "${institution.name}"?`)) {
                                deleteInstitution(institution.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                            }`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Clients</p>
                          <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {institutionClients.length}
                          </p>
                        </div>
                        
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Active Loans</p>
                          <p className={`text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            {activeLoans.length}
                          </p>
                        </div>
                        
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Disbursed</p>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(totalDisbursed)}
                          </p>
                        </div>
                      </div>

                      {/* AI Insight */}
                      <div className={`p-2.5 rounded-lg text-xs ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-white/80 text-gray-600'}`}>
                        {getAIInsight(institutionData)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Client Groupings by Employer */}
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
              Client Groupings by Employer ({institutionsList.length})
            </h3>
            <div className="space-y-3">
              {institutionsList.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'} border-2 border-dashed rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <Building2 className="size-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No client groupings by employer</p>
                  <p className="text-xs mt-1">Add clients to institutions to see groupings</p>
                </div>
              ) : (
                institutionsList.map((institution) => (
                  <div
                    key={institution.name}
                    onClick={() => setSelectedInstitution(institution.name)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-emerald-500/50' 
                        : 'bg-white border-gray-200 hover:border-emerald-500 hover:shadow-emerald-100'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2.5 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <Building2 className={`size-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                          {institution.name}
                        </h3>
                      </div>
                      
                      <ChevronRight className={`size-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0`} />
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Clients</p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {institution.clientCount}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Active Loans</p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                          {institution.activeLoans}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Disbursed</p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(institution.totalDisbursed)}
                        </p>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className={`p-2.5 rounded-lg text-xs ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                      {getAIInsight(institution)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Institution Modal */}
      <AddInstitutionModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingInstitution(null);
        }}
        onSubmit={async (institutionData) => {
          if (editingInstitution) {
            await updateInstitution(editingInstitution.id, institutionData);
          } else {
            await addInstitution(institutionData);
          }
          setShowAddModal(false);
          setEditingInstitution(null);
        }}
        editingInstitution={editingInstitution}
      />

      {/* Assign Clients Modal */}
      {assigningInstitution && (
        <AssignClientsModal
          institution={assigningInstitution}
          onClose={() => setAssigningInstitution(null)}
        />
      )}
    </>
  );
}