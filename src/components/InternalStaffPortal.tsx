import { useState, useEffect, useRef } from 'react';
import { LoanCalculatorTab } from './tabs/LoanCalculatorTab';
import { LoanApprovalWorkflow } from './LoanApprovalWorkflow';
// import { TrialBanner } from './TrialBanner'; // DISABLED: Trial system temporarily disabled
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { canViewTab, canEditInTab, canCreateInTab, canDeleteInTab } from '../utils/staffPermissions';
import { PermissionsDebugPanel } from './PermissionsDebugPanel';
import { DashboardTab } from './tabs/DashboardTab';
import { ClientsTabRedesigned as ClientsTab } from './tabs/ClientsTabRedesigned';
import { InstitutionsTab } from './tabs/InstitutionsTab';
import { LoansTab } from './tabs/LoansTab';
import { ApprovalsTab } from './tabs/ApprovalsTab';
import { Approval2Tab } from './tabs/Approval2Tab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { CollectionSheetsTab } from './tabs/CollectionSheetsTab';
import { CreditScoringTab } from './tabs/CreditScoringTab';
import { AIInsightsTab } from './tabs/AIInsightsTab';
import { SMSCampaignsTab } from './tabs/SMSCampaignsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { ReportsTab } from './tabs/ReportsTab';
import { ReconcileTab } from './tabs/ReconcileTab';
import { TasksTab } from './tabs/TasksTab';
import { KYCTab } from './tabs/KYCTab';
import { DocumentManagementTab } from './tabs/DocumentManagementTab';
import { AuditTrailTab } from './tabs/AuditTrailTab';
import { TicketsTab } from './tabs/TicketsTab';
import { StaffManagementTab } from './tabs/StaffManagementTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AccountingTab } from './tabs/AccountingTab';
import { LoanProductsTab } from './tabs/LoanProductsTab';
import { ExpensesTab } from './tabs/ExpensesTab';
import { PayrollTab } from './tabs/PayrollTab';
import { LoanReconciliationTab } from './tabs/LoanReconciliationTab';
import { FinancialStatementsTab } from './tabs/FinancialStatementsTab';
import { 
  LayoutDashboard, Users, DollarSign, CreditCard, TrendingUp, 
  Settings, FileText, Calculator, CheckSquare, Briefcase, 
  PiggyBank, Bell, Calendar, Shield, Book, BarChart3, 
  ChevronDown, X, UserCog, MessagesSquare, Send, Award,
  FileCheck, Grid3x3, ClipboardList, Target, Brain, Banknote,
  Receipt, BookOpen, FolderOpen, Package, Headphones, GitBranch
} from 'lucide-react';

interface InternalStaffPortalProps {
  onClientSelect: (clientId: string) => void;
  triggerTab?: string | null;
}

