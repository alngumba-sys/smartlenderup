import { X, Shield, Clock, User, Monitor, FileText, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { auditLogs } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';

interface AuditLogModalProps {
  auditId: string;
  onClose: () => void;
}

export function AuditLogModal({ auditId, onClose }: AuditLogModalProps) {
  const { isDark } = useTheme();
  const log = auditLogs.find(l => l.id === auditId);

  if (!log) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="size-8 text-emerald-600" />;
      case 'Failed':
        return <AlertCircle className="size-8 text-red-600" />;
      case 'Warning':
        return <AlertTriangle className="size-8 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Failed: 'bg-red-100 text-red-800 border-red-200',
      Warning: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="size-6 text-blue-600" />
            <div>
              <h2 className="text-gray-900">Audit Log Details</h2>
              <p className="text-gray-600 text-sm">{log.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${getStatusBadge(log.status)} flex items-center gap-3`}>
            {getStatusIcon(log.status)}
            <div className="flex-1">
              <p className="text-sm">Activity Status</p>
              <p className="text-lg">{log.status}</p>
            </div>
          </div>

          {/* Activity Information */}
          <div>
            <h3 className="text-gray-900 mb-3">Activity Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="size-4 text-gray-600" />
                    <p className="text-gray-600 text-sm">Timestamp</p>
                  </div>
                  <p className="text-gray-900">{log.timestamp}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="size-4 text-gray-600" />
                    <p className="text-gray-600 text-sm">Action</p>
                  </div>
                  <p className="text-gray-900">{log.action}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getModuleBadge(log.module)}`}>
                    {log.module}
                  </span>
                  <span className="text-gray-600 text-sm">Module</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-gray-900 mb-3">User Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <User className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{log.userName}</p>
                  <p className="text-gray-600 text-sm">User ID: {log.userId}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="size-4 text-gray-600" />
                  <p className="text-gray-600 text-sm">IP Address</p>
                </div>
                <p className="text-gray-900 font-mono text-sm">{log.ipAddress}</p>
              </div>
            </div>
          </div>

          {/* Entity Information */}
          <div>
            <h3 className="text-gray-900 mb-3">Affected Entity</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Entity ID</p>
                  <p className="text-gray-900">{log.entityId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Entity Type</p>
                  <p className="text-gray-900">{log.entityType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Changes Made */}
          {log.changes && (
            <div>
              <h3 className="text-gray-900 mb-3">Changes Made</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-900 text-sm leading-relaxed">{log.changes}</p>
              </div>
            </div>
          )}

          {/* Timeline Context */}
          <div>
            <h3 className="text-gray-900 mb-3">Recent Related Activities</h3>
            <div className="space-y-2">
              {auditLogs
                .filter(l => 
                  l.entityId === log.entityId && 
                  l.id !== log.id &&
                  new Date(l.timestamp) >= new Date(new Date(log.timestamp).getTime() - 24 * 60 * 60 * 1000)
                )
                .slice(0, 3)
                .map(relatedLog => (
                  <div key={relatedLog.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900 text-sm">{relatedLog.action}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getModuleBadge(relatedLog.module)}`}>
                          {relatedLog.module}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{relatedLog.userName}</span>
                        <span>•</span>
                        <span>{relatedLog.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              {auditLogs.filter(l => l.entityId === log.entityId && l.id !== log.id).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No recent related activities found</p>
              )}
            </div>
          </div>

          {/* Security Information */}
          <div>
            <h3 className="text-gray-900 mb-3">Security Context</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Session Type</p>
                  <p className="text-gray-900">Web Application</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Authentication Method</p>
                  <p className="text-gray-900">Password + 2FA</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Browser</p>
                  <p className="text-gray-900">Chrome 120.0</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Operating System</p>
                  <p className="text-gray-900">Windows 10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Notes */}
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <div className="flex items-start gap-2">
              <Shield className="size-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-900 text-sm">
                  This audit log is maintained for compliance purposes and is retained for 7 years
                  as required by regulatory guidelines. Logs are immutable and cryptographically secured.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
            Export Log Entry
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}