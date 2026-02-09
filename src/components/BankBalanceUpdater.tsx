import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Building2, DollarSign, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function BankBalanceUpdater() {
  const { isDark } = useTheme();
  const { bankAccounts, updateBankAccount } = useData();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [newBalance, setNewBalance] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-select first account
  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(bankAccounts[0].id);
      setNewBalance(bankAccounts[0].balance.toString());
    }
  }, [bankAccounts, selectedAccountId]);

  // Update balance when account changes
  useEffect(() => {
    const account = bankAccounts.find(a => a.id === selectedAccountId);
    if (account) {
      setNewBalance(account.balance.toString());
    }
  }, [selectedAccountId, bankAccounts]);

  const selectedAccount = bankAccounts.find(a => a.id === selectedAccountId);

  const handleUpdateBalance = async () => {
    if (!selectedAccount) {
      toast.error('Please select a bank account');
      return;
    }

    const balance = parseFloat(newBalance.replace(/,/g, ''));
    if (isNaN(balance)) {
      toast.error('Please enter a valid number');
      return;
    }

    setIsUpdating(true);
    try {
      await updateBankAccount(selectedAccount.id, {
        balance,
        lastUpdated: new Date().toISOString()
      });
      toast.success(`Balance updated to ${balance.toLocaleString()} ${selectedAccount.currency}`);
    } catch (error) {
      toast.error('Failed to update balance');
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <Building2 className="size-6 text-blue-600" />
            </div>
            <div>
              <h2 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Bank Balance</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manually adjust bank account balance
              </p>
            </div>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className={`size-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No bank accounts found. Please create a bank account first.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Selection */}
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Bank Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.bankName} ({account.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAccount && (
                <>
                  {/* Current Balance Display */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Current Balance:
                      </span>
                      <span className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAccount.currency} {selectedAccount.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>

                  {/* New Balance Input */}
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      New Balance
                    </label>
                    <div className="relative">
                      <DollarSign className={`size-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={newBalance}
                        onChange={(e) => handleBalanceChange(e.target.value)}
                        placeholder="Enter new balance"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedAccount.currency}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {newBalance && parseFloat(newBalance.replace(/,/g, '')) !== selectedAccount.balance && (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      parseFloat(newBalance.replace(/,/g, '')) > selectedAccount.balance
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    }`}>
                      <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Balance will change by:
                      </p>
                      <p className={`text-lg ${
                        parseFloat(newBalance.replace(/,/g, '')) > selectedAccount.balance
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {parseFloat(newBalance.replace(/,/g, '')) > selectedAccount.balance ? '+' : ''}
                        {(parseFloat(newBalance.replace(/,/g, '')) - selectedAccount.balance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {selectedAccount.currency}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateBalance}
                      disabled={isUpdating || !newBalance || parseFloat(newBalance.replace(/,/g, '')) === selectedAccount.balance}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="size-4" />
                          Update Balance
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setNewBalance(selectedAccount.balance.toString())}
                      className={`px-4 py-2.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Reset
                    </button>
                  </div>

                  {/* Warning */}
                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      ⚠️ <strong>Warning:</strong> This manually overrides the calculated balance. The system normally calculates balance from opening balance + deposits - disbursements.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
