import { X, Users, Calendar, TrendingUp, MapPin, CheckCircle, AlertTriangle, Phone, Clock, FileText, Eye, Download } from 'lucide-react';
import { groups, clients, groupMeetings } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';

interface GroupDetailsModalProps {
  groupId: string;
  onClose: () => void;
}

export function GroupDetailsModal({ groupId, onClose }: GroupDetailsModalProps) {
  const { isDark } = useTheme();
  const group = groups.find(g => g.id === groupId);
  const meetings = groupMeetings.filter(m => m.groupId === groupId).sort((a, b) => 
    new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
  );
  const groupClients = clients.filter(c => c.groupAffiliation === group?.name);

  if (!group) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const avgAttendance = meetings.length > 0
    ? Math.round(meetings.reduce((sum, m) => sum + m.attendance, 0) / meetings.length)
    : 0;

  const totalCollections = meetings.reduce((sum, m) => sum + m.collectionsAmount, 0);
  const totalDisbursements = meetings.reduce((sum, m) => sum + m.disbursementsAmount, 0);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-gray-900 mb-1">{group.name}</h2>
              <div className="flex items-center gap-3 text-sm mt-2">
                <span className="text-gray-700">{group.id}</span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(group.groupStatus)}`}>
                  {group.groupStatus}
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin className="size-3" />
                  {group.location}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Users className="size-5 text-blue-600" />
                <span className="text-blue-900 text-2xl">{group.totalMembers}</span>
              </div>
              <p className="text-blue-900 text-sm">Total Members</p>
              <p className="text-blue-700 text-xs mt-1">{group.activeMembers} Active</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="size-5 text-emerald-600" />
                <span className="text-emerald-900 text-xl">KES {(group.totalLoans / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-emerald-900 text-sm">Total Loans</p>
              <p className="text-emerald-700 text-xs mt-1">{groupClients.length} Active Loans</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="size-5 text-purple-600" />
                <span className="text-purple-900 text-xl">KES {(group.totalSavings / 1000).toFixed(0)}K</span>
              </div>
              <p className="text-purple-900 text-sm">Total Savings</p>
              <p className="text-purple-700 text-xs mt-1">Group Fund</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                {group.defaultRate === 0 ? (
                  <CheckCircle className="size-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="size-5 text-amber-600" />
                )}
                <span className={`text-2xl ${group.defaultRate === 0 ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {group.defaultRate}%
                </span>
              </div>
              <p className={group.defaultRate === 0 ? 'text-emerald-900 text-sm' : 'text-amber-900 text-sm'}>Default Rate</p>
              <p className={group.defaultRate === 0 ? 'text-emerald-700 text-xs mt-1' : 'text-amber-700 text-xs mt-1'}>
                {group.defaultRate === 0 ? 'Excellent!' : 'Needs Attention'}
              </p>
            </div>
          </div>

          {/* Group Leadership */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-gray-900 mb-4">Group Leadership</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-blue-600 text-xs">Chairperson</p>
                <p className="text-blue-900 mt-1">{group.chairperson}</p>
                <p className="text-blue-700 text-xs mt-1 flex items-center gap-1">
                  <Phone className="size-3" />
                  {group.chairpersonPhone}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-emerald-600 text-xs">Secretary</p>
                <p className="text-emerald-900 mt-1">{group.secretary}</p>
                <p className="text-emerald-700 text-xs mt-1 flex items-center gap-1">
                  <Phone className="size-3" />
                  {group.secretaryPhone}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-purple-600 text-xs">Treasurer</p>
                <p className="text-purple-900 mt-1">{group.treasurer}</p>
                <p className="text-purple-700 text-xs mt-1 flex items-center gap-1">
                  <Phone className="size-3" />
                  {group.treasurerPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Meeting Schedule */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="size-5 text-emerald-600" />
              Meeting Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="size-5 text-gray-600" />
                <div>
                  <p className="text-gray-600 text-xs">Meeting Day</p>
                  <p className="text-gray-900">{group.meetingDay}s</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="size-5 text-gray-600" />
                <div>
                  <p className="text-gray-600 text-xs">Meeting Time</p>
                  <p className="text-gray-900">{group.meetingTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="size-5 text-gray-600" />
                <div>
                  <p className="text-gray-600 text-xs">Average Attendance</p>
                  <p className="text-gray-900">{avgAttendance} members ({Math.round((avgAttendance / group.totalMembers) * 100)}%)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="size-5 text-gray-600" />
                <div>
                  <p className="text-gray-600 text-xs">Registration Date</p>
                  <p className="text-gray-900">{group.registrationDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900">Recent Meetings ({meetings.length})</h3>
              <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                Record New Meeting
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Date</th>
                    <th className="px-4 py-3 text-center text-gray-700">Attendance</th>
                    <th className="px-4 py-3 text-right text-gray-700">Collections</th>
                    <th className="px-4 py-3 text-right text-gray-700">Disbursements</th>
                    <th className="px-4 py-3 text-right text-gray-700">Fines</th>
                    <th className="px-4 py-3 text-left text-gray-700">Conducted By</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meeting) => (
                    <tr key={meeting.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{meeting.meetingDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          meeting.attendance === group.totalMembers ? 'bg-emerald-100 text-emerald-800' :
                          meeting.attendance >= group.totalMembers * 0.8 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {meeting.attendance}/{group.totalMembers}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-900">
                        KES {meeting.collectionsAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-900">
                        KES {meeting.disbursementsAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-900">
                        {meeting.finesCollected > 0 ? `KES ${meeting.finesCollected.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{meeting.conductedBy}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Total</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right text-emerald-900">
                      KES {totalCollections.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-blue-900">
                      KES {totalDisbursements.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-900">
                      KES {meetings.reduce((sum, m) => sum + m.finesCollected, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Meeting Notes */}
            <div className="mt-4 space-y-2">
              <h4 className="text-gray-700 text-sm">Recent Meeting Notes</h4>
              {meetings.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="p-2 bg-gray-50 rounded text-xs">
                  <span className="text-gray-600">{meeting.meetingDate}: </span>
                  <span className="text-gray-900 italic">{meeting.notes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Group Documents */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900">Group Documents</h3>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2">
                <FileText className="size-4" />
                Upload Document
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <FileText className="size-12 mx-auto mb-2 text-gray-300" />
              <p>No documents uploaded yet</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Record Meeting
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Send SMS to Group
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Add Member
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