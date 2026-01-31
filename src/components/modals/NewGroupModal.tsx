import { useState } from 'react';
import { X, Users, MapPin, Calendar, Phone } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupData: any) => void;
}

export function NewGroupModal({ isOpen, onClose, onSubmit }: NewGroupModalProps) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    groupName: '',
    groupType: 'Savings & Credit',
    registrationNumber: '',
    chairperson: '',
    chairpersonPhone: '',
    treasurer: '',
    treasurerPhone: '',
    location: '',
    county: 'Nairobi',
    meetingDay: 'Monday',
    meetingFrequency: 'Weekly',
    formationDate: new Date().toISOString().split('T')[0],
    membershipFee: '500',
    minContribution: '1000'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[rgb(208,239,255)] dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-white font-bold">Register New Group (Chama)</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Create a new savings and lending group</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
            <X className="size-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Group Information */}
            <div className="col-span-3">
              <h3 className="text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                Group Information
              </h3>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Group Name *</label>
              <input
                type="text"
                required
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="e.g., Umoja Women's Chama"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Group Type *</label>
              <select
                required
                value={formData.groupType}
                onChange={(e) => setFormData({ ...formData, groupType: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="Savings & Credit">Savings & Credit</option>
                <option value="Table Banking">Table Banking</option>
                <option value="Investment Group">Investment Group</option>
                <option value="VSLA">Village Savings & Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Optional"
              />
            </div>

            {/* Leadership */}
            <div className="col-span-3 mt-2">
              <h3 className="text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <Phone className="size-4 text-emerald-600 dark:text-emerald-400" />
                Leadership Details
              </h3>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Chairperson Name *</label>
              <input
                type="text"
                required
                value={formData.chairperson}
                onChange={(e) => setFormData({ ...formData, chairperson: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Chairperson Phone *</label>
              <input
                type="tel"
                required
                value={formData.chairpersonPhone}
                onChange={(e) => setFormData({ ...formData, chairpersonPhone: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="+254 712 345 678"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Formation Date *</label>
              <input
                type="date"
                required
                value={formData.formationDate}
                onChange={(e) => setFormData({ ...formData, formationDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Treasurer Name *</label>
              <input
                type="text"
                required
                value={formData.treasurer}
                onChange={(e) => setFormData({ ...formData, treasurer: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Treasurer Phone *</label>
              <input
                type="tel"
                required
                value={formData.treasurerPhone}
                onChange={(e) => setFormData({ ...formData, treasurerPhone: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="+254 712 345 678"
              />
            </div>
            <div className="col-span-1"></div>

            {/* Location & Meetings */}
            <div className="col-span-3 mt-2">
              <h3 className="text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
                Location & Meeting Schedule
              </h3>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">County *</label>
              <select
                required
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="Nairobi">Nairobi</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Specific Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="e.g., Kibera, Langata"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Meeting Day *</label>
              <select
                required
                value={formData.meetingDay}
                onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Meeting Frequency *</label>
              <select
                required
                value={formData.meetingFrequency}
                onChange={(e) => setFormData({ ...formData, meetingFrequency: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Membership Fee (KES) *</label>
              <input
                type="number"
                required
                value={formData.membershipFee}
                onChange={(e) => setFormData({ ...formData, membershipFee: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Min. Contribution (KES) *</label>
              <input
                type="number"
                required
                value={formData.minContribution}
                onChange={(e) => setFormData({ ...formData, minContribution: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
            >
              <Users className="size-4" />
              Register Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}