// Staff and Permission Types

export type StaffRole = 'manager' | 'staff' | 'loan_officer' | 'accountant' | 'collector';

export interface TabPermission {
  tab_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface StaffUser {
  id: string;
  organization_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  password_hash?: string;
  role: StaffRole;
  is_first_login: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  permissions?: TabPermission[];
}

export interface StaffPermission {
  id: string;
  staff_user_id: string;
  tab_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const AVAILABLE_TABS = [
  { name: 'Dashboard', key: 'dashboard' },
  { name: 'Operations - Loans', key: 'operations_loans' },
  { name: 'Operations - Loan Products', key: 'operations_products' },
  { name: 'Operations - Clients', key: 'operations_clients' },
  { name: 'Operations - Groups', key: 'operations_groups' },
  { name: 'Accounting - Chart of Accounts', key: 'accounting_chart' },
  { name: 'Accounting - Journal Entries', key: 'accounting_journal' },
  { name: 'Accounting - Trial Balance', key: 'accounting_trial' },
  { name: 'Reports - PAR Report', key: 'reports_par' },
  { name: 'Reports - Collections Report', key: 'reports_collections' },
  { name: 'Reports - Management Report', key: 'reports_management' },
  { name: 'Payroll', key: 'payroll' },
  { name: 'AI Tools', key: 'ai_tools' },
  { name: 'Settings', key: 'settings' },
] as const;

export type TabKey = typeof AVAILABLE_TABS[number]['key'];