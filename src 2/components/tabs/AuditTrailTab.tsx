import { Shield, Filter, Download, Search, CheckCircle, AlertCircle, AlertTriangle, Calendar, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';

export function AuditTrailTab() {
  const { auditLogs } = useData();
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStartTime, setExportStartTime] = useState('00:00');
  const [exportEndTime, setExportEndTime] = useState('23:59');
  const [userIp, setUserIp] = useState('Fetching...');

  // Fetch user's real IP address
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Unknown'));
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.changes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="size-4 text-emerald-600" />;
      case 'Failed':
        return <AlertCircle className="size-4 text-red-600" />;
      case 'Warning':
        return <AlertTriangle className="size-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Success: 'bg-emerald-100 text-emerald-800',
      Failed: 'bg-red-100 text-red-800',
      Warning: 'bg-amber-100 text-amber-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getModuleBadge = (module: string) => {
    const colors = {
      Client: 'bg-blue-100 text-blue-800',
      Loan: 'bg-purple-100 text-purple-800',
      Payment: 'bg-emerald-100 text-emerald-800',
      Savings: 'bg-cyan-100 text-cyan-800',
      User: 'bg-orange-100 text-orange-800',
      System: 'bg-gray-100 text-gray-800',
      Group: 'bg-pink-100 text-pink-800',
      Collection: 'bg-amber-100 text-amber-800'
    };
    return colors[module as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleExportLogs = () => {
    if (!exportStartDate || !exportEndDate) {
      toast.error('Please select both start and end dates for export.');
      return;
    }

    const startDate = new Date(`${exportStartDate}T${exportStartTime}:00`);
    const endDate = new Date(`${exportEndDate}T${exportEndTime}:00`);

    if (startDate > endDate) {
      toast.error('Start date must be before end date.');
      return;
    }

    const filteredExportLogs = auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });

    if (filteredExportLogs.length === 0) {
      toast.error('No audit logs found for the selected date range.');
      return;
    }

    const csvContent = [
      'Timestamp,User,Action,Module,Entity,Changes,IP Address,Status'
    ].concat(
      filteredExportLogs.map(log => [
        log.timestamp,
        log.userName,
        log.action,
        log.module,
        `${log.entityId} (${log.entityType})`,
        log.changes,
        log.ipAddress,
        log.status
      ].join(','))
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${exportStartDate}_to_${exportEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    toast.success(`Successfully exported ${filteredExportLogs.length} audit log(s) to CSV`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white">Audit Trail</h2>
          <p className="text-gray-600 dark:text-gray-400">System activity log and security monitoring • Your IP: {userIp}</p>
        </div>
        <button 
          onClick={() => setShowExportModal(true)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Download className="size-4" />
          Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(17,17,32)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Activities</p>
              <p className="text-gray-900 dark:text-white text-2xl">{auditLogs.length}</p>
            </div>
            <Shield className="size-8 text-blue-600" />
          </div>
        </div>
        <div className="dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(17,17,32)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Successful</p>
              <p className="text-gray-900 dark:text-white text-2xl">{auditLogs.filter(l => l.status === 'Success').length}</p>
            </div>
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
        </div>
        <div className="dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(17,17,32)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Failed</p>
              <p className="text-gray-900 dark:text-white text-2xl">{auditLogs.filter(l => l.status === 'Failed').length}</p>
            </div>
            <AlertCircle className="size-8 text-red-600" />
          </div>
        </div>
        <div className="dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(17,17,32)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Warnings</p>
              <p className="text-gray-900 dark:text-white text-2xl">{auditLogs.filter(l => l.status === 'Warning').length}</p>
            </div>
            <AlertTriangle className="size-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(17,17,32)]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Module:</span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Modules</option>
              <option value="Client">Client</option>
              <option value="Loan">Loan</option>
              <option value="Payment">Payment</option>
              <option value="Savings">Savings</option>
              <option value="User">User</option>
              <option value="System">System</option>
              <option value="Group">Group</option>
              <option value="Collection">Collection</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Warning">Warning</option>
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="size-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 text-xs w-[140px]">Timestamp</th>
                <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 text-xs w-[120px]">User</th>
                <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 text-xs w-[180px]">Action</th>
                <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 text-xs w-[90px]">Module</th>
                <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 text-xs w-[120px]">Entity</th>
                <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 text-xs">Changes</th>
                <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 text-xs w-[110px]">IP Address</th>
                <th className="px-3 py-3 text-center text-gray-700 dark:text-gray-300 text-xs w-[90px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 py-3 text-gray-900 dark:text-white text-xs">{log.timestamp}</td>
                  <td className="px-3 py-3 text-xs">
                    <div className="truncate max-w-[120px]" title={log.userName}>
                      <div className="text-gray-900 dark:text-white truncate">{log.userName}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-[10px] truncate">{log.userId}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 dark:text-white text-xs">
                    <div className="truncate max-w-[180px]" title={log.action}>{log.action}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap ${getModuleBadge(log.module)}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className="truncate max-w-[120px]" title={log.entityId}>
                      <div className="text-gray-900 dark:text-white truncate">{log.entityId}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-[10px] truncate">{log.entityType}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    <div className="line-clamp-2 break-words" title={log.changes}>{log.changes}</div>
                  </td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-400 font-mono text-[10px]">
                    <div className="truncate" title={log.ipAddress || userIp}>{log.ipAddress || userIp}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Shield className="size-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No audit logs match your filters</p>
          </div>
        )}
        {filteredLogs.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white">Export Audit Logs</h3>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setShowExportModal(false)}>
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Start Date</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Start Time</label>
                  <input
                    type="time"
                    value={exportStartTime}
                    onChange={(e) => setExportStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">End Date</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">End Time</label>
                  <input
                    type="time"
                    value={exportEndTime}
                    onChange={(e) => setExportEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm" onClick={handleExportLogs}>
                <Download className="size-4" />
                Export Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}