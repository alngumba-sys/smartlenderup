import { useState, FormEvent } from 'react';
import { XCircle, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner@2.0.3';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface ShareholderFormModalProps {
  shareholder?: {
    id: string;
    name: string;
    nationalId: string;
    email: string;
    phone: string;
    joinedDate: string;
    status: 'active' | 'inactive';
    totalContribution: number;
    percentageOwnership: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShareholderFormModal({ shareholder, onClose, onSuccess }: ShareholderFormModalProps) {
  const { isDark } = useTheme();
  const { addShareholder, updateShareholder } = useData();
  const [formData, setFormData] = useState({
    name: shareholder?.name || '',
    idNumber: shareholder?.nationalId || '',
    email: shareholder?.email || '',
    phone: shareholder?.phone || '',
    address: '',
    joinDate: shareholder?.joinedDate || new Date().toISOString().split('T')[0],
    ownershipPercentage: shareholder?.percentageOwnership || '',
    status: shareholder?.status || 'Active' as 'Active' | 'Inactive',
    shareCapital: shareholder?.totalContribution || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      // Convert empty strings to 0 for numeric fields
      const dataToSubmit = {
        ...formData,
        shareCapital: formData.shareCapital === '' ? 0 : Number(formData.shareCapital),
        ownershipPercentage: formData.ownershipPercentage === '' ? 0 : Number(formData.ownershipPercentage),
      };

      if (shareholder) {
        // Update existing shareholder
        updateShareholder(shareholder.id, dataToSubmit);
        toast.success('Shareholder updated successfully!');
      } else {
        // Add new shareholder
        addShareholder(dataToSubmit);
        toast.success('Shareholder added successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save shareholder');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">{shareholder ? 'Edit Shareholder' : 'Add New Shareholder'}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Kamau"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">National ID *</label>
              <input
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12345678"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              />
            </div>

            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Physical address"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Total Contribution ({getCurrencyCode()})</label>
              <input
                type="number"
                value={formData.shareCapital}
                onChange={(e) => setFormData({ ...formData, shareCapital: e.target.value === '' ? '' : parseFloat(e.target.value) || '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                placeholder="0"
                min="0"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Deposit cash separately through Capital Deposit</p>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Ownership Percentage (%) *</label>
              <input
                type="number"
                required
                value={formData.ownershipPercentage}
                onChange={(e) => setFormData({ ...formData, ownershipPercentage: e.target.value === '' ? '' : parseFloat(e.target.value) || '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Required - Determines profit distribution eligibility</p>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Join Date *</label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {shareholder ? 'Update' : 'Add'} Shareholder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CapitalDepositModalProps {
  shareholder?: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CapitalDepositModal({ shareholder, onClose, onSuccess }: CapitalDepositModalProps) {
  const { isDark } = useTheme();
  const { addShareholderTransaction, shareholders, generateReceiptNumber, bankAccounts } = useData();
  const [formData, setFormData] = useState({
    shareholderId: shareholder?.id || '',
    shareholderName: shareholder?.name || '',
    transactionDate: new Date().toISOString().split('T')[0],
    amount: 0,
    notes: '',
    paymentMethod: 'Bank Transfer' as 'M-Pesa' | 'Bank Transfer' | 'Cheque',
    paymentReference: '',
    processedBy: 'Admin', // TODO: Get from auth context
    bankAccountId: '',
  });

  // Filter bank accounts based on payment method
  const getAvailableAccounts = () => {
    if (formData.paymentMethod === 'M-Pesa') {
      return bankAccounts.filter(acc => acc.accountType === 'Mobile Money' && acc.status === 'Active');
    } else if (formData.paymentMethod === 'Bank Transfer' || formData.paymentMethod === 'Cheque') {
      return bankAccounts.filter(acc => acc.accountType === 'Bank' && acc.status === 'Active');
    }
    return [];
  };

  const availableAccounts = getAvailableAccounts();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      // Find shareholder name if not already set
      let shareholderName = formData.shareholderName;
      if (!shareholderName && formData.shareholderId) {
        const sh = shareholders.find(s => s.id === formData.shareholderId);
        if (sh) {
          shareholderName = sh.name;
        }
      }

      // Create shareholder transaction
      addShareholderTransaction({
        shareholderId: formData.shareholderId,
        shareholderName: shareholderName,
        type: 'Capital Contribution',
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference,
        transactionDate: formData.transactionDate,
        receiptNumber: generateReceiptNumber(),
        processedBy: formData.processedBy,
        notes: formData.notes,
        bankAccountId: formData.bankAccountId,
      });

      toast.success('Capital deposit recorded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error recording capital deposit:', error);
      toast.error('Failed to record capital deposit');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">Record Capital Deposit</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">Shareholder *</label>
              <select
                required
                value={formData.shareholderId}
                onChange={(e) => {
                  const sh = shareholders.find(s => s.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    shareholderId: e.target.value,
                    shareholderName: sh?.name || ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!shareholder}
              >
                <option value="">Select Shareholder</option>
                {shareholders.filter(s => s.status === 'Active').map(sh => (
                  <option key={sh.id} value={sh.id}>{sh.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Date *</label>
              <input
                type="date"
                required
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Amount ({getCurrencyCode()}) *</label>
              <input
                type="text"
                required
                value={formData.amount ? formData.amount.toLocaleString() : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  const numValue = parseFloat(value);
                  setFormData({ ...formData, amount: isNaN(numValue) ? 0 : numValue });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">Description *</label>
              <input
                type="text"
                required
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Q4 capital contribution"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Payment Method *</label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Reference *</label>
              <input
                type="text"
                required
                value={formData.paymentReference}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transaction reference"
              />
            </div>

            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">
                {formData.paymentMethod === 'M-Pesa' ? 'Mobile Money Account' : 'Bank Account'} *
              </label>
              <select
                required
                value={formData.bankAccountId}
                onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {availableAccounts.length === 0 
                    ? `No ${formData.paymentMethod === 'M-Pesa' ? 'mobile money' : 'bank'} accounts available` 
                    : `Select ${formData.paymentMethod === 'M-Pesa' ? 'Mobile Money' : 'Bank'} Account`}
                </option>
                {availableAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} {acc.accountNumber ? `- ${acc.accountNumber}` : ''}
                  </option>
                ))}
              </select>
              {availableAccounts.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please create a {formData.paymentMethod === 'M-Pesa' ? 'mobile money' : 'bank'} account first in the Accounting tab.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={!formData.bankAccountId || availableAccounts.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Record Deposit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProfitDistributionModalProps {
  shareholder?: {
    id: string;
    name: string;
  } | null;
  distribution?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfitDistributionModal({ shareholder, distribution, onClose, onSuccess }: ProfitDistributionModalProps) {
  const { isDark } = useTheme();
  const { addProfitDistribution, updateProfitDistribution, shareholders } = useData();
  const [formData, setFormData] = useState({
    shareholderId: distribution?.shareholderId || shareholder?.id || '',
    shareholderName: distribution?.shareholderName || shareholder?.name || '',
    date: distribution?.date || new Date().toISOString().split('T')[0],
    period: distribution?.period || `Q4 ${new Date().getFullYear()}`,
    amount: distribution?.amount || 0,
    description: distribution?.description || '',
    paymentMethod: (distribution?.paymentMethod || 'Bank Transfer') as 'M-Pesa' | 'Bank Transfer' | 'Cheque',
    reference: distribution?.reference || '',
    status: (distribution?.status || 'pending') as 'pending' | 'approved' | 'paid',
    recordedBy: distribution?.recordedBy || 'Admin',
    recordedDate: distribution?.recordedDate || new Date().toISOString().split('T')[0],
    approvedBy: distribution?.approvedBy,
    approvedDate: distribution?.approvedDate,
    paidDate: distribution?.paidDate,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      // Find shareholder name if not already set
      if (!formData.shareholderName && formData.shareholderId) {
        const sh = shareholders.find(s => s.id === formData.shareholderId);
        if (sh) {
          formData.shareholderName = sh.name;
        }
      }

      if (distribution) {
        updateProfitDistribution(distribution.id, formData);
        toast.success('Profit distribution updated successfully!');
      } else {
        addProfitDistribution(formData);
        toast.success('Profit distribution recorded successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save profit distribution');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">{distribution ? 'View/Edit Distribution' : 'Record Profit Distribution'}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">Shareholder *</label>
              <select
                required
                value={formData.shareholderId}
                onChange={(e) => {
                  const sh = shareholders.find(s => s.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    shareholderId: e.target.value,
                    shareholderName: sh?.name || ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!shareholder || !!distribution}
              >
                <option value="">Select Shareholder</option>
                {shareholders.filter(s => s.status === 'Active').map(sh => (
                  <option key={sh.id} value={sh.id}>{sh.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Period *</label>
              <input
                type="text"
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Q4 2025"
              />
            </div>

            <div className="col-span-2">
              <label className="text-gray-700 text-sm mb-1 block">Description *</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Annual profit distribution"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Amount ({getCurrencyCode()}) *</label>
              <input
                type="number"
                required
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="1"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Payment Method *</label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 text-sm mb-1 block">Reference *</label>
              <input
                type="text"
                required
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transaction reference"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {distribution ? 'Update' : 'Record'} Distribution
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}