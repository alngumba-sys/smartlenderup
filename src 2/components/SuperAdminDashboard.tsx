import { useState, useEffect } from 'react';
import { 
  X, Shield, Building2, Users, DollarSign, BarChart3, 
  Globe, Settings, FileText, HelpCircle, LogOut, ChevronRight,
  TrendingUp, Activity, CreditCard, Lock, AlertCircle, Search,
  Filter, CheckCircle, XCircle, Clock, Eye, Ban, CheckSquare, RefreshCw, Database
} from 'lucide-react';
import { db } from '../utils/database';
import { supabase } from '../lib/supabase';
import { LoanManagementTab } from './superadmin/LoanManagementTab';
import { AnalyticsTab } from './superadmin/AnalyticsTab';
import { CountryManagementTab } from './superadmin/CountryManagementTab';
import { SupportTab } from './superadmin/SupportTab';
import { SecurityTab } from './superadmin/SecurityTab';
import { RoleManagementTab } from './superadmin/RoleManagementTab';
import { SubscriptionsTab } from './superadmin/SubscriptionsTab';
import { ComplianceTab } from './superadmin/ComplianceTab';
import { SettingsTab } from './superadmin/SettingsTab';
import { populateSampleData } from '../utils/populateSampleData';
import { toast } from 'sonner';

interface SuperAdminDashboardProps {
  onClose: () => void;
}

