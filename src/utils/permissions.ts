/**
 * Comprehensive Granular Permissions System
 * 
 * This file defines all atomic permissions across the platform.
 * Each permission represents a single, specific action or view.
 */

// ============================================
// PERMISSION CATEGORIES & ATOMIC PERMISSIONS
// ============================================

export const PERMISSIONS = {
  // ========== DASHBOARD ==========
  DASHBOARD: {
    VIEW_DASHBOARD: 'dashboard.view',
    VIEW_METRICS: 'dashboard.view_metrics',
    VIEW_PORTFOLIO_SUMMARY: 'dashboard.view_portfolio_summary',
    VIEW_DISBURSEMENT_STATS: 'dashboard.view_disbursement_stats',
    VIEW_COLLECTION_STATS: 'dashboard.view_collection_stats',
    VIEW_PAR_METRICS: 'dashboard.view_par_metrics',
    VIEW_CLIENT_GROWTH: 'dashboard.view_client_growth',
    VIEW_LOAN_ANALYTICS: 'dashboard.view_loan_analytics',
    EXPORT_DASHBOARD: 'dashboard.export',
  },

  // ========== CLIENTS ==========
  CLIENTS: {
    VIEW_CLIENTS: 'clients.view',
    VIEW_CLIENT_DETAILS: 'clients.view_details',
    VIEW_CLIENT_FINANCIALS: 'clients.view_financials',
    VIEW_CLIENT_CREDIT_SCORE: 'clients.view_credit_score',
    VIEW_CLIENT_LOANS: 'clients.view_loans',
    VIEW_CLIENT_PAYMENTS: 'clients.view_payments',
    VIEW_CLIENT_DOCUMENTS: 'clients.view_documents',
    VIEW_CLIENT_GPS_LOCATION: 'clients.view_gps_location',
    ADD_CLIENT: 'clients.add',
    EDIT_CLIENT: 'clients.edit',
    EDIT_CLIENT_PERSONAL_INFO: 'clients.edit_personal_info',
    EDIT_CLIENT_FINANCIAL_INFO: 'clients.edit_financial_info',
    DELETE_CLIENT: 'clients.delete',
    EXPORT_CLIENTS: 'clients.export',
    SEND_SMS_TO_CLIENTS: 'clients.send_sms',
    SEND_EMAIL_TO_CLIENTS: 'clients.send_email',
    INVITE_CLIENTS: 'clients.invite',
    VIEW_CLIENT_STATISTICS: 'clients.view_statistics',
  },

  // ========== LOANS ==========
  LOANS: {
    VIEW_LOANS: 'loans.view',
    VIEW_LOAN_DETAILS: 'loans.view_details',
    VIEW_LOAN_SCHEDULE: 'loans.view_schedule',
    VIEW_LOAN_GUARANTORS: 'loans.view_guarantors',
    VIEW_LOAN_COMMENTS: 'loans.view_comments',
    VIEW_LOAN_DOCUMENTS: 'loans.view_documents',
    VIEW_LOAN_FINANCIALS: 'loans.view_financials',
    VIEW_LOAN_AMOUNT: 'loans.view_amount',
    VIEW_OUTSTANDING_BALANCE: 'loans.view_outstanding_balance',
    CREATE_LOAN: 'loans.create',
    EDIT_LOAN: 'loans.edit',
    EDIT_LOAN_AMOUNT: 'loans.edit_amount',
    EDIT_LOAN_TERMS: 'loans.edit_terms',
    EDIT_LOAN_INTEREST: 'loans.edit_interest',
    DELETE_LOAN: 'loans.delete',
    DISBURSE_LOAN: 'loans.disburse',
    WRITE_OFF_LOAN: 'loans.write_off',
    ROLLOVER_LOAN: 'loans.rollover',
    ADD_GUARANTOR: 'loans.add_guarantor',
    REMOVE_GUARANTOR: 'loans.remove_guarantor',
    ADD_COMMENT: 'loans.add_comment',
    EXPORT_LOANS: 'loans.export',
    VIEW_LOAN_STATISTICS: 'loans.view_statistics',
  },

  // ========== LOAN APPROVALS ==========
  APPROVALS: {
    VIEW_APPROVALS: 'approvals.view',
    VIEW_APPROVAL_DETAILS: 'approvals.view_details',
    APPROVE_PHASE_1: 'approvals.approve_phase_1',
    APPROVE_PHASE_2: 'approvals.approve_phase_2',
    APPROVE_PHASE_3: 'approvals.approve_phase_3',
    APPROVE_PHASE_4: 'approvals.approve_phase_4',
    APPROVE_PHASE_5: 'approvals.approve_phase_5',
    REJECT_APPROVAL: 'approvals.reject',
    ASSIGN_APPROVER: 'approvals.assign_approver',
    VIEW_APPROVAL_HISTORY: 'approvals.view_history',
    EXPORT_APPROVALS: 'approvals.export',
  },

  // ========== REPAYMENTS ==========
  REPAYMENTS: {
    VIEW_REPAYMENTS: 'repayments.view',
    VIEW_REPAYMENT_DETAILS: 'repayments.view_details',
    RECORD_REPAYMENT: 'repayments.record',
    APPROVE_REPAYMENT: 'repayments.approve',
    REJECT_REPAYMENT: 'repayments.reject',
    EDIT_REPAYMENT: 'repayments.edit',
    DELETE_REPAYMENT: 'repayments.delete',
    VIEW_REPAYMENT_STATISTICS: 'repayments.view_statistics',
    EXPORT_REPAYMENTS: 'repayments.export',
  },

  // ========== ACCOUNTING ==========
  ACCOUNTING: {
    VIEW_ACCOUNTING: 'accounting.view',
    VIEW_FINANCIAL_STATEMENTS: 'accounting.view_financial_statements',
    VIEW_INCOME_STATEMENT: 'accounting.view_income_statement',
    VIEW_BALANCE_SHEET: 'accounting.view_balance_sheet',
    VIEW_CASH_FLOW: 'accounting.view_cash_flow',
    VIEW_TRIAL_BALANCE: 'accounting.view_trial_balance',
    VIEW_GENERAL_LEDGER: 'accounting.view_general_ledger',
    VIEW_JOURNAL_ENTRIES: 'accounting.view_journal_entries',
    CREATE_JOURNAL_ENTRY: 'accounting.create_journal_entry',
    EDIT_JOURNAL_ENTRY: 'accounting.edit_journal_entry',
    DELETE_JOURNAL_ENTRY: 'accounting.delete_journal_entry',
    VIEW_CHART_OF_ACCOUNTS: 'accounting.view_chart_of_accounts',
    ADD_ACCOUNT: 'accounting.add_account',
    EDIT_ACCOUNT: 'accounting.edit_account',
    DELETE_ACCOUNT: 'accounting.delete_account',
    EXPORT_FINANCIAL_REPORTS: 'accounting.export_reports',
    VIEW_AUDIT_TRAIL: 'accounting.view_audit_trail',
  },

  // ========== BANK ACCOUNTS ==========
  BANK_ACCOUNTS: {
    VIEW_BANK_ACCOUNTS: 'bank_accounts.view',
    VIEW_ACCOUNT_BALANCE: 'bank_accounts.view_balance',
    VIEW_TRANSACTIONS: 'bank_accounts.view_transactions',
    VIEW_TRANSACTION_DETAILS: 'bank_accounts.view_transaction_details',
    ADD_BANK_ACCOUNT: 'bank_accounts.add',
    EDIT_BANK_ACCOUNT: 'bank_accounts.edit',
    DELETE_BANK_ACCOUNT: 'bank_accounts.delete',
    ADD_TRANSACTION: 'bank_accounts.add_transaction',
    EDIT_TRANSACTION: 'bank_accounts.edit_transaction',
    DELETE_TRANSACTION: 'bank_accounts.delete_transaction',
    RECONCILE_ACCOUNT: 'bank_accounts.reconcile',
    MARK_REVIEWED: 'bank_accounts.mark_reviewed',
    EXPORT_TRANSACTIONS: 'bank_accounts.export_transactions',
    INITIATE_TRANSFER: 'bank_accounts.initiate_transfer',
  },

  // ========== COLLECTION SHEETS ==========
  COLLECTION_SHEETS: {
    VIEW_COLLECTION_SHEETS: 'collection_sheets.view',
    GENERATE_COLLECTION_SHEET: 'collection_sheets.generate',
    EXPORT_COLLECTION_SHEET: 'collection_sheets.export',
    PRINT_COLLECTION_SHEET: 'collection_sheets.print',
    RECORD_COLLECTIONS: 'collection_sheets.record_collections',
  },

  // ========== CREDIT SCORING ==========
  CREDIT_SCORING: {
    VIEW_CREDIT_SCORES: 'credit_scoring.view',
    VIEW_SCORE_DETAILS: 'credit_scoring.view_details',
    VIEW_SCORE_FACTORS: 'credit_scoring.view_factors',
    CONFIGURE_SCORING_PARAMETERS: 'credit_scoring.configure_parameters',
    RECALCULATE_SCORES: 'credit_scoring.recalculate',
    EXPORT_CREDIT_SCORES: 'credit_scoring.export',
  },

  // ========== GROUPS ==========
  GROUPS: {
    VIEW_GROUPS: 'groups.view',
    VIEW_GROUP_DETAILS: 'groups.view_details',
    VIEW_GROUP_MEMBERS: 'groups.view_members',
    VIEW_GROUP_LOANS: 'groups.view_loans',
    ADD_GROUP: 'groups.add',
    EDIT_GROUP: 'groups.edit',
    DELETE_GROUP: 'groups.delete',
    ADD_MEMBER: 'groups.add_member',
    REMOVE_MEMBER: 'groups.remove_member',
    EXPORT_GROUPS: 'groups.export',
  },

  // ========== LOAN PRODUCTS ==========
  LOAN_PRODUCTS: {
    VIEW_PRODUCTS: 'loan_products.view',
    VIEW_PRODUCT_DETAILS: 'loan_products.view_details',
    VIEW_PRODUCT_STATISTICS: 'loan_products.view_statistics',
    ADD_PRODUCT: 'loan_products.add',
    EDIT_PRODUCT: 'loan_products.edit',
    DELETE_PRODUCT: 'loan_products.delete',
    ACTIVATE_PRODUCT: 'loan_products.activate',
    DEACTIVATE_PRODUCT: 'loan_products.deactivate',
  },

  // ========== SAVINGS ==========
  SAVINGS: {
    VIEW_SAVINGS: 'savings.view',
    VIEW_ACCOUNT_DETAILS: 'savings.view_account_details',
    VIEW_ACCOUNT_BALANCE: 'savings.view_account_balance',
    VIEW_TRANSACTIONS: 'savings.view_transactions',
    CREATE_ACCOUNT: 'savings.create_account',
    EDIT_ACCOUNT: 'savings.edit_account',
    DELETE_ACCOUNT: 'savings.delete_account',
    RECORD_DEPOSIT: 'savings.record_deposit',
    RECORD_WITHDRAWAL: 'savings.record_withdrawal',
    APPROVE_TRANSACTION: 'savings.approve_transaction',
    EXPORT_SAVINGS: 'savings.export',
  },

  // ========== EXPENSES ==========
  EXPENSES: {
    VIEW_EXPENSES: 'expenses.view',
    VIEW_EXPENSE_DETAILS: 'expenses.view_details',
    ADD_EXPENSE: 'expenses.add',
    EDIT_EXPENSE: 'expenses.edit',
    DELETE_EXPENSE: 'expenses.delete',
    APPROVE_EXPENSE: 'expenses.approve',
    REJECT_EXPENSE: 'expenses.reject',
    EXPORT_EXPENSES: 'expenses.export',
  },

  // ========== STAFF MANAGEMENT ==========
  STAFF: {
    VIEW_STAFF: 'staff.view',
    VIEW_STAFF_DETAILS: 'staff.view_details',
    VIEW_STAFF_PERFORMANCE: 'staff.view_performance',
    VIEW_STAFF_COMMISSIONS: 'staff.view_commissions',
    ADD_STAFF: 'staff.add',
    EDIT_STAFF: 'staff.edit',
    DELETE_STAFF: 'staff.delete',
    ASSIGN_LOANS: 'staff.assign_loans',
    VIEW_ASSIGNMENTS: 'staff.view_assignments',
    MANAGE_ROLES: 'staff.manage_roles',
    MANAGE_PERMISSIONS: 'staff.manage_permissions',
  },

  // ========== REPORTS ==========
  REPORTS: {
    VIEW_REPORTS: 'reports.view',
    GENERATE_CUSTOM_REPORT: 'reports.generate_custom',
    EXPORT_TO_PDF: 'reports.export_pdf',
    EXPORT_TO_EXCEL: 'reports.export_excel',
    EXPORT_TO_CSV: 'reports.export_csv',
    VIEW_PORTFOLIO_REPORT: 'reports.view_portfolio',
    VIEW_ARREARS_REPORT: 'reports.view_arrears',
    VIEW_COLLECTIONS_REPORT: 'reports.view_collections',
    VIEW_DISBURSEMENT_REPORT: 'reports.view_disbursement',
    VIEW_PAR_REPORT: 'reports.view_par',
    VIEW_AGING_REPORT: 'reports.view_aging',
    SCHEDULE_REPORT: 'reports.schedule',
  },

  // ========== NOTIFICATIONS ==========
  NOTIFICATIONS: {
    VIEW_NOTIFICATIONS: 'notifications.view',
    CREATE_NOTIFICATION: 'notifications.create',
    SEND_SMS: 'notifications.send_sms',
    SEND_EMAIL: 'notifications.send_email',
    SEND_PUSH: 'notifications.send_push',
    VIEW_NOTIFICATION_HISTORY: 'notifications.view_history',
    CONFIGURE_TEMPLATES: 'notifications.configure_templates',
  },

  // ========== SETTINGS ==========
  SETTINGS: {
    VIEW_SETTINGS: 'settings.view',
    EDIT_ORG_SETTINGS: 'settings.edit_organization',
    EDIT_SYSTEM_SETTINGS: 'settings.edit_system',
    MANAGE_CURRENCIES: 'settings.manage_currencies',
    MANAGE_BRANCHES: 'settings.manage_branches',
    MANAGE_CUSTOM_FIELDS: 'settings.manage_custom_fields',
    MANAGE_INTEGRATIONS: 'settings.manage_integrations',
    VIEW_AUDIT_LOG: 'settings.view_audit_log',
    MANAGE_BACKUPS: 'settings.manage_backups',
  },

  // ========== AI INSIGHTS ==========
  AI_INSIGHTS: {
    VIEW_AI_INSIGHTS: 'ai_insights.view',
    VIEW_PREDICTIONS: 'ai_insights.view_predictions',
    VIEW_RECOMMENDATIONS: 'ai_insights.view_recommendations',
    VIEW_RISK_ANALYSIS: 'ai_insights.view_risk_analysis',
    CONFIGURE_AI_MODELS: 'ai_insights.configure_models',
  },

  // ========== DATA IMPORT/EXPORT ==========
  DATA_MANAGEMENT: {
    IMPORT_DATA: 'data.import',
    EXPORT_DATA: 'data.export',
    BULK_OPERATIONS: 'data.bulk_operations',
    VIEW_IMPORT_HISTORY: 'data.view_import_history',
  },
} as const;

