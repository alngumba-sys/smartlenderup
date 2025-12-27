import { Package, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface LoanProductModalProps {
  onClose: () => void;
  product?: any;
}

export function LoanProductModal({ onClose, product }: LoanProductModalProps) {
  const { isDark } = useTheme();
  const currencyCode = getCurrencyCode();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    minAmount: product?.minAmount || 5000,
    maxAmount: product?.maxAmount || 100000,
    interestRate: product?.interestRate || 12,
    interestType: product?.interestType || 'Reducing Balance - Equal Installments',
    repaymentCycle: product?.repaymentCycle || 'Monthly',
    minTenor: product?.minTenor || 3,
    maxTenor: product?.maxTenor || 12,
    gracePeriodDays: product?.gracePeriodDays || 0,
    latePenaltyRate: product?.latePenaltyRate || 2,
    latePenaltyType: product?.latePenaltyType || 'Percentage',
    processingFeeRate: product?.processingFeeRate || 2,
    insuranceFeeRate: product?.insuranceFeeRate || 1,
    loanNumberFormat: product?.loanNumberFormat || 'ABC-L{00000}',
    requiresCollateral: product?.requiresCollateral || false,
    requiresGuarantor: product?.requiresGuarantor || false,
    minGuarantors: product?.minGuarantors || 0,
    isActive: product?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would save to backend
    console.log('Saving loan product:', formData);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="size-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white">
                {product ? 'Edit' : 'Create New'} Loan Product
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h4 className="text-gray-900 dark:text-white mb-3">Basic Information</h4>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                  placeholder="e.g., ABC Business Loan"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Loan Number Format <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.loanNumberFormat}
                  onChange={(e) => setFormData({ ...formData, loanNumberFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  placeholder="ABC-L{00000}"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use {'{00000}'} for auto-numbering
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  rows={2}
                  placeholder="Describe the loan product..."
                />
              </div>

              {/* Loan Amount */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-gray-900 dark:text-white mb-3">Loan Amount Range</h4>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Minimum Amount ({currencyCode}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Maximum Amount ({currencyCode}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                  min="0"
                />
              </div>

              {/* Interest Configuration */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-gray-900 dark:text-white mb-3">Interest Configuration</h4>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Interest Rate (% p.a.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Interest Calculation Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                >
                  <option value="Flat">Flat Interest</option>
                  <option value="Reducing Balance - Equal Installments">Reducing Balance - Equal Installments</option>
                  <option value="Reducing Balance - Equal Principal">Reducing Balance - Equal Principal</option>
                  <option value="Interest-Only">Interest-Only</option>
                  <option value="Compound Interest">Compound Interest</option>
                </select>
              </div>

              {/* Repayment Terms */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-gray-900 dark:text-white mb-3">Repayment Terms</h4>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Repayment Cycle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.repaymentCycle}
                  onChange={(e) => setFormData({ ...formData, repaymentCycle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Semi-Annually">Semi-Annually</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  value={formData.gracePeriodDays}
                  onChange={(e) => setFormData({ ...formData, gracePeriodDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Minimum Tenor (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.minTenor}
                  onChange={(e) => setFormData({ ...formData, minTenor: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Maximum Tenor (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxTenor}
                  onChange={(e) => setFormData({ ...formData, maxTenor: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  required
                  min="1"
                />
              </div>

              {/* Fees and Penalties */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-gray-900 dark:text-white mb-3">Fees & Penalties</h4>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Processing Fee (%)
                </label>
                <input
                  type="number"
                  value={formData.processingFeeRate}
                  onChange={(e) => setFormData({ ...formData, processingFeeRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Insurance Fee (%)
                </label>
                <input
                  type="number"
                  value={formData.insuranceFeeRate}
                  onChange={(e) => setFormData({ ...formData, insuranceFeeRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Late Penalty Type
                </label>
                <select
                  value={formData.latePenaltyType}
                  onChange={(e) => setFormData({ ...formData, latePenaltyType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                >
                  <option value="Percentage">Percentage of Overdue Amount</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Late Penalty Rate ({formData.latePenaltyType === 'Percentage' ? '%' : currencyCode})
                </label>
                <input
                  type="number"
                  value={formData.latePenaltyRate}
                  onChange={(e) => setFormData({ ...formData, latePenaltyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Requirements */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-gray-900 dark:text-white mb-3">Loan Requirements</h4>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresCollateral"
                  checked={formData.requiresCollateral}
                  onChange={(e) => setFormData({ ...formData, requiresCollateral: e.target.checked })}
                  className="size-4"
                />
                <label htmlFor="requiresCollateral" className="text-gray-700 dark:text-gray-300 text-sm">
                  Requires Collateral
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresGuarantor"
                  checked={formData.requiresGuarantor}
                  onChange={(e) => setFormData({ ...formData, requiresGuarantor: e.target.checked })}
                  className="size-4"
                />
                <label htmlFor="requiresGuarantor" className="text-gray-700 dark:text-gray-300 text-sm">
                  Requires Guarantor(s)
                </label>
              </div>

              {formData.requiresGuarantor && (
                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Minimum Number of Guarantors <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minGuarantors}
                    onChange={(e) => setFormData({ ...formData, minGuarantors: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    min="1"
                    max="5"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="size-4"
                />
                <label htmlFor="isActive" className="text-gray-700 dark:text-gray-300 text-sm">
                  Product is Active (available for new loans)
                </label>
              </div>
            </div>

            {/* Information Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex gap-3">
              <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="mb-1">
                  <strong>Note:</strong> Changes to existing loan products will only apply to new loans. 
                  Existing loans will retain their original terms.
                </p>
                <p>
                  All fields marked with <span className="text-red-500">*</span> are required.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}