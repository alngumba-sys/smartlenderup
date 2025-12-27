import { createContext, useContext, useState, ReactNode } from 'react';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [selectedSavingsId, setSelectedSavingsId] = useState<string | null>(null);

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