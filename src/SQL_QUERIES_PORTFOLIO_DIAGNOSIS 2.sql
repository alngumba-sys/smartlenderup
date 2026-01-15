-- =====================================================
-- SQL QUERIES TO DIAGNOSE PORTFOLIO BY PRODUCT ISSUE
-- =====================================================
-- Run these queries in your Supabase SQL Editor to understand why
-- loans are not matching with products

-- =====================================================
-- 1. CHECK LOAN PRODUCTS
-- =====================================================
-- See all loan products in your organization
SELECT 
    id,
    product_name,
    status,
    organization_id,
    created_at
FROM products
ORDER BY created_at DESC;

-- =====================================================
-- 2. CHECK LOANS
-- =====================================================
-- See all loans and their product IDs
SELECT 
    id,
    loan_number,
    product_id,
    borrower_id,
    principal_amount,
    outstanding_balance,
    status,
    approval_status,
    disbursement_date,
    organization_id
FROM loans
ORDER BY created_at DESC;

-- =====================================================
-- 3. CHECK IF PRODUCT IDs MATCH BETWEEN LOANS AND PRODUCTS
-- =====================================================
-- This query shows loans and whether their product_id matches any product
SELECT 
    l.id AS loan_id,
    l.loan_number,
    l.product_id AS loan_product_id,
    l.principal_amount,
    l.outstanding_balance,
    l.status AS loan_status,
    p.id AS product_id,
    p.product_name,
    CASE 
        WHEN p.id IS NULL THEN '❌ NO MATCHING PRODUCT'
        ELSE '✅ PRODUCT FOUND'
    END AS match_status
FROM loans l
LEFT JOIN products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations LIMIT 1)
ORDER BY match_status, l.created_at DESC;

-- =====================================================
-- 4. COUNT LOANS BY PRODUCT
-- =====================================================
-- See how many loans each product has
SELECT 
    p.product_name,
    p.id AS product_id,
    COUNT(l.id) AS total_loans,
    COUNT(CASE WHEN l.status IN ('Active', 'Disbursed', 'In Arrears') THEN 1 END) AS active_loans,
    SUM(CASE WHEN l.status IN ('Active', 'Disbursed', 'In Arrears') THEN l.outstanding_balance ELSE 0 END) AS total_outstanding
FROM products p
LEFT JOIN loans l ON p.id = l.product_id
WHERE p.organization_id = (SELECT id FROM organizations LIMIT 1)
GROUP BY p.id, p.product_name
ORDER BY total_loans DESC;

-- =====================================================
-- 5. FIND ORPHANED LOANS (loans without matching product)
-- =====================================================
-- These are loans that have a product_id that doesn't exist
SELECT 
    l.id,
    l.loan_number,
    l.product_id AS invalid_product_id,
    l.principal_amount,
    l.status,
    'This loan has an invalid product_id' AS issue
FROM loans l
LEFT JOIN products p ON l.product_id = p.id
WHERE p.id IS NULL
  AND l.organization_id = (SELECT id FROM organizations LIMIT 1);

-- =====================================================
-- 6. FIX ORPHANED LOANS (if you have a default product)
-- =====================================================
-- IMPORTANT: Update the product_id below with your actual product ID
-- First, get your product ID from query #1, then update below

-- Example: If your "Friday Loan" product ID is '12345678-1234-1234-1234-123456789abc'
-- Uncomment and run this to assign orphaned loans to that product:

/*
UPDATE loans
SET product_id = '12345678-1234-1234-1234-123456789abc'  -- REPLACE WITH YOUR ACTUAL PRODUCT ID
WHERE product_id NOT IN (SELECT id FROM products)
  AND organization_id = (SELECT id FROM organizations LIMIT 1);
*/

-- =====================================================
-- 7. VERIFY LOAN STATUS VALUES
-- =====================================================
-- Check what status values your loans have
SELECT 
    status,
    COUNT(*) AS count
FROM loans
WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
GROUP BY status
ORDER BY count DESC;

-- =====================================================
-- 8. CHECK LOANS ELIGIBLE FOR PORTFOLIO CHART
-- =====================================================
-- These loans should appear in the Portfolio by Product chart
SELECT 
    l.loan_number,
    p.product_name,
    l.principal_amount,
    l.outstanding_balance,
    l.status,
    l.approval_status,
    l.disbursement_date,
    CASE 
        WHEN l.status IN ('Active', 'Disbursed', 'In Arrears') THEN '✅ Should show in chart'
        ELSE '❌ Won''t show (wrong status)'
    END AS chart_eligibility
FROM loans l
LEFT JOIN products p ON l.product_id = p.id
WHERE l.organization_id = (SELECT id FROM organizations LIMIT 1)
ORDER BY chart_eligibility, l.created_at DESC;

-- =====================================================
-- NOTES:
-- =====================================================
-- After running these queries, you should be able to identify:
-- 1. Whether your loans have valid product_id values
-- 2. Whether the product IDs in loans match actual products
-- 3. What the actual status values are for your loans
-- 4. How many loans should appear in the Portfolio by Product chart
