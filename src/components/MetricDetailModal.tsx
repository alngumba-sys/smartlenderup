import React from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Lightbulb, ArrowRight } from 'lucide-react';

interface LoanBreakdownItem {
  loanNumber: string;
  clientName: string;
  amount: number;
  status?: string;
  date?: string;
  requestDate?: string;
  daysInArrears?: number;
  principal?: number;
  rate?: number;
  term?: number;
  calculationDetail?: string;
}

interface PaymentBreakdownItem {
  paymentId: string;
  loanNumber: string;
  clientName: string;
  amount: number;
  date: string;
  interestPortion?: number;
  principalPortion?: number;
}

interface ClientBreakdownItem {
  clientId: string;
  name: string;
  status: string;
  joinDate: string;
  totalLoans?: number;
}

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: string;
  metricValue: string | number;
  metricLabel: string;
  icon: React.ReactNode;
  color: string;
  breakdown: {
    loans?: LoanBreakdownItem[];
    payments?: PaymentBreakdownItem[];
    clients?: ClientBreakdownItem[];
    summary?: {
      label: string;
      value: string | number;
    }[];
  };
  calculation?: {
    formula: string;
    steps: {
      label: string;
      value: string | number;
      description?: string;
    }[];
  };
  insights?: {
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    title: string;
    description: string;
  }[];
  currencySymbol?: string;
  isDark?: boolean;
}

