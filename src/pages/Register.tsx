import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Building2, Mail, Lock, Globe, DollarSign, Phone, MapPin, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RegisterPageProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function RegisterPage({ onSuccess, onBackToLogin }: RegisterPageProps) {
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'mother_company',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Kenya',
    currency: 'KES',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Test Supabase connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('❌ Supabase connection test failed:', error);
          setIsSupabaseConnected(false);
        } else {
          console.log('✅ Supabase connected successfully');
          setIsSupabaseConnected(true);
        }
      } catch (err) {
        console.error('❌ Network error testing Supabase:', err);
        setIsSupabaseConnected(false);
      } finally {
        setTestingConnection(false);
      }
    };

    testConnection();
  }, []);

  const countryOptions = [
    { code: 'Kenya', currency: 'KES', name: 'Kenya' },
    { code: 'Uganda', currency: 'UGX', name: 'Uganda' },
    { code: 'Tanzania', currency: 'TZS', name: 'Tanzania' },
    { code: 'Rwanda', currency: 'RWF', name: 'Rwanda' },
    { code: 'Burundi', currency: 'BIF', name: 'Burundi' },
    { code: 'South Sudan', currency: 'SSP', name: 'South Sudan' },
    { code: 'Ethiopia', currency: 'ETB', name: 'Ethiopia' },
    { code: 'Somalia', currency: 'SOS', name: 'Somalia' },
    { code: 'Nigeria', currency: 'NGN', name: 'Nigeria' },
    { code: 'Ghana', currency: 'GHS', name: 'Ghana' },
    { code: 'South Africa', currency: 'ZAR', name: 'South Africa' },
    { code: 'Zimbabwe', currency: 'ZWL', name: 'Zimbabwe' },
    { code: 'Zambia', currency: 'ZMW', name: 'Zambia' },
    { code: 'Malawi', currency: 'MWK', name: 'Malawi' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Check Supabase connection BEFORE attempting registration
    if (!isSupabaseConnected) {
      toast.error('Database not reachable. Check your internet', {
        description: 'Cannot create organization without database connection',
        duration: 6000,
      });
      return;
    }

    setLoading(true);

    try {
      // Generate organization ID and username
      const organizationId = crypto.randomUUID();
      const username = Math.random().toString(36).substr(2, 4).toUpperCase();

      const now = new Date().toISOString();
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days free trial

      // Prepare organization data (ONLY columns that exist in database)
      const orgData = {
        id: organizationId,
        organization_name: formData.organizationName,
        organization_type: formData.organizationType,
        country: formData.country,
        currency: formData.currency,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || null,
        password_hash: formData.password, // In production, this should be hashed
        username: username,
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        subscription_status: 'trial',
        status: 'active',
        created_at: now,
        updated_at: now,
      };

      console.log('📝 Creating organization in Supabase:', orgData.organization_name);

      // Insert into Supabase - THIS IS THE ONLY SOURCE OF TRUTH
      const { data, error } = await supabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        
        // Check for specific error types
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Database not reachable. Check your internet');
        }
        
        if (error.code === '23505') {
          throw new Error('An organization with this email already exists');
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      console.log('✅ Organization created successfully:', data);

      // Show success message
      toast.success('Organization Created Successfully!', {
        description: `Welcome to SmartLenderUp! Your 14-day trial has started.`,
        duration: 5000,
      });

      // Store minimal session data for login redirect
      sessionStorage.setItem('new_registration', JSON.stringify({
        email: formData.email,
        organizationName: formData.organizationName,
        username: username,
      }));

      // Call success callback after short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Network/Connection errors
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('Database not reachable')) {
        toast.error('Database not reachable. Check your internet', {
          description: 'Please check your internet connection and try again',
          duration: 6000,
        });
      } else {
        // Other errors
        toast.error('Registration Failed', {
          description: error.message || 'Failed to create organization. Please try again.',
          duration: 6000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countryOptions.find(c => c.code === countryCode);
    if (country) {
      setFormData(prev => ({
        ...prev,
        country: country.code,
        currency: country.currency,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundColor: '#111120',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(45, 55, 72, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(66, 153, 225, 0.15) 0%, transparent 50%)',
    }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2" style={{ color: '#e1e8f0' }}>
            Create Organization Account
          </h1>
          <p className="text-sm" style={{ color: '#8a99ab' }}>
            Start your 14-day free trial • No credit card required
          </p>
        </div>

        {/* Connection Status Warning */}
        {testingConnection && (
          <div className="mb-6 p-4 rounded-lg border flex items-center gap-3" style={{
            backgroundColor: 'rgba(66, 153, 225, 0.1)',
            borderColor: 'rgba(66, 153, 225, 0.3)',
          }}>
            <Loader2 className="size-5 animate-spin" style={{ color: '#4299e1' }} />
            <p style={{ color: '#4299e1' }}>Testing database connection...</p>
          </div>
        )}

        {!testingConnection && !isSupabaseConnected && (
          <div className="mb-6 p-4 rounded-lg border flex items-start gap-3" style={{
            backgroundColor: 'rgba(245, 101, 101, 0.1)',
            borderColor: 'rgba(245, 101, 101, 0.3)',
          }}>
            <AlertCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: '#f56565' }} />
            <div>
              <p className="font-medium mb-1" style={{ color: '#f56565' }}>
                Database not reachable
              </p>
              <p className="text-sm" style={{ color: '#fc8181' }}>
                Please check your internet connection. Registration requires an active database connection.
              </p>
            </div>
          </div>
        )}

        {!testingConnection && isSupabaseConnected && (
          <div className="mb-6 p-4 rounded-lg border flex items-center gap-3" style={{
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            borderColor: 'rgba(72, 187, 120, 0.3)',
          }}>
            <div className="size-2 rounded-full" style={{ backgroundColor: '#48bb78' }} />
            <p className="text-sm" style={{ color: '#48bb78' }}>
              Database connected • Ready to register
            </p>
          </div>
        )}

        {/* Registration Form */}
        <div className="rounded-xl border p-8" style={{
          backgroundColor: '#1a1b2e',
          borderColor: '#2d3748',
        }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                <Building2 className="inline size-4 mr-2" />
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: '#111120',
                  borderColor: errors.organizationName ? '#f56565' : '#2d3748',
                  color: '#e1e8f0',
                }}
                placeholder="Enter your organization name"
                disabled={loading}
              />
              {errors.organizationName && (
                <p className="text-sm mt-1" style={{ color: '#f56565' }}>{errors.organizationName}</p>
              )}
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                Organization Type *
              </label>
              <select
                value={formData.organizationType}
                onChange={(e) => handleInputChange('organizationType', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: '#111120',
                  borderColor: '#2d3748',
                  color: '#e1e8f0',
                }}
                disabled={loading}
              >
                <option value="mother_company">Mother Company</option>
                <option value="branch">Branch</option>
                <option value="chama">Chama / Investment Group</option>
              </select>
            </div>

            {/* Country & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                  <Globe className="inline size-4 mr-2" />
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                  style={{
                    backgroundColor: '#111120',
                    borderColor: '#2d3748',
                    color: '#e1e8f0',
                  }}
                  disabled={loading}
                >
                  {countryOptions.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                  <DollarSign className="inline size-4 mr-2" />
                  Currency *
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border outline-none"
                  style={{
                    backgroundColor: '#0f1018',
                    borderColor: '#2d3748',
                    color: '#8a99ab',
                  }}
                  disabled
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                <Mail className="inline size-4 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: '#111120',
                  borderColor: errors.email ? '#f56565' : '#2d3748',
                  color: '#e1e8f0',
                }}
                placeholder="organization@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: '#f56565' }}>{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                <Phone className="inline size-4 mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: '#111120',
                  borderColor: errors.phone ? '#f56565' : '#2d3748',
                  color: '#e1e8f0',
                }}
                placeholder="+254 XXX XXX XXX"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm mt-1" style={{ color: '#f56565' }}>{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                <MapPin className="inline size-4 mr-2" />
                Address (Optional)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: '#111120',
                  borderColor: '#2d3748',
                  color: '#e1e8f0',
                }}
                placeholder="Enter your organization address"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                <Lock className="inline size-4 mr-2" />
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: '#111120',
                  borderColor: errors.password ? '#f56565' : '#2d3748',
                  color: '#e1e8f0',
                }}
                placeholder="Enter password (min. 6 characters)"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm mt-1" style={{ color: '#f56565' }}>{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#e1e8f0' }}>
                <Lock className="inline size-4 mr-2" />
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: '#111120',
                  borderColor: errors.confirmPassword ? '#f56565' : '#2d3748',
                  color: '#e1e8f0',
                }}
                placeholder="Re-enter your password"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-sm mt-1" style={{ color: '#f56565' }}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onBackToLogin}
                className="flex-1 px-6 py-3 rounded-lg border transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#2d3748',
                  color: '#8a99ab',
                }}
                disabled={loading}
              >
                <ArrowLeft className="size-4" />
                Back to Login
              </button>

              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSupabaseConnected ? '#4299e1' : '#2d3748',
                  color: '#ffffff',
                }}
                disabled={loading || !isSupabaseConnected}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-6" style={{ color: '#8a99ab' }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
