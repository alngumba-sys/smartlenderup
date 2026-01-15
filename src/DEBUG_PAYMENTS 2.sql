-- ==========================================
-- DEBUG: Check which payments were inserted and which failed
-- SmartLenderUp - Kenya
-- ==========================================

-- 1. Check how many payments were actually inserted
SELECT COUNT(*) as actual_payments_count, SUM(amount) as total_amount
FROM repayments
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9';

-- 2. Check which loan numbers exist in the database
SELECT loan_number, id, client_id, status
FROM loans
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND loan_number IN (
    'LN00001', 'LN00002', 'LN00003', 'LN00004', 'LN00005',
    'LN00006', 'LN00007', 'LN00008', 'LN00009', 'LN00010',
    'LN00011', 'LN00012', 'LN00013', 'LN00014', 'LN00015',
    'LN00016', 'LN00017', 'LN00018', 'LN00019', 'LN00020',
    'LN00021', 'LN00022', 'LN00023'
  )
ORDER BY loan_number;

-- 3. Check which client numbers exist
SELECT client_number, id
FROM clients
WHERE organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
  AND client_number IN (
    'CL00001', 'CL00002', 'CL00003', 'CL00004', 'CL00005',
    'CL00006', 'CL00007', 'CL00008', 'CL00009', 'CL00010',
    'CL00016', 'CL00017'
  )
ORDER BY client_number;

-- 4. Find missing loans (expected but not found)
WITH expected_loans AS (
  SELECT unnest(ARRAY[
    'LN00001', 'LN00002', 'LN00003', 'LN00004', 'LN00005',
    'LN00006', 'LN00007', 'LN00008', 'LN00009', 'LN00010',
    'LN00011', 'LN00012', 'LN00013', 'LN00014', 'LN00015',
    'LN00016', 'LN00017', 'LN00018', 'LN00019', 'LN00020',
    'LN00021', 'LN00022', 'LN00023'
  ]) as loan_number
)
SELECT el.loan_number as missing_loan
FROM expected_loans el
LEFT JOIN loans l ON l.loan_number = el.loan_number 
  AND l.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
WHERE l.id IS NULL
ORDER BY el.loan_number;

-- 5. Show all inserted payments with details
SELECT 
  r.amount,
  r.payment_date,
  r.transaction_ref,
  l.loan_number,
  c.client_number,
  c.first_name || ' ' || c.last_name as client_name
FROM repayments r
LEFT JOIN loans l ON r.loan_id = l.id
LEFT JOIN clients c ON r.client_id = c.id
WHERE r.organization_id = '958b04d3-ccc0-4d9d-8af7-01ba5cda3bb9'
ORDER BY r.payment_date DESC;