export function MetricDetailModal({
  isOpen,
  onClose,
  metricType,
  metricValue,
  metricLabel,
  icon,
  color,
  breakdown,
  calculation,
  insights = [],
  currencySymbol = 'KSh',
  isDark = false
}: MetricDetailModalProps) {
  if (!isOpen) return null;

  // Add ESC key listener
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="size-5 text-emerald-500" />;
      case 'negative':
        return <AlertCircle className="size-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="size-5 text-amber-500" />;
      default:
        return <Info className="size-5 text-blue-500" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    if (isDark) {
      switch (type) {
        case 'positive': return 'rgba(16, 185, 129, 0.1)';
        case 'negative': return 'rgba(239, 68, 68, 0.1)';
        case 'warning': return 'rgba(245, 158, 11, 0.1)';
        default: return 'rgba(59, 130, 246, 0.1)';
      }
    } else {
      switch (type) {
        case 'positive': return 'rgba(16, 185, 129, 0.05)';
        case 'negative': return 'rgba(239, 68, 68, 0.05)';
        case 'warning': return 'rgba(245, 158, 11, 0.05)';
        default: return 'rgba(59, 130, 246, 0.05)';
      }
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl"
        style={{ 
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ 
            background: `linear-gradient(135deg, ${color}20, ${color}05)`,
            borderColor: isDark ? '#1e293b' : '#e5e7eb'
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: `${color}20`,
                  color: color
                }}
              >
                {icon}
              </div>
              <div>
                <h2 
                  className="text-2xl font-semibold mb-1"
                  style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                >
                  {metricLabel}
                </h2>
                <p 
                  className="text-4xl font-bold"
                  style={{ color: color }}
                >
                  {metricValue}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ 
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-6">
            {/* AI Insights - Top Section */}
            {insights && insights.length > 0 && (
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#e2e8f0'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                >
                  <Lightbulb className="size-5" style={{ color: color }} />
                  AI Insights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {insights.map((insight, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border-l-4"
                      style={{ 
                        backgroundColor: getInsightBgColor(insight.type),
                        borderColor: getInsightBorderColor(insight.type)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <p 
                            className="font-semibold text-sm mb-1"
                            style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                          >
                            {insight.title}
                          </p>
                          <p 
                            className="text-xs leading-relaxed"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculation & Summary - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calculation Breakdown */}
              {calculation && (
                <div 
                  className="p-5 rounded-lg border"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                  }}
                >
                  <h3 
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                  >
                    <Info className="size-5" style={{ color: color }} />
                    How This Is Calculated
                  </h3>
                  
                  {calculation.formula && (
                    <div 
                      className="mb-4 p-3 rounded-lg font-mono text-sm"
                      style={{ 
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        color: isDark ? '#94a3b8' : '#475569'
                      }}
                    >
                      {calculation.formula}
                    </div>
                  )}

                  <div className="space-y-3">
                    {calculation.steps.map((step, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span 
                            className="text-sm font-medium"
                            style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                          >
                            {step.label}
                          </span>
                          <span 
                            className="text-base font-semibold"
                            style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                          >
                            {step.value}
                          </span>
                        </div>
                        {step.description && (
                          <p 
                            className="text-xs mb-2"
                            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                          >
                            {step.description}
                          </p>
                        )}
                        {index < calculation.steps.length - 1 && (
                          <div 
                            className="h-px my-2"
                            style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Calculation Breakdown Table */}
                  {calculation.steps && calculation.steps.length > 0 && (
                    <div className="mt-6">
                      <div 
                        className="rounded-lg border overflow-hidden"
                        style={{ 
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#e2e8f0'
                        }}
                      >
                        <table className="w-full">
                          <thead>
                            <tr 
                              style={{ 
                                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                                borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                              }}
                            >
                              <th 
                                className="text-left p-3 text-xs font-semibold"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                Component
                              </th>
                              <th 
                                className="text-right p-3 text-xs font-semibold"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {calculation.steps.map((step, index) => {
                              const isTotal = index === calculation.steps.length - 1;
                              return (
                                <tr 
                                  key={index}
                                  style={{ 
                                    borderBottom: index < calculation.steps.length - 1 
                                      ? `1px solid ${isDark ? '#334155' : '#e2e8f0'}` 
                                      : 'none',
                                    backgroundColor: isTotal 
                                      ? (isDark ? '#1e293b' : '#f8fafc')
                                      : 'transparent'
                                  }}
                                >
                                  <td 
                                    className={`p-3 text-sm ${isTotal ? 'font-bold' : 'font-medium'}`}
                                    style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                                  >
                                    {step.label}
                                  </td>
                                  <td 
                                    className={`p-3 text-sm text-right ${isTotal ? 'font-bold' : 'font-semibold'}`}
                                    style={{ color: isTotal ? color : (isDark ? '#f1f5f9' : '#111120') }}
                                  >
                                    {step.value}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Stats */}
              {breakdown?.summary && breakdown.summary.length > 0 && (
                <div 
                  className="grid grid-cols-2 gap-4"
                >
                  {breakdown.summary.map((item, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        borderColor: isDark ? '#334155' : '#e2e8f0'
                      }}
                    >
                      <p 
                        className="text-xs mb-1"
                        style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                      >
                        {item.label}
                      </p>
                      <p 
                        className="text-xl font-semibold"
                        style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed Breakdown Table */}
              {breakdown?.loans && breakdown.loans.length > 0 && (
                <div 
                  className="rounded-lg border overflow-hidden lg:col-span-2"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                  }}
                >
                  <div 
                    className="p-4 border-b"
                    style={{ 
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#e2e8f0'
                    }}
                  >
                    <h3 
                      className="font-semibold"
                      style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                    >
                      Loan Breakdown ({breakdown.loans.length} loans)
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead 
                        className="sticky top-0"
                        style={{ 
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                        }}
                      >
                        <tr>
                          <th 
                            className="text-left p-3 text-xs font-semibold"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Loan #
                          </th>
                          <th 
                            className="text-left p-3 text-xs font-semibold"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Client
                          </th>
                          {!breakdown.loans[0]?.calculationDetail && (
                            <th 
                              className="text-left p-3 text-xs font-semibold"
                              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              Request Date
                            </th>
                          )}
                          {breakdown.loans[0]?.calculationDetail && (
                            <>
                              <th 
                                className="text-right p-3 text-xs font-semibold"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                Principal
                              </th>
                              <th 
                                className="text-center p-3 text-xs font-semibold"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                Rate
                              </th>
                              <th 
                                className="text-center p-3 text-xs font-semibold"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                Term
                              </th>
                            </>
                          )}
                          <th 
                            className="text-right p-3 text-xs font-semibold"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            {breakdown.loans[0]?.calculationDetail ? 'Interest' : 'Amount'}
                          </th>
                          {breakdown.loans[0]?.status && !breakdown.loans[0]?.calculationDetail && (
                            <th 
                              className="text-center p-3 text-xs font-semibold"
                              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              Status
                            </th>
                          )}
                          {breakdown.loans[0]?.daysInArrears !== undefined && (
                            <th 
                              className="text-center p-3 text-xs font-semibold"
                              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              Days Overdue
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {breakdown.loans.map((loan, index) => (
                          <tr 
                            key={loan.loanNumber || loan.loanId || loan.id || `loan-${index}`}
                            className="border-b last:border-b-0"
                            style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}
                          >
                            <td 
                              className="p-3 text-sm font-medium"
                              style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                            >
                              {loan.loanNumber}
                            </td>
                            <td 
                              className="p-3 text-sm"
                              style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                            >
                              {loan.clientName}
                            </td>
                            {!loan.calculationDetail && (
                              <td 
                                className="p-3 text-sm"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                {formatDate(loan.date || '')}
                              </td>
                            )}
                            {loan.calculationDetail && (
                              <>
                                <td 
                                  className="p-3 text-sm font-semibold text-right"
                                  style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                                >
                                  {currencySymbol} {formatNumber(loan.principal || 0)}
                                </td>
                                <td 
                                  className="p-3 text-sm font-semibold text-center"
                                  style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                                >
                                  {loan.rate || 0}%
                                </td>
                                <td 
                                  className="p-3 text-sm font-semibold text-center"
                                  style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                                >
                                  {loan.term || 0}
                                </td>
                              </>
                            )}
                            <td 
                              className="p-3 text-sm font-semibold text-right"
                              style={{ color: color }}
                            >
                              {currencySymbol} {formatNumber(loan.amount)}
                            </td>
                            {loan.status && !loan.calculationDetail && (
                              <td className="p-3 text-center">
                                <span 
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{ 
                                    backgroundColor: loan.status === 'Active' 
                                      ? 'rgba(34, 197, 94, 0.1)' 
                                      : 'rgba(239, 68, 68, 0.1)',
                                    color: loan.status === 'Active' ? '#22c55e' : '#ef4444'
                                  }}
                                >
                                  {loan.status}
                                </span>
                              </td>
                            )}
                            {loan.daysInArrears !== undefined && (
                              <td 
                                className="p-3 text-center text-sm font-semibold"
                                style={{ 
                                  color: loan.daysInArrears > 0 ? '#ef4444' : '#64748b'
                                }}
                              >
                                {loan.daysInArrears > 0 ? loan.daysInArrears : '-'}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payments Breakdown */}
              {breakdown?.payments && breakdown.payments.length > 0 && (
                <div 
                  className="rounded-lg border overflow-hidden lg:col-span-2"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                  }}
                >
                  <div 
                    className="p-4 border-b"
                    style={{ 
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#e2e8f0'
                    }}
                  >
                    <h3 
                      className="font-semibold"
                      style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                    >
                      Payment Breakdown ({breakdown.payments.length} payments)
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead 
                        className="sticky top-0"
                        style={{ 
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                        }}
                      >
                        <tr>
                          <th 
                            className="text-left p-3 text-xs font-semibold"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Date
                          </th>
                          <th 
                            className="text-left p-3 text-xs font-semibold"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Loan #
                          </th>
                          <th 
                            className="text-left p-3 text-xs font-semibold"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Client
                          </th>
                          <th 
                            className="text-right p-3 pr-4 text-xs font-semibold"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Amount
                          </th>
                          {breakdown.payments[0]?.interestPortion !== undefined && (
                            <th 
                              className="text-right p-3 pr-4 text-xs font-semibold"
                              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              Interest
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {breakdown.payments.map((payment, index) => (
                          <tr 
                            key={index}
                            className="border-b last:border-b-0"
                            style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}
                          >
                            <td 
                              className="p-3 text-sm whitespace-nowrap"
                              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              {formatDate(payment.date)}
                            </td>
                            <td 
                              className="p-3 text-sm font-medium whitespace-nowrap"
                              style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                            >
                              {payment.loanNumber}
                            </td>
                            <td 
                              className="p-3 text-sm"
                              style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                            >
                              {payment.clientName}
                            </td>
                            <td 
                              className="p-3 pr-4 text-sm font-semibold text-right whitespace-nowrap"
                              style={{ color: color }}
                            >
                              {currencySymbol} {formatNumber(payment.amount)}
                            </td>
                            {payment.interestPortion !== undefined && (
                              <td 
                                className="p-3 pr-4 text-sm text-right whitespace-nowrap"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                {currencySymbol} {formatNumber(payment.interestPortion)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Clients Breakdown */}
              {breakdown?.clients && breakdown.clients.length > 0 && (
                <div 
                  className="rounded-lg border overflow-hidden lg:col-span-2"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                  }}
                >
                  <div 
                    className="p-4 border-b"
                    style={{ 
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#e2e8f0'
                    }}
                  >
                    <h3 
                      className="font-semibold"
                      style={{ color: isDark ? '#f1f5f9' : '#111120' }}
                    >
                      Client Breakdown ({breakdown.clients.length} clients)
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead 
                        className="sticky top-0"
                        style={{ 
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                        }}
                      >
                        <tr>
                          <th 
                            className="text-left p-3 text-xs font-semibold w-[35%]"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Client Name
                          </th>
                          <th 
                            className="text-left p-3 text-xs font-semibold w-[25%]"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Status
                          </th>
                          <th 
                            className="text-left p-3 text-xs font-semibold w-[25%]"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          >
                            Join Date
                          </th>
                          {breakdown.clients[0]?.totalLoans !== undefined && (
                            <th 
                              className="text-right p-3 pr-4 text-xs font-semibold w-[15%]"
                              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              Total Loans
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {breakdown.clients.map((client, index) => (
                          <tr 
                            key={index}
                            className="border-b last:border-b-0"
                            style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}
                          >
                            <td 
                              className="p-3 text-sm font-medium"
                              style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                            >
                              {client.name}
                            </td>
                            <td className="p-3">
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: client.status === 'Active' || client.status === 'Good Standing'
                                    ? 'rgba(34, 197, 94, 0.1)' 
                                    : 'rgba(100, 116, 139, 0.1)',
                                  color: client.status === 'Active' || client.status === 'Good Standing' 
                                    ? '#22c55e' 
                                    : '#64748b'
                                }}
                              >
                                {client.status}
                              </span>
                            </td>
                            <td 
                              className="p-3 text-sm"
                              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              {formatDate(client.joinDate)}
                            </td>
                            {client.totalLoans !== undefined && (
                              <td 
                                className="p-3 pr-4 text-sm font-semibold text-right"
                                style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                              >
                                {client.totalLoans}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}