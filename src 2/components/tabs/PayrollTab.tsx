import { useState } from 'react';
import { DollarSign, TrendingUp, Users, Download, Search, Plus, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { AddPayrollModal } from '../modals/AddPayrollModal';
import { PayrollDetailsModal } from '../modals/PayrollDetailsModal';

export function PayrollTab() {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const { payrollRuns, payees } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [showAddPayrollModal, setShowAddPayrollModal] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);

  // Calculate stats
  const totalGrossPay = payrollRuns
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.totalGrossPay, 0);
  
  const totalNetPay = payrollRuns
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.totalNetPay, 0);
  
  const totalDeductions = payrollRuns
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.totalDeductions, 0);

  // Get unique employee count from payees with category 'Employee'
  const employeePayees = payees.filter(p => p.category === 'Employee' && p.status === 'Active');
  const avgEmployees = employeePayees.length;

  // Filter payrolls
  const filteredPayrolls = payrollRuns.filter(payroll => {
    const matchesSearch = payroll.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || payroll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-gray-900 dark:text-white">Payroll Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage employee payroll and salary disbursements</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Gross Pay</p>
              <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className={`text-2xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{currencyCode} {totalGrossPay.toLocaleString()}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payrollRuns.filter(p => p.status === 'Paid').length} payroll runs</p>
          </div>

          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Net Pay</p>
              <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl text-emerald-600 dark:text-emerald-400 mb-1">{currencyCode} {totalNetPay.toLocaleString()}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>After deductions</p>
          </div>

          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Deductions</p>
              <DollarSign className="size-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl text-orange-600 dark:text-orange-400 mb-1">{currencyCode} {totalDeductions.toLocaleString()}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>NSSF, NHIF, PAYE</p>
          </div>

          <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
            style={{
              backgroundColor: '#15233a',
              borderColor: '#1e2f42'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Employees</p>
              <Users className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className={`text-2xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgEmployees}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Per payroll period</p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-[rgb(17,17,32)] px-[16px] py-[7px]">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by period or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
            >
              <option>All Statuses</option>
              <option>Draft</option>
              <option>Pending Approval</option>
              <option>Approved</option>
              <option>Paid</option>
              <option>Cancelled</option>
            </select>
            <button
              onClick={() => setShowAddPayrollModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap text-sm"
            >
              <Plus className="size-4" />
              Add Payroll
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm">
              <Download className="size-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payroll ID</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Period</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Employees</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Net Pay</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No payroll runs found. Click "Add Payroll" to create your first payroll run.
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map((payroll) => (
                    <tr 
                      key={payroll.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedPayrollId(payroll.id)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{payroll.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{payroll.period}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{payroll.employees.length}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{currencyCode} {payroll.totalGrossPay.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-orange-600 dark:text-orange-400">{currencyCode} {payroll.totalDeductions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">{currencyCode} {payroll.totalNetPay.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payroll.status)}`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {payroll.paidDate || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddPayrollModal && (
        <AddPayrollModal onClose={() => setShowAddPayrollModal(false)} />
      )}

      {selectedPayrollId && (
        <PayrollDetailsModal
          payrollId={selectedPayrollId}
          onClose={() => setSelectedPayrollId(null)}
        />
      )}
    </div>
  );
}