-- =====================================================
-- VERIFY LOANS TABLE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor to see EXACTLY what
-- columns exist in your loans table
-- =====================================================

-- Show all columns in the loans table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'loans'
ORDER BY 
    ordinal_position;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- You should see columns like:
--   id                    | uuid
--   organization_id       | uuid
--   client_id             | uuid
--   loan_product_id       | uuid
--   principal_amount      | numeric
--   interest_rate         | numeric
--   total_amount          | numeric
--   outstanding_balance   | numeric
--   paid_amount           | numeric
--   monthly_installment   | numeric
--   status                | varchar
--   created_at            | timestamp
--   updated_at            | timestamp
--
-- You should NOT see:
--   ❌ duration_months
--   ❌ disbursement_reference
--   ❌ application_date
--   ❌ first_payment_date
--   ❌ maturity_date
--   ❌ loan_officer_id
--
-- If these columns don't exist, that's why you got PGRST204 errors!
-- =====================================================

-- Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loans' AND column_name = 'duration_months'
    ) THEN '✅ duration_months EXISTS'
    ELSE '❌ duration_months DOES NOT EXIST (will cause PGRST204 error)'
    END as duration_months_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loans' AND column_name = 'disbursement_reference'
    ) THEN '✅ disbursement_reference EXISTS'
    ELSE '❌ disbursement_reference DOES NOT EXIST (will cause PGRST204 error)'
    END as disbursement_reference_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loans' AND column_name = 'loan_officer_id'
    ) THEN '✅ loan_officer_id EXISTS'
    ELSE '❌ loan_officer_id DOES NOT EXIST (will cause PGRST204 error)'
    END as loan_officer_id_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loans' AND column_name = 'application_date'
    ) THEN '✅ application_date EXISTS'
    ELSE '❌ application_date DOES NOT EXIST (will cause PGRST204 error)'
    END as application_date_status;

-- =====================================================
-- OPTIONAL: Add missing columns if you want these features
-- =====================================================

/*
-- Uncomment and run these if you want to add the missing columns:

-- Add loan duration/term tracking
ALTER TABLE loans ADD COLUMN IF NOT EXISTS duration_months INTEGER;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS term_unit VARCHAR(50) DEFAULT 'Months';

-- Add disbursement tracking
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursement_reference VARCHAR(100);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursement_date TIMESTAMP;

-- Add loan officer tracking
ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_officer_id UUID REFERENCES users(id);

-- Add date tracking
ALTER TABLE loans ADD COLUMN IF NOT EXISTS application_date TIMESTAMP DEFAULT NOW();
ALTER TABLE loans ADD COLUMN IF NOT EXISTS first_payment_date DATE;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS maturity_date DATE;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP;

-- Add arrears tracking
ALTER TABLE loans ADD COLUMN IF NOT EXISTS days_in_arrears INTEGER DEFAULT 0;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS arrears_amount NUMERIC DEFAULT 0;

-- Refresh schema cache after adding columns
NOTIFY pgrst, 'reload schema';

*/

-- =====================================================
-- After adding columns, remember to:
-- 1. Go to Supabase Dashboard → API
-- 2. Click "Refresh schema cache"
-- 3. Wait 30 seconds
-- 4. Remove the column names from the columnsToRemove array
--    in /services/supabaseDataService.ts
-- =====================================================
