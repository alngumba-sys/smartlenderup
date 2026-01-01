import { useState } from 'react';
import { X, DollarSign, Building2, Smartphone, Wallet, Calendar, FileText, User } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode, getMobileMoneyProviders } from '../../utils/currencyUtils';

interface FundAccountModalProps {
  onClose: () => void;
  onSubmit: (data: FundAccountData) => void;
}

export interface FundAccountData {
  bankAccountId: string; // Changed from hardcoded accountType to dynamic bank account ID
  amount: number;
  date: string;
  reference: string;
  description: string;
  source: string; // e.g., "External Deposit", "Owner Investment", etc.
  shareholderId?: string; // Required when source is "Shareholder Capital"
  shareholderName?: string;
  paymentMethod?: 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque';
  depositorName?: string; // Name of person making the deposit (for all payment methods)
  mpesaDetails?: {
    transactionCode: string;
    phoneNumber: string;
    senderName: string;
  };
}

export function FundAccountModal({ onClose, onSubmit }: FundAccountModalProps) {
  const { shareholders, bankAccounts } = useData();
  const currencyCode = getCurrencyCode();
  const mobileMoneyProviders = getMobileMoneyProviders();
  
  const [formData, setFormData] = useState<FundAccountData>({
    bankAccountId: bankAccounts.find(acc => acc.status === 'Active')?.id || '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    source: 'External Deposit',
    paymentMethod: 'Bank Transfer'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!formData.reference.trim()) {
      alert('Please enter a reference number');
      return;
    }
    if (!formData.bankAccountId) {
      alert('Please select a bank account');
      return;
    }
    if (formData.source === 'Shareholder Capital' && !formData.shareholderId) {
      alert('Please select a shareholder');
      return;
    }
    if (!formData.depositorName?.trim()) {
      alert('Please enter the depositor name');
      return;
    }
    if (formData.paymentMethod === 'M-Pesa') {
      if (!formData.mpesaDetails?.transactionCode) {
        alert('Please enter M-Pesa transaction code');
        return;
      }
      if (!formData.mpesaDetails?.phoneNumber) {
        alert('Please enter M-Pesa phone number');
        return;
      }
      if (!formData.mpesaDetails?.senderName) {
        alert('Please enter M-Pesa sender name');
        return;
      }
    }
    onSubmit(formData);
    onClose();
  };

  const sourceOptions = [
    'External Deposit',
    'Owner Investment',
    'Shareholder Capital',
    'Loan from Bank',
    'Other Income',
    'Transfer from Another Account'
  ];

  const activeBankAccounts = bankAccounts.filter(acc => acc.status === 'Active');
  const selectedBankAccount = bankAccounts.find(acc => acc.id === formData.bankAccountId);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Bank': return Building2;
      case 'Cash': return Wallet;
      case 'Mobile Money': return Smartphone;
      default: return Building2;
    }
  };

  const Icon = selectedBankAccount ? getAccountIcon(selectedBankAccount.accountType) : DollarSign;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 flex items-center gap-2.5 text-xl font-semibold">
              <DollarSign className="size-6 text-emerald-600" />
              Fund Account
            </h3>
            <p className="text-gray-600 text-sm mt-1">Add funds to your accounts</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Account Selection */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Select Account to Fund <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {activeBankAccounts.map((account) => {
                const AccountIcon = getAccountIcon(account.accountType);
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, bankAccountId: account.id })}
                    className={`p-2.5 border-2 rounded-lg flex items-center gap-2 transition-all ${
                      formData.bankAccountId === account.id
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <AccountIcon className={`size-4 flex-shrink-0 ${formData.bankAccountId === account.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                    <div className="text-left flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${formData.bankAccountId === account.id ? 'text-emerald-900' : 'text-gray-900'}`}>
                        {account.name}
                      </p>
                      {account.bankName && (
                        <p className={`text-xs truncate ${formData.bankAccountId === account.id ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {account.bankName}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount and Source of Funds - Same Line */}
          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Amount ({currencyCode}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{currencyCode}</span>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-14 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Source of Funds */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Source of Funds <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              >
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shareholder Selection */}
          {formData.source === 'Shareholder Capital' && (
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Select Shareholder <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.shareholderId || ''}
                onChange={(e) => {
                  const selectedShareholder = shareholders.find(s => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    shareholderId: e.target.value,
                    shareholderName: selectedShareholder?.name
                  });
                }}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              >
                <option value="">Select a shareholder</option>
                {shareholders.map((shareholder) => (
                  <option key={shareholder.id} value={shareholder.id}>
                    {shareholder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method and Depositor Name - Same Line */}
          <div className="grid grid-cols-2 gap-3">
            {/* Payment Method */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'Bank Transfer' | 'M-Pesa' | 'Cash' | 'Cheque' })}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              >
                <option value="Bank Transfer">Bank Transfer</option>
                {mobileMoneyProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Depositor Name */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Depositor Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <select
                  value={formData.depositorName || ''}
                  onChange={(e) => setFormData({ ...formData, depositorName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent appearance-none"
                  required
                >
                  <option value="">Select shareholder</option>
                  {shareholders.map(shareholder => (
                    <option key={shareholder.id} value={shareholder.name}>
                      {shareholder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* M-Pesa Details */}
          {formData.paymentMethod === 'M-Pesa' && (
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                M-Pesa Transaction Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mpesaDetails?.transactionCode || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  mpesaDetails: {
                    ...formData.mpesaDetails,
                    transactionCode: e.target.value
                  }
                })}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                placeholder="Enter transaction code"
                required
              />
            </div>
          )}
          {formData.paymentMethod === 'M-Pesa' && (
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                M-Pesa Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mpesaDetails?.phoneNumber || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  mpesaDetails: {
                    ...formData.mpesaDetails,
                    phoneNumber: e.target.value
                  }
                })}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>
          )}
          {formData.paymentMethod === 'M-Pesa' && (
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                M-Pesa Sender Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mpesaDetails?.senderName || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  mpesaDetails: {
                    ...formData.mpesaDetails,
                    senderName: e.target.value
                  }
                })}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                placeholder="Enter sender name"
                required
              />
            </div>
          )}

          {/* Transaction Date and Reference Number - Same Line */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Reference Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  placeholder="e.g., DEPOSIT-001, TXN123456"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <DollarSign className="size-4" />
              Fund Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}