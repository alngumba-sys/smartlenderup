import { X, UserCheck, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner@2.0.3';
import { getCurrencyCode } from '../../utils/currencyUtils';

interface AddGuarantorModalProps {
  onClose: () => void;
  loanAmount: number;
  loanId: string;
}

export function AddGuarantorModal({ onClose, loanAmount, loanId }: AddGuarantorModalProps) {
  const { isDark } = useTheme();
  const { addGuarantor } = useData();
  const currencyCode = getCurrencyCode();
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    relationship: '',
    employer: '',
    monthlyIncome: 0,
    guaranteedAmount: Math.round(loanAmount / 2),
    email: '',
    physicalAddress: '',
  });

  const [consentGiven, setConsentGiven] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      toast.error('Guarantor must give consent');
      return;
    }
    
    // Create guarantor object
    const newGuarantor = {
      id: `G${Date.now()}`,
      loanId: loanId,
      name: formData.name,
      nationalId: formData.nationalId,
      phone: formData.phone,
      email: formData.email || null,
      physicalAddress: formData.physicalAddress,
      relationship: formData.relationship,
      employer: formData.employer || null,
      monthlyIncome: formData.monthlyIncome,
      guaranteedAmount: formData.guaranteedAmount,
      consentGiven: true,
      consentDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0],
    };
    
    addGuarantor(newGuarantor);
    toast.success('Guarantor added successfully');
    console.log('Adding guarantor:', newGuarantor);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserCheck className="size-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white">Add Guarantor</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div>
              <h4 className="text-gray-900 dark:text-white mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    National ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                    placeholder="0712345678"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Physical Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.physicalAddress}
                    onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                    placeholder="e.g., Nairobi, Westlands"
                  />
                </div>
              </div>
            </div>

            {/* Relationship & Employment */}
            <div>
              <h4 className="text-gray-900 dark:text-white mb-3">Relationship & Employment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Relationship to Borrower <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Business Partner">Business Partner</option>
                    <option value="Relative">Relative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Employer
                  </label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., ABC Company"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Monthly Income ({currencyCode})
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    min="0"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Guaranteed Amount ({currencyCode}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.guaranteedAmount}
                    onChange={(e) => setFormData({ ...formData, guaranteedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                    min="0"
                    max={loanAmount}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {currencyCode} {loanAmount.toLocaleString()} (Loan Amount)
                  </p>
                </div>
              </div>
            </div>

            {/* Consent Section */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="mb-2">
                    <strong>Guarantor Consent Required</strong>
                  </p>
                  <p>
                    By checking the box below, the guarantor confirms that they understand their 
                    obligation to pay the guaranteed amount if the borrower defaults on the loan.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 mt-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I confirm that the guarantor has read and understood their obligations, 
                  and has given consent to guarantee this loan for {currencyCode} {formData.guaranteedAmount.toLocaleString()}.
                </label>
              </div>
            </div>

            {/* Information Note */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p>
                    <strong>Note:</strong> The guarantor will need to provide a copy of their National ID 
                    and sign the guarantee agreement form. A witness (loan officer) will also sign.
                  </p>
                </div>
              </div>
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
                Add Guarantor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}