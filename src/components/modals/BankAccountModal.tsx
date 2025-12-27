import { useState, useEffect } from 'react';
import { X, Building2, Wallet, Smartphone, Calendar } from 'lucide-react';
import { BankAccount } from '../../contexts/DataContext';
import { getCurrencyCode, getCurrencyOptions } from '../../utils/currencyUtils';

interface BankAccountModalProps {
  onClose: () => void;
  onSubmit: (data: BankAccountFormData) => void;
  editAccount?: BankAccount;
}

export interface BankAccountFormData {
  name: string;
  accountType: 'Bank' | 'Cash' | 'Mobile Money';
  bankName?: string;
  accountNumber?: string;
  branch?: string;
  currency: string;
  openingBalance: number;
  openingDate: string;
  status: 'Active' | 'Inactive' | 'Closed';
  description?: string;
  createdBy: string;
}

export function BankAccountModal({ onClose, onSubmit, editAccount }: BankAccountModalProps) {
  const defaultCurrency = getCurrencyCode();
  
  const [formData, setFormData] = useState<BankAccountFormData>({
    name: '',
    accountType: 'Bank',
    bankName: '',
    accountNumber: '',
    branch: '',
    currency: defaultCurrency,
    openingBalance: 0,
    openingDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    description: '',
    createdBy: 'Admin' // Should come from auth context
  });

  useEffect(() => {
    if (editAccount) {
      setFormData({
        name: editAccount.name,
        accountType: editAccount.accountType,
        bankName: editAccount.bankName || '',
        accountNumber: editAccount.accountNumber || '',
        branch: editAccount.branch || '',
        currency: editAccount.currency,
        openingBalance: editAccount.openingBalance,
        openingDate: editAccount.openingDate,
        status: editAccount.status,
        description: editAccount.description || '',
        createdBy: editAccount.createdBy
      });
    }
  }, [editAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter an account name');
      return;
    }
    if (formData.accountType === 'Bank' && !formData.bankName?.trim()) {
      alert('Please enter a bank name');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const accountTypeIcon = {
    'Bank': Building2,
    'Cash': Wallet,
    'Mobile Money': Smartphone
  };

  const Icon = accountTypeIcon[formData.accountType];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#3a4454] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-600/50">
        {/* Header */}
        <div className="bg-[#003153] px-[27px] py-[23px] flex items-center justify-between border-b border-gray-600/30">
          <div className="flex items-center gap-[14px]">
            <div className="p-[9px] bg-emerald-500/20 rounded-lg">
              <Icon className="size-[27px] text-emerald-400" />
            </div>
            <h3 className="text-white text-[1.41rem] font-semibold">
              {editAccount ? 'Edit Account' : 'Add New Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-[7px] transition-all"
          >
            <X className="size-[23px]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-[20px] space-y-[17px] overflow-y-auto max-h-[calc(90vh-80px)] bg-[#181b21]">
          {/* Account Type Selection */}
          <div>
            <label className="block text-[#e8d1c9] mb-[9px] font-medium text-[0.96rem]">
              Account Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-[9px]">
              {(['Bank', 'Mobile Money'] as const).map((type) => {
                const TypeIcon = accountTypeIcon[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: type })}
                    className={`p-[14px] border-2 rounded-lg flex items-center gap-[9px] transition-all ${
                      formData.accountType === type
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                        : 'border-gray-700/50 hover:border-gray-600 bg-[#242932]'
                    }`}
                  >
                    <TypeIcon className={`size-[18px] ${formData.accountType === type ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span className={`text-[0.96rem] ${formData.accountType === type ? 'text-white font-semibold' : 'text-gray-300'}`}>
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bank Type: Bank Name and Account Name on same line */}
          {formData.accountType === 'Bank' && (
            <div className="grid grid-cols-2 gap-[14px]">
              {/* Bank Name */}
              <div>
                <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                  Bank Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                  placeholder="e.g., Bank name"
                  required
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                  Account Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                  placeholder="e.g., Main Operating Account"
                  required
                />
              </div>
            </div>
          )}

          {/* Bank Type: Account Number and Branch on same line */}
          {formData.accountType === 'Bank' && (
            <div className="grid grid-cols-2 gap-[14px]">
              {/* Account Number */}
              <div>
                <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                  Account Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                  placeholder="1234567890"
                  required
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                  Branch
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                  placeholder="e.g., ABC Branch"
                />
              </div>
            </div>
          )}

          {/* Mobile Money: Account Number and Account Name on same line (Account Number first) */}
          {formData.accountType === 'Mobile Money' && (
            <div className="grid grid-cols-2 gap-[14px]">
              {/* Account Number */}
              <div>
                <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                  placeholder="0712345678"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                  Account Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                  placeholder="e.g., M-Pesa Account"
                  required
                />
              </div>
            </div>
          )}

          {/* Currency and Opening Balance - Same Line */}
          <div className="grid grid-cols-2 gap-[14px]">
            {/* Currency */}
            <div>
              <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                Currency <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white transition-all"
                required
              >
                {getCurrencyOptions().map((option) => (
                  <option key={option.code} value={option.code} className="bg-[#0f1216]">
                    {option.code} - {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                Opening Balance <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.openingBalance || ''}
                onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Opening Date and Status - Same Line */}
          <div className="grid grid-cols-2 gap-[14px]">
            {/* Opening Date */}
            <div>
              <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                Opening Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-[11px] top-1/2 -translate-y-1/2 size-[18px] text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                  className="w-full pl-[41px] pr-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[#e8d1c9] mb-[7px] font-medium text-[0.96rem]">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-[14px] py-2 text-[0.96rem] bg-[#0f1216] border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white transition-all"
                required
              >
                <option value="Active" className="bg-[#0f1216]">Active</option>
                <option value="Inactive" className="bg-[#0f1216]">Inactive</option>
                <option value="Closed" className="bg-[#0f1216]">Closed</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-[9px] pt-[14px] border-t border-gray-800/30">
            <button
              type="button"
              onClick={onClose}
              className="px-[20px] py-2 text-[0.96rem] text-gray-300 bg-[#0d0f13] border border-gray-800/50 rounded-lg hover:bg-[#14161b] transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-[20px] py-2 text-[0.96rem] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-[9px] font-medium shadow-lg shadow-emerald-600/30"
            >
              <Icon className="size-[18px]" />
              {editAccount ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
