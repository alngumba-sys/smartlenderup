# 🗂️ ACTUAL LOANS TABLE SCHEMA - BV Funguo Platform

## ✅ CONFIRMED WORKING COLUMNS

Based on successful loan creation tests, these columns **DO EXIST** in your Supabase `loans` table:

### Core Required Fields
```sql
client_id               UUID      -- ✅ REQUIRED (FK to clients)
organization_id         UUID      -- ✅ REQUIRED (FK to organizations)
amount                 NUMERIC    -- ✅ REQUIRED (principal amount)
interest_rate          NUMERIC    -- ✅ REQUIRED (rate as percentage)
status                 TEXT       -- ✅ REQUIRED (pending/approved/etc)
total_amount           NUMERIC    -- ✅ REQUIRED (principal + interest)
monthly_installment    NUMERIC    -- ✅ REQUIRED (calculated payment)
outstanding_balance    NUMERIC    -- ✅ REQUIRED (remaining balance)
paid_amount            NUMERIC    -- ✅ REQUIRED (total paid so far)
```

### Optional Fields
```sql
loan_number            TEXT       -- ✅ OPTIONAL (auto-generated ID)
purpose                TEXT       -- ✅ OPTIONAL (loan purpose/reason)
processing_fee         NUMERIC    -- ✅ OPTIONAL (upfront fee)
insurance_fee          NUMERIC    -- ✅ OPTIONAL (insurance charge)
notes                  TEXT       -- ✅ OPTIONAL (additional notes)
```

### System Fields (Auto-managed)
```sql
id                     TEXT       -- ✅ PRIMARY KEY (auto-generated)
created_at             TIMESTAMP  -- ✅ AUTO (creation timestamp)
updated_at             TIMESTAMP  -- ✅ AUTO (last update timestamp)
```

---

## ❌ FIELDS THAT DO NOT EXIST

These fields were in the schema files but **DO NOT EXIST** in your actual database:

```sql
duration_months        -- ❌ DOES NOT EXIST
loan_product_id        -- ❌ DOES NOT EXIST
loan_product          -- ❌ DOES NOT EXIST
product_id            -- ❌ DOES NOT EXIST
loan_officer_id       -- ❌ DOES NOT EXIST
disbursement_reference -- ❌ DOES NOT EXIST
maturity_date         -- ❌ DOES NOT EXIST
application_date      -- ❌ DOES NOT EXIST
loan_term_months      -- ❌ DOES NOT EXIST
disbursement_date     -- ❌ DOES NOT EXIST
repayment_frequency   -- ❌ DOES NOT EXIST
loan_purpose          -- ❌ DOES NOT EXIST (use 'purpose' instead)
collateral_type       -- ❌ DOES NOT EXIST
collateral_value      -- ❌ DOES NOT EXIST
phase                 -- ❌ DOES NOT EXIST
total_repayable       -- ❌ DOES NOT EXIST (use 'total_amount' instead)
total_paid            -- ❌ DOES NOT EXIST (use 'paid_amount' instead)
balance               -- ❌ DOES NOT EXIST (use 'outstanding_balance' instead)
```

---

## 🔧 IF YOU WANT TO ADD MISSING FIELDS

### To Add `loan_product_id`:
```sql
ALTER TABLE loans 
ADD COLUMN loan_product_id UUID;

CREATE INDEX idx_loans_loan_product_id ON loans(loan_product_id);

-- Optional: Add foreign key if loan_products table exists
-- ALTER TABLE loans 
-- ADD CONSTRAINT fk_loan_product 
-- FOREIGN KEY (loan_product_id) REFERENCES loan_products(id);
```

### To Add `duration_months`:
```sql
ALTER TABLE loans 
ADD COLUMN duration_months INTEGER;
```

### To Add `loan_officer_id`:
```sql
ALTER TABLE loans 
ADD COLUMN loan_officer_id UUID;

-- Optional: Add foreign key if users table exists
-- ALTER TABLE loans 
-- ADD CONSTRAINT fk_loan_officer 
-- FOREIGN KEY (loan_officer_id) REFERENCES users(id);
```

**After adding ANY column:**
1. Go to Supabase Dashboard → API
2. Click "Refresh schema cache"
3. Wait 30 seconds
4. Uncomment the field assignment in the code
5. Hard refresh browser (Ctrl+Shift+R)

---

## 📊 FIELD MAPPING REFERENCE

How frontend fields map to database columns:

### ✅ WORKING MAPPINGS
```typescript
// Frontend → Database
clientId                → client_id
organizationId          → organization_id
amount                  → amount
principalAmount         → amount
interestRate            → interest_rate
status                  → status
totalAmount             → total_amount
monthlyInstallment      → monthly_installment
outstandingBalance      → outstanding_balance
paidAmount              → paid_amount
loanNumber              → loan_number
purpose                 → purpose
loanPurpose             → purpose
processingFee           → processing_fee
insuranceFee            → insurance_fee
notes                   → notes
```

### ❌ BROKEN MAPPINGS (Fields Don't Exist)
```typescript
// Frontend → Database (NON-EXISTENT)
term                    → duration_months  ❌ NO COLUMN
durationMonths          → duration_months  ❌ NO COLUMN
productId               → loan_product_id  ❌ NO COLUMN
loanProductId           → loan_product_id  ❌ NO COLUMN
loanOfficerId           → loan_officer_id  ❌ NO COLUMN
```

---

## 🎯 CODE REFERENCE

The loan creation function is in:
- **File:** `/services/supabaseDataService.ts`
- **Function:** `createLoan()`
- **Lines:** ~800-950

**Key Lines:**
- Line 852: ❌ `duration_months` assignment (REMOVED)
- Line 863: ❌ `loan_product_id` assignment (REMOVED)

---

## 🔍 HOW TO VERIFY YOUR SCHEMA

Run this SQL in Supabase SQL Editor to see your actual columns:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'loans'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

---

## 📚 RELATED DOCUMENTATION

- `/⚡_FINAL_DURATION_MONTHS_FIX.md` - Fix for duration_months error
- `/⚡_FINAL_LOAN_PRODUCT_ID_FIX.md` - Fix for loan_product_id error
- `/CLEAR_BROWSER_CACHE_GUIDE.md` - How to clear cache after fixes
- `/services/supabaseDataService.ts` - Loan creation service

---

**Last Updated:** March 12, 2026
**Status:** ✅ VERIFIED
**Method:** Tested via successful loan creation
