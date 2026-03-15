-- ═══════════════════════════════════════════════════════════════════
-- 🔥 ULTIMATE BYPASS: Create Loan Using Raw SQL (NO POSTGREST!)
-- ═══════════════════════════════════════════════════════════════════
-- This function executes raw SQL and returns JSON
-- ZERO dependency on PostgREST's schema cache!
-- ═══════════════════════════════════════════════════════════════════

-- Drop existing function
DROP FUNCTION IF EXISTS raw_insert_loan(jsonb);

-- Create the raw SQL function
CREATE OR REPLACE FUNCTION raw_insert_loan(loan_json jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id uuid;
  result_json jsonb;
BEGIN
  -- Execute raw SQL INSERT (completely bypasses PostgREST)
  EXECUTE format(
    'INSERT INTO loans (
      id, organization_id, client_id, principal_amount, 
      interest_rate, duration_months, status, total_amount,
      monthly_installment, outstanding_balance, paid_amount,
      loan_number, loan_product_id, purpose, processing_fee,
      disbursed_at, first_payment_date, maturity_date,
      disbursement_method, disbursement_reference,
      approval_stage, current_approver_role_id,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24
    ) RETURNING id'
  )
  USING
    COALESCE((loan_json->>'id')::uuid, gen_random_uuid()),
    (loan_json->>'organization_id')::uuid,
    (loan_json->>'client_id')::uuid,
    (loan_json->>'principal_amount')::decimal,
    (loan_json->>'interest_rate')::decimal,
    (loan_json->>'duration_months')::integer,
    COALESCE(loan_json->>'status', 'Pending'),
    (loan_json->>'total_amount')::decimal,
    (loan_json->>'monthly_installment')::decimal,
    (loan_json->>'outstanding_balance')::decimal,
    COALESCE((loan_json->>'paid_amount')::decimal, 0),
    loan_json->>'loan_number',
    (loan_json->>'loan_product_id')::uuid,
    loan_json->>'purpose',
    (loan_json->>'processing_fee')::decimal,
    CASE WHEN loan_json->>'disbursed_at' IS NOT NULL 
      THEN (loan_json->>'disbursed_at')::date 
      ELSE NULL END,
    CASE WHEN loan_json->>'first_payment_date' IS NOT NULL 
      THEN (loan_json->>'first_payment_date')::date 
      ELSE NULL END,
    CASE WHEN loan_json->>'maturity_date' IS NOT NULL 
      THEN (loan_json->>'maturity_date')::date 
      ELSE NULL END,
    loan_json->>'disbursement_method',
    loan_json->>'disbursement_reference',
    loan_json->>'approval_stage',
    CASE WHEN loan_json->>'current_approver_role_id' IS NOT NULL 
      THEN (loan_json->>'current_approver_role_id')::uuid 
      ELSE NULL END,
    COALESCE((loan_json->>'created_at')::timestamptz, NOW()),
    COALESCE((loan_json->>'updated_at')::timestamptz, NOW())
  INTO new_id;
  
  -- Build result JSON
  result_json := jsonb_build_object(
    'success', true,
    'id', new_id,
    'message', 'Loan created successfully via raw SQL'
  );
  
  RETURN result_json;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error as JSON
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION raw_insert_loan(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION raw_insert_loan(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION raw_insert_loan(jsonb) TO service_role;

-- ═══════════════════════════════════════════════════════════════════
-- ✅ VERIFY: Check the function exists
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  routine_name,
  routine_type,
  'READY TO USE!' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'raw_insert_loan';

-- ═══════════════════════════════════════════════════════════════════
-- 📋 INSTRUCTIONS:
-- ═══════════════════════════════════════════════════════════════════
-- 1. Copy this ENTIRE file
-- 2. Paste in Supabase SQL Editor
-- 3. Click RUN
-- 4. You should see: raw_insert_loan | FUNCTION | READY TO USE!
-- 5. DON'T refresh browser yet - I need to update the code first!
-- ═══════════════════════════════════════════════════════════════════
