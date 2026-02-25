# SQL Queries Reference - BV Funguo Microfinance Platform

## Mark Loan as Fully Paid (Outstanding = 0)

### Query for Loan #4869
```sql
UPDATE loans 
SET amount_paid = total_amount,
    balance = 0,
    status = 'Paid'
WHERE loan_number = '4869';
```

### Generic Query (Any Loan Number)
```sql
UPDATE loans 
SET amount_paid = total_amount,
    balance = 0,
    status = 'Paid'
WHERE loan_number = 'YOUR_LOAN_NUMBER_HERE';
```

### Verify Before Updating
```sql
-- Check current values first
SELECT 
  id,
  loan_number,
  client_name,
  amount as principal,
  interest_rate,
  term_period,
  total_amount,
  amount_paid,
  balance,
  status
FROM loans 
WHERE loan_number = '4869';
```

---

## Apply a Discount to a Loan

### Example: Apply 34,400 discount to loan #4869
```sql
-- Original total: 95,000
-- Discount: 34,400
-- New total: 60,600

UPDATE loans 
SET total_amount = 60600
WHERE loan_number = '4869';
```

### Calculate with Formula
```sql
UPDATE loans 
SET total_amount = amount + ((amount * interest_rate * term_period) / 100) - 34400
WHERE loan_number = '4869';
```

### Generic Discount Query
```sql
UPDATE loans 
SET total_amount = total_amount - DISCOUNT_AMOUNT
WHERE loan_number = 'LOAN_NUMBER';
```

---

## Find Loans with Discounts

### Show all discounted loans
```sql
SELECT 
  loan_number,
  client_name,
  amount as principal,
  interest_rate,
  term_period,
  (amount + (amount * interest_rate * term_period / 100)) as calculated_total,
  total_amount as actual_total,
  (total_amount - (amount + (amount * interest_rate * term_period / 100))) as discount,
  amount_paid,
  balance,
  status
FROM loans 
WHERE total_amount != (amount + (amount * interest_rate * term_period / 100))
  AND total_amount > 0
ORDER BY ABS(total_amount - (amount + (amount * interest_rate * term_period / 100))) DESC;
```

---

## Record a Payment

### Full Payment
```sql
UPDATE loans 
SET amount_paid = amount_paid + PAYMENT_AMOUNT,
    balance = balance - PAYMENT_AMOUNT
WHERE loan_number = 'LOAN_NUMBER';
```

### Example: Record 20,000 payment on loan #4869
```sql
UPDATE loans 
SET amount_paid = amount_paid + 20000,
    balance = balance - 20000
WHERE loan_number = '4869';
```

### Auto-calculate balance
```sql
UPDATE loans 
SET amount_paid = amount_paid + 20000,
    balance = total_amount - (amount_paid + 20000)
WHERE loan_number = '4869';
```

---

## Reset a Loan (Undo All Payments)

### Reset loan to unpaid state
```sql
UPDATE loans 
SET amount_paid = 0,
    principal_paid = 0,
    interest_paid = 0,
    balance = total_amount,
    status = 'Active'
WHERE loan_number = 'LOAN_NUMBER';
```

---

## Bulk Operations

### Mark all loans for a client as paid
```sql
UPDATE loans 
SET amount_paid = total_amount,
    balance = 0,
    status = 'Paid'
WHERE client_id = 'CLIENT_UUID';
```

### Apply 10% discount to all active loans
```sql
UPDATE loans 
SET total_amount = total_amount * 0.9
WHERE status = 'Active';
```

---

## Reporting Queries

### Total outstanding by client
```sql
SELECT 
  client_name,
  client_id,
  COUNT(*) as num_loans,
  SUM(amount) as total_principal,
  SUM(total_amount) as total_repayable,
  SUM(amount_paid) as total_paid,
  SUM(balance) as total_outstanding
FROM loans
WHERE status IN ('Active', 'In Arrears')
GROUP BY client_name, client_id
ORDER BY total_outstanding DESC;
```

### Loans by status
```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_principal,
  SUM(total_amount) as total_repayable,
  SUM(amount_paid) as total_paid,
  SUM(balance) as total_outstanding
FROM loans
GROUP BY status
ORDER BY status;
```

### Overdue loans (past first repayment date)
```sql
SELECT 
  loan_number,
  client_name,
  amount,
  total_amount,
  amount_paid,
  balance,
  first_repayment_date,
  CURRENT_DATE - first_repayment_date::date as days_overdue
FROM loans
WHERE status = 'Active'
  AND first_repayment_date IS NOT NULL
  AND first_repayment_date::date < CURRENT_DATE
  AND balance > 0
ORDER BY first_repayment_date;
```

---

## Important Notes

### ⚠️ Use loan_number, NOT id
```sql
-- ✅ CORRECT
WHERE loan_number = '4869'

-- ❌ WRONG (id is UUID, not integer)
WHERE id = '4869'
```

### ⚠️ Always verify first
```sql
-- 1. SELECT first to check values
SELECT * FROM loans WHERE loan_number = '4869';

-- 2. Then UPDATE
UPDATE loans SET ... WHERE loan_number = '4869';

-- 3. Verify the update
SELECT * FROM loans WHERE loan_number = '4869';
```

### ⚠️ Backup before bulk operations
```sql
-- Create backup table
CREATE TABLE loans_backup AS SELECT * FROM loans;

-- Run your bulk update
UPDATE loans SET ...;

-- If something went wrong, restore:
-- DELETE FROM loans;
-- INSERT INTO loans SELECT * FROM loans_backup;
```

---

## Interest Calculation Formula

### Flat Rate (Standard)
```sql
-- Interest = (Principal × Rate × Term) / 100
-- Example: 100,000 × 7.5% × 1 = 7,500

UPDATE loans 
SET total_amount = amount + ((amount * interest_rate * term_period) / 100)
WHERE total_amount = 0 OR total_amount IS NULL;
```

### Recalculate total_amount for all loans
```sql
UPDATE loans 
SET total_amount = amount + ((amount * interest_rate * term_period) / 100)
WHERE total_amount = 0 OR total_amount IS NULL;
```

---

**Date:** February 25, 2026  
**Platform:** BV Funguo Ltd - Microfinance Management System  
**Database:** Supabase PostgreSQL
