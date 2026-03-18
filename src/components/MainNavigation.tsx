import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  TrendingUp, 
  Users, 
  Shield, 
  UserCog, 
  HelpCircle,
  ChevronDown,
  DollarSign,
  CreditCard,
  BarChart3,
  Wallet,
  Building2,
  UserPlus,
  FileCheck,
  AlertTriangle,
  Lock,
  FileBarChart,
  Calculator,
  GitBranch,
  Headphones,
  Menu,
  X
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { canViewTab, isManager } from '../utils/staffPermissions';
import { TabKey } from '../types/staff';

interface NavItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
  dropdownItems?: { label: string; icon: React.ReactNode; value: string; tabKey?: TabKey }[];
  tabKey?: TabKey;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', value: 'dashboard', icon: <LayoutDashboard className="size-4" />, hasDropdown: false, tabKey: 'dashboard' },
  { 
    label: 'Operations', 
    value: 'operations', 
    icon: <Settings className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Clients', icon: <Users className="size-4" />, value: 'clients', tabKey: 'operations_clients' },
      { label: 'Institutions', icon: <Building2 className="size-4" />, value: 'institutions', tabKey: 'operations_institutions' },
      { label: 'Loans', icon: <DollarSign className="size-4" />, value: 'loans', tabKey: 'operations_loans' },
      { label: 'Loan Calculator', icon: <Calculator className="size-4" />, value: 'loan-calculator', tabKey: 'operations_calculator' },
      { label: 'Approval', icon: <GitBranch className="size-4" />, value: 'approval1', tabKey: 'operations_approval' },
    ]
  },
  { 
    label: 'Transactions', 
    value: 'transactions', 
    icon: <FileText className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Payments', icon: <CreditCard className="size-4" />, value: 'payments', tabKey: 'transactions_payments' },
      { label: 'Collection Sheets', icon: <FileText className="size-4" />, value: 'collection-sheets', tabKey: 'reports_collections' },
      { label: 'Loan Reconciliation', icon: <FileCheck className="size-4" />, value: 'loan-reconciliation', tabKey: 'accounting_journal' },
    ]
  },
  { 
    label: 'Risk & AI', 
    value: 'risk-ai', 
    icon: <TrendingUp className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Credit Scoring', icon: <BarChart3 className="size-4" />, value: 'credit-scoring', tabKey: 'ai_tools' },
      { label: 'AI Insights', icon: <TrendingUp className="size-4" />, value: 'ai-insights', tabKey: 'ai_tools' },
    ]
  },
  { 
    label: 'Management', 
    value: 'management', 
    icon: <Users className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Reports & Analytics', icon: <FileBarChart className="size-4" />, value: 'reports', tabKey: 'reports_management' },
      { label: 'Reconcile', icon: <FileCheck className="size-4" />, value: 'reconcile', tabKey: 'reports_management' },
      { label: 'Payroll', icon: <DollarSign className="size-4" />, value: 'payroll', tabKey: 'payroll' },
      { label: 'Expenses', icon: <Wallet className="size-4" />, value: 'expenses', tabKey: 'accounting_journal' },
      { label: 'Accounting', icon: <FileBarChart className="size-4" />, value: 'accounting', tabKey: 'accounting_chart' },
    ]
  },
  { 
    label: 'Documents', 
    value: 'documents-management', 
    icon: <FileText className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Document Management', icon: <FileText className="size-4" />, value: 'compliance', tabKey: 'settings' },
      { label: 'Audit Trail', icon: <Shield className="size-4" />, value: 'audit-trail', tabKey: 'settings' },
    ]
  },
  { 
    label: 'Admin', 
    value: 'admin', 
    icon: <UserCog className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Settings', icon: <Settings className="size-4" />, value: 'settings', tabKey: 'settings' },
      { label: 'Loan Products', icon: <Lock className="size-4" />, value: 'loan-products', tabKey: 'operations_products' },
      { label: 'SMS Campaigns', icon: <FileText className="size-4" />, value: 'sms-campaigns', tabKey: 'settings' },
      { label: 'Notifications', icon: <AlertTriangle className="size-4" />, value: 'notifications', tabKey: 'settings' },
    ]
  },
  { label: 'Support', value: 'tickets', icon: <Headphones className="size-4" />, hasDropdown: false, tabKey: 'settings' },
];

interface MainNavigationProps {
  defaultValue?: string;
}

