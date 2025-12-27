import { X, Brain, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Users, Calendar, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface CreditScoreStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statType: 'avgScore' | 'excellentGood' | 'fairPoor' | 'highRisk' | 'scoreChange' | 'approvalRate' | 'lowRiskShare' | 'portfolioRisk';
  creditScores: any[];
  loans?: any[];
}

export function CreditScoreStatsModal({ isOpen, onClose, statType, creditScores, loans = [] }: CreditScoreStatsModalProps) {
  if (!isOpen) return null;

  const [timeframe, setTimeframe] = useState('6months');

  // Calculate comprehensive stats
  const avgScore = Math.round(creditScores.reduce((sum, s) => sum + s.currentScore, 0) / creditScores.length);
  const excellentCount = creditScores.filter(s => s.riskCategory === 'excellent').length;
  const goodCount = creditScores.filter(s => s.riskCategory === 'good').length;
  const fairCount = creditScores.filter(s => s.riskCategory === 'fair').length;
  const poorCount = creditScores.filter(s => s.riskCategory === 'poor').length;
  const highRiskCount = creditScores.filter(s => s.riskCategory === 'high_risk').length;
  const lowRiskShare = Math.round(((excellentCount + goodCount) / creditScores.length) * 100);

  // Calculate actual PAR from loans data
  const activeLoans = loans.filter(loan => loan.status !== 'Fully Paid' && loan.outstandingBalance > 0);
  const totalPortfolio = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  
  const par1to7 = activeLoans.filter(loan => loan.daysInArrears >= 1 && loan.daysInArrears <= 7);
  const par8to30 = activeLoans.filter(loan => loan.daysInArrears >= 8 && loan.daysInArrears <= 30);
  const par30plus = activeLoans.filter(loan => loan.daysInArrears > 30);
  const par90plus = activeLoans.filter(loan => loan.daysInArrears > 90);
  
  const par1to7Amount = par1to7.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const par8to30Amount = par8to30.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const par30Amount = par30plus.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const par90Amount = par90plus.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  
  const par1to7Percent = totalPortfolio > 0 ? ((par1to7Amount / totalPortfolio) * 100).toFixed(1) : '0.0';
  const par8to30Percent = totalPortfolio > 0 ? ((par8to30Amount / totalPortfolio) * 100).toFixed(1) : '0.0';
  const par30Percent = totalPortfolio > 0 ? ((par30Amount / totalPortfolio) * 100).toFixed(1) : '0.0';
  const par90Percent = totalPortfolio > 0 ? ((par90Amount / totalPortfolio) * 100).toFixed(1) : '0.0';

  // Calculate approval rate from loans (all 12 loans are approved, so 100% approval rate)
  // In real scenario, you would track applications separately with approved/rejected/pending status
  const approvedLoans = loans.length; // All loans in the system are approved
  const rejectedApplications = 0; // No rejected applications tracked
  const pendingApplications = 0; // No pending applications tracked
  const totalApplications = approvedLoans + rejectedApplications + pendingApplications;
  const approvalRate = totalApplications > 0 ? Math.round((approvedLoans / totalApplications) * 100) : 0;

  const getModalContent = () => {
    switch (statType) {
      case 'avgScore':
        return {
          title: 'Average Credit Score Analysis',
          icon: <Brain className="size-8 text-purple-600" />,
          color: 'purple',
          mainValue: avgScore.toString(),
          subtitle: 'Overall portfolio health',
          sections: [
            {
              title: 'Score Distribution',
              content: (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Excellent (750-850)</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${(excellentCount / creditScores.length) * 100}%` }}></div>
                      </div>
                      <span className="text-gray-900 w-12 text-right">{excellentCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Good (650-749)</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${(goodCount / creditScores.length) * 100}%` }}></div>
                      </div>
                      <span className="text-gray-900 w-12 text-right">{goodCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Fair (550-649)</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600" style={{ width: `${(fairCount / creditScores.length) * 100}%` }}></div>
                      </div>
                      <span className="text-gray-900 w-12 text-right">{fairCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Poor (450-549)</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-600" style={{ width: `${(poorCount / creditScores.length) * 100}%` }}></div>
                      </div>
                      <span className="text-gray-900 w-12 text-right">{poorCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">High Risk (&lt;450)</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${(highRiskCount / creditScores.length) * 100}%` }}></div>
                      </div>
                      <span className="text-gray-900 w-12 text-right">{highRiskCount}</span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Historical Trend',
              content: (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">6 Months Ago</p>
                      <p className="text-gray-900 text-xl">71</p>
                      <p className="text-gray-500 text-xs">Initial baseline</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">3 Months Ago</p>
                      <p className="text-gray-900 text-xl">82</p>
                      <p className="text-emerald-600 text-xs">+11 pts improvement</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-gray-700 text-xs mb-1">Current</p>
                      <p className="text-gray-900 text-xl">{avgScore}</p>
                      <p className="text-emerald-600 text-xs">+18 pts total</p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Performance Insights',
              content: (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <ul className="space-y-2">
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>Portfolio average score is {avgScore > 700 ? 'excellent' : avgScore > 650 ? 'good' : 'moderate'}, indicating {avgScore > 700 ? 'very low' : avgScore > 650 ? 'low' : 'moderate'} overall risk</span>
                    </li>
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>Score has improved by +18 points over the past 6 months</span>
                    </li>
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>{lowRiskShare}% of borrowers are in the low-risk category (Good or Excellent)</span>
                    </li>
                  </ul>
                </div>
              )
            }
          ]
        };

      case 'excellentGood':
        const excellentGoodClients = creditScores.filter(s => s.riskCategory === 'excellent' || s.riskCategory === 'good');
        return {
          title: 'Low-Risk Borrowers (Excellent + Good)',
          icon: <CheckCircle className="size-8 text-emerald-600" />,
          color: 'emerald',
          mainValue: (excellentCount + goodCount).toString(),
          subtitle: `${lowRiskShare}% of total portfolio`,
          sections: [
            {
              title: 'Client Breakdown',
              content: (
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-emerald-800">Excellent (750-850)</span>
                      <span className="text-emerald-800">{excellentCount} clients</span>
                    </div>
                    <div className="space-y-1">
                      {creditScores.filter(s => s.riskCategory === 'excellent').map(client => (
                        <div key={client.clientId} className="flex justify-between text-sm">
                          <span className="text-emerald-800">{client.clientName}</span>
                          <span className="text-emerald-700">Score: {client.currentScore}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-800">Good (650-749)</span>
                      <span className="text-blue-800">{goodCount} clients</span>
                    </div>
                    <div className="space-y-1">
                      {creditScores.filter(s => s.riskCategory === 'good').map(client => (
                        <div key={client.clientId} className="flex justify-between text-sm">
                          <span className="text-blue-800">{client.clientName}</span>
                          <span className="text-blue-700">Score: {client.currentScore}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Portfolio Value',
              content: (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Total Borrowed</p>
                    <p className="text-gray-900 text-lg">KES {(excellentGoodClients.reduce((sum, c) => sum + c.totalBorrowed, 0) / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Total Repaid</p>
                    <p className="text-gray-900 text-lg">KES {(excellentGoodClients.reduce((sum, c) => sum + c.totalRepaid, 0) / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Avg Repayment</p>
                    <p className="text-gray-900 text-lg">{(excellentGoodClients.reduce((sum, c) => sum + c.repaymentRate, 0) / excellentGoodClients.length).toFixed(1)}%</p>
                  </div>
                </div>
              )
            },
            {
              title: 'Strategic Opportunities',
              content: (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <ul className="space-y-2">
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>These clients represent your most reliable borrowers - consider offering premium products</span>
                    </li>
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Average repayment rate exceeds 95% - excellent portfolio health indicator</span>
                    </li>
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Consider loyalty rewards or preferential rates for retention</span>
                    </li>
                  </ul>
                </div>
              )
            }
          ]
        };

      case 'fairPoor':
        const moderateRiskClients = creditScores.filter(s => s.riskCategory === 'fair' || s.riskCategory === 'poor');
        return {
          title: 'Moderate-High Risk Borrowers (Fair + Poor)',
          icon: <AlertTriangle className="size-8 text-amber-600" />,
          color: 'amber',
          mainValue: (fairCount + poorCount).toString(),
          subtitle: `${Math.round(((fairCount + poorCount) / creditScores.length) * 100)}% of portfolio`,
          sections: [
            {
              title: 'Risk Breakdown',
              content: (
                <div className="space-y-3">
                  {fairCount > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-amber-900">Fair Risk (550-649)</span>
                        <span className="text-amber-900">{fairCount} clients</span>
                      </div>
                      <div className="space-y-1">
                        {creditScores.filter(s => s.riskCategory === 'fair').map(client => (
                          <div key={client.clientId} className="flex justify-between text-sm">
                            <span className="text-amber-800">{client.clientName}</span>
                            <span className="text-amber-700">Score: {client.currentScore}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {poorCount > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-900">Poor Risk (450-549)</span>
                        <span className="text-orange-900">{poorCount} clients</span>
                      </div>
                      <div className="space-y-1">
                        {creditScores.filter(s => s.riskCategory === 'poor').map(client => (
                          <div key={client.clientId} className="flex justify-between text-sm">
                            <span className="text-orange-800">{client.clientName}</span>
                            <span className="text-orange-700">Score: {client.currentScore}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {fairCount === 0 && poorCount === 0 && (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center">
                      <CheckCircle className="size-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-emerald-900">No clients in moderate-high risk categories</p>
                      <p className="text-emerald-700 text-sm">Excellent portfolio health!</p>
                    </div>
                  )}
                </div>
              )
            },
            {
              title: 'Risk Metrics',
              content: moderateRiskClients.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Avg Days Overdue</p>
                    <p className="text-gray-900 text-lg">{(moderateRiskClients.reduce((sum, c) => sum + c.daysOverdue, 0) / moderateRiskClients.length).toFixed(0)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Avg Repayment</p>
                    <p className="text-gray-900 text-lg">{(moderateRiskClients.reduce((sum, c) => sum + c.repaymentRate, 0) / moderateRiskClients.length).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Active Loans</p>
                    <p className="text-gray-900 text-lg">{moderateRiskClients.reduce((sum, c) => sum + c.activeLoans, 0)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">No data available</div>
              )
            },
            {
              title: 'Recommended Actions',
              content: moderateRiskClients.length > 0 ? (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <ul className="space-y-2">
                    <li className="text-amber-900 text-sm flex items-start gap-2">
                      <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                      <span>Enhanced monitoring required - weekly payment status checks recommended</span>
                    </li>
                    <li className="text-amber-900 text-sm flex items-start gap-2">
                      <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                      <span>Consider restructuring plans for clients with payment difficulties</span>
                    </li>
                    <li className="text-amber-900 text-sm flex items-start gap-2">
                      <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                      <span>Limit new credit exposure until scores improve</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">No actions needed</div>
              )
            }
          ]
        };

      case 'highRisk':
        const highRiskClients = creditScores.filter(s => s.riskCategory === 'high_risk');
        return {
          title: 'High-Risk Borrowers',
          icon: <AlertTriangle className="size-8 text-red-600" />,
          color: 'red',
          mainValue: highRiskCount.toString(),
          subtitle: 'Critical attention required',
          sections: [
            {
              title: 'High-Risk Client Details',
              content: highRiskClients.length > 0 ? (
                <div className="space-y-2">
                  {highRiskClients.map(client => (
                    <div key={client.clientId} className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-red-900">{client.clientName}</p>
                          <p className="text-red-700 text-sm">{client.clientId}</p>
                        </div>
                        <span className="text-red-900 text-xl">{client.currentScore}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-red-700 text-xs">Days Overdue</p>
                          <p className="text-red-900">{client.daysOverdue}</p>
                        </div>
                        <div>
                          <p className="text-red-700 text-xs">Repayment Rate</p>
                          <p className="text-red-900">{client.repaymentRate}%</p>
                        </div>
                        <div>
                          <p className="text-red-700 text-xs">Active Loans</p>
                          <p className="text-red-900">{client.activeLoans}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {highRiskClients.length === 0 && (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center">
                      <CheckCircle className="size-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-emerald-900">No high-risk borrowers</p>
                      <p className="text-emerald-700 text-sm">Outstanding portfolio management!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center">
                  <CheckCircle className="size-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-emerald-900">No high-risk borrowers</p>
                  <p className="text-emerald-700 text-sm">Outstanding portfolio management!</p>
                </div>
              )
            },
            {
              title: 'Risk Impact',
              content: highRiskClients.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Total Exposure</p>
                    <p className="text-gray-900 text-lg">KES {(highRiskClients.reduce((sum, c) => sum + (c.totalBorrowed - c.totalRepaid), 0) / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Recovery Rate</p>
                    <p className="text-gray-900 text-lg">{highRiskClients.length > 0 ? (highRiskClients.reduce((sum, c) => sum + c.repaymentRate, 0) / highRiskClients.length).toFixed(1) : '0'}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">% of Portfolio</p>
                    <p className="text-gray-900 text-lg">{Math.round((highRiskCount / creditScores.length) * 100)}%</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">No risk exposure</div>
              )
            },
            {
              title: 'Immediate Actions Required',
              content: highRiskClients.length > 0 ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <ul className="space-y-2">
                    <li className="text-red-900 text-sm flex items-start gap-2">
                      <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
                      <span>Suspend all new credit to high-risk clients immediately</span>
                    </li>
                    <li className="text-red-900 text-sm flex items-start gap-2">
                      <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
                      <span>Initiate collection procedures and recovery actions</span>
                    </li>
                    <li className="text-red-900 text-sm flex items-start gap-2">
                      <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
                      <span>Daily monitoring and contact attempts required</span>
                    </li>
                    <li className="text-red-900 text-sm flex items-start gap-2">
                      <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
                      <span>Consider legal action for severely delinquent accounts</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">No actions needed</div>
              )
            }
          ]
        };

      case 'scoreChange':
        const improving = creditScores.filter(s => s.scoreChange > 0);
        const declining = creditScores.filter(s => s.scoreChange < 0);
        const stable = creditScores.filter(s => s.scoreChange === 0);
        return {
          title: 'Average Score Change Trend',
          icon: <TrendingUp className="size-8 text-emerald-600" />,
          color: 'emerald',
          mainValue: '+18 pts',
          subtitle: 'vs. 6 months ago',
          sections: [
            {
              title: 'Score Movement Analysis',
              content: (
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-5 text-emerald-600" />
                        <span className="text-emerald-900">Improving</span>
                      </div>
                      <span className="text-emerald-900">{improving.length} clients</span>
                    </div>
                    {improving.slice(0, 3).map(client => (
                      <div key={client.clientId} className="flex justify-between text-sm mb-1">
                        <span className="text-emerald-800">{client.clientName}</span>
                        <span className="text-emerald-700">+{client.scoreChange} pts</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="size-5 text-gray-600" />
                        <span className="text-gray-900">Stable</span>
                      </div>
                      <span className="text-gray-900">{stable.length} clients</span>
                    </div>
                    <p className="text-gray-600 text-sm">No significant change in score</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="size-5 text-red-600" />
                        <span className="text-red-900">Declining</span>
                      </div>
                      <span className="text-red-900">{declining.length} clients</span>
                    </div>
                    {declining.slice(0, 3).map(client => (
                      <div key={client.clientId} className="flex justify-between text-sm mb-1">
                        <span className="text-red-800">{client.clientName}</span>
                        <span className="text-red-700">{client.scoreChange} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            },
            {
              title: '6-Month Trajectory',
              content: (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">6 Months Ago</p>
                      <p className="text-gray-900 text-xl">71</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">3 Months Ago</p>
                      <p className="text-gray-900 text-xl">82</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <p className="text-emerald-900 text-xs mb-1">Current</p>
                      <p className="text-emerald-900 text-xl">{avgScore}</p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Performance Insights',
              content: (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <ul className="space-y-2">
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Portfolio showing strong upward trajectory with +18 point improvement</span>
                    </li>
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{improving.length} clients are actively improving their credit profiles</span>
                    </li>
                    <li className="text-gray-800 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Strong indicator of effective lending practices and client support</span>
                    </li>
                  </ul>
                </div>
              )
            }
          ]
        };

      case 'approvalRate':
        return {
          title: 'Loan Approval Rate',
          icon: <CheckCircle className="size-8 text-blue-600" />,
          color: 'blue',
          mainValue: `${approvalRate}%`,
          subtitle: 'All applications approved',
          sections: [
            {
              title: 'Current Status',
              content: (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <p className="text-emerald-900 text-xs mb-1">Approved</p>
                      <p className="text-emerald-900 text-2xl">{approvedLoans}</p>
                      <p className="text-emerald-700 text-xs">Loans disbursed</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-red-900 text-xs mb-1">Rejected</p>
                      <p className="text-red-900 text-2xl">{rejectedApplications}</p>
                      <p className="text-red-700 text-xs">Applications</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-amber-900 text-xs mb-1">Pending</p>
                      <p className="text-amber-900 text-2xl">{pendingApplications}</p>
                      <p className="text-amber-700 text-xs">In review</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-emerald-900">Approval Rate</span>
                      <span className="text-emerald-900 text-xl">{approvalRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${approvalRate}%` }}></div>
                    </div>
                    <p className="text-emerald-700 text-xs mt-2">All applications successfully approved</p>
                  </div>
                </div>
              )
            },
            {
              title: 'Loan Portfolio Summary',
              content: (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Total Loans</p>
                      <p className="text-gray-900 text-lg">{loans.length}</p>
                      <p className="text-gray-500 text-xs">All approved</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Fully Paid</p>
                      <p className="text-gray-900 text-lg">{loans.filter(l => l.status === 'Fully Paid').length}</p>
                      <p className="text-gray-500 text-xs">Completed</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Active</p>
                      <p className="text-gray-900 text-lg">{activeLoans.length}</p>
                      <p className="text-gray-500 text-xs">Ongoing</p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Key Insights',
              content: (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <ul className="space-y-2">
                    <li className="text-blue-900 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>All {loans.length} loan applications have been successfully approved and disbursed</span>
                    </li>
                    <li className="text-blue-900 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>{loans.filter(l => l.status === 'Fully Paid').length} loans fully repaid - {((loans.filter(l => l.status === 'Fully Paid').length / loans.length) * 100).toFixed(0)}% completion rate</span>
                    </li>
                    <li className="text-blue-900 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>Strong borrower performance with excellent repayment track record</span>
                    </li>
                  </ul>
                </div>
              )
            }
          ]
        };

      case 'lowRiskShare':
        return {
          title: 'Low-Risk Portfolio Share',
          icon: <CheckCircle className="size-8 text-emerald-600" />,
          color: 'emerald',
          mainValue: `${lowRiskShare}%`,
          subtitle: 'Borrowers rated Good or Excellent',
          sections: [
            {
              title: 'Portfolio Composition',
              content: (
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-emerald-900">Low-Risk Clients</span>
                      <span className="text-emerald-900 text-2xl">{excellentCount + goodCount}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${lowRiskShare}%` }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Excellent</p>
                      <p className="text-gray-900 text-xl">{excellentCount}</p>
                      <p className="text-gray-500 text-xs">{Math.round((excellentCount / creditScores.length) * 100)}% of total</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Good</p>
                      <p className="text-gray-900 text-xl">{goodCount}</p>
                      <p className="text-gray-500 text-xs">{Math.round((goodCount / creditScores.length) * 100)}% of total</p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Industry Benchmark',
              content: (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Your Portfolio</span>
                    <span className="text-emerald-600">{lowRiskShare}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Industry Average</span>
                    <span className="text-blue-600">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Top Performers</span>
                    <span className="text-purple-600">85%</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 mt-3">
                    <p className="text-emerald-900 text-sm">
                      {lowRiskShare > 65 ? '✓ Above industry average' : '⚠ Below industry average'}
                    </p>
                    <p className="text-emerald-700 text-xs mt-1">
                      {lowRiskShare > 65 
                        ? 'Your portfolio quality exceeds industry standards'
                        : 'Focus on improving client screening and support'}
                    </p>
                  </div>
                </div>
              )
            },
            {
              title: 'Strategic Impact',
              content: (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <ul className="space-y-2">
                    <li className="text-emerald-900 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Strong low-risk share indicates healthy portfolio quality</span>
                    </li>
                    <li className="text-emerald-900 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Lower default risk translates to better profitability</span>
                    </li>
                    <li className="text-emerald-900 text-sm flex items-start gap-2">
                      <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Positions institution well for growth and expansion</span>
                    </li>
                  </ul>
                </div>
              )
            }
          ]
        };

      case 'portfolioRisk':
        return {
          title: 'Portfolio at Risk (PAR)',
          icon: <AlertTriangle className="size-8 text-amber-600" />,
          color: 'amber',
          mainValue: `${par30Percent}%`,
          subtitle: '> 30 days late (target < 5%)',
          sections: [
            {
              title: 'PAR Breakdown',
              content: (
                <div className="space-y-3">
                  {activeLoans.length > 0 ? (
                    <>
                      <div className={`p-3 rounded-lg border ${parseFloat(par30Percent) > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={parseFloat(par30Percent) > 0 ? 'text-amber-900' : 'text-emerald-900'}>PAR 30+ Days</span>
                          <span className={parseFloat(par30Percent) > 0 ? 'text-amber-900' : 'text-emerald-900'}>{par30Percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${parseFloat(par30Percent) > 0 ? 'bg-amber-600' : 'bg-emerald-600'}`} style={{ width: `${Math.min(parseFloat(par30Percent) * 10, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-600 text-xs mb-1">PAR 1-7 days</p>
                          <p className="text-gray-900 text-lg">{par1to7Percent}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-600 text-xs mb-1">PAR 8-30 days</p>
                          <p className="text-gray-900 text-lg">{par8to30Percent}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-600 text-xs mb-1">PAR 90+ days</p>
                          <p className="text-gray-900 text-lg">{par90Percent}%</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center">
                      <CheckCircle className="size-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-emerald-900">No active loans with outstanding balance</p>
                      <p className="text-emerald-700 text-sm">All loans are fully paid - excellent!</p>
                    </div>
                  )}
                </div>
              )
            },
            {
              title: 'Portfolio Status',
              content: (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Total Loans</p>
                      <p className="text-gray-900 text-lg">{loans.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Active Loans</p>
                      <p className="text-gray-900 text-lg">{activeLoans.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs mb-1">Outstanding</p>
                      <p className="text-gray-900 text-lg">KES {(totalPortfolio / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Risk Assessment',
              content: (
                <div className={`p-4 rounded-lg border ${parseFloat(par30Percent) === 0 ? 'bg-emerald-50 border-emerald-200' : parseFloat(par30Percent) < 5 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                  <ul className="space-y-2">
                    {parseFloat(par30Percent) === 0 ? (
                      <>
                        <li className="text-emerald-900 text-sm flex items-start gap-2">
                          <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>PAR 30+ is 0% - outstanding portfolio management!</span>
                        </li>
                        <li className="text-emerald-900 text-sm flex items-start gap-2">
                          <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>All active loans are current with no overdue payments</span>
                        </li>
                        <li className="text-emerald-900 text-sm flex items-start gap-2">
                          <CheckCircle className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>Excellent collection performance and client repayment behavior</span>
                        </li>
                      </>
                    ) : parseFloat(par30Percent) < 5 ? (
                      <>
                        <li className="text-blue-900 text-sm flex items-start gap-2">
                          <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                          <span>PAR 30+ is below the 5% target threshold - good control</span>
                        </li>
                        <li className="text-blue-900 text-sm flex items-start gap-2">
                          <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                          <span>Portfolio risk is within acceptable limits</span>
                        </li>
                        <li className="text-blue-900 text-sm flex items-start gap-2">
                          <CheckCircle className="size-4 text-blue-600 mt-0.5 shrink-0" />
                          <span>Continue monitoring and maintain collection efforts</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="text-amber-900 text-sm flex items-start gap-2">
                          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                          <span>PAR 30+ exceeds 5% target - enhanced monitoring required</span>
                        </li>
                        <li className="text-amber-900 text-sm flex items-start gap-2">
                          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                          <span>Increase collection activities and client follow-up</span>
                        </li>
                        <li className="text-amber-900 text-sm flex items-start gap-2">
                          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                          <span>Review and tighten credit approval criteria if trend continues</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )
            }
          ]
        };

      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-6" style={{
          backgroundColor: `var(--color-${content.color}-50, ${
            content.color === 'purple' ? '#faf5ff' :
            content.color === 'emerald' ? '#ecfdf5' :
            content.color === 'amber' ? '#fffbeb' :
            content.color === 'red' ? '#fef2f2' :
            content.color === 'blue' ? '#eff6ff' : '#f9fafb'
          })`,
          borderColor: `var(--color-${content.color}-200, ${
            content.color === 'purple' ? '#e9d5ff' :
            content.color === 'emerald' ? '#a7f3d0' :
            content.color === 'amber' ? '#fde68a' :
            content.color === 'red' ? '#fecaca' :
            content.color === 'blue' ? '#bfdbfe' : '#e5e7eb'
          })`
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {content.icon}
              <div>
                <h2 className="text-gray-900 text-2xl">{content.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{content.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>
          
          {/* Main Value */}
          <div className="text-5xl mt-4" style={{ color: `var(--color-${content.color}-900, rgb(${
            content.color === 'purple' ? '88, 28, 135' :
            content.color === 'emerald' ? '6, 78, 59' :
            content.color === 'amber' ? '120, 53, 15' :
            content.color === 'red' ? '127, 29, 29' :
            content.color === 'blue' ? '30, 58, 138' : '17, 24, 39'
          }))` }}>
            {content.mainValue}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {content.sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-gray-900 mb-3">{section.title}</h3>
              {section.content}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Close
          </button>
          <button className={`px-4 py-2 bg-${content.color}-600 text-white rounded-lg hover:bg-${content.color}-700 text-sm`}>
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}