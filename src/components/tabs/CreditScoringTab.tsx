import { Brain, TrendingUp, AlertTriangle, CheckCircle, Filter, Search, Eye, RefreshCw, Download, Settings, X, Info, Users, Building2, Target, Award, Clock, DollarSign, Percent, Shield } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { CreditScoringParametersModal } from '../modals/CreditScoringParametersModal';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from 'recharts';

interface CreditScore {
  clientId: string;
  clientName: string;
  phoneNumber: string;
  location: string;
  currentScore: number;
  previousScore: number;
  scoreChange: number;
  riskCategory: 'excellent' | 'good' | 'average' | 'poor';
  lastUpdated: string;
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    accountAge: number;
    loanCount: number;
    savingsBalance: number;
  };
  repaymentRate: number;
  activeLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  daysOverdue: number;
  clientType: 'individual' | 'business';
}

export function CreditScoringTab() {
  const { isDark } = useTheme();
  const { clients, loans, repayments, calculateClientCreditScore, updateClient } = useData();
  const { navigateToClient } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'business'>('individual');
  
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

  // Credit score calculation weights (configurable) - separate for individual and business
  const [scoringWeights, setScoringWeights] = useState({
    individual: {
      paymentHistory: 35,
      creditUtilization: 30,
      accountAge: 15,
      loanCount: 10,
      savingsBalance: 10
    },
    business: {
      paymentHistory: 30,
      creditUtilization: 25,
      accountAge: 20,
      loanCount: 15,
      savingsBalance: 10
    }
  });

  // Force re-render key for charts
  const [chartKey, setChartKey] = useState({ individual: 0, business: 0 });
  const [modalClientType, setModalClientType] = useState<'individual' | 'business'>('individual');

  // Recalculate all client credit scores on component mount
  useEffect(() => {
    if (clients.length === 0) return;
    
    let hasUpdates = false;
    clients.forEach(client => {
      const newScore = calculateClientCreditScore(client.id);
      if (newScore !== client.creditScore) {
        updateClient(client.id, { creditScore: newScore }, { silent: true });
        hasUpdates = true;
      }
    });
    if (hasUpdates) {
      console.log('Credit scores recalculated for all clients');
    }
  }, [clients.length, loans.length]);

  const handleSaveParameters = (parameters: any[]) => {
    // Convert array of parameter objects to the weights object format
    const weights = {
      paymentHistory: 35,
      creditUtilization: 30,
      accountAge: 15,
      loanCount: 10,
      savingsBalance: 10
    };

    // Map parameter names to weight keys
    parameters.forEach(param => {
      if (!param.enabled) return;
      
      const name = param.name.toLowerCase().replace(/\s+/g, '');
      if (name.includes('payment') && name.includes('history')) {
        weights.paymentHistory = param.weight;
      } else if (name.includes('credit') && name.includes('utilization')) {
        weights.creditUtilization = param.weight;
      } else if (name.includes('account') && name.includes('age')) {
        weights.accountAge = param.weight;
      } else if (name.includes('loan') && name.includes('count')) {
        weights.loanCount = param.weight;
      } else if (name.includes('savings') && name.includes('balance')) {
        weights.savingsBalance = param.weight;
      }
    });

    setScoringWeights(prev => ({
      ...prev,
      [modalClientType]: weights
    }));
    setChartKey(prev => ({
      ...prev,
      [modalClientType]: prev[modalClientType] + 1
    })); // Force chart re-render
    console.log('Credit scoring parameters updated:', weights);
  };

  // Generate credit scores from real client data
  const creditScores: CreditScore[] = useMemo(() => {
    return clients.map(client => {
      const clientLoans = loans.filter(l => l.clientId === client.id);
      const clientRepayments = repayments.filter(r => r.clientId === client.id && r.status === 'Approved');
      
      const totalBorrowed = clientLoans.reduce((sum, l) => sum + l.principalAmount, 0);
      const totalRepaid = clientRepayments.reduce((sum, r) => sum + r.principal, 0);
      const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed').length;
      const closedLoans = clientLoans.filter(l => l.status === 'Fully Paid' || l.status === 'Closed').length;
      const repaymentRate = totalBorrowed > 0 ? (totalRepaid / totalBorrowed) * 100 : 0;
      
      const daysOverdue = Math.max(0, ...clientLoans
        .filter(l => l.status === 'Active' || l.status === 'Disbursed')
        .map(l => l.daysInArrears || 0)
      );

      const score = client.creditScore || 300;
      let riskCategory: 'excellent' | 'good' | 'average' | 'poor';
      if (score >= 761) riskCategory = 'excellent';
      else if (score >= 701) riskCategory = 'good';
      else if (score >= 621) riskCategory = 'average';
      else riskCategory = 'poor';

      const paymentHistoryScore = Math.min(100, closedLoans * 20 + (repaymentRate * 0.3));
      const creditUtilization = Math.min(100, repaymentRate);
      const accountAgeMonths = Math.floor(
        (new Date().getTime() - new Date(client.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const accountAgeScore = Math.min(100, accountAgeMonths * 5);

      return {
        clientId: client.id,
        clientName: client.name,
        phoneNumber: client.phone,
        location: client.address || 'N/A',
        currentScore: score,
        previousScore: score,
        scoreChange: 0,
        riskCategory,
        lastUpdated: client.lastUpdated || client.joinDate,
        factors: {
          paymentHistory: Math.round(paymentHistoryScore),
          creditUtilization: Math.round(creditUtilization),
          accountAge: Math.round(accountAgeScore),
          loanCount: Math.min(100, clientLoans.length * 10),
          savingsBalance: 0
        },
        repaymentRate: Math.round(repaymentRate * 10) / 10,
        activeLoans,
        totalBorrowed,
        totalRepaid,
        daysOverdue,
        clientType: client.clientType || 'individual'
      };
    });
  }, [clients, loans, repayments]);

  // Filter by client type (individual or business)
  const filteredByType = creditScores.filter(score => score.clientType === activeTab);

  const filteredScores = filteredByType.filter(score => {
    const matchesSearch = searchQuery === '' || 
      score.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.phoneNumber.includes(searchQuery);
    const matchesRisk = filterRisk === 'all' || score.riskCategory === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // Separate client lists for individual and business
  const individualClients = creditScores.filter(s => s.clientType === 'individual');
  const businessClients = creditScores.filter(s => s.clientType === 'business');

  // Calculate stats for current tab
  const stats = {
    avgScore: filteredByType.length > 0 ? Math.round(filteredByType.reduce((sum, s) => sum + s.currentScore, 0) / filteredByType.length) : 0,
    excellent: filteredByType.filter(s => s.riskCategory === 'excellent').length,
    good: filteredByType.filter(s => s.riskCategory === 'good').length,
    average: filteredByType.filter(s => s.riskCategory === 'average').length,
    poor: filteredByType.filter(s => s.riskCategory === 'poor').length,
    totalClients: filteredByType.length,
    avgRepaymentRate: filteredByType.length > 0 ? Math.round(filteredByType.reduce((sum, s) => sum + s.repaymentRate, 0) / filteredByType.length) : 0,
    lowRiskShare: filteredByType.length > 0 ? Math.round(((filteredByType.filter(s => s.riskCategory === 'excellent' || s.riskCategory === 'good').length) / filteredByType.length) * 100) : 0
  };

  // Calculate stats for individual clients
  const individualStats = {
    avgScore: individualClients.length > 0 ? Math.round(individualClients.reduce((sum, s) => sum + s.currentScore, 0) / individualClients.length) : 0,
    excellent: individualClients.filter(s => s.riskCategory === 'excellent').length,
    good: individualClients.filter(s => s.riskCategory === 'good').length,
    average: individualClients.filter(s => s.riskCategory === 'average').length,
    poor: individualClients.filter(s => s.riskCategory === 'poor').length,
    totalClients: individualClients.length,
    avgRepaymentRate: individualClients.length > 0 ? Math.round(individualClients.reduce((sum, s) => sum + s.repaymentRate, 0) / individualClients.length) : 0,
    lowRiskShare: individualClients.length > 0 ? Math.round(((individualClients.filter(s => s.riskCategory === 'excellent' || s.riskCategory === 'good').length) / individualClients.length) * 100) : 0
  };

  // Calculate stats for business clients
  const businessStats = {
    avgScore: businessClients.length > 0 ? Math.round(businessClients.reduce((sum, s) => sum + s.currentScore, 0) / businessClients.length) : 0,
    excellent: businessClients.filter(s => s.riskCategory === 'excellent').length,
    good: businessClients.filter(s => s.riskCategory === 'good').length,
    average: businessClients.filter(s => s.riskCategory === 'average').length,
    poor: businessClients.filter(s => s.riskCategory === 'poor').length,
    totalClients: businessClients.length,
    avgRepaymentRate: businessClients.length > 0 ? Math.round(businessClients.reduce((sum, s) => sum + s.repaymentRate, 0) / businessClients.length) : 0,
    lowRiskShare: businessClients.length > 0 ? Math.round(((businessClients.filter(s => s.riskCategory === 'excellent' || s.riskCategory === 'good').length) / businessClients.length) * 100) : 0
  };

  // Donut chart data for individual credit score calculation
  const individualChartData = useMemo(() => [
    { name: 'Payment History', value: scoringWeights.individual.paymentHistory, color: '#8b5cf6' },  // Purple
    { name: 'Credit Utilization', value: scoringWeights.individual.creditUtilization, color: '#06b6d4' },  // Cyan
    { name: 'Account Age', value: scoringWeights.individual.accountAge, color: '#10b981' },  // Emerald
    { name: 'Loan Count', value: scoringWeights.individual.loanCount, color: '#f59e0b' },  // Amber
    { name: 'Savings Balance', value: scoringWeights.individual.savingsBalance, color: '#6366f1' }  // Indigo
  ], [scoringWeights.individual]);

  // Donut chart data for business credit score calculation
  const businessChartData = useMemo(() => [
    { name: 'Payment History', value: scoringWeights.business.paymentHistory, color: '#8b5cf6' },  // Purple
    { name: 'Credit Utilization', value: scoringWeights.business.creditUtilization, color: '#06b6d4' },  // Cyan
    { name: 'Account Age', value: scoringWeights.business.accountAge, color: '#10b981' },  // Emerald
    { name: 'Loan Count', value: scoringWeights.business.loanCount, color: '#f59e0b' },  // Amber
    { name: 'Savings Balance', value: scoringWeights.business.savingsBalance, color: '#6366f1' }  // Indigo
  ], [scoringWeights.business]);

  const getRiskBadge = (risk: string) => {
    const colors = {
      excellent: isDark ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      good: isDark ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200',
      average: isDark ? 'bg-amber-900/30 text-amber-300 border-amber-700' : 'bg-amber-50 text-amber-700 border-amber-200',
      poor: isDark ? 'bg-orange-900/30 text-orange-300 border-orange-700' : 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[risk as keyof typeof colors] || (isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700');
  };

  const getRiskLabel = (risk: string) => {
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor'
    };
    return labels[risk as keyof typeof labels] || risk;
  };

  const getScoreColor = (score: number) => {
    if (isDark) {
      if (score >= 761) return 'text-emerald-400';
      if (score >= 701) return 'text-blue-400';
      if (score >= 621) return 'text-amber-400';
      return 'text-orange-400';
    } else {
      if (score >= 761) return 'text-emerald-700';
      if (score >= 701) return 'text-blue-700';
      if (score >= 621) return 'text-amber-700';
      return 'text-orange-700';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 761) return 'bg-emerald-600';
    if (score >= 701) return 'bg-blue-600';
    if (score >= 621) return 'bg-amber-600';
    return 'bg-orange-600';
  };

  return (
    <div className="p-4 space-y-4 relative">
      {/* Decorative Background with Dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Background */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-pink-900/10' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50'}`}></div>
        
        {/* Dot Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)'} 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}></div>
        
        {/* Larger Accent Dots */}
        <div className={`absolute top-20 left-20 w-3 h-3 rounded-full ${isDark ? 'bg-purple-500/20' : 'bg-purple-400/30'}`}></div>
        <div className={`absolute top-40 right-32 w-2 h-2 rounded-full ${isDark ? 'bg-blue-500/20' : 'bg-blue-400/30'}`}></div>
        <div className={`absolute bottom-40 left-40 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-pink-500/20' : 'bg-pink-400/30'}`}></div>
        <div className={`absolute top-60 right-20 w-4 h-4 rounded-full ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/30'}`}></div>
        <div className={`absolute bottom-20 right-60 w-3 h-3 rounded-full ${isDark ? 'bg-orange-500/20' : 'bg-orange-400/30'}`}></div>
        <div className={`absolute top-32 left-1/2 w-2 h-2 rounded-full ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-400/30'}`}></div>
      </div>

      {/* Content with higher z-index */}
      <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mx-[0px] my-[11px]">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Credit Scoring Engine</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI-powered credit risk assessment</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowParametersModal(true)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
          >
            <Settings className="size-3.5" />
            Configure
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
            <RefreshCw className="size-3.5" />
            Recalculate
          </button>
          <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm">
            <Download className="size-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Score Range Legend */}
      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <div className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>POOR</div>
            <div className="bg-[rgb(201,38,6)] text-white px-2 py-1 rounded text-xs">
              300-579
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>FAIR</div>
            <div className="bg-[rgb(240,124,0)] text-white px-2 py-1 rounded text-xs">
              580-669
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>GOOD</div>
            <div className="bg-cyan-500 text-white px-2 py-1 rounded text-xs">
              670-739
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>VERY GOOD</div>
            <div className="bg-[rgb(112,192,81)] text-white px-2 py-1 rounded text-xs">
              740-799
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>EXCELLENT</div>
            <div className="bg-[rgb(9,148,62)] text-white px-2 py-1 rounded text-xs">
              800-850
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-3 mx-[0px] my-[15px]">
        {/* Individual Credit Score Chart */}
        <div className={`col-span-6 rounded-lg ${isDark ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-3 shadow-sm`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="size-4 text-blue-500" />
            <h3 className={`text-center text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Individual Credit Score</h3>
          </div>
          <div style={{ width: '100%', height: '280px', minHeight: '280px', minWidth: '100px', position: 'relative' }}>
            {isMounted && <ResponsiveContainer width="100%" height={280} aspect={undefined} key={chartKey.individual}>
              <PieChart>
                <Pie
                  data={individualChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 30;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    // Determine text anchor based on position
                    const textAnchor = x > cx ? 'start' : 'end';
                    
                    return (
                      <g>
                        {/* Percentage - Line 1 */}
                        <text 
                          x={x} 
                          y={y - 6} 
                          fill={isDark ? '#ffffff' : '#1f2937'}
                          textAnchor={textAnchor} 
                          dominantBaseline="central"
                          style={{ fontSize: '14px', fontWeight: '700' }}
                        >
                          {`${value}%`}
                        </text>
                        {/* Parameter name - Line 2 */}
                        <text 
                          x={x} 
                          y={y + 8} 
                          fill={isDark ? '#d1d5db' : '#4b5563'}
                          textAnchor={textAnchor} 
                          dominantBaseline="central"
                          style={{ fontSize: '9px', fontWeight: '500' }}
                        >
                          {name}
                        </text>
                      </g>
                    );
                  }}
                  labelLine={{
                    stroke: isDark ? '#6b7280' : '#9ca3af',
                    strokeWidth: 1.5
                  }}
                >
                  {individualChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>}
          </div>
          <div className={`text-center mt-2 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-0.5`}>How Your</div>
            <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>CREDIT SCORE</div>
            <div className={`text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>is calculated</div>
          </div>
        </div>

        {/* Business Credit Score Chart */}
        <div className={`col-span-6 rounded-lg ${isDark ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-3 shadow-sm`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="size-4 text-emerald-500" />
            <h3 className={`text-center text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Business Credit Score</h3>
          </div>
          <div style={{ width: '100%', height: '280px', minHeight: '280px', minWidth: '100px', position: 'relative' }}>
            {isMounted && <ResponsiveContainer width="100%" height={280} aspect={undefined} key={chartKey.business}>
              <PieChart>
                <Pie
                  data={businessChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 30;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    // Determine text anchor based on position
                    const textAnchor = x > cx ? 'start' : 'end';
                    
                    return (
                      <g>
                        {/* Percentage - Line 1 */}
                        <text 
                          x={x} 
                          y={y - 6} 
                          fill={isDark ? '#ffffff' : '#1f2937'}
                          textAnchor={textAnchor} 
                          dominantBaseline="central"
                          style={{ fontSize: '14px', fontWeight: '700' }}
                        >
                          {`${value}%`}
                        </text>
                        {/* Parameter name - Line 2 */}
                        <text 
                          x={x} 
                          y={y + 8} 
                          fill={isDark ? '#d1d5db' : '#4b5563'}
                          textAnchor={textAnchor} 
                          dominantBaseline="central"
                          style={{ fontSize: '9px', fontWeight: '500' }}
                        >
                          {name}
                        </text>
                      </g>
                    );
                  }}
                  labelLine={{
                    stroke: isDark ? '#6b7280' : '#9ca3af',
                    strokeWidth: 1.5
                  }}
                >
                  {businessChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>}
          </div>
          <div className={`text-center mt-2 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-0.5`}>How Your</div>
            <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>CREDIT SCORE</div>
            <div className={`text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>is calculated</div>
          </div>
        </div>
      </div>

      {/* Individual Stats Cards */}
      <div className="mx-[0px] my-[11px]">
        <div className="flex items-center gap-2 mb-[8px] mt-[30px] mr-[0px] ml-[0px]">
          <Users className="size-4 text-blue-500" />
          <h3 className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Individual Clients Statistics</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Card 1: Average Score */}
          <div className={`p-2.5 rounded-lg border-l-4 border-purple-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{individualStats.avgScore}</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Across {individualStats.totalClients} individuals</p>
              </div>
              <Target className={`size-7 text-purple-500`} />
            </div>
          </div>

          {/* Card 2: Excellent Scores */}
          <div className={`p-2.5 rounded-lg border-l-4 border-emerald-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Excellent (761-850)</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{individualStats.excellent}</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Premium borrowers</p>
              </div>
              <Award className={`size-7 text-emerald-500`} />
            </div>
          </div>

          {/* Card 3: Good Scores */}
          <div className={`p-2.5 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Good (701-760)</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{individualStats.good}</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Low risk borrowers</p>
              </div>
              <CheckCircle className={`size-7 text-blue-500`} />
            </div>
          </div>

          {/* Card 4: Low Risk Share */}
          <div className={`p-2.5 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Low Risk Share</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{individualStats.lowRiskShare}%</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Good + Excellent</p>
              </div>
              <Shield className={`size-7 text-green-500`} />
            </div>
          </div>
        </div>
      </div>

      {/* Business Stats Cards */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="size-4 text-emerald-500" />
          <h3 className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Business Clients Statistics</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 mx-[0px] my-[11px]">
          {/* Card 1: Average Score */}
          <div className={`p-2.5 rounded-lg border-l-4 border-purple-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{businessStats.avgScore}</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Across {businessStats.totalClients} businesses</p>
              </div>
              <Target className={`size-7 text-purple-500`} />
            </div>
          </div>

          {/* Card 2: Excellent Scores */}
          <div className={`p-2.5 rounded-lg border-l-4 border-emerald-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Excellent (761-850)</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{businessStats.excellent}</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Premium borrowers</p>
              </div>
              <Award className={`size-7 text-emerald-500`} />
            </div>
          </div>

          {/* Card 3: Good Scores */}
          <div className={`p-2.5 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Good (701-760)</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{businessStats.good}</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Low risk borrowers</p>
              </div>
              <CheckCircle className={`size-7 text-blue-500`} />
            </div>
          </div>

          {/* Card 4: Low Risk Share */}
          <div className={`p-2.5 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-gray-800/90 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Low Risk Share</p>
                <p className={`text-xl mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{businessStats.lowRiskShare}%</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Good + Excellent</p>
              </div>
              <Shield className={`size-7 text-green-500`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Individual vs Business */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 m-[0px]">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 text-sm ${
              activeTab === 'individual'
                ? 'border-blue-600 text-blue-600'
                : isDark 
                  ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Users className="size-3.5" />
            Individual Clients ({creditScores.filter(s => s.clientType === 'individual').length})
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 text-sm ${
              activeTab === 'business'
                ? 'border-blue-600 text-blue-600'
                : isDark 
                  ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Building2 className="size-3.5" />
            Business Clients ({creditScores.filter(s => s.clientType === 'business').length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className={`size-4 absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by client name, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className={`px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Risk Categories</option>
            <option value="excellent">Excellent (761-850)</option>
            <option value="good">Good (701-760)</option>
            <option value="average">Average (621-700)</option>
            <option value="poor">Poor (300-620)</option>
          </select>
        </div>
      </div>

      {/* Client Scores Table */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} sticky top-0 z-10`}>
              <tr>
                <th className={`px-3 py-2 text-left text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Client Name</th>
                <th className={`px-3 py-2 text-left text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Phone</th>
                <th className={`px-3 py-2 text-left text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Location</th>
                <th className={`px-3 py-2 text-center text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Credit Score</th>
                <th className={`px-3 py-2 text-center text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Risk Category</th>
                <th className={`px-3 py-2 text-center text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Repayment Rate</th>
                <th className={`px-3 py-2 text-center text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Active Loans</th>
                <th className={`px-3 py-2 text-right text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredScores.map((score) => (
                <tr 
                  key={score.clientId}
                  className={`${
                    isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <td className={`px-3 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-xs text-[13px]">{score.clientName}</div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{score.clientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{score.phoneNumber}</td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{score.location}</td>
                  <td className="px-3 py-2 text-center">
                    <div className={`text-lg ${getScoreColor(score.currentScore)}`}>
                      {score.currentScore}
                    </div>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-0.5">
                      <div 
                        className={`h-full ${getScoreBarColor(score.currentScore)} rounded-full`}
                        style={{ width: `${(score.currentScore / 850) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getRiskBadge(score.riskCategory)}`}>
                      {getRiskLabel(score.riskCategory)}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {score.repaymentRate.toFixed(1)}%
                  </td>
                  <td className={`px-3 py-2 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {score.activeLoans}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to client details or show modal
                        navigateToClient(score.clientId);
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-700 flex items-center gap-1 ml-auto"
                    >
                      <Eye className="size-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredScores.length === 0 && (
          <div className="text-center py-8">
            <Brain className={`size-10 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No {activeTab} clients found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Credit Scoring Parameters Modal */}
      <CreditScoringParametersModal
        isOpen={showParametersModal}
        onClose={() => setShowParametersModal(false)}
        onSave={handleSaveParameters}
        clientType={modalClientType}
        setClientType={setModalClientType}
      />
      </div>
    </div>
  );
}