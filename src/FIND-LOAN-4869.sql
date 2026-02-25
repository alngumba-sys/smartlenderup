-- ============================================
-- FIND LOAN 4869 - Let's locate this loan
-- ============================================

-- Option 1: Search by loan_number (various formats)
SELECT 
  id,
  loan_number,
  amount,
  total_amount,
  amount_paid,
  balance,
  status,
  'Found by loan_number' as method
FROM loans
WHERE loan_number IN ('4869', '04869', 'LOAN-4869', 'LN4869')
   OR loan_number LIKE '%4869%';

-- Option 2: Search by client name (George Munyau Kavuva)
SELECT 
  l.id,
  l.loan_number,
  c.name as client_name,
  c.id_number as client_id,
  l.amount,
  l.total_amount,
  l.amount_paid,
  l.balance,
  l.status,
  'Found by client name' as method
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE c.name LIKE '%George%Munyau%'
   OR c.name LIKE '%Munyau%'
   OR c.id_number = '22195033';

-- Option 3: Search by amount (50,000 borrowed, 60,600 paid)
SELECT 
  l.id,
  l.loan_number,
  c.name as client_name,
  l.amount,
  l.total_amount,
  l.amount_paid,
  l.balance,
  l.status,
  'Found by amounts' as method
FROM loans l
LEFT JOIN clients c ON l.client_id = c.id
WHERE l.amount = 50000
  AND l.amount_paid = 60600;

-- Option 4: List ALL loans to see what exists
SELECT 
  loan_number,
  amount,
  amount_paid,
  balance,
  status
FROM loans
ORDER BY loan_number DESC
LIMIT 30;
