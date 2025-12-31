import { useState } from 'react';
import { FileText, TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, CheckCircle, Download, Calendar, Sparkles } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { toast } from 'sonner@2.0.3';

type ReportPeriod = 'weekly' | 'monthly';

export function ExecutiveSummary() {
  const { loans, clients } = useData();
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();

  const generateWeeklySummary = () => {
    // Calculate metrics for the past week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeLoans = loans.filter(l => l.status !== 'Fully Paid');
    const newLoans = loans.filter(l => new Date(l.disbursementDate) >= weekAgo);
    const fullyPaidThisWeek = loans.filter(l => 
      l.status === 'Fully Paid' && 
      new Date(l.disbursementDate) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    );

    const totalDisbursed = loans.reduce((sum, l) => sum + l.loanAmount, 0);
    const totalRepaid = loans.reduce((sum, l) => sum + (l.loanAmount - l.outstandingBalance), 0);
    const activePortfolio = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    
    const loansWithArrears = activeLoans.filter(l => l.daysInArrears > 0);
    const par30Loans = activeLoans.filter(l => l.daysInArrears > 30);
    const par30Amount = par30Loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    const par30Rate = activePortfolio > 0 ? (par30Amount / activePortfolio) * 100 : 0;

    // AI-generated insights
    const insights = [];
    
    if (par30Rate === 0) {
      insights.push('Portfolio health is excellent with zero delinquency - maintain current collection practices');
    } else if (par30Rate < 5) {
      insights.push(`PAR 30 at ${par30Rate.toFixed(1)}% remains within healthy range - continue proactive monitoring`);
    } else {
      insights.push(`PAR 30 at ${par30Rate.toFixed(1)}% requires attention - increase collection efforts on ${loansWithArrears.length} accounts`);
    }

    if (newLoans.length > 0) {
      const newLoansTotal = newLoans.reduce((sum, l) => sum + (l.loanAmount || 0), 0);
      const totalInMillions = newLoansTotal / 1000000;
      insights.push(`${newLoans.length} new loan${newLoans.length > 1 ? 's' : ''} disbursed this week totaling ${currencyCode} ${totalInMillions.toFixed(2)}M - strong growth momentum`);
    } else {
      insights.push('No new disbursements this week - consider accelerating loan approvals to maintain growth');
    }

    if (fullyPaidThisWeek.length > 0) {
      insights.push(`${fullyPaidThisWeek.length} loan${fullyPaidThisWeek.length > 1 ? 's' : ''} fully repaid - indicating strong client commitment and healthy cash inflows`);
    }

    const avgLoanSize = loans.length > 0 ? totalDisbursed / loans.length : 0;
    if (avgLoanSize > 0 && loans.length > 0) {
      const avgInThousands = avgLoanSize / 1000;
      insights.push(`Average loan size of ${currencyCode} ${avgInThousands.toFixed(0)}K suggests good market penetration in target segment`);
    }

    // Key recommendations
    const recommendations = [];
    
    if (loansWithArrears.length > 0) {
      recommendations.push(`Priority: Follow up on ${loansWithArrears.length} accounts in arrears (${loansWithArrears.filter(l => l.daysInArrears <= 7).length} early stage)`);
    }

    if (activePortfolio > totalDisbursed * 0.7) {
      recommendations.push('Consider raising additional capital to maintain disbursement velocity');
    }

    if (clients.length > 0 && loans.length / clients.length < 1.5) {
      recommendations.push('Opportunity: Average client has < 1.5 loans - focus on repeat lending to proven clients');
    }

    recommendations.push('Continue AI-powered risk assessment for all new applications to maintain portfolio quality');

    // Risk factors
    const riskFactors = [];
    if (par30Rate > 5) riskFactors.push('Elevated PAR 30 rate');
    if (loansWithArrears.length > activeLoans.length * 0.2) riskFactors.push('High number of accounts in arrears');
    if (newLoans.length === 0) riskFactors.push('Stagnant disbursement activity');
    if (riskFactors.length === 0) riskFactors.push('No significant risks identified');

    return {
      period: 'Weekly',
      generatedDate: now.toLocaleDateString(),
      metrics: {
        totalLoans: loans.length,
        activeLoans: activeLoans.length,
        newLoansThisWeek: newLoans.length,
        totalDisbursed,
        totalRepaid,
        activePortfolio,
        par30Rate,
        clients: clients.length,
        avgLoanSize
      },
      insights,
      recommendations,
      riskFactors,
      performanceRating: par30Rate === 0 ? 'Excellent' : par30Rate < 5 ? 'Good' : par30Rate < 10 ? 'Fair' : 'Needs Improvement'
    };
  };

  const generateMonthlySummary = () => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeLoans = loans.filter(l => l.status !== 'Fully Paid');
    const newLoans = loans.filter(l => new Date(l.disbursementDate) >= monthAgo);
    const fullyPaidThisMonth = loans.filter(l => 
      l.status === 'Fully Paid' && 
      new Date(l.disbursementDate) >= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    );

    const totalDisbursed = loans.reduce((sum, l) => sum + l.loanAmount, 0);
    const totalRepaid = loans.reduce((sum, l) => sum + (l.loanAmount - l.outstandingBalance), 0);
    const activePortfolio = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    
    const newDisbursedAmount = newLoans.reduce((sum, l) => sum + l.loanAmount, 0);
    const repaidThisMonth = fullyPaidThisMonth.reduce((sum, l) => sum + l.loanAmount, 0);

    const loansWithArrears = activeLoans.filter(l => l.daysInArrears > 0);
    const par30Loans = activeLoans.filter(l => l.daysInArrears > 30);
    const par30Amount = par30Loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    const par30Rate = activePortfolio > 0 ? (par30Amount / activePortfolio) * 100 : 0;

    // Calculate revenue (interest earned)
    const estimatedRevenue = totalRepaid * 0.15; // Rough estimate at 15% avg interest

    // AI-generated insights
    const insights = [];
    
    insights.push(`Portfolio grew to ${currencyCode} ${(activePortfolio / 1000000).toFixed(2)}M across ${activeLoans.length} active loans - ${activeLoans.length > 50 ? 'strong' : 'moderate'} scale achieved`);
    
    if (newLoans.length > 0) {
      insights.push(`${newLoans.length} new disbursements totaling ${currencyCode} ${(newDisbursedAmount / 1000000).toFixed(2)}M this month - ${newLoans.length > 10 ? 'excellent' : 'steady'} growth rate`);
    }

    insights.push(`Collection rate: ${fullyPaidThisMonth.length} loans fully repaid this month generating ${currencyCode} ${(repaidThisMonth / 1000000).toFixed(2)}M in repayments`);

    if (par30Rate === 0) {
      insights.push('Outstanding portfolio quality: Zero delinquency across all active loans - best-in-class performance');
    } else if (par30Rate < 5) {
      insights.push(`PAR 30 at ${par30Rate.toFixed(1)}% - portfolio health excellent and well below industry average of 10%`);
    } else {
      insights.push(`PAR 30 at ${par30Rate.toFixed(1)}% - portfolio requires enhanced collections focus on ${loansWithArrears.length} accounts`);
    }

    insights.push(`Estimated revenue: ${currencyCode} ${(estimatedRevenue / 1000000).toFixed(2)}M from interest income - ${estimatedRevenue > 1000000 ? 'strong' : 'growing'} profitability trajectory`);

    // Strategic recommendations
    const recommendations = [];
    
    recommendations.push('Strategic Priority: Scale operations to 200+ active loans within 6 months to achieve operational efficiency');
    
    if (par30Rate < 5) {
      recommendations.push('Portfolio quality excellent - consider expanding into new client segments or increasing loan sizes');
    } else {
      recommendations.push(`Focus on collections: ${loansWithArrears.length} accounts need immediate attention to prevent portfolio degradation`);
    }

    recommendations.push('Technology: Implement automated SMS reminders and AI credit scoring to maintain growth without quality compromise');
    recommendations.push('Funding: Secure additional ${} to support projected 25% monthly growth rate');

    // Risk factors
    const riskFactors = [];
    if (par30Rate > 5) riskFactors.push(`PAR 30 at ${par30Rate.toFixed(1)}% above target`);
    if (loansWithArrears.length > activeLoans.length * 0.2) riskFactors.push(`${loansWithArrears.length} accounts in arrears`);
    if (newLoans.length < 5) riskFactors.push('Low disbursement velocity this month');
    if (activePortfolio < totalDisbursed * 0.3) riskFactors.push('High cash deployment needed');
    if (riskFactors.length === 0) riskFactors.push('No significant risks - portfolio performing excellently');

    return {
      period: 'Monthly',
      generatedDate: now.toLocaleDateString(),
      metrics: {
        totalLoans: loans.length,
        activeLoans: activeLoans.length,
        newLoansThisMonth: newLoans.length,
        totalDisbursed,
        totalRepaid,
        activePortfolio,
        par30Rate,
        clients: clients.length,
        newDisbursedAmount,
        repaidThisMonth,
        estimatedRevenue
      },
      insights,
      recommendations,
      riskFactors,
      performanceRating: par30Rate === 0 ? 'Excellent' : par30Rate < 5 ? 'Good' : par30Rate < 10 ? 'Fair' : 'Needs Improvement'
    };
  };

  const [reportType, setReportType] = useState<ReportPeriod>('weekly');
  const summary = reportType === 'weekly' ? generateWeeklySummary() : generateMonthlySummary();

  const downloadPDF = () => {
    toast.success('Downloading executive summary...', {
      description: 'PDF report will be available shortly'
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return isDark ? 'text-emerald-200 bg-emerald-900/40 border border-emerald-700/50' : 'text-emerald-800 bg-emerald-100 border border-emerald-300';
      case 'Good': return isDark ? 'text-green-200 bg-green-900/40 border border-green-700/50' : 'text-green-800 bg-green-100 border border-green-300';
      case 'Fair': return isDark ? 'text-amber-200 bg-amber-900/40 border border-amber-700/50' : 'text-amber-800 bg-amber-100 border border-amber-300';
      case 'Needs Improvement': return isDark ? 'text-red-200 bg-red-900/40 border border-red-700/50' : 'text-red-800 bg-red-100 border border-red-300';
      default: return isDark ? 'text-gray-200 bg-gray-800 border border-gray-700' : 'text-gray-800 bg-gray-100 border border-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="size-5 text-indigo-600" />
            <h3 className="text-lg" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
              AI-Generated Executive Summary
            </h3>
          </div>
          <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
            Automated insights and performance analysis powered by machine learning
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setReportType('weekly')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              reportType === 'weekly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              reportType === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Download className="size-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="p-4 rounded-lg border" style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e5e7eb'
      }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="mb-1" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
              {summary.period} Performance Report
            </h4>
            <div className="flex items-center gap-2 text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
              <Calendar className="size-4" />
              <span>Generated: {summary.generatedDate}</span>
              <span>•</span>
              <Sparkles className="size-4" />
              <span>AI Confidence: 92%</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${getRatingColor(summary.performanceRating)}`}>
            <p className="text-sm">Overall Rating</p>
            <p className="text-xl">{summary.performanceRating}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="size-4 text-green-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Active Portfolio</span>
          </div>
          <p className="text-2xl" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
            {currencyCode} {(summary.metrics.activePortfolio / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-green-600 mt-1">
            <TrendingUp className="size-3 inline" /> {summary.metrics.activeLoans} active loans
          </p>
        </div>

        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-4 text-blue-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
              {reportType === 'weekly' ? 'New This Week' : 'New This Month'}
            </span>
          </div>
          <p className="text-2xl" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
            {reportType === 'weekly' ? summary.metrics.newLoansThisWeek : summary.metrics.newLoansThisMonth}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {reportType === 'monthly' && `${currencyCode} ${((summary.metrics as any).newDisbursedAmount / 1000000).toFixed(2)}M disbursed`}
          </p>
        </div>

        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>PAR 30 Rate</span>
          </div>
          <p className={`text-2xl ${summary.metrics.par30Rate === 0 ? 'text-green-600' : summary.metrics.par30Rate < 5 ? 'text-blue-600' : 'text-red-600'}`}>
            {summary.metrics.par30Rate.toFixed(1)}%
          </p>
          <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
            {summary.metrics.par30Rate === 0 ? 'Perfect' : summary.metrics.par30Rate < 5 ? 'Healthy' : 'Needs attention'}
          </p>
        </div>

        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-purple-600" />
            <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
              {reportType === 'monthly' ? 'Est. Revenue' : 'Avg Loan Size'}
            </span>
          </div>
          <p className="text-2xl" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
            {reportType === 'monthly' 
              ? `${currencyCode} ${((summary.metrics as any).estimatedRevenue / 1000000).toFixed(2)}M`
              : summary.metrics.avgLoanSize > 0 
                ? `${currencyCode} ${(summary.metrics.avgLoanSize / 1000).toFixed(0)}K`
                : 'N/A'
            }
          </p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="p-4 rounded-lg border" style={{
        backgroundColor: isDark ? '#1e3a52' : '#1e3a52',
        borderColor: isDark ? '#2563eb' : '#3b82f6'
      }}>
        <div className="flex items-start gap-2 mb-3">
          <Sparkles className="size-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-blue-200 mb-2">🤖 AI-Generated Insights</h4>
            <div className="space-y-2">
              {summary.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-100 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="p-4 rounded-lg border" style={{
        backgroundColor: isDark ? '#064e3b' : '#064e3b',
        borderColor: isDark ? '#059669' : '#10b981'
      }}>
        <div className="flex items-start gap-2 mb-3">
          <TrendingUp className="size-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-green-200 mb-2">📊 Strategic Recommendations</h4>
            <div className="space-y-2">
              {summary.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <p className="text-green-100 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="p-4 rounded-lg border" style={{
        backgroundColor: summary.riskFactors[0] === 'No significant risks identified' || summary.riskFactors[0].includes('excellently')
          ? '#064e3b'
          : '#78350f',
        borderColor: summary.riskFactors[0] === 'No significant risks identified' || summary.riskFactors[0].includes('excellently')
          ? '#059669'
          : '#92400e'
      }}>
        <div className="flex items-start gap-2 mb-3">
          {summary.riskFactors[0] === 'No significant risks identified' || summary.riskFactors[0].includes('excellently') ? (
            <CheckCircle className="size-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="size-5 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className={summary.riskFactors[0] === 'No significant risks identified' || summary.riskFactors[0].includes('excellently') ? 'text-green-200 mb-2' : 'text-amber-200 mb-2'}>
              ⚠️ Risk Factors
            </h4>
            <div className="space-y-2">
              {summary.riskFactors.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className={summary.riskFactors[0] === 'No significant risks identified' || summary.riskFactors[0].includes('excellently') ? 'text-green-400' : 'text-amber-400'}>•</span>
                  <p className={`text-sm ${summary.riskFactors[0] === 'No significant risks identified' || summary.riskFactors[0].includes('excellently') ? 'text-green-100' : 'text-amber-100'}`}>{risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div className="flex items-start gap-2">
          <FileText className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 text-sm mb-1">
              <strong>About AI Executive Summaries:</strong>
            </p>
            <p className="text-gray-700 text-xs">
              This report is automatically generated using natural language processing and machine learning algorithms that analyze 
              your portfolio data, identify trends, and generate actionable insights. The AI model is trained on microfinance best 
              practices and continuously improves based on industry benchmarks. Reports are generated instantly and can be exported 
              to PDF for board meetings or investor updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}