// ============================================
// ROLE DEFINITIONS
// ============================================

export type Role = 'Super Admin' | 'Admin' | 'Manager' | 'Loan Officer' | 'Accountant' | 'Cashier' | 'Auditor' | 'Viewer';

export type Permission = string;

// Helper to flatten permissions object
export const getAllPermissions = (): Permission[] => {
  const allPerms: Permission[] = [];
  Object.values(PERMISSIONS).forEach(category => {
    Object.values(category).forEach(perm => {
      allPerms.push(perm);
    });
  });
  return allPerms;
};

// ============================================
// DEFAULT ROLE PERMISSIONS
// ============================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'Super Admin': getAllPermissions(), // All permissions

  'Admin': [
    // Dashboard - Full access
    ...Object.values(PERMISSIONS.DASHBOARD),
    
    // Clients - Full access
    ...Object.values(PERMISSIONS.CLIENTS),
    
    // Loans - Full access
    ...Object.values(PERMISSIONS.LOANS),
    
    // Approvals - Full access
    ...Object.values(PERMISSIONS.APPROVALS),
    
    // Repayments - Full access
    ...Object.values(PERMISSIONS.REPAYMENTS),
    
    // Accounting - Full access except deleting journal entries
    PERMISSIONS.ACCOUNTING.VIEW_ACCOUNTING,
    PERMISSIONS.ACCOUNTING.VIEW_FINANCIAL_STATEMENTS,
    PERMISSIONS.ACCOUNTING.VIEW_INCOME_STATEMENT,
    PERMISSIONS.ACCOUNTING.VIEW_BALANCE_SHEET,
    PERMISSIONS.ACCOUNTING.VIEW_CASH_FLOW,
    PERMISSIONS.ACCOUNTING.VIEW_TRIAL_BALANCE,
    PERMISSIONS.ACCOUNTING.VIEW_GENERAL_LEDGER,
    PERMISSIONS.ACCOUNTING.VIEW_JOURNAL_ENTRIES,
    PERMISSIONS.ACCOUNTING.CREATE_JOURNAL_ENTRY,
    PERMISSIONS.ACCOUNTING.EDIT_JOURNAL_ENTRY,
    PERMISSIONS.ACCOUNTING.VIEW_CHART_OF_ACCOUNTS,
    PERMISSIONS.ACCOUNTING.ADD_ACCOUNT,
    PERMISSIONS.ACCOUNTING.EDIT_ACCOUNT,
    PERMISSIONS.ACCOUNTING.EXPORT_FINANCIAL_REPORTS,
    PERMISSIONS.ACCOUNTING.VIEW_AUDIT_TRAIL,
    
    // Bank Accounts - Full access
    ...Object.values(PERMISSIONS.BANK_ACCOUNTS),
    
    // Other modules - Full access
    ...Object.values(PERMISSIONS.COLLECTION_SHEETS),
    ...Object.values(PERMISSIONS.CREDIT_SCORING),
    ...Object.values(PERMISSIONS.GROUPS),
    ...Object.values(PERMISSIONS.LOAN_PRODUCTS),
    ...Object.values(PERMISSIONS.SAVINGS),
    ...Object.values(PERMISSIONS.EXPENSES),
    ...Object.values(PERMISSIONS.STAFF),
    ...Object.values(PERMISSIONS.REPORTS),
    ...Object.values(PERMISSIONS.NOTIFICATIONS),
    
    // Settings - Most settings except system-critical
    PERMISSIONS.SETTINGS.VIEW_SETTINGS,
    PERMISSIONS.SETTINGS.EDIT_ORG_SETTINGS,
    PERMISSIONS.SETTINGS.MANAGE_CURRENCIES,
    PERMISSIONS.SETTINGS.MANAGE_BRANCHES,
    PERMISSIONS.SETTINGS.MANAGE_CUSTOM_FIELDS,
    PERMISSIONS.SETTINGS.VIEW_AUDIT_LOG,
    
    // AI Insights - View only
    PERMISSIONS.AI_INSIGHTS.VIEW_AI_INSIGHTS,
    PERMISSIONS.AI_INSIGHTS.VIEW_PREDICTIONS,
    PERMISSIONS.AI_INSIGHTS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.AI_INSIGHTS.VIEW_RISK_ANALYSIS,
    
    // Data Management - Full access
    ...Object.values(PERMISSIONS.DATA_MANAGEMENT),
  ],

  'Manager': [
    // Dashboard - Full view access
    ...Object.values(PERMISSIONS.DASHBOARD),
    
    // Clients - View and edit, no delete
    PERMISSIONS.CLIENTS.VIEW_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DETAILS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_LOANS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_PAYMENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DOCUMENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_GPS_LOCATION,
    PERMISSIONS.CLIENTS.ADD_CLIENT,
    PERMISSIONS.CLIENTS.EDIT_CLIENT,
    PERMISSIONS.CLIENTS.EDIT_CLIENT_PERSONAL_INFO,
    PERMISSIONS.CLIENTS.EXPORT_CLIENTS,
    PERMISSIONS.CLIENTS.SEND_SMS_TO_CLIENTS,
    PERMISSIONS.CLIENTS.SEND_EMAIL_TO_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_STATISTICS,
    
    // Loans - View, create, edit, no delete
    PERMISSIONS.LOANS.VIEW_LOANS,
    PERMISSIONS.LOANS.VIEW_LOAN_DETAILS,
    PERMISSIONS.LOANS.VIEW_LOAN_SCHEDULE,
    PERMISSIONS.LOANS.VIEW_LOAN_GUARANTORS,
    PERMISSIONS.LOANS.VIEW_LOAN_COMMENTS,
    PERMISSIONS.LOANS.VIEW_LOAN_DOCUMENTS,
    PERMISSIONS.LOANS.VIEW_LOAN_FINANCIALS,
    PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT,
    PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE,
    PERMISSIONS.LOANS.CREATE_LOAN,
    PERMISSIONS.LOANS.EDIT_LOAN,
    PERMISSIONS.LOANS.EDIT_LOAN_TERMS,
    PERMISSIONS.LOANS.ADD_GUARANTOR,
    PERMISSIONS.LOANS.REMOVE_GUARANTOR,
    PERMISSIONS.LOANS.ADD_COMMENT,
    PERMISSIONS.LOANS.EXPORT_LOANS,
    PERMISSIONS.LOANS.VIEW_LOAN_STATISTICS,
    
    // Approvals - Can approve phases 1-3
    PERMISSIONS.APPROVALS.VIEW_APPROVALS,
    PERMISSIONS.APPROVALS.VIEW_APPROVAL_DETAILS,
    PERMISSIONS.APPROVALS.APPROVE_PHASE_1,
    PERMISSIONS.APPROVALS.APPROVE_PHASE_2,
    PERMISSIONS.APPROVALS.APPROVE_PHASE_3,
    PERMISSIONS.APPROVALS.REJECT_APPROVAL,
    PERMISSIONS.APPROVALS.VIEW_APPROVAL_HISTORY,
    PERMISSIONS.APPROVALS.EXPORT_APPROVALS,
    
    // Repayments - View and approve
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENTS,
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENT_DETAILS,
    PERMISSIONS.REPAYMENTS.APPROVE_REPAYMENT,
    PERMISSIONS.REPAYMENTS.REJECT_REPAYMENT,
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENT_STATISTICS,
    PERMISSIONS.REPAYMENTS.EXPORT_REPAYMENTS,
    
    // Accounting - View only
    PERMISSIONS.ACCOUNTING.VIEW_ACCOUNTING,
    PERMISSIONS.ACCOUNTING.VIEW_FINANCIAL_STATEMENTS,
    PERMISSIONS.ACCOUNTING.VIEW_INCOME_STATEMENT,
    PERMISSIONS.ACCOUNTING.VIEW_BALANCE_SHEET,
    PERMISSIONS.ACCOUNTING.VIEW_CASH_FLOW,
    PERMISSIONS.ACCOUNTING.VIEW_TRIAL_BALANCE,
    PERMISSIONS.ACCOUNTING.VIEW_GENERAL_LEDGER,
    PERMISSIONS.ACCOUNTING.VIEW_JOURNAL_ENTRIES,
    PERMISSIONS.ACCOUNTING.VIEW_CHART_OF_ACCOUNTS,
    PERMISSIONS.ACCOUNTING.EXPORT_FINANCIAL_REPORTS,
    
    // Bank Accounts - View only
    PERMISSIONS.BANK_ACCOUNTS.VIEW_BANK_ACCOUNTS,
    PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE,
    PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTIONS,
    PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTION_DETAILS,
    PERMISSIONS.BANK_ACCOUNTS.EXPORT_TRANSACTIONS,
    
    // Collection Sheets - Full access
    ...Object.values(PERMISSIONS.COLLECTION_SHEETS),
    
    // Credit Scoring - View only
    PERMISSIONS.CREDIT_SCORING.VIEW_CREDIT_SCORES,
    PERMISSIONS.CREDIT_SCORING.VIEW_SCORE_DETAILS,
    PERMISSIONS.CREDIT_SCORING.VIEW_SCORE_FACTORS,
    PERMISSIONS.CREDIT_SCORING.EXPORT_CREDIT_SCORES,
    
    // Groups - Full access
    ...Object.values(PERMISSIONS.GROUPS),
    
    // Reports - Full view and export
    ...Object.values(PERMISSIONS.REPORTS),
    
    // Staff - View and assign
    PERMISSIONS.STAFF.VIEW_STAFF,
    PERMISSIONS.STAFF.VIEW_STAFF_DETAILS,
    PERMISSIONS.STAFF.VIEW_STAFF_PERFORMANCE,
    PERMISSIONS.STAFF.ASSIGN_LOANS,
    PERMISSIONS.STAFF.VIEW_ASSIGNMENTS,
    
    // Expenses - Approve
    PERMISSIONS.EXPENSES.VIEW_EXPENSES,
    PERMISSIONS.EXPENSES.VIEW_EXPENSE_DETAILS,
    PERMISSIONS.EXPENSES.APPROVE_EXPENSE,
    PERMISSIONS.EXPENSES.REJECT_EXPENSE,
    PERMISSIONS.EXPENSES.EXPORT_EXPENSES,
    
    // AI Insights - View only
    PERMISSIONS.AI_INSIGHTS.VIEW_AI_INSIGHTS,
    PERMISSIONS.AI_INSIGHTS.VIEW_PREDICTIONS,
    PERMISSIONS.AI_INSIGHTS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.AI_INSIGHTS.VIEW_RISK_ANALYSIS,
  ],

  'Loan Officer': [
    // Dashboard - View only
    PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
    PERMISSIONS.DASHBOARD.VIEW_METRICS,
    PERMISSIONS.DASHBOARD.VIEW_PORTFOLIO_SUMMARY,
    PERMISSIONS.DASHBOARD.VIEW_LOAN_ANALYTICS,
    
    // Clients - Full CRUD
    PERMISSIONS.CLIENTS.VIEW_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DETAILS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_LOANS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_PAYMENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_GPS_LOCATION,
    PERMISSIONS.CLIENTS.ADD_CLIENT,
    PERMISSIONS.CLIENTS.EDIT_CLIENT,
    PERMISSIONS.CLIENTS.EDIT_CLIENT_PERSONAL_INFO,
    PERMISSIONS.CLIENTS.EXPORT_CLIENTS,
    PERMISSIONS.CLIENTS.SEND_SMS_TO_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_STATISTICS,
    
    // Loans - Create and manage assigned loans
    PERMISSIONS.LOANS.VIEW_LOANS,
    PERMISSIONS.LOANS.VIEW_LOAN_DETAILS,
    PERMISSIONS.LOANS.VIEW_LOAN_SCHEDULE,
    PERMISSIONS.LOANS.VIEW_LOAN_GUARANTORS,
    PERMISSIONS.LOANS.VIEW_LOAN_COMMENTS,
    PERMISSIONS.LOANS.VIEW_LOAN_FINANCIALS,
    PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT,
    PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE,
    PERMISSIONS.LOANS.CREATE_LOAN,
    PERMISSIONS.LOANS.EDIT_LOAN,
    PERMISSIONS.LOANS.ADD_GUARANTOR,
    PERMISSIONS.LOANS.ADD_COMMENT,
    PERMISSIONS.LOANS.EXPORT_LOANS,
    
    // Approvals - Submit only
    PERMISSIONS.APPROVALS.VIEW_APPROVALS,
    PERMISSIONS.APPROVALS.VIEW_APPROVAL_DETAILS,
    PERMISSIONS.APPROVALS.VIEW_APPROVAL_HISTORY,
    
    // Repayments - View and record
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENTS,
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENT_DETAILS,
    PERMISSIONS.REPAYMENTS.RECORD_REPAYMENT,
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENT_STATISTICS,
    
    // Collection Sheets - View and generate
    PERMISSIONS.COLLECTION_SHEETS.VIEW_COLLECTION_SHEETS,
    PERMISSIONS.COLLECTION_SHEETS.GENERATE_COLLECTION_SHEET,
    PERMISSIONS.COLLECTION_SHEETS.EXPORT_COLLECTION_SHEET,
    PERMISSIONS.COLLECTION_SHEETS.RECORD_COLLECTIONS,
    
    // Credit Scoring - View only
    PERMISSIONS.CREDIT_SCORING.VIEW_CREDIT_SCORES,
    PERMISSIONS.CREDIT_SCORING.VIEW_SCORE_DETAILS,
    PERMISSIONS.CREDIT_SCORING.VIEW_SCORE_FACTORS,
    
    // Groups - View and manage
    PERMISSIONS.GROUPS.VIEW_GROUPS,
    PERMISSIONS.GROUPS.VIEW_GROUP_DETAILS,
    PERMISSIONS.GROUPS.VIEW_GROUP_MEMBERS,
    PERMISSIONS.GROUPS.ADD_GROUP,
    PERMISSIONS.GROUPS.EDIT_GROUP,
    PERMISSIONS.GROUPS.ADD_MEMBER,
    PERMISSIONS.GROUPS.REMOVE_MEMBER,
    
    // Reports - View and export
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.EXPORT_TO_PDF,
    PERMISSIONS.REPORTS.EXPORT_TO_EXCEL,
    PERMISSIONS.REPORTS.VIEW_PORTFOLIO_REPORT,
    PERMISSIONS.REPORTS.VIEW_COLLECTIONS_REPORT,
  ],

  'Accountant': [
    // Dashboard - View financial metrics
    PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
    PERMISSIONS.DASHBOARD.VIEW_METRICS,
    PERMISSIONS.DASHBOARD.VIEW_DISBURSEMENT_STATS,
    PERMISSIONS.DASHBOARD.VIEW_COLLECTION_STATS,
    
    // Clients - View only
    PERMISSIONS.CLIENTS.VIEW_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DETAILS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS,
    
    // Loans - View financial details
    PERMISSIONS.LOANS.VIEW_LOANS,
    PERMISSIONS.LOANS.VIEW_LOAN_DETAILS,
    PERMISSIONS.LOANS.VIEW_LOAN_FINANCIALS,
    PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT,
    PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE,
    
    // Repayments - Full access
    ...Object.values(PERMISSIONS.REPAYMENTS),
    
    // Accounting - Full access
    ...Object.values(PERMISSIONS.ACCOUNTING),
    
    // Bank Accounts - Full access
    ...Object.values(PERMISSIONS.BANK_ACCOUNTS),
    
    // Expenses - Full access
    ...Object.values(PERMISSIONS.EXPENSES),
    
    // Reports - Financial reports
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.GENERATE_CUSTOM_REPORT,
    PERMISSIONS.REPORTS.EXPORT_TO_PDF,
    PERMISSIONS.REPORTS.EXPORT_TO_EXCEL,
    PERMISSIONS.REPORTS.VIEW_PORTFOLIO_REPORT,
    PERMISSIONS.REPORTS.VIEW_COLLECTIONS_REPORT,
    PERMISSIONS.REPORTS.VIEW_DISBURSEMENT_REPORT,
    
    // Data Export
    PERMISSIONS.DATA_MANAGEMENT.EXPORT_DATA,
  ],

  'Cashier': [
    // Dashboard - Limited view
    PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
    PERMISSIONS.DASHBOARD.VIEW_COLLECTION_STATS,
    
    // Clients - View only
    PERMISSIONS.CLIENTS.VIEW_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DETAILS,
    
    // Loans - View details
    PERMISSIONS.LOANS.VIEW_LOANS,
    PERMISSIONS.LOANS.VIEW_LOAN_DETAILS,
    PERMISSIONS.LOANS.VIEW_LOAN_SCHEDULE,
    PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE,
    
    // Repayments - Record only
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENTS,
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENT_DETAILS,
    PERMISSIONS.REPAYMENTS.RECORD_REPAYMENT,
    
    // Collection Sheets - View and record
    PERMISSIONS.COLLECTION_SHEETS.VIEW_COLLECTION_SHEETS,
    PERMISSIONS.COLLECTION_SHEETS.RECORD_COLLECTIONS,
    
    // Bank Accounts - View transactions
    PERMISSIONS.BANK_ACCOUNTS.VIEW_BANK_ACCOUNTS,
    PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTIONS,
    PERMISSIONS.BANK_ACCOUNTS.ADD_TRANSACTION,
  ],

  'Auditor': [
    // Dashboard - Full view
    ...Object.values(PERMISSIONS.DASHBOARD),
    
    // Clients - View all
    PERMISSIONS.CLIENTS.VIEW_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DETAILS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_LOANS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_PAYMENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DOCUMENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_STATISTICS,
    PERMISSIONS.CLIENTS.EXPORT_CLIENTS,
    
    // Loans - View all
    PERMISSIONS.LOANS.VIEW_LOANS,
    PERMISSIONS.LOANS.VIEW_LOAN_DETAILS,
    PERMISSIONS.LOANS.VIEW_LOAN_SCHEDULE,
    PERMISSIONS.LOANS.VIEW_LOAN_GUARANTORS,
    PERMISSIONS.LOANS.VIEW_LOAN_COMMENTS,
    PERMISSIONS.LOANS.VIEW_LOAN_DOCUMENTS,
    PERMISSIONS.LOANS.VIEW_LOAN_FINANCIALS,
    PERMISSIONS.LOANS.VIEW_LOAN_AMOUNT,
    PERMISSIONS.LOANS.VIEW_OUTSTANDING_BALANCE,
    PERMISSIONS.LOANS.VIEW_LOAN_STATISTICS,
    PERMISSIONS.LOANS.EXPORT_LOANS,
    
    // Approvals - View history
    PERMISSIONS.APPROVALS.VIEW_APPROVALS,
    PERMISSIONS.APPROVALS.VIEW_APPROVAL_DETAILS,
    PERMISSIONS.APPROVALS.VIEW_APPROVAL_HISTORY,
    PERMISSIONS.APPROVALS.EXPORT_APPROVALS,
    
    // Repayments - View all
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENTS,
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENT_DETAILS,
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENT_STATISTICS,
    PERMISSIONS.REPAYMENTS.EXPORT_REPAYMENTS,
    
    // Accounting - View all including audit trail
    PERMISSIONS.ACCOUNTING.VIEW_ACCOUNTING,
    PERMISSIONS.ACCOUNTING.VIEW_FINANCIAL_STATEMENTS,
    PERMISSIONS.ACCOUNTING.VIEW_INCOME_STATEMENT,
    PERMISSIONS.ACCOUNTING.VIEW_BALANCE_SHEET,
    PERMISSIONS.ACCOUNTING.VIEW_CASH_FLOW,
    PERMISSIONS.ACCOUNTING.VIEW_TRIAL_BALANCE,
    PERMISSIONS.ACCOUNTING.VIEW_GENERAL_LEDGER,
    PERMISSIONS.ACCOUNTING.VIEW_JOURNAL_ENTRIES,
    PERMISSIONS.ACCOUNTING.VIEW_CHART_OF_ACCOUNTS,
    PERMISSIONS.ACCOUNTING.EXPORT_FINANCIAL_REPORTS,
    PERMISSIONS.ACCOUNTING.VIEW_AUDIT_TRAIL,
    
    // Bank Accounts - View all
    PERMISSIONS.BANK_ACCOUNTS.VIEW_BANK_ACCOUNTS,
    PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE,
    PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTIONS,
    PERMISSIONS.BANK_ACCOUNTS.VIEW_TRANSACTION_DETAILS,
    PERMISSIONS.BANK_ACCOUNTS.EXPORT_TRANSACTIONS,
    
    // All other modules - View and export only
    ...Object.values(PERMISSIONS.COLLECTION_SHEETS).filter(p => p.includes('view') || p.includes('export')),
    ...Object.values(PERMISSIONS.CREDIT_SCORING).filter(p => p.includes('view') || p.includes('export')),
    ...Object.values(PERMISSIONS.GROUPS).filter(p => p.includes('view') || p.includes('export')),
    ...Object.values(PERMISSIONS.REPORTS),
    
    // Settings - View audit log
    PERMISSIONS.SETTINGS.VIEW_SETTINGS,
    PERMISSIONS.SETTINGS.VIEW_AUDIT_LOG,
  ],

  'Viewer': [
    // Dashboard - View only
    PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
    PERMISSIONS.DASHBOARD.VIEW_METRICS,
    PERMISSIONS.DASHBOARD.VIEW_PORTFOLIO_SUMMARY,
    
    // Clients - View basic info
    PERMISSIONS.CLIENTS.VIEW_CLIENTS,
    PERMISSIONS.CLIENTS.VIEW_CLIENT_DETAILS,
    
    // Loans - View basic info
    PERMISSIONS.LOANS.VIEW_LOANS,
    PERMISSIONS.LOANS.VIEW_LOAN_DETAILS,
    
    // Repayments - View only
    PERMISSIONS.REPAYMENTS.VIEW_REPAYMENTS,
    
    // Reports - View only
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.VIEW_PORTFOLIO_REPORT,
  ],
};

