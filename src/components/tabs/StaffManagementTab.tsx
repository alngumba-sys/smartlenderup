import { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Edit, Trash2, Upload, Shield, Clock, 
  MapPin, Globe, Calendar, Lock, CheckCircle, XCircle, Grid3x3, List,
  Settings, Eye, FileText, Wallet, DollarSign, UserCheck, Download,
  TrendingUp, AlertTriangle, BarChart3, Brain, Headphones
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  getAllRoles, 
  saveRolePermissions, 
  deleteCustomRole,
  RolePermissions 
} from '../../config/rolePermissions';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  branch?: string;
  role: string;
  photo?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  loginRestrictions: {
    workDays: string[];
    workStartTime: string;
    workEndTime: string;
    ipAddress?: string;
    country?: string;
  };
  permissions: {
    backdating: boolean;
    postdating: boolean;
    repaymentsNeedApproval: boolean;
    savingsNeedApproval: boolean;
  };
  createdDate: string;
}

interface StaffRole {
  id: string;
  name: string;
  type: 'System' | 'Custom';
  permissions: {
    [key: string]: boolean;
  };
}

const PREDEFINED_ROLES: StaffRole[] = [
  {
    id: 'cashier',
    name: 'Cashier',
    type: 'System',
    permissions: {
      viewDashboard: true,
      exportData: false,
      viewPortfolioReport: false,
      viewLoanPerformanceReport: false,
      viewCollectionReport: false,
      viewClientReport: false,
      viewFinancialReport: false,
      viewArrearsReport: false,
      viewDisbursementReport: false,
      viewSavingsReport: false,
      viewClients: true,
      addClients: false,
      editClients: false,
      deleteClients: false,
      viewLoans: true,
      addLoans: false,
      approveLoans: false,
      manageProducts: false,
      addRepayments: true,
      manageSavings: true,
      viewTransactions: true,
      manageStaff: false,
      manageBranches: false,
      bulkOperations: false,
      viewRiskInsights: false,
      canAccessOperations: false,
      canAccessTransactions: true,
      canAccessManagement: false,
      canAccessCompliance: false,
      canAccessAdmin: false,
      canAccessRiskAI: false,
      canAccessSupport: true,
    }
  },
  {
    id: 'teller',
    name: 'Teller',
    type: 'System',
    permissions: {
      viewDashboard: true,
      exportData: false,
      viewPortfolioReport: false,
      viewLoanPerformanceReport: false,
      viewCollectionReport: false,
      viewClientReport: false,
      viewFinancialReport: false,
      viewArrearsReport: false,
      viewDisbursementReport: false,
      viewSavingsReport: false,
      viewClients: true,
      addClients: false,
      editClients: false,
      deleteClients: false,
      viewLoans: true,
      addLoans: false,
      approveLoans: false,
      manageProducts: false,
      addRepayments: true,
      manageSavings: true,
      viewTransactions: true,
      manageStaff: false,
      manageBranches: false,
      bulkOperations: false,
      viewRiskInsights: false,
      canAccessOperations: false,
      canAccessTransactions: true,
      canAccessManagement: false,
      canAccessCompliance: false,
      canAccessAdmin: false,
      canAccessRiskAI: false,
      canAccessSupport: true,
    }
  },
  {
    id: 'loan_officer',
    name: 'Loan Officer',
    type: 'System',
    permissions: {
      viewDashboard: true,
      exportData: true,
      viewPortfolioReport: false,
      viewLoanPerformanceReport: false,
      viewCollectionReport: false,
      viewClientReport: false,
      viewFinancialReport: false,
      viewArrearsReport: false,
      viewDisbursementReport: false,
      viewSavingsReport: false,
      viewClients: true,
      addClients: true,
      editClients: true,
      deleteClients: false,
      viewLoans: true,
      addLoans: true,
      approveLoans: false,
      manageProducts: false,
      addRepayments: true,
      manageSavings: true,
      viewTransactions: true,
      manageStaff: false,
      manageBranches: false,
      bulkOperations: false,
      viewRiskInsights: true,
      canAccessOperations: true,
      canAccessTransactions: true,
      canAccessManagement: false,
      canAccessCompliance: false,
      canAccessAdmin: false,
      canAccessRiskAI: true,
      canAccessSupport: true,
    }
  },
  {
    id: 'collector',
    name: 'Collector',
    type: 'System',
    permissions: {
      viewDashboard: true,
      exportData: true,
      viewPortfolioReport: false,
      viewLoanPerformanceReport: false,
      viewCollectionReport: true,
      viewClientReport: false,
      viewFinancialReport: false,
      viewArrearsReport: true,
      viewDisbursementReport: false,
      viewSavingsReport: false,
      viewClients: true,
      addClients: false,
      editClients: false,
      deleteClients: false,
      viewLoans: true,
      addLoans: false,
      approveLoans: false,
      manageProducts: false,
      addRepayments: true,
      manageSavings: false,
      viewTransactions: true,
      manageStaff: false,
      manageBranches: false,
      bulkOperations: false,
      viewRiskInsights: true,
      canAccessOperations: true,
      canAccessTransactions: true,
      canAccessManagement: false,
      canAccessCompliance: false,
      canAccessAdmin: false,
      canAccessRiskAI: false,
      canAccessSupport: true,
    }
  },
  {
    id: 'manager',
    name: 'Manager',
    type: 'System',
    permissions: {
      viewDashboard: true,
      exportData: true,
      viewPortfolioReport: true,
      viewLoanPerformanceReport: true,
      viewCollectionReport: true,
      viewClientReport: true,
      viewFinancialReport: true,
      viewArrearsReport: true,
      viewDisbursementReport: true,
      viewSavingsReport: true,
      viewClients: true,
      addClients: true,
      editClients: true,
      deleteClients: true,
      viewLoans: true,
      addLoans: true,
      approveLoans: true,
      manageProducts: true,
      addRepayments: true,
      manageSavings: true,
      viewTransactions: true,
      manageStaff: true,
      manageBranches: false,
      bulkOperations: true,
      viewRiskInsights: true,
      canAccessOperations: true,
      canAccessTransactions: true,
      canAccessManagement: true,
      canAccessCompliance: true,
      canAccessAdmin: false,
      canAccessRiskAI: true,
      canAccessSupport: true,
    }
  },
  {
    id: 'admin',
    name: 'Admin',
    type: 'System',
    permissions: {
      viewDashboard: true,
      exportData: true,
      viewPortfolioReport: true,
      viewLoanPerformanceReport: true,
      viewCollectionReport: true,
      viewClientReport: true,
      viewFinancialReport: true,
      viewArrearsReport: true,
      viewDisbursementReport: true,
      viewSavingsReport: true,
      viewClients: true,
      addClients: true,
      editClients: true,
      deleteClients: true,
      viewLoans: true,
      addLoans: true,
      approveLoans: true,
      manageProducts: true,
      addRepayments: true,
      manageSavings: true,
      viewTransactions: true,
      manageStaff: true,
      manageBranches: true,
      bulkOperations: true,
      viewRiskInsights: true,
      canAccessOperations: true,
      canAccessTransactions: true,
      canAccessManagement: true,
      canAccessCompliance: true,
      canAccessAdmin: true,
      canAccessRiskAI: true,
      canAccessSupport: true,
    }
  },
];