export function InternalStaffPortal({ onClientSelect, triggerTab }: InternalStaffPortalProps) {
  const navigation = useNavigation();
  // Use activeTab from NavigationContext instead of local state
  const activeTab = navigation.activeTab || 'dashboard'; // Ensure always has a value
  const setActiveTab = navigation.setActiveTab;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { hasPermission, currentUser } = useAuth();



  // Handle tab trigger from header
  useEffect(() => {
    if (triggerTab) {
      setActiveTab(triggerTab);
    }
  }, [triggerTab, setActiveTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideNav = navRef.current && !navRef.current.contains(target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      
      if (isOutsideNav && isOutsideDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      type: 'single' as const,
      tabKey: 'dashboard' as const
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: LayoutDashboard,
      type: 'dropdown' as const,
      items: [
        { id: 'clients', label: 'Clients', icon: Users, tabKey: 'operations_clients' as const },
        { id: 'loans', label: 'Loans', icon: DollarSign, tabKey: 'operations_loans' as const },
        { id: 'loan-calculator', label: 'Loan Calculator', icon: Calculator, tabKey: 'operations_loans' as const },
        { id: 'approval1', label: 'Approval', icon: GitBranch, tabKey: 'operations_loans' as const },
        { id: 'loan-reconciliation', label: 'Loan Reconciliation', icon: FileCheck, tabKey: 'accounting_journal' as const }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      type: 'dropdown' as const,
      items: [
        { id: 'payments', label: 'Payments & Collections', icon: CreditCard, tabKey: 'operations_loans' as const },
        { id: 'collection-sheets', label: 'Collection Sheets', icon: FileText, tabKey: 'reports_collections' as const }
      ]
    },
    {
      id: 'risk',
      label: 'Risk & AI',
      icon: Brain,
      type: 'dropdown' as const,
      items: [
        { id: 'credit-scoring', label: 'Credit Scoring', icon: Target, tabKey: 'ai_tools' as const },
        { id: 'ai-insights', label: 'AI Insights', icon: Brain, tabKey: 'ai_tools' as const }
      ]
    },
    {
      id: 'management',
      label: 'Management',
      icon: BarChart3,
      type: 'dropdown' as const,
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, tabKey: 'reports_management' as const },
        { id: 'reconcile', label: 'Reconcile', icon: FileCheck, tabKey: 'reports_management' as const },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, tabKey: 'dashboard' as const },
        { id: 'payroll', label: 'Payroll', icon: Banknote, tabKey: 'payroll' as const },
        { id: 'expenses', label: 'Expenses', icon: Receipt, tabKey: 'accounting_journal' as const },
        { id: 'accounting', label: 'Accounting', icon: BookOpen, tabKey: 'accounting_chart' as const }
      ]
    },
    {
      id: 'documents-management',
      label: 'Documents',
      icon: FolderOpen,
      type: 'dropdown' as const,
      items: [
        { id: 'compliance', label: 'Document Management', icon: FolderOpen, tabKey: 'settings' as const },
        { id: 'kyc', label: 'KYC Verification', icon: FileCheck, tabKey: 'settings' as const },
        { id: 'audit-trail', label: 'Audit Trail', icon: Shield, tabKey: 'settings' as const }
      ]
    },
    {
      id: 'administration',
      label: 'Admin',
      icon: Settings,
      type: 'dropdown' as const,
      items: [
        { id: 'staff-management', label: 'Staff Management', icon: Users, tabKey: 'settings' as const },
        { id: 'loan-products', label: 'Loan Products', icon: Package, tabKey: 'operations_products' as const },
        { id: 'financial-statements', label: 'Financial Statements', icon: TrendingUp, tabKey: 'accounting_trial' as const },
        { id: 'documents', label: 'Documents', icon: FileText, tabKey: 'settings' as const },
        { id: 'settings', label: 'Settings', icon: Settings, tabKey: 'settings' as const }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: Headphones,
      type: 'single' as const,
      linkedTab: 'tickets',
      tabKey: 'settings' as const
    }
  ];

  // Filter menu items based on tab permissions using canViewTab
  const filteredMenuItems = menuItems.filter(item => {
    // For single items, check tab permission
    if (item.type === 'single') {
      if (item.tabKey) {
        return canViewTab(item.tabKey);
      }
      return true; // Show if no tabKey (shouldn't happen)
    }
    
    // For dropdown items, filter sub-items
    if (item.type === 'dropdown' && item.items) {
      const filteredSubItems = item.items.filter(subItem => {
        if (subItem.tabKey) {
          return canViewTab(subItem.tabKey);
        }
        return false;
      });
      
      // Only show dropdown if it has accessible sub-items
      if (filteredSubItems.length === 0) {
        return false;
      }
      
      // Update items with filtered list
      (item as any).filteredItems = filteredSubItems;
      return true;
    }
    
    return false; // Hide if unknown type
  });

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.type === 'single') {
      const tabToActivate = item.linkedTab || item.id;
      setActiveTab(tabToActivate);
      setOpenDropdown(null);
    } else {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    }
  };

  const handleDropdownItemClick = (tabId: string) => {
    setActiveTab(tabId);
    setOpenDropdown(null);
  };

  const isActiveGroup = (item: typeof menuItems[0]) => {
    if (item.type === 'single') {
      const linkedTab = item.linkedTab || item.id;
      return activeTab === linkedTab;
    }
    return item.items?.some(subItem => subItem.id === activeTab);
  };

  const { currentTheme, isDark } = useTheme();

  return (
    <div 
      className={`min-h-screen flex flex-col overflow-hidden transition-colors ${isDark ? 'dark' : ''}`} 
      style={{ 
        background: isDark 
          ? 'radial-gradient(ellipse at top left, #6b5b2a 0%, #4a3f1a 15%, #2d3748 35%, #1a2942 60%), radial-gradient(ellipse at bottom right, #1e2836 0%, #15233a 25%, #0d1b2a 50%, #0a1628 75%), radial-gradient(circle at center, #4a3f1a 0%, transparent 40%), linear-gradient(135deg, #2d3748 0%, #1a2942 20%, #4a3f1a 35%, #6b5b2a 45%, #15233a 60%, #0d1b2a 75%, #1e2836 90%, #0a1628 100%)'
          : '#f9fafb',
        backgroundBlendMode: isDark ? 'overlay, multiply, soft-light, normal' : 'normal'
      }}
    >
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6" style={{ backgroundColor: 'transparent' }}>
        {/* Trial Banner - DISABLED: Trial system temporarily disabled */}
        {/* {currentUser && currentUser.organizationId && (
          <TrialBanner organizationId={currentUser.organizationId} />
        )} */}
        
        {/* 🐛 DEBUG: Show what tab is currently active */}
        <div className="hidden">
          Current active tab: {activeTab}
        </div>
        
        {/* All tab contents - conditionally rendered to prevent chart dimension errors */}
        {activeTab === 'dashboard' && <DashboardTab onNavigate={setActiveTab} />}
        
        {activeTab === 'clients' && <ClientsTab onClientSelect={onClientSelect} />}
        
        {activeTab === 'institutions' && <InstitutionsTab />}
        
        {activeTab === 'loans' && <LoansTab />}
        
        {activeTab === 'loan-calculator' && <LoanCalculatorTab />}
        
        {activeTab === 'approvals' && <ApprovalsTab />}
        
        {activeTab === 'approval1' && <LoanApprovalWorkflow />}
        
        {activeTab === 'approval2' && <Approval2Tab />}
        
        {activeTab === 'loan-reconciliation' && <LoanReconciliationTab />}
        
        {activeTab === 'payments' && <PaymentsTab />}
        
        {activeTab === 'collection-sheets' && <CollectionSheetsTab />}
        
        {activeTab === 'credit-scoring' && <CreditScoringTab />}
        
        {activeTab === 'ai-insights' && <AIInsightsTab />}
        
        {activeTab === 'sms-campaigns' && <SMSCampaignsTab />}
        
        {activeTab === 'notifications' && <NotificationsTab />}
        
        {activeTab === 'reports' && <ReportsTab />}
        
        {activeTab === 'reconcile' && <ReconcileTab />}
        
        {activeTab === 'tasks' && <TasksTab />}
        
        {activeTab === 'kyc' && <KYCTab />}
        
        {activeTab === 'compliance' && <DocumentManagementTab />}
        
        {activeTab === 'audit-trail' && <AuditTrailTab />}
        
        {activeTab === 'tickets' && <TicketsTab />}
        
        {activeTab === 'staff-management' && <StaffManagementTab />}
        
        {activeTab === 'documents' && <DocumentsTab />}
        
        {activeTab === 'settings' && <SettingsTab />}
        
        {activeTab === 'accounting' && <AccountingTab />}
        
        {activeTab === 'loan-products' && <LoanProductsTab />}
        
        {activeTab === 'expenses' && <ExpensesTab />}
        
        {activeTab === 'payroll' && <PayrollTab />}
        
        {activeTab === 'financial-statements' && <FinancialStatementsTab />}
        
        {/* 🐛 FALLBACK: Show dashboard if no tab matches */}
        {!['dashboard', 'clients', 'institutions', 'loans', 'loan-calculator', 'approvals', 'approval1', 'approval2', 
            'loan-reconciliation', 'payments', 'collection-sheets', 'credit-scoring', 'ai-insights', 'sms-campaigns', 
            'notifications', 'reports', 'reconcile', 'tasks', 'kyc', 'compliance', 'audit-trail', 'tickets', 'staff-management', 
            'documents', 'settings', 'accounting', 'loan-products', 'expenses', 'payroll', 'financial-statements'].includes(activeTab) && (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-4">Unknown tab: "{activeTab}"</p>
            <p className="text-gray-600 mb-4">Falling back to dashboard...</p>
            <DashboardTab onNavigate={setActiveTab} />
          </div>
        )}
      </div>

      {/* 🔒 DEBUG: Permissions Debug Panel - Remove in production */}
    </div>
  );
}