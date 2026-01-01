import { useState } from 'react';
import { X, User, Building2, Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/numberFormat';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: any) => void;
}

export function NewClientModal({ isOpen, onClose, onSubmit }: NewClientModalProps) {
  const { isDark } = useTheme();
  const [clientType, setClientType] = useState<'individual' | 'business'>('individual');
  const [clientPicture, setClientPicture] = useState<string | null>(null);
  
  // Get active country currency
  const currencyCode = getCurrencyCode();
  
  const [formData, setFormData] = useState({
    // Individual fields
    firstName: '',
    lastName: '',
    idNumber: '',
    gender: 'Female',
    dateOfBirth: '',
    maritalStatus: 'Single',
    
    // Business fields
    businessName: '',
    registrationNumber: '',
    businessType: 'Retail',
    
    // Common fields
    phone: '',
    email: '',
    address: '',
    county: 'Nairobi',
    town: '',
    occupation: '',
    monthlyIncome: '',
  });

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      clientType,
      clientPicture
    });
    onClose();
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      idNumber: '',
      gender: 'Female',
      dateOfBirth: '',
      maritalStatus: 'Single',
      businessName: '',
      registrationNumber: '',
      businessType: 'Retail',
      phone: '',
      email: '',
      address: '',
      county: 'Nairobi',
      town: '',
      occupation: '',
      monthlyIncome: '',
    });
    setClientPicture(null);
    setClientType('individual');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-0 sm:p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-lg w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[rgb(208,239,255)] dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-gray-900 dark:text-white text-base sm:text-lg">Add New Borrower</h2>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Create individual or business borrower account</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
            <X className="size-5 sm:size-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Borrower Type Selector */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-3">Borrower Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClientType('individual')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  clientType === 'individual'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                }`}
              >
                <User className={`size-6 ${clientType === 'individual' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-medium ${clientType === 'individual' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Individual
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Personal borrower</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setClientType('business')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  clientType === 'business'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <Building2 className={`size-6 ${clientType === 'business' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-medium ${clientType === 'business' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Business
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Company/Enterprise</div>
                </div>
              </button>
            </div>
          </div>

          {/* Client Picture Upload */}
          <div className="mb-6 flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {clientPicture ? (
                  <img 
                    src={clientPicture} 
                    alt="Borrower" 
                    className="size-24 rounded-full object-cover border-4 border-emerald-500 dark:border-emerald-600"
                  />
                ) : (
                  <div className="size-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    {clientType === 'individual' ? (
                      <User className="size-12 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <Building2 className="size-12 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                )}
                <label 
                  htmlFor="picture-upload" 
                  className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full cursor-pointer shadow-lg"
                >
                  <Camera className="size-4" />
                  <input
                    id="picture-upload"
                    type="file"
                    accept="image/*"
                    multiple={clientType === 'business'}
                    onChange={handlePictureUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {clientType === 'individual' ? 'Upload Photo' : 'Company Documents'}
              </p>
            </div>
          </div>

          {/* Individual Form */}
          {clientType === 'individual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">National ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Town</label>
                <input
                  type="text"
                  value={formData.town}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Town name"
                />
              </div>
            </div>
          )}

          {/* Business Form */}
          {clientType === 'business' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Corporation Ltd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CPR/2024/12345"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Business Type *</label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Services</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Technology">Technology</option>
                    <option value="Construction">Construction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                {clientType === 'individual' ? 'Occupation' : 'Industry *'}
              </label>
              <input
                type="text"
                required={clientType === 'business'}
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={clientType === 'individual' ? 'Teacher' : 'Retail'}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Address {clientType === 'business' ? '*' : ''}
              </label>
              <input
                type="text"
                required={clientType === 'business'}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Street address, building, etc."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Monthly {clientType === 'individual' ? 'Income' : 'Revenue'} ({currencyCode})
              </label>
              <input
                type="text"
                value={formatNumberWithCommas(formData.monthlyIncome)}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFormattedNumber(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2.5 text-white rounded-lg ${
                clientType === 'individual'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Add {clientType === 'individual' ? 'Individual' : 'Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}