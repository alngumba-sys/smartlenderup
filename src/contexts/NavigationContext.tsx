import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getFirstVisibleTabRoute } from '../utils/staffPermissions';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigateToClient: (clientId: string) => void;
  navigateToLoan: (loanId: string) => void;
  navigateToApproval: (approvalId: string) => void;
  navigateToSavings: (savingsId: string) => void;
  selectedClientId: string | null;
  selectedLoanId: string | null;
  selectedApprovalId: string | null;
  selectedSavingsId: string | null;
  clearSelection: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  // Initialize with the first visible tab based on permissions
  const [activeTab, setActiveTab] = useState(() => {
    // Debug: Check localStorage state during initialization
    const userData = localStorage.getItem('bvfunguo_user');
    console.log('🎯 NavigationProvider: Initializing...');
    console.log('🎯 NavigationProvider: User data exists?', !!userData);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('🎯 NavigationProvider: User:', user.name, user.role, user.userType);
        console.log('🎯 NavigationProvider: Permissions:', user.permissions);
      } catch (e) {
        console.error('🎯 NavigationProvider: Error parsing user:', e);
      }
    }
    
    const firstTab = getFirstVisibleTabRoute();
    console.log('🎯 NavigationProvider: Setting initial tab to', firstTab);
    // Ensure we always have a valid tab - default to 'dashboard' if empty
    return firstTab || 'dashboard';
  });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [selectedSavingsId, setSelectedSavingsId] = useState<string | null>(null);

  // Update active tab when user logs in (permissions change)
  useEffect(() => {
    const handleStorageChange = () => {
      const firstTab = getFirstVisibleTabRoute();
      console.log('🔄 User permissions changed, updating tab to', firstTab);
      setActiveTab(firstTab || 'dashboard');
    };

    // Listen for storage changes (when user logs in/out)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const navigateToClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab('clients');
  };

  const navigateToLoan = (loanId: string) => {
    setSelectedLoanId(loanId);
    setActiveTab('loans');
  };

  const navigateToApproval = (approvalId: string) => {
    setSelectedApprovalId(approvalId);
    setActiveTab('approvals');
  };

  const navigateToSavings = (savingsId: string) => {
    setSelectedSavingsId(savingsId);
    setActiveTab('savings');
  };

  const clearSelection = () => {
    setSelectedClientId(null);
    setSelectedLoanId(null);
    setSelectedApprovalId(null);
    setSelectedSavingsId(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        navigateToClient,
        navigateToLoan,
        navigateToApproval,
        navigateToSavings,
        selectedClientId,
        selectedLoanId,
        selectedApprovalId,
        selectedSavingsId,
        clearSelection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}