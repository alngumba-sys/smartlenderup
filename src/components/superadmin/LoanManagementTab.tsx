import { useState, useEffect } from 'react';
import { Search, Eye, X, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, Ban, RefreshCw } from 'lucide-react';
import { db } from '../../utils/database';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// Currency formatting helper
const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    'KES': 'KES',
    'UGX': 'UGX',
    'TZS': 'TZS',
    'RWF': 'RWF',
    'ETB': 'ETB',
    'ZAR': 'R',
    'NGN': '₦',
    'GHS': 'GH₵',
    'ZMW': 'ZMW',
    'BWP': 'P',
    'MWK': 'MK',
    'MZN': 'MT',
    'ZWL': 'ZWL',
    'USD': '$'
  };
  return symbols[currency] || currency;
};

export function LoanManagementTab() {
  const [loans, setLoans] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'rejected'>('all');
  const [phaseFilter, setPhaseFilter] = useState<'all' | 'application' | 'review' | 'approval' | 'disbursement' | 'repayment'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const itemsPerPage = 10;

  // Refresh loans when component mounts
  useEffect(() => {
    refreshLoans();
    refreshClientsAndOrgs();
  }, []);

  const refreshClientsAndOrgs = async () => {
    try {
      // Fetch clients
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData) setClients(clientsData);

      // Fetch organizations
      const { data: orgsData } = await supabase.from('organizations').select('*');
      if (orgsData) setOrganizations(orgsData);
    } catch (error) {
      console.error('Error fetching clients/orgs:', error);
    }
  };

  const refreshLoans = async () => {
    console.log('🔄 Fetching loans from Supabase...');
    
    try {
      // Fetch ONLY from Supabase
      const { data: supabaseLoans, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        toast.error('Failed to fetch loans from Supabase');
        setLoans([]);
        return;
      }
      
      console.log('✅ Fetched from Supabase:', supabaseLoans?.length || 0);
      
      // Debug: Log first loan to see structure
      if (supabaseLoans && supabaseLoans.length > 0) {
        console.log('🔍 Sample loan data:', supabaseLoans[0]);
        console.log('📊 Loan phases:', supabaseLoans.map(l => l.phase));
        console.log('📊 Loan statuses:', supabaseLoans.map(l => l.status));
      }
      
      // Normalize Supabase data to match expected structure
      const normalizedLoans = (supabaseLoans || []).map(loan => ({
        ...loan,
        // Map field names that might differ
        loan_number: loan.loan_number || loan.id,
        principal_amount: loan.principal_amount || loan.amount || 0,
        loan_term_months: loan.loan_term_months || loan.term_months || 0,
        interest_rate: loan.interest_rate || loan.rate || 0,
        total_repayable: loan.total_repayable || loan.total_amount || 0,
        total_paid: loan.total_paid || 0,
        balance: loan.balance || (loan.total_repayable || loan.total_amount || 0) - (loan.total_paid || 0),
      }));
      
      setLoans(normalizedLoans);
    } catch (error) {
      console.error('❌ Error refreshing loans:', error);
      toast.error('Failed to refresh loans');
      setLoans([]);
    }
  };

  // Get currency for a loan based on its organization
  const getLoanCurrency = (loan: any): string => {
    if (!loan?.organization_id) return 'KES';
    const org = organizations.find(o => o.id === loan.organization_id);
    return org?.currency || 'KES';
  };

  // Format amount with currency
  const formatCurrency = (amount: number, currency: string): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${getCurrencySymbol(currency)} 0`;
    }
    return `${getCurrencySymbol(currency)} ${amount.toLocaleString()}`;
  };

  // Normalize status to handle both capitalized and lowercase
  const normalizeStatus = (status: string) => {
    if (!status) return 'pending';
    const normalized = status.toLowerCase().trim();
    // Handle "Written Off" vs "written_off"
    if (normalized === 'written off' || normalized === 'written_off') return 'written_off';
    return normalized;
  };

  // Normalize phase and provide defaults based on status
  const normalizePhase = (loan: any) => {
    if (loan.phase && typeof loan.phase === 'string' && ['application', 'review', 'approval', 'disbursement', 'repayment'].includes(loan.phase.toLowerCase())) {
      return loan.phase.toLowerCase();
    }
    
    // Default phases based on status
    const status = normalizeStatus(loan.status);
    switch (status) {
      case 'pending':
        return 'application';
      case 'approved':
        return 'approval';
      case 'disbursed':
      case 'active':
        return 'disbursement';
      case 'completed':
      case 'defaulted':
      case 'written_off':
        return 'repayment';
      case 'rejected':
        return 'review';
      default:
        return 'application';
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.loan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
    // Normalize status for comparison - handle both "Written Off" and "written_off", etc.
    const matchesStatus = statusFilter === 'all' || normalizeStatus(loan.status) === statusFilter;
    const matchesPhase = phaseFilter === 'all' || normalizePhase(loan) === phaseFilter;
    const matchesCountry = countryFilter === 'all' || loan.organization_id === organizations.find(o => o.country === countryFilter)?.id;
    return matchesSearch && matchesStatus && matchesPhase && matchesCountry;
  });

  const getStatusColor = (status: string) => {
    // Normalize status to lowercase with underscores
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedStatus) {
      case 'completed': return '#10b981';
      case 'active': case 'disbursed': return '#3b82f6';
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'defaulted': return '#ef4444';
      case 'rejected': case 'written_off': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getClient = (clientId: string) => {
    if (!clientId) return 'N/A';
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'Unknown';
    return client.client_type === 'individual'
      ? `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'N/A'
      : client.group_name || 'N/A';
  };

  const getOrganization = (orgId: string) => {
    if (!orgId) return 'N/A';
    const org = organizations.find(o => o.id === orgId);
    return org?.organization_name || 'Unknown';
  };

  // Helper function to normalize status for counting
  const normalizeStatusForCounting = (status: string) => status?.toLowerCase().replace(/\s+/g, '_');

  // Calculate statistics
  const totalDisbursed = loans.filter(l => {
    const status = normalizeStatusForCounting(l.status);
    return status === 'disbursed' || status === 'active' || status === 'completed';
  }).reduce((sum, l) => sum + (l.principal_amount || 0), 0);
  
  const defaultRate = loans.length > 0 ? (loans.filter(l => normalizeStatusForCounting(l.status) === 'defaulted').length / loans.length * 100).toFixed(1) : '0.0';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Loan Management</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Track all loans across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshLoans}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ backgroundColor: '#0f1829', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            title="Refresh loans list"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: '#0f1829', color: '#e8d1c9' }}>
            Total Loans: <span className="font-bold" style={{ color: '#3b82f6' }}>{loans.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'rgba(232, 209, 201, 0.4)' }} />
          <input
            type="text"
            placeholder="Search by loan number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#1e2d3d',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#1e2d3d',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="defaulted">Defaulted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#1e2d3d',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Phases</option>
            <option value="application">Application</option>
            <option value="review">Review</option>
            <option value="approval">Approval</option>
            <option value="disbursement">Disbursement</option>
            <option value="repayment">Repayment</option>
          </select>
        </div>

        <div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#1e2d3d',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Countries</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats by Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {['pending', 'approved', 'disbursed', 'active', 'completed', 'defaulted', 'rejected', 'written_off'].map(status => {
          const count = loans.filter(l => normalizeStatus(l.status) === status).length;
          return (
            <div key={status} className="p-3 rounded-lg" style={{ backgroundColor: '#0f2638', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
              <p className="text-xs mb-1 capitalize" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{status.replace('_', ' ')}</p>
              <p className="text-xl font-bold" style={{ color: getStatusColor(status) }}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Stats by Phase */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {['application', 'review', 'approval', 'disbursement', 'repayment'].map(phase => {
          const count = loans.filter(l => normalizePhase(l) === phase).length;
          return (
            <div key={phase} className="p-4 rounded-lg" style={{ backgroundColor: '#0f2638', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
              <p className="text-xs mb-2 capitalize" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{phase} Phase</p>
              <p className="text-2xl font-bold" style={{ color: '#94b8d3' }}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-lg" style={{ backgroundColor: '#0d1929', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Disbursed</p>
          <p className="text-2xl font-bold" style={{ color: '#94b8d3' }}>KES {totalDisbursed.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-lg" style={{ backgroundColor: '#0d1929', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Default Rate</p>
          <p className="text-2xl font-bold" style={{ color: '#94b8d3' }}>{defaultRate}%</p>
        </div>
        <div className="p-5 rounded-lg" style={{ backgroundColor: '#0d1929', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Avg Loan Size</p>
          <p className="text-2xl font-bold" style={{ color: '#94b8d3' }}>
            KES {loans.length > 0 ? Math.round(loans.reduce((sum, l) => sum + (l.principal_amount || 0), 0) / loans.length).toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* Loans Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#154F73' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Loan Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Lender</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Phase</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  No loans found
                </td>
              </tr>
            ) : (
              filteredLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((loan, index) => (
                <tr 
                  key={loan.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#032b43' : '#020838',
                    borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono font-medium" style={{ color: '#e8d1c9' }}>{loan.loan_number || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: '#e8d1c9' }}>{getOrganization(loan.organization_id)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{formatCurrency(loan.principal_amount, getLoanCurrency(loan))}</p>
                    <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{loan.loan_term_months || 0} months @ {loan.interest_rate || 0}%</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1.5 rounded-lg capitalize font-medium" style={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6'
                    }}>
                      {normalizePhase(loan)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(loan.status || '') }}>
                      {loan.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="p-1.5 rounded hover:opacity-70"
                      style={{ color: '#3b82f6' }}
                      title="View Details"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg transition-all"
          style={{ backgroundColor: '#0f1829', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}
        >
          Previous
        </button>
        <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: '#0f1829', color: '#e8d1c9' }}>
          Page {currentPage} of {Math.ceil(filteredLoans.length / itemsPerPage)}
        </div>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= filteredLoans.length}
          className="px-4 py-2 rounded-lg transition-all"
          style={{ backgroundColor: '#0f1829', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}
        >
          Next
        </button>
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (() => {
        const client = db.getAllClients().find(c => c.id === selectedLoan.client_id);
        const org = db.getAllOrganizations().find(o => o.id === selectedLoan.organization_id);
        const repayments = db.getAllRepayments().filter(r => r.loan_id === selectedLoan.id);
        const currency = getLoanCurrency(selectedLoan);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(2, 8, 56, 0.95)' }}>
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl" style={{ backgroundColor: '#032b43', border: '1px solid rgba(236, 115, 71, 0.3)' }}>
              <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#154F73', borderBottom: '1px solid rgba(236, 115, 71, 0.2)' }}>
                <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Loan Details</h3>
                <button onClick={() => setSelectedLoan(null)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#e8d1c9' }}>
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Loan Info */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: '#b08968' }}>Loan Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Loan Number" value={selectedLoan.loan_number} />
                    <InfoRow label="Status" value={selectedLoan.status} />
                    <InfoRow label="Phase" value={selectedLoan.phase} />
                    <InfoRow label="Principal Amount" value={formatCurrency(selectedLoan.principal_amount, currency)} />
                    <InfoRow label="Interest Rate" value={`${selectedLoan.interest_rate}%`} />
                    <InfoRow label="Loan Term" value={`${selectedLoan.loan_term_months} months`} />
                    <InfoRow label="Repayment Frequency" value={selectedLoan.repayment_frequency} />
                    <InfoRow label="Total Repayable" value={formatCurrency(selectedLoan.total_repayable, currency)} />
                    <InfoRow label="Total Paid" value={formatCurrency(selectedLoan.total_paid, currency)} />
                    <InfoRow label="Balance" value={formatCurrency(selectedLoan.balance, currency)} />
                    <InfoRow label="Disbursement Date" value={selectedLoan.disbursement_date || 'N/A'} />
                    <InfoRow label="Maturity Date" value={selectedLoan.maturity_date || 'N/A'} />
                  </div>
                </div>

                {/* Borrower & Lender Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#b08968' }}>Borrower</h4>
                    <InfoRow label="Name" value={client ? (client.client_type === 'individual' ? `${client.first_name} ${client.last_name}` : client.group_name) : 'Unknown'} />
                    <InfoRow label="Client Number" value={client?.client_number || 'N/A'} />
                    <InfoRow label="Credit Score" value={client?.credit_score || 'N/A'} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#b08968' }}>Lender</h4>
                    <InfoRow label="Organization" value={org?.organization_name || 'Unknown'} />
                    <InfoRow label="Country" value={org?.country || 'N/A'} />
                    <InfoRow label="Currency" value={currency} />
                  </div>
                </div>

                {/* Repayment History */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: '#b08968' }}>Repayment History ({repayments.length})</h4>
                  {repayments.length === 0 ? (
                    <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>No repayments yet</p>
                  ) : (
                    <div className="space-y-2">
                      {repayments.map(payment => (
                        <div key={payment.id} className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#020838', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{formatCurrency(payment.amount, currency)}</p>
                            <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{payment.payment_date} • {payment.payment_method}</p>
                          </div>
                          <span className="text-xs font-medium capitalize" style={{ color: payment.status === 'completed' ? '#8ba888' : '#c9a66b' }}>
                            {payment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{label}</p>
      <p className="text-sm" style={{ color: '#e8d1c9' }}>{value}</p>
    </div>
  );
}