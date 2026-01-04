import { useState } from 'react';
import { FileText, Download, Printer, Calendar, TrendingUp, DollarSign, Users, Shield, BarChart3, Building2, ClipboardCheck, FileCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CollectionsReport } from '../reports/CollectionsReport';
import { CashFlowReport } from '../reports/CashFlowReport';
import { ProfitLossReport } from '../reports/ProfitLossReport';
import { PARReport } from '../reports/PARReport';
import { BalanceSheetReport } from '../reports/BalanceSheetReport';
import { IncomeStatementReport } from '../reports/IncomeStatementReport';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { TrialBalanceReport } from '../reports/TrialBalanceReport';
import { RegulatoryReport } from '../reports/RegulatoryReport';
import { ManagementReport } from '../reports/ManagementReport';
import { useData } from '../../contexts/DataContext';

type CategoryType = 'portfolio' | 'financial' | 'operational';
type ReportType = 'collections' | 'cashflow' | 'profitloss' | 'par' | 'balancesheet' | 'incomestatement' | 'trialbalance' | 'management' | 'loanofficer';

interface ReportConfig {
  id: ReportType;
  name: string;
  permission: string;
}

interface CategoryConfig {
  id: CategoryType;
  name: string;
  icon: any;
  description: string;
  color: string;
  reports: ReportConfig[];
}

