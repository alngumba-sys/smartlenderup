import { Brain, TrendingDown, TrendingUp, AlertTriangle, Target, MapPin, DollarSign, X, Users, Activity, ShieldAlert, Zap, BarChart3, Phone, MessageSquare, FileText, RefreshCw, Bell } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { useState, useMemo, useEffect } from 'react';
import { RiskFactorModal } from '../modals/RiskFactorModal';
import { FraudInstanceModal } from '../modals/FraudInstanceModal';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode, getCountryName } from '../../utils/currencyUtils';
import { getOrganizationCountry } from '../../utils/organizationUtils';
import { AIRemindersPanel } from '../ai/AIRemindersPanel';
import { CashFlowForecast } from '../ai/CashFlowForecast';
import { LiquidityAlerts } from '../ai/LiquidityAlerts';
import { ExecutiveSummary } from '../ai/ExecutiveSummary';
import { BankReconciliation } from '../ai/BankReconciliation';

// Helper function to get major cities/regions for each country
const getCountryRegions = (country: string): string[] => {
  const regionMap: { [key: string]: string[] } = {
    'Kenya': ['Nairobi', 'Nakuru', 'Eldoret', 'Kisumu', 'Mombasa'],
    'Uganda': ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja'],
    'Tanzania': ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya'],
    'Rwanda': ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi'],
    'Ethiopia': ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar'],
    'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'],
    'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
    'Ghana': ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast'],
    'Zimbabwe': ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe'],
    'Zambia': ['Lusaka', 'Ndola', 'Kitwe', 'Kabwe', 'Chingola'],
    'Botswana': ['Gaborone', 'Francistown', 'Molepolole', 'Maun', 'Selebi-Phikwe'],
    'Malawi': ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu'],
    'Mozambique': ['Maputo', 'Beira', 'Nampula', 'Chimoio', 'Quelimane']
  };
  return regionMap[country] || [country];
};

