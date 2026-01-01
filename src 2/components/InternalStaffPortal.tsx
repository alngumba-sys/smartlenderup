import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, DollarSign, Calculator, CreditCard, Brain, BarChart3, Shield, Settings, Headphones, ChevronDown, FileText, Smartphone, Target, CheckSquare, Banknote, Receipt, BookOpen, FileCheck, Scale, Package, GitBranch, FolderOpen } from 'lucide-react';
import { DashboardTab } from './tabs/DashboardTab';
import { ClientsTab } from './tabs/ClientsTab';
import { LoansTab } from './tabs/LoansTab';
import { ApprovalsTab } from './tabs/ApprovalsTab';
import { Approval1Tab } from './tabs/Approval1Tab';
import { Approval2Tab } from './tabs/Approval2Tab';
import { LoanReconciliationTab } from './tabs/LoanReconciliationTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { MobileBankingTab } from './tabs/MobileBankingTab';
import { CreditScoringTab } from './tabs/CreditScoringTab';
import { AIInsightsTab } from './tabs/AIInsightsTab';
import { SMSCampaignsTab } from './tabs/SMSCampaignsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { ReportsTab } from './tabs/ReportsTab';
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
import { InvestorAccountsTab } from './tabs/InvestorAccountsTab';
import { CollectionSheetsTab } from './tabs/CollectionSheetsTab';
import { LoanCalculatorTab } from './tabs/LoanCalculatorTab';
import { LoanApprovalWorkflow } from './LoanApprovalWorkflow';
import { TrialBanner } from './TrialBanner';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';

interface InternalStaffPortalProps {
  onClientSelect: (clientId: string) => void;
  triggerTab?: string | null;
}

