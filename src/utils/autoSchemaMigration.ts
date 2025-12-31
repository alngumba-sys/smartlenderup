import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// ============================================
// AUTOMATIC SCHEMA MIGRATION UTILITY
// This utility checks for missing columns in Supabase tables
// and automatically adds them without manual SQL execution
// ============================================

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  default?: string | number | boolean | null;
  isJsonb?: boolean;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnDefinition[];
}

// ============================================
// COMPLETE SCHEMA DEFINITIONS FOR ALL TABLES
// Based on TypeScript interfaces in DataContext.tsx
// ============================================

export const EXPECTED_SCHEMAS: TableSchema[] = [
  // SHAREHOLDERS TABLE
  {
    tableName: 'shareholders',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'shareholder_id', type: 'TEXT' },
      { name: 'name', type: 'TEXT NOT NULL' },
      { name: 'email', type: 'TEXT' },
      { name: 'phone', type: 'TEXT NOT NULL' },
      { name: 'id_number', type: 'TEXT NOT NULL' },
      { name: 'address', type: 'TEXT', nullable: true },
      { name: 'share_capital', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'ownership_percentage', type: 'NUMERIC(5, 2)', default: 0 },
      { name: 'bank_account', type: 'JSONB', nullable: true, isJsonb: true },
      { name: 'join_date', type: 'TEXT NOT NULL' },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'total_dividends', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'shares', type: 'NUMERIC(10, 2)', default: 0 }, // Legacy column
      { name: 'share_value', type: 'NUMERIC(15, 2)', default: 0 }, // Legacy column
      { name: 'total_investment', type: 'NUMERIC(15, 2)', default: 0 }, // Legacy column
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // SHAREHOLDER_TRANSACTIONS TABLE
  {
    tableName: 'shareholder_transactions',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'shareholder_id', type: 'TEXT NOT NULL' },
      { name: 'transaction_type', type: 'TEXT NOT NULL' },
      { name: 'amount', type: 'NUMERIC(15, 2) NOT NULL' },
      { name: 'shares', type: 'NUMERIC(10, 2)', default: 0 },
      { name: 'transaction_date', type: 'TEXT NOT NULL' },
      { name: 'payment_method', type: 'TEXT' },
      { name: 'payment_reference', type: 'TEXT', nullable: true },
      { name: 'receipt_number', type: 'TEXT', nullable: true },
      { name: 'processed_by', type: 'TEXT', nullable: true },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'bank_account_id', type: 'TEXT', nullable: true },
      { name: 'description', type: 'TEXT', nullable: true }, // Legacy column
      { name: 'reference', type: 'TEXT', nullable: true }, // Legacy column
      { name: 'performed_by', type: 'TEXT', nullable: true }, // Legacy column
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // BANK_ACCOUNTS TABLE
  {
    tableName: 'bank_accounts',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'name', type: 'TEXT NOT NULL' },
      { name: 'account_type', type: 'TEXT NOT NULL' },
      { name: 'bank_name', type: 'TEXT' },
      { name: 'account_name', type: 'TEXT' },
      { name: 'account_number', type: 'TEXT' },
      { name: 'branch', type: 'TEXT', nullable: true },
      { name: 'currency', type: 'TEXT NOT NULL' },
      { name: 'balance', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'opening_balance', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'opening_date', type: 'TEXT NOT NULL' },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'created_by', type: 'TEXT', nullable: true },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'last_updated', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // EXPENSES TABLE
  {
    tableName: 'expenses',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'expense_id', type: 'TEXT' },
      { name: 'category', type: 'TEXT NOT NULL' },
      { name: 'subcategory', type: 'TEXT', nullable: true },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'amount', type: 'NUMERIC(15, 2) NOT NULL' },
      { name: 'payee_id', type: 'TEXT', nullable: true },
      { name: 'payee_name', type: 'TEXT', nullable: true },
      { name: 'payment_method', type: 'TEXT NOT NULL' },
      { name: 'payment_reference', type: 'TEXT', nullable: true },
      { name: 'expense_date', type: 'TEXT' },
      { name: 'payment_date', type: 'TEXT', nullable: true },
      { name: 'receipt_number', type: 'TEXT', nullable: true },
      { name: 'attachments', type: 'JSONB', nullable: true, isJsonb: true },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'approved_by', type: 'TEXT', nullable: true },
      { name: 'approved_date', type: 'TEXT', nullable: true },
      { name: 'paid_by', type: 'TEXT', nullable: true },
      { name: 'paid_date', type: 'TEXT', nullable: true },
      { name: 'created_by', type: 'TEXT', nullable: true },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'bank_account_id', type: 'TEXT', nullable: true },
      { name: 'payment_type', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // PAYEES TABLE
  {
    tableName: 'payees',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'name', type: 'TEXT NOT NULL' },
      { name: 'type', type: 'TEXT', nullable: true },
      { name: 'category', type: 'TEXT NOT NULL' },
      { name: 'email', type: 'TEXT', nullable: true },
      { name: 'phone', type: 'TEXT', nullable: true },
      { name: 'address', type: 'TEXT', nullable: true },
      { name: 'bank_account', type: 'JSONB', nullable: true, isJsonb: true },
      { name: 'mpesa_number', type: 'TEXT', nullable: true },
      { name: 'tax_pin', type: 'TEXT', nullable: true },
      { name: 'kra_pin', type: 'TEXT', nullable: true },
      { name: 'contact_person', type: 'TEXT', nullable: true },
      { name: 'total_paid', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'last_payment_date', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // GROUPS TABLE
  {
    tableName: 'groups',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'group_id', type: 'TEXT' },
      { name: 'name', type: 'TEXT NOT NULL' },
      { name: 'registration_date', type: 'TEXT NOT NULL' },
      { name: 'location', type: 'TEXT', nullable: true },
      { name: 'meeting_day', type: 'TEXT', nullable: true },
      { name: 'meeting_time', type: 'TEXT', nullable: true },
      { name: 'chairperson', type: 'TEXT NOT NULL' },
      { name: 'chairperson_phone', type: 'TEXT', nullable: true },
      { name: 'secretary', type: 'TEXT NOT NULL' },
      { name: 'secretary_phone', type: 'TEXT', nullable: true },
      { name: 'treasurer', type: 'TEXT NOT NULL' },
      { name: 'treasurer_phone', type: 'TEXT', nullable: true },
      { name: 'total_members', type: 'INTEGER', default: 0 },
      { name: 'active_members', type: 'INTEGER', default: 0 },
      { name: 'member_count', type: 'INTEGER', default: 0 }, // Legacy column
      { name: 'group_status', type: 'TEXT' },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'total_loans', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'total_savings', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'default_rate', type: 'NUMERIC(5, 2)', default: 0 },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // TASKS TABLE
  {
    tableName: 'tasks',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'title', type: 'TEXT NOT NULL' },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'category', type: 'TEXT', nullable: true },
      { name: 'priority', type: 'TEXT NOT NULL' },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'assigned_to', type: 'TEXT', nullable: true },
      { name: 'assigned_by', type: 'TEXT', nullable: true },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'due_date', type: 'TEXT NOT NULL' },
      { name: 'completed_date', type: 'TEXT', nullable: true },
      { name: 'related_entity_type', type: 'TEXT', nullable: true },
      { name: 'related_entity_id', type: 'TEXT', nullable: true },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // PAYROLL_RUNS TABLE
  {
    tableName: 'payroll_runs',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'run_id', type: 'TEXT' },
      { name: 'period', type: 'TEXT', nullable: true },
      { name: 'month', type: 'TEXT', nullable: true },
      { name: 'year', type: 'INTEGER', nullable: true },
      { name: 'pay_date', type: 'TEXT', nullable: true },
      { name: 'employees', type: 'JSONB', nullable: true, isJsonb: true },
      { name: 'total_gross_pay', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'total_gross', type: 'NUMERIC(15, 2)', default: 0 }, // Legacy column
      { name: 'total_deductions', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'total_net_pay', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'total_net', type: 'NUMERIC(15, 2)', default: 0 }, // Legacy column
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'created_by', type: 'TEXT', nullable: true },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'approved_by', type: 'TEXT', nullable: true },
      { name: 'approved_date', type: 'TEXT', nullable: true },
      { name: 'paid_date', type: 'TEXT', nullable: true },
      { name: 'processed_date', type: 'TEXT', nullable: true },
      { name: 'bank_account_id', type: 'TEXT', nullable: true },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // FUNDING_TRANSACTIONS TABLE
  {
    tableName: 'funding_transactions',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'transaction_id', type: 'TEXT' },
      { name: 'bank_account_id', type: 'TEXT NOT NULL' },
      { name: 'amount', type: 'NUMERIC(15, 2) NOT NULL' },
      { name: 'date', type: 'TEXT' },
      { name: 'transaction_date', type: 'TEXT', nullable: true },
      { name: 'reference', type: 'TEXT', nullable: true },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'source', type: 'TEXT NOT NULL' },
      { name: 'shareholder_id', type: 'TEXT', nullable: true },
      { name: 'shareholder_name', type: 'TEXT', nullable: true },
      { name: 'payment_method', type: 'TEXT', nullable: true },
      { name: 'depositor_name', type: 'TEXT', nullable: true },
      { name: 'transaction_type', type: 'TEXT', nullable: true },
      { name: 'related_loan_id', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // DISBURSEMENTS TABLE
  {
    tableName: 'disbursements',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'loan_id', type: 'TEXT NOT NULL' },
      { name: 'client_id', type: 'TEXT', nullable: true },
      { name: 'client_name', type: 'TEXT', nullable: true },
      { name: 'amount', type: 'NUMERIC(15, 2) NOT NULL' },
      { name: 'scheduled_date', type: 'TEXT', nullable: true },
      { name: 'actual_date', type: 'TEXT', nullable: true },
      { name: 'disbursement_date', type: 'TEXT', nullable: true },
      { name: 'channel', type: 'TEXT', nullable: true },
      { name: 'method', type: 'TEXT', nullable: true },
      { name: 'mpesa_number', type: 'TEXT', nullable: true },
      { name: 'bank_name', type: 'TEXT', nullable: true },
      { name: 'account_number', type: 'TEXT', nullable: true },
      { name: 'reference', type: 'TEXT', nullable: true },
      { name: 'reference_number', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'processed_by', type: 'TEXT', nullable: true },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'created_by', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // APPROVALS TABLE
  {
    tableName: 'approvals',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'loan_id', type: 'TEXT' },
      { name: 'type', type: 'TEXT', nullable: true },
      { name: 'title', type: 'TEXT', nullable: true },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'requested_by', type: 'TEXT', nullable: true },
      { name: 'request_date', type: 'TEXT', nullable: true },
      { name: 'amount', type: 'NUMERIC(15, 2)', nullable: true },
      { name: 'client_id', type: 'TEXT', nullable: true },
      { name: 'client_name', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'priority', type: 'TEXT', nullable: true },
      { name: 'approver', type: 'TEXT', nullable: true },
      { name: 'approver_role', type: 'TEXT', nullable: true },
      { name: 'approver_name', type: 'TEXT', nullable: true },
      { name: 'approval_date', type: 'TEXT', nullable: true },
      { name: 'decision_date', type: 'TEXT', nullable: true },
      { name: 'rejection_reason', type: 'TEXT', nullable: true },
      { name: 'related_id', type: 'TEXT', nullable: true },
      { name: 'phase', type: 'INTEGER', nullable: true },
      { name: 'stage', type: 'TEXT', nullable: true },
      { name: 'decision', type: 'TEXT', nullable: true },
      { name: 'comments', type: 'TEXT', nullable: true },
      { name: 'disbursement_data', type: 'JSONB', nullable: true, isJsonb: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // JOURNAL_ENTRIES TABLE
  {
    tableName: 'journal_entries',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'entry_id', type: 'TEXT' },
      { name: 'entry_number', type: 'TEXT', nullable: true },
      { name: 'entry_date', type: 'TEXT' },
      { name: 'date', type: 'TEXT', nullable: true },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'reference', type: 'TEXT', nullable: true },
      { name: 'source_type', type: 'TEXT', nullable: true },
      { name: 'reference_type', type: 'TEXT', nullable: true },
      { name: 'source_id', type: 'TEXT', nullable: true },
      { name: 'reference_id', type: 'TEXT', nullable: true },
      { name: 'lines', type: 'JSONB', nullable: true, isJsonb: true },
      { name: 'account', type: 'TEXT', nullable: true },
      { name: 'total_debit', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'debit', type: 'NUMERIC(15, 2)', default: 0 }, // Legacy column
      { name: 'total_credit', type: 'NUMERIC(15, 2)', default: 0 },
      { name: 'credit', type: 'NUMERIC(15, 2)', default: 0 }, // Legacy column
      { name: 'status', type: 'TEXT', nullable: true },
      { name: 'created_by', type: 'TEXT', nullable: true },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'posted_date', type: 'TEXT', nullable: true },
      { name: 'reversed_date', type: 'TEXT', nullable: true },
      { name: 'reversed_by', type: 'TEXT', nullable: true },
      { name: 'reversal_reason', type: 'TEXT', nullable: true },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // PROCESSING_FEE_RECORDS TABLE
  {
    tableName: 'processing_fee_records',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'loan_id', type: 'TEXT NOT NULL' },
      { name: 'client_id', type: 'TEXT', nullable: true },
      { name: 'client_name', type: 'TEXT', nullable: true },
      { name: 'amount', type: 'NUMERIC(15, 2)', nullable: true },
      { name: 'fee_amount', type: 'NUMERIC(15, 2) NOT NULL' },
      { name: 'percentage', type: 'NUMERIC(5, 2)', nullable: true },
      { name: 'loan_amount', type: 'NUMERIC(15, 2)', nullable: true },
      { name: 'recorded_date', type: 'TEXT', nullable: true },
      { name: 'collected_date', type: 'TEXT', nullable: true },
      { name: 'recorded_by', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT', nullable: true },
      { name: 'waived_by', type: 'TEXT', nullable: true },
      { name: 'waived_reason', type: 'TEXT', nullable: true },
      { name: 'payment_method', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // TICKETS TABLE
  {
    tableName: 'tickets',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'ticket_id', type: 'TEXT' },
      { name: 'ticket_number', type: 'TEXT', nullable: true },
      { name: 'client_id', type: 'TEXT', nullable: true },
      { name: 'client_name', type: 'TEXT', nullable: true },
      { name: 'subject', type: 'TEXT', nullable: true },
      { name: 'title', type: 'TEXT NOT NULL' },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'category', type: 'TEXT NOT NULL' },
      { name: 'priority', type: 'TEXT NOT NULL' },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'channel', type: 'TEXT', nullable: true },
      { name: 'assigned_to', type: 'TEXT', nullable: true },
      { name: 'raised_by', type: 'TEXT', nullable: true },
      { name: 'created_date', type: 'TEXT', nullable: true },
      { name: 'updated_date', type: 'TEXT', nullable: true },
      { name: 'resolved_date', type: 'TEXT', nullable: true },
      { name: 'resolution', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // KYC_RECORDS TABLE
  {
    tableName: 'kyc_records',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'client_id', type: 'TEXT NOT NULL' },
      { name: 'client_name', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT NOT NULL' },
      { name: 'risk_rating', type: 'TEXT', nullable: true },
      { name: 'last_review_date', type: 'TEXT', nullable: true },
      { name: 'next_review_date', type: 'TEXT', nullable: true },
      { name: 'national_id_verified', type: 'BOOLEAN', default: false },
      { name: 'address_verified', type: 'BOOLEAN', default: false },
      { name: 'phone_verified', type: 'BOOLEAN', default: false },
      { name: 'biometrics_collected', type: 'BOOLEAN', default: false },
      { name: 'documents_on_file', type: 'JSONB', nullable: true, isJsonb: true },
      { name: 'reviewed_by', type: 'TEXT', nullable: true },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'document_type', type: 'TEXT', nullable: true }, // Legacy column
      { name: 'verified_date', type: 'TEXT', nullable: true },
      { name: 'verified_by', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
  // AUDIT_LOGS TABLE
  {
    tableName: 'audit_logs',
    columns: [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'organization_id', type: 'TEXT NOT NULL' },
      { name: 'timestamp', type: 'TEXT', nullable: true },
      { name: 'user_id', type: 'TEXT', nullable: true },
      { name: 'user_name', type: 'TEXT', nullable: true },
      { name: 'performed_by', type: 'TEXT', nullable: true },
      { name: 'action', type: 'TEXT NOT NULL' },
      { name: 'module', type: 'TEXT', nullable: true },
      { name: 'entity_type', type: 'TEXT NOT NULL' },
      { name: 'entity_id', type: 'TEXT NOT NULL' },
      { name: 'changes', type: 'TEXT', nullable: true },
      { name: 'details', type: 'TEXT', nullable: true },
      { name: 'ip_address', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ],
  },
];

// ============================================
// SCHEMA CHECKING AND MIGRATION FUNCTIONS
// ============================================

export interface MigrationResult {
  success: boolean;
  tablesChecked: number;
  columnsAdded: number;
  errors: string[];
  details: {
    tableName: string;
    columnsAdded: string[];
    error?: string;
  }[];
}

/**
 * Get current columns for a table from Supabase
 */
async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: tableName,
    });

    if (error) {
      // If RPC doesn't exist, try querying information_schema directly
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName);

      if (schemaError) {
        console.warn(`Could not fetch columns for ${tableName}:`, schemaError);
        return [];
      }

      return schemaData?.map((col: any) => col.column_name) || [];
    }

    return data || [];
  } catch (error) {
    console.warn(`Error fetching columns for ${tableName}:`, error);
    return [];
  }
}

