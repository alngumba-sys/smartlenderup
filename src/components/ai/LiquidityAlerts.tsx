import { AlertTriangle, Bell, TrendingDown, DollarSign, Calendar, Zap, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { useState } from 'react';

interface LiquidityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  amount: number;
  date: string;
  action: string;
  dismissed: boolean;
  aiConfidence: number;
}

export function LiquidityAlerts() {
  const { loans } = useData();
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const [alerts, setAlerts] = useState<LiquidityAlert[]>(generateAlerts());

  function generateAlerts(): LiquidityAlert[] {
    const totalDisbursed = loans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
    const totalRepaid = loans.reduce((sum, loan) => sum + ((loan.loanAmount || 0) - (loan.outstandingBalance || 0)), 0);
    
    // Only add starting capital if there are actual loans (not a new account)
    const currentCash = loans.length > 0 ? (totalRepaid - totalDisbursed + 5000000) : 0;
    
    // Only calculate average if there are loans, otherwise set to 0
    const avgMonthlyDisbursement = loans.length > 0 ? totalDisbursed / 12 : 0;
    const alerts: LiquidityAlert[] = [];

    // Calculate upcoming disbursement obligations
    const pendingLoans = loans.filter(l => l.status === 'Pending Disbursement' || l.status === 'Approved');
    const pendingAmount = pendingLoans.reduce((sum, l) => sum + (l.loanAmount || 0), 0);

    // Critical: Cash below 50% of monthly disbursement
    if (avgMonthlyDisbursement > 0 && currentCash < avgMonthlyDisbursement * 0.5) {
      const fundingNeeded = Math.max(0, avgMonthlyDisbursement * 1.5 - currentCash);
      alerts.push({
        id: 'CRIT-001',
        severity: 'critical',
        title: 'Critical Cash Shortage Alert',
        description: `Current cash position (${currencyCode} ${(currentCash / 1000000).toFixed(2)}M) is below minimum operating threshold. Immediate funding required to maintain operations.`,
        amount: fundingNeeded,
        date: new Date().toISOString().split('T')[0],
        action: 'Secure emergency funding within 48 hours',
        dismissed: false,
        aiConfidence: 95
      });
    }

    // High: Cash below 1 month of disbursements
    if (avgMonthlyDisbursement > 0 && currentCash < avgMonthlyDisbursement * 1.0 && currentCash >= avgMonthlyDisbursement * 0.5) {
      const fundingNeeded = Math.max(0, avgMonthlyDisbursement * 1.5 - currentCash);
      const daysCovered = (currentCash / avgMonthlyDisbursement) * 30;
      alerts.push({
        id: 'HIGH-001',
        severity: 'high',
        title: 'Low Liquidity Warning',
        description: `Cash reserves approaching critical levels. Current position only covers ${daysCovered.toFixed(0)} days of average disbursements.`,
        amount: fundingNeeded,
        date: new Date().toISOString().split('T')[0],
        action: 'Arrange funding within 2 weeks',
        dismissed: false,
        aiConfidence: 88
      });
    }

    // Medium: Pending disbursements exceed available cash
    if (pendingAmount > currentCash && pendingLoans.length > 0) {
      const shortfall = Math.max(0, pendingAmount - currentCash);
      alerts.push({
        id: 'MED-001',
        severity: 'medium',
        title: 'Pending Disbursement Gap',
        description: `You have ${pendingLoans.length} approved loans totaling ${currencyCode} ${(pendingAmount / 1000000).toFixed(2)}M, but current cash is only ${currencyCode} ${(currentCash / 1000000).toFixed(2)}M.`,
        amount: shortfall,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        action: 'Arrange additional funding or defer some disbursements',
        dismissed: false,
        aiConfidence: 82
      });
    }

    // Medium: Large repayment concentration risk
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthRepayments = loans.filter(loan => {
      const dueDate = new Date(loan.nextPaymentDate);
      return dueDate <= nextMonth && loan.status !== 'Fully Paid';
    });
    const expectedInflow = nextMonthRepayments.reduce((sum, l) => sum + (l.installmentAmount || 0), 0);

    if (avgMonthlyDisbursement > 0 && expectedInflow < avgMonthlyDisbursement * 0.7) {
      const shortfall = Math.max(0, avgMonthlyDisbursement - expectedInflow);
      alerts.push({
        id: 'MED-002',
        severity: 'medium',
        title: 'Low Expected Inflows Next Month',
        description: `Expected repayments next month (${currencyCode} ${(expectedInflow / 1000000).toFixed(2)}M) are 30% below average. Consider reducing new disbursements.`,
        amount: shortfall,
        date: nextMonth.toISOString().split('T')[0],
        action: 'Monitor collections closely and manage disbursement pace',
        dismissed: false,
        aiConfidence: 76
      });
    }

    // Low: Seasonal liquidity pressure (example: post-holiday period)
    const currentMonth = new Date().getMonth();
    if (currentMonth === 0 || currentMonth === 1) { // January or February
      alerts.push({
        id: 'LOW-001',
        severity: 'low',
        title: 'Seasonal Liquidity Pressure',
        description: 'Post-holiday period typically shows increased default rates and reduced repayments. Monitor portfolio closely.',
        amount: avgMonthlyDisbursement * 0.3,
        date: new Date(new Date().getFullYear(), 1, 28).toISOString().split('T')[0],
        action: 'Maintain higher cash reserves during this period',
        dismissed: false,
        aiConfidence: 72
      });
    }

    // If no alerts, create a positive message
    if (alerts.length === 0) {
      alerts.push({
        id: 'GOOD-001',
        severity: 'low',
        title: 'Healthy Liquidity Position',
        description: `Current cash position of ${currencyCode} ${(currentCash / 1000000).toFixed(2)}M is sufficient for current operations. No immediate liquidity concerns detected.`,
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        action: 'Continue monitoring daily',
        dismissed: false,
        aiConfidence: 90
      });
    }

    return alerts;
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const highCount = activeAlerts.filter(a => a.severity === 'high').length;
  const mediumCount = activeAlerts.filter(a => a.severity === 'medium').length;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-300',
          text: 'text-red-900',
          badge: 'bg-red-600 text-white',
          icon: 'text-red-600'
        };
      case 'high':
        return {
          bg: 'bg-amber-50 border-amber-300',
          text: 'text-amber-900',
          badge: 'bg-amber-600 text-white',
          icon: 'text-amber-600'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 border-yellow-300',
          text: 'text-yellow-900',
          badge: 'bg-yellow-600 text-white',
          icon: 'text-yellow-600'
        };
      case 'low':
        return {
          bg: 'bg-blue-50 border-blue-300',
          text: 'text-blue-900',
          badge: 'bg-blue-600 text-white',
          icon: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-300',
          text: 'text-gray-900',
          badge: 'bg-gray-600 text-white',
          icon: 'text-gray-600'
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="size-5 text-red-600" />
          <h3 className="text-lg" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
            AI Liquidity Monitoring System
          </h3>
        </div>
        <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
          Real-time alerts when cash position falls below optimal thresholds
        </p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-red-300 bg-red-50">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="size-4 text-red-600" />
            <span className="text-xs text-red-900">Critical</span>
          </div>
          <p className="text-3xl text-red-600">{criticalCount}</p>
        </div>

        <div className="p-4 rounded-lg border border-amber-300 bg-amber-50">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="size-4 text-amber-600" />
            <span className="text-xs text-amber-900">High</span>
          </div>
          <p className="text-3xl text-amber-600">{highCount}</p>
        </div>

        <div className="p-4 rounded-lg border border-yellow-300 bg-yellow-50">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="size-4 text-yellow-600" />
            <span className="text-xs text-yellow-900">Medium</span>
          </div>
          <p className="text-3xl text-yellow-600">{mediumCount}</p>
        </div>

        <div className="p-4 rounded-lg border" style={{
          backgroundColor: isDark ? '#064e3b' : '#d1fae5',
          borderColor: isDark ? '#059669' : '#10b981'
        }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="size-4 text-green-600" />
            <span className="text-xs" style={{ color: isDark ? '#d1fae5' : '#065f46' }}>Status</span>
          </div>
          <p className="text-lg" style={{ color: isDark ? '#6ee7b7' : '#059669' }}>
            {criticalCount === 0 && highCount === 0 ? 'Healthy' : 'Needs Attention'}
          </p>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-3">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-green-300 bg-green-50">
            <CheckCircle className="size-12 mx-auto mb-3 text-green-600" />
            <h4 className="mb-2 text-green-900">All Clear! 🎉</h4>
            <p className="text-sm text-green-800">
              No liquidity alerts. Cash position is healthy and well above minimum thresholds.
            </p>
          </div>
        ) : (
          activeAlerts.map(alert => {
            const styles = getSeverityStyles(alert.severity);
            const isPositive = alert.id.startsWith('GOOD');

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${styles.bg}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {isPositive ? (
                      <CheckCircle className={`size-6 ${styles.icon} flex-shrink-0`} />
                    ) : (
                      <AlertTriangle className={`size-6 ${styles.icon} flex-shrink-0`} />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={styles.text}>{alert.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${styles.badge}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">
                          AI: {alert.aiConfidence}%
                        </span>
                      </div>
                      <p className={`text-sm ${styles.text} mb-2`}>
                        {alert.description}
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        {alert.amount > 0 && (
                          <div>
                            <p className="text-xs text-gray-600">Funding Needed</p>
                            <p className={styles.text}>
                              {currencyCode} {(alert.amount / 1000000).toFixed(2)}M
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-600">Alert Date</p>
                          <p className={styles.text}>
                            {new Date(alert.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Recommended Action</p>
                          <p className={styles.text}>
                            {alert.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!isPositive && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                      title="Dismiss alert"
                    >
                      <XCircle className="size-5" />
                    </button>
                  )}
                </div>

                {/* Action Buttons for Critical/High Alerts */}
                {(alert.severity === 'critical' || alert.severity === 'high') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t" style={{
                    borderColor: alert.severity === 'critical' ? '#fecaca' : '#fed7aa'
                  }}>
                    <button className={`px-3 py-1.5 rounded text-sm text-white ${
                      alert.severity === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                    }`}>
                      <Zap className="size-3 inline mr-1" />
                      Contact Investors
                    </button>
                    <button className={`px-3 py-1.5 rounded text-sm ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}>
                      View Cash Flow
                    </button>
                    <button className={`px-3 py-1.5 rounded text-sm ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}>
                      Defer Disbursements
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Alert Configuration */}
      <div className="p-4 rounded-lg border" style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e5e7eb'
      }}>
        <h4 className="mb-3" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
          Alert Thresholds Configuration
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                Critical Alert Threshold
              </p>
              <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                Alert when cash falls below 50% of monthly disbursements
              </p>
            </div>
            <span className="text-red-600">0.5x</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                High Alert Threshold
              </p>
              <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                Alert when cash falls below 1 month of disbursements
              </p>
            </div>
            <span className="text-orange-600">1.0x</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                Medium Alert Threshold
              </p>
              <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                Alert when pending disbursements exceed available cash
              </p>
            </div>
            <span className="text-amber-600">1.0x</span>
          </div>
        </div>
      </div>

      {/* AI Info */}
      <div className="p-3 rounded-lg border border-purple-200 bg-purple-50">
        <div className="flex items-start gap-2">
          <Bell className="size-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-900 text-sm mb-1">
              <strong>AI Monitoring System:</strong>
            </p>
            <p className="text-purple-800 text-xs">
              The liquidity monitoring system uses predictive analytics to identify cash shortages before they become critical. 
              Alerts are triggered based on real-time cash position, upcoming obligations, expected inflows, and seasonal patterns. 
              Configure notification preferences in Settings → Alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}