import { X, AlertTriangle, User, Phone, MapPin, DollarSign, Calendar, TrendingDown, Users, CreditCard, Activity } from 'lucide-react';
import { clients, loans } from '../../data/dummyData';
import { useTheme } from '../../contexts/ThemeContext';

interface RiskFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskType: 'payment-history' | 'revenue-decline' | 'economic' | 'multiple-loans' | null;
}

export function RiskFactorModal({ isOpen, onClose, riskType }: RiskFactorModalProps) {
  const { isDark } = useTheme();
  if (!isOpen || !riskType) return null;

  const riskData = {
    'payment-history': {
      title: 'Payment History Issues',
      color: 'red',
      icon: AlertTriangle,
      count: 6,
      description: 'Clients with consistent late payments or missed payments in the last 3 months',
      clients: [
        { id: 'CL001', name: 'Grace Wanjiru', location: 'Nairobi', phone: '+254 712 345 001', loanAmount: 50000, daysLate: 45, missedPayments: 3, creditScore: 42 },
        { id: 'CL015', name: 'John Kimani', location: 'Kisumu', phone: '+254 712 345 015', loanAmount: 75000, daysLate: 32, missedPayments: 2, creditScore: 48 },
        { id: 'CL023', name: 'Lucy Achieng', location: 'Mombasa', phone: '+254 712 345 023', loanAmount: 60000, daysLate: 28, missedPayments: 2, creditScore: 51 },
        { id: 'CL032', name: 'Peter Omondi', location: 'Nakuru', phone: '+254 712 345 032', loanAmount: 45000, daysLate: 21, missedPayments: 2, creditScore: 55 },
        { id: 'CL041', name: 'Mary Njeri', location: 'Eldoret', phone: '+254 712 345 041', loanAmount: 55000, daysLate: 18, missedPayments: 1, creditScore: 58 },
        { id: 'CL048', name: 'James Mwangi', location: 'Nairobi', phone: '+254 712 345 048', loanAmount: 70000, daysLate: 15, missedPayments: 1, creditScore: 60 }
      ],
      recommendations: {
        immediate: [
          'Contact all 6 clients within 24 hours to understand payment challenges',
          'Offer payment plan restructuring with extended terms (additional 30-60 days)',
          'Provide SMS reminders 3 days before each payment due date',
          'Schedule field visits for clients with 30+ days overdue (Grace & John)'
        ],
        preventive: [
          'Implement early warning system: flag clients after 1st missed payment',
          'Offer financial literacy workshops focused on cash flow management',
          'Create "catch-up payment" incentive: waive 50% of late fees if they make 3 consecutive on-time payments',
          'Consider temporary interest rate reduction for clients experiencing genuine hardship'
        ],
        monitoring: [
          'Weekly check-ins via SMS for next 2 months',
          'Track payment behavior improvements and adjust credit scoring',
          'Flag for loan officer review if any additional payment is missed',
          'Monitor business performance indicators for early intervention'
        ]
      },
      expectedOutcome: {
        success: '75% recovery rate if action taken within 48 hours',
        risk: 'Without intervention, 4 out of 6 clients likely to default within 60 days',
        timeline: 'Expect improvements within 2-3 weeks of intervention'
      }
    },
    'revenue-decline': {
      title: 'Business Revenue Decline',
      color: 'amber',
      icon: TrendingDown,
      count: 3,
      description: 'Clients whose business revenue has decreased by 20%+ in the last quarter',
      clients: [
        { id: 'CL007', name: 'Sarah Muthoni', location: 'Nairobi', phone: '+254 712 345 007', loanAmount: 120000, revenueDrop: '35%', business: 'Retail Shop', creditScore: 52 },
        { id: 'CL019', name: 'David Kariuki', location: 'Kisumu', phone: '+254 712 345 019', loanAmount: 95000, revenueDrop: '28%', business: 'Food Vendor', creditScore: 58 },
        { id: 'CL028', name: 'Ann Wairimu', location: 'Mombasa', phone: '+254 712 345 028', loanAmount: 85000, revenueDrop: '22%', business: 'Hair Salon', creditScore: 61 }
      ],
      recommendations: {
        immediate: [
          'Conduct business assessment visits within 3 days to identify root causes',
          'Offer 60-day payment holiday to allow business recovery time',
          'Provide business advisory support: inventory management, pricing strategies, marketing',
          'Connect clients with microenterprise development training programs'
        ],
        preventive: [
          'Analyze seasonal patterns: determine if revenue decline is temporary or structural',
          'Explore diversification opportunities for vulnerable single-product businesses',
          'Introduce business health monitoring: monthly revenue tracking for all active loans',
          'Create peer-to-peer mentorship program with successful clients in same industry'
        ],
        monitoring: [
          'Monthly business performance reviews for next 6 months',
          'Track revenue recovery: expect 10-15% improvement within 90 days',
          'Adjust loan terms if sustained improvement is demonstrated',
          'Consider additional working capital if business shows recovery potential'
        ]
      },
      expectedOutcome: {
        success: '82% business recovery rate with advisory support and payment flexibility',
        risk: 'Revenue decline often temporary; early support prevents loan default',
        timeline: 'Business stabilization expected within 3 months with intervention'
      }
    },
    'economic': {
      title: 'Economic Indicators',
      color: 'amber',
      icon: Activity,
      count: 2,
      description: 'Clients in sectors affected by recent economic changes (inflation, supply chain issues)',
      clients: [
        { id: 'CL012', name: 'Joseph Mutua', location: 'Nairobi', phone: '+254 712 345 012', loanAmount: 110000, sector: 'Transport', impact: 'High fuel costs', creditScore: 64 },
        { id: 'CL037', name: 'Susan Adhiambo', location: 'Nakuru', phone: '+254 712 345 037', loanAmount: 95000, sector: 'Agriculture', impact: 'Input cost inflation', creditScore: 66 }
      ],
      recommendations: {
        immediate: [
          'Proactive outreach: acknowledge economic challenges and offer support',
          'Flexible payment scheduling: align payment dates with cash flow peaks',
          'Consider temporary reduction in installment amounts with term extension',
          'Provide sector-specific guidance: cost reduction strategies, alternative suppliers'
        ],
        preventive: [
          'Portfolio stress testing: identify other clients in affected sectors',
          'Diversification strategy: reduce concentration in vulnerable sectors',
          'Create economic hardship policy: standardized support for macro-economic shocks',
          'Partner with industry associations for sector-specific support programs'
        ],
        monitoring: [
          'Track sector-wide economic indicators: fuel prices, commodity costs, inflation',
          'Monthly check-ins to assess ongoing impact and adaptation strategies',
          'Identify early warning signs across portfolio before widespread impact',
          'Build economic scenario planning into loan underwriting'
        ]
      },
      expectedOutcome: {
        success: '90% can weather economic challenges with flexible repayment terms',
        risk: 'Economic factors temporary; strong support builds long-term loyalty',
        timeline: 'Situation should stabilize as clients adapt to new economic reality (6-12 months)'
      }
    },
    'multiple-loans': {
      title: 'Multiple Loan Sources',
      color: 'red',
      icon: CreditCard,
      count: 4,
      description: 'Clients with 3+ active loans from different institutions, indicating over-indebtedness',
      clients: [
        { id: 'CL005', name: 'Patrick Otieno', location: 'Nairobi', phone: '+254 712 345 005', loanAmount: 80000, totalDebt: 'KES 245K', lenders: 4, creditScore: 38 },
        { id: 'CL018', name: 'Catherine Nyambura', location: 'Kisumu', phone: '+254 712 345 018', loanAmount: 65000, totalDebt: 'KES 198K', lenders: 3, creditScore: 44 },
        { id: 'CL026', name: 'Michael Wekesa', location: 'Eldoret', phone: '+254 712 345 026', loanAmount: 90000, totalDebt: 'KES 312K', lenders: 5, creditScore: 35 },
        { id: 'CL043', name: 'Jane Akinyi', location: 'Mombasa', phone: '+254 712 345 043', loanAmount: 70000, totalDebt: 'KES 215K', lenders: 3, creditScore: 41 }
      ],
      recommendations: {
        immediate: [
          'URGENT: Conduct debt burden assessment - calculate total debt-to-income ratio',
          'Coordinate with other lenders if possible for consolidated repayment plan',
          'Offer loan restructuring: consolidate internal loans, extend terms, reduce installments',
          'Implement strict monitoring: weekly payment tracking and immediate follow-up on delays'
        ],
        preventive: [
          'Strengthen credit bureau checks: identify multiple borrowing before disbursement',
          'Client education on debt management and risks of over-borrowing',
          'Create "debt stress" scoring: factor in external debt in credit assessment',
          'Implement maximum debt-to-income policy (e.g., total debt should not exceed 50% of income)'
        ],
        monitoring: [
          'Daily payment monitoring for next 90 days',
          'Bi-weekly client contact to assess financial situation',
          'Consider reducing loan limits or denying new loans until debt levels normalize',
          'Track payment priority: ensure SmartLenderUp payments are made first'
        ]
      },
      expectedOutcome: {
        success: '55% success rate - high risk but manageable with aggressive intervention',
        risk: 'Highest default risk category; 2 out of 4 may require collections action',
        timeline: 'Critical period: next 30-60 days will determine outcome'
      }
    }
  };

  const data = riskData[riskType];
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
    }
  };

  const colors = colorClasses[data.color as 'red' | 'amber'];

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg w-full max-w-5xl my-8">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b px-6 py-4 flex items-center justify-between rounded-t-lg`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white rounded-lg ${colors.border} border`}>
              <Icon className={`size-6 ${colors.icon}`} />
            </div>
            <div>
              <h3 className={`text-xl ${colors.text}`}>{data.title}</h3>
              <p className="text-gray-600 text-sm">{data.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Affected Clients */}
          <div className="mb-6">
            <h4 className="text-gray-900 mb-3">Affected Clients ({data.count})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.clients.map((client: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-900">{client.name}</p>
                      <p className="text-gray-500 text-sm">{client.id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${colors.badge}`}>
                      Score: {client.creditScore}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3" />
                      <span>{client.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-3" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-3" />
                      <span>Loan: KES {client.loanAmount.toLocaleString()}</span>
                    </div>
                    {client.daysLate && (
                      <div className="flex items-center gap-2 text-red-600">
                        <Calendar className="size-3" />
                        <span>{client.daysLate} days overdue | {client.missedPayments} missed payment(s)</span>
                      </div>
                    )}
                    {client.revenueDrop && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <TrendingDown className="size-3" />
                        <span>{client.business} - Revenue down {client.revenueDrop}</span>
                      </div>
                    )}
                    {client.sector && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <Activity className="size-3" />
                        <span>{client.sector} - {client.impact}</span>
                      </div>
                    )}
                    {client.totalDebt && (
                      <div className="flex items-center gap-2 text-red-600">
                        <CreditCard className="size-3" />
                        <span>Total debt: {client.totalDebt} across {client.lenders} lenders</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="mb-6">
            <h4 className="text-gray-900 mb-3">🤖 AI-Powered Recommendations</h4>
            
            {/* Immediate Actions */}
            <div className="mb-4">
              <h5 className="text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Immediate Actions (Next 24-48 hours)
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                {data.recommendations.immediate.map((action: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 bg-red-50 p-3 rounded border border-red-100">
                    <span className="text-red-600 flex-shrink-0">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preventive Measures */}
            <div className="mb-4">
              <h5 className="text-blue-700 mb-2 flex items-center gap-2">
                <Activity className="size-4" />
                Preventive Measures (Next 30 days)
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                {data.recommendations.preventive.map((action: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 bg-blue-50 p-3 rounded border border-blue-100">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ongoing Monitoring */}
            <div>
              <h5 className="text-emerald-700 mb-2 flex items-center gap-2">
                <Activity className="size-4" />
                Ongoing Monitoring & Support
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                {data.recommendations.monitoring.map((action: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 bg-emerald-50 p-3 rounded border border-emerald-100">
                    <span className="text-emerald-600 flex-shrink-0">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Expected Outcome */}
          <div className={`${colors.bg} ${colors.border} border p-4 rounded-lg`}>
            <h4 className={`${colors.text} mb-3`}>📊 Expected Outcome with AI-Guided Intervention</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 flex-shrink-0">✓</span>
                <span className="text-gray-700"><strong>Success Rate:</strong> {data.expectedOutcome.success}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">⚠</span>
                <span className="text-gray-700"><strong>Risk Without Action:</strong> {data.expectedOutcome.risk}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 flex-shrink-0">⏱</span>
                <span className="text-gray-700"><strong>Timeline:</strong> {data.expectedOutcome.timeline}</span>
              </div>
            </div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => {
              alert('Action plan exported to loan officer dashboard and SMS reminders scheduled!');
            }}
          >
            Export Action Plan
          </button>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            onClick={() => {
              alert(`Immediate actions initiated for ${data.count} clients. SMS notifications sent to loan officers.`);
            }}
          >
            Initiate Actions
          </button>
        </div>
      </div>
    </div>
  );
}