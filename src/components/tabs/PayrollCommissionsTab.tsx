import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calculator, Save, Edit2, FileText, UserPlus, Settings, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { AddPayeeModal } from '../modals/AddPayeeModal';
import { StaffAssignmentsModal } from '../modals/StaffAssignmentsModal';

export function PayrollCommissionsTab() {
  const { loans, payees, updatePayee, deletePayee, clients } = useData();
  const currencyCode = getCurrencyCode();
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaffForAssignment, setSelectedStaffForAssignment] = useState<string | null>(null);

  // Get employee payees (staff members)
  const staff = payees.filter(p => (p.type === 'Employee' || p.category === 'Employee') && p.status === 'Active');

  // Group loans by staff member
  const loansByStaff = staff.map(staffMember => {
    // Get loans for this staff member:
    // 1. Loans directly assigned to them
    // 2. Loans from clients assigned to them
    const staffLoans = loans.filter(loan => {
      // Only count disbursed/active/closed loans
      const validStatus = loan.status === 'Disbursed' || loan.status === 'Active' || loan.status === 'Fully Paid' || loan.status === 'Closed';
      if (!validStatus) return false;
      
      // Check direct loan assignment
      if (loan.staffMemberId === staffMember.id) return true;
      
      // Check if loan belongs to a client assigned to this staff member
      const loanClientId = loan.clientUuid || loan.clientId;
      if (loanClientId) {
        const client = clients.find(c => c.id === loanClientId);
        if (client && client.staffMemberId === staffMember.id) return true;
      }
      
      return false;
    });
    
    // Calculate total principal and facilitation fees from actual loan data
    const totalPrincipal = staffLoans.reduce((sum, l) => sum + l.principalAmount, 0);
    const totalFacilitationFees = staffLoans.reduce((sum, l) => {
      // Use the facilitation fee stored in the loan (processingFee or facilitationFee)
      const fee = l.facilitationFee || l.processingFee || 0;
      return sum + fee;
    }, 0);

    // Get commission rate from staff profile (default to 10% if not set)
    const commissionRate = (staffMember as any).commissionRate || 10;
    
    // Calculate commission amount (percentage of facilitation fees)
    const commissionAmount = (totalFacilitationFees * commissionRate) / 100;

    return {
      staffMember,
      loansCount: staffLoans.length,
      loans: staffLoans,
      totalPrincipal,
      totalFacilitationFees,
      commissionRate,
      commissionAmount
    };
  });

  // Show ALL staff, not just those with loans
  const allStaffData = loansByStaff;

  const handleSaveRate = async (staffId: string) => {
    const rate = parseFloat(tempRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Please enter a valid percentage (0-100)');
      return;
    }

    try {
      // Update staff commission rate in Supabase
      const { error } = await supabase
        .from('payees')
        .update({ commission_rate: rate })
        .eq('id', staffId);

      if (error) {
        console.error('Error updating commission rate:', error);
        toast.error('Failed to update commission rate');
        return;
      }

      // Update local state
      const staffIndex = payees.findIndex(p => p.id === staffId);
      if (staffIndex !== -1) {
        const updatedStaff = { ...payees[staffIndex], commissionRate: rate };
        updatePayee(staffId, { commissionRate: rate } as any);
      }

      setEditingStaff(null);
      setTempRate('');
      toast.success('Commission rate updated successfully');
    } catch (error) {
      console.error('Error saving commission rate:', error);
      toast.error('Failed to save commission rate');
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${staffName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      // Delete staff member from Supabase
      const { error } = await supabase
        .from('payees')
        .delete()
        .eq('id', staffId);

      if (error) {
        console.error('Error deleting staff member:', error);
        toast.error('Failed to delete staff member');
        return;
      }

      // Update local state
      deletePayee(staffId);
      toast.success('Staff member deleted successfully');
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast.error('Failed to delete staff member');
    }
  };

  // Calculate totals only for staff with loans
  const staffWithDeals = allStaffData.filter(s => s.loansCount > 0);
  const totalCommissions = staffWithDeals.reduce((sum, s) => sum + s.commissionAmount, 0);
  const totalDeals = staffWithDeals.reduce((sum, s) => sum + s.loansCount, 0);
  const totalPrincipal = staffWithDeals.reduce((sum, s) => sum + s.totalPrincipal, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Add Staff Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Staff Commissions</h2>
          <p className="text-gray-600">Track and manage sales commissions based on loan facilitation fees</p>
        </div>
        <button
          onClick={() => setShowAddStaffModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <UserPlus className="size-4" />
          Add Staff Member
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Staff</p>
              <p className="text-gray-900 text-2xl font-semibold">{staffWithDeals.length}</p>
            </div>
            <Users className="size-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Deals</p>
              <p className="text-gray-900 text-2xl font-semibold">{totalDeals}</p>
            </div>
            <TrendingUp className="size-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Principal</p>
              <p className="text-gray-900 text-2xl font-semibold">
                {currencyCode} {totalPrincipal > 0 ? `${(totalPrincipal / 1000).toFixed(0)}K` : '0'}
              </p>
            </div>
            <Calculator className="size-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-900 text-sm font-medium">Total Commissions</p>
              <p className="text-emerald-900 text-2xl font-bold">
                {currencyCode} {totalCommissions > 0 ? totalCommissions.toLocaleString() : '0'}
              </p>
            </div>
            <DollarSign className="size-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FileText className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Commission Calculation</p>
            <p className="text-sm text-blue-800">
              Commissions are calculated as a percentage of the facilitation fees specified when each loan was created. 
              You can set individual commission rates for each staff member below.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Commissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deals Closed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facilitation Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Owed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allStaffData.map((staffData) => (
                <tr key={staffData.staffMember.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-semibold">
                          {staffData.staffMember.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{staffData.staffMember.name}</p>
                        <p className="text-xs text-gray-500">{staffData.staffMember.email || staffData.staffMember.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {staffData.loansCount > 0 ? (
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {staffData.loansCount} {staffData.loansCount === 1 ? 'Deal' : 'Deals'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">0 Deals</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staffData.totalPrincipal > 0 
                      ? `${currencyCode} ${staffData.totalPrincipal.toLocaleString()}`
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staffData.totalFacilitationFees > 0
                      ? `${currencyCode} ${staffData.totalFacilitationFees.toLocaleString()}`
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingStaff === staffData.staffMember.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tempRate}
                          onChange={(e) => setTempRate(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="10"
                          min="0"
                          max="100"
                          step="0.5"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRate(staffData.staffMember.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          <Save className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStaff(null);
                            setTempRate('');
                          }}
                          className="p-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{staffData.commissionRate}%</span>
                        <button
                          onClick={() => {
                            setEditingStaff(staffData.staffMember.id);
                            setTempRate(staffData.commissionRate.toString());
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit commission rate"
                        >
                          <Edit2 className="size-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {staffData.commissionAmount > 0 ? (
                      <span className="text-sm font-bold text-emerald-600">
                        {currencyCode} {staffData.commissionAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedStaffForAssignment(staffData.staffMember.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Assign loans to this staff member"
                    >
                      <Settings className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staffData.staffMember.id, staffData.staffMember.name)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Delete staff member"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {staffWithDeals.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-bold text-gray-900">
                    Total Commissions Payable:
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-emerald-600">
                      {currencyCode} {totalCommissions.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {allStaffData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <DollarSign className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No staff members found</p>
          <p className="text-sm text-gray-500 mt-1">Add staff members in Settings to track their commissions</p>
        </div>
      )}

      {allStaffData.length > 0 && staffWithDeals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <DollarSign className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No staff members have closed deals yet</p>
          <p className="text-sm text-gray-500 mt-1">Assign staff members to loans to track commissions</p>
        </div>
      )}

      {/* Add Staff Modal */}
      <AddPayeeModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        type="Employee"
      />

      {/* Staff Assignments Modal */}
      <StaffAssignmentsModal
        isOpen={selectedStaffForAssignment !== null}
        onClose={() => setSelectedStaffForAssignment(null)}
        staffId={selectedStaffForAssignment}
      />
    </div>
  );
}