import { useState } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Briefcase, Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface IndividualSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (data: any) => void;
  onShowTerms?: () => void;
  onShowPrivacy?: () => void;
}

export function IndividualSignUpModal({ isOpen, onClose, onSignUp, onShowTerms, onShowPrivacy }: IndividualSignUpModalProps) {
  const { currentTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    location: '',
    occupation: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profilePicture) {
      alert('Please upload a profile picture');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    onSignUp({ ...formData, profilePicture });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          className="relative w-full max-w-2xl rounded-xl shadow-2xl border max-h-[90vh] overflow-y-auto"
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
                backgroundColor: currentTheme.colors.info + '20',
                color: currentTheme.colors.info
              }}>
                <User className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
                  Individual Registration
                </h2>
                <p className="text-sm mt-0.5" style={{ color: currentTheme.colors.textSecondary }}>
                  Create your personal lending account
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="size-28 rounded-full object-cover border-4" 
                        style={{ 
                          borderColor: currentTheme.colors.primary 
                        }}
                      />
                    ) : (
                      <div 
                        className="size-28 rounded-full border-4 flex items-center justify-center" 
                        style={{ 
                          backgroundColor: currentTheme.colors.hover,
                          borderColor: currentTheme.colors.border
                        }}
                      >
                        <User className="size-12" style={{ color: currentTheme.colors.textSecondary }} />
                      </div>
                    )}
                    <label 
                      htmlFor="profile-upload" 
                      className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
                      style={{ 
                        backgroundColor: currentTheme.colors.primary,
                        color: '#ffffff'
                      }}
                    >
                      <Camera className="size-4" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    Upload Profile Picture *
                  </p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: currentTheme.colors.inputBackground,
                        borderColor: currentTheme.colors.inputBorder,
                        color: currentTheme.colors.text
                      }}
                      placeholder="John"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
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
              </div>

              {/* Contact Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                    Email Address *
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
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                    Phone Number *
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

              {/* ID and Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                    National ID Number *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: currentTheme.colors.inputBackground,
                      borderColor: currentTheme.colors.inputBorder,
                      color: currentTheme.colors.text
                    }}
                    placeholder="12345678"
                    required
                  />
                </div>

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
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: currentTheme.colors.text }}>
                  Occupation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: currentTheme.colors.textSecondary }} />
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: currentTheme.colors.inputBackground,
                      borderColor: currentTheme.colors.inputBorder,
                      color: currentTheme.colors.text
                    }}
                    placeholder="e.g., Business Owner, Loan Officer"
                  />
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
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}