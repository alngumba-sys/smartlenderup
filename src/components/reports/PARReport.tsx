import { useData } from '../../contexts/DataContext';
import { safePercentage, safeDivideNum, safePercentageNum } from '../../utils/safeCalculations';
const logo = '/logo.svg'; // Replaced figma:asset for deployment
import { getOrganizationName, getOrganizationLogo } from '../../utils/organizationUtils';

interface ReportProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function PARReport({ dateRange }: ReportProps) {
  const { loans, clients } = useData();
  const organizationName = getOrganizationName();
  const organizationLogo = getOrganizationLogo();
  
  return (
    <div className="p-8">
      <div className="bg-[rgb(17,17,32)] rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <img src={organizationLogo || logo} alt="Organization Logo" className="size-16" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portfolio at Risk (PAR) Report</h2>
            <p className="text-gray-600">
              {organizationName}
            </p>
            <p className="text-gray-600">
              Period: {dateRange.startDate} to {dateRange.endDate}
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p>PAR Report - Coming Soon</p>
        </div>
      </div>
    </div>
  );
}