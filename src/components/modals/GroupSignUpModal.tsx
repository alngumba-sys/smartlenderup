import { useState } from 'react';
import { X, Users, Mail, Phone, Lock, Eye, EyeOff, MapPin, Calendar, Hash } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface GroupSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (data: any) => void;
  onShowTerms?: () => void;
  onShowPrivacy?: () => void;
}

export function GroupSignUpModal({ isOpen, onClose, onSignUp, onShowTerms, onShowPrivacy }: GroupSignUpModalProps) {
  const { currentTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    groupName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    location: '',
    numberOfMembers: '',
    foundedYear: '',
    groupType: 'investment-club',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    onSignUp(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="relative w-full max-w-4xl rounded-xl shadow-2xl border max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 py-4 border-b" style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border
          }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:opacity-80"
              style={{ 
                color: currentTheme.colors.textSecondary,
                backgroundColor: currentTheme.colors.hover
              }}
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{
                backgroundColor: currentTheme.colors.secondary + '20',
                color: currentTheme.colors.secondary
              }}>
                <Users className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                  Group Registration
                </h2>
                <p className="text-sm mt-0.5" style={{ color: currentTheme.colors.textSecondary }}>
                  Register your lending group or investment club
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Group Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
                  Group Information
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Group Name *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="text"
                          name="groupName"
                          value={formData.groupName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="Community Investment Club"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Registration Number
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Group Type *
                      </label>
                      <select
                        name="groupType"
                        value={formData.groupType}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                        style={{
                          backgroundColor: currentTheme.colors.inputBackground,
                          borderColor: currentTheme.colors.inputBorder,
                          color: currentTheme.colors.text
                        }}
                        required
                      >
                        <option value="investment-club">Investment Club</option>
                        <option value="savings-group">Savings Group</option>
                        <option value="lending-circle">Lending Circle</option>
                        <option value="chama">Chama</option>
                        <option value="cooperative">Cooperative</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Number of Members *
                      </label>
                      <input
                        type="number"
                        name="numberOfMembers"
                        value={formData.numberOfMembers}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                        style={{
                          backgroundColor: currentTheme.colors.inputBackground,
                          borderColor: currentTheme.colors.inputBorder,
                          color: currentTheme.colors.text
                        }}
                        placeholder="e.g., 15"
                        min="2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Group Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="group@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Group Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="+254 712 345 678"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="Nairobi, Kenya"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Year Founded *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="number"
                          name="foundedYear"
                          value={formData.foundedYear}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="2024"
                          min="1900"
                          max={new Date().getFullYear()}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Administrator Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
                  Group Administrator (Primary Contact)
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="adminFirstName"
                        value={formData.adminFirstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                        style={{
                          backgroundColor: currentTheme.colors.inputBackground,
                          borderColor: currentTheme.colors.inputBorder,
                          color: currentTheme.colors.text
                        }}
                        placeholder="John"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="adminLastName"
                        value={formData.adminLastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                        style={{
                          backgroundColor: currentTheme.colors.inputBackground,
                          borderColor: currentTheme.colors.inputBorder,
                          color: currentTheme.colors.text
                        }}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Admin Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="email"
                          name="adminEmail"
                          value={formData.adminEmail}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Admin Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type="tel"
                          name="adminPhone"
                          value={formData.adminPhone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="+254 712 345 678"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                          style={{
                            backgroundColor: currentTheme.colors.inputBackground,
                            borderColor: currentTheme.colors.inputBorder,
                            color: currentTheme.colors.text
                          }}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 size-4 rounded"
                  style={{ accentColor: currentTheme.colors.primary }}
                  required
                />
                <label htmlFor="agreeToTerms" className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  I agree to the <a href="#" className="font-medium hover:underline" style={{ color: currentTheme.colors.primary }} onClick={(e) => { e.preventDefault(); onShowTerms?.(); }}>Terms of Service</a> and <a href="#" className="font-medium hover:underline" style={{ color: currentTheme.colors.primary }} onClick={(e) => { e.preventDefault(); onShowPrivacy?.(); }}>Privacy Policy</a>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border font-medium transition-colors hover:opacity-80"
                style={{
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                Register Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}