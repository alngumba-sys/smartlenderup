import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Lock, Eye, Database, Server } from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'password_reset' | 'suspicious_activity' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user: string;
  ip_address: string;
  timestamp: string;
  status: 'resolved' | 'investigating' | 'new';
}

export function SecurityTab() {
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: 'SEC-001',
      type: 'login_attempt',
      severity: 'medium',
      description: 'Multiple failed login attempts from same IP',
      user: 'admin@yaralimited.com',
      ip_address: '197.248.15.23',
      timestamp: '2024-01-15T15:45:00',
      status: 'new'
    },
    {
      id: 'SEC-002',
      type: 'data_access',
      severity: 'low',
      description: 'Bulk client data export',
      user: 'superadmin',
      ip_address: '41.90.64.12',
      timestamp: '2024-01-15T10:30:00',
      status: 'resolved'
    },
    {
      id: 'SEC-003',
      type: 'system_change',
      severity: 'high',
      description: 'Platform pricing configuration changed',
      user: 'superadmin',
      ip_address: '102.68.79.45',
      timestamp: '2024-01-14T16:20:00',
      status: 'resolved'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#991b1b';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#ef4444';
      case 'investigating': return '#f59e0b';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const criticalCount = securityEvents.filter(e => e.severity === 'critical').length;
  const highCount = securityEvents.filter(e => e.severity === 'high').length;
  const newCount = securityEvents.filter(e => e.status === 'new').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Security Status Dashboard</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Monitor platform security and system health</p>
        </div>
      </div>

      {/* Overall Security Status */}
      <div className="mb-8 p-6 rounded-lg" style={{ 
        backgroundColor: newCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
        border: `1px solid ${newCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` 
      }}>
        <div className="flex items-center gap-3">
          <Shield className="size-8" style={{ color: newCount > 0 ? '#ef4444' : '#10b981' }} />
          <div>
            <h3 className="text-xl font-bold" style={{ color: newCount > 0 ? '#ef4444' : '#10b981' }}>
              {newCount > 0 ? 'Security Alerts Detected' : 'All Systems Secure'}
            </h3>
            <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
              {newCount > 0 ? `${newCount} new security event(s) require attention` : 'No active security threats detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
              <AlertTriangle className="size-5" style={{ color: '#ef4444' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#ef4444' }}>{criticalCount + highCount}</h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Critical/High Severity</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
              <Activity className="size-5" style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#f59e0b' }}>{newCount}</h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>New Events</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle className="size-5" style={{ color: '#10b981' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#10b981' }}>
            {securityEvents.filter(e => e.status === 'resolved').length}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Resolved</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
              <Lock className="size-5" style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#3b82f6' }}>{securityEvents.length}</h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Events</p>
        </div>
      </div>

      {/* System Health */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SystemHealthCard 
            title="Database Status"
            icon={Database}
            status="Operational"
            statusColor="#10b981"
            metrics={[
              { label: 'Connection Pool', value: '95%' },
              { label: 'Response Time', value: '45ms' }
            ]}
          />
          <SystemHealthCard 
            title="API Performance"
            icon={Server}
            status="Operational"
            statusColor="#10b981"
            metrics={[
              { label: 'Uptime', value: '99.9%' },
              { label: 'Requests/min', value: '1,234' }
            ]}
          />
          <SystemHealthCard 
            title="Data Security"
            icon={Shield}
            status="Protected"
            statusColor="#10b981"
            metrics={[
              { label: 'Encryption', value: 'AES-256' },
              { label: 'Last Backup', value: '2 hours ago' }
            ]}
          />
        </div>
      </div>

      {/* Recent Security Events */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Recent Security Events</h3>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#154F73' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Event ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>User</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {securityEvents.map((event, index) => (
                <tr 
                  key={event.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#032b43' : '#020838',
                    borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono" style={{ color: '#e8d1c9' }}>{event.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6'
                    }}>
                      {event.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: '#e8d1c9' }}>{event.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: '#e8d1c9' }}>{event.user}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>{event.ip_address}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold uppercase" style={{ color: getSeverityColor(event.severity) }}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(event.status) }}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="mt-8 p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: '#3b82f6' }}>🔒 Security Best Practices</h4>
        <ul className="space-y-2 text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
          <li>✓ All passwords are hashed using bcrypt</li>
          <li>✓ Session tokens expire after 24 hours of inactivity</li>
          <li>✓ API rate limiting: 100 requests per minute per IP</li>
          <li>✓ Database backups: Every 6 hours, retained for 30 days</li>
          <li>✓ All admin actions are logged in audit trail</li>
          <li>✓ SSL/TLS encryption enforced on all connections</li>
        </ul>
      </div>
    </div>
  );
}

function SystemHealthCard({ 
  title, 
  icon: Icon, 
  status, 
  statusColor, 
  metrics 
}: { 
  title: string; 
  icon: any; 
  status: string; 
  statusColor: string; 
  metrics: { label: string; value: string }[];
}) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${statusColor}20` }}>
          <Icon className="size-5" style={{ color: statusColor }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{title}</p>
          <p className="text-xs font-bold" style={{ color: statusColor }}>{status}</p>
        </div>
      </div>
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{metric.label}</span>
            <span className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
