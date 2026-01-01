import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart, LabelList, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { DollarSign, Users, TrendingUp, AlertTriangle, Activity, Banknote, Receipt, Wallet, X, Info, ChevronDown, Calendar } from 'lucide-react';
import { safePercentage, safeToFixed, safeDivideNum, safeFormat, safePercentageNum, safeDivide } from '../../utils/safeCalculations';
import { getCurrencySymbol, getCurrencyCode, formatCurrency } from '../../utils/currencyUtils';
import { getOrganizationName } from '../../utils/organizationUtils';

type DurationFilter = 'today' | 'week' | 'month';

interface DashboardTabProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardTab({ onNavigate }: DashboardTabProps) {
  const organizationName = getOrganizationName();
  
  // Duration filters state - load from localStorage
  const [portfolioDuration, setPortfolioDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('portfolioDuration') as DurationFilter) || 'month'
  );
  const [principalDuration, setPrincipalDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('principalDuration') as DurationFilter) || 'month'
  );
  const [interestDuration, setInterestDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('interestDuration') as DurationFilter) || 'month'
  );
  const [processingFeeDuration, setProcessingFeeDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('processingFeeDuration') as DurationFilter) || 'month'
  );
  const [clientsDuration, setClientsDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('clientsDuration') as DurationFilter) || 'month'
  );
  const [disbursedDuration, setDisbursedDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('disbursedDuration') as DurationFilter) || 'month'
  );
  const [collectionsDuration, setCollectionsDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('collectionsDuration') as DurationFilter) || 'month'
  );

  // Save to localStorage when changed
  useEffect(() => { localStorage.setItem('portfolioDuration', portfolioDuration); }, [portfolioDuration]);
  useEffect(() => { localStorage.setItem('principalDuration', principalDuration); }, [principalDuration]);
  useEffect(() => { localStorage.setItem('interestDuration', interestDuration); }, [interestDuration]);
  useEffect(() => { localStorage.setItem('processingFeeDuration', processingFeeDuration); }, [processingFeeDuration]);
  useEffect(() => { localStorage.setItem('clientsDuration', clientsDuration); }, [clientsDuration]);
  useEffect(() => { localStorage.setItem('disbursedDuration', disbursedDuration); }, [disbursedDuration]);
  useEffect(() => { localStorage.setItem('collectionsDuration', collectionsDuration); }, [collectionsDuration]);

  // Get real data from DataContext
  const { 
    clients: contextClients, 
    loans: contextLoans, 
    payments, 
    savingsAccounts,
    loanProducts,
    processingFeeRecords,
    approvals
  } = useData();
  
  const theme = useThemeStyles();
  const { isDark, currentTheme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
  // Get dynamic currency
  const currencySymbol = getCurrencySymbol();
  const currencyCode = getCurrencyCode();
  
  // Helper function to filter by date range
  const filterByDuration = (items: any[], dateField: string, duration: DurationFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return items.filter(item => {
      if (!item[dateField]) return false;
      const itemDate = new Date(item[dateField]);
      
      switch (duration) {
        case 'today':
          return itemDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return itemDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return itemDate >= monthAgo;
        default:
          return true;
      }
    });
  };
  
  // Apply duration filters to data
  const filteredClientsForCount = filterByDuration(contextClients, 'created_at', clientsDuration);
  const filteredLoansForPortfolio = filterByDuration(
    contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears'),
    'disbursementDate',
    portfolioDuration
  );
  const filteredLoansForPrincipal = filterByDuration(
    contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears'),
    'disbursementDate',
    principalDuration
  );
  const filteredLoansForInterest = filterByDuration(
    contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears'),
    'disbursementDate',
    interestDuration
  );
  const filteredProcessingFees = filterByDuration(
    processingFeeRecords.filter((r: any) => r.status === 'Collected'),
    'collectedDate',
    processingFeeDuration
  );
  const filteredLoansForDisbursement = filterByDuration(
    contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed'),
    'disbursementDate',
    disbursedDuration
  );
  const filteredPayments = filterByDuration(payments, 'date', collectionsDuration);
  
  // Helper functions to calculate analytics from real data
  const getPARData = () => {
    const totalPortfolio = contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears')
      .reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0);
    const par30 = contextLoans.filter((l: any) => (l.daysInArrears || 0) >= 30)
      .reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0);
    const par90 = contextLoans.filter((l: any) => (l.daysInArrears || 0) >= 90)
      .reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0);
    return {
      totalPortfolio,
      par30Ratio: safePercentage(par30, totalPortfolio, 2),
      par90Ratio: safePercentage(par90, totalPortfolio, 2),
      par30Amount: par30,
      par90Amount: par90
    };
  };

  const getPortfolioTrend = () => {
    const now = new Date();
    const months = [];
    
    // Get last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Filter loans that were active during this month
      const monthLoans = contextLoans.filter((loan: any) => {
        if (!loan.disbursementDate) return false;
        const disbursementDate = new Date(loan.disbursementDate);
        
        // Loan was disbursed before or during this month
        const wasDisbursed = disbursementDate <= new Date(year, month + 1, 0); // Last day of month
        
        // Check if loan was paid off before this month started
        const monthStart = new Date(year, month, 1);
        if (loan.status === 'Fully Paid' && loan.dateFullyPaid) {
          const paidDate = new Date(loan.dateFullyPaid);
          if (paidDate < monthStart) return false; // Paid before this month
        }
        
        return wasDisbursed;
      });
      
      // Calculate portfolio value (outstanding balance)
      const portfolio = monthLoans.reduce((sum: number, loan: any) => {
        return sum + (loan.outstandingBalance || 0);
      }, 0);
      
      // Calculate PAR30 for this month
      const par30Loans = monthLoans.filter((loan: any) => (loan.daysInArrears || 0) >= 30);
      const par30Amount = par30Loans.reduce((sum: number, loan: any) => sum + (loan.outstandingBalance || 0), 0);
      const par30Percentage = portfolio > 0 ? (par30Amount / portfolio) * 100 : 0;
      
      months.push({
        month: monthName,
        portfolio: Math.round(portfolio),
        par30: parseFloat(par30Percentage.toFixed(1))
      });
    }
    
    return months;
  };

  const getLoansByProduct = () => loanProducts.map((product: any) => ({
    name: product.name,
    count: contextLoans.filter((l: any) => l.productId === product.id && (l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears')).length,
    value: contextLoans.filter((l: any) => l.productId === product.id && (l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears'))
      .reduce((sum: number, l: any) => sum + l.outstandingBalance, 0)
  }));

  const getMonthlyDisbursements = () => {
    const now = new Date();
    const months = [];
    
    // Get last 7 months
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Filter loans disbursed in this month
      const monthLoans = contextLoans.filter((loan: any) => {
        if (!loan.disbursementDate) return false;
        const disbursementDate = new Date(loan.disbursementDate);
        return disbursementDate.getFullYear() === year && disbursementDate.getMonth() === month;
      });
      
      const totalAmount = monthLoans.reduce((sum: number, loan: any) => sum + (loan.principalAmount || 0), 0);
      
      months.push({
        month: monthName,
        amount: totalAmount,
        count: monthLoans.length
      });
    }
    
    return months;
  };

  const getCollectionRateByWeek = () => {
    const now = new Date();
    const weeks = [];
    
    // Get last 5 weeks (past weeks only, not including current incomplete week)
    for (let i = 5; i >= 1; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7)); // End is i weeks ago
      weekEnd.setDate(weekEnd.getDate() - weekEnd.getDay() + 6); // Saturday
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6); // Sunday
      
      // Format date range for display
      const formatDate = (date: Date) => {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      };
      
      const weekLabel = `${formatDate(weekStart)}-${formatDate(weekEnd).split(' ')[1]}`; // e.g., "Dec 1-7"
      
      // Filter payments made during this week
      const weekPayments = payments.filter((payment: any) => {
        if (!payment.date) return false;
        const paymentDate = new Date(payment.date);
        return paymentDate >= weekStart && paymentDate <= weekEnd;
      });
      
      const collected = weekPayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
      
      // Calculate expected: sum of installments due during this week
      // For simplicity, we'll use a proportion of total outstanding
      const expectedBase = contextLoans
        .filter((l: any) => l.status === 'Active' || l.status === 'Disbursed')
        .reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0) / 52; // Weekly average
      
      const expected = expectedBase;
      const rate = expected > 0 ? (collected / expected) * 100 : 100;
      
      weeks.push({
        week: weekLabel,
        collected: Math.round(collected),
        expected: Math.round(expected),
        rate: Math.min(rate, 100)
      });
    }
    
    return weeks;
  };

  const parData = getPARData();
  const portfolioTrend = getPortfolioTrend();
  const loansByProduct = getLoansByProduct();
  const monthlyDisbursements = getMonthlyDisbursements();
  const collectionRateByWeek = getCollectionRateByWeek();
  
  // Calculate real metrics from DataContext
  const totalClients = contextClients.length;
  const activeLoans = contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears').length;
  
  // Filter loans that are Active AND in Phase 5 of approvals
  const disbursedLoans = contextLoans.filter((l: any) => {
    const isActive = l.status === 'Active';
    const loanApproval = approvals.find((a: any) => a.relatedId === l.id);
    const isPhase5 = loanApproval?.phase === 5;
    return isActive && isPhase5;
  });
  
  const totalDisbursedYTD = disbursedLoans
    .filter((l: any) => new Date(l.disbursementDate).getFullYear() === 2025)
    .reduce((sum: number, l: any) => sum + (l.principalAmount || 0), 0);
  const savingsBalance = savingsAccounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
  
  // Calculate outstanding balance from active loans only
  const activeLoansData = contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed' || l.status === 'In Arrears');
  const totalOutstanding = activeLoansData.reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0);
  
  // Calculate filtered metrics based on duration selection
  const filteredTotalClients = filteredClientsForCount.length;
  const filteredPortfolioTotal = filteredLoansForPortfolio.reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0);
  const filteredPrincipalTotal = filteredLoansForPrincipal.reduce((sum: number, l: any) => sum + (l.principalAmount || 0), 0);
  const filteredInterestTotal = filteredLoansForInterest.reduce((sum: number, l: any) => sum + ((l.totalInterest || 0) - (l.interestPaid || 0)), 0);
  const filteredProcessingFeeTotal = filteredProcessingFees.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
  const filteredDisbursedTotal = filteredLoansForDisbursement.reduce((sum: number, l: any) => sum + (l.principalAmount || 0), 0);
  const filteredCollectionsTotal = filteredPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  
  // Debug: Log the active loans count and outstanding balance
  console.log('Dashboard Metrics Debug:', {
    totalLoans: contextLoans.length,
    activeLoans: activeLoansData.length,
    totalOutstanding,
    activeLoansDetails: activeLoansData.map(l => ({ id: l.id, status: l.status, outstanding: l.outstandingBalance }))
  });
  
  // Calculate AI Insights - clients at risk (loans with arrears >= 30 days)
  const atRiskLoans = contextLoans.filter((l: any) => (l.daysInArrears || 0) >= 30);
  const atRiskClientIds = new Set(atRiskLoans.map((l: any) => l.clientId));
  const atRiskClientsCount = atRiskClientIds.size;
  const potentialDefaults = atRiskLoans.reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0);
  
  // Calculate actual collection rate: Total Collected / Total Disbursed
  const totalDisbursed = contextLoans.reduce((sum: number, l: any) => sum + (l.principalAmount || 0), 0);
  const totalCollected = contextLoans.reduce((sum: number, l: any) => sum + (l.paidAmount || 0), 0);
  const actualCollectionRate = safePercentageNum(totalCollected, totalDisbursed);
  
  console.log('AI Risk Analysis:', {
    atRiskLoans: atRiskLoans.length,
    atRiskClients: atRiskClientsCount,
    potentialDefaults,
    totalDisbursed,
    totalCollected,
    actualCollectionRate: safeToFixed(actualCollectionRate, 2) + '%',
    atRiskDetails: atRiskLoans.map(l => ({ 
      clientName: l.clientName, 
      loanId: l.id, 
      daysInArrears: l.daysInArrears || 0, 
      outstanding: l.outstandingBalance || 0 
    }))
  });
  
  // Calculate outstanding principal and interest separately from active loans
  // Use principalOutstanding if available, otherwise estimate from outstandingBalance
  const outstandingPrincipal = activeLoansData.reduce((sum: number, l: any) => {
    if (l.principalOutstanding !== undefined && l.principalOutstanding !== null) {
      return sum + (l.principalOutstanding || 0);
    }
    // Fallback: estimate based on totalInterest
    const totalInterest = l.totalInterest || 0;
    const outstandingBalance = l.outstandingBalance || 0;
    const principalPart = outstandingBalance > totalInterest ? outstandingBalance - totalInterest : outstandingBalance * 0.9;
    return sum + principalPart;
  }, 0);
  
  const outstandingInterest = activeLoansData.reduce((sum: number, l: any) => {
    if (l.interestOutstanding !== undefined && l.interestOutstanding !== null) {
      return sum + (l.interestOutstanding || 0);
    }
    // Fallback: estimate as remaining interest
    const totalInterest = l.totalInterest || 0;
    const outstandingBalance = l.outstandingBalance || 0;
    const interestPart = outstandingBalance > totalInterest ? totalInterest : outstandingBalance * 0.1;
    return sum + interestPart;
  }, 0);
  
  // Calculate total collections from payments
  const totalCollections = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  
  const overdueLoans = contextLoans.filter((l: any) => l.daysInArrears > 0);
  const recentApplications = contextLoans.slice(-5).reverse();

  // Use theme colors
  const themeColors = isDark ? currentTheme.darkColors : currentTheme.colors;
  const COLORS = themeColors.chartColors || ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
  
  // Define loan status distribution with specific colors
  const getLoanStatusDistribution = () => [
    { status: 'Active', count: contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'Disbursed').length, color: '#4ade80' }, // Softer green
    { status: 'Fully Paid', count: contextLoans.filter((l: any) => l.status === 'Fully Paid').length, color: '#60a5fa' }, // Softer blue
    { status: 'In Arrears', count: contextLoans.filter((l: any) => l.status === 'In Arrears').length, color: '#fbbf24' }, // Softer amber
    { status: 'Written Off', count: contextLoans.filter((l: any) => l.status === 'Written Off').length, color: '#f87171' }, // Softer red/pink
  ];
  
  const loanStatusDistribution = getLoanStatusDistribution();
  
  // Debug loan status distribution
  console.log('Loan Status Distribution:', loanStatusDistribution);
  console.log('All loan statuses:', contextLoans.map((l: any) => l.status));
  console.log('Loans By Product:', loansByProduct);
  console.log('All loans:', contextLoans.map((l: any) => ({ id: l.id, productId: l.productId, status: l.status, outstanding: l.outstandingBalance })));

  // Transform loansByProduct data for MUI PieChart
  const pieChartData = loansByProduct.map((item, index) => ({
    label: item.name,
    value: item.value,
    color: COLORS[index % COLORS.length]
  }));

  // Calculate total for percentages
  const totalPortfolioValue = pieChartData.reduce((sum, item) => sum + item.value, 0);

  // Transform loan status data for radial bar chart
  const radialChartData = [
    {
      active: loanStatusDistribution[0].count,
      inArrears: loanStatusDistribution[1].count,
      paidOff: loanStatusDistribution[2].count,
      writtenOff: loanStatusDistribution[3].count,
    }
  ];
  
  const totalLoans = loanStatusDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 space-y-6" style={{
      backgroundColor: 'transparent'
    }}>
      {/* Header */}
      <div>
        <h2 className={theme.textPrimary}>Dashboard</h2>
        <p className={theme.textSecondary}>Overview of portfolio performance and key metrics</p>
      </div>

      {/* Loan Health Metrics - Top Row */}
      <div>
        <h3 className={`${theme.textPrimary} mb-3`}>Loan Health Metrics</h3>
        <div className="rounded-lg shadow-sm border p-6" style={{
          backgroundColor: '#1a1d29',
          borderColor: '#252932'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Gross Loan Portfolio */}
            <div 
              className="transition-colors rounded-lg p-2 -m-2"
            >
              <div className="flex items-start gap-3">
                <DollarSign className="size-6 flex-shrink-0 mt-1" style={{ color: COLORS[0] }} />
                <div className="flex-1">
                  <p className="text-sm mb-1" style={{ color: themeColors.cardTextSecondary }}>Gross Loan Portfolio</p>
                  <p className="text-2xl mb-1 cursor-pointer" onClick={() => onNavigate?.('loans')} style={{ color: themeColors.cardText }}>{currencySymbol} {(safeDivideNum(filteredPortfolioTotal || 0, 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 })}K</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs" style={{ color: themeColors.textSecondary }}>{filteredLoansForPortfolio.length} active loans</p>
                    <select
                      value={portfolioDuration}
                      onChange={(e) => setPortfolioDuration(e.target.value as DurationFilter)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-40 hover:opacity-100 transition-opacity ml-auto"
                      style={{ 
                        backgroundColor: 'rgba(13, 40, 56, 0.3)',
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6'
                      }}
                    >
                      <option value="today">1D</option>
                      <option value="week">1W</option>
                      <option value="month">1M</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Outstanding Principal */}
            <div 
              className="transition-colors rounded-lg p-2 -m-2 border-l pl-6"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-start gap-3">
                <Banknote className="size-6 flex-shrink-0 mt-1" style={{ color: COLORS[1] }} />
                <div className="flex-1">
                  <p className="text-sm mb-1" style={{ color: themeColors.cardTextSecondary }}>Outstanding Principal</p>
                  <p className="text-2xl mb-1 cursor-pointer" onClick={() => onNavigate?.('loans')} style={{ color: themeColors.cardText }}>{currencySymbol} {(safeDivideNum(filteredPrincipalTotal || 0, 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 })}K</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs" style={{ color: themeColors.textSecondary }}>from {filteredLoansForPrincipal.length} active loans</p>
                    <select
                      value={principalDuration}
                      onChange={(e) => setPrincipalDuration(e.target.value as DurationFilter)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-40 hover:opacity-100 transition-opacity ml-auto"
                      style={{ 
                        backgroundColor: 'rgba(13, 40, 56, 0.3)',
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6'
                      }}
                    >
                      <option value="today">1D</option>
                      <option value="week">1W</option>
                      <option value="month">1M</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Outstanding Interest */}
            <div 
              className="transition-colors rounded-lg p-2 -m-2 border-l pl-6"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-start gap-3">
                <TrendingUp className="size-6 flex-shrink-0 mt-1" style={{ color: COLORS[4] || COLORS[2] }} />
                <div className="flex-1">
                  <p className="text-sm mb-1" style={{ color: themeColors.cardTextSecondary }}>Outstanding Interest</p>
                  <p className="text-2xl mb-1 cursor-pointer" onClick={() => onNavigate?.('loans')} style={{ color: themeColors.cardText }}>{currencySymbol} {(safeDivideNum(filteredInterestTotal || 0, 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 })}K</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs" style={{ color: themeColors.textSecondary }}>Accrued interest</p>
                    <select
                      value={interestDuration}
                      onChange={(e) => setInterestDuration(e.target.value as DurationFilter)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-40 hover:opacity-100 transition-opacity ml-auto"
                      style={{ 
                        backgroundColor: 'rgba(13, 40, 56, 0.3)',
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6'
                      }}
                    >
                      <option value="today">1D</option>
                      <option value="week">1W</option>
                      <option value="month">1M</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Fee Revenue */}
            <div 
              className="transition-colors rounded-lg p-2 -m-2 border-l pl-6"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-start gap-3">
                <Receipt className="size-6 flex-shrink-0 mt-1" style={{ color: COLORS[5] || COLORS[1] }} />
                <div className="flex-1">
                  <p className="text-sm mb-1" style={{ color: themeColors.cardTextSecondary }}>Processing Fee Revenue</p>
                  <p className="text-2xl mb-1 cursor-pointer" onClick={() => onNavigate?.('accounting')} style={{ color: themeColors.cardText }}>{currencySymbol} {(safeDivideNum(filteredProcessingFeeTotal || 0, 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 })}K</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs" style={{ color: themeColors.textSecondary }}>{filteredProcessingFees.length} fees collected</p>
                    <select
                      value={processingFeeDuration}
                      onChange={(e) => setProcessingFeeDuration(e.target.value as DurationFilter)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-40 hover:opacity-100 transition-opacity ml-auto"
                      style={{ 
                        backgroundColor: 'rgba(13, 40, 56, 0.3)',
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6'
                      }}
                    >
                      <option value="today">1D</option>
                      <option value="week">1W</option>
                      <option value="month">1M</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Health & Risk - Bottom Row */}
      <div>
        <h3 className="mb-3" style={{ color: themeColors.cardText }}>Operational Health & Risk</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div 
            className="p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[0]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[0]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>Total Clients</p>
                <p className="text-3xl mb-1 cursor-pointer" onClick={() => onNavigate?.('clients')} style={{ color: COLORS[0] }}>{filteredTotalClients}</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>Registered borrowers</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="size-8 flex-shrink-0" style={{ color: COLORS[0] }} />
                <select
                  value={clientsDuration}
                  onChange={(e) => setClientsDuration(e.target.value as DurationFilter)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                  style={{ 
                    backgroundColor: 'rgba(13, 40, 56, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6'
                  }}
                >
                  <option value="today">1D</option>
                  <option value="week">1W</option>
                  <option value="month">1M</option>
                </select>
              </div>
            </div>
          </div>

          <div 
            className="p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[1]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[1]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>Disbursed (Total)</p>
                <p className="text-3xl mb-1 cursor-pointer" onClick={() => onNavigate?.('loans')} style={{ color: COLORS[1] }}>{currencySymbol} {(safeDivideNum(filteredDisbursedTotal || 0, 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 })}K</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>{filteredLoansForDisbursement.length} loans total</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <DollarSign className="size-8 flex-shrink-0" style={{ color: COLORS[1] }} />
                <select
                  value={disbursedDuration}
                  onChange={(e) => setDisbursedDuration(e.target.value as DurationFilter)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                  style={{ 
                    backgroundColor: 'rgba(13, 40, 56, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6'
                  }}
                >
                  <option value="today">1D</option>
                  <option value="week">1W</option>
                  <option value="month">1M</option>
                </select>
              </div>
            </div>
          </div>

          <div 
            className="p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[2]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[2]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>Collections (Total)</p>
                <p className="text-3xl mb-1 cursor-pointer" onClick={() => onNavigate?.('payments')} style={{ color: COLORS[2] }}>{currencySymbol} {(safeDivideNum(filteredCollectionsTotal || 0, 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 })}K</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>{filteredPayments.length} total payments</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Wallet className="size-8 flex-shrink-0" style={{ color: COLORS[2] }} />
                <select
                  value={collectionsDuration}
                  onChange={(e) => setCollectionsDuration(e.target.value as DurationFilter)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                  style={{ 
                    backgroundColor: 'rgba(13, 40, 56, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6'
                  }}
                >
                  <option value="today">1D</option>
                  <option value="week">1W</option>
                  <option value="month">1M</option>
                </select>
              </div>
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('loans')}
            className="p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[3]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[3]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>PAR 30 Days</p>
                <p className="text-3xl mb-1" style={{ color: COLORS[3] }}>0%</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>No arrears</p>
              </div>
              <AlertTriangle className="size-8 flex-shrink-0 ml-2" style={{ color: COLORS[3] }} />
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('payments')}
            className="p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[4] || COLORS[0]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[4] || COLORS[0]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>Collection Efficiency</p>
                <p className="text-3xl mb-1" style={{ color: COLORS[4] || COLORS[0] }}>100%</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>Matured loans paid</p>
              </div>
              <Activity className="size-8 flex-shrink-0 ml-2" style={{ color: COLORS[4] || COLORS[0] }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Portfolio Growth Trend */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: '#15233a',
          borderColor: '#1e2f42'
        }}>
          <h3 className="mb-3 text-sm" style={{ color: '#e1e8f0' }}>Portfolio Growth & PAR Trend</h3>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <LineChart 
              data={portfolioTrend}
              margin={{ top: 10, right: 0, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2f42" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#b8c5d6' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#b8c5d6' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${safeToFixed(safeDivideNum(value || 0, 1000000), 1)}M`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#b8c5d6' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 15]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === `Portfolio (${currencyCode})`) {
                    return [`${currencySymbol} ${safeToFixed(safeDivideNum(value || 0, 1000000), 1)}M`, name];
                  }
                  return [`${safeToFixed(value || 0, 0)}%`, name];
                }}
                contentStyle={{ 
                  fontSize: '12px',
                  backgroundColor: '#0d1b2a',
                  border: '1px solid #1e2f42',
                  color: '#e1e8f0'
                }}
                labelStyle={{ color: '#e1e8f0' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="line"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="portfolio"
                stroke={COLORS[1]}
                strokeWidth={2}
                dot={{ fill: COLORS[1], r: 4 }}
                name={`Portfolio (${currencyCode})`}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="par30"
                stroke={COLORS[3]}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS[3], r: 4 }}
                name="PAR 30 (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Loans by Product */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: '#15233a',
          borderColor: '#1e2f42'
        }}>
          <h3 className="mb-3 text-sm" style={{ color: '#e1e8f0' }}>Portfolio by Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height={200} minWidth={0}>
                <RechartsPieChart>
                  <Pie
                    data={loansByProduct}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {loansByProduct.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${currencySymbol} ${safeFormat(value || 0)}`}
                    contentStyle={{ 
                      fontSize: '12px',
                      backgroundColor: '#0d1b2a',
                      border: '1px solid #1e2f42',
                      color: '#e1e8f0'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-lg" style={{ color: '#e1e8f0' }}>{currencySymbol} {safeToFixed(safeDivideNum(totalPortfolioValue || 0, 1000000), 1)}M</p>
                  <p className="text-xs" style={{ color: '#b8c5d6' }}>Total</p>
                </div>
              </div>
            </div>

            {/* Custom Legend List */}
            <div className="flex items-center">
              <ul className="space-y-3 w-full">
                {loansByProduct.map((item, index) => {
                  const percentage = safePercentage(item.value || 0, totalPortfolioValue || 0, 1);
                  return (
                    <li key={`product-${index}-${item.name}`} className="flex space-x-3">
                      <span
                        className="w-1 shrink-0 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="text-sm" style={{ color: '#e1e8f0' }}>
                          {currencySymbol} {safeFormat(item.value || 0)}{' '}
                          <span style={{ color: '#b8c5d6' }}>({percentage}%)</span>
                        </p>
                        <p className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#b8c5d6' }}>
                          {item.name}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* New Charts Row 1 - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Disbursements */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: '#15233a',
          borderColor: '#1e2f42'
        }}>
          <h3 className="mb-3 text-sm" style={{ color: '#e1e8f0' }}>Monthly Disbursements (Last 7 Months)</h3>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <BarChart 
              data={monthlyDisbursements}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1e2f42" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#b8c5d6' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => `${currencySymbol} ${safeToFixed(safeDivideNum(value || 0, 1000000), 1)}M`}
                cursor={false}
                contentStyle={{ 
                  backgroundColor: '#0d1b2a',
                  border: '1px solid #1e2f42',
                  color: '#e1e8f0'
                }}
                labelStyle={{ color: '#e1e8f0' }}
              />
              <Bar dataKey="amount" radius={8}>
                {monthlyDisbursements.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.amount > 0 ? COLORS[1] : 'transparent'} />
                ))}
                <LabelList
                  position="top"
                  offset={12}
                  fontSize={11}
                  fill="#b8c5d6"
                  formatter={(value: number) => `${safeToFixed(safeDivideNum(value || 0, 1000000), 1)}M`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Rate by Week */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: '#15233a',
          borderColor: '#1e2f42'
        }}>
          <h3 className="mb-3 text-sm" style={{ color: '#e1e8f0' }}>Collection Rate (Last 5 Weeks)</h3>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <AreaChart 
              data={collectionRateByWeek}
              margin={{ left: 12, right: 12, top: 30, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1e2f42" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12, fill: '#b8c5d6' }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip 
                cursor={false}
                contentStyle={{ 
                  fontSize: '12px',
                  backgroundColor: '#0d1b2a',
                  border: '1px solid #1e2f42',
                  color: '#e1e8f0'
                }}
                labelStyle={{ color: '#e1e8f0' }}
                formatter={(value: number) => `${currencySymbol} ${safeFormat(value || 0)}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="rect"
              />
              <Area
                dataKey="expected"
                type="monotone"
                fill="#9333ea"
                fillOpacity={0.3}
                stroke="#9333ea"
                strokeWidth={2}
                name="Expected"
              />
              <Area
                dataKey="collected"
                type="monotone"
                fill="#ef4444"
                fillOpacity={0.3}
                stroke="#ef4444"
                strokeWidth={2}
                name="Collected"
              >
                <LabelList
                  position="top"
                  offset={8}
                  fontSize={11}
                  fill="#b8c5d6"
                  formatter={(value: number, entry: any) => {
                    if (!entry || !entry.payload) return '';
                    const rate = entry.payload.rate || 0;
                    return `${safeToFixed(rate, 1)}%`;
                  }}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Charts Row 2 - Compact */}
      <div className="grid grid-cols-1 gap-4">
        {/* Loan Status Distribution */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: '#15233a',
          borderColor: '#1e2f42'
        }}>
          <h3 className="mb-3 text-sm" style={{ color: '#e1e8f0' }}>Loan Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <BarChart
              data={loanStatusDistribution}
              layout="vertical"
              margin={{ top: 10, right: 16, bottom: 10, left: 10 }}
            >
              <CartesianGrid horizontal={false} stroke="#1e2f42" />
              <YAxis
                dataKey="status"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis 
                dataKey="count" 
                type="number" 
                hide 
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip
                cursor={false}
                contentStyle={{ 
                  fontSize: '12px',
                  backgroundColor: '#0d1b2a',
                  border: '1px solid #1e2f42',
                  color: '#e1e8f0'
                }}
                labelStyle={{ color: '#e1e8f0' }}
              />
              <Bar
                dataKey="count"
                layout="vertical"
                radius={4}
              >
                {loanStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="status"
                  content={(props: any) => {
                    const { x, y, width, height, value, index } = props;
                    const entry = loanStatusDistribution[index];
                    const hasData = entry && entry.count > 0;
                    
                    // Position label inside bar if there's data, otherwise at the start
                    const xPos = hasData ? x + 8 : x + 12;
                    
                    return (
                      <text
                        x={xPos}
                        y={y + height / 2}
                        fill={hasData ? (isDark ? '#1e293b' : '#ffffff') : (isDark ? '#6b7280' : '#9ca3af')}
                        fontSize="12px"
                        fontWeight="500"
                        textAnchor="start"
                        dominantBaseline="middle"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
                <LabelList
                  dataKey="count"
                  content={(props: any) => {
                    const { x, y, width, height, value, index } = props;
                    const entry = loanStatusDistribution[index];
                    const hasData = entry && entry.count > 0;
                    
                    // Position count at the end of bar if there's data, otherwise near the label
                    const xPos = hasData ? x + width + 8 : x + 100;
                    
                    return (
                      <text
                        x={xPos}
                        y={y + height / 2}
                        fill={hasData ? (isDark ? '#f1f5f9' : '#1f2937') : (isDark ? '#6b7280' : '#9ca3af')}
                        fontSize="12px"
                        fontWeight="500"
                        textAnchor="start"
                        dominantBaseline="middle"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed & Alerts - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue Loans Alert */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: '#15233a',
          borderColor: '#1e2f42'
        }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-red-600" />
            <h3 className="text-sm" style={{ color: '#e1e8f0' }}>Overdue Loan Alerts</h3>
          </div>
          <div className="space-y-2">
            {overdueLoans.slice(0, 5).map((loan) => {
              const client = contextClients.find(c => c.id === loan.clientId);
              return (
                <div key={loan.id} className="p-2 rounded border" style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm" style={{ color: '#e1e8f0' }}>{client?.name}</p>
                      <p className="text-xs" style={{ color: '#b8c5d6' }}>{loan.id} - {loan.daysInArrears} days overdue</p>
                    </div>
                    <span className="text-sm text-red-400">{currencySymbol} {safeFormat(loan.outstandingBalance || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: '#15233a',
          borderColor: '#1e2f42'
        }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="size-4 text-emerald-600" />
            <h3 className="text-sm" style={{ color: '#e1e8f0' }}>Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {recentApplications.map((loan) => {
              const client = contextClients.find(c => c.id === loan.clientId);
              // Determine the activity description based on loan status
              const isActive = loan.status === 'Active';
              const activityDescription = isActive 
                ? `New loan disbursed - ${loan.disbursementDate}` 
                : `Loan requested - ${loan.disbursementDate}`;
              
              return (
                <div key={loan.id} className="p-2 rounded border" style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.2)'
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm" style={{ color: '#e1e8f0' }}>{client?.name}</p>
                      <p className="text-xs" style={{ color: '#b8c5d6' }}>{activityDescription}</p>
                    </div>
                    <span className="text-sm text-emerald-400">{currencySymbol} {safeFormat(loan.principalAmount || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insight Widget - Compact */}
      <div 
        onClick={() => setSelectedMetric('ai-insights')}
        className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
          backgroundColor: '#15233a',
          borderColor: '#7c3aed'
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#7c3aed' }}>
            <Activity className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-sm" style={{ color: '#e1e8f0' }}>AI-Powered Insight</h3>
            {atRiskClientsCount > 0 ? (
              <>
                <p className="text-sm mb-1" style={{ color: '#e1e8f0' }}>
                  <strong>{atRiskClientsCount} client{atRiskClientsCount !== 1 ? 's' : ''} identified with highest risk of default in next 30 days.</strong>
                </p>
                <p className="text-xs" style={{ color: '#b8c5d6' }}>
                  Recommended action: Proactive outreach and payment plan restructuring for high-risk clients. 
                  Estimated prevention of {currencyCode} {(potentialDefaults / 1000).toFixed(0)}K in potential defaults.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm mb-1" style={{ color: '#e1e8f0' }}>
                  <strong>Excellent portfolio health! No clients at high risk of default.</strong>
                </p>
                <p className="text-xs" style={{ color: '#b8c5d6' }}>
                  All loans are performing well with no significant arrears. Continue monitoring and maintain proactive client engagement.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric Details Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ 
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: '#e1e8f0' }}>Metric Details</h3>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: '#b8c5d6' }}
                >
                  <X className="size-5" />
                </button>
              </div>

              {selectedMetric === 'gross-portfolio' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <DollarSign className="size-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-blue-900 dark:text-blue-100 text-sm">Gross Loan Portfolio</p>
                      <p className="text-blue-900 dark:text-blue-100 text-3xl">{currencyCode} 1.34B</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What is Gross Loan Portfolio?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">The Gross Loan Portfolio represents the total value of all outstanding loans disbursed by {organizationName} to clients. This includes both the principal amount and accrued interest that clients are expected to pay back.</p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Active Loans</p>
                        <p className="text-gray-900 dark:text-white">{activeLoans} loans</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Average Loan Size</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} {(1340000000 / activeLoans).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Portfolio Growth (YTD)</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">+12.5%</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Target for 2024</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 1.5B</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Portfolio is well-diversified across {loansByProduct.length} different loan products</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>60% of portfolio consists of business loans, indicating strong support for SMEs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Average loan duration is 12 months with flexible repayment terms</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'outstanding-principal' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Banknote className="size-8 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-emerald-900 dark:text-emerald-100 text-sm">Outstanding Principal</p>
                      <p className="text-emerald-900 dark:text-emerald-100 text-3xl">{currencyCode} 129.2M</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What is Outstanding Principal?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Outstanding Principal is the remaining loan amount (excluding interest) that clients still owe to {organizationName}. This represents the core capital that needs to be recovered from borrowers.</p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Current Principal</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 129.2M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Due This Month</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 15.4M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Overdue Principal</p>
                        <p className="text-gray-900 dark:text-white text-red-600 dark:text-red-400">{currencyCode} 12.1M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Principal Paid (MTD)</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">{currencyCode} 8.9M</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>9.4% of outstanding principal is currently overdue</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Principal recovery rate is at 87.3% YTD, above industry average of 82%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Focus on top 15 delinquent accounts could reduce overdue principal by 45%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'outstanding-interest' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <TrendingUp className="size-8 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-purple-900 dark:text-purple-100 text-sm">Outstanding Interest</p>
                      <p className="text-purple-900 dark:text-purple-100 text-3xl">{currencyCode} 908.2M</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What is Outstanding Interest?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Outstanding Interest represents all accrued interest charges on active loans that are yet to be collected from borrowers. This is a key revenue stream for the microfinance institution.</p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Current Interest</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 908.2M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Average Interest Rate</p>
                        <p className="text-gray-900 dark:text-white">16.5% p.a.</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Interest Earned (MTD)</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">{currencyCode} 45.2M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Projected (Dec 2024)</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 920M</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Interest collection rate is strong at 89.5% of accrued interest collected within 30 days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Business loans contribute 65% of total interest revenue</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Interest rates are competitive and comply with Central Bank of Kenya regulations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'penalty-fees' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Receipt className="size-8 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-amber-900 dark:text-amber-100 text-sm">Penalty & Fees</p>
                      <p className="text-amber-900 dark:text-amber-100 text-3xl">{currencyCode} 333.4M</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">What are Penalty & Fees?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Penalties and fees are charges applied to loans for late payments, loan processing, and other administrative services. These help cover operational costs and encourage timely repayment.</p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Late Payment Penalties</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 245.6M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Processing Fees</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 67.3M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Other Charges</p>
                        <p className="text-gray-900 dark:text-white">{currencyCode} 20.5M</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Collected This Month</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">{currencyCode} 28.4M</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>73.7% of penalties are from late payment charges, indicating need for improved collection strategies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>Processing fees are standardized at 2% of loan amount, in line with industry norms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>Consider implementing grace periods or payment reminders to reduce penalty accumulation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

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
                    <h4 className="text-gray-900 dark:text-white">What is Total Clients?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Total Clients represents all active borrowers who currently have loans with {organizationName} or maintain an active relationship with the institution.</p>
                    
                    <h4 className="text-gray-900 dark:text-white mt-4">Client Demographics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Clients</p>
                        <p className="text-gray-900 dark:text-white">{totalClients} clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total Loans</p>
                        <p className="text-gray-900 dark:text-white">{contextLoans.length} loans</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Active Loans</p>
                        <p className="text-gray-900 dark:text-white text-emerald-600 dark:text-emerald-400">{activeLoans}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Fully Paid</p>
                        <p className="text-gray-900 dark:text-white">9 loans</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>2 repeat borrowers (JOSPHAT M MATHEKA and Mr. STEPHEN MULU NZAVI) indicate strong client trust</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>100% collection rate on all 9 matured loans demonstrates excellent payment discipline</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>All clients served from our single location in Nairobi with centralized operations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'disbursement-ytd' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <DollarSign className="size-8 text-emerald-600" />
                    <div>
                      <p className="text-emerald-900 text-sm">Disbursement YTD</p>
                      <p className="text-emerald-900 text-3xl">{currencyCode} 0.1M</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What is Disbursement YTD?</h4>
                    <p className="text-gray-600 text-sm">Year-to-Date Disbursement is the total amount of new loans issued to clients since January 1st, 2024. This metric tracks the institution's lending activity and growth.</p>
                    
                    <h4 className="text-gray-900 mt-4">Disbursement Analysis</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total YTD</p>
                        <p className="text-gray-900">{currencyCode} 0.1M</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Average Loan</p>
                        <p className="text-gray-900">{currencyCode} {(100000 / 4).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Loans Disbursed</p>
                        <p className="text-gray-900">4 loans</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">YTD Target</p>
                        <p className="text-gray-900">{currencyCode} 180M</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>December is typically a strong month for disbursements due to holiday season business needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Business loans account for 60% of total disbursements YTD</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Average time from application to disbursement is 3-5 business days</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'savings-balance' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <Wallet className="size-8 text-indigo-600" />
                    <div>
                      <p className="text-indigo-900 text-sm">Savings Balance</p>
                      <p className="text-indigo-900 text-3xl">{currencyCode} 12.5M</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What is Savings Balance?</h4>
                    <p className="text-gray-600 text-sm">Savings Balance represents the total deposits held by {organizationName} on behalf of clients in their savings accounts. This provides financial security for clients and liquidity for the institution.</p>
                    
                    <h4 className="text-gray-900 mt-4">Savings Overview</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Savings</p>
                        <p className="text-gray-900">{currencyCode} 12.5M</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Active Savers</p>
                        <p className="text-gray-900">45 clients</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Average Balance</p>
                        <p className="text-gray-900">{currencyCode} {(12500000 / 45).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Growth (YTD)</p>
                        <p className="text-gray-900 text-emerald-600">+18.3%</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>Savings provide collateral security for loans and build client financial stability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>Average interest rate paid on savings is 5% per annum</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>75% of active borrowers also maintain savings accounts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'par-30' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="size-8 text-red-600" />
                    <div>
                      <p className="text-red-900 text-sm">PAR 30 Days</p>
                      <p className="text-red-900 text-3xl">12.79%</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What is PAR 30?</h4>
                    <p className="text-gray-600 text-sm">Portfolio at Risk (PAR) 30 Days measures the percentage of the loan portfolio where payments are overdue by 30 days or more. It's a key indicator of portfolio health and credit risk.</p>
                    
                    <h4 className="text-gray-900 mt-4">Risk Analysis</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Current PAR 30</p>
                        <p className="text-gray-900">12.79%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Industry Benchmark</p>
                        <p className="text-gray-900">5-8%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Amount at Risk</p>
                        <p className="text-gray-900 text-red-600">{currencyCode} 171.4M</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Loans Affected</p>
                        <p className="text-gray-900">18 loans</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights & Actions</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>Current PAR 30 is above industry benchmark - immediate action required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Focus on top 10 delinquent accounts representing 65% of PAR 30 value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Implement SMS reminders 7 days before due dates to prevent arrears</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Consider restructuring options for clients with temporary cash flow issues</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'collection-efficiency' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <Activity className="size-8 text-cyan-600" />
                    <div>
                      <p className="text-cyan-900 text-sm">Collection Efficiency</p>
                      <p className="text-cyan-900 text-3xl">87.3%</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What is Collection Efficiency?</h4>
                    <p className="text-gray-600 text-sm">Collection Efficiency measures the percentage of expected loan repayments that were successfully collected. This indicates how effective the institution is at recovering payments on time.</p>
                    
                    <h4 className="text-gray-900 mt-4">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Current Rate</p>
                        <p className="text-gray-900">87.3%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Target Rate</p>
                        <p className="text-gray-900">92%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Expected (MTD)</p>
                        <p className="text-gray-900">{currencyCode} 24.6M</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Collected (MTD)</p>
                        <p className="text-gray-900 text-emerald-600">{currencyCode} 21.5M</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights & Improvements</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span>87.3% is above the microfinance industry average of 82%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span>M-Pesa integration has improved collection rates by 15% compared to manual methods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span>Week 1 and 2 of each month show highest collection efficiency (92%+)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span>Automated reminders and field visits contribute to maintaining high rates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'ai-insights' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Activity className="size-8 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-purple-900 dark:text-purple-100 text-sm">AI-Powered Risk Analysis</p>
                      <p className="text-purple-900 dark:text-purple-100 text-3xl">{atRiskClientsCount} client{atRiskClientsCount !== 1 ? 's' : ''} at risk</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-gray-900 dark:text-white">Portfolio Health Analysis</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Our AI analyzes loan performance data to identify clients at high risk of default. 
                      Clients with loans in arrears for 30+ days are flagged for immediate attention.
                    </p>
                    
                    {atRiskClientsCount > 0 ? (
                      <>
                        <h4 className="text-gray-900 dark:text-white mt-4">At-Risk Clients</h4>
                        <div className="space-y-2">
                          {atRiskLoans.map((loan: any) => (
                            <div key={loan.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-900 dark:text-white">{loan.clientName}</p>
                                <span className="text-xs text-red-600 dark:text-red-400">{loan.daysInArrears} days overdue</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Loan: {loan.id}</span>
                                <span className="text-gray-900 dark:text-white">{currencyCode} {(loan.outstandingBalance / 1000).toFixed(1)}K outstanding</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <h4 className="text-gray-900 dark:text-white mt-4">Recommended Actions</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>Immediate phone outreach to all flagged clients to understand their situation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>Offer payment plan restructuring for clients facing temporary financial difficulties</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>Field visit by loan officer within 48 hours for high-value accounts</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>Potential savings: {currencyCode} {(potentialDefaults / 1000).toFixed(0)}K if defaults are prevented</span>
                          </li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <p className="text-emerald-900 dark:text-emerald-100">
                            ✓ Excellent portfolio health! No clients currently at high risk of default.
                          </p>
                        </div>
                        
                        <h4 className="text-gray-900 dark:text-white mt-4">Portfolio Metrics</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Total Active Loans</p>
                            <p className="text-gray-900 dark:text-white">{contextLoans.filter((l: any) => l.status === 'Active').length}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Loans in Arrears</p>
                            <p className="text-gray-900 dark:text-white">{contextLoans.filter((l: any) => l.daysInArrears > 0).length}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 text-xs">PAR 30 Ratio</p>
                            <p className="text-gray-900 dark:text-white">0.00%</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Collection Rate</p>
                            <p className="text-gray-900 dark:text-white">{actualCollectionRate.toFixed(2)}%</p>
                          </div>
                        </div>
                        
                        <h4 className="text-gray-900 dark:text-white mt-4">Keep It Up!</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>Continue proactive client engagement and payment reminders</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>Maintain regular field visits to build strong client relationships</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="size-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>Monitor early warning signs (1-15 days arrears) to prevent escalation</span>
                          </li>
                        </ul>
                      </>
                    )}
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