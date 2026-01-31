import { X, AlertTriangle, User, Phone, MapPin, DollarSign, Calendar, CreditCard, Shield, Activity, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface FraudInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  fraudType: 'unusual-deposit' | 'multiple-device' | 'inconsistent-id' | 'velocity-anomaly' | null;
}

export function FraudInstanceModal({ isOpen, onClose, fraudType }: FraudInstanceModalProps) {
  const { isDark } = useTheme();
  if (!isOpen || !fraudType) return null;

  const fraudData = {
    'unusual-deposit': {
      title: 'Unusual Deposit Pattern',
      severity: 'Medium',
      icon: Activity,
      color: 'amber',
      instances: [
        {
          id: 'FRD-001',
          clientId: 'CL019',
          clientName: 'Halima Abdi',
          phone: '+254 712 345 019',
          location: 'Kisumu',
          detectedDate: '2024-12-05',
          pattern: 'Multiple small deposits (KES 500-2,000) followed by large withdrawal request',
          transactions: [
            { date: '2024-12-01', type: 'Deposit', amount: 1500, method: 'M-Pesa', time: '08:15 AM' },
            { date: '2024-12-01', type: 'Deposit', amount: 800, method: 'M-Pesa', time: '10:45 AM' },
            { date: '2024-12-02', type: 'Deposit', amount: 2000, method: 'M-Pesa', time: '09:30 AM' },
            { date: '2024-12-03', type: 'Deposit', amount: 1200, method: 'M-Pesa', time: '11:20 AM' },
            { date: '2024-12-05', type: 'Withdrawal Request', amount: 45000, method: 'Bank Transfer', time: '02:15 PM' }
          ],
          riskScore: 68,
          aiAnalysis: 'Pattern suggests potential money laundering or account takeover. Client typically makes 1-2 deposits monthly. Current pattern shows 4 deposits in 5 days from different M-Pesa numbers, followed by unusual large withdrawal.',
          status: 'Under Review',
          assignedTo: 'Sarah Mwangi - Fraud Team'
        },
        {
          id: 'FRD-002',
          clientId: 'C033',
          clientName: 'David Ochieng',
          phone: '+254 712 345 033',
          location: 'Nairobi',
          detectedDate: '2024-12-07',
          pattern: '7 rapid deposits within 2 hours from same M-Pesa number',
          transactions: [
            { date: '2024-12-07', type: 'Deposit', amount: 500, method: 'M-Pesa', time: '01:00 PM' },
            { date: '2024-12-07', type: 'Deposit', amount: 500, method: 'M-Pesa', time: '01:15 PM' },
            { date: '2024-12-07', type: 'Deposit', amount: 1000, method: 'M-Pesa', time: '01:30 PM' },
            { date: '2024-12-07', type: 'Deposit', amount: 1500, method: 'M-Pesa', time: '01:45 PM' },
            { date: '2024-12-07', type: 'Deposit', amount: 2000, method: 'M-Pesa', time: '02:00 PM' },
            { date: '2024-12-07', type: 'Deposit', amount: 1000, method: 'M-Pesa', time: '02:30 PM' },
            { date: '2024-12-07', type: 'Deposit', amount: 1500, method: 'M-Pesa', time: '02:50 PM' }
          ],
          riskScore: 55,
          aiAnalysis: 'Unusual rapid-fire deposit pattern from single source. May indicate structuring to avoid detection thresholds or testing stolen credentials.',
          status: 'Under Review',
          assignedTo: 'Sarah Mwangi - Fraud Team'
        },
        {
          id: 'FRD-003',
          clientId: 'C047',
          clientName: 'Elizabeth Wambui',
          phone: '+254 712 345 047',
          location: 'Mombasa',
          detectedDate: '2024-12-06',
          pattern: 'Round-number deposits inconsistent with business pattern',
          transactions: [
            { date: '2024-12-04', type: 'Deposit', amount: 10000, method: 'M-Pesa', time: '03:00 PM' },
            { date: '2024-12-05', type: 'Deposit', amount: 15000, method: 'M-Pesa', time: '04:30 PM' },
            { date: '2024-12-06', type: 'Deposit', amount: 20000, method: 'M-Pesa', time: '02:45 PM' }
          ],
          riskScore: 42,
          aiAnalysis: 'Client operates retail shop with typical deposits of irregular amounts (KES 3,247, KES 5,891, etc.). Recent exact round-number deposits deviate from historical pattern.',
          status: 'Under Review',
          assignedTo: 'Sarah Mwangi - Fraud Team'
        }
      ],
      recommendations: [
        'Contact all 3 clients to verify recent deposit activity',
        'Request proof of source of funds for flagged transactions',
        'Temporarily limit withdrawal amounts pending verification',
        'Cross-reference M-Pesa transaction IDs with sender information',
        'Review historical patterns for similar anomalies',
        'If verified legitimate, update client risk profile to prevent false positives'
      ]
    },
    'multiple-device': {
      title: 'Multiple Device Login',
      severity: 'Low',
      icon: Shield,
      color: 'yellow',
      instances: [
        {
          id: 'FRD-004',
          clientId: 'C025',
          clientName: 'Patrick Ngugi',
          phone: '+254 712 345 025',
          location: 'Nakuru',
          detectedDate: '2024-12-08',
          pattern: 'Account accessed from 3 different devices in 24 hours',
          devices: [
            { type: 'Mobile - Android', location: 'Nakuru', ip: '41.90.xx.xx', time: '2024-12-08 08:30 AM', browser: 'Chrome Mobile' },
            { type: 'Desktop - Windows', location: 'Nairobi', ip: '105.163.xx.xx', time: '2024-12-08 02:15 PM', browser: 'Firefox' },
            { type: 'Mobile - iOS', location: 'Kisumu', ip: '41.80.xx.xx', time: '2024-12-08 06:45 PM', browser: 'Safari Mobile' }
          ],
          riskScore: 35,
          aiAnalysis: 'Multiple device access from different cities within short timeframe. Could indicate credential sharing, account compromise, or legitimate business use with employees.',
          status: 'Monitoring',
          assignedTo: 'Auto-Monitor System'
        },
        {
          id: 'FRD-005',
          clientId: 'C038',
          clientName: 'Joyce Auma',
          phone: '+254 712 345 038',
          location: 'Eldoret',
          detectedDate: '2024-12-07',
          pattern: 'New device login from foreign IP address',
          devices: [
            { type: 'Mobile - Android', location: 'Eldoret', ip: '41.90.xx.xx', time: '2024-12-07 09:00 AM', browser: 'Chrome Mobile' },
            { type: 'Desktop - Windows', location: 'London, UK', ip: '81.2.xx.xx', time: '2024-12-07 11:30 PM', browser: 'Chrome' }
          ],
          riskScore: 48,
          aiAnalysis: 'Suspicious foreign IP login. Client has no travel history. Possible VPN use, proxy, or credential theft.',
          status: 'Monitoring',
          assignedTo: 'Auto-Monitor System'
        }
      ],
      recommendations: [
        'Send account activity notifications to all affected clients',
        'Implement two-factor authentication for new device logins',
        'Monitor for any unusual transaction patterns following multi-device access',
        'Contact clients with foreign IP logins to verify legitimacy',
        'Consider device fingerprinting to track authorized devices',
        'Update security policies to flag VPN/proxy usage'
      ]
    },
    'inconsistent-id': {
      title: 'Inconsistent ID Data',
      severity: 'High',
      icon: AlertTriangle,
      color: 'red',
      instances: [
        {
          id: 'FRD-006',
          clientId: 'C052',
          clientName: 'John Mutua (Suspected Fraud)',
          phone: '+254 712 345 052',
          location: 'Nairobi',
          detectedDate: '2024-12-04',
          pattern: 'ID number belongs to different person in national database',
          inconsistencies: [
            { field: 'ID Number', submitted: '29847562', database: 'Different name: Mary Wanjiku' },
            { field: 'Date of Birth', submitted: '1985-03-15', database: '1978-11-22' },
            { field: 'Photo', submitted: 'Male, ~35 years', database: 'Female, ~46 years' }
          ],
          applicationAmount: 125000,
          riskScore: 95,
          aiAnalysis: 'CRITICAL: Clear identity fraud. Submitted ID belongs to different individual. Likely stolen or fabricated credentials. Application photos do not match national ID database.',
          status: 'Blocked',
          assignedTo: 'Michael Omondi - Security Lead',
          actionTaken: 'Application rejected, account blocked, case referred to authorities'
        }
      ],
      recommendations: [
        '🚨 IMMEDIATE: Block all transactions and freeze account',
        'Report to law enforcement and national fraud database',
        'Cross-check if same fraudster has other applications',
        'Strengthen ID verification process with biometric checks',
        'Implement real-time ID database verification before approval',
        'Train loan officers on red flags for identity fraud'
      ]
    },
    'velocity-anomaly': {
      title: 'Velocity Anomaly',
      severity: 'Medium',
      icon: Activity,
      color: 'amber',
      instances: [
        {
          id: 'FRD-007',
          clientId: 'C029',
          clientName: 'Susan Njeri',
          phone: '+254 712 345 029',
          location: 'Nairobi',
          detectedDate: '2024-12-08',
          pattern: 'Unusually high transaction frequency - 15 transactions in 3 hours',
          transactions: [
            { time: '10:00 AM', type: 'Balance Check', amount: 0 },
            { time: '10:05 AM', type: 'Deposit', amount: 5000 },
            { time: '10:10 AM', type: 'Balance Check', amount: 0 },
            { time: '10:15 AM', type: 'Withdrawal', amount: 2000 },
            { time: '10:30 AM', type: 'Deposit', amount: 3000 },
            { time: '10:45 AM', type: 'Balance Check', amount: 0 },
            { time: '11:00 AM', type: 'Withdrawal', amount: 1500 },
            { time: '11:20 AM', type: 'Deposit', amount: 4000 },
            { time: '11:35 AM', type: 'Balance Check', amount: 0 },
            { time: '11:50 AM', type: 'Withdrawal', amount: 3000 },
            { time: '12:10 PM', type: 'Deposit', amount: 6000 },
            { time: '12:25 PM', type: 'Balance Check', amount: 0 },
            { time: '12:40 PM', type: 'Withdrawal', amount: 4500 },
            { time: '12:55 PM', type: 'Deposit', amount: 2500 },
            { time: '01:05 PM', type: 'Balance Check', amount: 0 }
          ],
          riskScore: 61,
          aiAnalysis: 'Excessive transaction velocity inconsistent with normal business operations. Pattern suggests possible account testing, money mule activity, or automation.',
          status: 'Investigation',
          assignedTo: 'Sarah Mwangi - Fraud Team'
        },
        {
          id: 'FRD-008',
          clientId: 'C041',
          clientName: 'James Kipchoge',
          phone: '+254 712 345 041',
          location: 'Eldoret',
          detectedDate: '2024-12-06',
          pattern: 'Rapid loan applications - 4 applications in 2 days',
          applications: [
            { date: '2024-12-05 09:00 AM', product: 'Quick Cash', amount: 15000, status: 'Rejected - Low Score' },
            { date: '2024-12-05 02:30 PM', product: 'Emergency Loan', amount: 10000, status: 'Rejected - Low Score' },
            { date: '2024-12-06 08:15 AM', product: 'SME Loan', amount: 50000, status: 'Rejected - Velocity Flag' },
            { date: '2024-12-06 11:45 AM', product: 'Quick Cash', amount: 8000, status: 'Blocked - Fraud Alert' }
          ],
          riskScore: 72,
          aiAnalysis: 'Desperate borrowing behavior or systematic testing of loan products. Rapid successive applications after rejections indicate potential fraud or extreme financial distress.',
          status: 'Investigation',
          assignedTo: 'Sarah Mwangi - Fraud Team'
        }
      ],
      recommendations: [
        'Implement rate limiting: maximum 3 transactions per hour for flagged accounts',
        'Contact clients to understand reason for unusual velocity',
        'For loan application velocity: require cooling-off period of 7 days between applications',
        'Monitor for similar patterns across other accounts (coordinated fraud)',
        'Consider temporary account restrictions pending investigation',
        'Educate clients on responsible account usage'
      ]
    }
  };

  const data = fraudData[fraudType];
  const Icon = data.icon;
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-700',
      icon: 'text-red-600'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-700',
      icon: 'text-amber-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: 'text-yellow-600'
    }
  };

  const colors = colorClasses[data.color as 'red' | 'amber' | 'yellow'];

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg w-full max-w-6xl my-8">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b px-6 py-4 flex items-center justify-between rounded-t-lg`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white rounded-lg ${colors.border} border`}>
              <Icon className={`size-6 ${colors.icon}`} />
            </div>
            <div>
              <h3 className={`text-xl ${colors.text}`}>{data.title}</h3>
              <p className="text-gray-600 text-sm">{data.instances.length} instance(s) detected</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm ${colors.badge}`}>
              {data.severity} Severity
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Instances */}
          <div className="space-y-6">
            {data.instances.map((instance: any, index: number) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                {/* Instance Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-gray-900">{instance.clientName}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${colors.badge}`}>
                        Risk Score: {instance.riskScore}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        instance.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                        instance.status === 'Investigation' ? 'bg-amber-100 text-amber-700' :
                        instance.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {instance.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="size-3" />
                        <span>{instance.clientId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="size-3" />
                        <span>{instance.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        <span>{instance.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Calendar className="size-3" />
                      <span>Detected: {instance.detectedDate}</span>
                      <span className="mx-2">•</span>
                      <span>Assigned to: {instance.assignedTo}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Instance ID</p>
                    <p className="text-gray-900">{instance.id}</p>
                  </div>
                </div>

                {/* Pattern Description */}
                <div className={`${colors.bg} ${colors.border} border p-3 rounded mb-4`}>
                  <p className="text-sm">
                    <strong className={colors.text}>Detected Pattern:</strong> {instance.pattern}
                  </p>
                </div>

                {/* Transactions/Details */}
                {instance.transactions && (
                  <div className="mb-4">
                    <h5 className="text-gray-900 text-sm mb-2">Transaction Timeline</h5>
                    <div className="bg-white rounded border border-gray-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-700">Date/Time</th>
                            <th className="px-3 py-2 text-left text-gray-700">Type</th>
                            <th className="px-3 py-2 text-right text-gray-700">Amount</th>
                            <th className="px-3 py-2 text-left text-gray-700">Method</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instance.transactions.map((txn: any, idx: number) => (
                            <tr key={idx} className={`border-t ${txn.type.includes('Withdrawal') ? 'bg-red-50' : ''}`}>
                              <td className="px-3 py-2 text-gray-900">{txn.date} {txn.time}</td>
                              <td className="px-3 py-2 text-gray-900">{txn.type}</td>
                              <td className={`px-3 py-2 text-right ${txn.amount > 20000 ? 'text-red-600' : 'text-gray-900'}`}>
                                {txn.amount > 0 ? `KES ${txn.amount.toLocaleString()}` : '-'}
                              </td>
                              <td className="px-3 py-2 text-gray-600">{txn.method}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {instance.devices && (
                  <div className="mb-4">
                    <h5 className="text-gray-900 text-sm mb-2">Device & Location Information</h5>
                    <div className="space-y-2">
                      {instance.devices.map((device: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-xs">
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <p className="text-gray-500">Device</p>
                              <p className="text-gray-900">{device.type}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Location</p>
                              <p className="text-gray-900">{device.location}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">IP Address</p>
                              <p className="text-gray-900">{device.ip}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Time</p>
                              <p className="text-gray-900">{device.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {instance.inconsistencies && (
                  <div className="mb-4">
                    <h5 className="text-red-900 text-sm mb-2">⚠️ Data Inconsistencies Detected</h5>
                    <div className="bg-white rounded border border-red-300">
                      <table className="w-full text-xs">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-700">Field</th>
                            <th className="px-3 py-2 text-left text-gray-700">Submitted</th>
                            <th className="px-3 py-2 text-left text-gray-700">National Database</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instance.inconsistencies.map((inc: any, idx: number) => (
                            <tr key={idx} className="border-t border-red-100">
                              <td className="px-3 py-2 text-gray-900">{inc.field}</td>
                              <td className="px-3 py-2 text-gray-900">{inc.submitted}</td>
                              <td className="px-3 py-2 text-red-600">{inc.database}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {instance.applications && (
                  <div className="mb-4">
                    <h5 className="text-gray-900 text-sm mb-2">Loan Application History</h5>
                    <div className="bg-white rounded border border-gray-200">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-700">Date/Time</th>
                            <th className="px-3 py-2 text-left text-gray-700">Product</th>
                            <th className="px-3 py-2 text-right text-gray-700">Amount</th>
                            <th className="px-3 py-2 text-left text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instance.applications.map((app: any, idx: number) => (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2 text-gray-900">{app.date}</td>
                              <td className="px-3 py-2 text-gray-900">{app.product}</td>
                              <td className="px-3 py-2 text-right text-gray-900">KES {app.amount.toLocaleString()}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded ${
                                  app.status.includes('Blocked') ? 'bg-red-100 text-red-700' :
                                  app.status.includes('Rejected') ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4">
                  <h5 className="text-blue-900 text-sm mb-1">🤖 AI Analysis</h5>
                  <p className="text-blue-800 text-xs">{instance.aiAnalysis}</p>
                </div>

                {/* Action Taken */}
                {instance.actionTaken && (
                  <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                    <h5 className="text-emerald-900 text-sm mb-1">✓ Action Taken</h5>
                    <p className="text-emerald-800 text-xs">{instance.actionTaken}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="text-purple-900 mb-3">🤖 AI-Powered Recommendations</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              {data.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-600 flex-shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            onClick={() => {
              alert('Cases marked for review and notifications sent to fraud team!');
            }}
          >
            Mark for Review
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={() => {
              alert('High-risk instances blocked and clients notified!');
            }}
          >
            Block & Notify
          </button>
        </div>
      </div>
    </div>
  );
}