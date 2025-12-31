import { useState } from 'react';
import { Plus, Search, Download, DollarSign, TrendingDown, TrendingUp, Calendar, Filter, X, Eye, Upload, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { AddExpenseModal } from '../modals/AddExpenseModal';
import { ExpenseDetailsModal } from '../modals/ExpenseDetailsModal';
import { UploadExpensesModal } from '../modals/UploadExpensesModal';
import { ManagePayeesModal } from '../modals/ManagePayeesModal';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface Expense {
  id: string;
  date: string;
  payeeName: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentReference: string;
  payeeId: string;
  subcategory: string;
  createdBy: string;
}

interface Payee {
  id: string;
  name: string;
  status: string;
}

export function ExpensesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPayee, setSelectedPayee] = useState('All');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showUploadExpensesModal, setShowUploadExpensesModal] = useState(false);
  const [showManagePayeesModal, setShowManagePayeesModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const { isDark } = useTheme();
  
  // Get real data from DataContext
  const { expenses, payees } = useData();

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.paymentReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || expense.subcategory === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || expense.status === selectedStatus;
    const matchesPayee = selectedPayee === 'All' || expense.payeeId === selectedPayee;
    return matchesSearch && matchesCategory && matchesStatus && matchesPayee;
  });

  // Calculate statistics
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidExpenses = filteredExpenses.filter(e => e.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'Pending' || e.status === 'Approved').reduce((sum, exp) => sum + exp.amount, 0);
  
  const currencyCode = getCurrencyCode();
  const categories = ['All', 'Salaries & Wages', 'Rent', 'Utilities', 'Office Supplies', 'Marketing', 'Transport', 'Professional Fees', 'Bank Charges', 'Insurance', 'Maintenance', 'Training', 'Communication', 'Security', 'Taxes', 'Statutory Deductions', 'IT Services', 'Software', 'Licenses & Permits', 'Other'];

  const statuses = ['All', 'Paid', 'Pending', 'Approved', 'Rejected'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800';
      case 'Pending': return isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800';
      case 'Approved': return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'Rejected': return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 ${isDark ? 'dark' : ''}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-gray-900 dark:text-white">Expense Management</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowManagePayeesModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              <Users className="size-4" />
              Manage Vendors
            </button>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
            >
              <Plus className="size-4" />
              Record Expense
            </button>
            <button
              onClick={() => setShowUploadExpensesModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Upload className="size-4" />
              Upload Expenses
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track and manage all company expenses
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-6 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
          style={{
            backgroundColor: '#15233a',
            borderColor: '#1e2f42'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Expenses</p>
            <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{currencyCode} {totalExpenses.toLocaleString()}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{filteredExpenses.length} transactions</p>
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
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Paid</p>
            <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl text-emerald-600 dark:text-emerald-400">{currencyCode} {paidExpenses.toLocaleString()}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredExpenses.filter(e => e.status === 'Paid').length} payments
          </p>
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
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
            <Calendar className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl text-amber-600 dark:text-amber-400">{currencyCode} {pendingExpenses.toLocaleString()}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredExpenses.filter(e => e.status === 'Pending' || e.status === 'Approved').length} pending
          </p>
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
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Payees</p>
            <Users className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{payees.filter(p => p.status === 'Active').length}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>registered vendors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 bg-[rgb(17,17,32)] px-[16px] py-[7px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Payee Filter */}
          <div>
            <select
              value={selectedPayee}
              onChange={(e) => setSelectedPayee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
            >
              <option value="All">All Payees</option>
              {payees.map(payee => (
                <option key={payee.id} value={payee.id}>{payee.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payee</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Created by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedExpenseId(expense.id)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{expense.expenseDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{expense.payeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{expense.subcategory}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{expense.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{currencyCode} {expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{expense.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{expense.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddExpenseModal && (
        <AddExpenseModal onClose={() => setShowAddExpenseModal(false)} />
      )}

      {showUploadExpensesModal && (
        <UploadExpensesModal onClose={() => setShowUploadExpensesModal(false)} />
      )}

      {showManagePayeesModal && (
        <ManagePayeesModal onClose={() => setShowManagePayeesModal(false)} />
      )}

      {selectedExpenseId && (
        <ExpenseDetailsModal 
          expenseId={selectedExpenseId}
          onClose={() => setSelectedExpenseId(null)}
        />
      )}
    </div>
  );
}