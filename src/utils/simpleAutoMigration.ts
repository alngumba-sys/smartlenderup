import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// ============================================
// SIMPLE AUTO SCHEMA MIGRATION
// Works without custom RPC functions by using
// direct table queries to detect missing columns
// ============================================

export interface TableColumnMap {
  [tableName: string]: string[];
}

/**
 * Expected columns for each table
 * This is the source of truth for schema validation
 */
export const EXPECTED_TABLE_COLUMNS: TableColumnMap = {
  shareholders: [
    'id',
    'organization_id',
    'shareholder_id',
    'name',
    'email',
    'phone',
    'id_number',
    'address',
    'share_capital',
    'ownership_percentage',
    'bank_account',
    'join_date',
    'status',
    'total_dividends',
    'shares',
    'share_value',
    'total_investment',
    'created_at',
    'updated_at',
  ],
  shareholder_transactions: [
    'id',
    'organization_id',
    'shareholder_id',
    'transaction_type',
    'amount',
    'shares',
    'transaction_date',
    'payment_method',
    'payment_reference',
    'receipt_number',
    'processed_by',
    'notes',
    'bank_account_id',
    'description',
    'reference',
    'performed_by',
    'created_at',
    'updated_at',
  ],
  bank_accounts: [
    'id',
    'organization_id',
    'name',
    'account_type',
    'bank_name',
    'account_name',
    'account_number',
    'branch',
    'currency',
    'balance',
    'opening_balance',
    'opening_date',
    'status',
    'description',
    'created_by',
    'created_date',
    'last_updated',
    'created_at',
    'updated_at',
  ],
  expenses: [
    'id',
    'organization_id',
    'expense_id',
    'category',
    'subcategory',
    'description',
    'amount',
    'payee_id',
    'payee_name',
    'payment_method',
    'payment_reference',
    'expense_date',
    'payment_date',
    'receipt_number',
    'attachments',
    'status',
    'approved_by',
    'approved_date',
    'paid_by',
    'paid_date',
    'created_by',
    'created_date',
    'bank_account_id',
    'payment_type',
    'created_at',
    'updated_at',
  ],
  payees: [
    'id',
    'organization_id',
    'name',
    'type',
    'category',
    'email',
    'phone',
    'address',
    'bank_account',
    'mpesa_number',
    'tax_pin',
    'kra_pin',
    'contact_person',
    'total_paid',
    'last_payment_date',
    'status',
    'created_date',
    'created_at',
    'updated_at',
  ],
  groups: [
    'id',
    'organization_id',
    'group_id',
    'name',
    'registration_date',
    'location',
    'meeting_day',
    'meeting_time',
    'chairperson',
    'chairperson_phone',
    'secretary',
    'secretary_phone',
    'treasurer',
    'treasurer_phone',
    'total_members',
    'active_members',
    'member_count',
    'group_status',
    'status',
    'total_loans',
    'total_savings',
    'default_rate',
    'created_at',
    'updated_at',
  ],
  tasks: [
    'id',
    'organization_id',
    'title',
    'description',
    'category',
    'priority',
    'status',
    'assigned_to',
    'assigned_by',
    'created_date',
    'due_date',
    'completed_date',
    'related_entity_type',
    'related_entity_id',
    'notes',
    'created_at',
    'updated_at',
  ],
  payroll_runs: [
    'id',
    'organization_id',
    'run_id',
    'period',
    'month',
    'year',
    'pay_date',
    'employees',
    'total_gross_pay',
    'total_gross',
    'total_deductions',
    'total_net_pay',
    'total_net',
    'status',
    'created_by',
    'created_date',
    'approved_by',
    'approved_date',
    'paid_date',
    'processed_date',
    'bank_account_id',
    'notes',
    'created_at',
    'updated_at',
  ],
  funding_transactions: [
    'id',
    'organization_id',
    'transaction_id',
    'bank_account_id',
    'amount',
    'date',
    'transaction_date',
    'reference',
    'description',
    'source',
    'shareholder_id',
    'shareholder_name',
    'payment_method',
    'depositor_name',
    'transaction_type',
    'related_loan_id',
    'created_at',
    'updated_at',
  ],
  disbursements: [
    'id',
    'organization_id',
    'loan_id',
    'client_id',
    'client_name',
    'amount',
    'scheduled_date',
    'actual_date',
    'disbursement_date',
    'channel',
    'method',
    'mpesa_number',
    'bank_name',
    'account_number',
    'reference',
    'reference_number',
    'status',
    'processed_by',
    'notes',
    'created_date',
    'created_by',
    'created_at',
    'updated_at',
  ],
  approvals: [
    'id',
    'organization_id',
    'loan_id',
    'type',
    'title',
    'description',
    'requested_by',
    'request_date',
    'amount',
    'client_id',
    'client_name',
    'status',
    'priority',
    'approver',
    'approver_role',
    'approver_name',
    'approval_date',
    'decision_date',
    'rejection_reason',
    'related_id',
    'phase',
    'stage',
    'decision',
    'comments',
    'disbursement_data',
    'created_at',
    'updated_at',
  ],
  journal_entries: [
    'id',
    'organization_id',
    'entry_id',
    'entry_number',
    'entry_date',
    'date',
    'description',
    'reference',
    'source_type',
    'reference_type',
    'source_id',
    'reference_id',
    'lines',
    'account',
    'total_debit',
    'debit',
    'total_credit',
    'credit',
    'status',
    'created_by',
    'created_date',
    'posted_date',
    'reversed_date',
    'reversed_by',
    'reversal_reason',
    'notes',
    'created_at',
    'updated_at',
  ],
  processing_fee_records: [
    'id',
    'organization_id',
    'loan_id',
    'client_id',
    'client_name',
    'amount',
    'fee_amount',
    'percentage',
    'loan_amount',
    'recorded_date',
    'collected_date',
    'recorded_by',
    'status',
    'waived_by',
    'waived_reason',
    'payment_method',
    'created_at',
    'updated_at',
  ],
  tickets: [
    'id',
    'organization_id',
    'ticket_id',
    'ticket_number',
    'client_id',
    'client_name',
    'subject',
    'title',
    'description',
    'category',
    'priority',
    'status',
    'channel',
    'assigned_to',
    'raised_by',
    'created_date',
    'updated_date',
    'resolved_date',
    'resolution',
    'created_at',
    'updated_at',
  ],
  kyc_records: [
    'id',
    'organization_id',
    'client_id',
    'client_name',
    'status',
    'risk_rating',
    'last_review_date',
    'next_review_date',
    'national_id_verified',
    'address_verified',
    'phone_verified',
    'biometrics_collected',
    'documents_on_file',
    'reviewed_by',
    'notes',
    'document_type',
    'verified_date',
    'verified_by',
    'created_at',
    'updated_at',
  ],
  audit_logs: [
    'id',
    'organization_id',
    'timestamp',
    'user_id',
    'user_name',
    'performed_by',
    'action',
    'module',
    'entity_type',
    'entity_id',
    'changes',
    'details',
    'ip_address',
    'status',
    'created_at',
  ],
};

