import { useState } from 'react';
import { Search, Plus, Users, TrendingUp, Calendar, AlertTriangle, CheckCircle, MapPin, X, Info, DollarSign, UserCheck } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { GroupDetailsModal } from '../GroupDetailsModal';
import { NewGroupModal } from '../modals/NewGroupModal';
import { ViewToggle } from '../ViewToggle';
import { useTheme } from '../../contexts/ThemeContext';

export function GroupsTab() {
  const { isDark } = useTheme();
  const { groups, addGroup } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const handleNewGroup = (groupData: any) => {
    console.log('New group created:', groupData);
    
    // Create the complete group object
    const newGroup = {
      name: groupData.groupName,
      registrationDate: groupData.registrationDate || new Date().toISOString().split('T')[0],
      location: groupData.location,
      meetingDay: groupData.meetingDay,
      meetingTime: groupData.meetingTime,
      chairperson: groupData.chairperson,
      chairpersonPhone: groupData.chairpersonPhone,
      secretary: groupData.secretary,
      secretaryPhone: groupData.secretaryPhone,
      treasurer: groupData.treasurer,
      treasurerPhone: groupData.treasurerPhone,
      totalMembers: parseInt(groupData.totalMembers) || 0,
      activeMembers: parseInt(groupData.activeMembers) || parseInt(groupData.totalMembers) || 0,
      groupStatus: 'Active' as const,
      totalLoans: 0,
      totalSavings: 0,
      defaultRate: 0
    };
    
    addGroup(newGroup);
    setShowNewGroupModal(false);
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || group.groupStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.groupStatus === 'Active').length;
  const totalMembers = groups.reduce((sum, g) => sum + g.totalMembers, 0);
  const totalGroupLoans = groups.reduce((sum, g) => sum + g.totalLoans, 0);
  const totalGroupSavings = groups.reduce((sum, g) => sum + g.totalSavings, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Group Lending (Chamas)</h2>
          <p className="text-gray-600">Manage community savings and lending groups</p>
        </div>
        <button 
          onClick={() => setShowNewGroupModal(true)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Plus className="size-4" />
          Add Borrowers Group
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div 
          onClick={() => setSelectedMetric('total-groups')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Groups</p>
              <p className="text-gray-900 dark:text-white text-2xl mt-1">{totalGroups}</p>
            </div>
            <Users className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedMetric('active-groups')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active Groups</p>
              <p className="text-gray-900 dark:text-white text-2xl mt-1">{activeGroups}</p>
            </div>
            <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedMetric('total-members')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Members</p>
              <p className="text-gray-900 dark:text-white text-2xl mt-1">{totalMembers}</p>
            </div>
            <Users className="size-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedMetric('group-loans')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Group Loans</p>
              <p className="text-gray-900 dark:text-white text-xl mt-1">KES {(totalGroupLoans / 1000000).toFixed(1)}M</p>
            </div>
            <TrendingUp className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedMetric('group-savings')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Group Savings</p>
              <p className="text-gray-900 dark:text-white text-xl mt-1">KES {(totalGroupSavings / 1000).toFixed(0)}K</p>
            </div>
            <Calendar className="size-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by group name, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Groups View */}
      {viewMode === 'tile' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto pr-2">
          {filteredGroups.map((group) => {
            const groupClients = clients.filter(c => c.groupAffiliation === group.name);
            const groupLoans = loans.filter(l => groupClients.some(c => c.id === l.clientId));
            const activeLoans = groupLoans.filter(l => l.status === 'Active' || l.status === 'In Arrears');

            return (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      <Users className="size-6" />
                    </div>
                    <div>
                      <p className="text-gray-900">{group.name}</p>
                      <p className="text-gray-600 text-xs">{group.id}</p>
                    </div>
                  </div>
                </div>

                <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(group.groupStatus)}`}>
                  {group.groupStatus}
                </span>

                {/* Group Stats */}
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span className="text-gray-900">{group.activeMembers}/{group.totalMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900">{group.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meeting:</span>
                    <span className="text-gray-900">{group.meetingDay}s {group.meetingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Loans:</span>
                    <span className="text-gray-900">KES {(group.totalLoans / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Savings:</span>
                    <span className="text-gray-900">KES {(group.totalSavings / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                {/* Default Rate Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">Default Rate:</span>
                    <div className="flex items-center gap-1">
                      {group.defaultRate === 0 ? (
                        <CheckCircle className="size-4 text-emerald-600" />
                      ) : group.defaultRate < 5 ? (
                        <AlertTriangle className="size-4 text-amber-600" />
                      ) : (
                        <AlertTriangle className="size-4 text-red-600" />
                      )}
                      <span className={`text-sm ${
                        group.defaultRate === 0 ? 'text-emerald-900' :
                        group.defaultRate < 5 ? 'text-amber-900' :
                        'text-red-900'
                      }`}>
                        {group.defaultRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leadership */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                  <p><span className="text-gray-500">Chair:</span> {group.chairperson}</p>
                  <p className="text-gray-500 mt-0.5">{group.chairpersonPhone}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column Headings */}
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-40 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Group Name</span>
              </div>
              <div className="w-24 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Status</span>
              </div>
              <div className="w-28 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Location</span>
              </div>
              <div className="w-24 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Members</span>
              </div>
              <div className="w-24 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Meeting</span>
              </div>
              <div className="w-28 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Loans</span>
              </div>
              <div className="w-28 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Savings</span>
              </div>
              <div className="w-20 flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Default</span>
              </div>
              <div className="w-36 text-right flex-shrink-0">
                <span className="text-gray-700 text-xs uppercase tracking-wide">Chairperson</span>
              </div>
            </div>
          </div>

          {/* Group Rows */}
          <div className="max-h-[600px] overflow-y-auto pr-2">
            {filteredGroups.map((group) => {
              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Group Icon & Name */}
                    <div className="flex items-center gap-2.5 w-40 flex-shrink-0">
                      <div className="size-9 bg-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <Users className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm truncate leading-tight">{group.name}</p>
                        <p className="text-gray-500 text-xs leading-tight">{group.id}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="w-24 flex-shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs leading-tight ${getStatusColor(group.groupStatus)}`}>
                        {group.groupStatus}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-gray-600 text-xs w-28 flex-shrink-0">
                      <MapPin className="size-3.5 flex-shrink-0" />
                      <span className="truncate">{group.location}</span>
                    </div>

                    {/* Members */}
                    <div className="w-24 flex-shrink-0">
                      <span className="text-gray-900 text-xs">{group.activeMembers}/{group.totalMembers}</span>
                    </div>

                    {/* Meeting */}
                    <div className="w-24 flex-shrink-0">
                      <span className="text-gray-600 text-xs truncate">{group.meetingDay}s</span>
                    </div>

                    {/* Loans */}
                    <div className="w-28 flex-shrink-0">
                      <span className="text-gray-900 text-xs">KES {(group.totalLoans / 1000).toFixed(0)}K</span>
                    </div>

                    {/* Savings */}
                    <div className="w-28 flex-shrink-0">
                      <span className="text-gray-900 text-xs">KES {(group.totalSavings / 1000).toFixed(0)}K</span>
                    </div>

                    {/* Default Rate */}
                    <div className="flex items-center gap-1 w-20 flex-shrink-0">
                      {group.defaultRate === 0 ? (
                        <CheckCircle className="size-3.5 text-emerald-600 flex-shrink-0" />
                      ) : group.defaultRate < 5 ? (
                        <AlertTriangle className="size-3.5 text-amber-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="size-3.5 text-red-600 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${
                        group.defaultRate === 0 ? 'text-emerald-900' :
                        group.defaultRate < 5 ? 'text-amber-900' :
                        'text-red-900'
                      }`}>
                        {group.defaultRate}%
                      </span>
                    </div>

                    {/* Chairperson (Right aligned) */}
                    <div className="w-36 text-right flex-shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-900 text-xs truncate">Chair: {group.chairperson}</span>
                        <span className="text-gray-500 text-xs">{group.chairpersonPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <GroupDetailsModal
          groupId={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}

      {/* New Group Modal */}
      {showNewGroupModal && (
        <NewGroupModal
          isOpen={showNewGroupModal}
          onClose={() => setShowNewGroupModal(false)}
          onSubmit={handleNewGroup}
        />
      )}

      {/* Metric Details Modals */}
      {selectedMetric && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`} onClick={() => setSelectedMetric(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Group Metric Details</h3>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              {selectedMetric === 'total-groups' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="size-8 text-blue-600" />
                    <div>
                      <p className="text-blue-900 text-sm">Total Groups (Chamas)</p>
                      <p className="text-blue-900 text-3xl">{totalGroups}</p>
                      <p className="text-blue-700 text-sm">Registered community lending groups</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What are Groups (Chamas)?</h4>
                    <p className="text-gray-600 text-sm">
                      Chamas are community-based savings and lending groups where members pool resources, save together, 
                      and provide loans to each other. SmartLenderUp supports these groups with group lending products and training.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Group Overview</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Groups</p>
                        <p className="text-gray-900">{totalGroups} chamas</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Active Groups</p>
                        <p className="text-gray-900 text-emerald-600">{activeGroups} ({((activeGroups / totalGroups) * 100).toFixed(1)}%)</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Members</p>
                        <p className="text-gray-900">{totalMembers} people</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Group Size</p>
                        <p className="text-gray-900">{Math.round(totalMembers / totalGroups)} members</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Group Loans</p>
                        <p className="text-gray-900">KES {(totalGroupLoans / 1000000).toFixed(2)}M</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Savings</p>
                        <p className="text-gray-900">KES {(totalGroupSavings / 1000).toFixed(0)}K</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Groups by Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                        <span className="text-gray-700 text-sm flex items-center gap-2">
                          <CheckCircle className="size-4 text-emerald-600" />
                          Active Groups
                        </span>
                        <span className="text-emerald-900">{groups.filter(g => g.groupStatus === 'Active').length} groups</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-700 text-sm">Inactive Groups</span>
                        <span className="text-gray-900">{groups.filter(g => g.groupStatus === 'Inactive').length} groups</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-gray-700 text-sm flex items-center gap-2">
                          <AlertTriangle className="size-4 text-red-600" />
                          Suspended Groups
                        </span>
                        <span className="text-red-900">{groups.filter(g => g.groupStatus === 'Suspended').length} groups</span>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Largest Groups by Members</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {groups.sort((a, b) => b.totalMembers - a.totalMembers).slice(0, 8).map(group => (
                        <div key={group.id} className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-100">
                          <div>
                            <p className="text-gray-900 text-sm">{group.name}</p>
                            <p className="text-gray-600 text-xs">{group.location} • Chair: {group.chairperson}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-700 text-sm">{group.totalMembers} members</p>
                            <p className="text-gray-600 text-xs">{group.groupStatus}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{totalGroups} active chamas serve {totalMembers} community members across Kenya</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Average group size of {Math.round(totalMembers / totalGroups)} members promotes strong community bonds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Group lending reduces individual risk and promotes collective accountability</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'active-groups' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle className="size-8 text-emerald-600" />
                    <div>
                      <p className="text-emerald-900 text-sm">Active Groups</p>
                      <p className="text-emerald-900 text-3xl">{activeGroups}</p>
                      <p className="text-emerald-700 text-sm">{((activeGroups / totalGroups) * 100).toFixed(1)}% of all groups</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What are Active Groups?</h4>
                    <p className="text-gray-600 text-sm">
                      Active Groups are chamas that regularly meet, conduct savings activities, and have members actively 
                      participating in lending and repayment cycles. These groups demonstrate strong organizational health.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Active Group Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Active Groups</p>
                        <p className="text-gray-900">{activeGroups} chamas</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Active Rate</p>
                        <p className="text-gray-900 text-emerald-600">{((activeGroups / totalGroups) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Active Members</p>
                        <p className="text-gray-900">{groups.filter(g => g.groupStatus === 'Active').reduce((sum, g) => sum + g.activeMembers, 0)} people</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Meeting Attendance</p>
                        <p className="text-gray-900">92%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Loans (Active)</p>
                        <p className="text-gray-900">
                          KES {(groups.filter(g => g.groupStatus === 'Active').reduce((sum, g) => sum + g.totalLoans, 0) / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Savings (Active)</p>
                        <p className="text-gray-900">
                          KES {(groups.filter(g => g.groupStatus === 'Active').reduce((sum, g) => sum + g.totalSavings, 0) / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Active Groups List</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {groups.filter(g => g.groupStatus === 'Active').map(group => (
                        <div key={group.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded border border-emerald-100">
                          <div>
                            <p className="text-gray-900 text-sm">{group.name}</p>
                            <p className="text-gray-600 text-xs">{group.location} • {group.totalMembers} members</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-700 text-sm">{group.meetingDay}s</p>
                            <p className="text-gray-600 text-xs">Default: {group.defaultRate}%</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{((activeGroups / totalGroups) * 100).toFixed(1)}% active rate shows strong group engagement and leadership</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Regular meeting attendance of 92% indicates committed membership</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Active groups serve as models for new chama formation and best practices</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'total-members' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Users className="size-8 text-purple-600" />
                    <div>
                      <p className="text-purple-900 text-sm">Total Members</p>
                      <p className="text-purple-900 text-3xl">{totalMembers}</p>
                      <p className="text-purple-700 text-sm">Across all {totalGroups} groups</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What are Group Members?</h4>
                    <p className="text-gray-600 text-sm">
                      Group members are individuals who have joined a chama and participate in collective savings, 
                      lending activities, and community support. Members benefit from group solidarity and shared financial goals.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Membership Analytics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Members</p>
                        <p className="text-gray-900">{totalMembers} people</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Active Members</p>
                        <p className="text-gray-900">{groups.reduce((sum, g) => sum + g.activeMembers, 0)} people</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Group Size</p>
                        <p className="text-gray-900">{Math.round(totalMembers / totalGroups)} members</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Member Activity Rate</p>
                        <p className="text-gray-900 text-emerald-600">
                          {((groups.reduce((sum, g) => sum + g.activeMembers, 0) / totalMembers) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Savings per Member</p>
                        <p className="text-gray-900">KES {Math.round(totalGroupSavings / totalMembers).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Loan per Member</p>
                        <p className="text-gray-900">KES {Math.round(totalGroupLoans / totalMembers).toLocaleString()}</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Groups by Member Count</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-700 text-sm">Small Groups (1-10 members)</span>
                        <span className="text-gray-900">{groups.filter(g => g.totalMembers <= 10).length} groups</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-gray-700 text-sm">Medium Groups (11-20 members)</span>
                        <span className="text-purple-900">{groups.filter(g => g.totalMembers > 10 && g.totalMembers <= 20).length} groups</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-gray-700 text-sm">Large Groups (20+ members)</span>
                        <span className="text-blue-900">{groups.filter(g => g.totalMembers > 20).length} groups</span>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Benefits of Group Membership</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Access to affordable credit through group guarantee system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Financial education and business training through group meetings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Social support network and community solidarity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Lower interest rates compared to individual loans due to reduced risk</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'group-loans' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <TrendingUp className="size-8 text-emerald-600" />
                    <div>
                      <p className="text-emerald-900 text-sm">Group Loans</p>
                      <p className="text-emerald-900 text-3xl">KES {(totalGroupLoans / 1000000).toFixed(1)}M</p>
                      <p className="text-emerald-700 text-sm">KES {totalGroupLoans.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What are Group Loans?</h4>
                    <p className="text-gray-600 text-sm">
                      Group loans are lending products where the chama collectively guarantees loan repayment. 
                      Members support each other in business growth while sharing responsibility for timely repayment.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Group Lending Overview</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Group Loans</p>
                        <p className="text-gray-900">KES {(totalGroupLoans / 1000000).toFixed(2)}M</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Groups with Loans</p>
                        <p className="text-gray-900">{groups.filter(g => g.totalLoans > 0).length} groups</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Loan per Group</p>
                        <p className="text-gray-900">
                          KES {Math.round(totalGroupLoans / groups.filter(g => g.totalLoans > 0).length).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Loan per Member</p>
                        <p className="text-gray-900">KES {Math.round(totalGroupLoans / totalMembers).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Group Repayment Rate</p>
                        <p className="text-gray-900 text-emerald-600">94.5%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Default Rate</p>
                        <p className="text-gray-900">
                          {(groups.reduce((sum, g) => sum + g.defaultRate, 0) / totalGroups).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Top Groups by Loan Amount</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {groups.sort((a, b) => b.totalLoans - a.totalLoans).slice(0, 10).map(group => (
                        <div key={group.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded border border-emerald-100">
                          <div>
                            <p className="text-gray-900 text-sm">{group.name}</p>
                            <p className="text-gray-600 text-xs">{group.totalMembers} members • {group.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-700 text-sm">KES {(group.totalLoans / 1000).toFixed(0)}K</p>
                            <p className="text-gray-600 text-xs">Default: {group.defaultRate}%</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-gray-900 mt-4">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Group loans of KES {(totalGroupLoans / 1000000).toFixed(1)}M demonstrate strong demand for credit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>94.5% repayment rate shows group guarantee system is highly effective</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Peer pressure and collective responsibility reduce default risk significantly</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedMetric === 'group-savings' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Calendar className="size-8 text-amber-600" />
                    <div>
                      <p className="text-amber-900 text-sm">Group Savings</p>
                      <p className="text-amber-900 text-3xl">KES {(totalGroupSavings / 1000).toFixed(0)}K</p>
                      <p className="text-amber-700 text-sm">KES {totalGroupSavings.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-gray-900">What are Group Savings?</h4>
                    <p className="text-gray-600 text-sm">
                      Group savings represent collective funds pooled by chama members through regular contributions. 
                      These savings build group capital for lending, emergencies, and shared investments.
                    </p>
                    
                    <h4 className="text-gray-900 mt-4">Savings Analysis</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Group Savings</p>
                        <p className="text-gray-900">KES {(totalGroupSavings / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Groups with Savings</p>
                        <p className="text-gray-900">{groups.filter(g => g.totalSavings > 0).length} groups</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Savings per Group</p>
                        <p className="text-gray-900">KES {Math.round(totalGroupSavings / totalGroups).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Savings per Member</p>
                        <p className="text-gray-900">KES {Math.round(totalGroupSavings / totalMembers).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Savings Growth (YTD)</p>
                        <p className="text-gray-900 text-emerald-600">+23.4%</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Loan-to-Savings Ratio</p>
                        <p className="text-gray-900">{(totalGroupLoans / totalGroupSavings).toFixed(1)}x</p>
                      </div>
                    </div>

                    <h4 className="text-gray-900 mt-4">Top Groups by Savings</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {groups.sort((a, b) => b.totalSavings - a.totalSavings).slice(0, 10).map(group => (
                        <div key={group.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
                          <div>
                            <p className="text-gray-900 text-sm">{group.name}</p>
                            <p className="text-gray-600 text-xs">{group.totalMembers} members • {group.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-700 text-sm">KES {(group.totalSavings / 1000).toFixed(0)}K</p>
                            <p className="text-gray-600 text-xs">Chair: {group.chairperson}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-gray-900 mt-4">Savings Benefits</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Collective savings create capital base for internal lending to members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Regular contributions build financial discipline and emergency fund security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>23.4% YTD growth shows increasing member commitment and trust</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Higher savings-to-loan ratio indicates sustainable lending practices</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}