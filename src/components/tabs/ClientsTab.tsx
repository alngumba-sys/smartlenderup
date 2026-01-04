import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone, Building2, CreditCard, TrendingUp, TrendingDown, Users, AlertCircle, DollarSign, X, Info, Mail, Send, UserPlus, Edit2, Trash2, User } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { ClientDetailsModal } from '../ClientDetailsModal';
import { NewClientModal } from '../modals/NewClientModal';
import { ViewToggle } from '../ViewToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { toast } from 'sonner@2.0.3';
import { safePercentage, safeToFixed } from '../../utils/safeCalculations';
import { getOrganizationName } from '../../utils/organizationUtils';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';

interface ClientsTabProps {
  onClientSelect: (clientId: string) => void;
}

export function ClientsTab({ onClientSelect }: ClientsTabProps) {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const { clients, loans, addClient, calculateClientCreditScore, updateClient, deleteClient } = useData();
  const organizationName = getOrganizationName();
  const [clientTypeTab, setClientTypeTab] = useState<'individual' | 'business'>('individual');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'send-sms' | 'send-email' | 'invite'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailModalClient, setDetailModalClient] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [outstandingSortOrder, setOutstandingSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Listen to NavigationContext for selectedClientId
  useEffect(() => {
    if (navigation.selectedClientId) {
      setDetailModalClient(navigation.selectedClientId);
      // Clear the selected client after opening modal
      navigation.clearSelection();
    }
  }, [navigation.selectedClientId]);

  // Move specific clients to business type
  useEffect(() => {
    if (clients.length === 0) return;
    
    const businessNames = ['OLIVINE INVESTMENTS LTD', 'BLOOMING BUD CENTER'];
    clients.forEach(client => {
      const clientName = client.name?.toUpperCase() || '';
      if (businessNames.some(name => clientName.includes(name)) && client.clientType !== 'business') {
        console.log(`Moving ${client.name} to business type...`);
        updateClient(client.id, { clientType: 'business' }, { silent: true });
      }
    });
  }, [clients.length]);

  // Recalculate all client credit scores and statuses on component mount and when loans/repayments change
  useEffect(() => {
    if (clients.length === 0) return; // Don't run if no clients
    
    let hasUpdates = false;
    clients.forEach(client => {
      const newScore = calculateClientCreditScore(client.id);
      
      // Calculate risk rating based on credit score
      let newRiskRating: 'Low' | 'Medium' | 'High' = 'Medium';
      if (newScore >= 600) {
        newRiskRating = 'Low'; // Excellent and Good
      } else if (newScore >= 300) {
        newRiskRating = 'Medium'; // Fair and Poor
      } else {
        newRiskRating = 'High'; // Very Poor
      }
      
      // Calculate client status based on loans
      const clientLoans = loans.filter(l => l.clientUuid === client.id);
      const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears');
      let newStatus: 'Active' | 'Inactive' | 'Blacklisted' | 'Good Standing' | 'In Arrears' | 'Fully Paid' | 'Current' = 'Active';
      
      if (activeLoans.length === 0 && clientLoans.length > 0) {
        newStatus = 'Fully Paid';
      } else if (activeLoans.some(l => l.status === 'In Arrears' || (l.daysInArrears && l.daysInArrears > 0))) {
        newStatus = 'In Arrears';
      } else if (activeLoans.length > 0) {
        newStatus = 'Good Standing';
      }
      
      if (newScore !== client.creditScore || newRiskRating !== client.riskRating || newStatus !== client.status) {
        updateClient(client.id, { creditScore: newScore, riskRating: newRiskRating, status: newStatus }, { silent: true });
        hasUpdates = true;
      }
    });
    if (hasUpdates) {
      console.log('Credit scores and risk ratings recalculated for all clients');
    }
  }, [clients.length, loans.length]); // Recalculate when clients or loans change

  const handleNewClient = async (clientData: any) => {
    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection('add client');
    if (!isConnected) {
      return; // Block the operation if offline
    }

    const name = clientData.clientType === 'business' 
      ? clientData.businessName 
      : `${clientData.firstName} ${clientData.lastName}`;
    
    const idNumber = clientData.clientType === 'business'
      ? clientData.registrationNumber
      : clientData.idNumber;

    addClient({
      name,
      firstName: clientData.clientType === 'business' ? '' : clientData.firstName,
      lastName: clientData.clientType === 'business' ? '' : clientData.lastName,
      businessName: clientData.clientType === 'business' ? clientData.businessName : undefined,
      email: clientData.email || '',
      phone: clientData.phone,
      idNumber,
      address: clientData.address || '',
      city: clientData.city || 'Nairobi',
      county: clientData.county || 'Nairobi',
      occupation: clientData.occupation || (clientData.clientType === 'business' ? clientData.businessType : 'Self-Employed'),
      employer: clientData.clientType === 'business' ? clientData.businessName : 'Self-Employed',
      monthlyIncome: Number(clientData.monthlyIncome) || 0,
      dateOfBirth: clientData.dateOfBirth || '',
      gender: clientData.gender || 'Other',
      maritalStatus: clientData.maritalStatus || 'Single',
      nextOfKin: {
        name: clientData.nextOfKinName || '',
        relationship: clientData.nextOfKinRelationship || '',
        phone: clientData.nextOfKinPhone || ''
      },
      status: 'Active',
      photo: clientData.clientPicture || undefined,
      creditScore: 300, // Minimum credit score for new clients (300-850 scale)
      riskRating: 'Medium',
      createdBy: currentUser?.name || 'System',
      clientType: clientData.clientType || 'individual',
      businessType: clientData.businessType || undefined,
      branch: 'Head Office'
    });
    setShowNewClientModal(false);
    toast.success(`${clientData.clientType === 'business' ? 'Business' : 'Individual'} borrower added successfully!`);
  };

  const handleDeleteClient = (clientId: string, clientName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (window.confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      deleteClient(clientId);
      toast.success(`Client ${clientName} deleted successfully`);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.phone || '').includes(searchTerm) ||
                         (client.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    // Filter by client type tab
    const matchesClientType = clientTypeTab === 'individual' 
      ? (client.clientType === 'individual' || !client.clientType)
      : client.clientType === 'business';
    
    return matchesSearch && matchesStatus && matchesClientType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good Standing':
        return 'bg-emerald-100 text-emerald-800';
      case 'In Arrears':
        return 'bg-red-100 text-red-800';
      case 'Fully Paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-500';    // Excellent: 800-850
    if (score >= 740) return 'text-blue-500';     // Very Good: 740-799
    if (score >= 670) return 'text-cyan-500';     // Good: 670-739
    if (score >= 580) return 'text-yellow-500';   // Fair: 580-669
    if (score >= 300) return 'text-orange-500';   // Poor: 300-579
    return 'text-gray-500';                        // Below 300
  };

  // Calculate summary statistics based on selected client type tab
  const clientsOfType = clients.filter(c => 
    clientTypeTab === 'individual' 
      ? (c.clientType === 'individual' || !c.clientType)
      : c.clientType === 'business'
  );
  
  const totalClients = clientsOfType.length;
  const individualClients = clients.filter(c => c.clientType === 'individual' || !c.clientType).length;
  const businessClients = clients.filter(c => c.clientType === 'business').length;
  
  // Active clients = clients with activity in last 3 months (loans disbursed or payments made)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const activeClients = clientsOfType.filter(client => {
    const clientLoans = loans.filter(l => l.clientUuid === client.id);
    return clientLoans.some(loan => {
      const disbursementDate = loan.disbursementDate ? new Date(loan.disbursementDate) : null;
      const lastPaymentDate = loan.lastPaymentDate ? new Date(loan.lastPaymentDate) : null;
      return (disbursementDate && disbursementDate >= threeMonthsAgo) || 
             (lastPaymentDate && lastPaymentDate >= threeMonthsAgo);
    });
  }).length;
  
  const clientsInArrears = clientsOfType.filter(c => c.status === 'In Arrears').length;
  const averageCreditScore = clientsOfType.length > 0 ? Math.round(clientsOfType.reduce((sum, c) => sum + (c.creditScore || 300), 0) / clientsOfType.length) : 0;
  
  // Total outstanding = sum of all outstanding balances from all loans
  const totalOutstandingAll = loans
    .filter(l => {
      const loanClient = clients.find(c => c.id === l.clientUuid);
      if (!loanClient) return false;
      if (clientTypeTab === 'individual') {
        return loanClient.clientType === 'individual' || !loanClient.clientType;
      } else {
        return loanClient.clientType === 'business';
      }
    })
    .reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Borrower Management</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage all your borrowers and their information</p>
        </div>
        <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm" onClick={() => setShowNewClientModal(true)}>
          <Plus className="size-4" />
          Add Borrower
        </button>
      </div>

      {/* Client Type Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setClientTypeTab('individual')}
          className={`px-6 py-3 flex-shrink-0 transition-all ${
            clientTypeTab === 'individual'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 -mb-[2px]'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="size-4" />
            Individuals
          </div>
        </button>
        <button
          onClick={() => setClientTypeTab('business')}
          className={`px-6 py-3 flex-shrink-0 transition-all ${
            clientTypeTab === 'business'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 -mb-[2px]'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="size-4" />
            Businesses
          </div>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'all'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          View Borrowers
        </button>
        <button
          onClick={() => setActiveSubTab('send-sms')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'send-sms'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send SMS to All Borrowers
        </button>
        <button
          onClick={() => setActiveSubTab('send-email')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'send-email'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send Email to All Borrowers
        </button>
        <button
          onClick={() => setActiveSubTab('invite')}
          className={`px-4 py-2 flex-shrink-0 ${
            activeSubTab === 'invite'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Invite Borrowers
        </button>
      </div>

      {/* View Borrowers Tab */}
      {activeSubTab === 'all' && (
        <>
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3 sm:gap-4">
        {/* Total Clients */}
        <div className={`p-4 sm:p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-start gap-3">
            {clientTypeTab === 'individual' ? (
              <User className="size-5 sm:size-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            ) : (
              <Building2 className="size-5 sm:size-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {clientTypeTab === 'individual' ? 'Total Individuals' : 'Total Businesses'}
              </p>
              <p className={`text-xl sm:text-2xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalClients}</p>
            </div>
          </div>
        </div>

        {/* Active Clients */}
        <div className={`p-4 sm:p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="size-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active (Last 3 months)</p>
              <p className={`text-2xl mt-1 mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeClients}</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs">{safePercentage(activeClients, totalClients, 1)}%</p>
            </div>
          </div>
        </div>

        {/* Clients in Arrears */}
        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-start gap-3">
            <TrendingDown className="size-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Arrears</p>
              <p className={`text-2xl mt-1 mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{clientsInArrears}</p>
              <p className="text-red-600 dark:text-red-400 text-xs">{safePercentage(clientsInArrears, totalClients, 1)}%</p>
            </div>
          </div>
        </div>

        {/* Average Credit Score */}
        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-start gap-3">
            <CreditCard className="size-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Credit Score</p>
              <p className={`text-2xl mt-1 ${getCreditScoreColor(averageCreditScore)}`}>{averageCreditScore}</p>
            </div>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-start gap-3">
            <DollarSign className="size-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Outstanding</p>
              <p className={`text-xl mt-1 mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>KES {safeToFixed(totalOutstandingAll / 1000000, 1)}M</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>KES {totalOutstandingAll.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(17,17,32)]">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="flex-1 relative">
            <Search className="size-4 sm:size-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or Client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="Good Standing">Good Standing</option>
              <option value="In Arrears">In Arrears</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>
            
            {/* View Mode Toggle */}
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Clients View */}
      {viewMode === 'tile' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {[...filteredClients].reverse().map((client) => {
            const clientLoans = loans.filter(l => l.clientUuid === client.id);
            const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'In Arrears');
            const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);

            return (
              <div
                key={client.id}
                onClick={() => setDetailModalClient(client.id)}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
              >
                {/* Client Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="size-12 bg-emerald-600 rounded-full flex items-center justify-center text-white overflow-hidden">
                    {client.photo ? (
                      <img src={client.photo} alt={client.name} className="size-full object-cover" />
                    ) : (
                      client.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{client.name}</p>
                    <p className="text-gray-600 text-xs">{client.id}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </div>
                </div>

                {/* Client Details */}
                <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="size-4" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="size-4" />
                    <span>{client.clientType === 'business' ? (client.occupation || client.businessType || 'N/A') : (client.occupation || 'N/A')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="size-4" />
                    <span>{client.clientType === 'business' ? (client.address || client.branch || 'N/A') : (client.town || client.branch || 'Nairobi')}</span>
                  </div>
                  {client.groupAffiliation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="size-4" />
                      <span>{client.groupAffiliation}</span>
                    </div>
                  )}
                </div>

                {/* Credit Score & Financial Info */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-xs">Credit Score</span>
                    <span className={`text-xl ${getCreditScoreColor(client.creditScore || 300)}`}>
                      {client.creditScore || 300}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Active Loans:</span>
                    <span className="text-gray-900">{activeLoans.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Outstanding:</span>
                    <span className="text-gray-900">KES {totalOutstanding.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
            style={{
              backgroundColor: '#0f1a2e',
              borderColor: '#1e2f42'
            }}
          >
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
              {clientTypeTab === 'individual' ? 'Individual Clients' : 'Business Clients'} ({filteredClients.length})
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-4 py-2 text-left text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`px-4 py-2 text-left text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
                  <th className={`px-4 py-2 text-center text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`px-4 py-2 text-left text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact</th>
                  <th className={`px-4 py-2 text-left text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Business / Location</th>
                  <th className={`px-4 py-2 text-center text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Score</th>
                  <th 
                    className={`px-4 py-2 text-right text-[11px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => {
                      setOutstandingSortOrder(prev => 
                        prev === null ? 'desc' : prev === 'desc' ? 'asc' : null
                      );
                    }}
                  >
                    Outstanding {outstandingSortOrder === 'desc' ? '↓' : outstandingSortOrder === 'asc' ? '↑' : ''}
                  </th>
                  <th className={`px-4 py-2 text-center text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Calculate outstanding for each client for sorting
                  const clientsWithOutstanding = filteredClients.map(client => {
                    const clientLoans = loans.filter(l => l.clientUuid === client.id);
                    // Outstanding loans = loans with balance > 0
                    const outstandingLoans = clientLoans.filter(l => (l.outstandingBalance || 0) > 0);
                    const totalOutstanding = outstandingLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
                    return { client, totalOutstanding, outstandingCount: outstandingLoans.length };
                  });

                  // Sort by outstanding if sort order is set
                  let sortedClients = [...clientsWithOutstanding];
                  if (outstandingSortOrder === 'desc') {
                    sortedClients.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
                  } else if (outstandingSortOrder === 'asc') {
                    sortedClients.sort((a, b) => a.totalOutstanding - b.totalOutstanding);
                  } else {
                    sortedClients.reverse(); // Default reverse order
                  }

                  return sortedClients.map(({ client, totalOutstanding, outstandingCount }) => {
                  const clientLoans = loans.filter(l => l.clientUuid === client.id);
                  const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears');

                  return (
                    <tr 
                      key={client.id} 
                      onClick={() => setDetailModalClient(client.id)}
                      className={`border-t cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      {/* Name with Avatar */}
                      <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`size-8 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden text-xs ${
                            client.clientType === 'business' ? 'bg-blue-600' : 'bg-emerald-600'
                          }`}>
                            {client.photo ? (
                              <img src={client.photo} alt={client.name} className="size-full object-cover" />
                            ) : client.clientType === 'business' ? (
                              <Building2 className="size-4" />
                            ) : (
                              (client.name || 'U').split(' ').map(n => n[0]).join('')
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-[13px]">{client.name}</p>
                              {client.clientType === 'business' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                  Business
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Client ID */}
                      <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {client.clientNumber || client.client_number || client.id}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-1">
                          <Phone className="size-3 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      </td>

                      {/* Business & Location */}
                      <td className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex flex-col gap-0.5">
                          {client.clientType === 'business' ? (
                            <>
                              <div className="flex items-center gap-1">
                                <Building2 className="size-2.5 flex-shrink-0" />
                                <span className="truncate">{client.occupation || client.businessType || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="size-2.5 flex-shrink-0" />
                                <span className="truncate">{client.address || client.branch || 'N/A'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1">
                                <Building2 className="size-2.5 flex-shrink-0" />
                                <span className="truncate">{client.occupation || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="size-2.5 flex-shrink-0" />
                                <span className="truncate">{client.town || client.branch || 'N/A'}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Credit Score */}
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs font-medium ${getCreditScoreColor(client.creditScore || 300)}`}>
                          {client.creditScore || 300}
                        </span>
                      </td>

                      {/* Outstanding */}
                      <td className={`px-4 py-2 text-right text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-[10px]`}>
                            {outstandingCount} {outstandingCount === 1 ? 'loan' : 'loans'}
                          </span>
                          <span>KES {totalOutstanding.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-1 justify-center items-center flex-wrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailModalClient(client.id);
                            }}
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* Send SMS to All Borrowers Tab */}
      {activeSubTab === 'send-sms' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <Phone className="size-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Send SMS to All Borrowers</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send bulk SMS messages to all active borrowers in your system
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Recipients
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>All active borrowers ({clients.filter(c => c.status === 'Active').length})</option>
                  <option>Borrowers in good standing</option>
                  <option>Borrowers with active loans</option>
                  <option>Custom selection</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message Template
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>General Announcement</option>
                  <option>Service Update</option>
                  <option>New Product Launch</option>
                  <option>Custom Message</option>
                </select>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Enter your message here..."
                  defaultValue="Dear [Client Name], we are pleased to inform you about our new loan products with competitive interest rates. Contact us for more information. - SmartLenderUp"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Available variables: [Client Name], [Client ID], [Phone Number]
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Recipients:</strong> {clients.filter(c => c.status === 'Active').length} borrowers | 
                  <strong> Cost:</strong> KES {clients.filter(c => c.status === 'Active').length * 10} (KES 10 per SMS)
                </p>
              </div>

              <button
                onClick={() => {
                  toast.success('SMS Sent Successfully', {
                    description: `Messages sent to ${clients.filter(c => c.status === 'Active').length} borrowers`,
                    duration: 5000,
                  });
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send className="size-5" />
                Send SMS Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email to All Borrowers Tab */}
      {activeSubTab === 'send-email' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <Mail className="size-8 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Send Email to All Borrowers</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send bulk email messages to all active borrowers in your system
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Recipients
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>All active borrowers ({clients.filter(c => c.status === 'Active').length})</option>
                  <option>Borrowers in good standing</option>
                  <option>Borrowers with active loans</option>
                  <option>Custom selection</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  defaultValue="Important Update from SmartLenderUp"
                />
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Template
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>General Announcement</option>
                  <option>Service Update</option>
                  <option>New Product Launch</option>
                  <option>Custom Message</option>
                </select>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  rows={8}
                  placeholder="Enter your message here..."
                  defaultValue={`Dear [Client Name],

We are excited to announce the launch of our new flexible loan products designed to meet your unique financial needs.

Key Benefits:
• Competitive interest rates starting from 8% per annum
• Flexible repayment terms up to 24 months
• Quick approval process within 24 hours
• No hidden fees

Visit our office in Nairobi or contact us at +254 700 000 000 to learn more.

Best regards,
SmartLenderUp Team`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Available variables: [Client Name], [Client ID], [Email]
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                  <strong>Recipients:</strong> {clients.filter(c => c.status === 'Active').length} borrowers | 
                  <strong> Emails will be sent from:</strong> noreply@bvfunguo.co.ke
                </p>
              </div>

              <button
                onClick={() => {
                  toast.success('Emails Sent Successfully', {
                    description: `Messages sent to ${clients.filter(c => c.status === 'Active').length} borrowers`,
                    duration: 5000,
                  });
                }}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Send className="size-5" />
                Send Email Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Borrowers Tab */}
      {activeSubTab === 'invite' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="size-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Invite Borrowers</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send invitations to potential borrowers to join your microfinance platform
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Invitation Method
                </label>
                <select className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <option>SMS Invitation</option>
                  <option>Email Invitation</option>
                  <option>Both SMS and Email</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Numbers / Emails
                </label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Enter phone numbers or emails (one per line)&#10;+254 700 000 001&#10;+254 700 000 002&#10;email@example.com"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Enter one phone number or email per line. You can mix both.
                </p>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Invitation Message
                </label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  rows={5}
                  placeholder="Enter your invitation message..."
                  defaultValue={`Hello! You're invited to join SmartLenderUp microfinance services.

We offer affordable loans with flexible repayment terms to help you achieve your financial goals.

Register now: https://bvfunguo.co.ke/register

For more information, contact us at +254 700 000 000.`}
                />
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
                <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  💡 <strong>Tip:</strong> Personalized invitations have higher conversion rates. 
                  Include information about loan products and benefits.
                </p>
              </div>

              <button
                onClick={() => {
                  toast.success('Invitations Sent Successfully', {
                    description: 'Invitation messages have been sent to all recipients',
                    duration: 5000,
                  });
                }}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <UserPlus className="size-5" />
                Send Invitations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {detailModalClient && (
        <ClientDetailsModal
          clientId={detailModalClient}
          onClose={() => setDetailModalClient(null)}
        />
      )}

      {/* New Client Modal */}
      {showNewClientModal && (
        <NewClientModal
          isOpen={showNewClientModal}
          onClose={() => setShowNewClientModal(false)}
          onSubmit={handleNewClient}
        />
      )}

      {/* Metric Details Modals */}
      {selectedMetric && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white">Client Metric Details</h3>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="size-5" />
                </button>
              </div>

              {selectedMetric === 'total-clients' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Users className="size-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-blue-900 dark:text-blue-100 text-sm">Total Clients</p>
                      <p className="text-blue-900 dark:text-blue-100 text-3xl">{totalClients}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">Client Base Overview</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Your total client base represents all borrowers who have an active relationship with {organizationName}. 
                      This includes clients with active loans, those in good standing, and those who may need follow-up.
                    </p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Client Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Active Borrowers</p>
                        <p className="text-gray-900 dark:text-white">{totalClients} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">New Clients (MTD)</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">+{Math.floor(totalClients * 0.08)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Female Clients</p>
                        <p className="text-gray-900 dark:text-white">{Math.floor(totalClients * 0.58)} ({((totalClients * 0.58 / totalClients) * 100).toFixed(0)}%)</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Repeat Clients</p>
                        <p className="text-gray-900 dark:text-white">{Math.floor(totalClients * 0.70)} ({((totalClients * 0.70 / totalClients) * 100).toFixed(0)}%)</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Group Members</p>
                        <p className="text-gray-900 dark:text-white">{clients.filter(c => c.groupMembership).length} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Individual Clients</p>
                        <p className="text-gray-900 dark:text-white">{clients.filter(c => !c.groupMembership).length} clients</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Location</h4>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-gray-900 dark:text-white">Nairobi, Kenya</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Single centralized location serving all {totalClients} clients</p>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Centralized operations in Nairobi ensures efficient service delivery and consistent client experience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>High repeat client rate of {((totalClients * 0.70 / totalClients) * 100).toFixed(0)}% indicates strong client satisfaction and trust in {organizationName}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Gender-balanced portfolio with 58% female clients demonstrates inclusive lending practices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Diversified across 5 branches ensures geographic risk distribution and market coverage</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'good-standing' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="size-8 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-emerald-900 dark:text-emerald-100 text-sm">Clients in Good Standing</p>
                      <p className="text-emerald-900 dark:text-emerald-100 text-3xl">{activeClients}</p>
                      <p className="text-emerald-700 dark:text-emerald-200 text-sm">{((activeClients / totalClients) * 100).toFixed(1)}% of total clients</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What is Good Standing?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Clients in Good Standing are borrowers who consistently make their loan payments on time, have no overdue amounts, 
                      and maintain a positive relationship with the institution. These are your most reliable clients.
                    </p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Good Standing Clients</p>
                        <p className="text-gray-900 dark:text-white">{activeClients} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Percentage of Portfolio</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">{((activeClients / totalClients) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Avg Credit Score</p>
                        <p className="text-gray-900 dark:text-white">
                          {Math.round(clients.filter(c => c.status === 'Active').reduce((sum, c) => sum + (c.creditScore || 0), 0) / activeClients)}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Active Loans</p>
                        <p className="text-gray-900 dark:text-white">
                          {clients.filter(c => c.status === 'Active').reduce((sum, client) => {
                            const clientLoans = loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'Disbursed'));
                            return sum + clientLoans.length;
                          }, 0)} loans
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Outstanding from Good Clients</p>
                        <p className="text-gray-900 dark:text-white">
                          KES {(clients.filter(c => c.status === 'Active').reduce((sum, client) => {
                            const clientLoans = loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'Disbursed'));
                            return sum + clientLoans.reduce((loanSum, l) => loanSum + l.outstandingBalance, 0);
                          }, 0) / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">On-Time Payment Rate</p>
                        <p className="text-gray-900 text-emerald-600">98.5%</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Top Performing Clients</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {useData.clients.filter(c => c.status === 'Good Standing')
                        .sort((a, b) => b.creditScore - a.creditScore)
                        .slice(0, 10)
                        .map(client => {
                          const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'In Arrears'));
                          const outstanding = clientLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
                          return (
                            <div key={client.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded border border-emerald-100">
                              <div>
                                <p className="text-gray-900 text-sm">{client.name}</p>
                                <p className="text-gray-600 text-xs">{client.businessType} • {client.branch}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-emerald-700 text-sm">Score: {client.creditScore}</p>
                                <p className="text-gray-600 text-xs">KES {outstanding.toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{((activeClients / totalClients) * 100).toFixed(1)}% good standing rate is excellent and above industry average of 70%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>These clients are ideal candidates for larger loans and better interest rates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Consider loyalty programs or referral incentives to retain and grow this segment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'in-arrears' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-red-900 dark:text-red-100 text-sm">Clients in Arrears</p>
                      <p className="text-red-900 dark:text-red-100 text-3xl">{clientsInArrears}</p>
                      <p className="text-red-700 dark:text-red-200 text-sm">{((clientsInArrears / totalClients) * 100).toFixed(1)}% of total clients</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What Does in Arrears Mean?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Clients in Arrears have missed one or more loan payments and have overdue balances. Early intervention and 
                      proactive communication are key to helping these clients get back on track and preventing defaults.
                    </p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Arrears Analysis</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total in Arrears</p>
                        <p className="text-gray-900 dark:text-white">{clientsInArrears} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Arrears Rate</p>
                        <p className="text-gray-900 dark:text-white text-red-600 dark:text-red-400">{((clientsInArrears / totalClients) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{'<'} 30 Days Overdue</p>
                        <p className="text-gray-900 dark:text-white">{Math.floor(clientsInArrears * 0.55)} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">30-60 Days Overdue</p>
                        <p className="text-gray-900 dark:text-white">{Math.floor(clientsInArrears * 0.30)} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{'>'} 60 Days Overdue</p>
                        <p className="text-gray-900 dark:text-white text-red-600 dark:text-red-400">{Math.floor(clientsInArrears * 0.15)} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Overdue Amount</p>
                        <p className="text-gray-900 dark:text-white">
                          KES {(useData.clients.filter(c => c.status === 'In Arrears').reduce((sum, client) => {
                            const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && l.daysInArrears > 0);
                            return sum + clientLoans.reduce((loanSum, l) => loanSum + l.outstandingBalance, 0);
                          }, 0) / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Clients Requiring Immediate Action</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {useData.clients.filter(c => c.status === 'In Arrears')
                        .map(client => {
                          const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && l.daysInArrears > 0);
                          const maxDaysOverdue = Math.max(...clientLoans.map(l => l.daysInArrears), 0);
                          const totalOverdue = clientLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
                          return (
                            <div key={client.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800">
                              <div>
                                <p className="text-gray-900 dark:text-white text-sm">{client.name}</p>
                                <p className="text-gray-600 text-xs">{client.phone} • {client.branch}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-red-700 text-sm">{maxDaysOverdue} days overdue</p>
                                <p className="text-gray-600 text-xs">KES {totalOverdue.toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <h4 className="text-gray-900 mt-4">Recommended Actions</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>Immediate follow-up calls for clients {'>'} 30 days overdue to understand challenges and offer solutions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>Consider loan restructuring for clients facing temporary financial difficulties</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>Send automated SMS reminders to clients {'<'} 30 days overdue to prevent further delays</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>Review and update collection strategies to reduce arrears rate below 15%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'avg-credit-score' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <CreditCard className="size-8 text-purple-600" />
                    <div>
                      <p className="text-purple-900 text-sm">Average Credit Score</p>
                      <p className={`text-3xl ${getCreditScoreColor(averageCreditScore)}`}>{averageCreditScore}</p>
                      <p className="text-purple-700 text-sm">Portfolio-wide average</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">Understanding Credit Scores</h4>
                    <p className="text-gray-600 text-sm">
                      Credit scores range from 300-850 (similar to FICO scores) and are calculated based on payment history, 
                      number of closed loans, repayment consistency, credit utilization, and length of credit history. 
                      New clients start at 300 and build their score through responsible borrowing and timely repayments.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Score Distribution</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Excellent (700-850)</p>
                        <p className="text-gray-900 text-emerald-600">
                          {useData.clients.filter(c => c.creditScore >= 700).length} clients 
                          ({((useData.clients.filter(c => c.creditScore >= 700).length / totalClients) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Good (600-699)</p>
                        <p className="text-gray-900 text-blue-600">
                          {useData.clients.filter(c => c.creditScore >= 600 && c.creditScore < 700).length} clients 
                          ({((useData.clients.filter(c => c.creditScore >= 600 && c.creditScore < 700).length / totalClients) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Fair (500-599)</p>
                        <p className="text-gray-900 text-amber-600">
                          {useData.clients.filter(c => c.creditScore >= 500 && c.creditScore < 600).length} clients 
                          ({((useData.clients.filter(c => c.creditScore >= 500 && c.creditScore < 600).length / totalClients) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Poor (300-499)</p>
                        <p className="text-gray-900 text-orange-600">
                          {useData.clients.filter(c => c.creditScore >= 300 && c.creditScore < 500).length} clients 
                          ({((useData.clients.filter(c => c.creditScore >= 300 && c.creditScore < 500).length / totalClients) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                        <p className="text-gray-600 text-xs">Very Poor / New (0-299)</p>
                        <p className="text-gray-900 text-red-600">
                          {useData.clients.filter(c => c.creditScore < 300).length} clients 
                          ({((useData.clients.filter(c => c.creditScore < 300).length / totalClients) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Highest Score</p>
                        <p className="text-gray-900 text-emerald-600">{Math.max(...useData.clients.map(c => c.creditScore))}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Lowest Score</p>
                        <p className="text-gray-900 text-red-600">{Math.min(...useData.clients.map(c => c.creditScore))}</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Score Trends by Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">Good Standing Clients</span>
                        <span className="text-emerald-700 dark:text-emerald-300">
                          Avg: {Math.round(useData.clients.filter(c => c.status === 'Good Standing').reduce((sum, c) => sum + c.creditScore, 0) / activeClients)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">Clients in Arrears</span>
                        <span className="text-red-700 dark:text-red-300">
                          Avg: {Math.round(useData.clients.filter(c => c.status === 'In Arrears').reduce((sum, c) => sum + c.creditScore, 0) / (clientsInArrears || 1))}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Portfolio average score of {averageCreditScore} indicates a healthy mix of low and moderate-risk clients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>
                          {((useData.clients.filter(c => c.creditScore >= 80).length / totalClients) * 100).toFixed(1)}% of clients have excellent scores, 
                          making them eligible for premium loan products
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Monitor and support clients with scores below 40 to prevent defaults and improve their financial health</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Good standing clients have {((Math.round(useData.clients.filter(c => c.status === 'Good Standing').reduce((sum, c) => sum + c.creditScore, 0) / activeClients) / Math.round(useData.clients.filter(c => c.status === 'In Arrears').reduce((sum, c) => sum + c.creditScore, 0) / (clientsInArrears || 1))) * 100 - 100).toFixed(0)}% higher scores on average than those in arrears</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'total-outstanding' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <DollarSign className="size-8 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-amber-900 dark:text-amber-100 text-sm">Total Outstanding</p>
                      <p className="text-amber-900 dark:text-amber-100 text-3xl">KES {(totalOutstandingAll / 1000000).toFixed(1)}M</p>
                      <p className="text-amber-700 dark:text-amber-200 text-sm">KES {totalOutstandingAll.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What is Total Outstanding?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Total Outstanding represents the sum of all unpaid loan balances across your entire client portfolio. 
                      This includes both principal amounts and accrued interest that clients still owe to {organizationName}.
                    </p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Outstanding Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Outstanding</p>
                        <p className="text-gray-900 dark:text-white">KES {(totalOutstandingAll / 1000000).toFixed(2)}M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Avg per Client</p>
                        <p className="text-gray-900 dark:text-white">KES {(totalOutstandingAll / totalClients).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">From Good Standing</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">
                          KES {(useData.clients.filter(c => c.status === 'Good Standing').reduce((sum, client) => {
                            const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'In Arrears'));
                            return sum + clientLoans.reduce((loanSum, l) => loanSum + l.outstandingBalance, 0);
                          }, 0) / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">From Arrears Clients</p>
                        <p className="text-gray-900 dark:text-white text-red-600 dark:text-red-400">
                          KES {(useData.clients.filter(c => c.status === 'In Arrears').reduce((sum, client) => {
                            const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'In Arrears'));
                            return sum + clientLoans.reduce((loanSum, l) => loanSum + l.outstandingBalance, 0);
                          }, 0) / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Expected Collections (MTD)</p>
                        <p className="text-gray-900 dark:text-white">KES {(totalOutstandingAll * 0.08 / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Collection Rate (YTD)</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">87.3%</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Top 10 Outstanding Balances</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {useData.clients
                        .map(client => {
                          const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'In Arrears'));
                          const outstanding = clientLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
                          return { ...client, outstanding };
                        })
                        .filter(c => c.outstanding > 0)
                        .sort((a, b) => b.outstanding - a.outstanding)
                        .slice(0, 10)
                        .map(client => (
                          <div key={client.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
                            <div>
                              <p className="text-gray-900 text-sm">{client.name}</p>
                              <p className="text-gray-600 text-xs">
                                {client.businessType} • {client.branch} • Score: {client.creditScore}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-700 text-sm">KES {client.outstanding.toLocaleString()}</p>
                              <p className={`text-xs ${client.status === 'Good Standing' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {client.status}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                          {((useData.clients.filter(c => c.status === 'Good Standing').reduce((sum, client) => {
                            const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'In Arrears'));
                            return sum + clientLoans.reduce((loanSum, l) => loanSum + l.outstandingBalance, 0);
                          }, 0) / totalOutstandingAll) * 100).toFixed(1)}% of outstanding balance comes from clients in good standing, indicating healthy portfolio quality
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Average outstanding per client is KES {(totalOutstandingAll / totalClients).toLocaleString(undefined, { maximumFractionDigits: 0 })}, showing balanced loan size distribution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Focus collection efforts on top 10 accounts which represent {((useData.clients.map(client => {
                          const clientLoans = useData.loans.filter(l => l.clientUuid === client.id && (l.status === 'Active' || l.status === 'In Arrears'));
                          return clientLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
                        }).filter(o => o > 0).sort((a, b) => b - a).slice(0, 10).reduce((sum, o) => sum + o, 0) / totalOutstandingAll) * 100).toFixed(1)}% of total outstanding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Current collection rate of 87.3% is strong, maintain proactive follow-up to sustain this performance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}