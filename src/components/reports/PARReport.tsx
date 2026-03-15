import { useData } from '../../contexts/DataContext';
import { safePercentage, safeDivideNum, safePercentageNum } from '../../utils/safeCalculations';
import { useTheme } from '../../contexts/ThemeContext';
import { getOrganizationName, getOrganizationLogo } from '../../utils/organizationUtils';
import logoImage from "figma:asset/e19de9b1a3313f261c0276da257bd631603f9688.png";
import { getCurrencyCode } from '../../utils/currencyUtils';

interface ReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function PARReport({ dateRange }: ReportProps) {
  const { loans, clients } = useData();
  const { isDark } = useTheme();
  const organizationName = getOrganizationName();
  const organizationLogo = getOrganizationLogo();
  const currencyCode = getCurrencyCode();
  
  // Filter loans by date range
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  const filteredLoans = loans.filter(loan => {
    const disbursementDate = new Date(loan.disbursementDate);
    return disbursementDate >= startDate && disbursementDate <= endDate;
  });
  
  // Calculate PAR metrics
  const activeLoans = filteredLoans.filter(l => l.status === 'Active' || l.status === 'Disbursed');
  
  // PAR 1: Loans overdue by 1+ days
  const loansOverdue1 = activeLoans.filter(l => (l.daysInArrears || 0) >= 1);
  const par1Amount = loansOverdue1.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const par1Percent = safePercentageNum(
    par1Amount, 
    activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0)
  );
  
  // PAR 7: Loans overdue by 7+ days
  const loansOverdue7 = activeLoans.filter(l => (l.daysInArrears || 0) >= 7);
  const par7Amount = loansOverdue7.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const par7Percent = safePercentageNum(
    par7Amount, 
    activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0)
  );
  
  // PAR 30: Loans overdue by 30+ days
  const loansOverdue30 = activeLoans.filter(l => (l.daysInArrears || 0) >= 30);
  const par30Amount = loansOverdue30.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const par30Percent = safePercentageNum(
    par30Amount, 
    activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0)
  );
  
  // PAR 90: Loans overdue by 90+ days
  const loansOverdue90 = activeLoans.filter(l => (l.daysInArrears || 0) >= 90);
  const par90Amount = loansOverdue90.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const par90Percent = safePercentageNum(
    par90Amount, 
    activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0)
  );
  
  // Total portfolio
  const totalPortfolio = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalLoansCount = activeLoans.length;
  
  // Risk rating based on PAR 30
  const getRiskRating = (par30: number) => {
    if (par30 < 5) return { label: 'Low Risk', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (par30 < 10) return { label: 'Medium Risk', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
    return { label: 'High Risk', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };
  
  const riskRating = getRiskRating(par30Percent);
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <div className="p-8">
      <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Portfolio at Risk (PAR) Report</h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {organizationName}
            </p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Period: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
            </p>
          </div>
        </div>
        
        {/* Portfolio Summary */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Portfolio Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>Total Active Loans</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{totalLoansCount}</p>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-green-700'}`}>Total Portfolio</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-green-900'}`}>
                {currencyCode} {(totalPortfolio / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${riskRating.bgColor} ${riskRating.borderColor}`}>
              <p className={`text-sm ${riskRating.color}`}>Portfolio Risk Rating</p>
              <p className={`text-2xl font-bold ${riskRating.color}`}>{riskRating.label}</p>
            </div>
          </div>
        </div>
        
        {/* PAR Metrics */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>PAR Breakdown</h3>
          <div className="overflow-x-auto">
            <table className={`w-full ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className="px-4 py-2 text-left text-sm">PAR Category</th>
                  <th className="px-4 py-2 text-right text-sm">Number of Loans</th>
                  <th className="px-4 py-2 text-right text-sm">Amount at Risk</th>
                  <th className="px-4 py-2 text-right text-sm">% of Portfolio</th>
                  <th className="px-4 py-2 text-center text-sm">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {/* PAR 1 */}
                <tr>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold">PAR 1</p>
                      <p className="text-xs opacity-75">1-6 days overdue</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{loansOverdue1.length}</td>
                  <td className="px-4 py-3 text-right">{currencyCode} {par1Amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">{par1Percent.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      par1Percent < 10 ? 'bg-green-100 text-green-800' : 
                      par1Percent < 20 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {par1Percent < 10 ? 'Good' : par1Percent < 20 ? 'Warning' : 'Critical'}
                    </span>
                  </td>
                </tr>
                
                {/* PAR 7 */}
                <tr>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold">PAR 7</p>
                      <p className="text-xs opacity-75">7-29 days overdue</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{loansOverdue7.length}</td>
                  <td className="px-4 py-3 text-right">{currencyCode} {par7Amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">{par7Percent.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      par7Percent < 8 ? 'bg-green-100 text-green-800' : 
                      par7Percent < 15 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {par7Percent < 8 ? 'Good' : par7Percent < 15 ? 'Warning' : 'Critical'}
                    </span>
                  </td>
                </tr>
                
                {/* PAR 30 */}
                <tr className={isDark ? 'bg-gray-700/50' : 'bg-amber-50/50'}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold">PAR 30</p>
                      <p className="text-xs opacity-75">30-89 days overdue (Industry Standard)</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{loansOverdue30.length}</td>
                  <td className="px-4 py-3 text-right font-semibold">{currencyCode} {par30Amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-lg">{par30Percent.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded font-semibold text-sm ${
                      par30Percent < 5 ? 'bg-green-100 text-green-800' : 
                      par30Percent < 10 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {par30Percent < 5 ? 'Excellent' : par30Percent < 10 ? 'Acceptable' : 'High Risk'}
                    </span>
                  </td>
                </tr>
                
                {/* PAR 90 */}
                <tr>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold">PAR 90</p>
                      <p className="text-xs opacity-75">90+ days overdue</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{loansOverdue90.length}</td>
                  <td className="px-4 py-3 text-right">{currencyCode} {par90Amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">{par90Percent.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      par90Percent < 2 ? 'bg-green-100 text-green-800' : 
                      par90Percent < 5 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {par90Percent < 2 ? 'Good' : par90Percent < 5 ? 'Warning' : 'Critical'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Industry Benchmarks */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Industry Benchmarks</h3>
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Microfinance Standards:</p>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• PAR 30 &lt; 5%: Excellent portfolio quality</li>
                  <li>• PAR 30 5-10%: Acceptable, requires monitoring</li>
                  <li>• PAR 30 &gt; 10%: High risk, immediate action needed</li>
                  <li>• PAR 90 &lt; 2%: Good recovery practices</li>
                </ul>
              </div>
              <div>
                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Your Performance:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>PAR 30:</span>
                    <span className={`font-bold ${
                      par30Percent < 5 ? 'text-green-600' : 
                      par30Percent < 10 ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                      {par30Percent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>PAR 90:</span>
                    <span className={`font-bold ${
                      par90Percent < 2 ? 'text-green-600' : 
                      par90Percent < 5 ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                      {par90Percent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rating:</span>
                    <span className={`font-bold ${riskRating.color}`}>{riskRating.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        {par30Percent >= 5 && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
              Recommendations
            </h3>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              {par30Percent >= 10 && <li>• <strong>Urgent:</strong> PAR 30 exceeds 10% - implement immediate collection efforts</li>}
              {loansOverdue30.length > 0 && <li>• Focus on {loansOverdue30.length} loans that are 30+ days overdue</li>}
              {loansOverdue7.length > loansOverdue30.length && <li>• Prevent escalation: {loansOverdue7.length - loansOverdue30.length} loans at risk of becoming PAR 30</li>}
              <li>• Review lending criteria and approval process</li>
              <li>• Enhance client follow-up procedures</li>
              <li>• Consider loan restructuring for viable clients</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}