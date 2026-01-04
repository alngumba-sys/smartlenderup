-- =====================================================
-- VERIFY FINAL CHART OF ACCOUNTS BALANCES
-- =====================================================

SELECT 
  account_code,
  account_name,
  account_type,
  account_category,
  balance as "Net Balance"
FROM chart_of_accounts
WHERE organization_id::text = (SELECT id::text FROM organizations LIMIT 1)
  AND balance != 0
ORDER BY 
  CASE account_type
    WHEN 'Asset' THEN 1
    WHEN 'Liability' THEN 2
    WHEN 'Equity' THEN 3
    WHEN 'Revenue' THEN 4
    WHEN 'Expense' THEN 5
  END,
  account_code;
