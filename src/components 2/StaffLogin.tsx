import React, { useState, useEffect } from 'react';
import { Key, Phone, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner@2.0.3';
import { getOrganizationId } from '../utils/organizationUtils';

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

      // Load permissions
      const { data: permissions, error: permError } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('staff_user_id', staffUser.id);

      if (permError) {
        console.error('Error loading permissions:', permError);
      }

      // Store user data with permissions
      const userDataWithPermissions = {
        ...staffUser,
        permissions: permissions || [],
        userType: 'staff', // Changed from user_type to userType to match AuthContext
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

      localStorage.setItem('bvfunguo_user', JSON.stringify(userDataWithPermissions)); // Use bvfunguo_user key
      localStorage.setItem('is_authenticated', 'true');
      
      toast.success(`Welcome back, ${staffUser.full_name}!`);
      onLoginSuccess(userDataWithPermissions);
    } catch (error: any) {
      console.error('Error during staff login:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Database not reachable. Check your internet');
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

      // Load permissions
      const { data: permissions, error: permError } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('staff_user_id', staffData.id);

      if (permError) {
        console.error('Error loading permissions:', permError);
      }

      // Store user data with permissions
      const userDataWithPermissions = {
        ...staffData,
        password_hash: newPassword,
        is_first_login: false,
        permissions: permissions || [],
        userType: 'staff', // Changed from user_type to userType to match AuthContext
      };

      localStorage.setItem('bvfunguo_user', JSON.stringify(userDataWithPermissions)); // Use bvfunguo_user key
      localStorage.setItem('is_authenticated', 'true');
      
      toast.success('Password changed successfully! Welcome!');
      onLoginSuccess(userDataWithPermissions);
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Database not reachable. Check your internet');
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