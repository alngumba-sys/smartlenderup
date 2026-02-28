-- =====================================================
-- FIX CREDIT SCORING PARAMETERS
-- =====================================================
-- This script corrects the credit scoring parameter weights
-- to match the actual credit score calculation in the platform.
--
-- CORRECT WEIGHTS (Individual):
-- - Payment History: 35% (NOT 55%)
-- - Credit Utilization: 30%
-- - Account Age: 15%
-- - Loan Count: 10%
-- - Savings Balance: 10%
-- Total: 100%
--
-- CORRECT WEIGHTS (Business):
-- - Payment History: 30%
-- - Credit Utilization: 25%
-- - Account Age: 20%
-- - Loan Count: 15%
-- - Savings Balance: 10%
-- Total: 100%
-- =====================================================

-- Step 1: Delete existing parameters (to start fresh)
DELETE FROM credit_scoring_parameters 
WHERE organization_id IN (SELECT id FROM organizations WHERE organization_name = 'BV Funguo Ltd');

-- Step 2: Get the organization ID for BV Funguo Ltd
DO $$
DECLARE
  org_id UUID;
BEGIN
  -- Get BV Funguo Ltd organization ID
  SELECT id INTO org_id FROM organizations WHERE organization_name = 'BV Funguo Ltd' LIMIT 1;
  
  IF org_id IS NOT NULL THEN
    -- Insert INDIVIDUAL credit scoring parameters with CORRECT weights
    INSERT INTO credit_scoring_parameters (
      organization_id, 
      client_type, 
      parameter_id, 
      parameter_name, 
      weight, 
      description, 
      enabled
    ) VALUES
    (org_id, 'individual', 'payment_history', 'Payment History', 35, 'Track record of on-time payments and defaults', TRUE),
    (org_id, 'individual', 'credit_utilization', 'Credit Utilization', 30, 'Ratio of current debt to available credit', TRUE),
    (org_id, 'individual', 'account_age', 'Account Age', 15, 'Length of credit history with institution', TRUE),
    (org_id, 'individual', 'loan_count', 'Loan Count', 10, 'Number and diversity of credit products', TRUE),
    (org_id, 'individual', 'savings_balance', 'Savings Balance', 10, 'Average savings account balance', TRUE),
    
    -- Insert BUSINESS credit scoring parameters with CORRECT weights
    (org_id, 'business', 'payment_history', 'Payment History', 30, 'Track record of on-time payments and defaults', TRUE),
    (org_id, 'business', 'credit_utilization', 'Credit Utilization', 25, 'Ratio of current debt to available credit', TRUE),
    (org_id, 'business', 'account_age', 'Account Age', 20, 'Length of credit history with institution', TRUE),
    (org_id, 'business', 'loan_count', 'Loan Count', 15, 'Number and diversity of credit products', TRUE),
    (org_id, 'business', 'savings_balance', 'Savings Balance', 10, 'Average savings account balance', TRUE)
    
    ON CONFLICT (organization_id, client_type, parameter_id) 
    DO UPDATE SET
      weight = EXCLUDED.weight,
      description = EXCLUDED.description,
      enabled = EXCLUDED.enabled,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Credit scoring parameters fixed for organization: %', org_id;
  ELSE
    RAISE NOTICE '⚠️ Organization "BV Funguo Ltd" not found';
  END IF;
END $$;

-- Step 3: Verify the parameters
SELECT 
  client_type,
  parameter_name,
  weight,
  enabled,
  'Total: ' || SUM(weight) OVER (PARTITION BY client_type) as running_total
FROM credit_scoring_parameters
WHERE organization_id IN (SELECT id FROM organizations WHERE organization_name = 'BV Funguo Ltd')
ORDER BY client_type, parameter_id;

-- Expected output:
-- individual | Payment History      | 35 | TRUE | Total: 100
-- individual | Credit Utilization   | 30 | TRUE | Total: 100
-- individual | Account Age          | 15 | TRUE | Total: 100
-- individual | Loan Count           | 10 | TRUE | Total: 100
-- individual | Savings Balance      | 10 | TRUE | Total: 100
-- business   | Payment History      | 30 | TRUE | Total: 100
-- business   | Credit Utilization   | 25 | TRUE | Total: 100
-- business   | Account Age          | 20 | TRUE | Total: 100
-- business   | Loan Count           | 15 | TRUE | Total: 100
-- business   | Savings Balance      | 10 | TRUE | Total: 100