export function InternalStaffPortal({ onClientSelect, triggerTab }: InternalStaffPortalProps) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { hasPermission, currentUser } = useAuth();

  // Sync with NavigationContext
  useEffect(() => {
    if (navigation.activeTab !== activeTab) {
      setActiveTab(navigation.activeTab);
    }
  }, [navigation.activeTab]);

  // Handle tab trigger from header
  useEffect(() => {
    if (triggerTab) {
      setActiveTab(triggerTab);
      navigation.setActiveTab(triggerTab);
    }
  }, [triggerTab]);

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
      permission: 'viewDashboard'
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: LayoutDashboard,
      type: 'dropdown' as const,
      permission: 'canAccessOperations',
      items: [
        { id: 'clients', label: 'Clients', icon: Users, permission: 'viewClients' },
        { id: 'loans', label: 'Loans', icon: DollarSign, permission: 'viewLoans' },
        { id: 'loan-calculator', label: 'Loan Calculator', icon: Calculator, permission: 'viewLoans' },
        { id: 'approval1', label: 'Approval', icon: GitBranch, permission: 'approveLoans' },
        { id: 'loan-reconciliation', label: 'Loan Reconciliation', icon: FileCheck, permission: 'viewTransactions' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      type: 'dropdown' as const,
      permission: 'canAccessTransactions',
      items: [
        { id: 'payments', label: 'Payments & Collections', icon: CreditCard, permission: 'addRepayments' },
        { id: 'collection-sheets', label: 'Collection Sheets', icon: FileText, permission: 'addRepayments' }
      ]
    },
    {
      id: 'risk',
      label: 'Risk & AI',
      icon: Brain,
      type: 'dropdown' as const,
      permission: 'canAccessRiskAI',
      items: [
        { id: 'credit-scoring', label: 'Credit Scoring', icon: Target, permission: 'viewRiskInsights' },
        { id: 'ai-insights', label: 'AI Insights', icon: Brain, permission: 'viewRiskInsights' }
      ]
    },
    {
      id: 'management',
      label: 'Management',
      icon: BarChart3,
      type: 'dropdown' as const,
      permission: 'canAccessManagement',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, permission: 'exportData' },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, permission: 'viewDashboard' },
        { id: 'payroll', label: 'Payroll', icon: Banknote, permission: 'viewTransactions' },
        { id: 'expenses', label: 'Expenses', icon: Receipt, permission: 'viewTransactions' },
        { id: 'accounting', label: 'Accounting', icon: BookOpen, permission: 'viewTransactions' }
      ]
    },
    {
      id: 'documents-management',
      label: 'Documents',
      icon: FolderOpen,
      type: 'dropdown' as const,
      permission: 'canAccessCompliance',
      items: [
        { id: 'compliance', label: 'Document Management', icon: FolderOpen, permission: 'viewClients' },
        { id: 'kyc', label: 'KYC Verification', icon: FileCheck, permission: 'viewClients' },
        { id: 'audit-trail', label: 'Audit Trail', icon: Shield, permission: 'viewTransactions' }
      ]
    },
    {
      id: 'administration',
      label: 'Admin',
      icon: Settings,
      type: 'dropdown' as const,
      permission: 'canAccessAdmin',
      items: [
        { id: 'staff-management', label: 'Staff Management', icon: Users, permission: 'manageStaff' },
        { id: 'loan-products', label: 'Loan Products', icon: Package, permission: 'manageProducts' },
        { id: 'documents', label: 'Documents', icon: FileText, permission: 'viewDashboard' },
        { id: 'settings', label: 'Settings', icon: Settings, permission: 'viewDashboard' }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: Headphones,
      type: 'single' as const,
      linkedTab: 'tickets',
      permission: 'canAccessSupport'
    }
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Check if user has permission for this menu item
    if (item.permission && !hasPermission(item.permission as any)) {
      return false;
    }
    
    // If it's a dropdown, filter its sub-items
    if (item.type === 'dropdown' && item.items) {
      const filteredSubItems = item.items.filter(subItem => 
        !subItem.permission || hasPermission(subItem.permission as any)
      );
      // Only show dropdown if it has accessible sub-items
      if (filteredSubItems.length === 0) {
        return false;
      }
      // Update items with filtered list
      (item as any).filteredItems = filteredSubItems;
    }
    
    return true;
  });

  const handleMenuClick = (item: typeof menuItems[0]) => {
    console.log('handleMenuClick called with item:', item.id);
    if (item.type === 'single') {
      const tabToActivate = item.linkedTab || item.id;
      setActiveTab(tabToActivate);
      navigation.setActiveTab(tabToActivate);
      setOpenDropdown(null);
    } else {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    }
  };

  const handleDropdownItemClick = (tabId: string) => {
    console.log('handleDropdownItemClick called with:', tabId);
    setActiveTab(tabId);
    navigation.setActiveTab(tabId);
    console.log('setActiveTab called with:', tabId);
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
    <div className={`min-h-screen flex flex-col overflow-hidden transition-colors ${isDark ? 'dark' : ''}`} style={{ 
      background: 'radial-gradient(ellipse at top left, #6b5b2a 0%, #4a3f1a 15%, #2d3748 35%, #1a2942 60%), radial-gradient(ellipse at bottom right, #1e2836 0%, #15233a 25%, #0d1b2a 50%, #0a1628 75%), radial-gradient(circle at center, #4a3f1a 0%, transparent 40%), linear-gradient(135deg, #2d3748 0%, #1a2942 20%, #4a3f1a 35%, #6b5b2a 45%, #15233a 60%, #0d1b2a 75%, #1e2836 90%, #0a1628 100%)',
      backgroundBlendMode: 'overlay, multiply, soft-light, normal'
    }}>
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6" style={{ backgroundColor: 'transparent' }}>
        {/* Trial Banner - Only show for organization admins */}
        {currentUser && currentUser.organizationId && (
          <TrialBanner organizationId={currentUser.organizationId} />
        )}
        
        {/* All tab contents - rendered simultaneously, visibility controlled by CSS */}
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <DashboardTab onNavigate={setActiveTab} />
        </div>

        <div style={{ display: activeTab === 'clients' ? 'block' : 'none' }}>
          <ClientsTab onClientSelect={onClientSelect} />
        </div>

        <div style={{ display: activeTab === 'loans' ? 'block' : 'none' }}>
          <LoansTab />
        </div>

        <div style={{ display: activeTab === 'loan-calculator' ? 'block' : 'none' }}>
          <LoanCalculatorTab />
        </div>

        <div style={{ display: activeTab === 'approvals' ? 'block' : 'none' }}>
          <ApprovalsTab />
        </div>

        <div style={{ display: activeTab === 'approval1' ? 'block' : 'none' }}>
          <LoanApprovalWorkflow />
        </div>

        <div style={{ display: activeTab === 'approval2' ? 'block' : 'none' }}>
          <Approval2Tab />
        </div>

        <div style={{ display: activeTab === 'loan-reconciliation' ? 'block' : 'none' }}>
          <LoanReconciliationTab />
        </div>

        <div style={{ display: activeTab === 'payments' ? 'block' : 'none' }}>
          <PaymentsTab />
        </div>

        <div style={{ display: activeTab === 'collection-sheets' ? 'block' : 'none' }}>
          <CollectionSheetsTab />
        </div>

        <div style={{ display: activeTab === 'credit-scoring' ? 'block' : 'none' }}>
          <CreditScoringTab />
        </div>

        <div style={{ display: activeTab === 'ai-insights' ? 'block' : 'none' }}>
          <AIInsightsTab />
        </div>

        <div style={{ display: activeTab === 'sms-campaigns' ? 'block' : 'none' }}>
          <SMSCampaignsTab />
        </div>

        <div style={{ display: activeTab === 'notifications' ? 'block' : 'none' }}>
          <NotificationsTab />
        </div>

        <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
          <ReportsTab />
        </div>

        <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
          <TasksTab />
        </div>

        <div style={{ display: activeTab === 'kyc' ? 'block' : 'none' }}>
          <KYCTab />
        </div>

        <div style={{ display: activeTab === 'compliance' ? 'block' : 'none' }}>
          <DocumentManagementTab />
        </div>

        <div style={{ display: activeTab === 'audit-trail' ? 'block' : 'none' }}>
          <AuditTrailTab />
        </div>

        <div style={{ display: activeTab === 'tickets' ? 'block' : 'none' }}>
          <TicketsTab />
        </div>

        <div style={{ display: activeTab === 'staff-management' ? 'block' : 'none' }}>
          <StaffManagementTab />
        </div>

        <div style={{ display: activeTab === 'documents' ? 'block' : 'none' }}>
          <DocumentsTab />
        </div>

        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <SettingsTab />
        </div>

        <div style={{ display: activeTab === 'accounting' ? 'block' : 'none' }}>
          <AccountingTab />
        </div>

        <div style={{ display: activeTab === 'loan-products' ? 'block' : 'none' }}>
          <LoanProductsTab />
        </div>

        <div style={{ display: activeTab === 'expenses' ? 'block' : 'none' }}>
          <ExpensesTab />
        </div>

        <div style={{ display: activeTab === 'payroll' ? 'block' : 'none' }}>
          <PayrollTab />
        </div>
      </div>
    </div>
  );
}