export interface MigrationCheckResult {
  tableName: string;
  exists: boolean;
  missingColumns: string[];
  error?: string;
}

/**
 * Check if a table exists and identify missing columns
 * by attempting to select all columns and catching the error
 */
export async function checkTableColumns(
  tableName: string,
  organizationId?: string
): Promise<MigrationCheckResult> {
  const expectedColumns = EXPECTED_TABLE_COLUMNS[tableName];

  if (!expectedColumns) {
    return {
      tableName,
      exists: false,
      missingColumns: [],
      error: 'Table not defined in expected schema',
    };
  }

  const missingColumns: string[] = [];

  try {
    // Try to select from the table to check if it exists
    const testQuery = supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (organizationId) {
      testQuery.eq('organization_id', organizationId);
    }

    const { error: tableError } = await testQuery;

    if (tableError) {
      // Table doesn't exist
      if (tableError.message.includes('does not exist')) {
        return {
          tableName,
          exists: false,
          missingColumns: expectedColumns,
          error: 'Table does not exist',
        };
      }
    }

    // Check each column individually
    for (const column of expectedColumns) {
      try {
        const { error: columnError } = await supabase
          .from(tableName)
          .select(column)
          .limit(1);

        if (columnError) {
          // Column is missing if we get a "column does not exist" error
          if (
            columnError.message.includes('does not exist') ||
            columnError.message.includes(`column "${column}"`)
          ) {
            missingColumns.push(column);
          }
        }
      } catch (err) {
        // Column likely doesn't exist
        missingColumns.push(column);
      }
    }

    return {
      tableName,
      exists: true,
      missingColumns,
    };
  } catch (error: any) {
    return {
      tableName,
      exists: false,
      missingColumns: [],
      error: error.message,
    };
  }
}