/**
 * Add a missing column to a Supabase table
 */
async function addMissingColumn(
  tableName: string,
  column: ColumnDefinition
): Promise<boolean> {
  try {
    let sqlStatement = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;

    // Add default value if specified
    if (column.default !== undefined) {
      if (typeof column.default === 'string') {
        sqlStatement += ` DEFAULT '${column.default}'`;
      } else if (column.default === null) {
        sqlStatement += ` DEFAULT NULL`;
      } else {
        sqlStatement += ` DEFAULT ${column.default}`;
      }
    }

    // Execute the ALTER TABLE statement
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: sqlStatement,
    });

    if (error) {
      console.error(`Failed to add column ${column.name} to ${tableName}:`, error);
      return false;
    }

    console.log(`✅ Added column ${column.name} to ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error adding column ${column.name} to ${tableName}:`, error);
    return false;
  }
}

/**
 * Main function to automatically migrate all schemas
 */
export async function autoMigrateSchemas(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    tablesChecked: 0,
    columnsAdded: 0,
    errors: [],
    details: [],
  };

  console.log('🔧 Starting automatic schema migration...');

  // First, create the helper RPC function if it doesn't exist
  await createHelperFunctions();

  for (const tableSchema of EXPECTED_SCHEMAS) {
    result.tablesChecked++;
    const tableResult = {
      tableName: tableSchema.tableName,
      columnsAdded: [] as string[],
    };

    try {
      // Get existing columns
      const existingColumns = await getTableColumns(tableSchema.tableName);

      // Check for missing columns
      for (const column of tableSchema.columns) {
        if (!existingColumns.includes(column.name)) {
          console.log(
            `⚠️ Missing column: ${tableSchema.tableName}.${column.name}`
          );

          // Add the missing column
          const added = await addMissingColumn(tableSchema.tableName, column);

          if (added) {
            tableResult.columnsAdded.push(column.name);
            result.columnsAdded++;
          } else {
            const errorMsg = `Failed to add ${tableSchema.tableName}.${column.name}`;
            result.errors.push(errorMsg);
            result.success = false;
          }
        }
      }

      if (tableResult.columnsAdded.length > 0) {
        result.details.push(tableResult);
      }
    } catch (error) {
      const errorMsg = `Error processing table ${tableSchema.tableName}: ${error}`;
      result.errors.push(errorMsg);
      result.success = false;
      tableResult.error = errorMsg;
      result.details.push(tableResult);
    }
  }

  // Log summary
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Tables checked: ${result.tablesChecked}`);
  console.log(`✅ Columns added: ${result.columnsAdded}`);
  console.log(`❌ Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.error('\n❌ Errors encountered:');
    result.errors.forEach((error) => console.error(`  - ${error}`));
  }

  return result;
}

