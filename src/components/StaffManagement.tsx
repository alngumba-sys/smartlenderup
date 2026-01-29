import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Eye, EyeOff, Key, Phone } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { StaffUser, AVAILABLE_TABS, TabPermission, StaffRole } from '../types/staff';
import { getOrganizationId } from '../utils/organizationUtils';
import { toast } from 'sonner@2.0.3';

export function StaffManagement() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    role: 'staff' as StaffRole,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<{[key: string]: {view: boolean, edit: boolean, delete: boolean}}>({});

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    setLoading(true);
    try {
      const orgId = getOrganizationId();
      if (!orgId) {
        toast.error('Organization not found');
        setLoading(false);
        return;
      }

      // Fetch staff users
      const { data: staffData, error: staffError } = await supabase
        .from('staff_users')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (staffError) throw staffError;

      // Fetch permissions for each staff
      const staffWithPermissions = await Promise.all(
        (staffData || []).map(async (staff) => {
          const { data: permissions, error: permError } = await supabase
            .from('staff_permissions')
            .select('*')
            .eq('staff_user_id', staff.id);

          if (permError) console.error('Error loading permissions:', permError);

          return {
            ...staff,
            permissions: permissions || [],
          };
        })
      );

      setStaffList(staffWithPermissions);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Database not reachable. Check your internet');
      } else {
        toast.error('Failed to load staff members');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!formData.full_name || !formData.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone number
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone_number.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      const orgId = getOrganizationId();
      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
      
      // Get created_by value - use email, name, or a default value
      const createdBy = currentUser.email || currentUser.full_name || currentUser.organization_name || 'Admin';
      
      // Get last 4 digits of phone number for default password
      const last4Digits = formData.phone_number.slice(-4);
      
      // Create staff user
      const { data: newStaff, error: staffError } = await supabase
        .from('staff_users')
        .insert({
          organization_id: orgId,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          email: formData.email || null,
          password_hash: last4Digits, // Default password is last 4 digits
          role: formData.role,
          is_first_login: true,
          is_active: true,
          created_by: createdBy,
        })
        .select()
        .single();

      if (staffError) throw staffError;

      // Create permissions
      const permissionsToInsert = Object.entries(selectedPermissions)
        .filter(([_, perms]) => perms.view) // Only insert if view is enabled
        .map(([tabKey, perms]) => ({
          staff_user_id: newStaff.id,
          tab_name: tabKey,
          can_view: perms.view,
          can_edit: perms.edit,
          can_delete: perms.delete,
        }));

      if (permissionsToInsert.length > 0) {
        const { error: permError } = await supabase
          .from('staff_permissions')
          .insert(permissionsToInsert);

        if (permError) throw permError;
      }

      toast.success(`Staff member created! Default password: ${last4Digits}`);
      setShowCreateModal(false);
      resetForm();
      loadStaffMembers();
    } catch (error: any) {
      console.error('Error creating staff:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Database not reachable. Check your internet');
      } else {
        toast.error('Failed to create staff member');
      }
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedStaff) return;

    try {
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('staff_permissions')
        .delete()
        .eq('staff_user_id', selectedStaff.id);

      if (deleteError) throw deleteError;

      // Insert new permissions
      const permissionsToInsert = Object.entries(selectedPermissions)
        .filter(([_, perms]) => perms.view)
        .map(([tabKey, perms]) => ({
          staff_user_id: selectedStaff.id,
          tab_name: tabKey,
          can_view: perms.view,
          can_edit: perms.edit,
          can_delete: perms.delete,
        }));

      if (permissionsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('staff_permissions')
          .insert(permissionsToInsert);

        if (insertError) throw insertError;
      }

      toast.success('Permissions updated successfully');
      setShowEditModal(false);
      setSelectedStaff(null);
      loadStaffMembers();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Database not reachable. Check your internet');
      } else {
        toast.error('Failed to update permissions');
      }
    }
  };

  const handleDeactivateStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return;

    try {
      const { error } = await supabase
        .from('staff_users')
        .update({ is_active: false })
        .eq('id', staffId);

      if (error) throw error;

      toast.success('Staff member deactivated');
      loadStaffMembers();
    } catch (error: any) {
      console.error('Error deactivating staff:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Database not reachable. Check your internet');
      } else {
        toast.error('Failed to deactivate staff member');
      }
    }
  };

  const openEditModal = (staff: StaffUser) => {
    setSelectedStaff(staff);
    
    // Initialize permissions
    const perms: {[key: string]: {view: boolean, edit: boolean, delete: boolean}} = {};
    AVAILABLE_TABS.forEach(tab => {
      const existing = staff.permissions?.find(p => p.tab_name === tab.key);
      perms[tab.key] = {
        view: existing?.can_view || false,
        edit: existing?.can_edit || false,
        delete: existing?.can_delete || false,
      };
    });
    
    setSelectedPermissions(perms);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone_number: '',
      email: '',
      role: 'staff',
    });
    setSelectedPermissions({});
  };

  const togglePermission = (tabKey: string, permType: 'view' | 'edit' | 'delete') => {
    setSelectedPermissions(prev => {
      const current = prev[tabKey] || { view: false, edit: false, delete: false };
      const updated = { ...current, [permType]: !current[permType] };
      
      // If view is disabled, disable edit and delete too
      if (permType === 'view' && !updated.view) {
        updated.edit = false;
        updated.delete = false;
      }
      
      // If edit or delete is enabled, enable view
      if ((permType === 'edit' || permType === 'delete') && updated[permType]) {
        updated.view = true;
      }
      
      return { ...prev, [tabKey]: updated };
    });
  };

  const formatPhoneNumber = (phone: string) => {
    return phone;
  };

  const getRoleBadgeColor = (role: StaffRole) => {
    const colors = {
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      staff: 'bg-gray-100 text-gray-800 border-gray-200',
      loan_officer: 'bg-green-100 text-green-800 border-green-200',
      accountant: 'bg-purple-100 text-purple-800 border-purple-200',
      collector: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[role] || colors.staff;
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Staff Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage staff members and their permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">No staff members yet</p>
          <p className="text-sm text-gray-500">Click "Add Staff Member" to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {staffList.map(staff => (
            <div key={staff.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1">{staff.full_name}</h3>
                    {staff.email && (
                      <p className="text-sm text-gray-600">{staff.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getRoleBadgeColor(staff.role)}`}>
                      {staff.role.replace('_', ' ').toUpperCase()}
                    </span>
                    {staff.is_first_login && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                        First Login Pending
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {formatPhoneNumber(staff.phone_number)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {staff.permissions && staff.permissions.length > 0 ? (
                      staff.permissions.map((perm, idx) => {
                        const tab = AVAILABLE_TABS.find(t => t.key === perm.tab_name);
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded"
                          >
                            {tab?.name || perm.tab_name}
                            {perm.can_edit && ' (Edit)'}
                            {perm.can_delete && ' (Delete)'}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-500 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(staff)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Permissions"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeactivateStaff(staff.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deactivate Staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Staff Member</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+254712345678"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default password will be the last 4 digits of the phone number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="loan_officer">Loan Officer</option>
                    <option value="accountant">Accountant</option>
                    <option value="collector">Collector</option>
                  </select>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Tab Permissions
                </h3>
                <p className="text-sm text-gray-600">Select which tabs this staff member can access</p>
                
                <div className="space-y-2">
                  {AVAILABLE_TABS.map(tab => {
                    const perms = selectedPermissions[tab.key] || { view: false, edit: false, delete: false };
                    return (
                      <div key={tab.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-medium text-gray-900">{tab.name}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perms.view}
                              onChange={() => togglePermission(tab.key, 'view')}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">View</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perms.edit}
                              onChange={() => togglePermission(tab.key, 'edit')}
                              disabled={!perms.view}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-700">Edit</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perms.delete}
                              onChange={() => togglePermission(tab.key, 'delete')}
                              disabled={!perms.view}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-700">Delete</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStaff}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Permissions - {selectedStaff.full_name}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {AVAILABLE_TABS.map(tab => {
                  const perms = selectedPermissions[tab.key] || { view: false, edit: false, delete: false };
                  return (
                    <div key={tab.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">{tab.name}</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perms.view}
                            onChange={() => togglePermission(tab.key, 'view')}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">View</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perms.edit}
                            onChange={() => togglePermission(tab.key, 'edit')}
                            disabled={!perms.view}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700">Edit</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perms.delete}
                            onChange={() => togglePermission(tab.key, 'delete')}
                            disabled={!perms.view}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700">Delete</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}