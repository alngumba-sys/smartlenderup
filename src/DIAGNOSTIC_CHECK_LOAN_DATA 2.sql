-- =====================================================
-- DIAGNOSTIC: Check Loan Interest Data
-- =====================================================
-- This script checks what's actually in your database
-- =====================================================

-- 1. Check raw loan data from loans table
SELECT 
  loan_number,
  amount,
  interest_rate,
  total_amount,
  amount_paid,
  balance
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
LIMIT 5;

-- 2. Check what's in project_states
SELECT 
  organization_id,
  jsonb_array_length(state->'loans') as loan_count,
  (state->'loans'->0->>'totalInterest') as first_loan_interest,
  (state->'loans'->0->>'interestRate') as first_loan_rate,
  (state->'loans'->0->>'amount') as first_loan_amount,
  (state->'loans'->0->>'loanNumber') as first_loan_number
FROM project_states
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- 3. Show first complete loan from project_states
SELECT 
  jsonb_pretty(state->'loans'->0) as first_loan_full_data
FROM project_states
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';