/**
 * Create helper RPC functions in Supabase for schema operations
 */
async function createHelperFunctions(): Promise<void> {
  try {
    // Create function to get table columns
    const getColumnsSQL = `
      CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
      RETURNS TABLE(column_name TEXT) AS $$
      BEGIN
        RETURN QUERY
        SELECT c.column_name::TEXT
        FROM information_schema.columns c
        WHERE c.table_name = get_table_columns.table_name
        AND c.table_schema = 'public';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Create function to execute dynamic SQL
    const executeSQLFunc = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_statement TEXT)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql_statement;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Try to create the functions
    await supabase.rpc('execute_sql', { sql_statement: getColumnsSQL });
    await supabase.rpc('execute_sql', { sql_statement: executeSQLFunc });
  } catch (error) {
    console.warn('Helper functions may already exist or could not be created:', error);
  }
}

/**
 * Check a specific table for missing columns
 */
export async function checkTableSchema(
  tableName: string
): Promise<{
  exists: boolean;
  missingColumns: string[];
}> {
  const tableSchema = EXPECTED_SCHEMAS.find((s) => s.tableName === tableName);

  if (!tableSchema) {
    return { exists: false, missingColumns: [] };
  }

  const existingColumns = await getTableColumns(tableName);
  const missingColumns = tableSchema.columns
    .filter((col) => !existingColumns.includes(col.name))
    .map((col) => col.name);

  return {
    exists: true,
    missingColumns,
  };
}

/**
 * Migrate a specific table
 */
export async function migrateTable(tableName: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    tablesChecked: 1,
    columnsAdded: 0,
    errors: [],
    details: [],
  };

  const tableSchema = EXPECTED_SCHEMAS.find((s) => s.tableName === tableName);

  if (!tableSchema) {
    result.success = false;
    result.errors.push(`Table schema definition not found: ${tableName}`);
    return result;
  }

  const tableResult = {
    tableName,
    columnsAdded: [] as string[],
  };

  try {
    const existingColumns = await getTableColumns(tableName);

    for (const column of tableSchema.columns) {
      if (!existingColumns.includes(column.name)) {
        const added = await addMissingColumn(tableName, column);

        if (added) {
          tableResult.columnsAdded.push(column.name);
          result.columnsAdded++;
        } else {
          const errorMsg = `Failed to add ${tableName}.${column.name}`;
          result.errors.push(errorMsg);
          result.success = false;
        }
      }
    }

    result.details.push(tableResult);
  } catch (error) {
    const errorMsg = `Error processing table ${tableName}: ${error}`;
    result.errors.push(errorMsg);
    result.success = false;
    tableResult.error = errorMsg;
    result.details.push(tableResult);
  }

  return result;
}

/**
 * Display migration results as a toast notification
 */
export function showMigrationResults(result: MigrationResult): void {
  if (result.columnsAdded === 0 && result.errors.length === 0) {
    toast.success('✅ Schema is up to date', {
      description: 'All tables have the required columns',
    });
    return;
  }

  if (result.columnsAdded > 0) {
    const message = `Added ${result.columnsAdded} missing column${
      result.columnsAdded > 1 ? 's' : ''
    }`;
    const details = result.details
      .filter((d) => d.columnsAdded.length > 0)
      .map((d) => `${d.tableName}: ${d.columnsAdded.join(', ')}`)
      .join('\n');

    toast.success('✅ Schema Migration Complete', {
      description: `${message}\n${details}`,
      duration: 5000,
    });
  }

  if (result.errors.length > 0) {
    toast.error('❌ Schema Migration Errors', {
      description: result.errors.slice(0, 3).join('\n'),
      duration: 7000,
    });
  }
}