/**
 * Check all tables for missing columns
 */
export async function checkAllTables(
  organizationId?: string
): Promise<MigrationCheckResult[]> {
  const tables = Object.keys(EXPECTED_TABLE_COLUMNS);
  const results: MigrationCheckResult[] = [];

  console.log('🔍 Checking schema for all tables...');

  for (const tableName of tables) {
    const result = await checkTableColumns(tableName, organizationId);
    results.push(result);

    if (result.missingColumns.length > 0) {
      console.warn(
        `⚠️ ${tableName}: Missing ${result.missingColumns.length} columns`,
        result.missingColumns
      );
    } else if (result.exists) {
      console.log(`✅ ${tableName}: All columns present`);
    }
  }

  return results;
}

/**
 * Generate SQL migration script for missing columns
 */
export function generateMigrationSQL(
  results: MigrationCheckResult[]
): string {
  let sql = `-- ============================================\n`;
  sql += `-- AUTO-GENERATED SCHEMA MIGRATION\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- ============================================\n\n`;

  const tablesWithMissingColumns = results.filter(
    (r) => r.missingColumns.length > 0
  );

  if (tablesWithMissingColumns.length === 0) {
    sql += `-- ✅ No missing columns detected!\n`;
    sql += `-- All tables have the required schema.\n`;
    return sql;
  }

  for (const result of tablesWithMissingColumns) {
    sql += `-- Table: ${result.tableName}\n`;
    sql += `-- Missing ${result.missingColumns.length} column(s)\n`;
    sql += `ALTER TABLE ${result.tableName}\n`;

    const columnDefinitions: string[] = [];

    for (const column of result.missingColumns) {
      // Determine column type based on common patterns
      let columnDef = '';

      if (column.includes('_id') || column === 'id') {
        columnDef = `  ADD COLUMN IF NOT EXISTS ${column} TEXT`;
      } else if (
        column.includes('amount') ||
        column.includes('balance') ||
        column.includes('capital') ||
        column.includes('percentage') ||
        column.includes('rate')
      ) {
        columnDef = `  ADD COLUMN IF NOT EXISTS ${column} NUMERIC(15, 2) DEFAULT 0`;
      } else if (
        column.includes('date') ||
        column.includes('_at') ||
        column === 'timestamp'
      ) {
        if (column === 'created_at' || column === 'updated_at') {
          columnDef = `  ADD COLUMN IF NOT EXISTS ${column} TIMESTAMP DEFAULT NOW()`;
        } else {
          columnDef = `  ADD COLUMN IF NOT EXISTS ${column} TEXT`;
        }
      } else if (
        column.includes('_verified') ||
        column.includes('_collected') ||
        column.includes('_required')
      ) {
        columnDef = `  ADD COLUMN IF NOT EXISTS ${column} BOOLEAN DEFAULT FALSE`;
      } else if (
        column.includes('count') ||
        column.includes('members') ||
        column === 'year'
      ) {
        columnDef = `  ADD COLUMN IF NOT EXISTS ${column} INTEGER DEFAULT 0`;
      } else if (
        column === 'bank_account' ||
        column === 'attachments' ||
        column === 'employees' ||
        column === 'lines' ||
        column === 'documents_on_file' ||
        column === 'disbursement_data'
      ) {
        columnDef = `  ADD COLUMN IF NOT EXISTS ${column} JSONB`;
      } else {
        columnDef = `  ADD COLUMN IF NOT EXISTS ${column} TEXT`;
      }

      columnDefinitions.push(columnDef);
    }

    sql += columnDefinitions.join(',\n');
    sql += `;\n\n`;
  }

  sql += `-- ============================================\n`;
  sql += `-- MIGRATION COMPLETE\n`;
  sql += `-- ============================================\n`;

  return sql;
}

