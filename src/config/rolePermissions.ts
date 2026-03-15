// Role-based permissions configuration for BV FUNGUO LTD

export interface RolePermissions {
  // Dashboard & Reports
  viewDashboard: boolean;
  exportData: boolean;
  
  // Report Access
  viewPortfolioReport: boolean;
  viewLoanPerformanceReport: boolean;
  viewCollectionReport: boolean;
  viewClientReport: boolean;
  viewFinancialReport: boolean;
  viewArrearsReport: boolean;
  viewDisbursementReport: boolean;
  viewSavingsReport: boolean;
  
  // Client Management
  viewClients: boolean;
  addClients: boolean;
  editClients: boolean;
  deleteClients: boolean;
  
  // Loan Management
  viewLoans: boolean;
  addLoans: boolean;
  approveLoans: boolean;
  manageProducts: boolean;
  
  // Transactions
  addRepayments: boolean;
  manageSavings: boolean;
  viewTransactions: boolean;
  
  // Administration
  manageStaff: boolean;
  manageBranches: boolean;
  bulkOperations: boolean;
  
  // Risk & Insights
  viewRiskInsights: boolean;
  
  // Tab Access
  canAccessOperations: boolean;
  canAccessTransactions: boolean;
  canAccessManagement: boolean;
  canAccessCompliance: boolean;
  canAccessAdmin: boolean;
  canAccessRiskAI: boolean;
  canAccessSupport: boolean;
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  'Admin': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: true,
    viewLoanPerformanceReport: true,
    viewCollectionReport: true,
    viewClientReport: true,
    viewFinancialReport: true,
    viewArrearsReport: true,
    viewDisbursementReport: true,
    viewSavingsReport: true,
    viewClients: true,
    addClients: true,
    editClients: true,
    deleteClients: true,
    viewLoans: true,
    addLoans: true,
    approveLoans: true,
    manageProducts: true,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: true,
    manageBranches: true,
    bulkOperations: true,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: true,
    canAccessCompliance: true,
    canAccessAdmin: true,
    canAccessRiskAI: true,
    canAccessSupport: true,
  },
  
  'Loan Officer': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: false,
    viewLoanPerformanceReport: false,
    viewCollectionReport: false,
    viewClientReport: false,
    viewFinancialReport: false,
    viewArrearsReport: false,
    viewDisbursementReport: false,
    viewSavingsReport: false,
    viewClients: true,
    addClients: true,
    editClients: true,
    deleteClients: false,
    viewLoans: true,
    addLoans: true,
    approveLoans: false,
    manageProducts: false,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: false,
    manageBranches: false,
    bulkOperations: false,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: false,
    canAccessCompliance: false,
    canAccessAdmin: false,
    canAccessRiskAI: true,
    canAccessSupport: true,
  },
  
  'Cashier': {
    viewDashboard: true,
    exportData: false,
    viewPortfolioReport: false,
    viewLoanPerformanceReport: false,
    viewCollectionReport: false,
    viewClientReport: false,
    viewFinancialReport: false,
    viewArrearsReport: false,
    viewDisbursementReport: false,
    viewSavingsReport: false,
    viewClients: true,
    addClients: false,
    editClients: false,
    deleteClients: false,
    viewLoans: true,
    addLoans: false,
    approveLoans: false,
    manageProducts: false,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: false,
    manageBranches: false,
    bulkOperations: false,
    viewRiskInsights: false,
    canAccessOperations: false,
    canAccessTransactions: true,
    canAccessManagement: false,
    canAccessCompliance: false,
    canAccessAdmin: false,
    canAccessRiskAI: false,
    canAccessSupport: true,
  },
  
  'Teller': {
    viewDashboard: true,
    exportData: false,
    viewPortfolioReport: false,
    viewLoanPerformanceReport: false,
    viewCollectionReport: false,
    viewClientReport: false,
    viewFinancialReport: false,
    viewArrearsReport: false,
    viewDisbursementReport: false,
    viewSavingsReport: false,
    viewClients: true,
    addClients: false,
    editClients: false,
    deleteClients: false,
    viewLoans: true,
    addLoans: false,
    approveLoans: false,
    manageProducts: false,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: false,
    manageBranches: false,
    bulkOperations: false,
    viewRiskInsights: false,
    canAccessOperations: false,
    canAccessTransactions: true,
    canAccessManagement: false,
    canAccessCompliance: false,
    canAccessAdmin: false,
    canAccessRiskAI: false,
    canAccessSupport: true,
  },
  
  'Collector': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: false,
    viewLoanPerformanceReport: false,
    viewCollectionReport: true,
    viewClientReport: false,
    viewFinancialReport: false,
    viewArrearsReport: true,
    viewDisbursementReport: false,
    viewSavingsReport: false,
    viewClients: true,
    addClients: false,
    editClients: false,
    deleteClients: false,
    viewLoans: true,
    addLoans: false,
    approveLoans: false,
    manageProducts: false,
    addRepayments: true,
    manageSavings: false,
    viewTransactions: true,
    manageStaff: false,
    manageBranches: false,
    bulkOperations: false,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: false,
    canAccessCompliance: false,
    canAccessAdmin: false,
    canAccessRiskAI: false,
    canAccessSupport: true,
  },
  
  'Branch Manager': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: true,
    viewLoanPerformanceReport: true,
    viewCollectionReport: true,
    viewClientReport: true,
    viewFinancialReport: true,
    viewArrearsReport: true,
    viewDisbursementReport: true,
    viewSavingsReport: true,
    viewClients: true,
    addClients: true,
    editClients: true,
    deleteClients: true,
    viewLoans: true,
    addLoans: true,
    approveLoans: true,
    manageProducts: true,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: true,
    manageBranches: false,
    bulkOperations: true,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: true,
    canAccessCompliance: true,
    canAccessAdmin: false,
    canAccessRiskAI: true,
    canAccessSupport: true,
  },
  
  'Operations Manager': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: true,
    viewLoanPerformanceReport: true,
    viewCollectionReport: true,
    viewClientReport: true,
    viewFinancialReport: true,
    viewArrearsReport: true,
    viewDisbursementReport: true,
    viewSavingsReport: true,
    viewClients: true,
    addClients: true,
    editClients: true,
    deleteClients: true,
    viewLoans: true,
    addLoans: true,
    approveLoans: true,
    manageProducts: true,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: true,
    manageBranches: false,
    bulkOperations: true,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: true,
    canAccessCompliance: true,
    canAccessAdmin: false,
    canAccessRiskAI: true,
    canAccessSupport: true,
  },
  
  'Accountant': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: true,
    viewLoanPerformanceReport: true,
    viewCollectionReport: true,
    viewClientReport: true,
    viewFinancialReport: true,
    viewArrearsReport: true,
    viewDisbursementReport: true,
    viewSavingsReport: true,
    viewClients: true,
    addClients: false,
    editClients: false,
    deleteClients: false,
    viewLoans: true,
    addLoans: false,
    approveLoans: false,
    manageProducts: false,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: false,
    manageBranches: false,
    bulkOperations: false,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: true,
    canAccessCompliance: true,
    canAccessAdmin: false,
    canAccessRiskAI: false,
    canAccessSupport: true,
  },
  
  'Collections Officer': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: false,
    viewLoanPerformanceReport: false,
    viewCollectionReport: true,
    viewClientReport: false,
    viewFinancialReport: false,
    viewArrearsReport: true,
    viewDisbursementReport: false,
    viewSavingsReport: false,
    viewClients: true,
    addClients: false,
    editClients: false,
    deleteClients: false,
    viewLoans: true,
    addLoans: false,
    approveLoans: false,
    manageProducts: false,
    addRepayments: true,
    manageSavings: false,
    viewTransactions: true,
    manageStaff: false,
    manageBranches: false,
    bulkOperations: false,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: false,
    canAccessCompliance: false,
    canAccessAdmin: false,
    canAccessRiskAI: false,
    canAccessSupport: true,
  },
  
  'Manager': {
    viewDashboard: true,
    exportData: true,
    viewPortfolioReport: true,
    viewLoanPerformanceReport: true,
    viewCollectionReport: true,
    viewClientReport: true,
    viewFinancialReport: true,
    viewArrearsReport: true,
    viewDisbursementReport: true,
    viewSavingsReport: true,
    viewClients: true,
    addClients: true,
    editClients: true,
    deleteClients: true,
    viewLoans: true,
    addLoans: true,
    approveLoans: true,
    manageProducts: true,
    addRepayments: true,
    manageSavings: true,
    viewTransactions: true,
    manageStaff: true,
    manageBranches: false,
    bulkOperations: true,
    viewRiskInsights: true,
    canAccessOperations: true,
    canAccessTransactions: true,
    canAccessManagement: true,
    canAccessCompliance: true,
    canAccessAdmin: false,
    canAccessRiskAI: true,
    canAccessSupport: true,
  },
};

