import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Building2, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { db } from '../../utils/database';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function AnalyticsTab() {
  const [stats, setStats] = useState({
    organizations: [] as any[],
    clients: [] as any[],
    loans: [] as any[],
    repayments: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = async () => {
    setIsLoading(true);
    console.log('📊 Fetching analytics data from Supabase...');
    
    try {
      const [orgsResult, clientsResult, loansResult, paymentsResult] = await Promise.all([
        supabase.from('organizations').select('id, organization_name, country, status, created_at'),
        supabase.from('clients').select('id, organization_id, created_at'),
        supabase.from('loans').select('id, organization_id, status, amount, total_repayable, total_paid, disbursement_date, created_at'),
        supabase.from('repayments').select('id, loan_id, amount, status, payment_date')
      ]);
      
      if (orgsResult.error || clientsResult.error || loansResult.error || paymentsResult.error) {
        console.error('❌ Supabase error:', {
          orgs: orgsResult.error,
          clients: clientsResult.error,
          loans: loansResult.error,
          repayments: paymentsResult.error
        });
        toast.error('Failed to fetch analytics data from Supabase');
        
        // Set empty arrays instead of localStorage fallback
        setStats({
          organizations: [],
          clients: [],
          loans: [],
          repayments: []
        });
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Fetched analytics data from Supabase');
      
      // Normalize loan data to match expected structure
      const normalizedLoans = (loansResult.data || []).map(loan => ({
        ...loan,
        loan_number: loan.loan_number || loan.id,
        principal_amount: loan.amount || 0, // ✅ FIX: Use 'amount' from Supabase
        loan_term_months: loan.loan_term_months || loan.term_months || 0,
        interest_rate: loan.interest_rate || loan.rate || 0,
        total_repayable: loan.total_repayable || loan.total_amount || 0,
        total_paid: loan.total_paid || 0,
        balance: loan.balance || (loan.total_repayable || loan.total_amount || 0) - (loan.total_paid || 0),
      }));
      
      setStats({
        organizations: orgsResult.data || [],
        clients: clientsResult.data || [],
        loans: normalizedLoans,
        repayments: paymentsResult.data || []
      });
    } catch (error) {
      console.error('❌ Error refreshing analytics:', error);
      toast.error('Failed to refresh analytics');
      
      // Set empty arrays instead of localStorage fallback
      setStats({
        organizations: [],
        clients: [],
        loans: [],
        repayments: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { organizations, clients, loans, repayments } = stats;

  // Get unique countries for the filter
  const uniqueCountries = [...new Set(organizations.map(org => org.country))].filter(Boolean).sort();

  // Filter data by selected country
  const filteredOrganizations = selectedCountry === 'all' 
    ? organizations 
    : organizations.filter(o => o.country === selectedCountry);
  
  const filteredOrgIds = new Set(filteredOrganizations.map(o => o.id));
  
  const filteredLoans = selectedCountry === 'all'
    ? loans
    : loans.filter(l => filteredOrgIds.has(l.organization_id));
  
  const filteredClients = selectedCountry === 'all'
    ? clients
    : clients.filter(c => filteredOrgIds.has(c.organization_id));

  // Calculate metrics (handle case-insensitive status)
  const totalLenderCount = filteredOrganizations.length;
  const activeLenderCount = filteredOrganizations.filter(o => o.status?.toLowerCase() === 'active').length;
  const totalBorrowerCount = filteredClients.length;
  const individualBorrowerCount = filteredClients.filter(c => c.client_type === 'individual').length;
  const groupBorrowerCount = filteredClients.filter(c => c.client_type === 'group').length;
  const totalLoansCount = filteredLoans.length;
  const activeLoansCount = filteredLoans.filter(l => {
    const status = l.status?.toLowerCase();
    return status === 'active' || status === 'disbursed';
  }).length;
  const completedLoansCount = filteredLoans.filter(l => l.status?.toLowerCase() === 'completed').length;
  const defaultedLoansCount = filteredLoans.filter(l => l.status?.toLowerCase() === 'defaulted').length;

  const totalDisbursed = filteredLoans
    .filter(l => {
      const status = l.status?.toLowerCase();
      return ['disbursed', 'active', 'completed', 'defaulted'].includes(status);
    })
    .reduce((sum, l) => sum + (Number(l.principal_amount) || 0), 0);

  // Filter repayments based on loans in the selected country
  const filteredLoanIds = new Set(filteredLoans.map(l => l.id));
  const filteredRepayments = repayments.filter(r => filteredLoanIds.has(r.loan_id));

  const totalRepaid = filteredRepayments
    .filter(r => r.status?.toLowerCase() === 'completed')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const defaultRate = totalLoansCount > 0 ? (defaultedLoansCount / totalLoansCount * 100) : 0;
  const repaymentRate = totalDisbursed > 0 ? (totalRepaid / totalDisbursed * 100) : 0;

  const avgLoanSize = totalLoansCount > 0 
    ? filteredLoans.reduce((sum, l) => sum + (Number(l.principal_amount) || 0), 0) / totalLoansCount 
    : 0;

  // By country analysis
  const countryStats = organizations.reduce((acc: any, org) => {
    const country = org.country;
    if (!acc[country]) {
      acc[country] = { lenders: 0, loans: 0, disbursed: 0 };
    }
    acc[country].lenders++;
    
    const orgLoans = loans.filter(l => l.organization_id === org.id);
    acc[country].loans += orgLoans.length;
    acc[country].disbursed += orgLoans
      .filter(l => ['disbursed', 'active', 'completed'].includes(l.status))
      .reduce((sum, l) => sum + l.principal_amount, 0);
    
    return acc;
  }, {});

  // Monthly disbursement trend (last 6 months) - use filtered data
  const getMonthlyDisbursements = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      // Calculate actual disbursements for this month from filtered loan data
      const monthDisbursements = filteredLoans.filter(loan => {
        if (!loan.disbursement_date && !loan.created_at) return false;
        
        const loanDate = new Date(loan.disbursement_date || loan.created_at);
        const loanMonth = loanDate.getMonth();
        const loanYear = loanDate.getFullYear();
        
        return loanMonth === monthIndex && loanYear === year && 
               ['disbursed', 'active', 'completed'].includes(loan.status);
      });
      
      const totalDisbursed = monthDisbursements.reduce((sum, loan) => 
        sum + (loan.principal_amount || 0), 0
      );
      
      monthlyData.push({
        month: months[monthIndex],
        amount: totalDisbursed
      });
    }
    return monthlyData;
  };

  const monthlyData = getMonthlyDisbursements();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-4" style={{ color: '#b08968' }} />
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Platform Analytics</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
            {selectedCountry === 'all' ? 'Real-time platform performance metrics' : `Analytics for ${selectedCountry}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: '#0d2535',
              border: '1px solid rgba(176, 137, 104, 0.25)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <button
            onClick={refreshStats}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ backgroundColor: '#0d2535', color: '#b08968', border: '1px solid rgba(176, 137, 104, 0.25)' }}
            title="Refresh analytics"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Platform Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Key Platform Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Capital Deployed"
            value={`KES ${totalDisbursed.toLocaleString()}`}
            icon={DollarSign}
            color="#b08968"
            subtitle="Across all lenders"
          />
          <MetricCard
            title="Total Repaid"
            value={`KES ${totalRepaid.toLocaleString()}`}
            icon={TrendingUp}
            color="#8ba888"
            subtitle={`${repaymentRate.toFixed(1)}% repayment rate`}
          />
          <MetricCard
            title="Active Lenders"
            value={activeLenderCount.toString()}
            icon={Building2}
            color="#3b82f6"
            subtitle={`${totalLenderCount} total registered`}
          />
          <MetricCard
            title="Total Borrowers"
            value={totalBorrowerCount.toString()}
            icon={Users}
            color="#f59e0b"
            subtitle={`${individualBorrowerCount} individuals, ${groupBorrowerCount} groups`}
          />
        </div>
      </div>

      {/* Loan Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Loan Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Loans"
            value={totalLoansCount.toString()}
            subtitle="All time"
            color="#e8d1c9"
          />
          <StatCard
            title="Active Loans"
            value={activeLoansCount.toString()}
            subtitle="Currently disbursed"
            color="#3b82f6"
          />
          <StatCard
            title="Completed Loans"
            value={completedLoansCount.toString()}
            subtitle="Fully repaid"
            color="#10b981"
          />
          <StatCard
            title="Defaulted Loans"
            value={defaultedLoansCount.toString()}
            subtitle={`${defaultRate.toFixed(1)}% default rate`}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Average Loan Size */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Loan Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(236, 115, 71, 0.2)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Average Loan Size</p>
            <p className="text-3xl font-bold" style={{ color: '#ec7347' }}>
              KES {Math.round(avgLoanSize).toLocaleString()}
            </p>
          </div>
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(236, 115, 71, 0.2)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Default Rate</p>
            <p className="text-3xl font-bold" style={{ color: defaultRate > 5 ? '#ef4444' : '#10b981' }}>
              {defaultRate.toFixed(1)}%
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
              {defaultedLoansCount} of {totalLoansCount} loans
            </p>
          </div>
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(236, 115, 71, 0.2)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Repayment Rate</p>
            <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
              {repaymentRate.toFixed(1)}%
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
              KES {totalRepaid.toLocaleString()} repaid
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Disbursement Trend */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Monthly Disbursement Trend (Last 6 Months)</h3>
        <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-end justify-between gap-4 h-64">
            {monthlyData.map((data, index) => {
              const maxAmount = Math.max(...monthlyData.map(d => d.amount), 1); // Ensure at least 1
              const heightPercent = maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0;
              const barHeight = data.amount > 0 ? Math.max(heightPercent * 2, 20) : 10; // Show small bar even for 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                    <div className="relative group cursor-pointer">
                      <div 
                        className="w-full rounded-t transition-all"
                        style={{ 
                          height: `${barHeight}px`,
                          backgroundColor: data.amount > 0 ? '#ec7347' : 'rgba(232, 209, 201, 0.2)',
                          minHeight: '10px'
                        }}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                        style={{ backgroundColor: '#154F73', color: '#e8d1c9' }}
                      >
                        KES {data.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium" style={{ color: '#e8d1c9' }}>{data.month}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Country-wise Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Country-wise Performance</h3>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#154F73' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Lenders</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Total Loans</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Total Disbursed</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Avg per Lender</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(countryStats).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                    No data available
                  </td>
                </tr>
              ) : (
                Object.entries(countryStats)
                  .sort((a: any, b: any) => b[1].disbursed - a[1].disbursed)
                  .map(([country, stats]: [string, any], index) => (
                    <tr 
                      key={country}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#032b43' : '#020838',
                        borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                      }}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{country}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm" style={{ color: '#e8d1c9' }}>{stats.lenders}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm" style={{ color: '#e8d1c9' }}>{stats.loans}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: '#ec7347' }}>
                          KES {stats.disbursed.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm" style={{ color: '#e8d1c9' }}>
                          KES {Math.round(stats.disbursed / stats.lenders).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  subtitle: string;
}) {
  return (
    <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="size-5" style={{ color }} />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1" style={{ color }}>{value}</h3>
      <p className="text-sm mb-1" style={{ color: '#e8d1c9' }}>{title}</p>
      <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{subtitle}</p>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { 
  title: string; 
  value: string; 
  subtitle: string;
  color: string;
}) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
      <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{title}</p>
      <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{subtitle}</p>
    </div>
  );
}