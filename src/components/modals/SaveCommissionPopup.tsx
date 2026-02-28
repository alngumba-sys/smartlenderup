import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { getOrganizationId } from '../../utils/organizationUtils';
import { toast } from 'sonner@2.0.3';

interface SaveCommissionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  staffMember: any; // Changed from staffData to match what's passed
  staffData?: any; // The row data with all commission info
  month: string;
  position?: { x: number; y: number };
}

export function SaveCommissionPopup({ 
  isOpen, 
  onClose,
  onSuccess,
  staffMember, // This is actually the staffData object from the row
  month,
  position 
}: SaveCommissionPopupProps) {
  const { isDark } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use staffMember as the staffData
  const staffData = staffMember;

  // Generate months for 2026 (Jan to Dec)
  const monthOptions = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026',
    'May 2026', 'June 2026', 'July 2026', 'August 2026',
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const handleSave = async () => {
    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get organization_id from localStorage using utility function
      const organizationId = getOrganizationId();
      
      if (!organizationId) {
        toast.error('Organization ID not found');
        setIsSubmitting(false);
        return;
      }

      // Parse month (e.g., "February 2026")
      const [monthName, yearStr] = selectedMonth.split(' ');
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthIndex = monthNames.indexOf(monthName);
      const year = parseInt(yearStr);

      const commissionEntry = {
        organization_id: organizationId,
        staff_member_id: staffData.staffMember.id,
        month: monthIndex + 1, // 1-12
        year: year,
        deals_count: staffData.loansCount || 0,
        total_principal: staffData.totalPrincipal || 0,
        facilitation_fees: staffData.totalFacilitationFees || 0,
        commission_percentage: staffData.commissionRate || 0,
        commission_amount: staffData.commissionAmount || 0,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('commission_entries')
        .insert([commissionEntry]);

      if (error) throw error;

      toast.success(`Commission saved for ${selectedMonth}`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving commission entry:', error);
      toast.error(error.message || 'Failed to save commission entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className={`fixed z-50 w-80 rounded-lg shadow-2xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        style={{
          top: position?.y ? `${position.y}px` : '50%',
          left: position?.x ? `${position.x}px` : '50%',
          transform: position ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } flex items-center justify-between`}>
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Save Commission
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {staffData?.staffMember?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Which month? *
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              autoFocus
            >
              <option value="">Select month</option>
              {monthOptions.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || !selectedMonth}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Save className="size-3.5" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}