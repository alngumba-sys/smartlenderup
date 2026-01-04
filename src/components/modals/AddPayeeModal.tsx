import { X, UserPlus, Save } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';

interface AddPayeeModalProps {
  onClose: () => void;
  defaultCategory?: 'Employee' | 'Utilities' | 'Rent' | 'Services' | 'Suppliers' | 'Other';
}

export function AddPayeeModal({ onClose, defaultCategory }: AddPayeeModalProps) {
  const { isDark } = useTheme();
  const { addPayee } = useData();
  const [formData, setFormData] = useState({
    name: '',
    type: (defaultCategory === 'Employee' ? 'Employee' : 'Vendor') as 'Vendor' | 'Supplier' | 'Service Provider' | 'Employee' | 'Contractor' | 'Other',
    category: (defaultCategory || 'Other') as 'Employee' | 'Utilities' | 'Rent' | 'Services' | 'Suppliers' | 'Other',
    phone: '',
    email: '',
    kraPin: '',
    bankName: '',
    accountNumber: '',
    mpesaNumber: '',
    physicalAddress: '',
    contactPerson: '',
    notes: ''
  });

  const types = ['Vendor', 'Supplier', 'Service Provider', 'Employee', 'Contractor', 'Other'];

  const categories = ['Employee', 'Utilities', 'Rent', 'Services', 'Suppliers', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Supabase connection FIRST
    const isConnected = await ensureSupabaseConnection('add payee');
    if (!isConnected) {
      return; // Block the operation if offline
    }
    
    // Create new payee with all required fields
    const newPayee = {
      ...formData,
      status: 'Active' as const,
      totalPaid: 0
    };
    
    addPayee(newPayee);
    toast.success('Payee added successfully!');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserPlus className="size-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white">Add New Payee / Vendor</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-6">
              <h4 className="text-gray-900 dark:text-white mb-3 text-sm">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Payee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                    placeholder="e.g., Kenya Power & Lighting Co."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                  >
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

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
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="text-gray-900 dark:text-white mb-3 text-sm">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    required
                    placeholder="e.g., 0712345678"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., info@example.co.ke"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., John Kamau"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    name="physicalAddress"
                    value={formData.physicalAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., Westlands, Nairobi"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="mb-6">
              <h4 className="text-gray-900 dark:text-white mb-3 text-sm">Financial Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    KRA PIN
                  </label>
                  <input
                    type="text"
                    name="kraPin"
                    value={formData.kraPin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., P051234567M"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    M-Pesa Number
                  </label>
                  <input
                    type="tel"
                    name="mpesaNumber"
                    value={formData.mpesaNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., 0712345678"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., KCB Bank"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    placeholder="e.g., 1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                rows={2}
                placeholder="Additional information about this payee"
              />
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="size-4" />
                Add Payee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}