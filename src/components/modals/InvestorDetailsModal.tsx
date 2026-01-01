import { X, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface InvestorDetailsModalProps {
  investorId: string;
  onClose: () => void;
}

export function InvestorDetailsModal({ investorId, onClose }: InvestorDetailsModalProps) {
  const { isDark } = useTheme();

  const investorDetails = {
    id: investorId,
    name: 'Sarah Kimani',
    email: 'sarah.kimani@email.com',
    phone: '+254 720 111 222',
    nationalId: '12345678',
    kraPin: 'A001234567P',
    totalInvested: 5000000,
    activeInvestments: 12,
    returns: 750000,
    roi: 15,
    status: 'Active',
    joinDate: '2023-01-15'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${isDark ? 'dark' : ''}`}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900 dark:text-white">Investor Details - {investorDetails.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="size-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Invested</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-white">KES {investorDetails.totalInvested.toLocaleString()}</p>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Returns</span>
              </div>
              <p className="text-2xl text-emerald-600 dark:text-emerald-400">KES {investorDetails.returns.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="size-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">ROI</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-white">{investorDetails.roi}%</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
            <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Investor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{investorDetails.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{investorDetails.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{investorDetails.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">National ID</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{investorDetails.nationalId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">KRA PIN</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{investorDetails.kraPin}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Join Date</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{investorDetails.joinDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Investments</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{investorDetails.activeInvestments} loans</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 mt-1">
                  {investorDetails.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              View Investments
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              View Transactions
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
