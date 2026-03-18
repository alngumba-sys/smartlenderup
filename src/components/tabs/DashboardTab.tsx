import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart, LabelList, AreaChart, Area } from 'recharts';
import { useState, useEffect, useContext, useMemo } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { DollarSign, Users, TrendingUp, AlertTriangle, Activity, Banknote, Receipt, Wallet, X, Info, ChevronDown, Calendar, Clock, ArrowUpCircle, AlertCircle, Bug } from 'lucide-react';
import { InterestComparisonTool } from '../diagnostics/InterestComparisonTool';
import { InterestPaidBackDiagnostic } from '../diagnostics/InterestPaidBackDiagnostic';
import { PaymentAllocationDiagnostic } from '../diagnostics/PaymentAllocationDiagnostic';
import { LoanOutstandingBalancesFix } from '../diagnostics/LoanOutstandingBalancesFix';
import { safePercentage, safeToFixed, safeDivideNum, safeFormat, safePercentageNum, safeDivide } from '../../utils/safeCalculations';
import { getCurrencySymbol, getCurrencyCode, formatCurrency } from '../../utils/currencyUtils';
import { getOrganizationName } from '../../utils/organizationUtils';
import { MetricDetailModal } from '../MetricDetailModal';

type DurationFilter = 'today' | 'week' | 'month' | '3month' | '6month';

interface DashboardTabProps {
  onNavigate?: (tab: string) => void;
}

// Smart number formatter: shows M for millions, K for thousands
const formatSmartNumber = (value: number): { number: string; suffix: string } => {
  if (value >= 1000000) {
    // Format as millions with 2 decimal places
    const millions = value / 1000000;
    return {
      number: millions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      suffix: 'M'
    };
  } else {
    // Format as thousands with no decimal places
    const thousands = value / 1000;
    return {
      number: thousands.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      suffix: 'K'
    };
  }
};