export function MainNavigation({ defaultValue = 'dashboard' }: MainNavigationProps) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Filter navigation items based on staff permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    const isManagerUser = isManager();
    console.log('🔍 [MainNavigation] Filtering navigation items. Is Manager?', isManagerUser);
    
    // Log localStorage data for debugging
    try {
      const userData = localStorage.getItem('bvfunguo_user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔍 [MainNavigation] User from localStorage:', {
          name: user.name,
          role: user.role,
          hasGranularPermissions: !!user.granular_permissions,
          hasGranularPermissionsCamel: !!user.granularPermissions
        });
      }
    } catch (e) {
      console.error('Error reading user data:', e);
    }
    
    if (isManagerUser) {
      console.log('✅ [MainNavigation] User is Manager - showing all navigation items');
      return items; // Managers see all navigation items
    }

    console.log('👤 [MainNavigation] User is Staff - filtering based on permissions');
    
    return items
      .map(item => ({ ...item })) // Create a shallow copy to avoid mutation
      .filter(item => {
        // For dropdown items, check if user can view any of the sub-items
        if (item.hasDropdown && item.dropdownItems) {
          const visibleDropdownItems = item.dropdownItems.filter(subItem => {
            if (subItem.tabKey) {
              const canView = canViewTab(subItem.tabKey);
              console.log(`  - ${item.label} > ${subItem.label} (${subItem.tabKey}): ${canView ? '✅' : '❌'}`);
              return canView;
            }
            return true; // If no tabKey, show by default (shouldn't happen)
          });

          // Only show the dropdown if at least one sub-item is visible
          if (visibleDropdownItems.length === 0) {
            console.log(`❌ Hiding "${item.label}" - no visible sub-items`);
            return false;
          }

          console.log(`✅ Showing "${item.label}" with ${visibleDropdownItems.length} sub-items`);
          // Update dropdown items to filtered list
          item.dropdownItems = visibleDropdownItems;
          return true;
        }

        // For non-dropdown items, check the tabKey
        if (item.tabKey) {
          const canView = canViewTab(item.tabKey);
          console.log(`  ${item.label} (${item.tabKey}): ${canView ? '✅' : '❌'}`);
          return canView;
        }

        return true; // If no tabKey, show by default
      });
  };

  const visibleNavItems = filterNavItems(navItems);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleTabClick = (item: NavItem) => {
    if (item.hasDropdown) {
      // Toggle dropdown and calculate position
      const isOpening = openDropdown !== item.value;
      setOpenDropdown(isOpening ? item.value : null);
      
      if (isOpening && buttonRefs.current[item.value]) {
        const buttonRect = buttonRefs.current[item.value]!.getBoundingClientRect();
        setDropdownPosition({
          top: buttonRect.bottom + 4,
          left: buttonRect.left
        });
      }
    } else {
      // Navigate immediately for non-dropdown items
      navigation.setActiveTab(item.value);
      setOpenDropdown(null);
      setMobileMenuOpen(false);
    }
  };

  const handleDropdownItemClick = (itemValue: string) => {
    navigation.setActiveTab(itemValue);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleDropdownOpen = (item: NavItem) => {
    if (item.hasDropdown && buttonRefs.current[item.value]) {
      const buttonRect = buttonRefs.current[item.value]!.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom,
        left: buttonRect.left
      });
    }
  };

  return (
    <nav 
      ref={dropdownRef}
      className="w-full border-b relative overflow-visible"
      style={{
        backgroundColor: isDark ? '#15233a' : '#f3f4f6',
        borderColor: isDark ? '#1e2f42' : '#d1d5db'
      }}
    >
      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center justify-between px-4 h-12">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-sm transition-colors p-2"
          style={{ color: isDark ? '#e1e8f0' : '#1f2937' }}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          <span>Menu</span>
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block w-full overflow-x-auto overflow-y-visible scrollbar-hide">
        <div className="flex items-center justify-center h-12 gap-1 w-full">
          <div className="flex items-center gap-1 min-w-max">
            {visibleNavItems.map((item) => {
              // Check if this item or any of its dropdown items is active
              const isActive = navigation.activeTab === item.value || 
                (item.dropdownItems?.some(sub => sub.value === navigation.activeTab));
              
              return (
                <div key={item.value} className="relative static-dropdown-parent">
                  <button
                    ref={(ref) => buttonRefs.current[item.value] = ref}
                    onClick={() => handleTabClick(item)}
                    onMouseEnter={() => setHoveredTab(item.value)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className="flex items-center gap-2 px-4 h-12 text-sm transition-all relative whitespace-nowrap"
                    style={{
                      color: isActive || openDropdown === item.value 
                        ? (isDark ? '#ffffff' : '#111827')
                        : (isDark ? '#9ca3af' : '#6b7280'),
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                        : hoveredTab === item.value || openDropdown === item.value
                        ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)')
                        : 'transparent',
                      borderRadius: '6px',
                      fontWeight: isActive ? '600' : '500'
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown 
                        className="size-3 ml-1 transition-transform" 
                        style={{
                          transform: openDropdown === item.value ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    )}
                    
                    {/* Active indicator - enhanced bottom bar */}
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{
                          backgroundColor: isDark ? '#3b82f6' : '#2563eb'
                        }}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.hasDropdown && openDropdown === item.value && item.dropdownItems && (
                    <div
                      className="fixed rounded-lg shadow-xl border py-2 min-w-[220px] z-[9999]"
                      style={{
                        backgroundColor: isDark ? '#0d1b2a' : '#ffffff',
                        borderColor: isDark ? '#1e2f42' : '#e5e7eb',
                        top: dropdownPosition ? `${dropdownPosition.top}px` : 'auto',
                        left: dropdownPosition ? `${dropdownPosition.left}px` : 'auto'
                      }}
                    >
                      {item.dropdownItems.map((dropdownItem) => {
                        const isDropdownActive = navigation.activeTab === dropdownItem.value;
                        return (
                          <button
                            key={dropdownItem.value}
                            onClick={() => handleDropdownItemClick(dropdownItem.value)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                            style={{
                              color: isDropdownActive 
                                ? (isDark ? '#ffffff' : '#111827')
                                : (isDark ? '#e1e8f0' : '#4b5563'),
                              backgroundColor: isDropdownActive 
                                ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                                : 'transparent',
                              fontWeight: isDropdownActive ? '600' : '500'
                            }}
                            onMouseEnter={(e) => {
                              if (!isDropdownActive) {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isDropdownActive) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {dropdownItem.icon}
                            <span>{dropdownItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden absolute top-full left-0 right-0 z-50 max-h-[calc(100vh-12rem)] overflow-y-auto border-b"
          style={{
            backgroundColor: isDark ? '#0d1b2a' : '#ffffff',
            borderColor: isDark ? '#1e2f42' : '#e5e7eb'
          }}
        >
          <div className="py-2">
            {visibleNavItems.map((item) => {
              const isActive = navigation.activeTab === item.value || 
                (item.dropdownItems?.some(sub => sub.value === navigation.activeTab));
              
              return (
                <div key={item.value}>
                  {!item.hasDropdown ? (
                    <button
                      onClick={() => handleTabClick(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                      style={{
                        color: isActive ? (isDark ? '#ffffff' : '#111827') : (isDark ? '#9ca3af' : '#6b7280'),
                        backgroundColor: isActive 
                          ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                          : 'transparent',
                        fontWeight: isActive ? '600' : '500'
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.value ? null : item.value)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-left transition-colors"
                        style={{
                          color: isActive || openDropdown === item.value 
                            ? (isDark ? '#ffffff' : '#111827') 
                            : (isDark ? '#9ca3af' : '#6b7280'),
                          backgroundColor: isActive || openDropdown === item.value 
                            ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                            : 'transparent',
                          fontWeight: isActive ? '600' : '500'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown 
                          className="size-4 transition-transform" 
                          style={{
                            transform: openDropdown === item.value ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        />
                      </button>
                      {openDropdown === item.value && item.dropdownItems && (
                        <div 
                          className="pl-8" 
                          style={{ 
                            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' 
                          }}
                        >
                          {item.dropdownItems.map((dropdownItem) => {
                            const isDropdownActive = navigation.activeTab === dropdownItem.value;
                            return (
                              <button
                                key={dropdownItem.value}
                                onClick={() => handleDropdownItemClick(dropdownItem.value)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                                style={{
                                  color: isDropdownActive 
                                    ? (isDark ? '#ffffff' : '#111827') 
                                    : (isDark ? '#9ca3af' : '#6b7280'),
                                  backgroundColor: isDropdownActive 
                                    ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                                    : 'transparent',
                                  fontWeight: isDropdownActive ? '600' : '500'
                                }}
                              >
                                {dropdownItem.icon}
                                <span>{dropdownItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}