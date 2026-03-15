-- ═══════════════════════════════════════════════════════════════════
-- 🚀 BYPASS SCHEMA CACHE: Create RPC Function for Loan Insertion
-- ═══════════════════════════════════════════════════════════════════
-- This creates a stored procedure that bypasses PostgREST's schema cache
-- ═══════════════════════════════════════════════════════════════════

-- Drop if exists (safe to run multiple times)
DROP FUNCTION IF EXISTS create_loan_bypass_cache(jsonb);

-- Create the function
CREATE OR REPLACE FUNCTION create_loan_bypass_cache(loan_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_loan_id uuid;
  result jsonb;
BEGIN
  -- Insert the loan using direct SQL (bypasses PostgREST cache)
  INSERT INTO public.loans (
    id,
    organization_id,
    client_id,
    principal_amount,
    interest_rate,
    duration_months,
    status,
    total_amount,
    monthly_installment,
    outstanding_balance,
    paid_amount,
    loan_number,
    loan_product_id,
    purpose,
    processing_fee,
    disbursed_at,
    first_payment_date,
    maturity_date,
    disbursement_method,
    disbursement_reference,
    approval_stage,
    current_approver_role_id,
    created_at,
    updated_at
  )
  VALUES (
    COALESCE((loan_data->>'id')::uuid, gen_random_uuid()),
    (loan_data->>'organization_id')::uuid,
    (loan_data->>'client_id')::uuid,
    (loan_data->>'principal_amount')::decimal,
    (loan_data->>'interest_rate')::decimal,
    (loan_data->>'duration_months')::integer,
    COALESCE(loan_data->>'status', 'Pending'),
    (loan_data->>'total_amount')::decimal,
    (loan_data->>'monthly_installment')::decimal,
    (loan_data->>'outstanding_balance')::decimal,
    COALESCE((loan_data->>'paid_amount')::decimal, 0),
    loan_data->>'loan_number',
    (loan_data->>'loan_product_id')::uuid,
    loan_data->>'purpose',
    (loan_data->>'processing_fee')::decimal,
    (loan_data->>'disbursed_at')::date,
    (loan_data->>'first_payment_date')::date,
    (loan_data->>'maturity_date')::date,
    loan_data->>'disbursement_method',
    loan_data->>'disbursement_reference',
    loan_data->>'approval_stage',
    (loan_data->>'current_approver_role_id')::uuid,
    COALESCE((loan_data->>'created_at')::timestamptz, NOW()),
    COALESCE((loan_data->>'updated_at')::timestamptz, NOW())
  )
  RETURNING id INTO new_loan_id;

  -- Return the new loan ID
  result := jsonb_build_object('id', new_loan_id);
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating loan: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_loan_bypass_cache(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION create_loan_bypass_cache(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION create_loan_bypass_cache(jsonb) TO service_role;

-- ═══════════════════════════════════════════════════════════════════
-- ✅ VERIFICATION: Test the function
-- ═══════════════════════════════════════════════════════════════════

-- This should show the function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_loan_bypass_cache';

-- ═══════════════════════════════════════════════════════════════════
-- 📋 AFTER RUNNING THIS:
-- ═══════════════════════════════════════════════════════════════════
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Check that you see "create_loan_bypass_cache | FUNCTION" in results
-- 3. The code will automatically use this RPC function
-- 4. NO WAITING REQUIRED - RPC functions work immediately!
-- ═══════════════════════════════════════════════════════════════════
