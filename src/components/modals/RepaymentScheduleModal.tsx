import { X, Calendar, DollarSign, TrendingDown, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface RepaymentScheduleModalProps {
  loan: {
    id: string;
    clientName: string;
    productName: string;
    principalAmount: number;
    interestRate: number;
    interestType: string;
    term: number;
    termUnit: string;
    repaymentFrequency: string;
    disbursementDate: string;
    firstRepaymentDate: string;
    maturityDate: string;
    installmentAmount: number;
    numberOfInstallments: number;
    totalInterest: number;
    totalRepayable: number;
    paidAmount: number;
    outstandingBalance: number;
  };
  onClose: () => void;
}

export function RepaymentScheduleModal({ loan, onClose }: RepaymentScheduleModalProps) {
  const { isDark } = useTheme();

  // Generate repayment schedule
  const generateSchedule = () => {
    const schedule = [];
    const startDate = new Date(loan.firstRepaymentDate);
    
    // Calculate frequency in days
    const frequencyDays = {
      'Daily': 1,
      'Weekly': 7,
      'Bi-Weekly': 14,
      'Monthly': 30,
      'Quarterly': 90
    }[loan.repaymentFrequency] || 30;

    let remainingPrincipal = loan.principalAmount;
    let remainingInterest = loan.totalInterest;
    const paidInstallments = Math.floor(loan.paidAmount / loan.installmentAmount);

    for (let i = 0; i < loan.numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i * frequencyDays));

      // Calculate principal and interest split
      let principalPortion: number;
      let interestPortion: number;

      if (loan.interestType === 'Flat') {
        // Flat rate: equal interest every period
        interestPortion = loan.totalInterest / loan.numberOfInstallments;
        principalPortion = loan.installmentAmount - interestPortion;
      } else {
        // Reducing/Declining balance: more interest early on
        interestPortion = (remainingPrincipal * (loan.interestRate / 100)) / (12 / (frequencyDays / 30));
        principalPortion = loan.installmentAmount - interestPortion;
      }

      const status = i < paidInstallments ? 'paid' : 
                     i === paidInstallments ? 'due' : 'pending';

      schedule.push({
        installmentNumber: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        principalPortion: principalPortion,
        interestPortion: interestPortion,
        totalPayment: loan.installmentAmount,
        principalBalance: Math.max(0, remainingPrincipal - principalPortion),
        status: status
      });

      remainingPrincipal -= principalPortion;
      remainingInterest -= interestPortion;
    }

    return schedule;
  };

  const schedule = generateSchedule();
  const paidCount = schedule.filter(s => s.status === 'paid').length;
  const pendingCount = schedule.filter(s => s.status === 'pending').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Repayment Schedule</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {loan.productName} - {loan.clientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>Loan Amount</p>
              <p className={isDark ? 'text-white' : 'text-blue-900'}>KES {loan.principalAmount.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-purple-50'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-purple-600'}`}>Total Interest</p>
              <p className={isDark ? 'text-white' : 'text-purple-900'}>KES {loan.totalInterest.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-emerald-50'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-emerald-600'}`}>Total Repayable</p>
              <p className={isDark ? 'text-white' : 'text-emerald-900'}>KES {loan.totalRepayable.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-amber-50'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-amber-600'}`}>Installment</p>
              <p className={isDark ? 'text-white' : 'text-amber-900'}>KES {loan.installmentAmount.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-indigo-50'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-indigo-600'}`}>Frequency</p>
              <p className={isDark ? 'text-white' : 'text-indigo-900'}>{loan.repaymentFrequency}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment Progress</span>
              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {paidCount} of {loan.numberOfInstallments} installments paid
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(paidCount / loan.numberOfInstallments) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>#</th>
                  <th className={`px-4 py-3 text-left text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Due Date</th>
                  <th className={`px-4 py-3 text-right text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Principal</th>
                  <th className={`px-4 py-3 text-right text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Interest</th>
                  <th className={`px-4 py-3 text-right text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Payment</th>
                  <th className={`px-4 py-3 text-right text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Balance</th>
                  <th className={`px-4 py-3 text-center text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} ${
                      item.status === 'paid' ? (isDark ? 'bg-emerald-900/20' : 'bg-emerald-50') :
                      item.status === 'due' ? (isDark ? 'bg-amber-900/20' : 'bg-amber-50') :
                      ''
                    }`}
                  >
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.installmentNumber}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        {item.dueDate}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      KES {item.principalPortion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      KES {item.interestPortion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      KES {item.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      KES {item.principalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle className="size-3" />
                          Paid
                        </span>
                      )}
                      {item.status === 'due' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                          <Clock className="size-3" />
                          Due
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={`border-t-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <td colSpan={2} className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <strong>TOTALS</strong>
                  </td>
                  <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <strong>KES {loan.principalAmount.toLocaleString()}</strong>
                  </td>
                  <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <strong>KES {loan.totalInterest.toLocaleString()}</strong>
                  </td>
                  <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <strong>KES {loan.totalRepayable.toLocaleString()}</strong>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Loan ID:</strong> {loan.id}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Period:</strong> {loan.disbursementDate} to {loan.maturityDate}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Paid Amount</p>
              <p className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                KES {loan.paidAmount.toLocaleString()}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Outstanding: KES {loan.outstandingBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
