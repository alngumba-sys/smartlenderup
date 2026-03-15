import { X, UserCircle, Briefcase, Plus, Trash2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface StaffAssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string | null;
}

export function StaffAssignmentsModal({ isOpen, onClose, staffId }: StaffAssignmentsModalProps) {
  const { loans, clients, payees, updateLoan, updateClient } = useData();
  const currencyCode = getCurrencyCode();
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [availableLoans, setAvailableLoans] = useState<any[]>([]);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'clients' | 'loans'>('clients');

  const staff = payees.find(p => p.id === staffId);

  useEffect(() => {
    if (!staffId) return;

    // Get clients assigned to this staff member
    const assignedClients = clients.filter(client => client.staffMemberId === staffId);
    setSelectedClients(assignedClients.map(c => c.id));

    // Get all unassigned or assigned-to-this-staff clients
    const availClients = clients.filter(client => 
      !client.staffMemberId || client.staffMemberId === staffId
    );
    setAvailableClients(availClients);

    // Get loans assigned to this staff member
    const assignedLoans = loans.filter(loan => loan.staffMemberId === staffId);
    setSelectedLoans(assignedLoans.map(l => l.id));

    // Get all unassigned or assigned-to-this-staff loans
    const available = loans.filter(loan => 
      !loan.staffMemberId || loan.staffMemberId === staffId
    );
    setAvailableLoans(available);
  }, [staffId, loans, clients]);

  const handleToggleLoan = async (loanId: string) => {
    const isCurrentlyAssigned = selectedLoans.includes(loanId);
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('loans')
        .update({ 
          staff_member_id: isCurrentlyAssigned ? null : staffId 
        })
        .eq('loan_number', loanId);

      if (error) {
        console.error('Error updating loan assignment:', error);
        toast.error('Failed to update assignment');
        return;
      }

      // Update local state
      if (isCurrentlyAssigned) {
        setSelectedLoans(prev => prev.filter(id => id !== loanId));
        updateLoan(loanId, { staffMemberId: undefined });
        toast.success('Loan unassigned');
      } else {
        setSelectedLoans(prev => [...prev, loanId]);
        updateLoan(loanId, { staffMemberId: staffId! });
        toast.success('Loan assigned successfully');
      }
    } catch (error) {
      console.error('Error updating loan assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleBulkAssign = async () => {
    // Assign all available loans to this staff member
    const loansToAssign = availableLoans.filter(l => !selectedLoans.includes(l.id));
    
    try {
      for (const loan of loansToAssign) {
        await supabase
          .from('loans')
          .update({ staff_member_id: staffId })
          .eq('loan_number', loan.id);
        
        updateLoan(loan.id, { staffMemberId: staffId! });
      }

      setSelectedLoans(availableLoans.map(l => l.id));
      toast.success(`Assigned ${loansToAssign.length} loans successfully`);
    } catch (error) {
      console.error('Error bulk assigning loans:', error);
      toast.error('Failed to bulk assign loans');
    }
  };

  const handleToggleClient = async (clientId: string) => {
    const isCurrentlyAssigned = selectedClients.includes(clientId);
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('clients')
        .update({ 
          staff_member_id: isCurrentlyAssigned ? null : staffId 
        })
        .eq('id', clientId);

      if (error) {
        console.error('Error updating client assignment:', error);
        toast.error('Failed to update assignment');
        return;
      }

      // Update local state
      if (isCurrentlyAssigned) {
        setSelectedClients(prev => prev.filter(id => id !== clientId));
        updateClient(clientId, { staffMemberId: undefined });
        toast.success('Client unassigned');
      } else {
        setSelectedClients(prev => [...prev, clientId]);
        updateClient(clientId, { staffMemberId: staffId! });
        toast.success('Client assigned successfully');
      }
    } catch (error) {
      console.error('Error updating client assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleBulkAssignClients = async () => {
    // Assign all available clients to this staff member
    const clientsToAssign = availableClients.filter(c => !selectedClients.includes(c.id));
    
    try {
      for (const client of clientsToAssign) {
        await supabase
          .from('clients')
          .update({ staff_member_id: staffId })
          .eq('id', client.id);
        
        updateClient(client.id, { staffMemberId: staffId! });
      }

      setSelectedClients(availableClients.map(c => c.id));
      toast.success(`Assigned ${clientsToAssign.length} clients successfully`);
    } catch (error) {
      console.error('Error bulk assigning clients:', error);
      toast.error('Failed to bulk assign clients');
    }
  };

  if (!isOpen || !staff) return null;

  const assignedClientsData = availableClients.filter(c => selectedClients.includes(c.id));
  const unassignedClients = availableClients.filter(c => !selectedClients.includes(c.id));

  const assignedLoans = availableLoans.filter(l => selectedLoans.includes(l.id));
  const unassignedLoans = availableLoans.filter(l => !selectedLoans.includes(l.id));

  // Calculate total loans including:
  // 1. Loans directly assigned to this staff member
  // 2. Loans from clients assigned to this staff member
  const allStaffLoans = loans.filter(loan => {
    // Direct loan assignment
    if (loan.staffMemberId === staffId) return true;
    
    // Loan from assigned client (check both clientId and clientUuid)
    const loanClientId = loan.clientUuid || loan.clientId;
    if (loanClientId && selectedClients.includes(loanClientId)) return true;
    
    return false;
  });

  const totalPrincipal = allStaffLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalFacilitationFees = totalPrincipal * 0.015;
  const commissionRate = (staff as any).commissionRate || 10;
  const commissionAmount = (totalFacilitationFees * commissionRate) / 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-lg">
                  {staff.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">{staff.name}</h3>
                <p className="text-sm text-gray-600">Manage Loan Assignments</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Assigned Loans</p>
              <p className="text-2xl font-bold text-emerald-600">{assignedLoans.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Principal</p>
              <p className="text-2xl font-bold text-gray-900">
                {currencyCode} {totalPrincipal.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Commission Earned</p>
              <p className="text-2xl font-bold text-blue-600">
                {currencyCode} {commissionAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="mb-4">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 ${activeTab === 'clients' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'} rounded-lg mr-2`}
            >
              <Users className="size-4 inline-block mr-1" />
              Clients
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-4 py-2 ${activeTab === 'loans' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'} rounded-lg`}
            >
              <Briefcase className="size-4 inline-block mr-1" />
              Loans
            </button>
          </div>

          {/* Bulk Actions */}
          {activeTab === 'clients' && unassignedClients.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div>
                <p className="text-sm font-medium text-blue-900">Bulk Actions</p>
                <p className="text-sm text-blue-700">Assign all {unassignedClients.length} unassigned clients to this staff member</p>
              </div>
              <button
                onClick={handleBulkAssignClients}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="size-4" />
                Assign All
              </button>
            </div>
          )}
          {activeTab === 'loans' && unassignedLoans.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div>
                <p className="text-sm font-medium text-blue-900">Bulk Actions</p>
                <p className="text-sm text-blue-700">Assign all {unassignedLoans.length} unassigned loans to this staff member</p>
              </div>
              <button
                onClick={handleBulkAssign}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="size-4" />
                Assign All
              </button>
            </div>
          )}

          {/* Assigned Loans */}
          {activeTab === 'loans' && assignedLoans.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Loans ({assignedLoans.length})</h4>
              <div className="space-y-2">
                {assignedLoans.map(loan => {
                  const client = clients.find(c => c.id === (loan.clientUuid || loan.clientId));
                  const clientName = client 
                    ? (client.groupName || `${client.firstName} ${client.lastName}`.trim())
                    : 'Unknown Client';
                  return (
                    <div 
                      key={loan.id}
                      className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="size-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {clientName} - {loan.loanNumber}
                          </p>
                          <p className="text-xs text-gray-600">
                            {currencyCode} {loan.principalAmount.toLocaleString()} • {loan.term} months • {loan.status}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleLoan(loan.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Unassign loan"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unassigned Loans */}
          {activeTab === 'loans' && unassignedLoans.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Available Loans ({unassignedLoans.length})</h4>
              <div className="space-y-2">
                {unassignedLoans.map(loan => {
                  const client = clients.find(c => c.id === (loan.clientUuid || loan.clientId));
                  const clientName = client 
                    ? (client.groupName || `${client.firstName} ${client.lastName}`.trim())
                    : 'Unknown Client';
                  return (
                    <div 
                      key={loan.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="size-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {clientName} - {loan.loanNumber}
                          </p>
                          <p className="text-xs text-gray-600">
                            {currencyCode} {loan.principalAmount.toLocaleString()} • {loan.term} months • {loan.status}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleLoan(loan.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="size-4" />
                        Assign
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assigned Clients */}
          {activeTab === 'clients' && assignedClientsData.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Clients ({assignedClientsData.length})</h4>
              <div className="space-y-2">
                {assignedClientsData.map(client => {
                  const clientName = client.groupName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown Client';
                  return (
                    <div 
                      key={client.id}
                      className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="size-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {clientName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {client.email} • {client.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleClient(client.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Unassign client"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unassigned Clients */}
          {activeTab === 'clients' && unassignedClients.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Available Clients ({unassignedClients.length})</h4>
              <div className="space-y-2">
                {unassignedClients.map(client => {
                  const clientName = client.groupName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown Client';
                  return (
                    <div 
                      key={client.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="size-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {clientName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {client.email} • {client.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleClient(client.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="size-4" />
                        Assign
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeTab === 'loans' && availableLoans.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No loans available</p>
              <p className="text-sm text-gray-500 mt-1">Create new loans to assign them to staff members</p>
            </div>
          )}
          {activeTab === 'clients' && availableClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No clients available</p>
              <p className="text-sm text-gray-500 mt-1">Create new clients to assign them to staff members</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}