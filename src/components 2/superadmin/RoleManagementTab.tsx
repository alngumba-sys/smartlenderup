import { useState, useEffect } from 'react';
import { Users, Shield, Lock, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { db } from '../../utils/database';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function RoleManagementTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'loan_officer' | 'accountant' | 'support'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([refreshUsers(), refreshOrganizations()]);
    setIsLoading(false);
  };

  const refreshOrganizations = async () => {
    try {
      const { data, error } = await supabase.from('organizations').select('id, organization_name');
      if (!error && data) {
        setOrganizations(data);
      }
    } catch (error) {
      console.error('❌ Error fetching organizations:', error);
    }
  };

  const refreshUsers = async () => {
    try {
      console.log('📊 Fetching users from Supabase...');
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('❌ Error fetching users:', error);
        toast.error('Failed to fetch users from Supabase');
        // Try localStorage as fallback
        const localUsers = db.getAllUsers();
        setUsers(localUsers);
      } else {
        console.log('✅ Fetched users from Supabase:', data?.length || 0);
        setUsers(data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // Try localStorage as fallback
      const localUsers = db.getAllUsers();
      setUsers(localUsers);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        console.error('❌ Error updating user status:', error);
        toast.error('Failed to update user status');
        return;
      }
      
      db.updateUser(userId, { status: newStatus });
      await refreshUsers();
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const resetUserPassword = (userId: string) => {
    // In real app, this would send password reset email
    const user = users.find(u => u.id === userId);
    if (user) {
      alert(`Password reset link sent to ${user.email}`);
    }
  };

  const getOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId) || db.getAllOrganizations().find(o => o.id === orgId);
    return org?.organization_name || 'Unknown';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'manager': return '#ec7347';
      case 'loan_officer': return '#3b82f6';
      case 'accountant': return '#10b981';
      case 'support': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-4" style={{ color: '#ec7347' }} />
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Role-Based Access Control</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Manage organization admin accounts and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ backgroundColor: '#032b43', color: '#ec7347', border: '1px solid rgba(236, 115, 71, 0.2)' }}
            title="Refresh users"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: '#032b43', color: '#e8d1c9' }}>
            Total Users: <span className="font-bold" style={{ color: '#ec7347' }}>{users.length}</span>
          </div>
        </div>
      </div>

      {/* Stats by Role */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {['admin', 'manager', 'loan_officer', 'accountant', 'support'].map(role => (
          <div key={role} className="p-4 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="size-4" style={{ color: getRoleColor(role) }} />
              <span className="text-xs capitalize" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
                {role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>
              {users.filter(u => u.role === role).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#032b43',
              border: '1px solid rgba(232, 209, 201, 0.2)',
              color: '#e8d1c9'
            }}
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              backgroundColor: '#032b43',
              border: '1px solid rgba(232, 209, 201, 0.2)',
              color: '#e8d1c9'
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="loan_officer">Loan Officer</option>
            <option value="accountant">Accountant</option>
            <option value="support">Support</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#154F73' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>User</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Organization</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr 
                  key={user.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#032b43' : '#020838',
                    borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 115, 71, 0.1)' }}>
                        <Users className="size-5" style={{ color: '#ec7347' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono" style={{ color: '#e8d1c9' }}>{user.username}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: '#e8d1c9' }}>{getOrganization(user.organization_id)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium capitalize" style={{ 
                      backgroundColor: `${getRoleColor(user.role)}20`,
                      color: getRoleColor(user.role)
                    }}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(user.status) }}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded hover:opacity-70"
                        style={{ color: '#3b82f6' }}
                        title="View Details"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => resetUserPassword(user.id)}
                        className="p-1.5 rounded hover:opacity-70"
                        style={{ color: '#f59e0b' }}
                        title="Reset Password"
                      >
                        <Lock className="size-4" />
                      </button>
                      {user.status === 'active' && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                          className="p-1.5 rounded hover:opacity-70"
                          style={{ color: '#ef4444' }}
                          title="Suspend"
                        >
                          <XCircle className="size-4" />
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'active')}
                          className="p-1.5 rounded hover:opacity-70"
                          style={{ color: '#10b981' }}
                          title="Activate"
                        >
                          <CheckCircle className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Permissions Guide */}
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Role Permissions Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RolePermissionCard 
            role="Admin"
            color="#ef4444"
            permissions={[
              'Full system access',
              'Manage all users',
              'Configure organization settings',
              'View all reports and analytics',
              'Approve/reject loans'
            ]}
          />
          <RolePermissionCard 
            role="Manager"
            color="#ec7347"
            permissions={[
              'Manage team members',
              'View all client data',
              'Approve loans up to limit',
              'Generate reports',
              'Manage loan products'
            ]}
          />
          <RolePermissionCard 
            role="Loan Officer"
            color="#3b82f6"
            permissions={[
              'Create loan applications',
              'Manage assigned clients',
              'Process loan disbursements',
              'Update loan statuses',
              'View client credit history'
            ]}
          />
          <RolePermissionCard 
            role="Accountant"
            color="#10b981"
            permissions={[
              'Manage financial transactions',
              'Process repayments',
              'Generate financial reports',
              'Reconcile accounts',
              'View payment history'
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function RolePermissionCard({ role, color, permissions }: { role: string; color: string; permissions: string[] }) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: '#020838', border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="size-5" style={{ color }} />
        <h4 className="font-semibold" style={{ color }}>{role}</h4>
      </div>
      <ul className="space-y-2">
        {permissions.map((permission, index) => (
          <li key={index} className="text-sm flex items-start gap-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
            <CheckCircle className="size-4 mt-0.5 flex-shrink-0" style={{ color }} />
            <span>{permission}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