export function getRolePermissions(roleName: string): RolePermissions {
  try {
    // Check if we're in a browser environment properly to avoid SSR issues
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      // Check for custom role overrides in localStorage first
      const customRoles = getCustomRoleOverrides();
      if (customRoles && customRoles[roleName]) {
        return customRoles[roleName];
      }
    }
    
    // Return role permissions or default to Cashier
    return ROLE_PERMISSIONS[roleName] || ROLE_PERMISSIONS['Cashier']; // Default to most restrictive
  } catch (error) {
    // console.warn('Error getting role permissions:', error);
    // Return safe default
    return ROLE_PERMISSIONS['Cashier'];
  }
}

// Get all roles (system + custom)
export function getAllRoles(): { id: string; name: string; type: 'System' | 'Custom'; permissions: RolePermissions }[] {
  // Build system roles
  const systemRoles = Object.keys(ROLE_PERMISSIONS).map(name => ({
    id: name.toLowerCase().replace(/\s+/g, '_'),
    name,
    type: 'System' as const,
    permissions: ROLE_PERMISSIONS[name]
  }));
  
  // Try to get custom roles, but don't fail if we can't
  // Check browser environment properly to avoid SSR issues
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return systemRoles;
  }
  
  try {
    const customRoles = getCustomRoleOverrides();
    if (customRoles && Object.keys(customRoles).length > 0) {
      const customRolesList = Object.keys(customRoles).map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        type: 'Custom' as const,
        permissions: customRoles[name]
      }));
      return [...systemRoles, ...customRolesList];
    }
  } catch (error) {
    // Silently ignore errors and just return system roles
  }
  
  return systemRoles;
}

// Save custom role or override system role
export function saveRolePermissions(roleName: string, permissions: RolePermissions, isCustom: boolean = false) {
  // Safety check: ensure we're in a browser environment
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  
  try {
    const customRoles = getCustomRoleOverrides();
    customRoles[roleName] = permissions;
    localStorage.setItem('bvfunguo_custom_roles', JSON.stringify(customRoles));
  } catch (e) {
    // Silently fail on errors
    return;
  }
}

// Get custom role overrides from localStorage
function getCustomRoleOverrides(): Record<string, RolePermissions> {
  // Safety check: ensure we're in a browser environment
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return {};
  }
  
  try {
    const stored = localStorage.getItem('bvfunguo_custom_roles');
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored);
    return parsed || {};
  } catch (error) {
    // Silently return empty object on any error
    return {};
  }
}

// Delete a custom role
export function deleteCustomRole(roleName: string) {
  // Safety check: ensure we're in a browser environment
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  
  try {
    const customRoles = getCustomRoleOverrides();
    delete customRoles[roleName];
    localStorage.setItem('bvfunguo_custom_roles', JSON.stringify(customRoles));
  } catch (e) {
    // Silently fail on errors
    return;
  }
}