export function SuperAdminDashboard({ onClose }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'lenders', label: 'Lender Management', icon: Building2 },
    { id: 'borrowers', label: 'Borrower Management', icon: Users },
    { id: 'loans', label: 'Loan Management', icon: DollarSign },
    { id: 'analytics', label: 'Platform Analytics', icon: TrendingUp },
    { id: 'countries', label: 'Currency & Countries', icon: Globe },
    { id: 'roles', label: 'Role Management', icon: Lock },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'compliance', label: 'Compliance', icon: FileText },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'security', label: 'Security Status', icon: AlertCircle },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[400]" style={{ backgroundColor: '#1a2332' }}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6" style={{ backgroundColor: '#1a3a4a', borderBottom: '1px solid rgba(176, 137, 104, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(176, 137, 104, 0.15)' }}>
            <Shield className="size-6" style={{ color: '#b08968' }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#e8d1c9' }}>Super Admin Control Panel</h1>
            <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>SmartLenderUp Platform Management</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
          style={{ 
            backgroundColor: 'rgba(176, 137, 104, 0.1)',
            color: '#b08968'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(176, 137, 104, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(176, 137, 104, 0.1)'}
        >
          <LogOut className="size-4" />
          Exit Admin Panel
        </button>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 overflow-y-auto" style={{ backgroundColor: '#032b43', borderRight: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(176, 137, 104, 0.12)' : 'transparent',
                    color: isActive ? '#b08968' : '#d4c4ba',
                    borderLeft: isActive ? '3px solid #b08968' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(212, 196, 186, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon className="size-5" />
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  <ChevronRight className="size-4" style={{ opacity: isActive ? 1 : 0 }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#0d1b2a' }}>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'lenders' && <LenderManagementTab />}
          {activeTab === 'borrowers' && <BorrowerManagementTab />}
          {activeTab === 'loans' && <LoanManagementTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'countries' && <CountryManagementTab />}
          {activeTab === 'roles' && <RoleManagementTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'compliance' && <ComplianceTab />}
          {activeTab === 'support' && <SupportTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  const [stats, setStats] = useState({
    totalLenders: 0,
    totalBorrowers: 0,
    activeLoans: 0,
    platformRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Fetching platform stats from Supabase...');
      
      // Use optimized queries - only fetch what we need
      const [orgsResult, clientsResult, loansResult, repaymentsResult] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact' }),
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('loans').select('status'),
        supabase.from('repayments').select('amount, status')
      ]);
      
      const totalLenders = orgsResult.count || 0;
      const totalBorrowers = clientsResult.count || 0;
      const allLoans = loansResult.data || [];
      // Handle both capitalized and lowercase status values
      const activeLoans = allLoans.filter((l: any) => {
        const status = l.status?.toLowerCase();
        return status === 'active' || status === 'disbursed' || status === 'in arrears';
      }).length;
      
      // Calculate total revenue from repayments
      const allRepayments = repaymentsResult.data || [];
      const totalRevenue = allRepayments
        .filter((r: any) => r.status?.toLowerCase() === 'completed')
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
      
      console.log('✅ Platform Stats:', {
        totalLenders,
        totalBorrowers,
        activeLoans,
        totalRevenue
      });

      setStats({
        totalLenders,
        totalBorrowers,
        activeLoans,
        platformRevenue: totalRevenue
      });
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      
      // Fallback to localStorage
      const organizations = db.getAllOrganizations();
      const clients = db.getAllClients();
      const loans = db.getAllLoans();
      const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'disbursed');
      const repayments = db.getAllRepayments();
      const totalRevenue = repayments
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.amount, 0);
      
      setStats({
        totalLenders: organizations.length,
        totalBorrowers: clients.length,
        activeLoans: activeLoans.length,
        platformRevenue: totalRevenue
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-4" style={{ color: '#b08968' }} />
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Loading platform overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#e8d1c9' }}>Platform Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Lenders" 
          value={stats.totalLenders.toString()} 
          change="+0%" 
          icon={Building2}
          color="#b08968"
        />
        <StatCard 
          title="Total Borrowers" 
          value={stats.totalBorrowers.toString()} 
          change="+0%" 
          icon={Users}
          color="#7c9fb0"
        />
        <StatCard 
          title="Active Loans" 
          value={stats.activeLoans.toString()} 
          change="+0%" 
          icon={DollarSign}
          color="#8ba888"
        />
        <StatCard 
          title="Platform Revenue" 
          value={`$${stats.platformRevenue.toLocaleString()}`} 
          change="+0%" 
          icon={TrendingUp}
          color="#c9a66b"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              populateSampleData();
              toast.success('Sample data added! Refreshing page...');
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }}
            className="p-5 rounded-lg cursor-pointer transition-all text-left"
            style={{ backgroundColor: '#0d2535', border: '1px solid rgba(176, 137, 104, 0.25)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(176, 137, 104, 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(176, 137, 104, 0.25)'}
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="size-5" style={{ color: '#b08968' }} />
              <h4 className="font-medium" style={{ color: '#e8d1c9' }}>Populate Sample Data</h4>
            </div>
            <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Add demo clients, loans, and products for testing</p>
          </button>
          <QuickActionCard 
            title="Approve Pending Lenders"
            description="Review and approve new lender applications"
            count={0}
          />
          <QuickActionCard 
            title="Review Support Tickets"
            description="Handle customer support requests"
            count={0}
          />
          <QuickActionCard 
            title="Platform Security Alerts"
            description="Check system security notifications"
            count={0}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Recent Activity</h3>
        <div className="rounded-lg p-6" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <p className="text-sm text-center" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>No recent activity</p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, change, icon: Icon, color }: { title: string; value: string; change: string; icon: any; color: string }) {
  return (
    <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="size-5" style={{ color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: change.startsWith('+') ? '#10b981' : '#ef4444' }}>
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-1" style={{ color: '#e8d1c9' }}>{value}</h3>
      <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{title}</p>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({ title, description, count }: { title: string; description: string; count: number }) {
  return (
    <div className="p-5 rounded-lg cursor-pointer transition-all" 
      style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ec7347'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(232, 209, 201, 0.1)'}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium" style={{ color: '#e8d1c9' }}>{title}</h4>
        {count > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#ec7347', color: '#ffffff' }}>
            {count}
          </span>
        )}
      </div>
      <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{description}</p>
    </div>
  );
}

// Placeholder tabs - we'll implement these one by one
function LenderManagementTab() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended' | 'rejected'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [suspendingOrg, setSuspendingOrg] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const countries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'South Africa', 'Nigeria', 'Ghana', 'Zimbabwe', 'Zambia', 'Botswana', 'Malawi', 'Mozambique', 'Other'];

  const refreshOrganizations = async () => {
    setIsLoading(true);
    console.log('🔄 Refreshing organizations from Supabase...');
    
    try {
      // Fetch from Supabase first
      const { data: supabaseOrgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        toast.error('Failed to fetch organizations from Supabase');
        
        // Fallback to localStorage
        const localOrgs = db.getAllOrganizations();
        console.log('📦 Falling back to localStorage:', localOrgs.length);
        setOrganizations(localOrgs);
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Fetched from Supabase:', supabaseOrgs?.length || 0);
      console.log('📋 Organizations:', supabaseOrgs);
      
      // Update localStorage cache
      if (supabaseOrgs && supabaseOrgs.length > 0) {
        const dbData = db.getDB();
        dbData.organizations = supabaseOrgs;
        db.saveDB(dbData);
        console.log('💾 Updated localStorage cache');
      }
      
      setOrganizations(supabaseOrgs || []);
    } catch (error) {
      console.error('❌ Error refreshing organizations:', error);
      toast.error('Failed to refresh organizations');
      
      // Fallback to localStorage
      const localOrgs = db.getAllOrganizations();
      setOrganizations(localOrgs);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh organizations when component mounts
  useEffect(() => {
    console.log('📊 Lender Management Tab mounted - refreshing data');
    refreshOrganizations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-4" style={{ color: '#3b82f6' }} />
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Loading organizations...</p>
        </div>
      </div>
    );
  }

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesCountry = countryFilter === 'all' || org.country === countryFilter;
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const updateOrgStatus = async (orgId: string, newStatus: 'pending' | 'active' | 'suspended' | 'rejected') => {
    try {
      console.log(`🔄 Updating organization ${orgId} status to ${newStatus}...`);
      
      // Update in Supabase first
      const { error } = await supabase
        .from('organizations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orgId);
      
      if (error) {
        console.error('❌ Supabase update error:', error);
        toast.error('Failed to update organization status in Supabase');
        return;
      }
      
      console.log('✅ Updated in Supabase successfully');
      
      // Update in localStorage
      db.updateOrganization(orgId, { status: newStatus });
      console.log('💾 Updated localStorage cache');
      
      // Refresh the list
      await refreshOrganizations();
      
      // Update selected org if it's the one being updated
      if (selectedOrg?.id === orgId) {
        setSelectedOrg({ ...selectedOrg, status: newStatus });
      }
      
      toast.success(`Organization status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating organization status:', error);
      toast.error('Failed to update organization status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'suspended': return '#ef4444';
      case 'rejected': return '#991b1b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'suspended': return Ban;
      case 'rejected': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Lender Management</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Manage all registered organizations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshOrganizations}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ backgroundColor: '#0f1829', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            title="Refresh organizations list"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: '#0f1829', color: '#e8d1c9' }}>
            Total: <span className="font-bold" style={{ color: '#3b82f6' }}>{organizations.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'rgba(232, 209, 201, 0.4)' }} />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2838',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2838',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Country Filter */}
        <div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2838',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4" style={{ color: '#10b981' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Active</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
            {organizations.filter(o => o.status?.toLowerCase() === 'active').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4" style={{ color: '#f59e0b' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Pending</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            {organizations.filter(o => o.status?.toLowerCase() === 'pending').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Ban className="size-4" style={{ color: '#ef4444' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Suspended</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {organizations.filter(o => o.status?.toLowerCase() === 'suspended').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(153, 27, 27, 0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="size-4" style={{ color: '#991b1b' }} />
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Rejected</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#991b1b' }}>
            {organizations.filter(o => o.status?.toLowerCase() === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(59, 130, 246, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#1a3a52' }}>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#94b8d3' }}>Organization</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#94b8d3' }}>Username</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#94b8d3' }}>Country</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#94b8d3' }}>Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#94b8d3' }}>Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#94b8d3' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  No organizations found
                </td>
              </tr>
            ) : (
              filteredOrgs.map((org, index) => {
                const StatusIcon = getStatusIcon(org.status);
                return (
                  <tr 
                    key={org.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? '#1a2942' : '#0f1929',
                      borderTop: '1px solid rgba(59, 130, 246, 0.05)'
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {org.organization_logo ? (
                          <img src={org.organization_logo} alt="" className="size-12 rounded-lg object-cover" style={{ backgroundColor: '#ffffff' }} />
                        ) : (
                          <div className="size-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 115, 71, 0.15)' }}>
                            <Building2 className="size-6" style={{ color: '#ec7347' }} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{org.organization_name}</p>
                          <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Microfinance</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono" style={{ color: '#e8d1c9' }}>{org.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: '#e8d1c9' }}>{org.country}</p>
                      <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{org.currency}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: '#e8d1c9' }}>{org.contact_person_email || org.email}</p>
                      <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{org.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="size-4" style={{ color: getStatusColor(org.status) }} />
                        <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(org.status) }}>
                          {org.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrg(org)}
                          className="p-1.5 rounded hover:opacity-70"
                          style={{ color: '#3b82f6' }}
                          title="View Details"
                        >
                          <Eye className="size-4" />
                        </button>
                        {org.status === 'pending' && (
                          <button
                            onClick={() => updateOrgStatus(org.id, 'active')}
                            className="p-1.5 rounded hover:opacity-70"
                            style={{ color: '#3b82f6' }}
                            title="Approve"
                          >
                            <CheckSquare className="size-4" />
                          </button>
                        )}
                        {org.status === 'active' && (
                          <button
                            onClick={() => {
                              setSuspendingOrg(org);
                              setSuspendReason('');
                            }}
                            className="p-1.5 rounded hover:opacity-70"
                            style={{ color: '#ef4444' }}
                            title="Suspend"
                          >
                            <Ban className="size-4" />
                          </button>
                        )}
                        {org.status === 'suspended' && (
                          <button
                            onClick={() => updateOrgStatus(org.id, 'active')}
                            className="p-1.5 rounded hover:opacity-70"
                            style={{ color: '#10b981' }}
                            title="Activate"
                          >
                            <CheckCircle className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Organization Details Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: '#1e4a5f', border: '1px solid rgba(30, 74, 95, 0.5)' }}>
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#164459', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 className="text-xl" style={{ color: '#e8d1c9' }}>Organization Details</h3>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                style={{ color: '#e8d1c9' }}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Basic Information</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRow label="Organization Name" value={selectedOrg.organization_name} />
                  <InfoRow label="Username" value={selectedOrg.username} />
                  <InfoRow label="Registration Number" value={selectedOrg.registration_number} />
                  <InfoRow label="Industry" value={selectedOrg.industry} />
                  <InfoRow label="Type" value={selectedOrg.organization_type} />
                  <InfoRow label="Status" value={selectedOrg.status} />
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Location & Currency</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRow label="Country" value={selectedOrg.country} />
                  <InfoRow label="Currency" value={selectedOrg.currency} />
                  <InfoRow label="County/Region" value={selectedOrg.county} />
                  <InfoRow label="Town/City" value={selectedOrg.town} />
                  <InfoRow label="Address" value={selectedOrg.address} />
                  <InfoRow label="Postal Code" value={selectedOrg.postal_code || 'N/A'} />
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Contact Information</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRow label="Email" value={selectedOrg.email} />
                  <InfoRow label="Phone" value={selectedOrg.phone} />
                  <InfoRow label="Alternative Phone" value={selectedOrg.alternative_phone || 'N/A'} />
                  <InfoRow label="Website" value={selectedOrg.website || 'N/A'} />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <h4 className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Contact Person</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRow label="Name" value={`${selectedOrg.contact_person_first_name} ${selectedOrg.contact_person_last_name}`} />
                  <InfoRow label="Title" value={selectedOrg.contact_person_title} />
                  <InfoRow label="Email" value={selectedOrg.contact_person_email} />
                  <InfoRow label="Phone" value={selectedOrg.contact_person_phone} />
                </div>
              </div>

              {/* Additional */}
              <div>
                <h4 className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Additional Details</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRow label="Date of Incorporation" value={selectedOrg.date_of_incorporation || 'N/A'} />
                  <InfoRow label="Number of Employees" value={selectedOrg.number_of_employees || 'N/A'} />
                  <InfoRow label="Expected Clients" value={selectedOrg.expected_clients || 'N/A'} />
                  <InfoRow label="Created At" value={new Date(selectedOrg.created_at).toLocaleDateString()} />
                </div>
                {selectedOrg.description && (
                  <div className="mt-4">
                    <p className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Description</p>
                    <p className="text-sm" style={{ color: '#d1dfe6' }}>{selectedOrg.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
                {selectedOrg.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateOrgStatus(selectedOrg.id, 'active');
                        setSelectedOrg(null);
                      }}
                      className="flex-1 py-2.5 rounded-lg font-medium"
                      style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                    >
                      Approve Organization
                    </button>
                    <button
                      onClick={() => {
                        updateOrgStatus(selectedOrg.id, 'rejected');
                        setSelectedOrg(null);
                      }}
                      className="flex-1 py-2.5 rounded-lg font-medium"
                      style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedOrg.status === 'active' && (
                  <button
                    onClick={() => {
                      updateOrgStatus(selectedOrg.id, 'suspended');
                      setSelectedOrg(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg font-medium"
                    style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  >
                    Suspend Organization
                  </button>
                )}
                {selectedOrg.status === 'suspended' && (
                  <button
                    onClick={() => {
                      updateOrgStatus(selectedOrg.id, 'active');
                      setSelectedOrg(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg font-medium"
                    style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  >
                    Reactivate Organization
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Verification Modal */}
      {suspendingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="max-w-md w-full rounded-xl shadow-2xl" style={{ backgroundColor: '#1e4a5f', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#164459', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                <Ban className="size-5" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Suspend Organization</h3>
                <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>This action requires verification</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm mb-2" style={{ color: '#e8d1c9' }}>
                  You are about to suspend <span className="font-semibold" style={{ color: '#ef4444' }}>{suspendingOrg.organization_name}</span>
                </p>
                <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
                  This organization will lose access to the platform immediately. This action can be reversed later.
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                  Reason for suspension <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Please provide a detailed reason for suspending this organization..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                  style={{
                    backgroundColor: '#0d2838',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#e8d1c9'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  Minimum 10 characters required
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSuspendingOrg(null);
                    setSuspendReason('');
                  }}
                  className="flex-1 py-2.5 rounded-lg font-medium transition-all"
                  style={{ 
                    backgroundColor: 'rgba(148, 163, 184, 0.1)', 
                    color: '#94a3b8',
                    border: '1px solid rgba(148, 163, 184, 0.3)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (suspendReason.trim().length < 10) {
                      toast.error('Please provide a detailed reason (minimum 10 characters)');
                      return;
                    }
                    updateOrgStatus(suspendingOrg.id, 'suspended');
                    toast.success(`${suspendingOrg.organization_name} has been suspended. Reason: ${suspendReason}`);
                    setSuspendingOrg(null);
                    setSuspendReason('');
                  }}
                  disabled={suspendReason.trim().length < 10}
                  className="flex-1 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: suspendReason.trim().length >= 10 ? '#ef4444' : '#7f1d1d', 
                    color: '#ffffff' 
                  }}
                >
                  Confirm Suspension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for info rows
function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{label}</p>
      <p className="text-sm" style={{ color: '#d1dfe6' }}>{value}</p>
    </div>
  );
}

function BorrowerManagementTab() {
  const [clients, setClients] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'group'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blacklisted'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  // Refresh clients when component mounts or updates
  useEffect(() => {
    console.log('🔄 BorrowerManagementTab mounted - refreshing clients');
    const loadData = async () => {
      await Promise.all([refreshClients(), refreshOrganizations()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const refreshOrganizations = async () => {
    try {
      const { data: orgsData } = await supabase.from('organizations').select('id, organization_name, country');
      if (orgsData) setOrganizations(orgsData);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const refreshClients = async () => {
    console.log('📊 Fetching clients from Supabase...');
    
    try {
      // Fetch ONLY from Supabase
      const { data: supabaseClients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        toast.error('Failed to fetch clients from Supabase');
        setClients([]);
        return;
      }
      
      console.log('✅ Fetched from Supabase:', supabaseClients?.length || 0);
      console.log('📋 Clients:', supabaseClients);
      
      // Normalize client data - ensure all have proper client_type and status
      const normalizedClients = (supabaseClients || []).map(client => ({
        ...client,
        // Ensure client_type has a value
        client_type: client.client_type || (client.group_name ? 'group' : 'individual'),
        // Ensure status has a value (default to active)
        status: client.status || 'active',
        // Ensure proper name fields
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        group_name: client.group_name || ''
      }));
      
      console.log('✅ Normalized clients:', normalizedClients);
      
      setClients(normalizedClients);
    } catch (error) {
      console.error('❌ Error refreshing clients:', error);
      toast.error('Failed to refresh clients');
      setClients([]);
    }
  };

  const filteredClients = clients.filter(client => {
    const name = client.client_type === 'individual' 
      ? `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase()
      : client.group_name?.toLowerCase() || '';
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                         (client.client_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.phone || '').includes(searchTerm);
    const matchesType = typeFilter === 'all' || client.client_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || (client.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    // Get client's organization country
    const clientOrg = organizations.find(org => org.id === client.organization_id);
    const matchesCountry = countryFilter === 'all' || clientOrg?.country === countryFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesCountry;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, countryFilter]);

  // Get unique countries from organizations
  const uniqueCountries = [...new Set(organizations.map(org => org.country))].filter(Boolean).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-4" style={{ color: '#3b82f6' }} />
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Loading borrowers...</p>
        </div>
      </div>
    );
  }

  const updateClientStatus = async (clientId: string, newStatus: 'active' | 'inactive' | 'blacklisted') => {
    try {
      console.log(`🔄 Updating client ${clientId} status to ${newStatus}...`);
      
      // Update in Supabase first
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', clientId);
      
      if (error) {
        console.error('❌ Supabase update error:', error);
        toast.error('Failed to update client status in Supabase');
        return;
      }
      
      console.log('✅ Updated in Supabase successfully');
      
      // Update in localStorage
      db.updateClient(clientId, { status: newStatus });
      console.log('💾 Updated localStorage cache');
      
      // Refresh the list
      await refreshClients();
      
      // Update selected client if it's the one being updated
      if (selectedClient?.id === clientId) {
        setSelectedClient({ ...selectedClient, status: newStatus });
      }
      
      toast.success(`Client status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating client status:', error);
      toast.error('Failed to update client status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#3b82f6';
      case 'inactive': return '#94a3b8';
      case 'blacklisted': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getCreditTierColor = (tier: string) => {
    switch (tier) {
      case 'excellent': return '#10b981';
      case 'very_good': return '#3b82f6';
      case 'good': return '#8b5cf6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  // Get client's loan history
  const getClientLoans = async (clientId: string) => {
    try {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .eq('client_id', clientId);
      
      if (error) {
        console.error('❌ Error fetching client loans:', error);
        return db.getAllLoans().filter(loan => loan.client_id === clientId);
      }
      
      return loans || [];
    } catch (error) {
      console.error('❌ Error fetching client loans:', error);
      return db.getAllLoans().filter(loan => loan.client_id === clientId);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Borrower Management</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Manage individual and group borrowers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshClients}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ backgroundColor: '#0f1829', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            title="Refresh borrowers list"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: '#0f1829', color: '#e8d1c9' }}>
            Total: <span className="font-bold" style={{ color: '#3b82f6' }}>{clients.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'rgba(232, 209, 201, 0.4)' }} />
          <input
            type="text"
            placeholder="Search by name, number, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2838',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2838',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2838',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
        </div>

        <div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2838',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Individuals</p>
          <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>
            {clients.filter(c => c.client_type === 'individual').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Groups</p>
          <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>
            {clients.filter(c => c.client_type === 'group').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Active</p>
          <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
            {clients.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Inactive</p>
          <p className="text-2xl font-bold" style={{ color: '#94a3b8' }}>
            {clients.filter(c => c.status === 'inactive').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2540', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Blacklisted</p>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {clients.filter(c => c.status === 'blacklisted').length}
          </p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#154F73' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Borrower</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Client Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Credit Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  No borrowers found
                </td>
              </tr>
            ) : (
              paginatedClients.map((client, index) => (
                <tr 
                  key={client.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#0a2540' : '#0d1929',
                    borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <Users className="size-5" style={{ color: '#3b82f6' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>
                          {client.client_type === 'individual' 
                            ? `${client.first_name || 'Unknown'} ${client.last_name || ''}`.trim() || 'Unnamed Client'
                            : client.group_name || 'Unnamed Group'}
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{client.phone || client.email || 'No contact'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-3 py-1 rounded-full capitalize font-medium" style={{ 
                      backgroundColor: client.client_type === 'individual' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                      color: client.client_type === 'individual' ? '#3b82f6' : '#8b5cf6'
                    }}>
                      {client.client_type || 'individual'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono" style={{ color: '#e8d1c9' }}>
                      {client.client_number || `CL-${String(index + 1).padStart(5, '0')}`}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#e8d1c9' }}>
                        {client.credit_score || (client.client_type === 'individual' ? Math.floor(Math.random() * 300) + 500 : 'N/A')}
                      </p>
                      <p className="text-xs capitalize" style={{ color: getCreditTierColor(client.credit_tier || 'fair') }}>
                        {client.credit_tier ? client.credit_tier.replace('_', ' ') : (client.client_type === 'individual' ? 'Fair' : 'N/A')}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(client.status || 'inactive') }}>
                      {client.status || 'inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="p-1.5 rounded hover:opacity-70"
                        style={{ color: '#3b82f6' }}
                        title="View Details"
                      >
                        <Eye className="size-4" />
                      </button>
                      {client.status === 'active' && (
                        <button
                          onClick={() => updateClientStatus(client.id, 'blacklisted')}
                          className="p-1.5 rounded hover:opacity-70"
                          style={{ color: '#ef4444' }}
                          title="Blacklist"
                        >
                          <Ban className="size-4" />
                        </button>
                      )}
                      {client.status === 'blacklisted' && (
                        <button
                          onClick={() => updateClientStatus(client.id, 'active')}
                          className="p-1.5 rounded hover:opacity-70"
                          style={{ color: '#3b82f6' }}
                          title="Activate"
                        >
                          <CheckCircle className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredClients.length)} of {filteredClients.length} borrowers
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#0f1829', 
                color: '#3b82f6', 
                border: '1px solid rgba(59, 130, 246, 0.2)' 
              }}
            >
              Previous
            </button>
            <span className="text-sm px-3" style={{ color: '#e8d1c9' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#0f1829', 
                color: '#3b82f6', 
                border: '1px solid rgba(59, 130, 246, 0.2)' 
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(2, 8, 56, 0.95)' }}>
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl" style={{ backgroundColor: '#032b43', border: '1px solid rgba(236, 115, 71, 0.3)' }}>
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#154F73', borderBottom: '1px solid rgba(236, 115, 71, 0.2)' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Borrower Details & Credit History</h3>
              <button onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#e8d1c9' }}>
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: '#ec7347' }}>Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedClient.client_type === 'individual' ? (
                    <>
                      <InfoRow label="Name" value={`${selectedClient.first_name} ${selectedClient.last_name}`} />
                      <InfoRow label="Gender" value={selectedClient.gender || 'N/A'} />
                      <InfoRow label="Date of Birth" value={selectedClient.date_of_birth || 'N/A'} />
                      <InfoRow label="Marital Status" value={selectedClient.marital_status || 'N/A'} />
                    </>
                  ) : (
                    <InfoRow label="Group Name" value={selectedClient.group_name} />
                  )}
                  <InfoRow label="Client Number" value={selectedClient.client_number} />
                  <InfoRow label="ID Number" value={selectedClient.id_number} />
                  <InfoRow label="Phone" value={selectedClient.phone} />
                  <InfoRow label="Email" value={selectedClient.email || 'N/A'} />
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: '#ec7347' }}>Location</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="County" value={selectedClient.county} />
                  <InfoRow label="Sub County" value={selectedClient.sub_county || 'N/A'} />
                  <InfoRow label="Ward" value={selectedClient.ward || 'N/A'} />
                  <InfoRow label="Village" value={selectedClient.village || 'N/A'} />
                  <InfoRow label="Address" value={selectedClient.address} />
                </div>
              </div>

              {/* Credit Information */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: '#ec7347' }}>Credit Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Credit Score</p>
                    <p className="text-3xl font-bold" style={{ color: '#ec7347' }}>{selectedClient.credit_score}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Credit Tier</p>
                    <p className="text-lg font-bold capitalize" style={{ color: getCreditTierColor(selectedClient.credit_tier) }}>
                      {selectedClient.credit_tier.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Status</p>
                    <p className="text-lg font-bold capitalize" style={{ color: getStatusColor(selectedClient.status) }}>
                      {selectedClient.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Loan History */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: '#ec7347' }}>Loan History</h4>
                {(() => {
                  const clientLoans = getClientLoans(selectedClient.id);
                  return clientLoans.length === 0 ? (
                    <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>No loan history</p>
                  ) : (
                    <div className="space-y-2">
                      {clientLoans.map(loan => (
                        <div key={loan.id} className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#020838', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{loan.loan_number}</p>
                            <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Principal: KES {loan.principal_amount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium capitalize" style={{ color: loan.status === 'completed' ? '#10b981' : loan.status === 'defaulted' ? '#ef4444' : '#f59e0b' }}>
                              {loan.status}
                            </p>
                            <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Phase: {loan.phase}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
                {selectedClient.status === 'active' && (
                  <button
                    onClick={() => {
                      updateClientStatus(selectedClient.id, 'blacklisted');
                      setSelectedClient(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg font-medium"
                    style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  >
                    Blacklist Borrower
                  </button>
                )}
                {selectedClient.status === 'blacklisted' && (
                  <button
                    onClick={() => {
                      updateClientStatus(selectedClient.id, 'active');
                      setSelectedClient(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg font-medium"
                    style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  >
                    Remove from Blacklist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}