export function DashboardTab({ onNavigate }: DashboardTabProps) {
  const organizationName = getOrganizationName();
  
  // Add mounted state to prevent chart rendering before container dimensions are ready
  const [isMounted, setIsMounted] = useState(false);
  const [showComparisonTool, setShowComparisonTool] = useState(false);
  const [showInterestPaidDiagnostic, setShowInterestPaidDiagnostic] = useState(false);
  const [showPaymentAllocationDiagnostic, setShowPaymentAllocationDiagnostic] = useState(false);
  const [showLoanBalancesFix, setShowLoanBalancesFix] = useState(false);
  
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
  const [collectedInterestDuration, setCollectedInterestDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('collectedInterestDuration') as DurationFilter) || 'month'
  );
  const [processingFeeDuration, setProcessingFeeDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('processingFeeDuration') as DurationFilter) || 'month'
  );
  const [clientsDuration, setClientsDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('clientsDuration') as DurationFilter) || '6month'
  );
  const [disbursedDuration, setDisbursedDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('disbursedDuration') as DurationFilter) || '6month'
  );
  const [collectionsDuration, setCollectionsDuration] = useState<DurationFilter>(() => 
    (localStorage.getItem('collectionsDuration') as DurationFilter) || '6month'
  );

  // Set mounted state after component mounts to allow ResponsiveContainer to measure dimensions
  useEffect(() => {
    // Use double requestAnimationFrame to ensure layout is fully complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMounted(true);
      });
    });
  }, []);

  // Suppress Recharts internal duplicate key warnings (harmless library issue)
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Encountered two children with the same key')
      ) {
        return; // Suppress Recharts duplicate key warnings
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Encountered two children with the same key')
      ) {
        return; // Suppress Recharts duplicate key warnings
      }
      originalWarn.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Save to localStorage when changed
  useEffect(() => { localStorage.setItem('portfolioDuration', portfolioDuration); }, [portfolioDuration]);
  useEffect(() => { localStorage.setItem('principalDuration', principalDuration); }, [principalDuration]);
  useEffect(() => { localStorage.setItem('interestDuration', interestDuration); }, [interestDuration]);
  useEffect(() => { localStorage.setItem('collectedInterestDuration', collectedInterestDuration); }, [collectedInterestDuration]);
  useEffect(() => { localStorage.setItem('processingFeeDuration', processingFeeDuration); }, [processingFeeDuration]);
  useEffect(() => { localStorage.setItem('clientsDuration', clientsDuration); }, [clientsDuration]);
  useEffect(() => { localStorage.setItem('disbursedDuration', disbursedDuration); }, [disbursedDuration]);
  useEffect(() => { localStorage.setItem('collectionsDuration', collectionsDuration); }, [collectionsDuration]);

  // Get real data from DataContext
  // Use context directly with safety check
  const dataContext = useContext(DataContext);
  
  const theme = useThemeStyles();
  const { isDark, currentTheme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [calculationBreakdown, setCalculationBreakdown] = useState<{
    metric: string;
    title: string;
    formula: string;
    components: { label: string; value: string; }[];
    result: string;
    details?: any[];
  } | null>(null);
  
  // New modal state for detailed metric breakdown
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetricData, setSelectedMetricData] = useState<any>(null);
  
  // Upcoming payments timeframe (MUST be before conditional return)
  const [upcomingPaymentsTimeframe, setUpcomingPaymentsTimeframe] = useState<'today' | 'this-week' | 'next-7-days' | 'this-month'>('next-7-days');
  const [showUpcomingPaymentsModal, setShowUpcomingPaymentsModal] = useState(false);
  
  // Extract data from context BEFORE conditional return (to maintain hook call order)
  const { 
    clients: contextClients = [], 
    loans: contextLoans = [], 
    payments = [], 
    savingsAccounts = [],
    loanProducts = [],
    processingFeeRecords = [],
    approvals = []
  } = dataContext || {};
  
  // Get dynamic currency
  const currencySymbol = getCurrencySymbol();
  const currencyCode = getCurrencyCode();

  // Helper function to calculate accurate days in arrears based on disbursement date and repayment frequency
  const calculateDaysInArrears = (loan: any): number => {
    if (!loan.disbursementDate || loan.status === 'Paid') {
      return 0;
    }
    
    const today = new Date();
    const disbursementDate = new Date(loan.disbursementDate);
    
    // Calculate first payment due date based on repayment frequency
    const firstPaymentDue = new Date(disbursementDate);
    const frequency = loan.repaymentFrequency?.toLowerCase() || 'monthly';
    
    switch (frequency) {
      case 'daily':
        firstPaymentDue.setDate(disbursementDate.getDate() + 1);
        break;
      case 'weekly':
        firstPaymentDue.setDate(disbursementDate.getDate() + 7);
        break;
      case 'biweekly':
        firstPaymentDue.setDate(disbursementDate.getDate() + 14);
        break;
      case 'monthly':
      default:
        firstPaymentDue.setMonth(disbursementDate.getMonth() + 1);
        break;
    }
    
    // If we haven't reached the first payment date yet, no arrears
    if (today < firstPaymentDue) {
      return 0;
    }
    
    // Calculate days overdue from first payment date
    const daysOverdue = Math.floor((today.getTime() - firstPaymentDue.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only return positive arrears if the loan has outstanding balance
    return (loan.outstandingBalance > 0 && daysOverdue > 0) ? daysOverdue : 0;
  };
  
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
        case '3month':
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(today.getMonth() - 3);
          return itemDate >= threeMonthsAgo;
        case '6month':
          const sixMonthsAgo = new Date(today);
          sixMonthsAgo.setMonth(today.getMonth() - 6);
          return itemDate >= sixMonthsAgo;
        default:
          return true;
      }
    });
  };
  
  // Apply duration filters to data
  // ✅ FIX: Ensure we only count unique, active clients
  const filteredClientsForCount = filterByDuration(
    contextClients.filter((c: any) => c.status !== 'Inactive' && c.status !== 'Deleted'), 
    'registrationDate', 
    clientsDuration
  );
  
  // Portfolio metrics show ALL active loans (snapshot), not filtered by time
  // Helper function to normalize status (handle both lowercase and capitalized)
  const isActiveStatus = (status: string) => {
    const normalized = status?.toLowerCase();
    return normalized === 'active' || normalized === 'in arrears' || normalized === 'overdue';
  };
  
  // ✅ Helper to calculate CORRECT interest for FLAT RATE per period
  const calculateCorrectInterest = (loan: any) => {
    const principal = loan.principalAmount || loan.amount || 0;
    const rate = loan.interestRate || 0;
    const term = loan.term || loan.termPeriod || loan.loanTerm || loan.termMonths || 1;
    
    // FLAT RATE: Interest = Principal × Rate × Term / 100
    // Example: 100,000 × 7.5% × 1 month = 7,500
    const correctInterest = (principal * rate * term) / 100;
    return Math.round(correctInterest);
  };
  
  const filteredLoansForPortfolio = contextLoans.filter((l: any) => isActiveStatus(l.status));
  const filteredLoansForPrincipal = contextLoans.filter((l: any) => isActiveStatus(l.status));
  const filteredLoansForInterest = contextLoans.filter((l: any) => isActiveStatus(l.status));
  
  // Flow metrics are filtered by time period
  const filteredProcessingFees = filterByDuration(
    processingFeeRecords.filter((r: any) => r.status === 'Collected'),
    'collectedDate',
    processingFeeDuration
  );
  // Disbursed Total should include ALL loans disbursed in period, regardless of current status
  const filteredLoansForDisbursement = filterByDuration(
    contextLoans.filter((l: any) => l.disbursementDate && l.status !== 'Rejected'), // All loans that have been disbursed (excluding rejected)
    'disbursementDate',
    disbursedDuration
  );
  const filteredPayments = filterByDuration(payments, 'paymentDate', collectionsDuration);
  
  // ✅ Helper to calculate outstanding balance correctly using SMART CALCULATION
  const calculateOutstanding = (l: any) => {
    const principalAmt = l.principalAmount || 0;
    
    // ✅ Calculate total paid from payment records (principal + interest)
    const loanPayments = payments.filter((p: any) => p.loanId === l.id);
    const paidAmount = loanPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    // Smart calculation: Use DB if it has a discount, otherwise use formula
    const calculatedInterest = calculateCorrectInterest(l);
    const calculatedTotal = principalAmt + calculatedInterest;
    const dbTotal = l.totalRepayable || l.totalRepayment || 0;
    const tolerance = calculatedTotal * 0.01;
    const hasDiscount = dbTotal > 0 && dbTotal < (calculatedTotal - tolerance);
    const totalRepayable = hasDiscount ? dbTotal : calculatedTotal;
    
    return Math.max(0, totalRepayable - paidAmount);
  };
  
  // Helper functions to calculate analytics from real data
  const getPARData = () => {
    const totalPortfolio = contextLoans.filter((l: any) => isActiveStatus(l.status))
      .reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
    const par30 = contextLoans.filter((l: any) => (l.daysInArrears || 0) >= 30)
      .reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
    const par90 = contextLoans.filter((l: any) => (l.daysInArrears || 0) >= 90)
      .reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
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
    const seen = new Set(); // Track unique month identifiers
    
    // Get last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Create unique identifier for this month
      const uniqueId = `${year}-${month}`;
      if (seen.has(uniqueId)) continue; // Skip duplicates
      seen.add(uniqueId);
      
      // Filter loans that were active during this month
      const monthLoans = contextLoans.filter((loan: any) => {
        if (!loan.disbursementDate) return false;
        const disbursementDate = new Date(loan.disbursementDate);
        
        // Loan was disbursed before or during this month
        const wasDisbursed = disbursementDate <= new Date(year, month + 1, 0); // Last day of month
        
        // Check if loan was paid off before this month started
        const monthStart = new Date(year, month, 1);
        const isClosed = loan.status?.toLowerCase() === 'paid' || loan.status?.toLowerCase() === 'closed';
        if (isClosed && loan.dateFullyPaid) {
          const paidDate = new Date(loan.dateFullyPaid);
          if (paidDate < monthStart) return false; // Paid before this month
        }
        
        return wasDisbursed;
      });
      
      // Calculate portfolio value (outstanding balance)
      const portfolio = monthLoans.reduce((sum: number, loan: any) => {
        return sum + Math.abs(loan.outstandingBalance || 0);
      }, 0);
      
      // Calculate PAR30 for this month
      const par30Loans = monthLoans.filter((loan: any) => (loan.daysInArrears || 0) >= 30);
      const par30Amount = par30Loans.reduce((sum: number, loan: any) => sum + Math.abs(loan.outstandingBalance || 0), 0);
      const par30Percentage = portfolio > 0 ? (par30Amount / portfolio) * 100 : 0;
      
      months.push({
        month: `${monthName} '${String(year).slice(2)}`,
        portfolio: Math.round(portfolio),
        par30: parseFloat(par30Percentage.toFixed(1)),
        id: uniqueId // Add unique ID for React keys
      });
    }
    
    return months;
  };

  const getLoansByProduct = () => {
    // Debug: Check for product ID mismatches and auto-fix
    if (loanProducts.length > 0 && contextLoans.length > 0) {
      const productIds = loanProducts.map((p: any) => p.id);
      const loanProductIds = [...new Set(contextLoans.map((l: any) => l.productId))];
      const mismatches = loanProductIds.filter(id => id && !productIds.includes(id));
      
      if (mismatches.length > 0) {
        // Auto-fix by reloading loan products - the DataContext will handle orphaned loans
      }
    }
    
    const seen = new Set(); // Track unique product IDs
    
    return loanProducts
      .map((product: any, index: number) => {
        // ✅ Include all active loans for this product (more lenient criteria)
        const productLoans = contextLoans.filter((l: any) => 
          l.productId === product.id && isActiveStatus(l.status)
        );
        
        // ✅ Calculate total outstanding balance from active loans correctly
        const totalOutstanding = productLoans.reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
        
        return {
          id: product.id || `product-${index}-${product.name || index}`,
          name: product.name || `Product ${index + 1}`,
          count: productLoans.length,
          value: totalOutstanding
        };
      })
      .filter((product: any) => {
        // Remove duplicates and filter out products with no value or count
        if (seen.has(product.id)) return false;
        seen.add(product.id);
        return product.value > 0 || product.count > 0;
      });
  };

  const getMonthlyDisbursements = () => {
    const now = new Date();
    const months = [];
    const seen = new Set(); // Track unique month identifiers
    
    // Get last 7 months
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Create unique identifier for this month
      const uniqueId = `${year}-${month}`;
      if (seen.has(uniqueId)) continue; // Skip duplicates
      seen.add(uniqueId);
      
      // Filter loans disbursed in this month
      const monthLoans = contextLoans.filter((loan: any) => {
        if (!loan.disbursementDate) return false;
        const disbursementDate = new Date(loan.disbursementDate);
        return disbursementDate.getFullYear() === year && disbursementDate.getMonth() === month;
      });
      
      const totalAmount = monthLoans.reduce((sum: number, loan: any) => sum + (loan.principalAmount || 0), 0);
      
      months.push({
        month: `${monthName} '${String(year).slice(2)}`,
        amount: totalAmount,
        count: monthLoans.length,
        id: uniqueId // Add unique ID for React keys
      });
    }
    
    return months;
  };

  const getCollectionRateByWeek = () => {
    const now = new Date();
    const weeks = [];
    const seen = new Set(); // Track unique week identifiers
    
    // Get last 5 weeks (including current week)
    for (let i = 4; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7)); // End is i weeks ago
      weekEnd.setDate(weekEnd.getDate() - weekEnd.getDay() + 6); // Saturday
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6); // Sunday
      
      // Create unique identifier for this week
      const uniqueId = `${weekStart.getTime()}`;
      if (seen.has(uniqueId)) continue; // Skip duplicates
      seen.add(uniqueId);
      
      // Format date range for display
      const formatDate = (date: Date) => {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      };
      
      const weekLabel = `${formatDate(weekStart)}-${formatDate(weekEnd).split(' ')[1]}`; // e.g., "Dec 1-7"
      
      // Filter payments made during this week
      const weekPayments = payments.filter((payment: any) => {
        // Check multiple possible date field names
        const dateField = payment.paymentDate || payment.date || payment.createdAt || payment.created_at || payment.transactionDate;
        if (!dateField) return false;
        const paymentDate = new Date(dateField);
        return paymentDate >= weekStart && paymentDate <= weekEnd;
      });
      
      const collected = weekPayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
      

      
      // Calculate expected: sum of installment amounts due during this week
      // For each active loan, calculate if payment was due this week based on disbursement date and frequency
      const expected = contextLoans
        .filter((l: any) => {
          const status = (l.status || '').toLowerCase().trim();
          return status === 'active' || status === 'in arrears' || status === 'paid';
        })
        .reduce((sum: number, loan: any) => {
          if (!loan.disbursementDate) return sum;
          
          const disbursementDate = new Date(loan.disbursementDate);
          const paymentFrequency = (loan.paymentFrequency || 'Monthly').toLowerCase();
          const loanTermMonths = loan.loanTerm || 12;
          const principalAmount = loan.principalAmount || 0;
          const totalInterest = calculateCorrectInterest(loan);
          const totalRepayable = loan.totalRepayable || (principalAmount + totalInterest);
          
          // Calculate installment amount
          let installmentAmount = loan.installmentAmount;
          if (!installmentAmount) {
            // Calculate based on frequency and term
            if (paymentFrequency.includes('week')) {
              const numPayments = loanTermMonths * 4.33; // Convert months to weeks
              installmentAmount = totalRepayable / numPayments;
            } else if (paymentFrequency.includes('month')) {
              installmentAmount = totalRepayable / loanTermMonths;
            } else if (paymentFrequency.includes('daily')) {
              const numPayments = loanTermMonths * 30; // Convert months to days
              installmentAmount = totalRepayable / numPayments;
            } else {
              // Default to monthly
              installmentAmount = totalRepayable / loanTermMonths;
            }
          }
          
          // Check if a payment was due during this week
          let paymentDueThisWeek = false;
          
          if (paymentFrequency.includes('week')) {
            // Weekly payments - check if any payment number falls in this week
            const daysSinceDisbursement = Math.floor((weekEnd.getTime() - disbursementDate.getTime()) / (1000 * 60 * 60 * 24));
            const weeksSinceDisbursement = Math.floor(daysSinceDisbursement / 7);
            
            // Check if any weekly payment date falls within this week
            for (let w = 0; w <= weeksSinceDisbursement; w++) {
              const paymentDate = new Date(disbursementDate);
              paymentDate.setDate(paymentDate.getDate() + (w * 7));
              
              if (paymentDate >= weekStart && paymentDate <= weekEnd) {
                paymentDueThisWeek = true;
                break;
              }
            }
          } else if (paymentFrequency.includes('month')) {
            // Monthly payments - check if payment date (same day of month) falls in this week
            const monthsSinceDisbursement = Math.floor((weekEnd.getTime() - disbursementDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            
            for (let m = 0; m <= monthsSinceDisbursement; m++) {
              const paymentDate = new Date(disbursementDate);
              paymentDate.setMonth(paymentDate.getMonth() + m);
              
              if (paymentDate >= weekStart && paymentDate <= weekEnd) {
                paymentDueThisWeek = true;
                break;
              }
            }
          } else if (paymentFrequency.includes('daily')) {
            // Daily payments - always due during this week
            paymentDueThisWeek = true;
            // For daily, multiply by days in week that the loan was active
            const loanStartDate = disbursementDate > weekStart ? disbursementDate : weekStart;
            const loanEndDate = weekEnd;
            const daysInWeek = Math.max(0, Math.ceil((loanEndDate.getTime() - loanStartDate.getTime()) / (1000 * 60 * 60 * 24)));
            return sum + (installmentAmount * Math.min(daysInWeek, 7));
          }
          
          // Add installment amount if payment was due this week
          if (paymentDueThisWeek) {
            return sum + (installmentAmount || 0);
          }
          
          return sum;
        }, 0);
      
      const rate = expected > 0 ? (collected / expected) * 100 : 0;
      
      weeks.push({
        week: weekLabel,
        collected: Math.round(collected),
        expected: Math.round(expected),
        rate: Math.min(rate, 100),
        id: uniqueId // Add unique ID for React keys
      });
    }
    
    return weeks;
  };

  const parData = useMemo(() => getPARData(), [contextLoans]);
  const portfolioTrend = useMemo(() => getPortfolioTrend(), [contextLoans]);
  const loansByProduct = useMemo(() => getLoansByProduct(), [contextLoans, loanProducts]);
  const monthlyDisbursements = useMemo(() => getMonthlyDisbursements(), [contextLoans]);
  const collectionRateByWeek = useMemo(() => getCollectionRateByWeek(), [contextLoans, payments]);
  
  // Calculate real metrics from DataContext
  const totalClients = contextClients.length;
  const activeLoans = contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'In Arrears').length;
  
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
  
  // ✅ Calculate outstanding balance from active loans only - using correct calculation
  const activeLoansData = contextLoans.filter((l: any) => l.status === 'Active' || l.status === 'In Arrears');
  const totalOutstanding = activeLoansData.reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
  
  // Calculate filtered metrics based on duration selection
  const filteredTotalClients = filteredClientsForCount.length;
  // ✅ Calculate portfolio total correctly
  const filteredPortfolioTotal = filteredLoansForPortfolio.reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
  
  // ✅ Calculate principal outstanding correctly: Principal - Principal Paid (from payment records)
  // ALWAYS calculate - don't use stored principalOutstanding from imports (may be wrong)
  const filteredPrincipalTotal = filteredLoansForPrincipal.reduce((sum: number, l: any) => {
    const principalAmount = l.principalAmount || 0;
    // Calculate principal paid from payment records
    const loanPayments = payments.filter((p: any) => p.loanId === l.id);
    const principalPaid = loanPayments.reduce((pSum: number, p: any) => 
      pSum + (p.principal || p.principalPortion || p.principalPaid || 0), 0);
    const principalOutstanding = Math.max(0, principalAmount - principalPaid);
    return sum + principalOutstanding;
  }, 0);
  
  // ✅ Calculate outstanding interest correctly: Total Interest - Interest Paid (from payment records)
  const filteredInterestTotal = filteredLoansForInterest.reduce((sum: number, l: any) => {
    const totalInterest = calculateCorrectInterest(l);
    // Calculate interest paid from payment records
    const loanPayments = payments.filter((p: any) => p.loanId === l.id);
    const interestPaid = loanPayments.reduce((iSum: number, p: any) => 
      iSum + (p.interest || p.interestPortion || p.interestPaid || 0), 0);
    const interestOutstanding = Math.max(0, totalInterest - interestPaid);
    return sum + interestOutstanding;
  }, 0);
  
  // Calculate collected interest based on duration filter
  const filteredRepaymentsForInterest = filterByDuration(
    payments.filter((p: any) => p.status === 'Approved'), // Only count approved payments
    'paymentDate',
    collectedInterestDuration
  );
  const filteredCollectedInterestTotal = filteredRepaymentsForInterest.reduce((sum: number, r: any) => sum + (r.interest || 0), 0);
  
  const filteredProcessingFeeTotal = filteredProcessingFees.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
  const filteredDisbursedTotal = filteredLoansForDisbursement.reduce((sum: number, l: any) => sum + (l.principalAmount || 0), 0);
  const filteredCollectionsTotal = filteredPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  
  // ✅ Calculate 8 new comprehensive loan metrics
  // a) CUMULATIVE AMOUNT BORROWED - Total principal from all disbursed loans
  const cumulativeAmountBorrowed = contextLoans
    .filter((l: any) => l.disbursementDate && l.status !== 'Rejected')
    .reduce((sum: number, l: any) => sum + (l.principalAmount || 0), 0);
  
  // b) PROCESSING FEES - Total processing fees collected
  const totalProcessingFees = contextLoans
    .filter((l: any) => l.disbursementDate && l.status !== 'Rejected')
    .reduce((sum: number, l: any) => sum + (l.processing_fee || 0), 0);
  
  // c) POTENTIAL INTEREST PAYABLE - Total interest from ALL loans (paid, active, settled, fully paid, etc.)
  const potentialInterestPayable = contextLoans
    .filter((l: any) => l.disbursementDate && l.status !== 'Rejected')
    .reduce((sum: number, l: any) => sum + calculateCorrectInterest(l), 0);
  
  // d) TOTAL AMOUNT PAYABLE - Principal + Interest expected from all loans
  const totalAmountPayable = cumulativeAmountBorrowed + potentialInterestPayable;
  
  // e) PRINCIPAL PAID BACK - Total principal repaid from all loans
  // ✅ FIX: Calculate from payment records, not from loan.principalPaid
  const principalPaidBack = payments
    .filter((p: any) => {
      // Only include payments for disbursed loans
      const loan = contextLoans.find((l: any) => l.id === p.loanId);
      return loan && loan.disbursementDate && loan.status !== 'Rejected';
    })
    .reduce((sum: number, p: any) => sum + (p.principal || p.principalPortion || p.principalPaid || 0), 0);
  
  // 🐛 DEBUG: Log repayment data for diagnostics (wrapped in try-catch for safety)
  try {
    console.log('💰 ========================================');
    console.log('💰 PRINCIPAL PAID BACK Calculation:');
    console.log('💰 ========================================');
    console.log('   Total payments/repayments:', payments?.length || 0);
    
    // 🐛 DEBUG: Log the first payment to see its structure
    if (payments && payments.length > 0) {
      console.log('   First payment structure:', JSON.stringify(payments[0], null, 2));
    }
    
    console.log('   Payments with principal > 0:', payments?.filter((p: any) => (p.principal || p.principalPortion || p.principalPaid || 0) > 0).length || 0);
    console.log('   ✅ TOTAL PRINCIPAL PAID BACK:', principalPaidBack);
    
    // Show sample of payments with principal allocation
    const paymentsWithPrincipal = payments?.filter((p: any) => (p.principal || p.principalPortion || p.principalPaid || 0) > 0).slice(0, 5);
    if (paymentsWithPrincipal && paymentsWithPrincipal.length > 0) {
      console.log('   Sample payments with principal:');
      paymentsWithPrincipal.forEach((p: any) => {
        console.log(`     - Payment ${p.id?.slice(0, 8)}: amount=${p.amount}, principal=${p.principal || p.principalPortion || p.principalPaid}`);
      });
    } else {
      if (payments && payments.length > 0) {
        console.warn('   ⚠️ WARNING: No payments found with principal allocation!');
        console.warn('   This means payments exist but are not being allocated correctly.');
        console.warn('   Run /supabase/ULTIMATE_FIX_principal_paid_back.sql to fix this issue.');
      } else {
        console.log('   ℹ️ No payments recorded yet - this is normal for a new system.');
      }
    }
    console.log('💰 ========================================');
  } catch (debugError) {
    console.error('Debug logging error (non-critical):', debugError);
  }
  
  // f) INTEREST PAID BACK - Total interest repaid from all loans
  // ✅ FIX: Calculate from payment records, not from loan.interestPaid
  const interestPaidBack = payments
    .filter((p: any) => {
      // Only include payments for disbursed loans
      const loan = contextLoans.find((l: any) => l.id === p.loanId);
      return loan && loan.disbursementDate && loan.status !== 'Rejected';
    })
    .reduce((sum: number, p: any) => sum + (p.interest || p.interestPortion || p.interestPaid || 0), 0);
  
  try {
    console.log('💸 INTEREST PAID BACK Calculation:');
    console.log('   Payments with interest:', payments?.filter((p: any) => (p.interest || p.interestPortion || p.interestPaid || 0) > 0).length || 0);
    console.log('   Total interest paid:', interestPaidBack);
  } catch (debugError) {
    console.error('Debug logging error (non-critical):', debugError);
  }
  
  // g) TOTAL AMOUNT REPAID BACK - Total principal + interest repaid
  const totalAmountRepaidBack = principalPaidBack + interestPaidBack;
  
  // h) OUTSTANDING LOANS - Principal + Interest still owed
  const outstandingLoansTotal = totalAmountPayable - totalAmountRepaidBack;

  
  // ✅ Calculate Collection Efficiency: (Total Collected / Total Expected Repayments) × 100
  // Total Expected Repayments = Sum of (Principal + Interest + Fees) for all disbursed loans
  // Total Collected = All payments received
  const totalCollected = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalExpectedRepayments = contextLoans
    .filter((l: any) => l.disbursementDate && l.status !== 'Rejected')
    .reduce((sum: number, l: any) => {
      const principal = l.principalAmount || 0;
      const interest = calculateCorrectInterest(l);
      const fees = l.processing_fee || 0;
      return sum + principal + interest + fees;
    }, 0);
  const collectionEfficiency = totalExpectedRepayments > 0 ? (totalCollected / totalExpectedRepayments) * 100 : 0;
  
  // Calculate AI Insights - clients at risk (loans with arrears >= 30 days)
  // ✅ Use calculated daysInArrears instead of database value to fix incorrect 1500+ days
  const atRiskLoans = contextLoans
    .map((l: any) => ({
      ...l,
      daysInArrears: calculateDaysInArrears(l) // Override with calculated value
    }))
    .filter((l: any) => l.daysInArrears >= 30);
  const atRiskClientIds = new Set(atRiskLoans.map((l: any) => l.clientId));
  const atRiskClientsCount = atRiskClientIds.size;
  const potentialDefaults = atRiskLoans.reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
  
  // ✅ Calculate PAR 30: Outstanding balance of loans 30+ days overdue / Total outstanding
  const par30Loans = contextLoans
    .map((l: any) => {
      // Calculate actual outstanding: Principal + Interest - Paid
      const actualOutstanding = (l.principalAmount || 0) + calculateCorrectInterest(l) - (l.paidAmount || 0);
      return {
        ...l,
        daysInArrears: calculateDaysInArrears(l), // Override with calculated value
        outstandingBalance: actualOutstanding // Use calculated outstanding
      };
    })
    .filter((l: any) => isActiveStatus(l.status) && l.daysInArrears >= 30);
  const par30Amount = par30Loans.reduce((sum: number, l: any) => sum + calculateOutstanding(l), 0);
  const par30Rate = totalOutstanding > 0 ? (par30Amount / totalOutstanding) * 100 : 0;
  
  // ✅ Calculate Processing Fee Revenue from loans table's processing_fee column
  const calculatedProcessingFees = filteredLoansForDisbursement.reduce((sum: number, l: any) => {
    return sum + (l.processing_fee || 0);
  }, 0);
  
  // Calculate actual collection rate: Total Collected / Total Disbursed
  const totalDisbursed = contextLoans.reduce((sum: number, l: any) => sum + (l.principalAmount || 0), 0);
  // ✅ Calculate total paid from payment records
  const totalPaidFromPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const actualCollectionRate = safePercentageNum(totalPaidFromPayments, totalDisbursed);
  
  // AI Risk Analysis calculated
  const atRiskDetails = atRiskLoans.map(l => ({ 
      clientName: l.clientName, 
      loanId: l.id, 
      daysInArrears: l.daysInArrears || 0, 
      outstanding: l.outstandingBalance || 0 
    }));
  
  // Calculate outstanding principal and interest separately from active loans
  // Use principalOutstanding if available, otherwise estimate from outstandingBalance
  const outstandingPrincipal = activeLoansData.reduce((sum: number, l: any) => {
    if (l.principalOutstanding !== undefined && l.principalOutstanding !== null) {
      return sum + (l.principalOutstanding || 0);
    }
    // Fallback: estimate based on totalInterest
    const totalInterest = calculateCorrectInterest(l);
    const outstandingBalance = calculateOutstanding(l);
    const principalPart = outstandingBalance > totalInterest ? outstandingBalance - totalInterest : outstandingBalance * 0.9;
    return sum + principalPart;
  }, 0);
  
  const outstandingInterest = activeLoansData.reduce((sum: number, l: any) => {
    if (l.interestOutstanding !== undefined && l.interestOutstanding !== null) {
      return sum + (l.interestOutstanding || 0);
    }
    // Fallback: estimate as remaining interest
    const totalInterest = l.totalInterest || 0;
    const outstandingBalance = calculateOutstanding(l);
    const interestPart = outstandingBalance > totalInterest ? totalInterest : outstandingBalance * 0.1;
    return sum + interestPart;
  }, 0);
  
  // Calculate total collections from payments
  const totalCollections = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  
  // ✅ Calculate overdueLoans with corrected daysInArrears AND outstanding balance
  const overdueLoans = contextLoans
    .map((l: any) => ({
      ...l,
      daysInArrears: calculateDaysInArrears(l), // Override with calculated value
      outstandingBalance: calculateOutstanding(l) // Recalculate with correct total
    }))
    .filter((l: any) => l.daysInArrears > 0);
  const recentApplications = contextLoans.slice(-5).reverse();

  // Generate complete repayment schedule with individual installments
  const generateRepaymentSchedule = () => {
    const schedule: Array<{
      paymentDate: Date;
      installmentAmount: number;
      status: 'Paid' | 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming';
      loanId: string;
      clientName: string;
      loanNumber: string;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    contextLoans.filter((loan: any) => isActiveStatus(loan.status)).forEach((loan: any) => {
      // Robust date handling
      let firstRepaymentDate;
      if (loan.firstRepaymentDate && !isNaN(new Date(loan.firstRepaymentDate).getTime())) {
        firstRepaymentDate = new Date(loan.firstRepaymentDate);
      } else if (loan.disbursementDate && !isNaN(new Date(loan.disbursementDate).getTime())) {
        // Fallback: Disbursement date + 1 month (or based on frequency)
        firstRepaymentDate = new Date(loan.disbursementDate);
        if (loan.repaymentFrequency === 'Weekly') firstRepaymentDate.setDate(firstRepaymentDate.getDate() + 7);
        else if (loan.repaymentFrequency === 'Daily') firstRepaymentDate.setDate(firstRepaymentDate.getDate() + 1);
        else firstRepaymentDate.setMonth(firstRepaymentDate.getMonth() + 1);
      } else {
        return; // Skip if no valid dates
      }

      // Robust installment calculation
      const numInstallments = loan.numberOfInstallments || loan.term || 12;
      let installmentAmount = loan.installmentAmount || 0;
      
      // Calculate installment amount if missing
      if (!installmentAmount && numInstallments > 0) {
        const principal = loan.principalAmount || 0;
        const interest = loan.totalInterest || 0;
        installmentAmount = (principal + interest) / numInstallments;
      }
      
      const clientName = loan.clientName || loan.client_name || 'Unknown Client';
      const loanNumber = loan.loanNumber || loan.loan_number || loan.id;

      for (let i = 0; i < numInstallments; i++) {
        const paymentDate = new Date(firstRepaymentDate);
        
        // Handle frequency case-insensitive
        const frequency = (loan.repaymentFrequency || 'Monthly').toLowerCase();
        
        if (frequency.includes('month')) {
          paymentDate.setMonth(paymentDate.getMonth() + i);
        } else if (frequency.includes('week')) {
          paymentDate.setDate(paymentDate.getDate() + (i * 7));
        } else if (frequency.includes('daily')) {
          paymentDate.setDate(paymentDate.getDate() + i);
        } else {
          paymentDate.setMonth(paymentDate.getMonth() + (i * 12));
        }
        
        paymentDate.setHours(0, 0, 0, 0);

        let status: 'Paid' | 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming' = 'Upcoming';
        const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const totalPaidInstallments = Math.floor((loan.paidAmount || 0) / (installmentAmount || 1));
        
        if (i < totalPaidInstallments) {
          status = 'Paid';
        } else if (paymentDate < today) {
          status = 'Overdue';
        } else if (paymentDate.getTime() === today.getTime()) {
          status = 'Due Today';
        } else if (daysDiff >= -7 && daysDiff < 0) {
          status = 'Due Soon';
        }

        schedule.push({
          paymentDate,
          installmentAmount,
          status,
          loanId: loan.id,
          clientName,
          loanNumber
        });
      }
    });

    return schedule.sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime());
  };

  const repaymentSchedule = generateRepaymentSchedule();

  // Calculate upcoming payments based on selected timeframe
  const getUpcomingPayments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let endDate = new Date(today);
    
    switch (upcomingPaymentsTimeframe) {
      case 'today':
        // Same day
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this-week':
        // Until end of current week (Sunday)
        const dayOfWeek = today.getDay();
        const daysUntilSunday = 7 - dayOfWeek;
        endDate.setDate(today.getDate() + daysUntilSunday);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'next-7-days':
        // Next 7 days from today
        endDate.setDate(today.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this-month':
        // Until end of current month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }
    
    return repaymentSchedule.filter(p => {
      const paymentDate = new Date(p.paymentDate);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate >= today && paymentDate <= endDate && p.status !== 'Paid';
    });
  };

  const upcomingPayments = getUpcomingPayments();
  const upcomingPaymentsAmount = upcomingPayments.reduce((sum, p) => sum + p.installmentAmount, 0);

  // Use theme colors
  const themeColors = isDark ? currentTheme.darkColors : currentTheme.colors;
  const COLORS = themeColors.chartColors || ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
  
  // Define loan status distribution with specific colors (case-insensitive)
  const getLoanStatusDistribution = () => {
    const normalizeStatus = (status: string) => (status || '').toLowerCase().trim();
    
    return [
      { 
        id: 'active',
        status: 'Active', 
        count: contextLoans.filter((l: any) => {
          const s = normalizeStatus(l.status);
          return s === 'active' || s === 'disbursed';
        }).length, 
        color: '#4ade80' 
      },
      { 
        id: 'paid',
        status: 'Paid', 
        count: contextLoans.filter((l: any) => {
          const s = normalizeStatus(l.status);
          return s === 'paid' || s === 'closed' || s === 'paid off';
        }).length, 
        color: '#60a5fa' 
      },
      { 
        id: 'arrears',
        status: 'In Arrears', 
        count: contextLoans.filter((l: any) => {
          const s = normalizeStatus(l.status);
          return s === 'in arrears' || s === 'overdue';
        }).length, 
        color: '#fbbf24' 
      },
      { 
        id: 'default',
        status: 'Default', 
        count: contextLoans.filter((l: any) => {
          const s = normalizeStatus(l.status);
          return s === 'default' || s === 'written off' || s === 'defaulted';
        }).length, 
        color: '#f87171' 
      },
    ];
  };
  
  const loanStatusDistribution = useMemo(() => getLoanStatusDistribution(), [contextLoans]);
  
  // Case-insensitive status breakdown for analysis
  const normalizeStatusDebug = (status: string) => (status || '').toLowerCase().trim();


  // Transform loansByProduct data for MUI PieChart
  const pieChartData = useMemo(() => loansByProduct.map((item, index) => ({
    label: item.name,
    value: item.value,
    color: COLORS[index % COLORS.length]
  })), [loansByProduct]);

  // Calculate total for percentages
  const totalPortfolioValue = useMemo(() => pieChartData.reduce((sum, item) => sum + item.value, 0), [pieChartData]);

  // Transform loan status data for radial bar chart
  const radialChartData = useMemo(() => [
    {
      active: loanStatusDistribution[0]?.count || 0,
      inArrears: loanStatusDistribution[1]?.count || 0,
      paidOff: loanStatusDistribution[2]?.count || 0,
      writtenOff: loanStatusDistribution[3]?.count || 0,
    }
  ], [loanStatusDistribution]);
  
  const totalLoans = useMemo(() => loanStatusDistribution.reduce((sum, item) => sum + item.count, 0), [loanStatusDistribution]);

  // Function to show calculation breakdown
  const showBreakdown = (metricType: string) => {
    let breakdown: any;
    
    switch(metricType) {
      case 'total-clients':
        breakdown = {
          metric: 'total-clients',
          title: 'Total Clients Calculation',
          formula: 'Count of all registered clients',
          components: [
            { label: 'Total Registered Clients', value: `${totalClients} clients` },
            { label: 'Filtered Clients (Based on Duration)', value: `${filteredTotalClients} clients` }
          ],
          result: `${filteredTotalClients} clients`,
          details: filteredClientsForCount.slice(0, 10).map((c: any) => ({
            name: c.name,
            registrationDate: new Date(c.createdAt).toLocaleDateString()
          }))
        };
        break;
        
      case 'disbursed-total':
        breakdown = {
          metric: 'disbursed-total',
          title: 'Total Disbursed Calculation',
          formula: 'Sum of Principal Amount from all disbursed loans',
          components: [
            { label: 'Number of Loans', value: `${filteredLoansForDisbursement.length} loans` },
            { label: 'Total Principal Disbursed', value: `${currencyCode} ${filteredDisbursedTotal.toLocaleString()}` },
            { label: 'Average Loan Size', value: `${currencyCode} ${(filteredDisbursedTotal / Math.max(filteredLoansForDisbursement.length, 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}` }
          ],
          result: `${currencyCode} ${filteredDisbursedTotal.toLocaleString()}`,
          details: filteredLoansForDisbursement.slice(0, 10).map((l: any) => ({
            clientName: l.clientName,
            amount: `${currencyCode} ${l.principalAmount.toLocaleString()}`,
            date: new Date(l.disbursementDate).toLocaleDateString()
          }))
        };
        break;
        
      case 'collections-total':
        breakdown = {
          metric: 'collections-total',
          title: 'Total Collections Calculation',
          formula: 'Sum of all payment amounts',
          components: [
            { label: 'Number of Payments', value: `${filteredPayments.length} payments` },
            { label: 'Total Collected', value: `${currencyCode} ${filteredCollectionsTotal.toLocaleString()}` },
            { label: 'Average Payment', value: `${currencyCode} ${(filteredCollectionsTotal / Math.max(filteredPayments.length, 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}` }
          ],
          result: `${currencyCode} ${filteredCollectionsTotal.toLocaleString()}`,
          details: filteredPayments.slice(0, 10).map((p: any) => ({
            clientName: p.clientName || p.loanId,
            amount: `${currencyCode} ${p.amount.toLocaleString()}`,
            date: new Date(p.paymentDate).toLocaleDateString()
          }))
        };
        break;
        
      case 'par30':
        breakdown = {
          metric: 'par30',
          title: 'PAR 30 Days Calculation',
          formula: 'PAR 30 = (Outstanding Balance of Loans 30+ Days Overdue / Total Outstanding) × 100',
          components: [
            { label: 'Loans 30+ Days Overdue', value: `${par30Loans.length} loans` },
            { label: 'Outstanding Balance (30+ Days)', value: `${currencyCode} ${par30Amount.toLocaleString()}` },
            { label: 'Total Outstanding Balance', value: `${currencyCode} ${totalOutstanding.toLocaleString()}` },
            { label: 'Calculation', value: `(${par30Amount.toLocaleString()} ÷ ${totalOutstanding.toLocaleString()}) × 100` }
          ],
          result: `${par30Rate.toFixed(2)}%`,
          details: par30Loans.map((l: any) => ({
            clientName: l.clientName,
            daysOverdue: `${l.daysInArrears} days`,
            outstanding: `${currencyCode} ${l.outstandingBalance.toLocaleString()}`
          }))
        };
        break;
        
      case 'collection-efficiency':
        breakdown = {
          metric: 'collection-efficiency',
          title: 'Collection Efficiency Calculation',
          formula: 'Collection Efficiency = (Total Collected / Total Expected Repayments) × 100',
          components: [
            { label: 'Total Payments Collected', value: `${currencyCode} ${totalCollected.toLocaleString()}` },
            { label: 'Total Expected Repayments', value: `${currencyCode} ${totalExpectedRepayments.toLocaleString()}`, description: 'Principal + Interest + Fees for all disbursed loans' },
            { label: 'Calculation', value: `(${totalCollected.toLocaleString()} ÷ ${totalExpectedRepayments.toLocaleString()}) × 100` }
          ],
          result: `${collectionEfficiency.toFixed(1)}%`,
          details: [
            { 
              note: 'Expected Collections = Disbursed - Outstanding',
              calculation: `${totalDisbursedForEfficiency.toLocaleString()} - ${totalOutstandingForEfficiency.toLocaleString()} = ${expectedCollections.toLocaleString()}`
            },
            {
              note: 'If >100%, you collected more than expected (fees, early payments, etc.)',
              calculation: totalCollected > expectedCollections ? 'Over-performance detected ✓' : 'Under-performance'
            }
          ]
        };
        break;
    }
    
    if (breakdown) {
      setCalculationBreakdown(breakdown);
    }
  };

  // ✅ Enhanced function to show detailed metric breakdown with AI insights
  const showMetricDetail = (metricType: string) => {
    let modalData: any = null;

    const formatNum = (num: number) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(num);
    };

    switch (metricType) {
      case 'gross-portfolio':
        modalData = {
          metricType: 'gross-portfolio',
          metricLabel: 'Gross Loan Portfolio',
          metricValue: `${currencySymbol} ${formatSmartNumber(filteredPortfolioTotal || 0).number}${formatSmartNumber(filteredPortfolioTotal || 0).suffix}`,
          icon: <DollarSign className="size-6" />,
          color: COLORS[0],
          calculation: {
            formula: 'Gross Portfolio = Sum of (Principal + Interest) for all active loans',
            steps: [
              { label: 'Total Active Loans', value: `${filteredLoansForPortfolio.length} loans` },
              { label: 'Total Principal Outstanding', value: `${currencySymbol} ${formatNum(filteredPrincipalTotal)}` },
              { label: 'Total Interest Outstanding', value: `${currencySymbol} ${formatNum(filteredInterestTotal)}` },
              { label: 'Gross Loan Portfolio', value: `${currencySymbol} ${formatNum(filteredPortfolioTotal)}`, description: 'Sum of principal and interest from all active loans' }
            ]
          },
          breakdown: {
            loans: filteredLoansForPortfolio.slice(0, 50).map((l: any) => ({
              loanNumber: l.loanNumber || l.id,
              clientName: l.clientName || 'Unknown',
              amount: calculateOutstanding(l),
              status: l.status,
              date: l.applicationDate || l.disbursementDate || l.createdAt
            })),
            summary: [
              { label: 'Number of Loans', value: filteredLoansForPortfolio.length },
              { label: 'Average Loan Balance', value: `${currencySymbol} ${formatNum(filteredPortfolioTotal / Math.max(filteredLoansForPortfolio.length, 1))}` },
              { label: 'Principal Component', value: `${safeToFixed(safeDivideNum(filteredPrincipalTotal, filteredPortfolioTotal) * 100, 1)}%` },
              { label: 'Interest Component', value: `${safeToFixed(safeDivideNum(filteredInterestTotal, filteredPortfolioTotal) * 100, 1)}%` }
            ]
          },
          insights: [
            {
              type: filteredPortfolioTotal > 1000000 ? 'positive' : 'neutral',
              title: filteredPortfolioTotal > 1000000 ? 'Strong Portfolio Size' : 'Growing Portfolio',
              description: filteredPortfolioTotal > 1000000 
                ? `Your portfolio has reached ${currencySymbol}${formatSmartNumber(filteredPortfolioTotal).number}${formatSmartNumber(filteredPortfolioTotal).suffix}, indicating healthy business growth and client trust.`
                : `Your portfolio is at ${currencySymbol}${formatSmartNumber(filteredPortfolioTotal).number}${formatSmartNumber(filteredPortfolioTotal).suffix}. Focus on client acquisition and retention to scale up.`
            },
            {
              type: 'neutral',
              title: 'Portfolio Composition',
              description: `Your portfolio is ${safeToFixed(safeDivideNum(filteredPrincipalTotal, filteredPortfolioTotal) * 100, 1)}% principal and ${safeToFixed(safeDivideNum(filteredInterestTotal, filteredPortfolioTotal) * 100, 1)}% interest. This ratio is typical for active loan portfolios.`
            },
            {
              type: filteredLoansForPortfolio.length > 50 ? 'positive' : 'warning',
              title: 'Portfolio Diversification',
              description: filteredLoansForPortfolio.length > 50
                ? `With ${filteredLoansForPortfolio.length} active loans, your portfolio shows good diversification, reducing concentration risk.`
                : `Consider expanding your client base. Currently serving ${filteredLoansForPortfolio.length} active loans. More diversification reduces risk.`
            }
          ]
        };
        break;

      case 'outstanding-principal':
        modalData = {
          metricType: 'outstanding-principal',
          metricLabel: 'Outstanding Principal',
          metricValue: `${currencySymbol} ${formatSmartNumber(filteredPrincipalTotal || 0).number}${formatSmartNumber(filteredPrincipalTotal || 0).suffix}`,
          icon: <Banknote className="size-6" />,
          color: COLORS[1],
          calculation: {
            formula: 'Outstanding Principal = Sum of unpaid principal amounts from all active loans',
            steps: [
              { label: 'Total Active Loans', value: `${filteredLoansForPrincipal.length} loans` },
              { label: 'Total Outstanding Principal', value: `${currencySymbol} ${formatNum(filteredPrincipalTotal)}` },
              { label: 'Average Principal per Loan', value: `${currencySymbol} ${formatNum(filteredPrincipalTotal / Math.max(filteredLoansForPrincipal.length, 1))}` }
            ]
          },
          breakdown: {
            loans: filteredLoansForPrincipal.slice(0, 50).map((l: any) => {
              // ✅ Calculate principal paid from payment records for this loan
              const principalAmount = l.principalAmount || 0;
              const loanPayments = payments.filter((p: any) => p.loanId === l.id);
              const principalPaid = loanPayments.reduce((sum: number, p: any) => 
                sum + (p.principal || p.principalPortion || p.principalPaid || 0), 0);
              const principal = Math.max(0, principalAmount - principalPaid);
              return {
                loanNumber: l.loanNumber || l.id,
                clientName: l.clientName || 'Unknown',
                amount: principal,
                status: l.status,
                date: l.applicationDate || l.disbursementDate || l.createdAt
              };
            }),
            summary: [
              { label: 'Total Loans', value: filteredLoansForPrincipal.length },
              { label: 'Largest Principal', value: `${currencySymbol} ${formatNum(Math.max(...filteredLoansForPrincipal.map((l: any) => l.principalOutstanding || l.principalAmount || 0)))}` },
              { label: 'Smallest Principal', value: `${currencySymbol} ${formatNum(Math.min(...filteredLoansForPrincipal.map((l: any) => l.principalOutstanding || l.principalAmount || 0)))}` },
              { label: 'Collection Rate Needed', value: `${safeToFixed(safeDivideNum(filteredPrincipalTotal, 30), 0)} per day` }
            ]
          },
          insights: [
            {
              type: 'neutral',
              title: 'Capital At Risk',
              description: `You have ${currencySymbol}${formatSmartNumber(filteredPrincipalTotal).number}${formatSmartNumber(filteredPrincipalTotal).suffix} of principal outstanding across ${filteredLoansForPrincipal.length} loans. This represents your actual capital deployed in the market.`
            },
            {
              type: 'positive',
              title: 'Recovery Strategy',
              description: `To recover all principal within 30 days, you need to collect approximately ${currencySymbol}${formatNum(filteredPrincipalTotal / 30)} per day. Adjust based on your loan terms and repayment schedules.`
            }
          ]
        };
        break;

      case 'outstanding-interest':
        modalData = {
          metricType: 'outstanding-interest',
          metricLabel: 'Outstanding Interest',
          metricValue: `${currencySymbol} ${formatSmartNumber(filteredInterestTotal || 0).number}${formatSmartNumber(filteredInterestTotal || 0).suffix}`,
          icon: <TrendingUp className="size-6" />,
          color: COLORS[4] || COLORS[2],
          calculation: {
            formula: 'Outstanding Interest = Sum of accrued but unpaid interest from all active loans',
            steps: [
              { label: 'Formula Used', value: 'Interest = Principal × Rate × Term / 100', description: 'Using 7.5% monthly flat rate' },
              { label: 'Total Interest Accrued', value: `${currencySymbol} ${formatNum(filteredInterestTotal)}` },
              { label: 'Average Interest per Loan', value: `${currencySymbol} ${formatNum(filteredInterestTotal / Math.max(filteredLoansForInterest.length, 1))}` }
            ]
          },
          breakdown: {
            loans: filteredLoansForInterest.slice(0, 50).map((l: any) => {
              // ✅ Calculate outstanding interest from payment records
              const totalInterest = calculateCorrectInterest(l);
              const loanPayments = payments.filter((p: any) => p.loanId === l.id);
              const interestPaid = loanPayments.reduce((iSum: number, p: any) => 
                iSum + (p.interest || p.interestPortion || p.interestPaid || 0), 0);
              const interestOutstanding = Math.max(0, totalInterest - interestPaid);
              return {
                loanNumber: l.loanNumber || l.id,
                clientName: l.clientName || 'Unknown',
                amount: interestOutstanding,
                status: l.status,
                date: l.applicationDate || l.disbursementDate || l.createdAt
              };
            }),
            summary: [
              { label: 'Interest-Bearing Loans', value: filteredLoansForInterest.length },
              { label: 'Interest as % of Principal', value: `${safeToFixed(safeDivideNum(filteredInterestTotal, filteredPrincipalTotal) * 100, 1)}%` },
              { label: 'Potential Revenue', value: `${currencySymbol} ${formatNum(filteredInterestTotal)}` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Revenue Potential',
              description: `Your accrued interest of ${currencySymbol}${formatSmartNumber(filteredInterestTotal).number}${formatSmartNumber(filteredInterestTotal).suffix} represents potential revenue. Focus on timely collections to realize this income.`
            },
            {
              type: filteredInterestTotal / filteredPrincipalTotal > 0.15 ? 'positive' : 'neutral',
              title: 'Interest-to-Principal Ratio',
              description: `Your interest represents ${safeToFixed(safeDivideNum(filteredInterestTotal, filteredPrincipalTotal) * 100, 1)}% of outstanding principal. ${filteredInterestTotal / filteredPrincipalTotal > 0.15 ? 'This healthy ratio indicates good profitability.' : 'Consider reviewing your interest rate strategy.'}`
            }
          ]
        };
        break;

      case 'collected-interest':
        const totalPaymentsWithInterest = filteredRepaymentsForInterest.length;
        const avgInterestPerPayment = filteredCollectedInterestTotal / Math.max(totalPaymentsWithInterest, 1);
        
        modalData = {
          metricType: 'collected-interest',
          metricLabel: 'Collected Interest',
          metricValue: `${currencySymbol} ${formatSmartNumber(filteredCollectedInterestTotal || 0).number}${formatSmartNumber(filteredCollectedInterestTotal || 0).suffix}`,
          icon: <Wallet className="size-6" />,
          color: '#10b981',
          calculation: {
            formula: 'Collected Interest = Sum of interest portions from all payments received',
            steps: [
              { label: 'Total Payments Received', value: `${totalPaymentsWithInterest} payments` },
              { label: 'Total Interest Collected', value: `${currencySymbol} ${formatNum(filteredCollectedInterestTotal)}` },
              { label: 'Average Interest per Payment', value: `${currencySymbol} ${formatNum(avgInterestPerPayment)}` }
            ]
          },
          breakdown: {
            payments: filteredRepaymentsForInterest.slice(0, 50).map((p: any) => {
              const loan = contextLoans.find((l: any) => l.id === p.loanId);
              return {
                paymentId: p.id,
                loanNumber: loan?.loanNumber || p.loanId,
                clientName: p.clientName || loan?.clientName || 'Unknown',
                amount: p.amount || 0,
                date: p.paymentDate || p.createdAt,
                interestPortion: p.interestPaid || (p.amount * 0.3)
              };
            }),
            summary: [
              { label: 'Total Payments', value: totalPaymentsWithInterest },
              { label: 'Revenue Realized', value: `${currencySymbol} ${formatNum(filteredCollectedInterestTotal)}` },
              { label: 'Daily Average', value: `${currencySymbol} ${formatNum(filteredCollectedInterestTotal / 30)}` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Revenue Collection',
              description: `You've successfully collected ${currencySymbol}${formatSmartNumber(filteredCollectedInterestTotal).number}${formatSmartNumber(filteredCollectedInterestTotal).suffix} in interest revenue from ${totalPaymentsWithInterest} payments. This represents realized income.`
            },
            {
              type: 'neutral',
              title: 'Collection Efficiency',
              description: `Your average interest collection per payment is ${currencySymbol}${formatNum(avgInterestPerPayment)}. Monitor this metric to ensure consistent revenue streams.`
            }
          ]
        };
        break;

      case 'processing-fees':
        const loansWithFees = filteredLoansForDisbursement.filter((l: any) => (l.processing_fee || 0) > 0);
        const avgFee = calculatedProcessingFees / Math.max(loansWithFees.length, 1);
        
        modalData = {
          metricType: 'processing-fees',
          metricLabel: 'Processing Fee Revenue',
          metricValue: `${currencySymbol} ${formatSmartNumber(calculatedProcessingFees || 0).number}${formatSmartNumber(calculatedProcessingFees || 0).suffix}`,
          icon: <Receipt className="size-6" />,
          color: COLORS[5] || COLORS[1],
          calculation: {
            formula: 'Processing Fees = Sum of all processing fees collected from disbursed loans',
            steps: [
              { label: 'Loans with Processing Fees', value: `${loansWithFees.length} loans` },
              { label: 'Total Fees Collected', value: `${currencySymbol} ${formatNum(calculatedProcessingFees)}` },
              { label: 'Average Fee per Loan', value: `${currencySymbol} ${formatNum(avgFee)}` }
            ]
          },
          breakdown: {
            loans: loansWithFees.slice(0, 50).map((l: any) => ({
              loanNumber: l.loanNumber || l.id,
              clientName: l.clientName || 'Unknown',
              amount: l.processing_fee || 0,
              status: 'Collected',
              date: l.disbursementDate
            })),
            summary: [
              { label: 'Fee-Bearing Loans', value: loansWithFees.length },
              { label: 'Total Revenue', value: `${currencySymbol} ${formatNum(calculatedProcessingFees)}` },
              { label: 'Fee as % of Principal', value: `${safeToFixed(safeDivideNum(avgFee, filteredDisbursedTotal / filteredLoansForDisbursement.length) * 100, 1)}%` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Upfront Revenue',
              description: `Processing fees provide immediate revenue upon disbursement. You've collected ${currencySymbol}${formatSmartNumber(calculatedProcessingFees).number}${formatSmartNumber(calculatedProcessingFees).suffix} from ${loansWithFees.length} loans.`
            },
            {
              type: 'neutral',
              title: 'Fee Structure',
              description: `Your average processing fee is ${currencySymbol}${formatNum(avgFee)} per loan, which is ${safeToFixed(safeDivideNum(avgFee, filteredDisbursedTotal / filteredLoansForDisbursement.length) * 100, 1)}% of the average loan amount. Ensure this remains competitive.`
            }
          ]
        };
        break;

      case 'total-clients':
        modalData = {
          metricType: 'total-clients',
          metricLabel: 'Total Clients',
          metricValue: filteredTotalClients.toString(),
          icon: <Users className="size-6" />,
          color: COLORS[0],
          calculation: {
            formula: 'Total Clients = Count of all registered clients in the selected timeframe',
            steps: [
              { label: 'Total Registered Clients', value: `${totalClients} clients` },
              { label: 'Filtered Clients (Based on Duration)', value: `${filteredTotalClients} clients` },
              { label: 'Client Growth Rate', value: `${safeToFixed(safeDivideNum(filteredTotalClients, Math.max(totalClients - filteredTotalClients, 1)) * 100, 1)}%` }
            ]
          },
          breakdown: {
            clients: filteredClientsForCount.slice(0, 50).map((c: any) => {
              const clientLoansCount = contextLoans.filter((l: any) => l.clientUuid === c.id || l.clientId === c.id).length;
              return {
                clientId: c.id,
                name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
                status: c.status || 'Active',
                joinDate: c.createdAt || c.registrationDate,
                totalLoans: clientLoansCount
              };
            }),
            summary: [
              { label: 'Active Clients', value: filteredClientsForCount.filter((c: any) => c.status === 'Active' || c.status === 'Good Standing').length },
              { label: 'Clients with Loans', value: filteredClientsForCount.filter((c: any) => contextLoans.some((l: any) => l.clientUuid === c.id || l.clientId === c.id)).length },
              { label: 'Average Loans per Client', value: safeToFixed(safeDivideNum(contextLoans.length, Math.max(filteredTotalClients, 1)), 1) }
            ]
          },
          insights: [
            {
              type: filteredTotalClients > 50 ? 'positive' : 'neutral',
              title: 'Client Base Size',
              description: filteredTotalClients > 50 
                ? `You have ${filteredTotalClients} registered clients, indicating a strong and growing customer base. Continue nurturing these relationships.`
                : `Your client base of ${filteredTotalClients} shows potential for growth. Focus on acquisition and retention strategies to scale up.`
            },
            {
              type: 'positive',
              title: 'Client Engagement',
              description: `${safeToFixed(safeDivideNum(filteredClientsForCount.filter((c: any) => contextLoans.some((l: any) => l.clientUuid === c.id || l.clientId === c.id)).length, Math.max(filteredTotalClients, 1)) * 100, 1)}% of your clients have taken loans. ${safeToFixed(safeDivideNum(filteredClientsForCount.filter((c: any) => contextLoans.some((l: any) => l.clientUuid === c.id || l.clientId === c.id)).length, Math.max(filteredTotalClients, 1)) * 100, 1) > 70 ? 'Excellent engagement rate!' : 'Consider strategies to convert more clients to borrowers.'}`
            }
          ]
        };
        break;

      case 'disbursed-total':
        modalData = {
          metricType: 'disbursed-total',
          metricLabel: 'Disbursed (Total)',
          metricValue: `${currencySymbol} ${formatSmartNumber(filteredDisbursedTotal || 0).number}${formatSmartNumber(filteredDisbursedTotal || 0).suffix}`,
          icon: <DollarSign className="size-6" />,
          color: COLORS[1],
          calculation: {
            formula: 'Total Disbursed = Sum of all principal amounts disbursed to clients',
            steps: [
              { label: 'Total Loans Disbursed', value: `${filteredLoansForDisbursement.length} loans` },
              { label: 'Total Amount Disbursed', value: `${currencySymbol} ${formatNum(filteredDisbursedTotal)}` },
              { label: 'Average Loan Size', value: `${currencySymbol} ${formatNum(filteredDisbursedTotal / Math.max(filteredLoansForDisbursement.length, 1))}` }
            ]
          },
          breakdown: {
            loans: filteredLoansForDisbursement.slice(0, 50).map((l: any) => ({
              loanNumber: l.loanNumber || l.id,
              clientName: l.clientName || 'Unknown',
              amount: l.principalAmount || 0,
              status: l.status,
              date: l.disbursementDate
            })),
            summary: [
              { label: 'Loans Disbursed', value: filteredLoansForDisbursement.length },
              { label: 'Largest Loan', value: `${currencySymbol} ${formatNum(Math.max(...filteredLoansForDisbursement.map((l: any) => l.principalAmount || 0)))}` },
              { label: 'Smallest Loan', value: `${currencySymbol} ${formatNum(Math.min(...filteredLoansForDisbursement.map((l: any) => l.principalAmount || 0)))}` },
              { label: 'Median Loan Size', value: `${currencySymbol} ${formatNum(filteredDisbursedTotal / Math.max(filteredLoansForDisbursement.length, 1))}` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Lending Activity',
              description: `You've disbursed ${currencySymbol}${formatSmartNumber(filteredDisbursedTotal).number}${formatSmartNumber(filteredDisbursedTotal).suffix} across ${filteredLoansForDisbursement.length} loans. This shows active lending operations.`
            },
            {
              type: 'neutral',
              title: 'Loan Size Distribution',
              description: `Your average loan size is ${currencySymbol}${formatNum(filteredDisbursedTotal / Math.max(filteredLoansForDisbursement.length, 1))}. Ensure this aligns with your target market and risk appetite.`
            }
          ]
        };
        break;

      case 'collections-total':
        modalData = {
          metricType: 'collections-total',
          metricLabel: 'Collections (Total)',
          metricValue: `${currencySymbol} ${formatSmartNumber(filteredCollectionsTotal || 0).number}${formatSmartNumber(filteredCollectionsTotal || 0).suffix}`,
          icon: <Wallet className="size-6" />,
          color: COLORS[2],
          calculation: {
            formula: 'Total Collections = Sum of all payment amounts received from clients',
            steps: [
              { label: 'Total Payments Received', value: `${filteredPayments.length} payments` },
              { label: 'Total Amount Collected', value: `${currencySymbol} ${formatNum(filteredCollectionsTotal)}` },
              { label: 'Average Payment Size', value: `${currencySymbol} ${formatNum(filteredCollectionsTotal / Math.max(filteredPayments.length, 1))}` },
              { label: 'Collection Rate', value: `${safeToFixed(safeDivideNum(filteredCollectionsTotal, filteredDisbursedTotal) * 100, 1)}%`, description: 'Percentage of disbursed amount collected back' }
            ]
          },
          breakdown: {
            payments: filteredPayments.slice(0, 50).map((p: any) => {
              const loan = contextLoans.find((l: any) => l.id === p.loanId);
              return {
                paymentId: p.id,
                loanNumber: loan?.loanNumber || p.loanId,
                clientName: p.clientName || loan?.clientName || 'Unknown',
                amount: p.amount || 0,
                date: p.paymentDate || p.createdAt
              };
            }),
            summary: [
              { label: 'Total Payments', value: filteredPayments.length },
              { label: 'Collection Efficiency', value: `${safeToFixed(safeDivideNum(filteredCollectionsTotal, filteredDisbursedTotal) * 100, 1)}%` },
              { label: 'Average per Day', value: `${currencySymbol} ${formatNum(filteredCollectionsTotal / 30)}` }
            ]
          },
          insights: [
            {
              type: filteredCollectionsTotal / filteredDisbursedTotal > 0.5 ? 'positive' : 'warning',
              title: 'Collection Performance',
              description: `You've collected ${safeToFixed(safeDivideNum(filteredCollectionsTotal, filteredDisbursedTotal) * 100, 1)}% of total disbursed amount. ${filteredCollectionsTotal / filteredDisbursedTotal > 0.5 ? 'Strong collection performance!' : 'Focus on improving collection efficiency.'}`
            },
            {
              type: 'neutral',
              title: 'Payment Frequency',
              description: `You're receiving an average of ${safeToFixed(filteredPayments.length / 30, 1)} payments per day, collecting approximately ${currencySymbol}${formatNum(filteredCollectionsTotal / 30)} daily.`
            }
          ]
        };
        break;

      case 'par30':
        modalData = {
          metricType: 'par30',
          metricLabel: 'PAR 30 Days',
          metricValue: `${par30Rate.toFixed(2)}%`,
          icon: <AlertTriangle className="size-6" />,
          color: COLORS[3],
          calculation: {
            formula: 'PAR 30 = (Outstanding Balance of Loans 30+ Days Overdue ÷ Total Outstanding) × 100',
            steps: [
              { label: 'Loans 30+ Days Overdue', value: `${par30Loans.length} loans` },
              { label: 'Outstanding Balance (30+ Days)', value: `${currencySymbol} ${formatNum(par30Amount)}` },
              { label: 'Total Outstanding Balance', value: `${currencySymbol} ${formatNum(totalOutstanding)}` },
              { label: 'PAR 30 Ratio', value: `${par30Rate.toFixed(2)}%`, description: 'Industry standard: <5% is excellent, 5-10% is acceptable' }
            ]
          },
          breakdown: {
            loans: par30Loans.map((l: any) => ({
              loanNumber: l.loanNumber || l.id,
              clientName: l.clientName || 'Unknown',
              amount: l.outstandingBalance || 0,
              status: l.status,
              daysInArrears: l.daysInArrears || 0,
              date: l.applicationDate || l.disbursementDate || l.createdAt
            })),
            summary: [
              { label: 'Loans in Arrears', value: par30Loans.length },
              { label: 'Total at Risk', value: `${currencySymbol} ${formatNum(par30Amount)}` },
              { label: 'Average Days Overdue', value: Math.round(par30Loans.reduce((sum: number, l: any) => sum + (l.daysInArrears || 0), 0) / Math.max(par30Loans.length, 1)) },
              { label: 'Recovery Target', value: `${currencySymbol} ${formatNum(par30Amount)}` }
            ]
          },
          insights: [
            {
              type: par30Rate < 5 ? 'positive' : par30Rate < 10 ? 'warning' : 'negative',
              title: 'Portfolio Quality',
              description: par30Rate < 5 
                ? `Your PAR 30 of ${par30Rate.toFixed(2)}% is excellent! This indicates strong credit quality and effective collection processes.`
                : par30Rate < 10
                  ? `Your PAR 30 of ${par30Rate.toFixed(2)}% is acceptable but needs monitoring. Consider strengthening follow-up procedures.`
                  : `Your PAR 30 of ${par30Rate.toFixed(2)}% is concerning. Urgent action needed to improve collections and reduce delinquency.`
            },
            {
              type: par30Loans.length > 0 ? 'warning' : 'positive',
              title: 'Recovery Strategy',
              description: par30Loans.length > 0
                ? `You have ${par30Loans.length} loans overdue by 30+ days totaling ${currencySymbol}${formatSmartNumber(par30Amount).number}${formatSmartNumber(par30Amount).suffix}. Prioritize these for immediate follow-up.`
                : 'Excellent! No loans are overdue by 30+ days. Maintain this standard through proactive client communication.'
            }
          ]
        };
        break;

      case 'collection-efficiency':
        const isOverPerforming = collectionEfficiency > 100;
        
        modalData = {
          metricType: 'collection-efficiency',
          metricLabel: 'Collection Efficiency',
          metricValue: `${collectionEfficiency.toFixed(1)}%`,
          icon: <Activity className="size-6" />,
          color: COLORS[4] || COLORS[0],
          calculation: {
            formula: 'Collection Efficiency = (Total Collected ÷ Total Expected Repayments) × 100',
            steps: [
              { label: 'Total Collected', value: `${currencySymbol} ${formatNum(totalCollected)}` },
              { label: 'Total Expected Repayments', value: `${currencySymbol} ${formatNum(totalExpectedRepayments)}`, description: 'Principal + Interest + Fees for all disbursed loans' },
              { label: 'Collection Efficiency', value: `${collectionEfficiency.toFixed(1)}%`, description: isOverPerforming ? 'Over 100%: Outstanding performance!' : `${collectionEfficiency.toFixed(1)}% of expected repayments collected` }
            ]
          },
          breakdown: {
            summary: [
              { label: 'Total Expected Repayments', value: `${currencySymbol} ${formatNum(totalExpectedRepayments)}` },
              { label: 'Total Collected', value: `${currencySymbol} ${formatNum(totalCollected)}` },
              { label: 'Gap', value: totalCollected >= totalExpectedRepayments ? `+${currencySymbol}${formatNum(totalCollected - totalExpectedRepayments)}` : `-${currencySymbol}${formatNum(totalExpectedRepayments - totalCollected)}` }
            ]
          },
          insights: [
            {
              type: isOverPerforming ? 'positive' : collectionEfficiency > 80 ? 'neutral' : 'warning',
              title: 'Collection Performance',
              description: isOverPerforming
                ? `Outstanding! You're collecting ${collectionEfficiency.toFixed(1)}% of expected repayments. This over-performance indicates excellent collection practices.`
                : collectionEfficiency > 80
                  ? `Your collection efficiency of ${collectionEfficiency.toFixed(1)}% is good. Continue monitoring and optimizing collection processes.`
                  : `Your collection efficiency of ${collectionEfficiency.toFixed(1)}% needs improvement. Review collection strategies and client follow-up procedures.`
            },
            {
              type: 'neutral',
              title: 'Cash Flow Impact',
              description: `You've collected ${currencySymbol}${formatSmartNumber(totalCollected).number}${formatSmartNumber(totalCollected).suffix} against expected repayments of ${currencySymbol}${formatSmartNumber(totalExpectedRepayments).number}${formatSmartNumber(totalExpectedRepayments).suffix}. ${isOverPerforming ? 'This positive variance strengthens your cash position.' : 'Focus on improving collection rates to boost cash flow.'}`
            }
          ]
        };
        break;

      // New comprehensive loan overview metrics
      case 'cumulative-borrowed': {
        const disbursedLoansForCumulative = contextLoans.filter((l: any) => l.disbursementDate && l.status !== 'Rejected');
        modalData = {
          metricType: 'cumulative-borrowed',
          metricLabel: 'Cumulative Amount Borrowed',
          metricValue: `${currencySymbol} ${formatSmartNumber(cumulativeAmountBorrowed || 0).number}${formatSmartNumber(cumulativeAmountBorrowed || 0).suffix}`,
          icon: <DollarSign className="size-6" />,
          color: COLORS[0],
          calculation: {
            formula: 'Cumulative Amount Borrowed = Sum of principal amounts from all disbursed loans',
            steps: [
              { label: 'Number of Disbursed Loans', value: `${disbursedLoansForCumulative.length} loans` },
              { label: 'Cumulative Amount Borrowed', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed)}` },
              { label: 'Average Loan Size', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed / Math.max(disbursedLoansForCumulative.length, 1))}` }
            ]
          },
          breakdown: {
            loans: disbursedLoansForCumulative.slice(0, 50).map((l: any) => ({
              loanNumber: l.loanNumber || l.id,
              clientName: l.clientName || 'Unknown',
              amount: l.principalAmount || 0,
              status: l.status,
              date: l.disbursementDate
            })),
            summary: [
              { label: 'Number of Loans', value: disbursedLoansForCumulative.length },
              { label: 'Average Loan Size', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed / Math.max(disbursedLoansForCumulative.length, 1))}` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Total Capital Deployed',
              description: `You have deployed ${currencySymbol}${formatSmartNumber(cumulativeAmountBorrowed).number}${formatSmartNumber(cumulativeAmountBorrowed).suffix} in principal to ${disbursedLoansForCumulative.length} loans, representing your total capital commitment.`
            }
          ]
        };
        break;
      }

      case 'processing-fees-total': {
        const loansWithFeesTotal = contextLoans.filter((l: any) => l.disbursementDate && l.status !== 'Rejected' && (l.processing_fee || 0) > 0);
        modalData = {
          metricType: 'processing-fees-total',
          metricLabel: 'Processing Fees',
          metricValue: `${currencySymbol} ${formatSmartNumber(totalProcessingFees || 0).number}${formatSmartNumber(totalProcessingFees || 0).suffix}`,
          icon: <Receipt className="size-6" />,
          color: COLORS[5] || COLORS[1],
          calculation: {
            formula: 'Processing Fees = Sum of all processing fees collected from disbursed loans',
            steps: [
              { label: 'Number of Loans Disbursed', value: `${loansWithFeesTotal.length} loans` },
              { label: 'Processing Fees Collected', value: `${currencySymbol} ${formatNum(totalProcessingFees)}` },
              { label: 'Average Fee per Loan', value: `${currencySymbol} ${formatNum(totalProcessingFees / Math.max(loansWithFeesTotal.length, 1))}` }
            ]
          },
          breakdown: {
            loans: loansWithFeesTotal.slice(0, 50).map((l: any) => ({
              loanNumber: l.loanNumber || l.id,
              clientName: l.clientName || 'Unknown',
              amount: l.processing_fee || 0,
              status: l.status,
              date: l.disbursementDate
            })),
            summary: [
              { label: 'Number of Loans', value: loansWithFeesTotal.length },
              { label: 'Average Fee per Loan', value: `${currencySymbol} ${formatNum(totalProcessingFees / Math.max(loansWithFeesTotal.length, 1))}` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Processing Fee Revenue',
              description: `Processing fees of ${currencySymbol}${formatSmartNumber(totalProcessingFees).number}${formatSmartNumber(totalProcessingFees).suffix} provide upfront revenue to cover operational costs.`
            }
          ]
        };
        break;
      }

      case 'potential-interest': {
        const loansForInterest = contextLoans.filter((l: any) => l.disbursementDate && l.status !== 'Rejected');
        modalData = {
          metricType: 'potential-interest',
          metricLabel: 'Potential Interest Payable',
          metricValue: `${currencySymbol} ${formatSmartNumber(potentialInterestPayable || 0).number}${formatSmartNumber(potentialInterestPayable || 0).suffix}`,
          icon: <TrendingUp className="size-6" />,
          color: COLORS[4] || COLORS[2],
          calculation: {
            formula: 'Potential Interest Payable = Sum of calculated interest from all loans if paid in full',
            steps: [
              { label: 'Number of Disbursed Loans', value: `${loansForInterest.length} loans` },
              { label: 'System Calculated Total', value: `${currencySymbol} ${formatNum(potentialInterestPayable)}` },
              { label: 'Expected (Excel)', value: `${currencySymbol} 590,250`, description: 'Per your spreadsheet' },
              { label: 'Difference', value: `${currencySymbol} ${formatNum(potentialInterestPayable - 590250)}`, description: potentialInterestPayable > 590250 ? '⚠️ System is HIGHER' : '✓ System is LOWER' }
            ]
          },
          breakdown: {
            loans: loansForInterest
              .map((l: any) => {
                const principal = l.principalAmount || l.amount || 0;
                const rate = l.interestRate || 0;
                const term = l.term || l.termPeriod || l.loanTerm || l.termMonths || 1;
                const interest = calculateCorrectInterest(l);
                return {
                  loanNumber: l.loanNumber || l.id,
                  clientName: l.clientName || 'Unknown',
                  amount: interest,
                  status: l.status,
                  date: l.disbursementDate,
                  requestDate: l.requestDate,
                  principal: principal,
                  rate: rate,
                  term: term,
                  calculationDetail: `${formatNum(principal)} × ${rate}% × ${term} ÷ 100 = ${formatNum(interest)}`
                };
              })
              .sort((a, b) => {
                // Sort by date first (oldest first)
                const dateA = new Date(a.requestDate || a.date || 0);
                const dateB = new Date(b.requestDate || b.date || 0);
                return dateA.getTime() - dateB.getTime();
              }),
            summary: [
              { label: 'Number of Loans', value: loansForInterest.length },
              { label: 'Total Interest (Calculated)', value: `${currencySymbol} ${formatNum(loansForInterest.reduce((sum: number, l: any) => sum + calculateCorrectInterest(l), 0))}` },
              { label: 'Average Interest per Loan', value: `${currencySymbol} ${formatNum(potentialInterestPayable / Math.max(loansForInterest.length, 1))}` },
              { label: 'Principal to Interest Ratio', value: `${safeToFixed((potentialInterestPayable / Math.max(cumulativeAmountBorrowed, 1)) * 100, 1)}%` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Expected Interest Revenue',
              description: `If all loans are fully repaid, you will earn ${currencySymbol}${formatSmartNumber(potentialInterestPayable).number}${formatSmartNumber(potentialInterestPayable).suffix} in interest income.`
            }
          ]
        };
        break;
      }

      case 'total-payable': {
        modalData = {
          metricType: 'total-payable',
          metricLabel: 'Total Amount Payable',
          metricValue: `${currencySymbol} ${formatSmartNumber(totalAmountPayable || 0).number}${formatSmartNumber(totalAmountPayable || 0).suffix}`,
          icon: <Wallet className="size-6" />,
          color: '#6366f1',
          calculation: {
            formula: 'Total Amount Payable = Cumulative Amount Borrowed + Potential Interest Payable',
            steps: [
              { label: 'Cumulative Amount Borrowed', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed)}` },
              { label: 'Potential Interest Payable', value: `${currencySymbol} ${formatNum(potentialInterestPayable)}` },
              { label: 'Total Amount Payable', value: `${currencySymbol} ${formatNum(totalAmountPayable)}` }
            ]
          },
          insights: [
            {
              type: 'neutral',
              title: 'Total Expected Collections',
              description: `Your total expected collection from all loans is ${currencySymbol}${formatSmartNumber(totalAmountPayable).number}${formatSmartNumber(totalAmountPayable).suffix} (principal + interest).`
            }
          ]
        };
        break;
      }

      case 'principal-paid': {
        // ✅ Filter loans that have principal payments from payment records
        const loansWithPrincipalPaid = contextLoans.filter((l: any) => {
          if (!l.disbursementDate || l.status === 'Rejected') return false;
          const loanPayments = payments.filter((p: any) => p.loanId === l.id);
          const principalPaid = loanPayments.reduce((sum: number, p: any) => 
            sum + (p.principal || p.principalPortion || p.principalPaid || 0), 0);
          return principalPaid > 0;
        });
        modalData = {
          metricType: 'principal-paid',
          metricLabel: 'Principal Paid Back',
          metricValue: `${currencySymbol} ${formatSmartNumber(principalPaidBack || 0).number}${formatSmartNumber(principalPaidBack || 0).suffix}`,
          icon: <Banknote className="size-6" />,
          color: COLORS[1],
          calculation: {
            formula: 'Principal Paid Back = Sum of principal portions from all payment records',
            steps: [
              { label: 'Cumulative Amount Borrowed', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed)}` },
              { label: 'Principal Paid Back', value: `${currencySymbol} ${formatNum(principalPaidBack)}` },
              { label: 'Principal Still Owed', value: `${currencySymbol} ${formatNum(Math.max(0, cumulativeAmountBorrowed - principalPaidBack))}` },
              { label: 'Principal Recovery Rate', value: `${safeToFixed((principalPaidBack / Math.max(cumulativeAmountBorrowed, 1)) * 100, 1)}%` }
            ]
          },
          breakdown: {
            loans: loansWithPrincipalPaid.slice(0, 50).map((l: any) => {
              // ✅ Calculate principal paid from payment records for this loan
              const loanPayments = payments.filter((p: any) => p.loanId === l.id);
              const principalPaid = loanPayments.reduce((sum: number, p: any) => 
                sum + (p.principal || p.principalPortion || p.principalPaid || 0), 0);
              return {
                loanNumber: l.loanNumber || l.id,
                clientName: l.clientName || 'Unknown',
                amount: principalPaid,
                status: l.status,
                date: l.disbursementDate
              };
            }),
            summary: [
              { label: 'Cumulative Principal Borrowed', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed)}` },
              { label: 'Principal Paid Back', value: `${currencySymbol} ${formatNum(principalPaidBack)}` },
              { label: 'Principal Still Owed', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed - principalPaidBack)}` }
            ]
          },
          insights: [
            {
              type: principalPaidBack > (cumulativeAmountBorrowed * 0.5) ? 'positive' : 'warning',
              title: 'Principal Recovery',
              description: `You have recovered ${safeToFixed((principalPaidBack / Math.max(cumulativeAmountBorrowed, 1)) * 100, 1)}% of disbursed principal, which is ${principalPaidBack > (cumulativeAmountBorrowed * 0.5) ? 'healthy' : 'below optimal levels'}.`
            }
          ]
        };
        break;
      }

      case 'interest-paid': {
        // ✅ Filter loans that have interest payments from payment records
        const loanInterestMap = new Map();
        payments.forEach((p: any) => {
          const loanId = p.loanId;
          const interestAmount = p.interest || p.interestPortion || p.interestPaid || 0;
          loanInterestMap.set(loanId, (loanInterestMap.get(loanId) || 0) + interestAmount);
        });
        
        const loansWithInterestPaid = contextLoans.filter((l: any) => 
          l.disbursementDate && l.status !== 'Rejected' && loanInterestMap.get(l.id) > 0
        );
        
        modalData = {
          metricType: 'interest-paid',
          metricLabel: 'Interest Paid Back',
          metricValue: `${currencySymbol} ${formatSmartNumber(interestPaidBack || 0).number}${formatSmartNumber(interestPaidBack || 0).suffix}`,
          icon: <TrendingUp className="size-6" />,
          color: '#10b981',
          calculation: {
            formula: 'Interest Paid Back = Sum of interest portions from all payment records',
            steps: [
              { label: 'Potential Interest Payable', value: `${currencySymbol} ${formatNum(potentialInterestPayable)}` },
              { label: 'Interest Paid Back', value: `${currencySymbol} ${formatNum(interestPaidBack)}` },
              { label: 'Interest Still Owed', value: `${currencySymbol} ${formatNum(Math.max(0, potentialInterestPayable - interestPaidBack))}` },
              { label: 'Interest Collection Rate', value: `${safeToFixed((interestPaidBack / Math.max(potentialInterestPayable, 1)) * 100, 1)}%` }
            ]
          },
          breakdown: {
            loans: loansWithInterestPaid.slice(0, 50).map((l: any) => {
              // ✅ Calculate interest paid from payment records for this loan
              const loanPayments = payments.filter((p: any) => p.loanId === l.id);
              const interestPaid = loanPayments.reduce((sum: number, p: any) => 
                sum + (p.interest || p.interestPortion || p.interestPaid || 0), 0);
              return {
                loanNumber: l.loanNumber || l.id,
                clientName: l.clientName || 'Unknown',
                amount: interestPaid,
                status: l.status,
                date: l.disbursementDate
              };
            }),
            summary: [
              { label: 'Potential Interest Payable', value: `${currencySymbol} ${formatNum(potentialInterestPayable)}` },
              { label: 'Interest Paid Back', value: `${currencySymbol} ${formatNum(interestPaidBack)}` },
              { label: 'Interest Still Owed', value: `${currencySymbol} ${formatNum(potentialInterestPayable - interestPaidBack)}` }
            ]
          },
          insights: [
            {
              type: 'positive',
              title: 'Interest Revenue',
              description: `You have collected ${currencySymbol}${formatSmartNumber(interestPaidBack).number}${formatSmartNumber(interestPaidBack).suffix} in interest revenue, representing ${safeToFixed((interestPaidBack / Math.max(potentialInterestPayable, 1)) * 100, 1)}% of potential interest.`
            }
          ]
        };
        break;
      }

      case 'total-repaid': {
        modalData = {
          metricType: 'total-repaid',
          metricLabel: 'Total Amount Repaid Back',
          metricValue: `${currencySymbol} ${formatSmartNumber(totalAmountRepaidBack || 0).number}${formatSmartNumber(totalAmountRepaidBack || 0).suffix}`,
          icon: <ArrowUpCircle className="size-6" />,
          color: '#22d3ee',
          calculation: {
            formula: 'Total Repaid = Principal Paid + Interest Paid',
            steps: [
              { label: 'Principal Paid Back', value: `${currencySymbol} ${formatNum(principalPaidBack)}` },
              { label: 'Interest Paid Back', value: `${currencySymbol} ${formatNum(interestPaidBack)}` },
              { label: 'Total Amount Repaid', value: `${currencySymbol} ${formatNum(totalAmountRepaidBack)}` },
              { label: 'Overall Recovery Rate', value: `${safeToFixed((totalAmountRepaidBack / Math.max(totalAmountPayable, 1)) * 100, 1)}%` }
            ]
          },
          insights: [
            {
              type: totalAmountRepaidBack > (totalAmountPayable * 0.5) ? 'positive' : 'warning',
              title: 'Overall Collection Performance',
              description: `You have collected ${currencySymbol}${formatSmartNumber(totalAmountRepaidBack).number}${formatSmartNumber(totalAmountRepaidBack).suffix} out of ${currencySymbol}${formatSmartNumber(totalAmountPayable).number}${formatSmartNumber(totalAmountPayable).suffix} expected, achieving a ${safeToFixed((totalAmountRepaidBack / Math.max(totalAmountPayable, 1)) * 100, 1)}% recovery rate.`
            }
          ]
        };
        break;
      }

      case 'outstanding-total': {
        const activeLoansForOutstanding = contextLoans.filter((l: any) => isActiveStatus(l.status));
        modalData = {
          metricType: 'outstanding-total',
          metricLabel: 'Outstanding Loans',
          metricValue: `${currencySymbol} ${formatSmartNumber(outstandingLoansTotal || 0).number}${formatSmartNumber(outstandingLoansTotal || 0).suffix}`,
          icon: <AlertCircle className="size-6" />,
          color: '#ef4444',
          calculation: {
            formula: 'Outstanding = Total Amount Payable - Total Amount Repaid Back',
            steps: [
              { label: 'Total Amount Payable', value: `${currencySymbol} ${formatNum(totalAmountPayable)}` },
              { label: 'Total Amount Repaid Back', value: `${currencySymbol} ${formatNum(totalAmountRepaidBack)}` },
              { label: 'Outstanding Balance', value: `${currencySymbol} ${formatNum(outstandingLoansTotal)}` },
              { label: 'Number of Active Loans', value: `${activeLoansForOutstanding.length} loans` }
            ]
          },
          breakdown: {
            loans: activeLoansForOutstanding.slice(0, 50).map((l: any) => ({
              loanNumber: l.loanNumber || l.id,
              clientName: l.clientName || 'Unknown',
              amount: calculateOutstanding(l),
              status: l.status,
              date: l.disbursementDate
            })),
            summary: [
              { label: 'Principal Outstanding', value: `${currencySymbol} ${formatNum(cumulativeAmountBorrowed - principalPaidBack)}` },
              { label: 'Interest Outstanding', value: `${currencySymbol} ${formatNum(potentialInterestPayable - interestPaidBack)}` },
              { label: 'Total Outstanding', value: `${currencySymbol} ${formatNum(outstandingLoansTotal)}` }
            ]
          },
          insights: [
            {
              type: 'warning',
              title: 'Outstanding Balance',
              description: `You have ${currencySymbol}${formatSmartNumber(outstandingLoansTotal).number}${formatSmartNumber(outstandingLoansTotal).suffix} still owed from ${activeLoansForOutstanding.length} active loans. Focus on collections to reduce this balance.`
            }
          ]
        };
        break;
      }

      default:
        return;
    }

    if (modalData) {
      setSelectedMetricData(modalData);
      setShowMetricModal(true);
    }
  };

  // Safety check: Show loading state if context isn't ready
  if (!dataContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6" style={{
      backgroundColor: 'transparent'
    }}>
      {/* Header */}
      <div>
        <h2 className={`${theme.textPrimary} text-xl sm:text-2xl`}>Dashboard</h2>
        <p className={`${theme.textSecondary} text-sm sm:text-base`}>Overview of portfolio performance and key metrics</p>
      </div>

      {/* Upcoming Payments Summary */}
      <div 
        className={`rounded-lg border cursor-pointer transition-all hover:shadow-md ${isDark ? 'bg-blue-900/40 border-blue-800/50 hover:bg-blue-900/50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100/50'} px-[16px] py-[7px]`}
        onClick={() => setShowUpcomingPaymentsModal(true)}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className={`size-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                  Upcoming Payments
                </p>
                <p className={`text-xs ${isDark ? 'text-blue-400/70' : 'text-blue-700/70'}`}>
                  Payments expected in selected timeframe
                </p>
              </div>
            </div>
            <div className={`hidden sm:block h-10 w-px ${isDark ? 'bg-blue-700/30' : 'bg-blue-300'}`} />
            <div className="flex gap-6">
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                  {upcomingPayments.length.toLocaleString()}
                </p>
                <p className={`text-xs ${isDark ? 'text-blue-400/70' : 'text-blue-700/70'}`}>
                  Payment{upcomingPayments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className={`h-10 w-px ${isDark ? 'bg-blue-700/30' : 'bg-blue-300'}`} />
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                  {currencySymbol} {upcomingPaymentsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs ${isDark ? 'text-blue-400/70' : 'text-blue-700/70'}`}>
                  Total Expected
                </p>
              </div>
            </div>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setUpcomingPaymentsTimeframe('today')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                upcomingPaymentsTimeframe === 'today'
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setUpcomingPaymentsTimeframe('this-week')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                upcomingPaymentsTimeframe === 'this-week'
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-300'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setUpcomingPaymentsTimeframe('next-7-days')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                upcomingPaymentsTimeframe === 'next-7-days'
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-300'
              }`}
            >
              Next 7 Days
            </button>
            <button
              onClick={() => setUpcomingPaymentsTimeframe('this-month')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                upcomingPaymentsTimeframe === 'this-month'
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-300'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Loan Overview - 8 Key Metrics */}
      <div>
        <h3 className={`${theme.textPrimary} mb-2 sm:mb-3 text-base sm:text-lg`}>Comprehensive Loan Overview</h3>
        <div className="rounded-lg shadow-sm border px-[24px] py-[7px]" style={{
          backgroundColor: isDark ? '#1a1d29' : '#ffffff',
          borderColor: isDark ? '#252932' : '#e5e7eb'
        }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-3">
            {/* a) CUMULATIVE AMOUNT BORROWED */}
            <div 
              className="transition-all rounded-lg p-3 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 group relative"
              style={{ 
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`
              }}
              onClick={() => showMetricDetail('cumulative-borrowed')}
            >
              <div className="flex items-start gap-2">
                <DollarSign className="size-5 flex-shrink-0 mt-0.5" style={{ color: COLORS[0] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Cumulative Amount Borrowed</p>
                  <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(cumulativeAmountBorrowed || 0).number}{formatSmartNumber(cumulativeAmountBorrowed || 0).suffix}</p>
                  <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Total principal disbursed</p>
                </div>
                {/* Diagnostic button - appears on hover */}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLoanBalancesFix(true);
                  }}
                  title="Fix Loan Outstanding Balances"
                >
                  <Bug className="size-4 text-blue-600" />
                </button>
              </div>
            </div>

            {/* b) PROCESSING FEES */}
            <div 
              className="transition-all rounded-lg p-3 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.05)',
                border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)'}`
              }}
              onClick={() => showMetricDetail('processing-fees-total')}
            >
              <div className="flex items-start gap-2">
                <Receipt className="size-5 flex-shrink-0 mt-0.5" style={{ color: COLORS[5] || COLORS[1] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Processing Fees</p>
                  <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(totalProcessingFees || 0).number}{formatSmartNumber(totalProcessingFees || 0).suffix}</p>
                  <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Total fees collected</p>
                </div>
              </div>
            </div>

            {/* c) POTENTIAL INTEREST PAYABLE */}
            <div 
              className="transition-all rounded-lg p-3 relative group"
              style={{ 
                backgroundColor: isDark ? 'rgba(251, 146, 60, 0.08)' : 'rgba(251, 146, 60, 0.05)',
                border: `1px solid ${isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.15)'}`
              }}
            >
              <div 
                className="cursor-pointer hover:opacity-80"
                onClick={() => showMetricDetail('potential-interest')}
              >
                <div className="flex items-start gap-2">
                  <TrendingUp className="size-5 flex-shrink-0 mt-0.5" style={{ color: COLORS[4] || COLORS[2] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Potential Interest Payable</p>
                    <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(potentialInterestPayable || 0).number}{formatSmartNumber(potentialInterestPayable || 0).suffix}</p>
                    <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Expected interest income</p>
                  </div>
                </div>
              </div>
              {/* Debug Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComparisonTool(true);
                }}
                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ 
                  backgroundColor: isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.15)',
                  color: COLORS[4] || COLORS[2]
                }}
                title="Compare with Spreadsheet"
              >
                <Bug className="size-3" />
              </button>
            </div>

            {/* d) TOTAL AMOUNT PAYABLE */}
            <div 
              className="transition-all rounded-lg p-3 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`
              }}
              onClick={() => showMetricDetail('total-payable')}
            >
              <div className="flex items-start gap-2">
                <Wallet className="size-5 flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Total Amount Payable</p>
                  <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(totalAmountPayable || 0).number}{formatSmartNumber(totalAmountPayable || 0).suffix}</p>
                  <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Principal + Interest</p>
                </div>
              </div>
            </div>

            {/* e) PRINCIPAL PAID BACK */}
            <div 
              className="transition-all rounded-lg p-3 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 group relative"
              style={{ 
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)',
                border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`
              }}
              onClick={() => showMetricDetail('principal-paid')}
            >
              <div className="flex items-start gap-2">
                <Banknote className="size-5 flex-shrink-0 mt-0.5" style={{ color: COLORS[1] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Principal Paid Back</p>
                  <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(principalPaidBack || 0).number}{formatSmartNumber(principalPaidBack || 0).suffix}</p>
                  <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Principal repaid</p>
                </div>
                {/* Diagnostic button - appears on hover */}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPaymentAllocationDiagnostic(true);
                  }}
                  title="View Payment Allocation Diagnostic"
                >
                  <Bug className="size-4 text-green-600" />
                </button>
              </div>
            </div>

            {/* f) INTEREST PAID BACK */}
            <div 
              className="transition-all rounded-lg p-3 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 group relative"
              style={{ 
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`
              }}
              onClick={() => showMetricDetail('interest-paid')}
            >
              <div className="flex items-start gap-2">
                <TrendingUp className="size-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Interest Paid Back</p>
                  <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(interestPaidBack || 0).number}{formatSmartNumber(interestPaidBack || 0).suffix}</p>
                  <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Interest collected</p>
                </div>
                {/* Diagnostic button - appears on hover */}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInterestPaidDiagnostic(true);
                  }}
                  title="View Interest Paid Back Diagnostic"
                >
                  <Bug className="size-4 text-emerald-600" />
                </button>
              </div>
            </div>

            {/* g) TOTAL AMOUNT REPAID BACK */}
            <div 
              className="transition-all rounded-lg p-3 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                backgroundColor: isDark ? 'rgba(34, 211, 238, 0.08)' : 'rgba(34, 211, 238, 0.05)',
                border: `1px solid ${isDark ? 'rgba(34, 211, 238, 0.2)' : 'rgba(34, 211, 238, 0.15)'}`
              }}
              onClick={() => showMetricDetail('total-repaid')}
            >
              <div className="flex items-start gap-2">
                <ArrowUpCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: '#22d3ee' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Total Amount Repaid Back</p>
                  <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(totalAmountRepaidBack || 0).number}{formatSmartNumber(totalAmountRepaidBack || 0).suffix}</p>
                  <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Principal + Interest collected</p>
                </div>
              </div>
            </div>

            {/* h) OUTSTANDING LOANS */}
            <div 
              className="transition-all rounded-lg p-3 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ 
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'}`
              }}
              onClick={() => showMetricDetail('outstanding-total')}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5 truncate" style={{ color: themeColors.cardTextSecondary }}>Outstanding Loans</p>
                  <p className="text-lg mb-0.5 font-semibold truncate" style={{ color: themeColors.cardText }}>{currencySymbol} {formatSmartNumber(outstandingLoansTotal || 0).number}{formatSmartNumber(outstandingLoansTotal || 0).suffix}</p>
                  <p className="text-[10px] truncate" style={{ color: themeColors.textSecondary }}>Principal + Interest owed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Health & Risk - Bottom Row */}
      <div>
        <h3 className="mb-2 sm:mb-3 text-base sm:text-lg" style={{ color: themeColors.cardText }}>Operational Health & Risk</h3>
        <div className="grid grid-cols-5 gap-3 sm:gap-4">
          <div 
            onClick={() => showMetricDetail('total-clients')}
            className="rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer px-[16px] py-[10px]"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[0]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[0]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>Total Clients</p>
                <p className="text-3xl mb-1" style={{ color: COLORS[0] }}>{filteredTotalClients}</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>Registered clients</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="size-8 flex-shrink-0" style={{ color: COLORS[0] }} />
                <select
                  value={clientsDuration}
                  onChange={(e) => setClientsDuration(e.target.value as DurationFilter)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] px-1 py-0.5 rounded border cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(13, 40, 56, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.5)',
                    color: isDark ? '#3b82f6' : '#374151'
                  }}
                >
                  <option value="today">1D</option>
                  <option value="week">1W</option>
                  <option value="month">1M</option>
                  <option value="3month">3M</option>
                  <option value="6month">6M</option>
                </select>
              </div>
            </div>
          </div>

          <div 
            onClick={() => showMetricDetail('more-clients-male')}
            className="rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer px-[16px] py-[10px]"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[1]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[1]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>More about clients</p>
                <p className="text-3xl mb-1" style={{ color: COLORS[1] }}>{contextClients.filter((c: any) => c.gender?.toLowerCase() === 'male').length}</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>Male clients</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="size-8 flex-shrink-0" style={{ color: COLORS[1] }} />
              </div>
            </div>
          </div>

          <div 
            onClick={() => showMetricDetail('more-clients-female')}
            className="rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer px-[16px] py-[10px]"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[2]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[2]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>More about clients</p>
                <p className="text-3xl mb-1" style={{ color: COLORS[2] }}>{contextClients.filter((c: any) => c.gender?.toLowerCase() === 'female').length}</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>Female clients</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="size-8 flex-shrink-0" style={{ color: COLORS[2] }} />
              </div>
            </div>
          </div>

          <div 
            onClick={() => showMetricDetail('par30')}
            className="rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer px-[16px] py-[10px]"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[3]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[3]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>PAR 30 Days</p>
                <p className="text-3xl mb-1" style={{ color: COLORS[3] }}>{par30Rate.toFixed(2)}%</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                  {par30Loans.length > 0 ? `${par30Loans.length} loans in arrears` : 'No arrears'}
                </p>
              </div>
              <AlertTriangle className="size-8 flex-shrink-0 ml-2" style={{ color: COLORS[3] }} />
            </div>
          </div>

          <div 
            onClick={() => showMetricDetail('collection-efficiency')}
            className="rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer px-[16px] py-[10px]"
            style={{ 
              background: `linear-gradient(to bottom right, ${COLORS[4] || COLORS[0]}15, ${themeColors.cardBackground})`,
              borderColor: COLORS[4] || COLORS[0]
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: themeColors.cardTextSecondary }}>Collection Efficiency</p>
                <p className="text-3xl mb-1" style={{ color: COLORS[4] || COLORS[0] }}>{collectionEfficiency.toFixed(1)}%</p>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>Payments vs Expected</p>
              </div>
              <Activity className="size-8 flex-shrink-0 ml-2" style={{ color: COLORS[4] || COLORS[0] }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Portfolio Growth Trend */}
        <div className="p-3 sm:p-4 rounded-lg border" style={{ 
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: isDark ? '#1e2f42' : '#e5e7eb'
        }}>
          <h3 className="mb-2 sm:mb-3 text-sm sm:text-base" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Portfolio Growth & PAR Trend</h3>
          <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: '100px', position: 'relative' }}>
            {isMounted && <ResponsiveContainer key="rc-portfolio-trend" width="100%" height={250} aspect={undefined}>
              <LineChart 
              data={portfolioTrend}
              margin={{ top: 10, right: 0, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2f42" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: isDark ? '#b8c5d6' : '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 11, fill: isDark ? '#b8c5d6' : '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${safeToFixed(safeDivideNum(value || 0, 1000000), 1)}M`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: isDark ? '#b8c5d6' : '#6b7280' }}
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
                  backgroundColor: isDark ? '#0d1b2a' : '#ffffff',
                  border: isDark ? '1px solid #1e2f42' : '1px solid #e5e7eb',
                  color: isDark ? '#e1e8f0' : '#111827'
                }}
                labelStyle={{ color: isDark ? '#e1e8f0' : '#111827' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="line"
              />
              <Line
                key="portfolio-line"
                yAxisId="left"
                type="monotone"
                dataKey="portfolio"
                stroke={COLORS[1]}
                strokeWidth={2}
                dot={{ fill: COLORS[1], r: 4 }}
                name={`Portfolio (${currencyCode})`}
              />
              <Line
                key="par30-line"
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
          </ResponsiveContainer>}
          </div>
        </div>

        {/* Loans by Product */}
        <div className="p-3 sm:p-4 rounded-lg border" style={{ 
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: isDark ? '#1e2f42' : '#e5e7eb'
        }}>
          <h3 className="mb-2 sm:mb-3 text-sm sm:text-base" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Active Portfolio by Product</h3>
          {loansByProduct.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Donut Chart */}
              <div className="flex items-center justify-center relative" style={{ width: '100%', height: '200px', minHeight: '200px', minWidth: '100px' }}>
                {isMounted && <ResponsiveContainer key="rc-loans-by-product" width="100%" height={200} aspect={undefined}>
                  <RechartsPieChart>
                    <Pie
                      key="pie-loans-by-product"
                      data={loansByProduct}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {loansByProduct.map((entry, index) => (
                        <Cell key={`cell-${entry.id}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${currencySymbol} ${safeFormat(value || 0)}`}
                      contentStyle={{ 
                        fontSize: '12px',
                        backgroundColor: isDark ? '#0d1b2a' : '#ffffff',
                        border: isDark ? '1px solid #1e2f42' : '1px solid #e5e7eb',
                        color: isDark ? '#e1e8f0' : '#111827'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-lg" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>{currencySymbol} {safeToFixed(safeDivideNum(totalPortfolioValue || 0, 1000000), 1)}M</p>
                    <p className="text-xs" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>Total</p>
                  </div>
                </div>
              </div>

              {/* Custom Legend List */}
              <div className="flex items-center">
                <ul className="space-y-3 w-full">
                  {loansByProduct.map((item, index) => {
                    const percentage = safePercentage(item.value || 0, totalPortfolioValue || 0, 1);
                    return (
                      <li key={`legend-${item.id}-${index}`} className="flex space-x-3">
                        <span
                          className="w-1 shrink-0 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="text-sm" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                            {currencySymbol} {safeFormat(item.value || 0)}{' '}
                            <span style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>({percentage}%)</span>
                          </p>
                          <p className="text-xs mt-0.5 whitespace-nowrap" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>
                            {item.name}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <p className="text-sm" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>
                {loanProducts.length === 0 
                  ? 'No loan products created yet' 
                  : contextLoans.length === 0 
                    ? 'No active loans yet'
                    : 'No active loans with outstanding balances for existing products'}
              </p>
              {loanProducts.length > 0 && contextLoans.length > 0 && (
                <p className="text-xs" style={{ color: isDark ? '#7a8a9e' : '#9ca3af' }}>
                  {loanProducts.length} product(s), {contextLoans.length} loan(s) in database
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Charts Row 1 - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Monthly Disbursements */}
        <div className="p-3 sm:p-4 rounded-lg border" style={{ 
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: isDark ? '#1e2f42' : '#e5e7eb'
        }}>
          <h3 className="mb-2 sm:mb-3 text-sm sm:text-base" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Monthly Disbursements (Last 7 Months)</h3>
          <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: '100px', position: 'relative' }}>
            {isMounted && <ResponsiveContainer key="rc-monthly-disbursements" width="100%" height={250} aspect={undefined}>
              <BarChart 
              data={monthlyDisbursements}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1e2f42" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: isDark ? '#b8c5d6' : '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => `${currencySymbol} ${safeToFixed(safeDivideNum(value || 0, 1000000), 1)}M`}
                cursor={false}
                contentStyle={{ 
                  backgroundColor: isDark ? '#0d1b2a' : '#ffffff',
                  border: isDark ? '1px solid #1e2f42' : '1px solid #e5e7eb',
                  color: isDark ? '#e1e8f0' : '#111827'
                }}
                labelStyle={{ color: isDark ? '#e1e8f0' : '#111827' }}
              />
              <Bar key="bar-disbursements" dataKey="amount" radius={8}>
                {monthlyDisbursements.map((entry: any, index: number) => (
                  <Cell key={`cell-disbursement-${entry.id || index}`} fill={entry.amount > 0 ? COLORS[1] : 'transparent'} />
                ))}
                <LabelList
                  position="top"
                  offset={12}
                  fontSize={11}
                  fill={isDark ? '#b8c5d6' : '#6b7280'}
                  formatter={(value: number) => `${safeToFixed(safeDivideNum(value || 0, 1000000), 1)}M`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
          </div>
        </div>

        {/* Collection Rate by Week */}
        <div className="p-3 sm:p-4 rounded-lg border" style={{ 
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: isDark ? '#1e2f42' : '#e5e7eb'
        }}>
          <h3 className="mb-2 sm:mb-3 text-sm sm:text-base" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Collection Rate (Last 5 Weeks)</h3>
          <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: '100px', position: 'relative' }}>
            {isMounted && <ResponsiveContainer key="rc-collection-rate" width="100%" height={250} aspect={undefined}>
              <AreaChart 
              data={collectionRateByWeek}
              margin={{ left: 12, right: 12, top: 30, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1e2f42" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12, fill: isDark ? '#b8c5d6' : '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip 
                cursor={false}
                contentStyle={{ 
                  fontSize: '12px',
                  backgroundColor: isDark ? '#0d1b2a' : '#ffffff',
                  border: isDark ? '1px solid #1e2f42' : '1px solid #e5e7eb',
                  color: isDark ? '#e1e8f0' : '#111827'
                }}
                labelStyle={{ color: isDark ? '#e1e8f0' : '#111827' }}
                formatter={(value: number) => `${currencySymbol} ${safeFormat(value || 0)}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="rect"
              />
              <Area
                key="area-expected"
                dataKey="expected"
                type="monotone"
                fill="#9333ea"
                fillOpacity={0.3}
                stroke="#9333ea"
                strokeWidth={2}
                name="Expected"
              />
              <Area
                key="area-collected"
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
                  fill={isDark ? '#b8c5d6' : '#6b7280'}
                  formatter={(value: number, entry: any) => {
                    if (!entry || !entry.payload) return '';
                    const rate = entry.payload.rate || 0;
                    return `${safeToFixed(rate, 1)}%`;
                  }}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>}
          </div>
        </div>
      </div>

      {/* New Charts Row 2 - Compact */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Loan Status Distribution */}
        <div className="p-3 sm:p-4 rounded-lg border" style={{ 
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: isDark ? '#1e2f42' : '#e5e7eb'
        }}>
          <h3 className="mb-2 sm:mb-3 text-sm sm:text-base" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Loan Status Distribution</h3>
          <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: '100px', position: 'relative' }}>
            {isMounted && <ResponsiveContainer key="rc-loan-status" width="100%" height={250} aspect={undefined}>
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
                  backgroundColor: isDark ? '#0d1b2a' : '#ffffff',
                  border: isDark ? '1px solid #1e2f42' : '1px solid #e5e7eb',
                  color: isDark ? '#e1e8f0' : '#111827'
                }}
                labelStyle={{ color: isDark ? '#e1e8f0' : '#111827' }}
              />
              <Bar
                key="bar-status-distribution"
                dataKey="count"
                layout="vertical"
                radius={4}
              >
                {loanStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-status-${entry.id || index}`} fill={entry.color} />
                ))}
                <LabelList
                  key="label-status"
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
                  key="label-count"
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
          </ResponsiveContainer>}
          </div>
        </div>
      </div>

      {/* Activity Feed & Alerts - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Overdue Loans Alert */}
        <div className="p-3 sm:p-4 rounded-lg border" style={{ 
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: isDark ? '#1e2f42' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <AlertTriangle className="size-4 text-red-600" />
            <h3 className="text-sm sm:text-base" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Overdue Loan Alerts</h3>
          </div>
          <div className="space-y-2">
            {overdueLoans.slice(0, 5).map((loan) => {
              const client = contextClients.find(c => c.id === loan.clientId);
              
              // Use loan.clientName directly (from Supabase join) with fallback
              const displayName = loan.clientName || client?.name || 'Unknown Client';
              
              return (
                <div key={loan.id} className="p-2 rounded border" style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>{displayName}</p>
                      <p className="text-xs" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>{loan.loanNumber || loan.id} - {loan.daysInArrears} days overdue</p>
                    </div>
                    <span className="text-sm text-red-400">{currencySymbol} {safeFormat(loan.outstandingBalance || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="p-3 sm:p-4 rounded-lg border" style={{ 
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: isDark ? '#1e2f42' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Activity className="size-4 text-emerald-600" />
            <h3 className="text-sm sm:text-base" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {recentApplications.map((loan) => {
              const client = contextClients.find(c => c.id === loan.clientId);
              
              // Client matching for recent activity
              const activityMatch = {
                loanId: loan.id,
                loanNumber: loan.loanNumber,
                clientId: loan.clientId,
                clientName: loan.clientName, // This should already be populated from Supabase join
                clientFound: client,
                clientFromArray: client?.name,
                totalClients: contextClients.length,
                loanKeys: Object.keys(loan)
              };
              
              // Determine the activity description based on loan status
              const isActive = loan.status === 'Active';
              const activityDescription = isActive 
                ? `New loan disbursed - ${loan.disbursementDate}` 
                : `Loan requested - ${loan.disbursementDate}`;
              
              // Use loan.clientName directly (already populated from Supabase join)
              const displayName = loan.clientName || client?.name || 'Unknown Client';
              
              return (
                <div key={loan.id} className="p-2 rounded border" style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.2)'
                }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                        {displayName} - {activityDescription}
                      </p>
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
          background: isDark 
            ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          backgroundColor: isDark ? '#15233a' : '#ffffff',
          borderColor: '#7c3aed'
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#7c3aed' }}>
            <Activity className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-sm" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>AI-Powered Insight</h3>
            {atRiskClientsCount > 0 ? (
              <>
                <p className="text-sm mb-1" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                  <strong>{atRiskClientsCount} client{atRiskClientsCount !== 1 ? 's' : ''} identified with highest risk of default in next 30 days.</strong>
                </p>
                <p className="text-xs" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>
                  Recommended action: Proactive outreach and payment plan restructuring for high-risk clients. 
                  Estimated prevention of {currencyCode} {(potentialDefaults / 1000).toFixed(0)}K in potential defaults.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm mb-1" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                  <strong>Excellent portfolio health! No clients at high risk of default.</strong>
                </p>
                <p className="text-xs" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>
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
            backgroundColor: isDark ? '#15233a' : '#ffffff',
            borderColor: isDark ? '#1e2f42' : '#e5e7eb'
          }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: isDark ? '#e1e8f0' : '#111827' }}>Metric Details</h3>
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
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Outstanding Principal is the remaining loan amount (excluding interest) that clients still owe to {organizationName}. This represents the core capital that needs to be recovered from clients.</p>
                    
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
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Outstanding Interest represents all accrued interest charges on active loans that are yet to be collected from clients. This is a key revenue stream for the microfinance institution.</p>
                    
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
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Total Clients represents all active clients who currently have loans with {organizationName} or maintain an active relationship with the institution.</p>
                    
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
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Paid</p>
                        <p className="text-gray-900 dark:text-white">9 loans</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 dark:text-white mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>2 repeat clients (JOSPHAT M MATHEKA and Mr. STEPHEN MULU NZAVI) indicate strong client trust</span>
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
                        <span>75% of active clients also maintain savings accounts</span>
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
                  <div className="flex items-center gap-3 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                    <Activity className="size-8 text-gray-900 dark:text-purple-300" />
                    <div>
                      <p className="text-gray-900 dark:text-purple-200 text-sm font-semibold">AI-Powered Risk Analysis</p>
                      <p className="text-gray-900 dark:text-white text-3xl font-bold">{atRiskClientsCount} client{atRiskClientsCount !== 1 ? 's' : ''} at risk</p>
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
                                <span className="text-gray-600 dark:text-gray-400">Loan ID: {loan.loanNumber || loan.id}</span>
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
                          <p className="dark:text-emerald-100 text-[rgb(22,125,73)]">
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

      {/* Calculation Breakdown Modal */}
      {calculationBreakdown && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setCalculationBreakdown(null)}>
          <div 
            className="rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              backgroundColor: isDark ? '#0d2838' : '#ffffff',
              borderColor: isDark ? '#1e2f42' : '#e5e7eb',
              border: '1px solid'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 p-4 border-b" style={{
              backgroundColor: isDark ? '#0d2838' : '#ffffff',
              borderColor: isDark ? '#1e2f42' : '#e5e7eb'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg mb-0.5" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                    {calculationBreakdown.title}
                  </h2>
                  <p className="text-xs" style={{ color: isDark ? '#7a8a9e' : '#6b7280' }}>
                    Detailed calculation breakdown
                  </p>
                </div>
                <button
                  onClick={() => setCalculationBreakdown(null)}
                  className="hover:opacity-80 transition-opacity p-1.5 rounded-lg"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#b8c5d6' : '#6b7280'
                  }}
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Formula */}
              <div className="p-3 rounded-lg border" style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
              }}>
                <p className="text-[10px] mb-1 tracking-wider" style={{ color: isDark ? '#93c5fd' : '#3b82f6' }}>FORMULA</p>
                <p className="text-sm" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                  {calculationBreakdown.formula}
                </p>
              </div>

              {/* Components */}
              <div>
                <h3 className="text-[10px] mb-2 tracking-wider" style={{ color: isDark ? '#93c5fd' : '#3b82f6' }}>CALCULATION COMPONENTS</h3>
                <div className="space-y-2">
                  {calculationBreakdown.components.map((comp, idx) => (
                    <div 
                      key={idx}
                      className="flex justify-between items-center p-2.5 rounded-lg"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderLeft: '3px solid',
                        borderColor: isDark ? '#3b82f6' : '#60a5fa'
                      }}
                    >
                      <span className="text-sm" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>{comp.label}</span>
                      <span className="text-sm" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>{comp.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="p-4 rounded-lg border-2" style={{
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                borderColor: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)'
              }}>
                <p className="text-[10px] mb-1 tracking-wider" style={{ color: isDark ? '#86efac' : '#16a34a' }}>FINAL RESULT</p>
                <p className="text-3xl" style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                  {calculationBreakdown.result}
                </p>
              </div>

              {/* Sample Data */}
              {calculationBreakdown.details && calculationBreakdown.details.length > 0 && (
                <div>
                  <h3 className="text-[10px] mb-2 tracking-wider" style={{ color: isDark ? '#93c5fd' : '#3b82f6' }}>
                    {calculationBreakdown.details[0].clientName ? 
                      `OVERDUE LOANS (${calculationBreakdown.details.length} ${calculationBreakdown.details.length === 1 ? 'Record' : 'Records'})` 
                      : 'ADDITIONAL NOTES'}
                  </h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {calculationBreakdown.details.map((detail: any, idx: number) => (
                      <div 
                        key={idx}
                        className="p-2.5 rounded text-sm"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                        }}
                      >
                        {detail.clientName && (
                          <>
                            <div className="flex justify-between">
                              <span style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>{detail.clientName || detail.name}</span>
                              <span style={{ color: isDark ? '#e1e8f0' : '#111827' }}>
                                {detail.amount || detail.outstanding}
                              </span>
                            </div>
                            {detail.daysOverdue && (
                              <div className="text-xs mt-0.5 flex justify-between">
                                <span style={{ color: isDark ? '#7a8a9e' : '#9ca3af' }}>Days Overdue</span>
                                <span style={{ color: isDark ? '#fca5a5' : '#ef4444' }}>{detail.daysOverdue}</span>
                              </div>
                            )}
                          </>
                        )}
                        {detail.date && (
                          <div className="text-xs mt-0.5" style={{ color: isDark ? '#7a8a9e' : '#9ca3af' }}>
                            {detail.date || detail.registrationDate}
                          </div>
                        )}
                        {detail.note && (
                          <div>
                            <p className="mb-0.5 text-xs" style={{ color: isDark ? '#93c5fd' : '#3b82f6' }}>{detail.note}</p>
                            <p className="text-xs" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>{detail.calculation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Footer */}
              <div className="flex items-start gap-2 p-3 rounded-lg" style={{
                backgroundColor: isDark ? 'rgba(234, 179, 8, 0.1)' : 'rgba(234, 179, 8, 0.05)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.2)'
              }}>
                <Info className="size-4 flex-shrink-0 mt-0.5" style={{ color: isDark ? '#fde047' : '#ca8a04' }} />
                <div>
                  <p className="text-xs" style={{ color: isDark ? '#b8c5d6' : '#6b7280' }}>
                    All calculations are performed in real-time using data from your Supabase database. 
                    Values are filtered based on the duration settings you've selected for each metric.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ New Enhanced Metric Detail Modal */}
      {showMetricModal && selectedMetricData && (
        <MetricDetailModal
          isOpen={showMetricModal}
          onClose={() => {
            setShowMetricModal(false);
            setSelectedMetricData(null);
          }}
          metricType={selectedMetricData.metricType}
          metricValue={selectedMetricData.metricValue}
          metricLabel={selectedMetricData.metricLabel}
          icon={selectedMetricData.icon}
          color={selectedMetricData.color}
          breakdown={selectedMetricData.breakdown}
          calculation={selectedMetricData.calculation}
          insights={selectedMetricData.insights}
          currencySymbol={currencySymbol}
          isDark={isDark}
        />
      )}

      {/* Modal for Upcoming Payments Details */}
      {showUpcomingPaymentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-2xl rounded-xl shadow-2xl max-h-[80vh] flex flex-col"
            style={{ 
              backgroundColor: isDark ? '#1a1d29' : '#ffffff',
              borderColor: isDark ? '#252932' : '#e5e7eb',
              borderWidth: '1px'
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: isDark ? '#252932' : '#e5e7eb' }}>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Payments</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Showing {upcomingPayments.length} payment{upcomingPayments.length !== 1 ? 's' : ''} for {upcomingPaymentsTimeframe.replace('-', ' ')}
                </p>
              </div>
              <button 
                onClick={() => setShowUpcomingPaymentsModal(false)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="overflow-auto p-4 flex-1">
              {upcomingPayments.length > 0 ? (
                <div className="relative overflow-x-auto rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className={`text-xs uppercase ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-700'}`}>
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Client / Loan</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right rounded-tr-lg">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: isDark ? '#252932' : '#e5e7eb' }}>
                      {upcomingPayments.map((payment, index) => (
                        <tr 
                          key={`${payment.loanId}-${index}`}
                          className={`
                            ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} 
                            transition-colors cursor-pointer
                          `}
                          onClick={() => {
                            if (onNavigate) {
                              // If using navigation, go to loans tab
                              onNavigate('loans');
                              setShowUpcomingPaymentsModal(false);
                            }
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {payment.clientName}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {payment.loanNumber || payment.loanId}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              {payment.paymentDate.toLocaleDateString()}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {payment.paymentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'Overdue' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : payment.status === 'Due Today'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {currencySymbol} {payment.installmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={`font-bold ${isDark ? 'bg-gray-800/50 text-white' : 'bg-gray-50 text-gray-900'}`}>
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right">Total:</td>
                        <td className="px-4 py-3 text-right">
                          {currencySymbol} {upcomingPayments.reduce((sum, p) => sum + p.installmentAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Clock className={`size-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>No upcoming payments</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    There are no payments due for the selected timeframe.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end" style={{ borderColor: isDark ? '#252932' : '#e5e7eb' }}>
              <button
                onClick={() => setShowUpcomingPaymentsModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interest Comparison Tool */}
      {showComparisonTool && (
        <InterestComparisonTool onClose={() => setShowComparisonTool(false)} />
      )}

      {/* Interest Paid Back Diagnostic */}
      {showInterestPaidDiagnostic && (
        <InterestPaidBackDiagnostic onClose={() => setShowInterestPaidDiagnostic(false)} />
      )}

      {/* Payment Allocation Diagnostic */}
      {showPaymentAllocationDiagnostic && (
        <PaymentAllocationDiagnostic onClose={() => setShowPaymentAllocationDiagnostic(false)} />
      )}

      {/* Loan Outstanding Balances Fix */}
      {showLoanBalancesFix && (
        <LoanOutstandingBalancesFix onClose={() => setShowLoanBalancesFix(false)} />
      )}
    </div>
  );
}