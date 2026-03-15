# Loan Table Column Name Reference

This document lists the **EXACT** column names in the `loans` table as defined in `/supabase/schema.sql`.

## ✅ CORRECT Column Names (schema.sql)

Use these exact names when working with the Supabase database:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| `id` | UUID PRIMARY KEY | Unique loan identifier |
| `loan_number` | TEXT UNIQUE | Human-readable loan number (e.g., "LN-20260313-0001") |
| `client_id` | UUID | Foreign key to clients table |
| `organization_id` | UUID | Foreign key to organizations table |
| `loan_product_id` | UUID | Foreign key to loan_products table |
| `loan_officer_id` | UUID | Foreign key to users table (staff who created the loan) |
| `principal_amount` | DECIMAL(15,2) | Original loan amount |
| `interest_rate` | DECIMAL(5,2) | Interest rate percentage (e.g., 7.5 for 7.5%) |
| **`duration_months`** | INTEGER | ⚠️ Loan term in months (NOT `loan_term`) |
| `processing_fee` | DECIMAL(10,2) | Processing/application fee |
| `insurance_fee` | DECIMAL(10,2) | Insurance fee |
| `total_amount` | DECIMAL(15,2) | Total amount to repay (principal + interest) |
| **`monthly_installment`** | DECIMAL(15,2) | ⚠️ Monthly payment amount (NOT `monthly_repayment`) |
| **`outstanding_balance`** | DECIMAL(15,2) | ⚠️ Current balance owed (NOT `total_outstanding`) |
| **`paid_amount`** | DECIMAL(15,2) | ⚠️ Total amount paid so far (NOT `total_paid`) |
| `purpose` | TEXT | Loan purpose (NOT `loan_purpose`) |
| `status` | TEXT | Loan status (pending, approved, disbursed, active, completed, etc.) |
| `application_date` | TIMESTAMP | When loan was applied for |
| `reviewed_by` | UUID | Staff who reviewed the loan |
| `reviewed_at` | TIMESTAMP | When loan was reviewed |
| `approved_by` | UUID | Staff who approved the loan |
| `approved_at` | TIMESTAMP | When loan was approved |
| `disbursed_by` | UUID | Staff who disbursed the loan |
| **`disbursed_at`** | TIMESTAMP | ⚠️ When loan was disbursed (THIS COLUMN EXISTS!) |
| `disbursement_method` | TEXT | How loan was disbursed (mpesa, bank_transfer, cash, cheque) |
| `disbursement_reference` | TEXT | Reference number for disbursement |
| `first_payment_date` | DATE | Date of first payment |
| `maturity_date` | DATE | Date when loan should be fully paid |
| `days_in_arrears` | INTEGER | Number of days overdue |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

## ❌ INCORRECT Column Names (DO NOT USE)

These column names **DO NOT EXIST** in schema.sql and will cause PGRST204 errors:

| ❌ Incorrect Name | ✅ Correct Name | Notes |
|------------------|-----------------|-------|
| `loan_term` | `duration_months` | Was causing insert errors |
| `monthly_repayment` | `monthly_installment` | Was causing insert errors |
| `total_outstanding` | `outstanding_balance` | Was causing query errors |
| `total_paid` | `paid_amount` | Was causing update errors |
| `interest_amount` | N/A | Does NOT exist in loans table |
| `loan_purpose` | `purpose` | Was causing insert errors |

## Code Examples

### ✅ CORRECT Loan Creation

```typescript
const loanRecord = {
  id: crypto.randomUUID(),
  organization_id: organizationId,
  client_id: clientId,
  principal_amount: 10000,
  interest_rate: 7.5,
  duration_months: 12,          // ✅ CORRECT
  total_amount: 19000,
  monthly_installment: 1583.33, // ✅ CORRECT
  outstanding_balance: 19000,   // ✅ CORRECT
  paid_amount: 0,               // ✅ CORRECT
  status: 'pending'
};
```

### ❌ INCORRECT Loan Creation (Old Code)

```typescript
const loanRecord = {
  id: crypto.randomUUID(),
  organization_id: organizationId,
  client_id: clientId,
  principal_amount: 10000,
  interest_rate: 7.5,
  loan_term: 12,              // ❌ WRONG - causes PGRST204
  total_amount: 19000,
  monthly_repayment: 1583.33, // ❌ WRONG - causes PGRST204
  total_outstanding: 19000,   // ❌ WRONG - causes PGRST204
  total_paid: 0,              // ❌ WRONG - causes PGRST204
  interest_amount: 9000,      // ❌ WRONG - doesn't exist
  status: 'pending'
};
```

## Schema Source

The **authoritative source** for column names is `/supabase/schema.sql` (lines 172-205).

The old `COMPLETE_DATABASE_SETUP.sql` file had different column names and should NOT be used as a reference.

## Testing

To verify your database has these exact columns, run:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'loans'
ORDER BY ordinal_position;
```

Or use the SQL file `/FIX_DISBURSED_AT_SCHEMA.sql` for comprehensive diagnostics.