// ============================================
// PERMISSION HELPER FUNCTIONS
// ============================================

/**
 * Check if a user has a specific permission
 * Checks both role-based permissions AND custom permissions
 */
export const hasPermission = (
  role: Role | undefined, 
  permission: Permission,
  customPermissions?: Permission[]
): boolean => {
  // First check custom permissions if provided
  if (customPermissions && Array.isArray(customPermissions)) {
    return customPermissions.includes(permission);
  }
  
  // Fall back to role-based permissions
  if (!role) return false;
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
};

/**
 * Check if a user has ANY of the specified permissions
 */
export const hasAnyPermission = (
  role: Role | undefined, 
  permissions: Permission[],
  customPermissions?: Permission[]
): boolean => {
  if (!role && !customPermissions) return false;
  return permissions.some(perm => hasPermission(role, perm, customPermissions));
};

/**
 * Check if a user has ALL of the specified permissions
 */
export const hasAllPermissions = (
  role: Role | undefined, 
  permissions: Permission[],
  customPermissions?: Permission[]
): boolean => {
  if (!role && !customPermissions) return false;
  return permissions.every(perm => hasPermission(role, perm, customPermissions));
};

/**
 * Get all permissions for a user (role + custom)
 */
export const getRolePermissions = (
  role: Role | undefined,
  customPermissions?: Permission[]
): Permission[] => {
  // If custom permissions exist, use those instead
  if (customPermissions && Array.isArray(customPermissions) && customPermissions.length > 0) {
    return customPermissions;
  }
  
  // Fall back to role permissions
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Get permissions by category for a user
 */
export const getRolePermissionsByCategory = (
  role: Role | undefined,
  customPermissions?: Permission[]
) => {
  const rolePerms = getRolePermissions(role, customPermissions);
  const categorized: Record<string, Permission[]> = {};
  
  Object.entries(PERMISSIONS).forEach(([category, perms]) => {
    const categoryPerms = Object.values(perms).filter(p => rolePerms.includes(p));
    if (categoryPerms.length > 0) {
      categorized[category] = categoryPerms;
    }
  });
  
  return categorized;
};