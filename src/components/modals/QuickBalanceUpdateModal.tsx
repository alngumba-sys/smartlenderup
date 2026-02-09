import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/currencyUtils';

interface QuickBalanceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newBalance: number) => void;
  currentBalance: number;
  accountName: string;
  currency: string;
}

export function QuickBalanceUpdateModal({
  isOpen,
  onClose,
  onUpdate,
  currentBalance,
  accountName,
  currency
}: QuickBalanceUpdateModalProps) {
  const { isDark } = useTheme();
  const [newBalance, setNewBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewBalance(currentBalance.toString());
    }
  }, [isOpen, currentBalance]);

  const formatNumberWithCommas = (value: string) => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Split into integer and decimal parts
    const parts = cleanValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add commas to integer part
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return with decimal part if exists
    return decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted;
  };

  const handleBalanceChange = (value: string) => {
    setNewBalance(formatNumberWithCommas(value));
  };

  const handleSubmit = async () => {
    const balance = parseFloat(newBalance.replace(/,/g, ''));
    if (isNaN(balance)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(balance);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const balanceChange = parseFloat(newBalance.replace(/,/g, '')) - currentBalance;
  const hasChanged = Math.abs(balanceChange) > 0.01;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className={`rounded-lg shadow-xl max-w-md w-full mx-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Update Bank Balance
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Account Info */}
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Account
            </p>
            <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
              {accountName}
            </p>
          </div>

          {/* Current Balance */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Balance
            </label>
            <div className={`px-4 py-2.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currency} {currentBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>

          {/* New Balance Input */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              New Balance
            </label>
            <div className="relative">
              <input
                type="text"
                value={newBalance}
                onChange={(e) => handleBalanceChange(e.target.value)}
                placeholder="Enter new balance"
                className={`w-full px-4 py-2.5 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currency}
              </div>
            </div>
          </div>

          {/* Change Preview */}
          {hasChanged && (
            <div className={`p-3 rounded-lg border-l-4 ${
              balanceChange > 0
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Balance will change by:
              </p>
              <p className={`text-lg font-semibold ${
                balanceChange > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {balanceChange > 0 ? '+' : ''}
                {balanceChange.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} {currency}
              </p>
            </div>
          )}

          {/* Warning */}
          <div className={`flex gap-2 p-3 rounded-lg ${isDark ? 'bg-amber-900/20 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
            <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                <strong>Warning:</strong> This manually overrides the calculated balance. Use only when you need to correct discrepancies.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
            }`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasChanged}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="size-4" />
            {isSubmitting ? 'Updating...' : 'Update Balance'}
          </button>
        </div>
      </div>
    </div>
  );
}
