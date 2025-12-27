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
  // Check for custom role overrides in localStorage first
  const customRoles = getCustomRoleOverrides();
  if (customRoles[roleName]) {
    return customRoles[roleName];
  }
  
  return ROLE_PERMISSIONS[roleName] || ROLE_PERMISSIONS['Cashier']; // Default to most restrictive
}

// Get all roles (system + custom)
export function getAllRoles(): { id: string; name: string; type: 'System' | 'Custom'; permissions: RolePermissions }[] {
  const systemRoles = Object.keys(ROLE_PERMISSIONS).map(name => ({
    id: name.toLowerCase().replace(/\s+/g, '_'),
    name,
    type: 'System' as const,
    permissions: ROLE_PERMISSIONS[name]
  }));
  
  const customRoles = getCustomRoleOverrides();
  const customRolesList = Object.keys(customRoles).map(name => ({
    id: name.toLowerCase().replace(/\s+/g, '_'),
    name,
    type: 'Custom' as const,
    permissions: customRoles[name]
  }));
  
  return [...systemRoles, ...customRolesList];
}

// Save custom role or override system role
export function saveRolePermissions(roleName: string, permissions: RolePermissions, isCustom: boolean = false) {
  const customRoles = getCustomRoleOverrides();
  customRoles[roleName] = permissions;
  localStorage.setItem('bvfunguo_custom_roles', JSON.stringify(customRoles));
}

// Get custom role overrides from localStorage
function getCustomRoleOverrides(): Record<string, RolePermissions> {
  try {
    const stored = localStorage.getItem('bvfunguo_custom_roles');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Delete a custom role
export function deleteCustomRole(roleName: string) {
  const customRoles = getCustomRoleOverrides();
  delete customRoles[roleName];
  localStorage.setItem('bvfunguo_custom_roles', JSON.stringify(customRoles));
}