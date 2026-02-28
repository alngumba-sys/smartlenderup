import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Smartphone, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../lib/supabase';
import { logClientLogin } from '../utils/auditLogger';

interface ClientLoginProps {
  onLogin: (clientId: string) => void;
  onBack: () => void;
}

export function ClientLogin({ onLogin, onBack }: ClientLoginProps) {
  const { isDark } = useTheme();
  const { clients } = useData();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [matchedClient, setMatchedClient] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sent2FACode, setSent2FACode] = useState(false);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Normalize phone number - extract last 9 digits for Kenyan numbers
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      
      console.log('🔍 Looking for client with phone:', cleanedPhone);
      
      // Fetch client directly from Supabase instead of using DataContext
      // since DataContext requires authentication first
      const { data: allClients, error: fetchError } = await supabase
        .from('clients')
        .select('*');
      
      if (fetchError) {
        console.error('Error fetching clients:', fetchError);
        toast.error('Unable to connect to database. Please try again.');
        setLoading(false);
        return;
      }
      
      console.log('📋 Total clients in database:', allClients?.length || 0);
      
      // For Kenyan numbers, compare the last 9 digits
      // This handles: 0724314868, 254724314868, +254724314868
      const inputLast9 = cleanedPhone.slice(-9);
      
      const client = allClients?.find((c: any) => {
        const clientPhone = c.phone?.replace(/\D/g, '') || '';
        const clientLast9 = clientPhone.slice(-9);
        
        console.log(`  Comparing: ${inputLast9} vs ${clientLast9} (${c.first_name} ${c.last_name})`);
        
        // Match if last 9 digits are the same OR full numbers match
        return clientLast9 === inputLast9 || clientPhone === cleanedPhone;
      });

      if (!client) {
        console.log('❌ No client found matching phone:', cleanedPhone);
        toast.error('Client not found. Please check your phone number.');
        setLoading(false);
        return;
      }
      
      console.log('✅ Found client:', client.first_name, client.last_name);

      // Get last 4 digits for default password
      const clientPhoneDigits = client.phone.replace(/\D/g, '');
      const lastFourDigits = clientPhoneDigits.slice(-4);

      // Check if client has a password set in Supabase
      let clientData = null;
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('client_password, has_changed_password, requires_2fa')
          .eq('id', client.id)
          .single();
        
        // If column doesn't exist (42703), proceed without 2FA
        if (error && error.code === '42703') {
          console.warn('⚠️ 2FA columns not yet added to database. Run /database/ADD_2FA_SECURITY_COLUMNS.sql');
          // Fetch without requires_2fa column
          const { data: basicData } = await supabase
            .from('clients')
            .select('client_password, has_changed_password')
            .eq('id', client.id)
            .single();
          clientData = basicData;
        } else if (error && error.code !== 'PGRST116') {
          console.error('Error checking client password:', error);
          toast.error('An error occurred. Please try again.');
          setLoading(false);
          return;
        } else {
          clientData = data;
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('An error occurred. Please try again.');
        setLoading(false);
        return;
      }

      // If no password or hasn't changed password, check if they used default password (last 4 digits)
      if (!clientData?.client_password || !clientData?.has_changed_password) {
        console.log('🔐 First time login - default password is:', lastFourDigits);
        // First time login - check if password matches last 4 digits
        if (password === lastFourDigits) {
          setIsFirstLogin(true);
          // Convert Supabase client to frontend format
          setMatchedClient({
            id: client.id,
            name: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
            phone: client.phone
          });
          toast.info('Please set your new password');
        } else {
          toast.error(`Default password is the last 4 digits of your phone: ${lastFourDigits}`);
        }
      } else {
        // Verify password
        if (password === clientData.client_password) {
          // Check if 2FA is required (only if column exists)
          if (clientData?.requires_2fa) {
            setRequires2FA(true);
            setMatchedClient({
              id: client.id,
              name: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
              phone: client.phone
            });
            // Send 2FA code via SMS (mock for now)
            toast.info('Verification code sent to your phone');
            setSent2FACode(true);
            // In production, call SMS API here
          } else {
            // No 2FA required, login directly
            const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
            toast.success(`Welcome back, ${clientName}!`);
            onLogin(client.id);
          }
        } else {
          toast.error('Incorrect password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Update password in Supabase
      const { error } = await supabase
        .from('clients')
        .update({ 
          client_password: newPassword,
          has_changed_password: true
        })
        .eq('id', matchedClient.id);

      if (error) throw error;

      toast.success('Password set successfully! Logging you in...');
      onLogin(matchedClient.id);
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Verify 2FA code here
      // For demonstration, we'll just check if the code is '123456'
      if (verificationCode === '123456') {
        toast.success('2FA verification successful!');
        onLogin(matchedClient.id);
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Failed to verify 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isFirstLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="size-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h2>
            <p className="text-gray-600">Welcome, {matchedClient?.name}!</p>
            <p className="text-sm text-gray-500 mt-1">Please create a new password for your account</p>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting Password...' : 'Set Password & Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFirstLogin(false);
                setMatchedClient(null);
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (requires2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="size-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">2FA Verification</h2>
            <p className="text-gray-600">Enter the verification code sent to your phone</p>
          </div>

          <form onSubmit={handle2FAVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                {sent2FACode ? 'Code sent successfully' : 'Send code'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setMatchedClient(null);
                setVerificationCode('');
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">Back to Main Login</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="size-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Portal</h2>
          <p className="text-gray-600">Login with your phone number</p>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPhoneNumber(value);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0724314868"
              required
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your registered phone number
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default password is the last 4 digits of your registered phone number
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your loan officer
          </p>
        </div>
      </div>
    </div>
  );
}