-- ============================================================================
-- DATABASE BACKUP SCRIPT FOR BV FUNGUO LTD MICROFINANCE PLATFORM
-- ============================================================================
-- 
-- PURPOSE: Export all table data to SQL format for backup
-- RUN THIS BEFORE: Running the cleanup script
-- 
-- INSTRUCTIONS:
-- 1. Run this script in Supabase SQL Editor
-- 2. Copy all the output results
-- 3. Save to a .sql file on your computer
-- 4. To restore, run the saved SQL file
-- ============================================================================

-- Backup Organizations
SELECT 'INSERT INTO organizations VALUES' || 
    string_agg(
        '(' || quote_literal(id::text) || ',' ||
        quote_literal(organization_name) || ',' ||
        quote_literal(username) || ',' ||
        quote_literal(email) || ',' ||
        quote_literal(phone) || ',' ||
        quote_literal(country) || ',' ||
        quote_literal(currency) || ',' ||
        quote_literal(created_at::text) || ',' ||
        COALESCE(quote_literal(trial_ends_at::text), 'NULL') || ',' ||
        quote_literal(subscription_status) || ',' ||
        COALESCE(quote_literal(stripe_customer_id), 'NULL') || ',' ||
        COALESCE(quote_literal(stripe_subscription_id), 'NULL') || ')',
        ','
    ) || ';'
FROM organizations;

-- Backup Users
SELECT 'INSERT INTO users (id, organization_id, email, name, role, created_at) VALUES' || 
    string_agg(
        '(' || quote_literal(id::text) || ',' ||
        quote_literal(organization_id::text) || ',' ||
        quote_literal(email) || ',' ||
        quote_literal(name) || ',' ||
        quote_literal(role) || ',' ||
        quote_literal(created_at::text) || ')',
        ','
    ) || ';'
FROM users;

-- Backup Bank Branches
SELECT 'INSERT INTO bank_branches (id, organization_id, bank_name, branch_name, branch_code, created_at) VALUES' || 
    string_agg(
        '(' || quote_literal(id::text) || ',' ||
        quote_literal(organization_id::text) || ',' ||
        quote_literal(bank_name) || ',' ||
        quote_literal(branch_name) || ',' ||
        COALESCE(quote_literal(branch_code), 'NULL') || ',' ||
        quote_literal(created_at::text) || ')',
        ','
    ) || ';'
FROM bank_branches
WHERE EXISTS (SELECT 1 FROM bank_branches);

-- Backup Bank Accounts
SELECT 'INSERT INTO bank_accounts (id, organization_id, bank_branch_id, account_name, account_number, account_type, currency, balance, created_at) VALUES' || 
    string_agg(
        '(' || quote_literal(id::text) || ',' ||
        quote_literal(organization_id::text) || ',' ||
        COALESCE(quote_literal(bank_branch_id::text), 'NULL') || ',' ||
        quote_literal(account_name) || ',' ||
        quote_literal(account_number) || ',' ||
        quote_literal(account_type) || ',' ||
        quote_literal(currency) || ',' ||
        balance::text || ',' ||
        quote_literal(created_at::text) || ')',
        ','
    ) || ';'
FROM bank_accounts
WHERE EXISTS (SELECT 1 FROM bank_accounts);

-- Backup Shareholders
SELECT 'INSERT INTO shareholders (id, organization_id, name, id_number, phone, email, shares, share_value, total_value, created_at) VALUES' || 
    string_agg(
        '(' || quote_literal(id::text) || ',' ||
        quote_literal(organization_id::text) || ',' ||
        quote_literal(name) || ',' ||
        COALESCE(quote_literal(id_number), 'NULL') || ',' ||
        COALESCE(quote_literal(phone), 'NULL') || ',' ||
        COALESCE(quote_literal(email), 'NULL') || ',' ||
        COALESCE(shares::text, '0') || ',' ||
        COALESCE(share_value::text, '0') || ',' ||
        COALESCE(total_value::text, '0') || ',' ||
        quote_literal(created_at::text) || ')',
        ','
    ) || ';'
FROM shareholders
WHERE EXISTS (SELECT 1 FROM shareholders);

-- Backup Clients
SELECT 'INSERT INTO clients (id, organization_id, client_number, first_name, last_name, email, phone, id_number, date_of_birth, gender, address, city, country, created_at) VALUES' || 
    string_agg(
        '(' || quote_literal(id::text) || ',' ||
        quote_literal(organization_id::text) || ',' ||
        quote_literal(client_number) || ',' ||
        quote_literal(first_name) || ',' ||
        quote_literal(last_name) || ',' ||
        COALESCE(quote_literal(email), 'NULL') || ',' ||
        quote_literal(phone) || ',' ||
        COALESCE(quote_literal(id_number), 'NULL') || ',' ||
        COALESCE(quote_literal(date_of_birth::text), 'NULL') || ',' ||
        COALESCE(quote_literal(gender), 'NULL') || ',' ||
        COALESCE(quote_literal(address), 'NULL') || ',' ||
        COALESCE(quote_literal(city), 'NULL') || ',' ||
        COALESCE(quote_literal(country), 'NULL') || ',' ||
        quote_literal(created_at::text) || ')',
        ','
    ) || ';'
FROM clients
WHERE EXISTS (SELECT 1 FROM clients);

-- Backup Loan Products
SELECT 'INSERT INTO loan_products (id, organization_id, name, description, min_amount, max_amount, interest_rate, interest_type, term_min, term_max, term_unit, created_at) VALUES' || 
    string_agg(
        '(' || quote_literal(id::text) || ',' ||
        quote_literal(organization_id::text) || ',' ||
        quote_literal(name) || ',' ||
        COALESCE(quote_literal(description), 'NULL') || ',' ||
        min_amount::text || ',' ||
        max_amount::text || ',' ||
        interest_rate::text || ',' ||
        quote_literal(interest_type) || ',' ||
        term_min::text || ',' ||
        term_max::text || ',' ||
        quote_literal(term_unit) || ',' ||
        quote_literal(created_at::text) || ')',
        ','
    ) || ';'
FROM loan_products
WHERE EXISTS (SELECT 1 FROM loan_products);

-- Show summary of what will be backed up
SELECT 
    'organizations' as table_name, 
    COUNT(*) as record_count,
    pg_size_pretty(pg_total_relation_size('organizations')) as table_size
FROM organizations
UNION ALL
SELECT 'users', COUNT(*), pg_size_pretty(pg_total_relation_size('users'))
FROM users
UNION ALL
SELECT 'clients', COUNT(*), pg_size_pretty(pg_total_relation_size('clients'))
FROM clients
UNION ALL
SELECT 'loans', COUNT(*), pg_size_pretty(pg_total_relation_size('loans'))
FROM loans
UNION ALL
SELECT 'payments', COUNT(*), pg_size_pretty(pg_total_relation_size('payments'))
FROM payments
UNION ALL
SELECT 'loan_products', COUNT(*), pg_size_pretty(pg_total_relation_size('loan_products'))
FROM loan_products
UNION ALL
SELECT 'bank_accounts', COUNT(*), pg_size_pretty(pg_total_relation_size('bank_accounts'))
FROM bank_accounts
UNION ALL
SELECT 'bank_branches', COUNT(*), pg_size_pretty(pg_total_relation_size('bank_branches'))
FROM bank_branches
UNION ALL
SELECT 'shareholders', COUNT(*), pg_size_pretty(pg_total_relation_size('shareholders'))
FROM shareholders
UNION ALL
SELECT 'employees', COUNT(*), pg_size_pretty(pg_total_relation_size('employees'))
FROM employees
ORDER BY record_count DESC;
