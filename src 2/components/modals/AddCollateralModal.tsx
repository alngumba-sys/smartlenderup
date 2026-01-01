import { X, Shield, AlertCircle, Upload } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner@2.0.3';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface AddCollateralModalProps {
  onClose: () => void;
  loanAmount: number;
  loanId: string;
}

export function AddCollateralModal({ onClose, loanAmount, loanId }: AddCollateralModalProps) {
  const { isDark } = useTheme();
  const { addCollateral } = useData();
  const currencyCode = getCurrencyCode();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    estimatedValue: Math.round(loanAmount * 1.2),
    documentNumber: '',
    location: '',
    make: '',
    model: '',
    yearOfManufacture: '',
    condition: 'Good',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create collateral object
    const newCollateral = {
      id: `COL${Date.now()}`,
      loanId: loanId,
      type: formData.type,
      description: formData.description,
      estimatedValue: formData.estimatedValue,
      documentNumber: formData.documentNumber || null,
      location: formData.location,
      make: formData.make || null,
      model: formData.model || null,
      yearOfManufacture: formData.yearOfManufacture || null,
      condition: formData.condition,
      verifiedBy: 'Loan Officer', // This would come from logged-in user in real app
      verificationDate: new Date().toISOString().split('T')[0],
      status: 'Verified',
      createdDate: new Date().toISOString().split('T')[0],
    };
    
    addCollateral(newCollateral);
    toast.success('Collateral added successfully');
    console.log('Adding collateral:', newCollateral);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="size-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white">Add Collateral</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Collateral Type & Value */}
            <div>
              <h4 className="text-gray-900 dark:text-white mb-3">Collateral Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Collateral Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Property">Property (Land/House)</option>
                    <option value="Vehicle">Vehicle (Car/Motorcycle)</option>
                    <option value="Equipment">Business Equipment</option>
                    <option value="Inventory">Business Inventory</option>
                    <option value="Land Title">Land Title Deed</option>
                    <option value="Household Items">Household Items</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Estimated Value ({currencyCode}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: {'>='} {Math.round(loanAmount * 1.2).toLocaleString()} (120% of loan)
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                    required
                    placeholder="Detailed description of the collateral..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Document/Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., Title Deed No, Logbook No"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                    placeholder="e.g., Nairobi, Karen"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details (for vehicles/equipment) */}
            {(formData.type === 'Vehicle' || formData.type === 'Equipment') && (
              <div>
                <h4 className="text-gray-900 mb-3">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Make/Brand</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., Toyota, Samsung"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., Vitz, Galaxy S21"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Year of Manufacture</label>
                    <input
                      type="text"
                      value={formData.yearOfManufacture}
                      onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Document Upload Section */}
            <div>
              <h4 className="text-gray-900 mb-3">Supporting Documents</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload photos and documents of the collateral
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Accepted: JPG, PNG, PDF (Max 5MB each)
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Choose Files
                </button>
              </div>
            </div>

            {/* Valuation Information */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="mb-2">
                    <strong>Valuation Required</strong>
                  </p>
                  <p>
                    A loan officer will conduct a physical verification and valuation of this collateral. 
                    The estimated value you provide should be a fair market estimate. Final loan approval 
                    will depend on the verified valuation.
                  </p>
                </div>
              </div>
            </div>

            {/* Valuation Ratio Indicator */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-900">Loan-to-Value (LTV) Ratio</span>
                <span className="text-sm text-blue-900">
                  {((loanAmount / formData.estimatedValue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (loanAmount / formData.estimatedValue) * 100 <= 80
                      ? 'bg-emerald-600'
                      : (loanAmount / formData.estimatedValue) * 100 <= 100
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}
                  style={{
                    width: `${Math.min(((loanAmount / formData.estimatedValue) * 100), 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-blue-800 mt-2">
                {(loanAmount / formData.estimatedValue) * 100 <= 80
                  ? '✓ Excellent - LTV below 80%'
                  : (loanAmount / formData.estimatedValue) * 100 <= 100
                  ? '⚠ Acceptable - LTV between 80-100%'
                  : '✗ High Risk - LTV above 100%'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
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
                Add Collateral
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}