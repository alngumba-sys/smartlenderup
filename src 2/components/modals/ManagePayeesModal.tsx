import { X, Users, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddPayeeModal } from './AddPayeeModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface ManagePayeesModalProps {
  onClose: () => void;
}

export function ManagePayeesModal({ onClose }: ManagePayeesModalProps) {
  const { isDark } = useTheme();
  const { payees } = useData();
  const currencyCode = getCurrencyCode();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddPayeeModal, setShowAddPayeeModal] = useState(false);

  const categories = ['All', 'Employee', 'Utilities', 'Rent', 'Services', 'Suppliers', 'Other'];

  const filteredPayees = payees.filter(payee => {
    const matchesSearch = payee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payee.phone.includes(searchTerm) ||
                         (payee.email && payee.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || payee.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group payees by category
  const groupedPayees = filteredPayees.reduce((acc, payee) => {
    const category = payee.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(payee);
    return acc;
  }, {} as Record<string, typeof filteredPayees>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedPayees).sort();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="size-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white">Manage Payees / Vendors</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payees by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddPayeeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              <Plus className="size-4" />
              Add Payee
            </button>
          </div>
        </div>

        {/* Payees Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Paid</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No payees found
                    </td>
                  </tr>
                ) : (
                  sortedCategories.map(category => (
                    <>
                      {/* Category Header */}
                      <tr key={`header-${category}`} className="bg-gray-100 dark:bg-gray-700">
                        <td colSpan={7} className="px-4 py-2 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                          {category}
                        </td>
                      </tr>
                      {/* Payees in this category */}
                      {groupedPayees[category].map((payee) => (
                        <tr key={payee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">{payee.name}</p>
                              {payee.contactPerson && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">Contact: {payee.contactPerson}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{payee.type}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">{payee.phone}</p>
                              {payee.email && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{payee.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{payee.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{currencyCode} {payee.totalPaid.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              payee.status === 'Active' 
                                ? (isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800')
                                : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                            }`}>
                              {payee.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                <Edit className="size-4" />
                              </button>
                              <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredPayees.length} of {payees.length} payees
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>

      {showAddPayeeModal && (
        <AddPayeeModal onClose={() => setShowAddPayeeModal(false)} />
      )}
    </div>
  );
}