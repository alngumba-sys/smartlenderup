import { useState, useRef, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrencyCode } from '../utils/currencyUtils';

type TimePeriod = 'week' | 'month';

interface PaymentExpectation {
  date: string;
  clientName: string;
  loanId: string;
  amount: number;
  status: 'on-time' | 'overdue' | 'upcoming' | 'paid';
}

export function PaymentCalendar() {
  const { loans } = useData();
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState<TimePeriod>('week');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPaymentExpectations = (): PaymentExpectation[] => {
    const now = new Date();
    const endDate = new Date();
    const startDate = new Date(now);
    
    if (period === 'week') {
      endDate.setDate(now.getDate() + 7);
      startDate.setDate(now.getDate() - 7); // Look back one week for paid installments
    } else {
      endDate.setDate(now.getDate() + 30);
      startDate.setDate(now.getDate() - 30); // Look back one month for paid installments
    }

    const expectations: PaymentExpectation[] = [];

    // Get active loans with upcoming payment schedules
    const activeLoans = loans.filter(loan => 
      loan.status === 'Active' || loan.status === 'Disbursed'
    );

    activeLoans.forEach(loan => {
      if (loan.nextPaymentDate && loan.installmentAmount) {
        const nextPaymentDate = new Date(loan.nextPaymentDate);
        
        // Check if payment falls within the selected period
        if (nextPaymentDate >= now && nextPaymentDate <= endDate) {
          let status: 'on-time' | 'overdue' | 'upcoming' | 'paid' = 'upcoming';
          
          // If payment is overdue (past due date)
          if (loan.daysInArrears > 0) {
            status = 'overdue';
          } 
          // If payment is due within 3 days
          else if (nextPaymentDate.getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000) {
            status = 'on-time';
          }

          expectations.push({
            date: loan.nextPaymentDate,
            clientName: loan.clientName,
            loanId: loan.loanId || loan.id,
            amount: loan.installmentAmount,
            status
          });
        }
      }
    });

    // Get fully paid loans and show their payment history
    const fullyPaidLoans = loans.filter(loan => 
      loan.status === 'Fully Paid' || loan.status === 'Closed'
    );

    fullyPaidLoans.forEach(loan => {
      // Generate installment schedule for fully paid loans
      if (loan.firstRepaymentDate && loan.numberOfInstallments && loan.installmentAmount) {
        const firstRepaymentDate = new Date(loan.firstRepaymentDate);
        
        for (let i = 0; i < loan.numberOfInstallments; i++) {
          const installmentDate = new Date(firstRepaymentDate);
          
          if (loan.repaymentFrequency === 'Monthly') {
            installmentDate.setMonth(installmentDate.getMonth() + i);
          } else if (loan.repaymentFrequency === 'Weekly') {
            installmentDate.setDate(installmentDate.getDate() + (i * 7));
          } else if (loan.repaymentFrequency === 'Daily') {
            installmentDate.setDate(installmentDate.getDate() + i);
          } else if (loan.repaymentFrequency === 'Bi-Weekly') {
            installmentDate.setDate(installmentDate.getDate() + (i * 14));
          } else {
            installmentDate.setMonth(installmentDate.getMonth() + (i * 12));
          }
          
          installmentDate.setHours(0, 0, 0, 0);

          // Include this installment if it falls within the period (past or future)
          if (installmentDate >= startDate && installmentDate <= endDate) {
            expectations.push({
              date: installmentDate.toISOString().split('T')[0],
              clientName: loan.clientName,
              loanId: loan.id,
              amount: loan.installmentAmount,
              status: 'paid'
            });
          }
        }
      }
    });

    // Sort by date
    return expectations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const expectations = getPaymentExpectations();
  const totalExpected = expectations.filter(exp => exp.status !== 'paid').reduce((sum, exp) => sum + exp.amount, 0);
  const overdueCount = expectations.filter(exp => exp.status === 'overdue').length;
  const onTimeCount = expectations.filter(exp => exp.status === 'on-time').length;
  const paidCount = expectations.filter(exp => exp.status === 'paid').length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Calendar Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors relative"
        style={{
          backgroundColor: isOpen ? (isDark ? '#1e3a52' : '#e0f2fe') : 'transparent',
          color: isDark ? '#94a3b8' : '#475569'
        }}
        title="Payment Calendar"
      >
        <Calendar className="size-5" />
        {expectations.length > 0 && (
          <span 
            className="absolute -top-1 -right-1 size-5 rounded-full text-xs flex items-center justify-center"
            style={{
              backgroundColor: overdueCount > 0 ? '#ef4444' : '#10b981',
              color: '#ffffff'
            }}
          >
            {expectations.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 rounded-lg shadow-lg border z-50"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e5e7eb',
            maxHeight: '80vh',
            overflow: 'auto'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                <h3 className="font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                  Expected Payments
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="size-4" style={{ color: isDark ? '#94a3b8' : '#6b7280' }} />
              </button>
            </div>

            {/* Period Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('week')}
                className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  period === 'week'
                    ? 'bg-blue-600 text-white'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  period === 'month'
                    ? 'bg-blue-600 text-white'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-4 grid grid-cols-3 gap-3 border-b" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="size-3 text-green-600" />
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Total Expected</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                {currencyCode} {totalExpected.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="size-3 text-blue-600" />
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Payments</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                {expectations.length}
              </p>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Status</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: overdueCount > 0 ? '#ef4444' : '#10b981' }}>
                {overdueCount > 0 ? `${overdueCount} Overdue` : 'On Track'}
              </p>
            </div>
          </div>

          {/* Payment List */}
          <div className="p-4">
            {expectations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="size-12 mx-auto mb-3 opacity-30" style={{ color: isDark ? '#94a3b8' : '#9ca3af' }} />
                <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                  No payments expected {period === 'week' ? 'this week' : 'this month'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-xs uppercase mb-2" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                  Payments ({expectations.length})
                </h4>
                {expectations.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                      borderColor: exp.status === 'paid'
                        ? '#10b981'
                        : exp.status === 'overdue' 
                          ? '#ef4444' 
                          : exp.status === 'on-time' 
                            ? '#f59e0b' 
                            : isDark ? '#334155' : '#e5e7eb',
                      borderLeftWidth: '3px'
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                          {exp.clientName}
                        </p>
                        <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                          {exp.loanId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                          {currencyCode} {exp.amount.toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ 
                          color: exp.status === 'paid'
                            ? '#10b981'
                            : exp.status === 'overdue' 
                              ? '#ef4444' 
                              : exp.status === 'on-time' 
                                ? '#f59e0b' 
                                : isDark ? '#94a3b8' : '#6b7280' 
                        }}>
                          {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-2">
                      <span 
                        className="inline-block px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: exp.status === 'paid'
                            ? '#d1fae5'
                            : exp.status === 'overdue' 
                              ? '#fee2e2' 
                              : exp.status === 'on-time' 
                                ? '#fef3c7' 
                                : isDark ? '#334155' : '#e5e7eb',
                          color: exp.status === 'paid'
                            ? '#065f46'
                            : exp.status === 'overdue' 
                              ? '#991b1b' 
                              : exp.status === 'on-time' 
                                ? '#92400e' 
                                : isDark ? '#94a3b8' : '#6b7280'
                        }}
                      >
                        {exp.status === 'paid'
                          ? '✅ Paid'
                          : exp.status === 'overdue' 
                            ? '⚠️ Overdue' 
                            : exp.status === 'on-time' 
                              ? '🔔 Due Soon' 
                              : '📅 Upcoming'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {expectations.length > 0 && (
            <div className="p-4 border-t" style={{ 
              borderColor: isDark ? '#334155' : '#e5e7eb',
              backgroundColor: isDark ? '#0f172a' : '#f9fafb'
            }}>
              <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
                💡 <strong>Quick Summary:</strong> Expecting {currencyCode} {totalExpected.toLocaleString()} from {expectations.length} payment{expectations.length !== 1 ? 's' : ''} {period === 'week' ? 'this week' : 'this month'}.
                {overdueCount > 0 && ` ${overdueCount} payment${overdueCount !== 1 ? 's are' : ' is'} overdue.`}
                {onTimeCount > 0 && ` ${onTimeCount} payment${onTimeCount !== 1 ? 's are' : ' is'} due within 3 days.`}
                {paidCount > 0 && ` ${paidCount} payment${paidCount !== 1 ? 's have' : ' has'} been paid.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}