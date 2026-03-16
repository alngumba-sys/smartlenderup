import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Building2, CreditCard, TrendingUp, AlertCircle, DollarSign, Users, Mail, Send, UserPlus, Eye, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown, Filter, Download, ChevronRight, Sparkles, Star } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { ClientDetailsModal } from '../ClientDetailsModal';
import { NewClientModal } from '../modals/NewClientModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { toast } from 'sonner';
import { safePercentage, safeToFixed } from '../../utils/safeCalculations';
import { getOrganizationName } from '../../utils/organizationUtils';
import { canCreateInTab, canEditInTab, canDeleteInTab } from '../../utils/staffPermissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { PERMISSIONS } from '../../utils/permissions';

interface ClientsTabProps {
  onClientSelect: (clientId: string) => void;
}

export function ClientsTabRedesigned({ onClientSelect }: ClientsTabProps) {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const { clients, loans, addClient, calculateClientCreditScore, updateClient, deleteClient } = useData();
  const organizationName = getOrganizationName();
  const { hasPermission } = usePermissions();
  const [clientTypeTab, setClientTypeTab] = useState<'individual' | 'business'>('individual');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'send-sms' | 'send-email' | 'invite'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailModalClient, setDetailModalClient] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'creditScore' | 'outstanding' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Listen to NavigationContext for selectedClientId
  useEffect(() => {
    if (navigation.selectedClientId) {
      setDetailModalClient(navigation.selectedClientId);
      navigation.clearSelection();
    }
  }, [navigation.selectedClientId]);

  // Recalculate all client credit scores and statuses
  useEffect(() => {
    if (clients.length === 0) return;
    
    clients.forEach(client => {
      const newScore = calculateClientCreditScore(client.id);
      
      let newRiskRating: 'Low' | 'Medium' | 'High' = 'Medium';
      if (newScore >= 600) {
        newRiskRating = 'Low';
      } else if (newScore >= 300) {
        newRiskRating = 'Medium';
      } else {
        newRiskRating = 'High';
      }
      
      const clientLoans = loans.filter(l => l.clientUuid === client.id || l.clientId === client.id);
      const disbursedLoans = clientLoans.filter(l => {
        const status = (l.status || '').toLowerCase();
        return status === 'active' || status === 'in arrears' || status === 'disbursed' ||
               status === 'paid' || status === 'closed' || status === 'fully paid' ||
               status === 'default' || status === 'default / past due' || status === 'written off';
      });
      
      const activeLoans = disbursedLoans.filter(l => {
        const status = (l.status || '').toLowerCase();
        return status === 'active' || status === 'in arrears' || status === 'disbursed' ||
               status === 'default' || status === 'default / past due' || status === 'written off';
      });
      
      const arrearsLoans = disbursedLoans.filter(l => {
        const status = (l.status || '').toLowerCase();
        return status === 'in arrears' || status === 'default' || status === 'default / past due';
      });

      let newStatus: string = client.status || 'Active';
      if (arrearsLoans.length > 0) {
        newStatus = 'In Arrears';
      } else if (activeLoans.length > 0) {
        newStatus = 'Good Standing';
      } else if (disbursedLoans.length > 0) {
        newStatus = 'No Active Loans';
      } else {
        newStatus = 'New Client';
      }

      if (client.creditScore !== newScore || client.riskRating !== newRiskRating || client.status !== newStatus) {
        updateClient(client.id, { 
          creditScore: newScore, 
          riskRating: newRiskRating,
          status: newStatus
        }, { silent: true });
      }
    });
  }, [clients.length, loans.length]);

  // Filter clients by type and search
  const clientsOfType = clients.filter(c => c.clientType === clientTypeTab);
  
  // Get all unique statuses from clients
  const uniqueStatuses = Array.from(new Set(clientsOfType.map(c => c.status || 'Active'))).sort();
  
  const filteredClients = clientsOfType.filter(client => {
    const matchesSearch = !searchTerm || 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.phoneNumber?.includes(searchTerm) ||
      client.nationalId?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any = 0;
    let bValue: any = 0;
    
    if (sortField === 'name') {
      aValue = (a.name || `${a.firstName} ${a.lastName}`).toLowerCase();
      bValue = (b.name || `${b.firstName} ${b.lastName}`).toLowerCase();
    } else if (sortField === 'creditScore') {
      aValue = a.creditScore || 0;
      bValue = b.creditScore || 0;
    } else if (sortField === 'outstanding') {
      const aLoans = loans.filter(l => l.clientUuid === a.id || l.clientId === a.id);
      const bLoans = loans.filter(l => l.clientUuid === b.id || l.clientId === b.id);
      aValue = aLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
      bValue = bLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate metrics
  const totalClients = clientsOfType.length;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const activeClients = clientsOfType.filter(client => {
    const clientLoans = loans.filter(l => l.clientUuid === client.id || l.clientId === client.id);
    return clientLoans.some(loan => {
      const disbursementDate = loan.disbursementDate ? new Date(loan.disbursementDate) : null;
      return disbursementDate && disbursementDate >= threeMonthsAgo;
    });
  }).length;
  const clientsInArrears = clientsOfType.filter(c => c.status === 'In Arrears').length;
  const averageCreditScore = Math.round(
    clientsOfType.reduce((sum, c) => sum + (c.creditScore || 0), 0) / Math.max(totalClients, 1)
  );
  const totalOutstandingAll = clientsOfType.reduce((sum, client) => {
    const clientLoans = loans.filter(l => l.clientUuid === client.id || l.clientId === client.id);
    return sum + clientLoans.reduce((loanSum, l) => loanSum + (l.outstandingBalance || 0), 0);
  }, 0);

  const handleSort = (field: 'name' | 'creditScore' | 'outstanding') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getInitials = (client: any) => {
    if (client.name) {
      return client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return ((client.firstName?.[0] || '') + (client.lastName?.[0] || '')).toUpperCase() || 'CL';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      'Good Standing': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'Active': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'In Arrears': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      'New Client': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'No Active Loans': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    };
    const style = styles[status] || styles['Active'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        <span className={`size-1.5 rounded-full ${style.text === 'text-emerald-700' ? 'bg-emerald-500' : style.text === 'text-red-700' ? 'bg-red-500' : style.text === 'text-blue-700' ? 'bg-blue-500' : 'bg-gray-400'}`} />
        {status}
      </span>
    );
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 700) return 'text-emerald-600';
    if (score >= 600) return 'text-blue-600';
    if (score >= 400) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleAddClient = async (clientData: any) => {
    try {
      // Prepare the client data for submission
      const newClientData: any = {
        clientType: clientData.clientType || clientTypeTab,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address || '',
        town: clientData.town || '',
        county: clientData.county || 'Nairobi',
        occupation: clientData.occupation || '',
        monthlyIncome: parseFloat(clientData.monthlyIncome) || 0,
        institutionId: clientData.institutionId || undefined,
        staffMemberId: clientData.staffMemberId || undefined,
        status: 'New Client',
        kycStatus: 'Pending',
      };

      // Add client type specific fields
      if (clientData.clientType === 'individual') {
        newClientData.firstName = clientData.firstName;
        newClientData.lastName = clientData.lastName;
        newClientData.name = `${clientData.firstName} ${clientData.lastName}`;
        newClientData.nationalId = clientData.idNumber;
        newClientData.dateOfBirth = clientData.dateOfBirth;
        newClientData.gender = clientData.gender;
        newClientData.maritalStatus = clientData.maritalStatus;
      } else {
        newClientData.name = clientData.businessName;
        newClientData.businessName = clientData.businessName;
        newClientData.registrationNumber = clientData.registrationNumber;
        newClientData.businessType = clientData.businessType;
      }

      // Add the client
      addClient(newClientData);
      
      toast.success(`${clientData.clientType === 'individual' ? 'Individual' : 'Business'} client added successfully!`);
      setShowNewClientModal(false);
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast.error(`Failed to add client: ${error.message}`);
    }
  };

  // Design system colors
  const colors = {
    primary: '#0066FF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Client Management
          </h1>
          <p className="text-sm mt-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Manage and track all your clients in one place
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info('Export feature coming soon')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all hover:scale-105"
            style={{
              backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              color: isDark ? colors.neutral[200] : colors.neutral[700]
            }}
          >
            <Download className="size-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
          
          <button
            onClick={() => setShowNewClientModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
            style={{ backgroundColor: colors.success, color: '#FFFFFF' }}
          >
            <Plus className="size-4" />
            <span className="text-sm font-medium">Add Client</span>
          </button>
        </div>
      </div>

      {/* Client Type Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl w-fit" style={{ backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }}>
        <button
          onClick={() => setClientTypeTab('individual')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            clientTypeTab === 'individual' ? 'shadow-md' : ''
          }`}
          style={{
            backgroundColor: clientTypeTab === 'individual' ? (isDark ? colors.neutral[700] : '#FFFFFF') : 'transparent',
            color: clientTypeTab === 'individual' ? (isDark ? '#FFFFFF' : colors.neutral[900]) : (isDark ? colors.neutral[400] : colors.neutral[600])
          }}
        >
          <Users className="size-4" />
          Individual Clients
        </button>
        <button
          onClick={() => setClientTypeTab('business')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            clientTypeTab === 'business' ? 'shadow-md' : ''
          }`}
          style={{
            backgroundColor: clientTypeTab === 'business' ? (isDark ? colors.neutral[700] : '#FFFFFF') : 'transparent',
            color: clientTypeTab === 'business' ? (isDark ? '#FFFFFF' : colors.neutral[900]) : (isDark ? colors.neutral[400] : colors.neutral[600])
          }}
        >
          <Building2 className="size-4" />
          Business Clients
        </button>
      </div>

      {/* Stats Cards - Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Total Clients */}
        <div 
          className="p-4 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
          style={{
            backgroundColor: isDark ? `${colors.primary}10` : '#EFF6FF',
            borderColor: isDark ? `${colors.primary}30` : '#DBEAFE'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}15` }}>
              <Users className="size-4" style={{ color: colors.primary }} />
            </div>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: isDark ? `${colors.primary}15` : `${colors.primary}10` }}>
              <ChevronRight className="size-3.5" style={{ color: colors.primary }} />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#93C5FD' : '#60A5FA' }}>
            Total {clientTypeTab === 'individual' ? 'Individuals' : 'Businesses'}
          </p>
          <p className="text-3xl font-bold mb-1" style={{ color: isDark ? '#DBEAFE' : '#1E40AF' }}>
            {totalClients}
          </p>
          <p className="text-xs font-medium" style={{ color: colors.primary }}>
            All registered clients
          </p>
        </div>

        {/* Active Clients */}
        <div 
          className="p-4 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
          style={{
            backgroundColor: isDark ? '#10B98110' : '#ECFDF5',
            borderColor: isDark ? '#10B98130' : '#D1FAE5'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: isDark ? `${colors.success}20` : `${colors.success}15` }}>
              <TrendingUp className="size-4" style={{ color: colors.success }} />
            </div>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: isDark ? `${colors.success}15` : `${colors.success}10` }}>
              <Sparkles className="size-3.5" style={{ color: colors.success }} />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#6EE7B7' : '#34D399' }}>
            Active (Last 3 months)
          </p>
          <p className="text-3xl font-bold mb-1" style={{ color: isDark ? '#D1FAE5' : '#047857' }}>
            {activeClients}
          </p>
          <p className="text-xs font-medium" style={{ color: colors.success }}>
            {safePercentage(activeClients, totalClients, 1)}% of total clients
          </p>
        </div>

        {/* Clients in Arrears */}
        <div 
          className="p-4 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
          style={{
            backgroundColor: isDark ? `${colors.danger}10` : '#FEF2F2',
            borderColor: isDark ? `${colors.danger}30` : '#FECACA'
          }}
        >
          {clientsInArrears > 0 && (
            <div className="absolute top-3 right-3 size-2 rounded-full bg-red-500 animate-pulse" />
          )}
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: isDark ? `${colors.danger}20` : `${colors.danger}15` }}>
              <AlertCircle className="size-4" style={{ color: colors.danger }} />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#FCA5A5' : '#F87171' }}>
            In Arrears
          </p>
          <p className="text-3xl font-bold mb-1" style={{ color: isDark ? '#FECACA' : '#B91C1C' }}>
            {clientsInArrears}
          </p>
          <p className="text-xs font-medium" style={{ color: colors.danger }}>
            {safePercentage(clientsInArrears, totalClients, 1)}% of total clients
          </p>
        </div>

        {/* Average Credit Score */}
        <div 
          className="p-4 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
          style={{
            backgroundColor: isDark ? '#A855F710' : '#FAF5FF',
            borderColor: isDark ? '#A855F730' : '#E9D5FF'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: '#A855F715' }}>
              <CreditCard className="size-4 text-purple-600" />
            </div>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#A855F710' }}>
              <Star className="size-3.5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#D8B4FE' : '#C084FC' }}>
            Avg Credit Score
          </p>
          <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-purple-200' : 'text-purple-900'}`}>
            {averageCreditScore}
          </p>
          <p className="text-xs font-medium text-purple-600">
            {averageCreditScore >= 600 ? 'Excellent' : averageCreditScore >= 400 ? 'Good' : 'Fair'}
          </p>
        </div>

        {/* Total Outstanding */}
        <div 
          className="p-4 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
          style={{
            backgroundColor: isDark ? `${colors.warning}10` : '#FFFBEB',
            borderColor: isDark ? `${colors.warning}30` : '#FDE68A'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: isDark ? `${colors.warning}20` : `${colors.warning}15` }}>
              <DollarSign className="size-4" style={{ color: colors.warning }} />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#FCD34D' : '#F59E0B' }}>
            Total Outstanding
          </p>
          <p className="text-2xl font-bold mb-1" style={{ color: isDark ? '#FDE68A' : '#B45309' }}>
            KES {safeToFixed(totalOutstandingAll / 1000000, 2)}M
          </p>
          <p className="text-xs font-medium" style={{ color: colors.warning }}>
            KES {totalOutstandingAll.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Filters - Premium */}
      <div 
        className="rounded-2xl border px-[24px] py-[6px] mx-[0px] mt-[0px] mb-[6px]"
        style={{
          backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF',
          borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="size-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.neutral[400] }} />
            <input
              type="text"
              placeholder="Search by name, phone, or Client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3.5 rounded-xl border-2 focus:outline-none focus:border-opacity-100 transition-all text-sm font-medium pl-[48px] pr-[16px] py-[7px]"
              style={{
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                color: isDark ? '#FFFFFF' : colors.neutral[900]
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }}>
              <Filter className="size-4" style={{ color: colors.neutral[400] }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-medium"
                style={{ color: isDark ? '#FFFFFF' : colors.neutral[900] }}
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Client Table - Premium Design */}
      <div 
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF',
          borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }}>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-70"
                    style={{ color: isDark ? colors.neutral[400] : colors.neutral[600] }}
                  >
                    Client
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                    )}
                    {sortField !== 'name' && <ArrowUpDown className="size-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? colors.neutral[400] : colors.neutral[600] }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? colors.neutral[400] : colors.neutral[600] }}>
                  Contact
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('creditScore')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-70"
                    style={{ color: isDark ? colors.neutral[400] : colors.neutral[600] }}
                  >
                    Credit Score
                    {sortField === 'creditScore' && (
                      sortDirection === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                    )}
                    {sortField !== 'creditScore' && <ArrowUpDown className="size-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('outstanding')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-70"
                    style={{ color: isDark ? colors.neutral[400] : colors.neutral[600] }}
                  >
                    Outstanding
                    {sortField === 'outstanding' && (
                      sortDirection === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                    )}
                    {sortField !== 'outstanding' && <ArrowUpDown className="size-3 opacity-30" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? colors.neutral[400] : colors.neutral[600] }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full" style={{ backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }}>
                        <Users className="size-8" style={{ color: colors.neutral[400] }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: isDark ? colors.neutral[400] : colors.neutral[500] }}>
                        No clients found
                      </p>
                      <button
                        onClick={() => setShowNewClientModal(true)}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: colors.success, color: '#FFFFFF' }}
                      >
                        Add Your First Client
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedClients.map((client, index) => {
                  const clientLoans = loans.filter(l => l.clientUuid === client.id || l.clientId === client.id);
                  const outstanding = clientLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
                  
                  // Get the calculated credit score for this client
                  const creditScore = calculateClientCreditScore(client.id);
                  
                  return (
                    <tr 
                      key={client.id}
                      className="border-t transition-all hover:bg-opacity-50 cursor-pointer group"
                      style={{ 
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      }}
                      onClick={() => setDetailModalClient(client.id)}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="size-9 rounded-full flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110"
                            style={{ 
                              backgroundColor: `${colors.primary}20`,
                              color: colors.primary
                            }}
                          >
                            {getInitials(client)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: isDark ? '#FFFFFF' : colors.neutral[900] }}>
                              {client.name || `${client.firstName} ${client.lastName}`}
                            </p>
                            <p className="text-xs" style={{ color: colors.neutral[500] }}>
                              ID: {client.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {getStatusBadge(client.status || 'Active')}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Phone className="size-4" style={{ color: colors.neutral[400] }} />
                          <span className="text-sm font-medium" style={{ color: isDark ? colors.neutral[300] : colors.neutral[700] }}>
                            {client.phone || client.phoneNumber || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-lg font-bold ${getCreditScoreColor(creditScore)}`}>
                          {creditScore}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-bold" style={{ color: isDark ? '#FFFFFF' : colors.neutral[900] }}>
                          KES {outstanding.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailModalClient(client.id);
                            }}
                            className="p-2 rounded-lg transition-all hover:scale-110"
                            style={{
                              backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                              color: colors.primary
                            }}
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                            style={{
                              backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                              color: isDark ? colors.neutral[400] : colors.neutral[600]
                            }}
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {sortedClients.length > 0 && (
          <div 
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ 
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50]
            }}
          >
            <p className="text-sm font-medium" style={{ color: colors.neutral[500] }}>
              Showing {sortedClients.length} of {totalClients} clients
            </p>
            <div className="flex items-center gap-2">
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF',
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  color: isDark ? colors.neutral[400] : colors.neutral[600]
                }}
              >
                Previous
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: colors.primary,
                  color: '#FFFFFF'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {detailModalClient && (
        <ClientDetailsModal
          clientId={detailModalClient}
          onClose={() => setDetailModalClient(null)}
        />
      )}
      
      {showNewClientModal && (
        <NewClientModal
          onClose={() => setShowNewClientModal(false)}
          defaultClientType={clientTypeTab}
          onAddClient={handleAddClient}
        />
      )}
    </div>
  );
}