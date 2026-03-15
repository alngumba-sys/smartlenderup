import React, { useState, useEffect } from 'react';
import { Key, Phone, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { getOrganizationId } from '../utils/organizationUtils';
import { showDatabaseError } from '../utils/toastUtils';

interface StaffLoginProps {
  onLoginSuccess: (userData: any) => void;
  onBackToMain: () => void;
}

export function StaffLogin({ onLoginSuccess, onBackToMain }: StaffLoginProps) {
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [staffData, setStaffData] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load saved credentials on mount
  useEffect(() => {
    const savedCreds = localStorage.getItem('staff_remember_credentials');
    if (savedCreds) {
      try {
        const { identifier: savedIdentifier, password: savedPassword } = JSON.parse(savedCreds);
        setIdentifier(savedIdentifier);
        setPassword(savedPassword);
        setRememberMe(true);
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  }, []);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error('Please enter email/phone number and password');
      return;
    }

    setLoading(true);
    try {
      // Determine if identifier is email or phone
      const isEmail = identifier.includes('@');
      
      // Find staff user by email or phone number (no org filter needed - phone/email is unique)
      let query = supabase
        .from('staff_users')
        .select('*')
        .eq('is_active', true);
      
      if (isEmail) {
        query = query.eq('email', identifier);
      } else {
        query = query.eq('phone_number', identifier);
      }
      
      const { data: staffUser, error: staffError } = await query.single();

      if (staffError || !staffUser) {
        toast.error('Invalid email/phone number or password');
        setLoading(false);
        return;
      }

      // Verify password (in production, use proper password hashing)
      if (staffUser.password_hash !== password) {
        toast.error('Invalid email/phone number or password');
        setLoading(false);
        return;
      }

      // Automatically set the organization from the staff user record
      localStorage.setItem('organization_id', staffUser.organization_id);

      // Check if first login
      if (staffUser.is_first_login) {
        setStaffData(staffUser);
        setShowPasswordChange(true);
        setLoading(false);
        return;
      }

      // Load permissions - check granular permissions first
      let permissionsToStore: any = [];
      
      console.log('🔍 [LOGIN] Loading permissions for:', staffUser.full_name);
      console.log('🔍 [LOGIN] Raw granular_permissions:', staffUser.granular_permissions);
      
      try {
        let granularPerms = staffUser.granular_permissions as any;
        
        console.log('🔍 [LOGIN] Initial granularPerms type:', typeof granularPerms);
        
        // Parse if it's a string
        if (typeof granularPerms === 'string') {
          console.log('🔍 [LOGIN] Parsing JSON string...');
          granularPerms = JSON.parse(granularPerms);
          console.log('🔍 [LOGIN] Parsed granularPerms:', granularPerms);
          // Update staffUser with parsed granular_permissions
          staffUser.granular_permissions = granularPerms;
        }
        
        // If user has granular permissions, convert them to permission object
        if (granularPerms && granularPerms.useGranularPermissions) {
          console.log('✅ [LOGIN] User has granular permissions enabled!');
          if (granularPerms.role) {
            // User has a preset role - load permissions from role
            const { getRolePermissions } = await import('../config/rolePermissions');
            permissionsToStore = getRolePermissions(granularPerms.role);
            console.log(`✅ Loaded granular role permissions for: ${granularPerms.role}`, permissionsToStore);
          } else if (granularPerms.customPermissions && Array.isArray(granularPerms.customPermissions)) {
            // User has custom permissions - convert array to permission object
            const permObj: any = {};
            
            // Mapping from granular permission strings to role permission flags
            const permissionMap: Record<string, string[]> = {
              // Dashboard
              'dashboard.view': ['viewDashboard'],
              'dashboard.export': ['exportData'],
              
              // Clients
              'clients.view': ['viewClients', 'canAccessOperations'],
              'clients.add': ['addClients'],
              'clients.edit': ['editClients'],
              'clients.delete': ['deleteClients'],
              'clients.export': ['exportData'],
              
              // Loans
              'loans.view': ['viewLoans', 'canAccessOperations'],
              'loans.create': ['addLoans'],
              'loans.edit': ['editLoans'],
              'loans.disburse': ['approveLoans'],
              'loans.export': ['exportData'],
              
              // Approvals
              'approvals.view': ['approveLoans'],
              'approvals.approve_phase_1': ['approveLoans'],
              'approvals.approve_phase_2': ['approveLoans'],
              'approvals.approve_phase_3': ['approveLoans'],
              'approvals.approve_phase_4': ['approveLoans'],
              'approvals.approve_phase_5': ['approveLoans'],
              
              // Products
              'products.view': ['manageProducts', 'canAccessOperations'],
              'products.create': ['manageProducts'],
              'products.edit': ['manageProducts'],
              
              // Repayments
              'repayments.view': ['viewTransactions'],
              'repayments.record': ['addRepayments'],
              
              // Transactions
              'transactions.view': ['viewTransactions', 'canAccessTransactions'],
              'transactions.create': ['canAccessTransactions'],
              
              // Reports
              'reports.view_portfolio': ['viewPortfolioReport'],
              'reports.view_loan_performance': ['viewLoanPerformanceReport'],
              'reports.view_collection': ['viewCollectionReport'],
              'reports.view_client': ['viewClientReport'],
              'reports.view_financial': ['viewFinancialReport'],
              'reports.view_arrears': ['viewArrearsReport'],
              'reports.view_disbursement': ['viewDisbursementReport'],
              
              // Settings/Admin
              'settings.view': ['canAccessAdmin'],
              'settings.manage_staff': ['manageStaff', 'canAccessAdmin'],
              'settings.manage_branches': ['manageBranches', 'canAccessAdmin'],
              
              // Credit Scoring
              'credit_scoring.view': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.view_details': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.view_factors': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.configure_parameters': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.recalculate': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.export': ['exportData'],
              
              // AI Insights
              'ai_insights.view': ['viewRiskInsights', 'canAccessRiskAI'],
              'ai_insights.view_predictions': ['viewRiskInsights', 'canAccessRiskAI'],
              'ai_insights.view_recommendations': ['viewRiskInsights', 'canAccessRiskAI'],
            };
            
            granularPerms.customPermissions.forEach((perm: string) => {
              const mappedPerms = permissionMap[perm];
              if (mappedPerms) {
                mappedPerms.forEach(p => {
                  permObj[p] = true;
                });
              }
            });
            
            permissionsToStore = permObj;
            console.log(`✅ Loaded ${granularPerms.customPermissions.length} custom granular permissions`, permissionsToStore);
          }
        } else {
          console.log('⚠️ [LOGIN] No granular permissions found - falling back to tab-based');
          console.log('⚠️ [LOGIN] granularPerms:', granularPerms);
          console.log('⚠️ [LOGIN] useGranularPermissions:', granularPerms?.useGranularPermissions);
          
          // Fall back to tab-based permissions (legacy)
          const { data: permissions, error: permError } = await supabase
            .from('staff_permissions')
            .select('*')
            .eq('staff_user_id', staffUser.id);

          if (permError) {
            console.error('Error loading tab-based permissions:', permError);
          }
          
          permissionsToStore = permissions || [];
          console.log(`✅ [LOGIN] Loaded ${permissions?.length || 0} tab-based permissions`, permissionsToStore);
        }
      } catch (error) {
        console.error('❌ [LOGIN] Error processing permissions:', error);
        // Fall back to tab-based permissions
        const { data: permissions, error: permError } = await supabase
          .from('staff_permissions')
          .select('*')
          .eq('staff_user_id', staffUser.id);

          if (permError) {
            console.error('Error loading tab-based permissions:', permError);
          }
        
          permissionsToStore = permissions || [];
          console.log(`⚠️ [LOGIN] Loaded ${permissions?.length || 0} tab-based permissions (fallback)`, permissionsToStore);
      }
      
      console.log('📦 [LOGIN] Final permissions to store:', permissionsToStore);
      console.log('📦 [LOGIN] Permissions type:', Array.isArray(permissionsToStore) ? 'array' : typeof permissionsToStore);

      // Store user data with permissions
      // Map staff user fields to the User interface expected by AuthContext
      const userDataWithPermissions = {
        id: staffUser.id,
        name: staffUser.full_name,
        email: staffUser.email,
        phone: staffUser.phone_number,
        role: staffUser.role || 'Loan Officer', // Default role if not set
        userType: 'staff' as const,
        branch: staffUser.branch_id,
        permissions: permissionsToStore,
        organizationId: staffUser.organization_id,
        // Keep original staff fields for reference
        full_name: staffUser.full_name,
        phone_number: staffUser.phone_number,
        branch_id: staffUser.branch_id,
        organization_id: staffUser.organization_id,
        is_active: staffUser.is_active,
        granular_permissions: staffUser.granular_permissions,
      };

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('staff_remember_credentials', JSON.stringify({
          identifier,
          password
        }));
      } else {
        localStorage.removeItem('staff_remember_credentials');
      }

      // ❌ REMOVED: Don't set localStorage directly - let AuthContext handle it
      // localStorage.setItem('bvfunguo_user', JSON.stringify(userDataWithPermissions)); // Use bvfunguo_user key
      localStorage.setItem('is_authenticated', 'true');
      
      console.log('🟢 [LOGIN] Calling onLoginSuccess with user data:', userDataWithPermissions.name);
      console.log('🟢 [LOGIN] User permissions:', userDataWithPermissions.permissions);
      toast.success(`Welcome back, ${staffUser.full_name}!`);
      onLoginSuccess(userDataWithPermissions);
    } catch (error: any) {
      console.error('Error during staff login:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        showDatabaseError('Database not reachable. Check your internet');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Automatically set the organization from the staff user record
      localStorage.setItem('organization_id', staffData.organization_id);

      // Update password and mark first login as complete
      const { error: updateError } = await supabase
        .from('staff_users')
        .update({
          password_hash: newPassword,
          is_first_login: false,
        })
        .eq('id', staffData.id);

      if (updateError) throw updateError;

      // Load permissions - check granular permissions first
      let permissionsToStore: any = [];
      
      try {
        let granularPerms = staffData.granular_permissions as any;
        
        // Parse if it's a string
        if (typeof granularPerms === 'string') {
          granularPerms = JSON.parse(granularPerms);
          // Update staffData with parsed granular_permissions
          staffData.granular_permissions = granularPerms;
        }
        
        // If user has granular permissions, convert them to permission object
        if (granularPerms && granularPerms.useGranularPermissions) {
          if (granularPerms.role) {
            // User has a preset role - load permissions from role
            const { getRolePermissions } = await import('../config/rolePermissions');
            permissionsToStore = getRolePermissions(granularPerms.role);
            console.log(`✅ Loaded granular role permissions for: ${granularPerms.role}`, permissionsToStore);
          } else if (granularPerms.customPermissions && Array.isArray(granularPerms.customPermissions)) {
            // User has custom permissions - convert array to permission object
            const permObj: any = {};
            
            // Mapping from granular permission strings to role permission flags
            const permissionMap: Record<string, string[]> = {
              // Dashboard
              'dashboard.view': ['viewDashboard'],
              'dashboard.export': ['exportData'],
              
              // Clients
              'clients.view': ['viewClients', 'canAccessOperations'],
              'clients.add': ['addClients'],
              'clients.edit': ['editClients'],
              'clients.delete': ['deleteClients'],
              'clients.export': ['exportData'],
              
              // Loans
              'loans.view': ['viewLoans', 'canAccessOperations'],
              'loans.create': ['addLoans'],
              'loans.edit': ['editLoans'],
              'loans.disburse': ['approveLoans'],
              'loans.export': ['exportData'],
              
              // Approvals
              'approvals.view': ['approveLoans'],
              'approvals.approve_phase_1': ['approveLoans'],
              'approvals.approve_phase_2': ['approveLoans'],
              'approvals.approve_phase_3': ['approveLoans'],
              'approvals.approve_phase_4': ['approveLoans'],
              'approvals.approve_phase_5': ['approveLoans'],
              
              // Products
              'products.view': ['manageProducts', 'canAccessOperations'],
              'products.create': ['manageProducts'],
              'products.edit': ['manageProducts'],
              
              // Repayments
              'repayments.view': ['viewTransactions'],
              'repayments.record': ['addRepayments'],
              
              // Transactions
              'transactions.view': ['viewTransactions', 'canAccessTransactions'],
              'transactions.create': ['canAccessTransactions'],
              
              // Reports
              'reports.view_portfolio': ['viewPortfolioReport'],
              'reports.view_loan_performance': ['viewLoanPerformanceReport'],
              'reports.view_collection': ['viewCollectionReport'],
              'reports.view_client': ['viewClientReport'],
              'reports.view_financial': ['viewFinancialReport'],
              'reports.view_arrears': ['viewArrearsReport'],
              'reports.view_disbursement': ['viewDisbursementReport'],
              
              // Settings/Admin
              'settings.view': ['canAccessAdmin'],
              'settings.manage_staff': ['manageStaff', 'canAccessAdmin'],
              'settings.manage_branches': ['manageBranches', 'canAccessAdmin'],
              
              // Credit Scoring
              'credit_scoring.view': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.view_details': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.view_factors': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.configure_parameters': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.recalculate': ['viewRiskInsights', 'canAccessRiskAI'],
              'credit_scoring.export': ['exportData'],
              
              // AI Insights
              'ai_insights.view': ['viewRiskInsights', 'canAccessRiskAI'],
              'ai_insights.view_predictions': ['viewRiskInsights', 'canAccessRiskAI'],
              'ai_insights.view_recommendations': ['viewRiskInsights', 'canAccessRiskAI'],
            };
            
            granularPerms.customPermissions.forEach((perm: string) => {
              const mappedPerms = permissionMap[perm];
              if (mappedPerms) {
                mappedPerms.forEach(p => {
                  permObj[p] = true;
                });
              }
            });
            
            permissionsToStore = permObj;
            console.log(`✅ Loaded ${granularPerms.customPermissions.length} custom granular permissions`, permissionsToStore);
          }
        } else {
          // Fall back to tab-based permissions (legacy)
          const { data: permissions, error: permError } = await supabase
            .from('staff_permissions')
            .select('*')
            .eq('staff_user_id', staffData.id);

          if (permError) {
            console.error('Error loading tab-based permissions:', permError);
          }
          
          permissionsToStore = permissions || [];
          console.log(`✅ Loaded ${permissions?.length || 0} tab-based permissions`, permissionsToStore);
        }
      } catch (error) {
        console.error('Error processing permissions:', error);
        // Fall back to tab-based permissions
        const { data: permissions, error: permError } = await supabase
          .from('staff_permissions')
          .select('*')
          .eq('staff_user_id', staffData.id);

        if (permError) {
          console.error('Error loading tab-based permissions:', permError);
        }
        
        permissionsToStore = permissions || [];
      }

      // Store user data with permissions
      const userDataWithPermissions = {
        id: staffData.id,
        name: staffData.full_name,
        email: staffData.email,
        phone: staffData.phone_number,
        role: staffData.role || 'Loan Officer', // Default role if not set
        userType: 'staff' as const,
        branch: staffData.branch_id,
        permissions: permissionsToStore,
        organizationId: staffData.organization_id,
        // Keep original staff fields for reference
        full_name: staffData.full_name,
        phone_number: staffData.phone_number,
        branch_id: staffData.branch_id,
        organization_id: staffData.organization_id,
        is_active: staffData.is_active,
        is_first_login: false,
        password_hash: newPassword,
        granular_permissions: staffData.granular_permissions,
      };

      // ❌ REMOVED: Don't set localStorage directly - let AuthContext handle it
      // localStorage.setItem('bvfunguo_user', JSON.stringify(userDataWithPermissions)); // Use bvfunguo_user key
      localStorage.setItem('is_authenticated', 'true');
      
      console.log('🟢 [PASSWORD_CHANGE] Calling onLoginSuccess after password change');
      toast.success('Password changed successfully! Welcome!');
      onLoginSuccess(userDataWithPermissions);
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        showDatabaseError('Database not reachable. Check your internet');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordChange && staffData) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #111120 50%, #000000 100%)'
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Your Password</h2>
            <p className="text-gray-600">
              Welcome, {staffData.full_name}! Please set a new password for your account.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing Password...' : 'Change Password & Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #111120 50%, #000000 100%)'
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Login</h2>
          <p className="text-gray-600">Login with your email or phone number</p>
        </div>

        <form onSubmit={handleStaffLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email or +254712345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default password is the last 4 digits of your phone number
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-500">Remember me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login as Staff'}
          </button>

          <button
            type="button"
            onClick={onBackToMain}
            className="w-full text-blue-600 py-2 text-sm hover:text-blue-700 transition-colors"
          >
            Back to Main Login
          </button>
        </form>
      </div>
    </div>
  );
}