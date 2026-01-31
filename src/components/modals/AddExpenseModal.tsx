import { X, DollarSign, Save, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode, getMobileMoneyProviders } from '../../utils/currencyUtils';
import { toast } from 'sonner';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';

interface AddExpenseModalProps {
  onClose: () => void;
}

export function AddExpenseModal({ onClose }: AddExpenseModalProps) {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const mobileMoneyProviders = getMobileMoneyProviders();
  const { payees, addExpense, bankAccounts } = useData();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    payeeId: '',
    category: '',
    description: '',
    amount: '',
    paymentMethod: mobileMoneyProviders.length > 0 ? mobileMoneyProviders[0] : 'Bank Transfer',
    referenceNumber: '',
    paymentType: '', // For employee/contractor payments
    status: 'Pending' as 'Pending' | 'Paid',
    bankAccountId: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);

  const categories = [
    'Salaries & Wages',
    'Rent',
    'Utilities',
    'Office Supplies',
    'Marketing',
    'Transport',
    'Professional Fees',
    'Bank Charges',
    'Insurance',
    'Maintenance',
    'Training',
    'Communication',
    'Security',
    'Taxes',
    'Statutory Deductions',
    'IT Services',
    'Software',
    'Licenses & Permits',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show confirmation modal instead of saving directly
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection('record expense');
    if (!isConnected) {
      return; // Block the operation if offline
    }

    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    const userName = currentUser.name || 'System User';
    
    // Get the payee name
    const selectedPayee = payees.find(p => p.id === formData.payeeId);
    const payeeName = selectedPayee ? selectedPayee.name : 'Unknown';
    
    // Map category to one of the allowed values
    let expenseCategory: 'Operational' | 'Administrative' | 'Marketing' | 'IT & Technology' | 'Utilities' | 'Rent' | 'Salaries & Wages' | 'Other' = 'Operational';
    
    if (formData.category === 'Salaries & Wages') expenseCategory = 'Salaries & Wages';
    else if (formData.category === 'Rent') expenseCategory = 'Rent';
    else if (formData.category === 'Utilities') expenseCategory = 'Utilities';
    else if (formData.category === 'Marketing') expenseCategory = 'Marketing';
    else if (formData.category === 'IT Services' || formData.category === 'Software') expenseCategory = 'IT & Technology';
    else if (formData.category.toLowerCase().includes('admin')) expenseCategory = 'Administrative';
    else expenseCategory = 'Other';
    
    // Map payment method to one of the allowed values
    let mappedPaymentMethod: 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque' = 'Cash';
    if (formData.paymentMethod === 'Bank Transfer') mappedPaymentMethod = 'Bank Transfer';
    else if (formData.paymentMethod === 'Cheque') mappedPaymentMethod = 'Cheque';
    else if (formData.paymentMethod === 'Cash') mappedPaymentMethod = 'Cash';
    else mappedPaymentMethod = 'M-Pesa'; // Default mobile money to M-Pesa
    
    // Create the expense object
    const newExpense: any = {
      category: expenseCategory,
      subcategory: formData.category,
      amount: parseFloat(formData.amount),
      payeeId: formData.payeeId,
      payeeName: payeeName,
      paymentMethod: mappedPaymentMethod,
      paymentReference: formData.referenceNumber,
      expenseDate: formData.date,
      description: formData.description,
      status: formData.status,
      createdBy: userName
    };
    
    // Add paymentType if it's an employee or contractor payment
    if (formData.paymentType) {
      newExpense.paymentType = formData.paymentType;
    }
    
    // Add bankAccountId if payment method is Bank Transfer
    if (formData.paymentMethod === 'Bank Transfer' && formData.bankAccountId) {
      newExpense.bankAccountId = formData.bankAccountId;
    }
    
    addExpense(newExpense);
    toast.success('Expense recorded successfully!');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const payeeId = e.target.value;
    
    setFormData({
      ...formData,
      payeeId
    });
  };
  
  const activePayees = payees.filter(p => p.status === 'Active');
  
  // Get selected payee details for confirmation
  const selectedPayee = payees.find(p => p.id === formData.payeeId);

  return (
    <>
      {!showConfirmation ? (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="size-6 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-2xl text-gray-900 dark:text-white">Record New Expense</h2>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Date */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Expense Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Payee */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Payee/Vendor <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="payeeId"
                      value={formData.payeeId}
                      onChange={handlePayeeChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                    >
                      <option value="">Select payee...</option>
                      {activePayees.map(payee => (
                        <option key={payee.id} value={payee.id}>
                          {payee.name} - {payee.type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Amount ({currencyCode}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                    />
                  </div>

                  {/* Category - Auto-populated and read-only */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                    >
                      <option value="">Select category...</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Type - Only show for Employee or Contractor */}
                {selectedPayee && (selectedPayee.type === 'Employee' || selectedPayee.type === 'Contractor') && (
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Payment Type <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs ml-2">Specify if this is salary or service</span>
                    </label>
                    <select
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                    >
                      <option value="">Select payment type...</option>
                      <option value="Salary/Wage">💼 Salary/Wage (Regular Payroll)</option>
                      <option value="Service Fee">🔧 Service Fee (Work Performed)</option>
                      <option value="Consulting Fee">💡 Consulting Fee (Professional Advice)</option>
                      <option value="Allowance">📌 Allowance (Travel, Housing, etc.)</option>
                      <option value="Bonus">🎁 Bonus (Performance, Holiday, etc.)</option>
                      <option value="Reimbursement">💳 Reimbursement (Expenses Paid Back)</option>
                      <option value="Other">📝 Other</option>
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  {/* Description */}
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    rows={2}
                    placeholder="Brief description of the expense"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                    >
                      {mobileMoneyProviders.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                      placeholder="e.g., Invoice #, Mobile Money Code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Status */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                      required
                    >
                      <option value="Pending">Pending (To be paid later)</option>
                      <option value="Paid">Paid (Already paid)</option>
                    </select>
                  </div>

                  {/* Bank Account - Only show for Bank Transfer */}
                  {formData.paymentMethod === 'Bank Transfer' && (
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                        Bank Account <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="bankAccountId"
                        value={formData.bankAccountId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                        required
                      >
                        <option value="">Select bank account...</option>
                        {bankAccounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.bankName || account.name} - {account.accountNumber} ({currencyCode} {account.balance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <Save className="size-4" />
                    Record Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="size-6 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-2xl text-gray-900 dark:text-white">Confirm Expense Details</h2>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X className="size-5" />
                </button>
              </div>

              {/* Summary Grid */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6 space-y-4">
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                    <p className="text-gray-900 dark:text-white">{new Date(formData.date).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                    <p className="text-gray-900 dark:text-white">{currencyCode} {parseFloat(formData.amount).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payee/Vendor</p>
                    <p className="text-gray-900 dark:text-white">{selectedPayee ? selectedPayee.name : 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                    <p className="text-gray-900 dark:text-white">{formData.category}</p>
                  </div>

                  {formData.paymentType && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Type</p>
                      <p className="text-gray-900 dark:text-white">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm">
                          {formData.paymentType}
                        </span>
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                    <p className="text-gray-900 dark:text-white">{formData.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference Number</p>
                    <p className="text-gray-900 dark:text-white">{formData.referenceNumber || '-'}</p>
                  </div>
                </div>

                {formData.description && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-gray-900 dark:text-white">{formData.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <CheckCircle className="size-4" />
                  Confirm and Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}