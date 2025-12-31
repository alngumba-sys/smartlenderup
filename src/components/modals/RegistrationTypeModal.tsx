import { X, Building2, User, Users, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';

interface RegistrationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'organization' | 'individual' | 'group') => void;
}

export function RegistrationTypeModal({ isOpen, onClose, onSelectType }: RegistrationTypeModalProps) {
  const { currentTheme, isDark } = useTheme();
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  if (!isOpen) return null;

  const registrationTypes = [
    {
      type: 'organization' as const,
      icon: <Building2 className="size-7" />,
      title: 'Organization',
      description: 'For SACCOs, MFIs, Credit Unions, and Community Banks. Manage branches and users with advanced reporting.',
      iconColor: '#ec7347', // Orange
      buttonColor: '#ec7347'
    },
    {
      type: 'individual' as const,
      icon: <User className="size-7" />,
      title: 'Individual',
      description: 'For individual lenders or loan officers. Personal dashboard with client management and loan tracking.',
      iconColor: '#4a90e2', // Blue
      buttonColor: '#4a90e2'
    },
    {
      type: 'group' as const,
      icon: <Users className="size-7" />,
      title: 'Group',
      description: 'For informal lending groups or investment clubs. Member management with group contributions and shared loans.',
      iconColor: '#50c878', // Green
      buttonColor: '#50c878'
    }
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="relative w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <button
              onClick={onClose}
              className="absolute -top-2 right-0 p-1.5 rounded-full transition-all hover:opacity-80 hover:rotate-90 duration-300"
              style={{ 
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <X className="size-4" />
            </button>
            <h2 className="text-xl font-semibold mb-1.5 text-white">
              Choose Your Account Type
            </h2>
            <p className="text-sm text-white opacity-90">
              Select the option that best describes your lending operation
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {registrationTypes.map((regType) => (
              <div
                key={regType.type}
                onMouseEnter={() => setHoveredType(regType.type)}
                onMouseLeave={() => setHoveredType(null)}
                className="h-[16em] border-2 rounded-[1.2em] p-5 flex flex-col transition-all duration-300 cursor-pointer bg-gray-900/50 dark:bg-gray-800/50 backdrop-blur-sm"
                style={{
                  borderColor: hoveredType === regType.type ? regType.iconColor : 'rgba(255, 255, 255, 0.15)',
                  transform: hoveredType === regType.type ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredType === regType.type ? `0 16px 32px rgba(0, 0, 0, 0.4)` : `0 4px 8px rgba(0, 0, 0, 0.2)`
                }}
                onClick={() => onSelectType(regType.type)}
              >
                {/* Icon */}
                <div 
                  className="p-2 rounded-lg transition-all duration-300 w-fit mb-3"
                  style={{
                    backgroundColor: `${regType.iconColor}20`,
                    color: regType.iconColor
                  }}
                >
                  {regType.icon}
                </div>

                {/* Title - Prominent Heading */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {regType.title}
                </h3>

                {/* Content - Flexible area that grows */}
                <div className="flex-1 mb-4">
                  <p className="text-xs leading-relaxed text-gray-300">
                    {regType.description}
                  </p>
                </div>

                {/* Button - Always at bottom */}
                <button
                  className="w-full px-4 py-2.5 border rounded-full flex justify-center items-center gap-2 group transition-all duration-200 hover:opacity-90 mt-auto"
                  style={{
                    borderColor: regType.buttonColor,
                    backgroundColor: regType.buttonColor,
                    color: '#ffffff'
                  }}
                >
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight 
                    className="size-4 group-hover:translate-x-[10%] transition-transform duration-300" 
                    strokeWidth={2}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-5 text-center">
            <p className="text-xs text-white opacity-80">
              Need help choosing? <a href="#" className="font-medium underline hover:opacity-80" style={{ color: currentTheme.colors.primary }}>Contact our sales team</a> for guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}