export function ReportsTab() {
  const { isDark } = useTheme();
  const { hasPermission } = useAuth();
  const currencyCode = getCurrencyCode();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('portfolio');
  const [activeReport, setActiveReport] = useState<ReportType>('par');
  
  // Calculate date range for last 6 months
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  const categories: CategoryConfig[] = [
    {
      id: 'portfolio',
      name: 'Portfolio Analytics',
      icon: TrendingUp,
      description: 'Loan performance and risk metrics',
      color: 'blue',
      reports: [
        { id: 'par', name: 'Portfolio at Risk (PAR)', permission: 'viewPortfolioReport' },
        { id: 'collections', name: 'Collections Report', permission: 'viewCollectionReport' },
        { id: 'management', name: 'Loan Performance', permission: 'viewLoanPerformanceReport' },
      ]
    },
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: DollarSign,
      description: 'Accounting and statutory reports',
      color: 'emerald',
      reports: [
        { id: 'balancesheet', name: 'Balance Sheet', permission: 'viewFinancialReport' },
        { id: 'incomestatement', name: 'Income Statement', permission: 'viewFinancialReport' },
        { id: 'profitloss', name: 'Profit & Loss', permission: 'viewFinancialReport' },
        { id: 'cashflow', name: 'Cash Flow Statement', permission: 'viewFinancialReport' },
        { id: 'trialbalance', name: 'Trial Balance', permission: 'viewFinancialReport' },
      ]
    },
    {
      id: 'operational',
      name: 'Operational Reports',
      icon: BarChart3,
      description: 'Daily operations and management',
      color: 'purple',
      reports: [
        { id: 'management', name: 'Management Dashboard', permission: 'viewLoanPerformanceReport' },
        { id: 'loanofficer', name: 'Loan Officer Performance', permission: 'viewLoanPerformanceReport' },
      ]
    }
  ];

  // Calculate quick stats from dummyData - only count active/disbursed loans
  const { loans, payments } = useData();
  const activeDisbursedLoans = loans.filter(loan => loan.status === 'Active' || loan.status === 'Disbursed');
  const totalLoans = activeDisbursedLoans.length;
  const totalDisbursed = activeDisbursedLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const overdueLoans = activeDisbursedLoans.filter(loan => loan.status === 'In Arrears');
  const parPercentage = totalDisbursed > 0 ? ((overdueLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0) / totalDisbursed) * 100) : 0;

  // Filter categories and reports based on permissions
  const filteredCategories = categories.map(category => ({
    ...category,
    reports: category.reports.filter(report => hasPermission(report.permission as any))
  })).filter(category => category.reports.length > 0);

  // Set initial category and report to first available
  useState(() => {
    if (filteredCategories.length > 0) {
      const firstCategory = filteredCategories[0];
      if (!filteredCategories.find(c => c.id === activeCategory)) {
        setActiveCategory(firstCategory.id);
      }
      const currentCategory = filteredCategories.find(c => c.id === activeCategory) || firstCategory;
      if (currentCategory.reports.length > 0 && !currentCategory.reports.find(r => r.id === activeReport)) {
        setActiveReport(currentCategory.reports[0].id);
      }
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // In a real app, this would use a library like jsPDF or html2pdf
    window.print();
  };

  const handleCategoryChange = (categoryId: CategoryType) => {
    setActiveCategory(categoryId);
    const category = filteredCategories.find(c => c.id === categoryId);
    if (category && category.reports.length > 0) {
      setActiveReport(category.reports[0].id);
    }
  };

  const renderReport = () => {
    const reportProps = { dateRange };

    switch (activeReport) {
      case 'collections':
        return <CollectionsReport {...reportProps} />;
      case 'cashflow':
        return <CashFlowReport {...reportProps} />;
      case 'profitloss':
        return <ProfitLossReport {...reportProps} />;
      case 'par':
        return <PARReport {...reportProps} />;
      case 'balancesheet':
        return <BalanceSheetReport {...reportProps} />;
      case 'incomestatement':
        return <IncomeStatementReport {...reportProps} />;
      case 'trialbalance':
        return <TrialBalanceReport {...reportProps} />;
      case 'regulatory':
        return <RegulatoryReport {...reportProps} />;
      case 'management':
        return <ManagementReport {...reportProps} />;
      case 'loanofficer':
        return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loan Officer Performance Report - Coming Soon</div>;
      default:
        return null;
    }
  };

  const currentCategory = filteredCategories.find(c => c.id === activeCategory);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Controls - No Print */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 print:hidden flex-shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-white">Reports & Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Financial reports and portfolio analytics</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-600 dark:text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              />
              <span className="text-gray-600 dark:text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              />
            </div>
            {/* Export & Print Buttons */}
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Download className="size-4" />
              Export PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
            >
              <Printer className="size-4" />
              Print
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Loans</p>
                <p className="text-gray-900 dark:text-white text-2xl">{totalLoans}</p>
              </div>
              <div className="size-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="size-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Disbursed</p>
                <p className="text-gray-900 dark:text-white text-2xl">{currencyCode} {(totalDisbursed / 1000000).toFixed(1)}M</p>
              </div>
              <div className="size-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="size-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Collections</p>
                <p className="text-gray-900 dark:text-white text-2xl">{currencyCode} {(totalCollected / 1000000).toFixed(2)}M</p>
              </div>
              <div className="size-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="size-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">PAR %</p>
                <p className="text-gray-900 dark:text-white text-2xl">{parPercentage.toFixed(1)}%</p>
              </div>
              <div className="size-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="size-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Categories */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 space-y-3 overflow-y-auto print:hidden flex-shrink-0">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? `border-${category.color}-500 bg-${category.color}-50 dark:bg-${category.color}-900/20`
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? `bg-${category.color}-100 dark:bg-${category.color}-900/40`
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Icon className={`size-5 ${
                      isActive ? `text-${category.color}-600` : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm mb-1 ${
                      isActive ? `text-${category.color}-900 dark:text-${category.color}-100` : 'text-gray-900 dark:text-white'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-xs ${
                      isActive ? `text-${category.color}-700 dark:text-${category.color}-300` : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {category.description}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isActive ? `text-${category.color}-600 dark:text-${category.color}-400` : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {category.reports.length} report{category.reports.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-Report Tabs */}
          {currentCategory && currentCategory.reports.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 print:hidden flex-shrink-0">
              <div className="dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 overflow-x-auto bg-[rgb(17,17,32)]">
                <div className="flex gap-1 min-w-max">
                  {currentCategory.reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      className="relative px-4 py-2.5 whitespace-nowrap transition-all text-sm"
                    >
                      <span className={`transition-colors ${
                        activeReport === report.id
                          ? 'text-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}>
                        {report.name}
                      </span>
                      {activeReport === report.id && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Report Content */}
          <div className="flex-1 overflow-y-auto dark:bg-gray-900 bg-[rgb(17,17,32)]">
            <div className="report-print-area">
              {renderReport()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}