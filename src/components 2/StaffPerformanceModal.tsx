import { X, TrendingUp, Users, DollarSign, Target, Award, AlertTriangle, Star } from 'lucide-react';
import { staffPerformance, commissionStructure, loans, clients } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';

interface StaffPerformanceModalProps {
  staffId: string;
  onClose: () => void;
}

export function StaffPerformanceModal({ staffId, onClose }: StaffPerformanceModalProps) {
  const { isDark } = useTheme();
  const staff = staffPerformance.find(s => s.staffId === staffId);
  
  if (!staff) {
    return null;
  }

  const staffLoans = loans.filter(l => l.loanOfficer === staff.name);
  const staffClients = clients.filter(c => 
    staffLoans.some(l => l.clientId === c.id)
  );

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`size-5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getCurrentTier = () => {
    const amount = staff.disbursementAmountThisMonth;
    return commissionStructure.find(
      tier => amount >= tier.minDisbursement && amount <= tier.maxDisbursement
    );
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    if (!currentTier) return null;
    const currentIndex = commissionStructure.indexOf(currentTier);
    return currentIndex < commissionStructure.length - 1 
      ? commissionStructure[currentIndex + 1]
      : null;
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-gray-900 mb-1">{staff.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-gray-700 text-sm">{staff.role}</span>
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  {staff.branch}
                </span>
                <div className="flex items-center gap-1">
                  {getRatingStars(staff.rating)}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Users className="size-5 text-blue-600" />
                <span className="text-blue-900 text-2xl">{staff.activeClients}</span>
              </div>
              <p className="text-blue-900 text-sm">Active Clients</p>
              <p className="text-blue-700 text-xs mt-1">+{staff.newClientsThisMonth} this month</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="size-5 text-emerald-600" />
                <span className="text-emerald-900 text-xl">KES {(staff.disbursementAmountThisMonth / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-emerald-900 text-sm">Disbursed</p>
              <p className="text-emerald-700 text-xs mt-1">{staff.loansDisbursedThisMonth} loans</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="size-5 text-purple-600" />
                <span className="text-purple-900 text-2xl">{staff.collectionRate}%</span>
              </div>
              <p className="text-purple-900 text-sm">Collection Rate</p>
              <p className="text-purple-700 text-xs mt-1">
                {staff.collectionRate >= 95 ? 'Excellent' : staff.collectionRate >= 90 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                {staff.portfolioAtRisk < 5 ? (
                  <Award className="size-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="size-5 text-amber-600" />
                )}
                <span className={`text-2xl ${staff.portfolioAtRisk < 5 ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {staff.portfolioAtRisk}%
                </span>
              </div>
              <p className={staff.portfolioAtRisk < 5 ? 'text-emerald-900 text-sm' : 'text-amber-900 text-sm'}>
                Portfolio at Risk
              </p>
              <p className={staff.portfolioAtRisk < 5 ? 'text-emerald-700 text-xs mt-1' : 'text-amber-700 text-xs mt-1'}>
                {staff.portfolioAtRisk < 5 ? 'Low Risk' : 'Monitor Closely'}
              </p>
            </div>
          </div>

          {/* Target Achievement */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="size-5 text-blue-600" />
              <h3 className="text-gray-900">Target Achievement</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Monthly Target</span>
                  <span className={staff.targetAchievement >= 100 ? 'text-emerald-900' : 'text-gray-900'}>
                    {staff.targetAchievement}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      staff.targetAchievement >= 100 ? 'bg-emerald-600' :
                      staff.targetAchievement >= 80 ? 'bg-blue-600' :
                      staff.targetAchievement >= 60 ? 'bg-amber-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(staff.targetAchievement, 100)}%` }}
                  />
                </div>
              </div>
              {staff.targetAchievement >= 100 && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-emerald-900 text-sm flex items-center gap-2">
                    <Award className="size-4" />
                    Target exceeded! Bonus eligible.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Commission Structure */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">Commission Structure</h3>
            </div>
            
            {/* Current Tier */}
            {currentTier && (
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border-2 border-emerald-300 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-emerald-900">Current Tier: {currentTier.tier}</p>
                    <p className="text-emerald-700 text-sm">Commission Rate: {currentTier.rate}%</p>
                    {currentTier.bonusCondition && staff.portfolioAtRisk < 3 && (
                      <p className="text-emerald-600 text-xs mt-1">
                        ✓ Bonus Eligible: KES {currentTier.bonusAmount?.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-900 text-xl">KES {staff.commissionEarned.toLocaleString()}</p>
                    <p className="text-emerald-700 text-sm">Earned this month</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Tier */}
            {nextTier && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-900 text-sm mb-2">Next Tier: {nextTier.tier}</p>
                <p className="text-blue-700 text-xs">
                  Need KES {(nextTier.minDisbursement - staff.disbursementAmountThisMonth).toLocaleString()} more disbursements to reach {nextTier.tier} tier ({nextTier.rate}% commission)
                </p>
                <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${Math.min((staff.disbursementAmountThisMonth / nextTier.minDisbursement) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* All Tiers */}
            <div className="mt-4">
              <p className="text-gray-700 text-sm mb-2">All Commission Tiers</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commissionStructure.map((tier) => (
                  <div
                    key={tier.tier}
                    className={`p-2 rounded border text-center ${
                      tier === currentTier
                        ? 'bg-emerald-100 border-emerald-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className={`text-xs ${tier === currentTier ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {tier.tier}
                    </p>
                    <p className={`text-lg ${tier === currentTier ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {tier.rate}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Portfolio */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-gray-900 mb-4">Recent Client Activity (Last 10)</h3>
            <div className="space-y-2">
              {staffClients.slice(0, 10).map((client) => {
                const clientLoans = loans.filter(l => l.clientId === client.id);
                const activeLoans = clientLoans.filter(l => l.status === 'Active' || l.status === 'In Arrears');
                return (
                  <div key={client.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-gray-900 text-sm">{client.name}</p>
                      <p className="text-gray-600 text-xs">{client.phone}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-gray-900">{activeLoans.length} active loans</p>
                      <p className={client.status === 'Good Standing' ? 'text-emerald-600' : 'text-red-600'}>
                        {client.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              View Full Report
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Set Targets
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}