# 🚀 QUICK FIX: Loan Creation PGRST204 Error

## ⚡ 3-Step Fix (5 minutes)

### 1️⃣ Run SQL (2 min)
1. Open **Supabase Dashboard** → **SQL Editor**
2. Open file: `/FIX_LOAN_CREATION_SCHEMA.sql`
3. **Copy ALL contents** and paste into SQL Editor
4. Click **Run**
5. Wait for completion messages

### 2️⃣ Refresh Cache (1 min)
1. Go to **Supabase Dashboard** → **API**
2. Click **"Refresh schema cache"** button
3. Wait 30 seconds

### 3️⃣ Hard Refresh Browser (30 sec)
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

## ✅ Test
1. Go to **Loans** tab
2. Click **"Add Loan"**
3. Fill form and submit
4. Should work without errors! 🎉

## 📋 What's Being Fixed?

The error `"Could not find the 'paid_amount' column"` happens because these columns are missing from your database:

**Missing Columns (now added):**
- `paid_amount` - Amount paid so far
- `monthly_installment` - Monthly payment
- `duration_months` - Loan term
- `total_interest` - Interest amount
- `total_repayable` - Total to repay
- `loan_product_id` - Product reference
- `facilitation_fee` - Fees charged
- `staff_member_id` - Staff reference
- `collateral_type` - Collateral info
- `collateral_value` - Collateral value
- `loan_term` - Term in months
- `creation_date` - Creation date
- `application_date` - Application date
- `first_payment_date` - First payment
- `maturity_date` - Maturity date

**Code Updated:**
- `/services/supabaseDataService.ts` - Now sends all required fields

## 🆘 Still Failing?

See full guide: `/⚡_LOAN_CREATION_PGRST204_FIX_COMPLETE.md`

---

**Quick Reference:**
- Error Code: `PGRST204`
- Root Cause: Missing database columns
- Solution: Add columns + refresh cache
- Time to Fix: ~5 minutes
