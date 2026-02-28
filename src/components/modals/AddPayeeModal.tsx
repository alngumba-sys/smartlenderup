import { X, UserPlus, Save } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';

interface AddPayeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'Employee' | 'Vendor';
  defaultCategory?: 'Employee' | 'Utilities' | 'Rent' | 'Services' | 'Suppliers' | 'Other';
}

export function AddPayeeModal({ isOpen, onClose, type, defaultCategory }: AddPayeeModalProps) {
  const { isDark } = useTheme();
  const { addPayee } = useData();
  const [formData, setFormData] = useState({
    name: '',
    type: (type || (defaultCategory === 'Employee' ? 'Employee' : 'Vendor')) as 'Vendor' | 'Supplier' | 'Service Provider' | 'Employee' | 'Contractor' | 'Other',
    category: (type === 'Employee' ? 'Employee' : (defaultCategory || 'Other')) as 'Employee' | 'Utilities' | 'Rent' | 'Services' | 'Suppliers' | 'Other',
    phone: '',
    email: '',
    kraPin: '',
    bankName: '',
    accountNumber: '',
    mpesaNumber: '',
    physicalAddress: '',
    contactPerson: '',
    notes: '',
    commissionRate: '10' // Default 10% commission for employees
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
      // Auto-set category based on type for employees
      category: formData.type === 'Employee' ? 'Employee' : formData.category,
      status: 'Active' as const,
      totalPaid: 0,
      commissionRate: formData.type === 'Employee'
        ? parseFloat(formData.commissionRate) 
        : undefined
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

  if (!isOpen) return null;

  const isEmployee = formData.type === 'Employee' || formData.category === 'Employee';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <UserPlus className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {isEmployee ? 'Add New Staff Member' : 'Add New Payee / Vendor'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isEmployee ? 'Complete the form below to add a staff member' : 'Enter payee details for payment tracking'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-emerald-600 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-800">Basic Information</h4>
              </div>
              <div className="space-y-3">
                {isEmployee ? (
                  // For employees: Name, Type, and Commission on same row (remove Category)
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Staff Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        required
                        placeholder="e.g., Albert Kiguta"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        required
                      >
                        {types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Commission (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="commissionRate"
                        value={formData.commissionRate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm font-semibold border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="10"
                        min="0"
                        max="100"
                        step="0.5"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  // For vendors/suppliers: Keep original layout
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Payee Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        required
                        placeholder="e.g., Kenya Power & Lighting Co."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          required
                        >
                          {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select category...</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-800">Contact Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="e.g., 0712345678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., info@example.co.ke"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., John Kamau"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    name="physicalAddress"
                    value={formData.physicalAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Westlands, Nairobi"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-800">Financial Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    KRA PIN
                  </label>
                  <input
                    type="text"
                    name="kraPin"
                    value={formData.kraPin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., P051234567M"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    M-Pesa Number
                  </label>
                  <input
                    type="tel"
                    name="mpesaNumber"
                    value={formData.mpesaNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 0712345678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., KCB Bank"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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