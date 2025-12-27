import { useState, useRef, useEffect } from 'react';
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
  Headphones
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

interface NavItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
  dropdownItems?: { label: string; icon: React.ReactNode; value: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', value: 'dashboard', icon: <LayoutDashboard className="size-4" />, hasDropdown: false },
  { 
    label: 'Operations', 
    value: 'operations', 
    icon: <Settings className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Clients', icon: <Users className="size-4" />, value: 'clients' },
      { label: 'Loans', icon: <DollarSign className="size-4" />, value: 'loans' },
      { label: 'Loan Calculator', icon: <Calculator className="size-4" />, value: 'loan-calculator' },
      { label: 'Approvals', icon: <GitBranch className="size-4" />, value: 'approvals' },
    ]
  },
  { 
    label: 'Transactions', 
    value: 'transactions', 
    icon: <FileText className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Payments', icon: <CreditCard className="size-4" />, value: 'payments' },
      { label: 'Collection Sheets', icon: <FileText className="size-4" />, value: 'collection-sheets' },
      { label: 'Loan Reconciliation', icon: <FileCheck className="size-4" />, value: 'loan-reconciliation' },
    ]
  },
  { 
    label: 'Risk & AI', 
    value: 'risk-ai', 
    icon: <TrendingUp className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Credit Scoring', icon: <BarChart3 className="size-4" />, value: 'credit-scoring' },
      { label: 'AI Insights', icon: <TrendingUp className="size-4" />, value: 'ai-insights' },
    ]
  },
  { 
    label: 'Management', 
    value: 'management', 
    icon: <Users className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Reports & Analytics', icon: <FileBarChart className="size-4" />, value: 'reports' },
      { label: 'Payroll', icon: <DollarSign className="size-4" />, value: 'payroll' },
      { label: 'Expenses', icon: <Wallet className="size-4" />, value: 'expenses' },
      { label: 'Accounting', icon: <FileBarChart className="size-4" />, value: 'accounting' },
    ]
  },
  { 
    label: 'Documents', 
    value: 'documents-management', 
    icon: <FileText className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Document Management', icon: <FileText className="size-4" />, value: 'compliance' },
      { label: 'Audit Trail', icon: <Shield className="size-4" />, value: 'audit-trail' },
    ]
  },
  { 
    label: 'Admin', 
    value: 'admin', 
    icon: <UserCog className="size-4" />, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Settings', icon: <Settings className="size-4" />, value: 'settings' },
      { label: 'Loan Products', icon: <Lock className="size-4" />, value: 'loan-products' },
      { label: 'SMS Campaigns', icon: <FileText className="size-4" />, value: 'sms-campaigns' },
      { label: 'Notifications', icon: <AlertTriangle className="size-4" />, value: 'notifications' },
    ]
  },
  { label: 'Support', value: 'tickets', icon: <Headphones className="size-4" />, hasDropdown: false },
];

interface MainNavigationProps {
  defaultValue?: string;
}

export function MainNavigation({ defaultValue = 'dashboard' }: MainNavigationProps) {
  const navigation = useNavigation();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      // Toggle dropdown
      setOpenDropdown(openDropdown === item.value ? null : item.value);
    } else {
      // Navigate immediately for non-dropdown items
      navigation.setActiveTab(item.value);
      setOpenDropdown(null);
    }
  };

  const handleDropdownItemClick = (itemValue: string) => {
    navigation.setActiveTab(itemValue);
    setOpenDropdown(null);
  };

  return (
    <nav 
      ref={dropdownRef}
      className="w-full border-b relative"
      style={{
        backgroundColor: '#0a1628',
        borderColor: '#1e2f42'
      }}
    >
      <div className="flex items-center h-12 px-4 gap-1">
        {navItems.map((item) => (
          <div key={item.value} className="relative">
            <button
              onClick={() => handleTabClick(item)}
              onMouseEnter={() => setHoveredTab(item.value)}
              onMouseLeave={() => setHoveredTab(null)}
              className="flex items-center gap-2 px-4 h-12 text-sm transition-all relative"
              style={{
                color: navigation.activeTab === item.value || openDropdown === item.value ? '#e1e8f0' : '#8b9db3',
                backgroundColor: hoveredTab === item.value || navigation.activeTab === item.value || openDropdown === item.value
                  ? 'rgba(236, 115, 71, 0.15)' 
                  : 'transparent',
                borderRadius: '6px'
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
              
              {/* Active indicator */}
              {navigation.activeTab === item.value && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    backgroundColor: '#ec7347'
                  }}
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {item.hasDropdown && openDropdown === item.value && item.dropdownItems && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg shadow-xl border py-2 min-w-[220px] z-50"
                style={{
                  backgroundColor: '#0d1b2a',
                  borderColor: '#1e2f42'
                }}
              >
                {item.dropdownItems.map((dropdownItem) => (
                  <button
                    key={dropdownItem.value}
                    onClick={() => handleDropdownItemClick(dropdownItem.value)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{
                      color: '#e1e8f0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 115, 71, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {dropdownItem.icon}
                    <span>{dropdownItem.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}