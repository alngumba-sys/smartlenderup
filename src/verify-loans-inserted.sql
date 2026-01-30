-- ============================================================================
-- VERIFY LOANS WERE INSERTED CORRECTLY
-- ============================================================================

-- Count total loans
SELECT 
    'TOTAL LOANS' as metric,
    COUNT(*) as count
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- Show all loans with details
SELECT 
    l.loan_number,
    c.client_number,
    c.name as client_name,
    p.product_name,
    l.amount::numeric as principal,
    l.total_amount::numeric,
    l.balance::numeric,
    l.amount_paid::numeric,
    l.status,
    l.disbursement_date::date,
    l.phase
FROM loans l
JOIN clients c ON l.client_id = c.id
JOIN loan_products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY l.loan_number;

-- Summary totals
SELECT 
    COUNT(*) as total_loans,
    SUM(amount)::numeric as total_principal,
    SUM(total_amount)::numeric as total_amount,
    SUM(balance)::numeric as total_balance,
    SUM(amount_paid)::numeric as total_paid
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');

-- Group by status
SELECT 
    status,
    COUNT(*) as loan_count,
    SUM(amount)::numeric as total_principal
FROM loans
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY status;

-- Group by product
SELECT 
    p.product_name,
    COUNT(*) as loan_count,
    SUM(l.amount)::numeric as total_principal
FROM loans l
JOIN loan_products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
GROUP BY p.product_name;