const SAMPLE_STAFF: Staff[] = [];

export function StaffManagementTab() {
  const { isDark } = useTheme();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showRoleManagerModal, setShowRoleManagerModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);

  // Load roles from localStorage on mount
  useEffect(() => {
    const loadedRoles = getAllRoles();
    setRoles(loadedRoles);
  }, []);

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setShowAddStaffModal(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowAddStaffModal(true);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const handleAddCustomRole = () => {
    const newRole: StaffRole = {
      id: `custom_${Date.now()}`,
      name: 'New Custom Role',
      type: 'Custom',
      permissions: {
        viewClients: false,
        viewLoans: false,
        addRepayments: false,
        viewReports: false,
        manageStaff: false,
        approveLoans: false,
        manageBranches: false,
        viewDashboard: false,
        manageSavings: false,
        viewTransactions: false,
        exportData: false,
        manageProducts: false,
        viewRiskInsights: false,
        bulkOperations: false,
      }
    };
    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setShowPermissionsModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" style={{ backgroundColor: '#111120' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-gray-900 dark:text-white">Staff Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage staff members, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoleManagerModal(true)}
              className="px-[16px] py-[3px] bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Shield className="size-4" />
              Manage Roles
            </button>
            <button
              onClick={handleAddStaff}
              className="px-[16px] py-[3px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="size-4" />
              Add Staff
            </button>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search staff by name, email, branch, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Grid3x3 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#111120' }}>
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="text-left p-4 text-gray-900 dark:text-white">Staff Member</th>
                  <th className="text-left p-4 text-gray-900 dark:text-white">Branch</th>
                  <th className="text-left p-4 text-gray-900 dark:text-white">Role</th>
                  <th className="text-left p-4 text-gray-900 dark:text-white">Contact</th>
                  <th className="text-center p-4 text-gray-900 dark:text-white">Status</th>
                  <th className="text-center p-4 text-gray-900 dark:text-white">Restrictions</th>
                  <th className="text-center p-4 text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                          {staffMember.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white text-[15px]">{staffMember.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-[13px]">{staffMember.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-gray-300 text-[14px]">{staffMember.branch}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900 dark:text-gray-300 text-sm">{staffMember.email}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{staffMember.phone}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          staffMember.status === 'Active' ? 'bg-green-100 text-green-700' :
                          staffMember.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {staffMember.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {!staffMember.permissions.backdating && (
                          <div className="p-1 bg-amber-100 rounded" title="No Backdating">
                            <Calendar className="size-3 text-amber-700" />
                          </div>
                        )}
                        {staffMember.permissions.repaymentsNeedApproval && (
                          <div className="p-1 bg-blue-100 rounded" title="Needs Approval">
                            <UserCheck className="size-3 text-blue-700" />
                          </div>
                        )}
                        {staffMember.loginRestrictions.ipAddress && (
                          <div className="p-1 bg-purple-100 rounded" title="IP Restricted">
                            <Globe className="size-3 text-purple-700" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditStaff(staffMember)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto pr-2">
            {filteredStaff.map((staffMember) => (
              <div key={staffMember.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                      {staffMember.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-gray-900">{staffMember.name}</p>
                      <p className="text-sm text-gray-600">{staffMember.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    staffMember.status === 'Active' ? 'bg-green-100 text-green-700' :
                    staffMember.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {staffMember.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-gray-400" />
                    <span className="text-gray-900">{staffMember.branch}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="size-4 text-gray-400" />
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{staffMember.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-gray-400" />
                    <span className="text-gray-600">{staffMember.loginRestrictions.workStartTime} - {staffMember.loginRestrictions.workEndTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditStaff(staffMember)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <Edit className="size-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staffMember.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {showAddStaffModal && (
        <AddEditStaffModal
          staff={selectedStaff}
          roles={roles}
          onClose={() => setShowAddStaffModal(false)}
          onSave={(staffData) => {
            if (selectedStaff) {
              setStaff(staff.map(s => s.id === selectedStaff.id ? { ...s, ...staffData } : s));
            } else {
              const newStaff: Staff = {
                ...staffData,
                id: `STF${(staff.length + 1).toString().padStart(3, '0')}`,
                createdDate: new Date().toISOString().split('T')[0],
              };
              setStaff([...staff, newStaff]);
            }
            setShowAddStaffModal(false);
          }}
        />
      )}

      {/* Role Manager Modal */}
      {showRoleManagerModal && (
        <RoleManagerModal
          roles={roles}
          onClose={() => setShowRoleManagerModal(false)}
          onAddCustomRole={handleAddCustomRole}
          onEditRole={(role) => {
            setSelectedRole(role);
            setShowPermissionsModal(true);
          }}
          onDeleteRole={(roleId) => {
            if (confirm('Are you sure you want to delete this role?')) {
              setRoles(roles.filter(r => r.id !== roleId));
              deleteCustomRole(roleId);
            }
          }}
        />
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <PermissionsModal
          role={selectedRole}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedRole(null);
          }}
          onSave={(updatedRole) => {
            setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
            saveRolePermissions(updatedRole.name, updatedRole.permissions as RolePermissions, updatedRole.type === 'Custom');
            setShowPermissionsModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}

// Add/Edit Staff Modal Component
function AddEditStaffModal({ 
  staff, 
  roles,
  onClose, 
  onSave 
}: { 
  staff: Staff | null;
  roles: StaffRole[];
  onClose: () => void;
  onSave: (staff: Partial<Staff>) => void;
}) {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    address: staff?.address || '',
    branch: staff?.branch || '',
    role: staff?.role || '',
    status: staff?.status || 'Active' as const,
    loginRestrictions: {
      workDays: staff?.loginRestrictions.workDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workStartTime: staff?.loginRestrictions.workStartTime || '08:00',
      workEndTime: staff?.loginRestrictions.workEndTime || '17:00',
      ipAddress: staff?.loginRestrictions.ipAddress || '',
      country: staff?.loginRestrictions.country || 'Kenya',
    },
    permissions: {
      backdating: staff?.permissions.backdating || false,
      postdating: staff?.permissions.postdating || false,
      repaymentsNeedApproval: staff?.permissions.repaymentsNeedApproval || true,
      savingsNeedApproval: staff?.permissions.savingsNeedApproval || true,
    }
  });

  const { isDark } = useTheme();
  const branches = ['Nairobi - HQ', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-[rgb(208,239,255)] dark:bg-gray-700">
          <h3 className="text-gray-900 dark:text-white text-xl font-bold">{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl">
              {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : <Upload className="size-8" />}
            </div>
            <div>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2">
                <Upload className="size-4" />
                Upload Photo
              </button>
              <p className="text-sm text-gray-600 mt-2">JPG, PNG or GIF (max. 2MB)</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="+254 712 345 678"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="City, Kenya"
              />
            </div>
          </div>

          {/* Role Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Staff Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' | 'Suspended' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Login Restrictions */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="size-5 text-blue-600" />
              Login Restrictions
            </h4>

            <div className="space-y-4">
              {/* Work Days */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Work Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = formData.loginRestrictions.workDays.includes(day)
                          ? formData.loginRestrictions.workDays.filter(d => d !== day)
                          : [...formData.loginRestrictions.workDays, day];
                        setFormData({
                          ...formData,
                          loginRestrictions: { ...formData.loginRestrictions, workDays: newDays }
                        });
                      }}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        formData.loginRestrictions.workDays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Timings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Work Start Time</label>
                  <input
                    type="time"
                    value={formData.loginRestrictions.workStartTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      loginRestrictions: { ...formData.loginRestrictions, workStartTime: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Work End Time</label>
                  <input
                    type="time"
                    value={formData.loginRestrictions.workEndTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      loginRestrictions: { ...formData.loginRestrictions, workEndTime: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* IP and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">IP Address (Optional)</label>
                  <input
                    type="text"
                    value={formData.loginRestrictions.ipAddress}
                    onChange={(e) => setFormData({
                      ...formData,
                      loginRestrictions: { ...formData.loginRestrictions, ipAddress: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="192.168.1.50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Allowed Country</label>
                  <input
                    type="text"
                    value={formData.loginRestrictions.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      loginRestrictions: { ...formData.loginRestrictions, country: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Kenya"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Permissions */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="size-5 text-purple-600" />
              Transaction Permissions
            </h4>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.backdating}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, backdating: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="text-gray-900">Allow Backdating</p>
                  <p className="text-sm text-gray-600">Staff can enter transactions with past dates</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.postdating}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, postdating: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="text-gray-900">Allow Postdating</p>
                  <p className="text-sm text-gray-600">Staff can enter transactions with future dates</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.repaymentsNeedApproval}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, repaymentsNeedApproval: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="text-gray-900">Repayments Require Approval</p>
                  <p className="text-sm text-gray-600">All repayment entries need manager approval</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.savingsNeedApproval}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, savingsNeedApproval: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="text-gray-900">Savings Transactions Require Approval</p>
                  <p className="text-sm text-gray-600">All savings entries need manager approval</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {staff ? 'Update Staff' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Role Manager Modal Component
function RoleManagerModal({ 
  roles, 
  onClose, 
  onAddCustomRole,
  onEditRole,
  onDeleteRole
}: { 
  roles: StaffRole[];
  onClose: () => void;
  onAddCustomRole: () => void;
  onEditRole: (role: StaffRole) => void;
  onDeleteRole: (roleId: string) => void;
}) {
  const { isDark } = useTheme();
  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-[rgb(208,239,255)] dark:bg-gray-700 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold">Manage Staff Roles</h3>
            <button
              onClick={onAddCustomRole}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="size-4" />
              Add Custom Role
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Grid layout for roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Shield className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 dark:text-white font-medium text-sm truncate">{role.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {role.type === 'System' ? 'System Role' : 'Custom Role'} • {Object.values(role.permissions).filter(Boolean).length} permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onEditRole(role)}
                      className="px-2.5 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Eye className="size-3.5" />
                      View
                    </button>
                    {role.type === 'Custom' && (
                      <button
                        onClick={() => onDeleteRole(role.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Permissions Modal Component
function PermissionsModal({ 
  role, 
  onClose, 
  onSave 
}: { 
  role: StaffRole;
  onClose: () => void;
  onSave: (role: StaffRole) => void;
}) {
  const [editedRole, setEditedRole] = useState<StaffRole>(role);
  const { isDark } = useTheme();

  const permissionGroups = [
    {
      name: 'Dashboard & Reports',
      permissions: [
        { key: 'viewDashboard', label: 'View Dashboard', icon: Eye },
        { key: 'exportData', label: 'Export Data', icon: Download },
      ]
    },
    {
      name: 'Report Access',
      permissions: [
        { key: 'viewPortfolioReport', label: 'Portfolio Overview Report', icon: FileText },
        { key: 'viewLoanPerformanceReport', label: 'Loan Performance Report', icon: TrendingUp },
        { key: 'viewCollectionReport', label: 'Collection Report', icon: DollarSign },
        { key: 'viewClientReport', label: 'Client Report', icon: Users },
        { key: 'viewFinancialReport', label: 'Financial Report', icon: DollarSign },
        { key: 'viewArrearsReport', label: 'Arrears Report', icon: AlertTriangle },
        { key: 'viewDisbursementReport', label: 'Disbursement Report', icon: TrendingUp },
        { key: 'viewSavingsReport', label: 'Savings Report', icon: Wallet },
      ]
    },
    {
      name: 'Operations',
      permissions: [
        { key: 'canAccessOperations', label: 'Operations Tab Access', icon: Users },
        { key: 'viewClients', label: 'View Clients', icon: Users },
        { key: 'addClients', label: 'Add Clients', icon: Plus },
        { key: 'editClients', label: 'Edit Clients', icon: Edit },
        { key: 'deleteClients', label: 'Delete Clients', icon: Trash2 },
        { key: 'viewLoans', label: 'View Loans', icon: FileText },
        { key: 'addLoans', label: 'Add Loans', icon: Plus },
        { key: 'approveLoans', label: 'Approve Loans', icon: CheckCircle },
        { key: 'manageProducts', label: 'Manage Loan Products', icon: Settings },
      ]
    },
    {
      name: 'Transactions',
      permissions: [
        { key: 'canAccessTransactions', label: 'Transactions Tab Access', icon: DollarSign },
        { key: 'addRepayments', label: 'Add Repayments', icon: DollarSign },
        { key: 'manageSavings', label: 'Manage Savings', icon: Wallet },
        { key: 'viewTransactions', label: 'View Transactions', icon: FileText },
      ]
    },
    {
      name: 'Management',
      permissions: [
        { key: 'canAccessManagement', label: 'Management Tab Access', icon: BarChart3 },
      ]
    },
    {
      name: 'Compliance',
      permissions: [
        { key: 'canAccessCompliance', label: 'Compliance Tab Access', icon: Shield },
      ]
    },
    {
      name: 'Administration',
      permissions: [
        { key: 'canAccessAdmin', label: 'Admin Tab Access', icon: Settings },
        { key: 'manageStaff', label: 'Manage Staff', icon: Users },
        { key: 'manageBranches', label: 'Manage Branches', icon: MapPin },
        { key: 'bulkOperations', label: 'Bulk Operations', icon: Upload },
      ]
    },
    {
      name: 'Risk & AI Insights',
      permissions: [
        { key: 'canAccessRiskAI', label: 'Risk & AI Tab Access', icon: Brain },
        { key: 'viewRiskInsights', label: 'View Risk Insights', icon: Shield },
      ]
    },
    {
      name: 'Support',
      permissions: [
        { key: 'canAccessSupport', label: 'Support Tab Access', icon: Headphones },
      ]
    },
  ];

  const togglePermission = (key: string) => {
    setEditedRole({
      ...editedRole,
      permissions: {
        ...editedRole.permissions,
        [key]: !editedRole.permissions[key]
      }
    });
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            {role.type === 'Custom' && (
              <input
                type="text"
                value={editedRole.name}
                onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
                className="text-xl text-gray-900 dark:text-white border-none outline-none mb-1 w-full bg-transparent"
              />
            )}
            {role.type === 'System' && (
              <h3 className="text-gray-900 dark:text-white text-xl mb-1">{editedRole.name}</h3>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {role.type === 'System' ? 'System Role - Customize permissions below' : 'Custom Role - Edit permissions below'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {permissionGroups.map((group) => (
            <div key={group.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-gray-900 dark:text-white mb-3">{group.name}</h4>
              <div className="grid grid-cols-2 gap-3">
                {group.permissions.map((permission) => {
                  const Icon = permission.icon;
                  return (
                    <label
                      key={permission.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                        editedRole.permissions[permission.key]
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                      } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={editedRole.permissions[permission.key] || false}
                        onChange={() => togglePermission(permission.key)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <Icon className="size-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white text-sm">{permission.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedRole)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}