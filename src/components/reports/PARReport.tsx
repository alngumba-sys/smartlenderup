import { useData } from '../../contexts/DataContext';
import { safePercentage, safeDivideNum, safePercentageNum } from '../../utils/safeCalculations';
import { useTheme } from '../../contexts/ThemeContext';
import { getOrganizationName, getOrganizationLogo } from '../../utils/organizationUtils';
import logoImage from "figma:asset/e19de9b1a3313f261c0276da257bd631603f9688.png";

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
  
  return (
    <div className="p-8">
      <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center gap-4 mb-6">
          <img src={logoImage} alt="Organization Logo" className="h-12 w-auto object-contain" />
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Portfolio at Risk (PAR) Report</h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {organizationName}
            </p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Period: {dateRange.startDate} to {dateRange.endDate}
            </p>
          </div>
        </div>
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>PAR Report - Coming Soon</p>
        </div>
      </div>
    </div>
  );
}