import { X, DollarSign, Users, Calendar, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { toast } from 'sonner';

interface PayrollDetailsModalProps {
  payrollId: string;
  onClose: () => void;
}

export function PayrollDetailsModal({ payrollId, onClose }: PayrollDetailsModalProps) {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const { payrollRuns, processPayroll, bankAccounts } = useData();
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [showBankAccountSelector, setShowBankAccountSelector] = useState(false);
  
  const payroll = payrollRuns.find(p => p.id === payrollId);

  if (!payroll) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800';
      case 'Approved': return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'Pending Approval': return isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800';
      case 'Draft': return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      case 'Cancelled': return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessPayroll = () => {
    setShowBankAccountSelector(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedBankAccount) {
      toast.error('Please select a bank account');
      return;
    }

    const selectedAccount = bankAccounts.find(acc => acc.id === selectedBankAccount);
    if (!selectedAccount) {
      toast.error('Invalid bank account');
      return;
    }

    if (selectedAccount.balance < payroll.totalNetPay) {
      toast.error(`Insufficient funds! Account balance: ${currencyCode} ${selectedAccount.balance.toLocaleString()}`);
      return;
    }

    processPayroll(payrollId, new Date().toISOString().split('T')[0], selectedBankAccount);
    toast.success('Payroll processed successfully!');
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="size-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-gray-900 dark:text-white">Payroll Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{payroll.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(payroll.status)}`}>
              {payroll.status}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="size-4" />
              <span>Period: {payroll.period}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="size-4" />
              <span>{payroll.employees.length} Employees</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-300 mb-1">Total Gross Pay</p>
              <p className="text-2xl text-blue-900 dark:text-blue-300">{currencyCode} {payroll.totalGrossPay.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-900 dark:text-orange-300 mb-1">Total Deductions</p>
              <p className="text-2xl text-orange-900 dark:text-orange-300">{currencyCode} {payroll.totalDeductions.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-900 dark:text-emerald-300 mb-1">Total Net Pay</p>
              <p className="text-2xl text-emerald-900 dark:text-emerald-300">{currencyCode} {payroll.totalNetPay.toLocaleString()}</p>
            </div>
          </div>

          {/* Employee Details */}
          <div>
            <h4 className="text-gray-900 dark:text-white mb-4">Employee Breakdown</h4>
            <div className="space-y-3">
              {payroll.employees.map((employee) => (
                <div key={employee.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="text-gray-900 dark:text-white">{employee.employeeName}</h5>
                      {employee.position && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      employee.status === 'Paid' 
                        ? (isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800')
                        : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                    }`}>
                      {employee.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Base Salary</p>
                      <p className="text-sm text-gray-900 dark:text-white">{currencyCode} {employee.baseSalary.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gross Pay</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{currencyCode} {employee.grossPay.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Deductions</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">{currencyCode} {employee.totalDeductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net Pay</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">{currencyCode} {employee.netPay.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Allowances */}
                  {employee.allowances.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Allowances:</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.allowances.map((allowance, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">
                            {allowance.name}: {currencyCode} {allowance.amount.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deductions */}
                  {employee.deductions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Deductions:</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.deductions.map((deduction, i) => (
                          <span key={i} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded">
                            {deduction.type}: {currencyCode} {deduction.amount.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Payment Method: <span className="text-gray-900 dark:text-white">{employee.paymentMethod}</span></p>
                    {employee.paymentReference && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">Reference: <span className="text-gray-900 dark:text-white font-mono">{employee.paymentReference}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="text-gray-900 dark:text-white mb-3">Audit Trail</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created By:</span>
                <span className="text-gray-900 dark:text-white">{payroll.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created Date:</span>
                <span className="text-gray-900 dark:text-white">{payroll.createdDate}</span>
              </div>
              {payroll.approvedBy && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Approved By:</span>
                    <span className="text-gray-900 dark:text-white">{payroll.approvedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Approved Date:</span>
                    <span className="text-gray-900 dark:text-white">{payroll.approvedDate}</span>
                  </div>
                </>
              )}
              {payroll.paidDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid Date:</span>
                  <span className="text-gray-900 dark:text-white">{payroll.paidDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Date:</span>
                <span className="text-gray-900 dark:text-white">{payroll.payDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            {payroll.status === 'Draft' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This payroll is in draft status. Approve it before processing payment.
              </p>
            )}
            {payroll.status === 'Approved' && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Ready to process. Click "Process Payment" to complete.
              </p>
            )}
            {payroll.status === 'Paid' && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                ✓ This payroll has been processed and paid.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {payroll.status === 'Approved' && !showBankAccountSelector && (
              <button
                onClick={handleProcessPayroll}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <CheckCircle className="size-4" />
                Process Payment
              </button>
            )}
            {showBankAccountSelector && (
              <>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedBankAccount}
                    onChange={(e) => setSelectedBankAccount(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  >
                    <option value="">Select Bank Account...</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.accountNumber} ({currencyCode} {account.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <CheckCircle className="size-4" />
                    Confirm Payment
                  </button>
                  <button
                    onClick={() => setShowBankAccountSelector(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {!showBankAccountSelector && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}