import { X, CheckCircle, Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface OrganizationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  loginEmail: string;
}

export function OrganizationSuccessModal({ isOpen, onClose, organizationName, loginEmail }: OrganizationSuccessModalProps) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-full p-2">
              <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h2 className="text-white font-bold">Organization Created Successfully!</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="size-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2 text-center">
              Your organization <span className="font-semibold text-emerald-600 dark:text-emerald-400">{organizationName}</span> has been successfully registered!
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                Your login email:
              </p>
              <p className="text-center font-semibold text-blue-700 dark:text-blue-400">
                {loginEmail}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-1.5 mt-0.5">
                <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">What's Next?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the email and password you provided during registration to log in
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-1.5 mt-0.5">
                <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Get Started</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up your loan products, add clients, and start managing your microfinance operations
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="size-5" />
            Got it! Let's Login
          </button>
        </div>
      </div>
    </div>
  );
}