/**
 * Main function to check schemas and generate migration
 */
export async function autoCheckAndMigrate(
  organizationId?: string
): Promise<{
  needsMigration: boolean;
  results: MigrationCheckResult[];
  sql: string;
}> {
  console.log('🔧 Running automatic schema check...');

  const results = await checkAllTables(organizationId);
  const tablesWithMissingColumns = results.filter(
    (r) => r.missingColumns.length > 0
  );

  const needsMigration = tablesWithMissingColumns.length > 0;
  const sql = generateMigrationSQL(results);

  if (needsMigration) {
    const totalMissing = tablesWithMissingColumns.reduce(
      (sum, r) => sum + r.missingColumns.length,
      0
    );

    console.warn(
      `⚠️ Found ${totalMissing} missing columns across ${tablesWithMissingColumns.length} tables`
    );
    console.log('📝 Generated migration SQL:');
    console.log(sql);
  } else {
    console.log('✅ All table schemas are up to date!');
  }

  return {
    needsMigration,
    results,
    sql,
  };
}

/**
 * Show migration results to user
 */
export function showMigrationNotification(
  needsMigration: boolean,
  results: MigrationCheckResult[],
  sql: string
): void {
  if (!needsMigration) {
    toast.success('✅ Database Schema Up to Date', {
      description: 'All tables have the required columns',
    });
    return;
  }

  const tablesWithMissing = results.filter((r) => r.missingColumns.length > 0);
  const totalMissing = tablesWithMissing.reduce(
    (sum, r) => sum + r.missingColumns.length,
    0
  );

  toast.warning('⚠️ Schema Migration Required', {
    description: `Found ${totalMissing} missing columns. Check console for SQL migration script.`,
    duration: 8000,
    action: {
      label: 'Copy SQL',
      onClick: () => {
        navigator.clipboard.writeText(sql);
        toast.success('✅ Migration SQL copied to clipboard');
      },
    },
  });

  console.log('\n' + '='.repeat(60));
  console.log('📋 COPY THIS SQL TO SUPABASE SQL EDITOR:');
  console.log('='.repeat(60) + '\n');
  console.log(sql);
  console.log('\n' + '='.repeat(60));
  console.log('');
  console.log('💡 QUICK TIP:');
  console.log('   A pre-generated migration file is available at:');
  console.log('   📁 /supabase/FIX_ALL_MISSING_COLUMNS.sql');
  console.log('');
  console.log('📖 GUIDES:');
  console.log('   - Quick Start: /QUICK_FIX_CARD.md');
  console.log('   - Detailed: /FIX_SCHEMA_NOW.md');
  console.log('   - Overview: /START_HERE_SCHEMA_FIX.md');
  console.log('');
  console.log('='.repeat(60));
}

/**
 * Download migration SQL as a file
 */
export function downloadMigrationSQL(sql: string): void {
  const blob = new Blob([sql], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `schema_migration_${new Date().toISOString().split('T')[0]}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success('✅ Migration SQL downloaded', {
    description: 'Apply the SQL file in Supabase SQL Editor',
  });
}