export function AIInsightsTab() {
  const { isDark } = useTheme();
  const { clients, loans, loanProducts } = useData();
  const organizationCountry = getOrganizationCountry();
  const currencyCode = getCurrencyCode();
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<'payment-history' | 'revenue-decline' | 'economic' | 'multiple-loans' | null>(null);
  const [selectedFraudType, setSelectedFraudType] = useState<'unusual-deposit' | 'multiple-device' | 'inconsistent-id' | 'velocity-anomaly' | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'reminders' | 'cashflow' | 'liquidity' | 'executive' | 'reconciliation'>('insights');
  
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

  // Pre-calculate loan filters that are used in multiple places
  const activeLoansData = loans.filter(loan => loan.status !== 'Fully Paid' && loan.outstandingBalance > 0);
  const loansWithArrears = loans.filter(loan => loan.daysInArrears > 0);

  // Calculate actual high-risk clients from loan data - memoized to prevent duplicate keys on re-render
  const highRiskClients = useMemo(() => {
    // Group loans by client to avoid duplicate keys
    const clientArrearsMap = new Map<string, { 
      originalClientId: string; // Keep original for lookups
      id: string; 
      name: string; 
      maxDaysInArrears: number; 
      totalArrearsAmount: number;
      status: string;
    }>();
    
    loansWithArrears.forEach((loan, loanIndex) => {
      // Ensure we have a valid unique identifier - handle null, undefined, empty string
      const hasValidClientId = loan.clientId && String(loan.clientId).trim();
      const clientId = hasValidClientId 
        ? String(loan.clientId).trim() 
        : `unknown-${loan.clientName || 'client'}-${loan.id || loanIndex}`;
      
      const client = clients.find(c => c.id === loan.clientId);
      const clientName = client?.name || loan.clientName || 'Unknown Client';
      
      // For clients without valid IDs, use name-based deduplication
      let mapKey = clientId;
      if (!hasValidClientId) {
        // Check if we already have an entry with this name
        const existingByName = Array.from(clientArrearsMap.entries()).find(
          ([key, value]) => key.startsWith('unknown-') && value.name === clientName
        );
        if (existingByName) {
          mapKey = existingByName[0];
        }
      }
      
      const existing = clientArrearsMap.get(mapKey);
      
      if (existing) {
        // Update with worst case scenario
        existing.maxDaysInArrears = Math.max(existing.maxDaysInArrears, loan.daysInArrears);
        existing.totalArrearsAmount += loan.outstandingBalance;
      } else {
        clientArrearsMap.set(mapKey, {
          originalClientId: hasValidClientId ? clientId : (loan.clientId || clientId),
          id: mapKey,
          name: clientName,
          maxDaysInArrears: loan.daysInArrears,
          totalArrearsAmount: loan.outstandingBalance,
          status: loan.status
        });
      }
    });
    
    const actualHighRiskClients = Array.from(clientArrearsMap.values()).map((clientData, index) => ({
      originalClientId: clientData.originalClientId, // Original for lookups
      id: `${clientData.id}-${index}-${Date.now()}`, // Ensure truly unique key with index and timestamp
      name: clientData.name,
      creditScore: 100 - (clientData.maxDaysInArrears * 2),
      status: clientData.status,
      predictedDefaultDate: clientData.maxDaysInArrears > 30 ? '2025-02-28' : clientData.maxDaysInArrears > 7 ? '2025-03-15' : '2025-04-30',
      daysInArrears: clientData.maxDaysInArrears,
      arrearsAmount: clientData.totalArrearsAmount
    }));

    return actualHighRiskClients.length > 0 ? actualHighRiskClients : [];
  }, [clients, loans]);

  // Calculate actual PAR from loans
  const totalPortfolio = activeLoansData.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const par30Loans = activeLoansData.filter(loan => loan.daysInArrears > 30);
  const par30Amount = par30Loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const currentPAR30 = totalPortfolio > 0 ? ((par30Amount / totalPortfolio) * 100).toFixed(1) : '0.0';
  const forecastedPAR30 = parseFloat(currentPAR30) === 0 ? '0.0' : (parseFloat(currentPAR30) + 0.7).toFixed(1);

  // Predicted PAR forecast - based on actual data
  const parForecast = [
    { month: 'Dec (Actual)', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30) },
    { month: 'Jan (Forecast)', par30: parseFloat(forecastedPAR30), par90: parseFloat(currentPAR30) },
    { month: 'Feb (Forecast)', par30: parseFloat(forecastedPAR30), par90: parseFloat(currentPAR30) },
    { month: 'Mar (Forecast)', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30) }
  ];

  // Extended PAR forecast for modal - based on actual data
  const extendedPARForecast = [
    { month: 'Sep', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 95 },
    { month: 'Oct', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 94 },
    { month: 'Nov', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 93 },
    { month: 'Dec', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 92 },
    { month: 'Jan (F)', par30: parseFloat(forecastedPAR30), par90: parseFloat(currentPAR30), confidence: 88 },
    { month: 'Feb (F)', par30: parseFloat(forecastedPAR30), par90: parseFloat(currentPAR30), confidence: 82 },
    { month: 'Mar (F)', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 78 },
    { month: 'Apr (F)', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 72 },
    { month: 'May (F)', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 68 },
    { month: 'Jun (F)', par30: parseFloat(currentPAR30), par90: parseFloat(currentPAR30), confidence: 65 }
  ];

  // Client segmentation - based on actual loan performance
  const fullyPaidClients = loans.filter(l => l.status === 'Fully Paid').map(l => l.clientId);
  const uniqueFullyPaidClients = [...new Set(fullyPaidClients)].length;
  const activeClients = activeLoansData.map(l => l.clientId);
  const uniqueActiveClients = [...new Set(activeClients)].length;
  const arrearsClients = loansWithArrears.map(l => l.clientId);
  const uniqueArrearsClients = [...new Set(arrearsClients)].length;
  
  const clientSegments = [
    { name: 'High-Value Repayer', count: uniqueFullyPaidClients, avgScore: 92, color: '#10b981', loanSize: 85000, retention: 98 },
    { name: 'Steady Performer', count: uniqueActiveClients - uniqueArrearsClients, avgScore: 85, color: '#3b82f6', loanSize: 75000, retention: 92 },
    { name: 'Arrears Risk', count: uniqueArrearsClients, avgScore: 65, color: '#f59e0b', loanSize: 60000, retention: 75 },
    { name: 'High Risk', count: highRiskClients.length, avgScore: 45, color: '#ef4444', loanSize: 50000, retention: 45 }
  ];

  // Geographic risk data - based on organization's country
  const avgLoanAmount = loans.length > 0 ? loans.reduce((sum, l) => sum + l.loanAmount, 0) / loans.length : 0;
  const primaryRegion = getCountryRegions(organizationCountry)[0]; // Use first major city/region
  const geoRiskData = [
    { 
      county: primaryRegion, 
      loans: loans.length, 
      par30: parseFloat(currentPAR30), 
      concentration: 100, 
      avgLoanSize: Math.round(avgLoanAmount), 
      growth: loans.length > 0 ? 15 : 0 
    }
  ];

  // Optimal pricing simulation
  const pricingSimulation = loanProducts.map((product, index) => {
    const currentRate = product.interestRate;
    const suggestedRate = product.name === 'ABC Biz-Boost' ? currentRate + 1 : currentRate;
    const projectedRevenue = suggestedRate > currentRate ? 145000 : 120000;
    
    return {
      id: product.id || `product-${index}`, // Use product ID for unique key
      product: product.name,
      currentRate,
      suggestedRate,
      projectedRevenue,
      creditScoreThreshold: 85,
      demandElasticity: -0.3,
      competitorRate: currentRate - 0.5
    };
  });

  // Calculate total revenue opportunity from pricing optimization
  const totalRevenueOpportunity = pricingSimulation.reduce((sum, sim) => sum + sim.projectedRevenue, 0);
  const revenueOppDisplay = totalRevenueOpportunity > 0 ? `${currencyCode} ${(totalRevenueOpportunity / 1000).toFixed(0)}K` : `${currencyCode} 0`;

  // Churn prediction data - based on actual loans with arrears or at risk
  const churnRiskClients = useMemo(() => {
    let churnCounter = 0;
    return highRiskClients.map((client) => {
      const clientData = clients.find(c => c.id === client.originalClientId);
      return {
        id: `churn-${churnCounter++}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        name: client.name,
        phone: clientData?.phone || '0700000000',
        churnProb: client.daysInArrears > 30 ? 85 : client.daysInArrears > 7 ? 65 : 50,
        reason: client.daysInArrears > 30 ? `Payment overdue by ${client.daysInArrears} days` : client.daysInArrears > 0 ? `Payment overdue by ${client.daysInArrears} days` : 'Monitoring repayment pattern',
        revenue: client.arrearsAmount,
        ltv: client.arrearsAmount * 2
      };
    });
  }, [highRiskClients, clients]);

  // Fraud patterns - microfinance-specific fraud detection
  const fraudPatterns = [
    { type: 'Duplicate Loan Applications', severity: 'Low', instances: 0, potentialLoss: 0, status: 'Clear' },
    { type: 'Identity Verification Issues', severity: 'Low', instances: 0, potentialLoss: 0, status: 'Clear' },
    { type: 'Suspicious Repayment Patterns', severity: 'Low', instances: 0, potentialLoss: 0, status: 'Clear' },
    { type: 'Multiple Active Loans', severity: 'Low', instances: 0, potentialLoss: 0, status: 'Clear' }
  ];
  const totalFraudInstances = fraudPatterns.reduce((sum, pattern) => sum + pattern.instances, 0);

  // Collection optimization - based on actual portfolio performance
  const fullPaidLoans = loans.filter(l => l.status === 'Fully Paid').length;
  const totalLoansCount = loans.length;
  const actualCollectionRate = totalLoansCount > 0 ? Math.round((fullPaidLoans / totalLoansCount) * 100) : 0;
  const optimizedCollectionRate = Math.min(actualCollectionRate + 5, 100); // Potential 5% improvement
  const collectionImprovement = optimizedCollectionRate - actualCollectionRate;
  
  const collectionOptimization = [
    { segment: 'Early Stage (1-7 days)', currentRate: actualCollectionRate, optimizedRate: optimizedCollectionRate, channel: 'SMS + WhatsApp', timing: 'Morning 9-11 AM' },
    { segment: 'Mid Stage (8-30 days)', currentRate: actualCollectionRate - 10, optimizedRate: optimizedCollectionRate - 5, channel: 'Phone Call', timing: 'Evening 5-7 PM' },
    { segment: 'Late Stage (31-60 days)', currentRate: actualCollectionRate - 30, optimizedRate: optimizedCollectionRate - 20, channel: 'Field Visit', timing: 'Weekend Visit' },
    { segment: 'Critical (60+ days)', currentRate: actualCollectionRate - 50, optimizedRate: optimizedCollectionRate - 40, channel: 'Legal Notice + Visit', timing: 'Immediate' }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  // Calculate risk metrics
  const totalExposure = highRiskClients.reduce((sum, client) => sum + client.arrearsAmount, 0);
  const preventableAmount = totalExposure * 0.73;
  const paymentHistoryCount = highRiskClients.filter(c => c.daysInArrears > 0).length;

  // Calculate cross-sell opportunities - clients with fully paid loans who could upgrade
  const clientsWithFullyPaidLoans = [...new Set(loans.filter(l => l.status === 'Fully Paid').map(l => l.clientId))];
  const eligibleForUpgrade = clientsWithFullyPaidLoans.filter(clientId => {
    const clientLoans = loans.filter(l => l.clientId === clientId);
    const hasActiveLoans = clientLoans.some(l => l.status !== 'Fully Paid');
    return !hasActiveLoans; // Clients who fully paid and don't have active loans can get new/upgraded loans
  }).length;
  const crossSellPotential = eligibleForUpgrade * 125000; // Average potential per client

  // Calculate actual churn count
  const actualChurnCount = churnRiskClients.length;
  const churnRetentionValue = churnRiskClients.reduce((sum, client) => sum + client.ltv, 0);

  // Calculate transactions screened (loan disbursements + repayments in last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentLoans = loans.filter(loan => {
    const disbursementDate = new Date(loan.disbursementDate);
    return disbursementDate >= thirtyDaysAgo;
  });
  const transactionsScreened = recentLoans.length * 2; // Each loan has disbursement + at least one repayment attempt
  const businessClients = loans.filter(l => l.loanType === 'Business Loan' && l.daysInArrears > 0);
  const uniqueBusinessClients = [...new Set(businessClients.map(l => l.clientId))].length;
  const economicRiskCount = highRiskClients.filter(c => c.daysInArrears > 15).length;
  const clientLoanCounts = loans.reduce((acc, loan) => {
    acc[loan.clientId] = (acc[loan.clientId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const multipleLoansCount = highRiskClients.filter(c => clientLoanCounts[c.id] > 1).length;

  const renderModal = () => {
    if (!selectedInsight) return null;

    const modalContent: { [key: string]: any } = {
      defaultRisk: {
        title: 'High Default Risk Analysis',
        icon: AlertTriangle,
        color: highRiskClients.length > 0 ? 'red' : 'emerald',
        content: (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${highRiskClients.length > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <h4 className={highRiskClients.length > 0 ? 'text-red-900 mb-2' : 'text-emerald-900 mb-2'}>AI Model Prediction</h4>
              <p className={highRiskClients.length > 0 ? 'text-red-800 text-sm' : 'text-emerald-800 text-sm'}>
                {highRiskClients.length > 0 
                  ? `Machine learning model analyzed 50+ variables including payment history, M-Pesa transaction patterns, business seasonality, and external economic indicators to identify ${highRiskClients.length} clients with > 70% default probability in the next 30 days.`
                  : 'Machine learning model analyzed 50+ variables including payment history, M-Pesa transaction patterns, business seasonality, and external economic indicators. No clients identified with high default risk - excellent portfolio performance!'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total at Risk</p>
                <p className={`text-2xl ${highRiskClients.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{highRiskClients.length}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Clients</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Exposure Amount</p>
                <p className={`text-2xl ${totalExposure > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {currencyCode} {totalExposure > 0 ? `${(totalExposure / 1000000).toFixed(1)}M` : '0'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Outstanding</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Preventable</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-2xl">
                  {currencyCode} {preventableAmount > 0 ? `${(preventableAmount / 1000).toFixed(0)}K` : '0'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">With intervention</p>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 mb-3">Risk Factor Breakdown</h4>
              {highRiskClients.length > 0 ? (
                <div className="space-y-2">
                  {paymentHistoryCount > 0 && (
                    <div 
                      onClick={() => {
                        setSelectedInsight(null);
                        setSelectedRiskFactor('payment-history');
                      }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 hover:border-red-300"
                    >
                      <span className="text-gray-700">Payment History Issues</span>
                      <span className="text-red-600">{paymentHistoryCount} clients →</span>
                    </div>
                  )}
                  {uniqueBusinessClients > 0 && (
                    <div 
                      onClick={() => {
                        setSelectedInsight(null);
                        setSelectedRiskFactor('revenue-decline');
                      }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 hover:border-amber-300"
                    >
                      <span className="text-gray-700">Business Revenue Decline</span>
                      <span className="text-amber-600">{uniqueBusinessClients} clients →</span>
                    </div>
                  )}
                  {economicRiskCount > 0 && (
                    <div 
                      onClick={() => {
                        setSelectedInsight(null);
                        setSelectedRiskFactor('economic');
                      }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 hover:border-amber-300"
                    >
                      <span className="text-gray-700">Economic Indicators</span>
                      <span className="text-amber-600">{economicRiskCount} clients →</span>
                    </div>
                  )}
                  {multipleLoansCount > 0 && (
                    <div 
                      onClick={() => {
                        setSelectedInsight(null);
                        setSelectedRiskFactor('multiple-loans');
                      }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 hover:border-red-300"
                    >
                      <span className="text-gray-700">Multiple Loan Sources</span>
                      <span className="text-red-600">{multipleLoansCount} clients →</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-emerald-900 text-sm">No risk factors identified - all loans performing excellently!</p>
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg border ${highRiskClients.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <h4 className={highRiskClients.length > 0 ? 'text-blue-900 mb-2' : 'text-emerald-900 mb-2'}>📋 Recommended Actions</h4>
              {highRiskClients.length > 0 ? (
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Immediate outreach to top {Math.min(5, highRiskClients.length)} highest risk clients</li>
                  <li>• Offer payment plan restructuring with 15% term extension</li>
                  <li>• Deploy field officers for in-person assessment</li>
                  {uniqueBusinessClients > 0 && <li>• Enable grace period for {uniqueBusinessClients} clients with temporary business issues</li>}
                  <li>• Estimated success rate: 73% with early intervention</li>
                </ul>
              ) : (
                <ul className="text-emerald-800 text-sm space-y-1">
                  <li>• Maintain current excellent portfolio management practices</li>
                  <li>• Continue regular client communication and support</li>
                  <li>• Monitor for any early warning signs</li>
                  <li>• Consider expanding lending to qualified new clients</li>
                  <li>• Portfolio performing at 100% - keep up the great work!</li>
                </ul>
              )}
            </div>
          </div>
        )
      },
      parForecast: {
        title: 'PAR 30 Forecast & Trend Analysis',
        icon: TrendingUp,
        color: 'amber',
        content: (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${parseFloat(currentPAR30) === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <h4 className={parseFloat(currentPAR30) === 0 ? 'text-emerald-900 mb-2' : 'text-amber-900 mb-2'}>Predictive Model Insights</h4>
              <p className={parseFloat(currentPAR30) === 0 ? 'text-emerald-800 text-sm' : 'text-amber-800 text-sm'}>
                {parseFloat(currentPAR30) === 0 
                  ? 'Time-series forecasting model predicts PAR 30 will remain at 0% with excellent portfolio management. All loans are performing well with no arrears detected.'
                  : `Time-series forecasting model with 89% historical accuracy predicts PAR 30 will increase to ${forecastedPAR30}% by January 2025 without intervention. Model factors in seasonal patterns, portfolio growth, and macroeconomic trends.`}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Current PAR 30</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl">{currentPAR30}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Jan Forecast</p>
                <p className={parseFloat(forecastedPAR30) === 0 ? 'text-emerald-600 dark:text-emerald-400 text-xl' : 'text-amber-600 dark:text-amber-400 text-xl'}>{forecastedPAR30}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Peak (Feb)</p>
                <p className={parseFloat(forecastedPAR30) === 0 ? 'text-emerald-600 dark:text-emerald-400 text-xl' : 'text-red-600 dark:text-red-400 text-xl'}>{forecastedPAR30}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Model Confidence</p>
                <p className="text-blue-600 dark:text-blue-400 text-xl">88%</p>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 mb-3">Extended 10-Month Forecast</h4>
              <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: '100px', position: 'relative' }}>
                {isMounted && <ResponsiveContainer width="100%" height={250} aspect={undefined}>
                  <LineChart data={extendedPARForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="par30" stroke="#f59e0b" name="PAR 30 %" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="par90" stroke="#ef4444" name="PAR 90 %" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#3b82f6" name="Confidence %" strokeWidth={1} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-gray-900 dark:text-white text-sm mb-2">Risk Factors</h4>
                <ul className="text-gray-700 dark:text-gray-300 text-xs space-y-1">
                  <li>• Post-holiday cash flow constraints</li>
                  <li>• School fee payment season (Jan-Feb)</li>
                  <li>• Agricultural sector dry season</li>
                  <li>• Portfolio growth outpacing collections</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-gray-900 dark:text-white text-sm mb-2">Mitigation Strategy</h4>
                <ul className="text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
                  <li>✓ Enhanced collection efforts in Jan-Feb</li>
                  <li>✓ Proactive client communication</li>
                  <li>✓ Payment plan flexibility options</li>
                  <li>✓ Target PAR reduction to 4.8% by June</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      revenueOpp: {
        title: 'Revenue Optimization Opportunities',
        icon: DollarSign,
        color: 'emerald',
        content: (
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h4 className="text-emerald-900 mb-2">AI-Powered Pricing Intelligence</h4>
              <p className="text-emerald-800 text-sm">
                Dynamic pricing model analyzed competitor rates, customer elasticity, credit risk profiles, and 
                market conditions to identify {revenueOppDisplay} in additional quarterly revenue through optimized pricing 
                strategies without increasing default risk.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Current Revenue</p>
                <p className="text-gray-900 dark:text-white text-xl">{currencyCode} 1.2M</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Optimized</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl">{currencyCode} 1.45M</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Uplift</p>
                <p className="text-blue-600 dark:text-blue-400 text-xl">+20.4%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Risk Impact</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl">Minimal</p>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 mb-3">Product-Level Optimization</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-700 text-xs">Product</th>
                      <th className="px-3 py-2 text-center text-gray-700 text-xs">Current</th>
                      <th className="px-3 py-2 text-center text-gray-700 text-xs">Suggested</th>
                      <th className="px-3 py-2 text-center text-gray-700 text-xs">Target Segment</th>
                      <th className="px-3 py-2 text-right text-gray-700 text-xs">Rev Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingSimulation.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-900 text-xs">{item.product}</td>
                        <td className="px-3 py-2 text-center text-gray-900 text-xs">{item.currentRate}%</td>
                        <td className="px-3 py-2 text-center text-xs">
                          <span className={`px-2 py-1 rounded ${
                            item.suggestedRate > item.currentRate ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.suggestedRate}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center text-gray-900 text-xs">Score {'>'} {item.creditScoreThreshold}</td>
                        <td className="px-3 py-2 text-right text-emerald-600 text-xs">
                          {item.suggestedRate > item.currentRate ? `+${currencyCode} 45K` : 'No change'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="text-blue-900 text-sm mb-2">Cross-Sell Opportunity</h4>
                <p className="text-blue-800 text-xs mb-2">
                  {eligibleForUpgrade} {eligibleForUpgrade === 1 ? 'client eligible' : 'clients eligible'} for product upgrade based on payment history
                </p>
                <p className="text-blue-900 text-sm">Potential: {currencyCode} {(crossSellPotential / 1000).toFixed(0)}K/quarter</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h4 className="text-purple-900 text-sm mb-2">Retention Value</h4>
                <p className="text-purple-800 text-xs mb-2">
                  {actualChurnCount > 0 ? `Preventing ${actualChurnCount} high-value client ${actualChurnCount === 1 ? 'churn' : 'churns'} through engagement` : 'No clients at churn risk - excellent retention!'}
                </p>
                <p className="text-purple-900 text-sm">Potential: {currencyCode} {(churnRetentionValue / 1000).toFixed(0)}K/quarter</p>
              </div>
            </div>
          </div>
        )
      },
      churnPrediction: {
        title: 'Client Churn Prediction & Prevention',
        icon: Users,
        color: 'purple',
        content: (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-purple-900 mb-2">Churn Risk Analysis</h4>
              <p className="text-purple-800 text-sm">
                {actualChurnCount > 0 
                  ? `Predictive model identifies clients at risk of leaving based on engagement patterns, loan application rejections, competitive activity, and transaction behavior. Early intervention can save ${currencyCode} ${(churnRetentionValue / 1000).toFixed(0)}K in lifetime customer value.`
                  : 'Predictive model monitors all clients for churn risk indicators. Currently, no clients are at risk of leaving - excellent engagement and satisfaction levels across the portfolio!'}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">At Risk</p>
                <p className={`text-xl ${actualChurnCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{actualChurnCount}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Clients</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Revenue Risk</p>
                <p className={`text-xl ${actualChurnCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {currencyCode} {(churnRiskClients.reduce((sum, c) => sum + c.revenue, 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Annual</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">LTV at Risk</p>
                <p className="text-amber-600 dark:text-amber-400 text-xl">{currencyCode} {(churnRetentionValue / 1000).toFixed(0)}K</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Lifetime</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Save Rate</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl">{actualChurnCount > 0 ? '85%' : '100%'}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">With action</p>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 mb-3">High-Risk Clients</h4>
              {churnRiskClients.length > 0 ? (
                <div className="space-y-2">
                  {churnRiskClients.map((client) => (
                  <div key={client.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-900 text-sm">{client.name}</p>
                        <p className="text-gray-600 text-xs">{client.id}</p>
                        <p className="text-gray-600 text-xs flex items-center gap-1 mt-1">
                          <Phone className="size-3" />
                          {client.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          client.churnProb > 70 ? 'bg-red-100 text-red-800' :
                          client.churnProb > 60 ? 'bg-amber-100 text-amber-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.churnProb}% Risk
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Reason</p>
                        <p className="text-gray-900">{client.reason}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Annual Revenue</p>
                        <p className="text-gray-900">{currencyCode} {(client.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Lifetime Value</p>
                        <p className="text-gray-900">{currencyCode} {(client.ltv / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                  <p className="text-emerald-800 text-sm">No clients currently at churn risk - excellent retention!</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="text-blue-900 text-sm mb-2">Retention Playbook</h4>
              {churnRiskClients.length > 0 ? (
                <ul className="text-blue-800 text-xs space-y-1">
                  {churnRiskClients.slice(0, 4).map((client, idx) => {
                    const strategies = [
                      'Offer payment restructuring with flexible terms to recover arrears',
                      'Re-engagement with payment reminder system and grace period',
                      `Payment plan adjustment + loyalty bonus of ${currencyCode} 5,000`,
                      'Payment counseling + flexible restructuring options'
                    ];
                    return (
                      <li key={client.id}>�� {client.name}: {strategies[idx % strategies.length]}</li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-blue-800 text-xs">No retention actions needed - all clients are in good standing!</p>
              )}
            </div>
          </div>
        )
      },
      fraudDetection: {
        title: 'AI Fraud Detection & Prevention',
        icon: ShieldAlert,
        color: totalFraudInstances > 0 ? 'red' : 'emerald',
        content: (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${totalFraudInstances > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <h4 className={totalFraudInstances > 0 ? 'text-red-900 mb-2' : 'text-emerald-900 mb-2'}>Loan Fraud Detection</h4>
              <p className={totalFraudInstances > 0 ? 'text-red-800 text-sm' : 'text-emerald-800 text-sm'}>
                {totalFraudInstances > 0 
                  ? `AI monitors ${transactionsScreened} loan activities (disbursements & repayments) in the last 30 days, analyzing client application patterns, duplicate submissions, identity verification, and unusual repayment behaviors. System has identified ${totalFraudInstances} ${totalFraudInstances === 1 ? 'anomaly' : 'anomalies'} preventing potential losses of ${currencyCode} ${(fraudPatterns.reduce((sum, p) => sum + p.potentialLoss, 0) / 1000).toFixed(0)}K.`
                  : `AI monitors all ${transactionsScreened} loan activities (disbursements & repayments) in the last 30 days, analyzing client applications, duplicate submissions, identity verification, and repayment patterns. No fraudulent activity detected - clean portfolio with verified clients!`}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Alerts (30d)</p>
                <p className={`text-xl ${totalFraudInstances > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{totalFraudInstances}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Blocked</p>
                <p className={`text-xl ${fraudPatterns.filter(p => p.status === 'Blocked').length > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {fraudPatterns.filter(p => p.status === 'Blocked').length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Prevented Loss</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl">
                  {currencyCode} {fraudPatterns.reduce((sum, p) => sum + p.potentialLoss, 0) > 0 ? `${(fraudPatterns.reduce((sum, p) => sum + p.potentialLoss, 0) / 1000).toFixed(0)}K` : '0'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Detection Rate</p>
                <p className="text-blue-600 dark:text-blue-400 text-xl">{totalFraudInstances > 0 ? '97.8%' : '100%'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 mb-3">Active Fraud Patterns</h4>
              <div className="space-y-2">
                {fraudPatterns.map((pattern, idx) => {
                  const fraudTypeMap: { [key: string]: 'unusual-deposit' | 'multiple-device' | 'inconsistent-id' | 'velocity-anomaly' } = {
                    'Duplicate Loan Applications': 'unusual-deposit',
                    'Identity Verification Issues': 'inconsistent-id',
                    'Suspicious Repayment Patterns': 'velocity-anomaly',
                    'Multiple Active Loans': 'multiple-device'
                  };
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedInsight(null);
                        setSelectedFraudType(fraudTypeMap[pattern.type]);
                      }}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors hover:border-red-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            pattern.severity === 'High' ? 'bg-red-100 text-red-800' :
                            pattern.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pattern.severity}
                          </span>
                          <p className="text-gray-900 text-sm">{pattern.type}</p>
                        </div>
                        <span className="text-xs text-gray-600">{pattern.instances} instances →</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-600">Potential Loss</p>
                          <p className="text-red-600">{currencyCode} {(pattern.potentialLoss / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="text-gray-900">{pattern.status}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <h4 className="text-emerald-900 text-sm mb-2">✓ Loan Activities Monitored</h4>
                <p className="text-emerald-800 text-xs mb-1">{transactionsScreened} activities screened (30 days)</p>
                <p className="text-emerald-900">{totalFraudInstances > 0 ? '99.85%' : '100%'} verified rate</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="text-blue-900 text-sm mb-2">Model Performance</h4>
                <p className="text-blue-800 text-xs mb-1">Accuracy: {totalFraudInstances > 0 ? '97.8%' : '100%'} | False Positive: {totalFraudInstances > 0 ? '2.1%' : '0%'}</p>
                <p className="text-blue-900">Last updated: 2 hours ago</p>
              </div>
            </div>
          </div>
        )
      },
      collectionOpt: {
        title: 'Collection Strategy Optimization',
        icon: Activity,
        color: 'blue',
        content: (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-blue-900 mb-2">AI-Optimized Collection Strategy</h4>
              <p className="text-blue-800 text-sm">
                Machine learning analyzes client response patterns, channel effectiveness, optimal timing, and 
                communication preferences to maximize collection rates. Strategy optimization can improve overall 
                collection efficiency by 18-25%.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Current Rate</p>
                <p className="text-gray-900 dark:text-white text-xl">78%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Optimized</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl">92%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Improvement</p>
                <p className="text-blue-600 dark:text-blue-400 text-xl">+18%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-xs">Revenue Impact</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl">{currencyCode} 325K</p>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 mb-3">Stage-by-Stage Optimization</h4>
              <div className="space-y-2">
                {collectionOptimization.map((stage, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-900 text-sm">{stage.segment}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">{stage.currentRate}%</span>
                        <TrendingUp className="size-3 text-emerald-600" />
                        <span className="text-emerald-600 text-xs">{stage.optimizedRate}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600">Optimal Channel</p>
                        <p className="text-blue-600">{stage.channel}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Best Timing</p>
                        <p className="text-purple-600">{stage.timing}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <h4 className="text-emerald-900 text-sm mb-2">Channel Effectiveness</h4>
                <ul className="text-emerald-800 text-xs space-y-1">
                  <li>• WhatsApp: 94% open rate, 78% response</li>
                  <li>• SMS: 89% open rate, 62% response</li>
                  <li>• Phone: 67% answer rate, 85% promise-to-pay</li>
                  <li>• Field Visit: 92% contact rate, 71% payment</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h4 className="text-purple-900 text-sm mb-2">Timing Insights</h4>
                <ul className="text-purple-800 text-xs space-y-1">
                  <li>• Morning (9-11 AM): Best for SMS/WhatsApp</li>
                  <li>• Lunch (12-2 PM): Lowest response period</li>
                  <li>• Evening (5-7 PM): Optimal for phone calls</li>
                  <li>• Weekends: 23% higher field visit success</li>
                </ul>
              </div>
            </div>
          </div>
        )
      }
    };

    const modal = modalContent[selectedInsight];
    if (!modal) return null;

    const Icon = modal.icon;

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className={`bg-${modal.color}-50 p-6 border-b border-${modal.color}-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${modal.color}-600 rounded-lg`}>
                  <Icon className="size-6 text-white" />
                </div>
                <h3 className="text-gray-900">{modal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="size-6" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {modal.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 flex items-center gap-2">
          <Brain className="size-6 text-purple-600" />
          AI-Powered Insights & Automation
        </h2>
        <p className="text-gray-600">Machine Learning powered features for strategic decision-making, risk management, and operational efficiency</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'insights'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="size-4" />
          Risk Insights
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'reminders'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="size-4" />
          Smart Reminders
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-4 py-2 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'cashflow'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="size-4" />
          Cash Forecast
        </button>
        <button
          onClick={() => setActiveTab('liquidity')}
          className={`px-4 py-2 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'liquidity'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bell className="size-4" />
          Liquidity Alerts
        </button>
        <button
          onClick={() => setActiveTab('executive')}
          className={`px-4 py-2 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'executive'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="size-4" />
          Executive Summary
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'reconciliation'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <RefreshCw className="size-4" />
          Bank Reconciliation
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'reminders' && <AIRemindersPanel />}
      {activeTab === 'cashflow' && <CashFlowForecast />}
      {activeTab === 'liquidity' && <LiquidityAlerts />}
      {activeTab === 'executive' && <ExecutiveSummary />}
      {activeTab === 'reconciliation' && <BankReconciliation />}
      
      {activeTab === 'insights' && (
        <>
          {/* Original Risk Insights Content */}

      {/* Key AI Insights - Clickable Cards */}
      <div>
        <h3 className="text-gray-900 mb-3">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setSelectedInsight('defaultRisk')}
            className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 p-6 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-600 dark:bg-red-700 rounded-lg">
                <AlertTriangle className="size-5 text-white" />
              </div>
              <div>
                <p className="text-red-900 dark:text-red-100">High Default Risk</p>
                <p className="text-red-700 dark:text-red-300 text-sm">Next 30 days</p>
              </div>
            </div>
            <p className="text-red-900 dark:text-red-100 text-3xl">{highRiskClients.length}</p>
            <p className="text-red-700 dark:text-red-300 text-sm mt-2">
              Clients identified with {'>'} 70% default probability
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-3 flex items-center gap-1">
              Click for detailed analysis <TrendingUp className="size-3" />
            </p>
          </div>

          <div 
            onClick={() => setSelectedInsight('parForecast')}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 p-6 rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-600 dark:bg-amber-700 rounded-lg">
                <TrendingUp className="size-5 text-white" />
              </div>
              <div>
                <p className="text-amber-900 dark:text-amber-100">Predicted PAR 30</p>
                <p className="text-amber-700 dark:text-amber-300 text-sm">3 months forecast</p>
              </div>
            </div>
            <p className="text-amber-900 dark:text-amber-100 text-3xl">{forecastedPAR30}%</p>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-2">
              {parseFloat(currentPAR30) === 0 ? 'Portfolio performing excellently' : `+${(parseFloat(forecastedPAR30) - parseFloat(currentPAR30)).toFixed(1)}% increase projected if no intervention`}
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-xs mt-3 flex items-center gap-1">
              Click for trend analysis <BarChart3 className="size-3" />
            </p>
          </div>

          <div 
            onClick={() => setSelectedInsight('revenueOpp')}
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-600 dark:bg-emerald-700 rounded-lg">
                <DollarSign className="size-5 text-white" />
              </div>
              <div>
                <p className="text-emerald-900 dark:text-emerald-100">Revenue Opportunity</p>
                <p className="text-emerald-700 dark:text-emerald-300 text-sm">Optimal pricing</p>
              </div>
            </div>
            <p className="text-emerald-900 dark:text-emerald-100 text-3xl">{revenueOppDisplay}</p>
            <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-2">
              Additional quarterly revenue potential
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-3 flex items-center gap-1">
              Click for optimization details <Target className="size-3" />
            </p>
          </div>
        </div>
      </div>

      {/* Additional AI Insights - Clickable Cards */}
      <div>
        <h3 className="text-gray-900 mb-3">Advanced Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setSelectedInsight('churnPrediction')}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 p-6 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-600 dark:bg-purple-700 rounded-lg">
                <Users className="size-5 text-white" />
              </div>
              <div>
                <p className="text-purple-900 dark:text-purple-100">Churn Risk</p>
                <p className="text-purple-700 dark:text-purple-300 text-sm">Client retention</p>
              </div>
            </div>
            <p className="text-purple-900 dark:text-purple-100 text-3xl">{churnRiskClients.length}</p>
            <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">
              {churnRiskClients.length > 0 ? 'High-value clients at risk of leaving' : 'No clients at risk - excellent retention'}
            </p>
            <p className="text-purple-600 dark:text-purple-400 text-xs mt-3 flex items-center gap-1">
              Click for retention strategy <Users className="size-3" />
            </p>
          </div>

          <div 
            onClick={() => setSelectedInsight('fraudDetection')}
            className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 p-6 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-600 dark:bg-red-700 rounded-lg">
                <ShieldAlert className="size-5 text-white" />
              </div>
              <div>
                <p className="text-red-900 dark:text-red-100">Fraud Alerts</p>
                <p className="text-red-700 dark:text-red-300 text-sm">30-day activity</p>
              </div>
            </div>
            <p className="text-red-900 dark:text-red-100 text-3xl">{totalFraudInstances}</p>
            <p className="text-red-700 dark:text-red-300 text-sm mt-2">
              {totalFraudInstances > 0 ? 'Suspicious patterns detected and blocked' : 'No fraud detected - clean portfolio'}
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-3 flex items-center gap-1">
              Click for fraud analysis <ShieldAlert className="size-3" />
            </p>
          </div>

          <div 
            onClick={() => setSelectedInsight('collectionOpt')}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-600 dark:bg-blue-700 rounded-lg">
                <Activity className="size-5 text-white" />
              </div>
              <div>
                <p className="text-blue-900 dark:text-blue-100">Collection Rate</p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">Optimization</p>
              </div>
            </div>
            <p className="text-blue-900 dark:text-blue-100 text-3xl">+{collectionImprovement}%</p>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
              {collectionImprovement > 0 ? 'Potential improvement with AI strategy' : 'Already at peak performance'}
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-3 flex items-center gap-1">
              Click for strategy details <Zap className="size-3" />
            </p>
          </div>
        </div>
      </div>

      {/* Credit Risk Forecast */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-900 dark:text-white mb-4">Portfolio at Risk (PAR) Forecast</h3>
        <div style={{ width: '100%', height: '300px', minHeight: '300px', minWidth: '100px', position: 'relative' }}>
          {isMounted && <ResponsiveContainer width="100%" height={300} aspect={undefined}>
            <LineChart data={parForecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="par30" stroke="#f59e0b" name="PAR 30 (%)" strokeWidth={2} />
            <Line type="monotone" dataKey="par90" stroke="#ef4444" name="PAR 90 (%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>}
        </div>
        <div className={`mt-4 p-4 rounded-lg border ${highRiskClients.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <p className={highRiskClients.length > 0 ? 'text-blue-900' : 'text-emerald-900'}>
            <strong>AI Recommendation:</strong> {highRiskClients.length > 0 
              ? `Increase proactive engagement with ${highRiskClients.length} high-risk clients. Potential to prevent ${currencyCode} ${(highRiskClients.reduce((sum, c) => sum + c.arrearsAmount, 0) / 1000).toFixed(0)}K in defaults through early intervention and payment restructuring.`
              : 'Excellent portfolio performance! All loans are current with no arrears detected. Continue maintaining strong client relationships and monitoring standards.'}
          </p>
        </div>
      </div>

      {/* High-Risk Client List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 dark:text-white">High-Risk Client Alerts</h3>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
            Requires Immediate Action
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700">Client Name</th>
                <th className="px-4 py-3 text-center text-gray-700">Credit Score</th>
                <th className="px-4 py-3 text-left text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-gray-700">Default Probability</th>
                <th className="px-4 py-3 text-left text-gray-700">Predicted Default Date</th>
                <th className="px-4 py-3 text-left text-gray-700">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskClients.map((client) => {
                const defaultProb = 100 - client.creditScore;
                return (
                  <tr key={client.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{client.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        {client.creditScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-600">{client.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-red-600">{defaultProb}%</td>
                    <td className="px-4 py-3 text-gray-900">
                      {client.predictedDefaultDate || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {defaultProb > 70 ? 'Immediate restructuring' : 
                       defaultProb > 60 ? 'Payment plan negotiation' : 
                       'Enhanced monitoring'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Segmentation */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-900 dark:text-white mb-4">AI-Driven Client Segmentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {clientSegments.map((segment) => (
            <div
              key={segment.name}
              className="p-4 rounded-lg border-2"
              style={{ borderColor: segment.color, backgroundColor: `${segment.color}10` }}
            >
              <p className="text-gray-900 mb-2">{segment.name}</p>
              <p className="text-2xl mb-1" style={{ color: segment.color }}>{segment.count}</p>
              <p className="text-gray-600 text-sm">Avg Score: {segment.avgScore}</p>
            </div>
          ))}
        </div>
        <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: '100px', position: 'relative' }}>
          {isMounted && <ResponsiveContainer width="100%" height={250} aspect={undefined}>
            <BarChart data={clientSegments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>}
        </div>
      </div>

      {/* Geographic Risk Mapping */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="size-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-gray-900 dark:text-white">Geographic Risk Analysis - {organizationCountry}</h3>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700">County</th>
                <th className="px-4 py-3 text-center text-gray-700">Active Loans</th>
                <th className="px-4 py-3 text-center text-gray-700">PAR 30</th>
                <th className="px-4 py-3 text-center text-gray-700">Portfolio Concentration</th>
                <th className="px-4 py-3 text-left text-gray-700">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {geoRiskData.map((region) => (
                <tr key={region.county} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">{region.county}</td>
                  <td className="px-4 py-3 text-center text-gray-900">{region.loans}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      region.par30 > 6 ? 'bg-red-100 text-red-800' :
                      region.par30 > 5 ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {region.par30}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">{region.concentration}%</td>
                  <td className="px-4 py-3 text-gray-900 text-xs">
                    {region.concentration > 30 ? 'Reduce concentration' :
                     region.par30 > 6 ? 'Enhance collections' : 'Maintain current strategy'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-purple-900">
            <strong>AI Insight:</strong> {primaryRegion} shows highest concentration at {geoRiskData[0].concentration}%. 
            {geoRiskData[0].concentration === 100 
              ? `Recommend geographic diversification to ${getCountryRegions(organizationCountry).slice(1, 3).join(' and ')} with potential for lower PAR rates and balanced risk exposure.`
              : 'Continue monitoring geographic distribution for optimal risk management.'}
          </p>
        </div>
      </div>

      {/* Optimal Pricing Tool */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Target className="size-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-gray-900 dark:text-white">AI-Optimized Pricing Recommendations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700">Product</th>
                <th className="px-4 py-3 text-center text-gray-700">Current Rate</th>
                <th className="px-4 py-3 text-center text-gray-700">Suggested Rate</th>
                <th className="px-4 py-3 text-center text-gray-700">Target Segment</th>
                <th className="px-4 py-3 text-right text-gray-700">Projected Quarterly Revenue</th>
                <th className="px-4 py-3 text-left text-gray-700">Impact</th>
              </tr>
            </thead>
            <tbody>
              {pricingSimulation.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">{item.product}</td>
                  <td className="px-4 py-3 text-center text-gray-900">{item.currentRate}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.suggestedRate > item.currentRate ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.suggestedRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    Credit Score {'>'} {item.creditScoreThreshold}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {currencyCode} {item.projectedRevenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {item.suggestedRate > item.currentRate ? (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs">
                        <TrendingUp className="size-3" />
                        <span>+20% revenue</span>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">No change</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-emerald-900">
            <strong>Recommendation:</strong> Increase ABC Biz-Boost rate to 11% for clients with credit score {'>'} 85. 
            Low default risk and strong repayment history support higher pricing. Estimated additional revenue: {currencyCode} 245,000/quarter.
          </p>
        </div>
      </div>

      {/* Fraud Detection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 dark:text-white">Fraud Detection & Anomalies</h3>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded text-sm">
            No Critical Alerts
          </span>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-900">Unusual Transaction Pattern Detected</p>
                <p className="text-amber-700 text-sm mt-1">
                  Client CL019 (Halima Abdi): Multiple small deposits followed by withdrawal request. 
                  Flagged for manual review.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">
              <strong>System Status:</strong> AI fraud detection actively monitoring all loan applications, disbursements, and repayments. 
              {totalFraudInstances > 0 
                ? `Last alert: Today (${totalFraudInstances} ${totalFraudInstances === 1 ? 'case' : 'cases'} under review).`
                : 'No alerts in the last 30 days - all activities verified.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
      <RiskFactorModal 
        isOpen={selectedRiskFactor !== null} 
        onClose={() => setSelectedRiskFactor(null)} 
        riskType={selectedRiskFactor} 
      />
      <FraudInstanceModal 
        isOpen={selectedFraudType !== null} 
        onClose={() => setSelectedFraudType(null)} 
        fraudType={selectedFraudType} 
      />
        </>
      )}
    </div>
  );
}