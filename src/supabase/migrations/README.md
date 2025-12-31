# Loan Products Database Migration Instructions

## Overview
This migration adds missing columns to the `loan_products` table to support all fields shown in the Create Loan Product form.

## New Columns Being Added
1. **repayment_frequency** - TEXT field to store loan repayment frequency (daily, weekly, monthly, etc.)
2. **insurance_fee_fixed** - DECIMAL(10,2) field to store fixed insurance fee amount
3. **interest_method** - TEXT field for interest calculation method (should already exist, added as fallback)

## How to Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase Dashboard
2. Navigate to the **SQL Editor** tab
3. Open the file `/supabase/migrations/add_loan_product_fields.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute the migration
7. You should see success messages like:
   - "Added repayment_frequency column"
   - "Added insurance_fee_fixed column"

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## Verification

After running the migration, verify the columns exist:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'loan_products'
AND column_name IN ('repayment_frequency', 'insurance_fee_fixed', 'interest_method')
ORDER BY column_name;
```

You should see:
- **interest_method** - text - NULL
- **insurance_fee_fixed** - numeric - 0
- **repayment_frequency** - text - 'monthly'::text

## What This Fixes

Before this migration:
- ❌ Interest Type field wasn't saved (always reset to "Flat")
- ❌ Repayment Frequency field wasn't saved (always reset to "Monthly")
- ❌ Insurance Fee field wasn't saved (always reset to 0)

After this migration:
- ✅ All form fields are properly saved to Supabase
- ✅ Values persist after page refresh
- ✅ Complete data integrity

## Field Mappings (UI ↔ Database)

| UI Field | Database Column | Type | Default |
|----------|----------------|------|---------|
| Product Name | product_name | TEXT | - |
| Status | status | TEXT | 'active' |
| Description | description | TEXT | 'No description' |
| Interest Rate (%) | interest_rate | DECIMAL(5,2) | 0 |
| Interest Type | interest_method | TEXT | 'flat' |
| Repayment Frequency | repayment_frequency | TEXT | 'monthly' |
| Minimum Amount | min_amount | DECIMAL(15,2) | 0 |
| Maximum Amount | max_amount | DECIMAL(15,2) | 10000000 |
| Minimum Tenor | min_duration_months | INTEGER | 1 |
| Maximum Tenor | max_duration_months | INTEGER | 60 |
| Processing Fee | processing_fee_fixed | DECIMAL(10,2) | 0 |
| Insurance Fee | insurance_fee_fixed | DECIMAL(10,2) | 0 |

## Rollback (if needed)

If you need to undo this migration:

```sql
-- Remove the new columns
ALTER TABLE loan_products DROP COLUMN IF EXISTS repayment_frequency;
ALTER TABLE loan_products DROP COLUMN IF EXISTS insurance_fee_fixed;
-- Note: Don't drop interest_method as it may be in use
```

## Support

If you encounter any errors:
1. Check the console for error messages
2. Verify you have proper permissions on the loan_products table
3. Ensure no other migrations are running simultaneously
4. Contact support if the issue persists
