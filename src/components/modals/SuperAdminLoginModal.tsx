import { useState } from 'react';
import { X, Shield, Eye, EyeOff } from 'lucide-react';

interface SuperAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function SuperAdminLoginModal({ isOpen, onClose, onLogin }: SuperAdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Super Admin credentials
    if (username === 'superadmin' && password === 'SuperAdmin@123') {
      onLogin();
      onClose();
    } else {
      setError('Invalid super admin credentials');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[300] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div 
        className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#0f1829', border: '1px solid rgba(59, 130, 246, 0.15)' }}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between" style={{ backgroundColor: '#0d1b2a', borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Shield className="size-6" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>Super Admin Access</h2>
              <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Restricted area - Authorized personnel only</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255, 255, 255, 0.7)', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8">
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2.5" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Username <span style={{ color: '#3b82f6' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3.5 rounded-lg text-sm transition-all focus:outline-none"
                style={{ 
                  backgroundColor: '#111120',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#ffffff'
                }}
                placeholder="Enter super admin username"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2.5" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Password <span style={{ color: '#3b82f6' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3.5 rounded-lg text-sm pr-12 transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: '#111120',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: '#ffffff'
                  }}
                  placeholder="Enter super admin password"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded hover:opacity-70 transition-opacity"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg font-semibold transition-all"
              style={{ 
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
              }}
            >
              Access Super Admin Panel
            </button>
          </div>
        </form>

        {/* Footer Warning */}
        <div className="px-8 py-4" style={{ backgroundColor: '#0a0f1a', borderTop: '1px solid rgba(59, 130, 246, 0.1)' }}>
          <div className="flex items-center justify-center gap-2">
            <Shield className="size-3.5" style={{ color: '#fbbf24' }} />
            <p className="text-xs" style={{ color: 'rgba(251, 191, 36, 0.8)' }}>
              All access attempts are logged and monitored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}