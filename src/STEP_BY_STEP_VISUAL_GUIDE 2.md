# 📋 Step-by-Step Visual Guide

## 🎯 Goal
1. ✅ Update interest rate for Loan LN00013 (YUSUF OLELA OMONDI)
2. ✅ Record payment of KES 100,000
3. ✅ Filter Record Payment dropdown to show only loans with outstanding balance

---

## 🚀 Part 1: Database Changes (5 Minutes)

### Step 1️⃣: Open Supabase SQL Editor

```
1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Select your SmartLenderUp project
4. Click "SQL Editor" in left sidebar
5. Click "New Query" button
```

---

### Step 2️⃣: Get Your Organization ID

**Copy and paste this into SQL Editor:**

```sql
SELECT id, organization_name, username 
FROM organizations 
ORDER BY organization_name;
```

**Click "RUN" button**

**You'll see results like:**
```
id                                      organization_name       username
─────────────────────────────────────   ─────────────────────  ──────────
a1b2c3d4-e5f6-7890-abcd-ef1234567890    BV Funguo Ltd          bvfunguo
```

**📋 COPY the UUID** (the long text under "id" column)  
Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### Step 3️⃣: Update Interest Rate

**Copy this SQL and REPLACE `YOUR_ORG_ID_HERE` with your UUID:**

```sql
UPDATE loans 
SET 
  interest_rate = 15.0,  -- ⬅️ CHANGE THIS to your desired rate
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR UUID HERE
```

**Example (with real UUID):**
```sql
UPDATE loans 
SET 
  interest_rate = 15.0,
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

**Click "RUN"**

**✅ Expected result:** `Success. No rows returned`

---

### Step 4️⃣: Record Payment of KES 100,000

**Copy this SQL and REPLACE `YOUR_ORG_ID_HERE` (appears 2 times):**

```sql
INSERT INTO repayments (
  id,
  organization_id,
  loan_id,
  client_id,
  amount,
  payment_date,
  payment_method,
  transaction_reference,
  receipt_number,
  received_by,
  notes,
  status,
  created_at
)
SELECT 
  gen_random_uuid(),
  'YOUR_ORG_ID_HERE',  -- ⬅️ PASTE YOUR UUID HERE (1st place)
  l.id,
  l.client_id,
  100000,
  CURRENT_DATE,
  'M-PESA',
  'MP' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  'REC' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0'),
  'Super Admin',
  'Payment of KES 100,000 for YUSUF OLELA OMONDI - Loan LN00013',
  'Approved',
  NOW()
FROM loans l
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR UUID HERE (2nd place)
```

**Click "RUN"**

**✅ Expected result:** `Success. No rows returned`

---

### Step 5️⃣: Update Outstanding Balance

**Copy this SQL and REPLACE `YOUR_ORG_ID_HERE`:**

```sql
UPDATE loans 
SET 
  outstanding_balance = outstanding_balance - 100000,
  updated_at = NOW()
WHERE 
  loan_number = 'LN00013' 
  AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR UUID HERE
```

**Click "RUN"**

**✅ Expected result:** `Success. No rows returned`

---

### Step 6️⃣: Verify Everything Worked

**Check Loan Details:**

```sql
SELECT 
  l.loan_number,
  c.client_number,
  c.name as client_name,
  l.principal_amount,
  l.interest_rate,
  l.outstanding_balance,
  l.status
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.loan_number = 'LN00013' 
  AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR UUID HERE
```

**✅ You should see:**
```
loan_number  client_number  client_name           principal  interest_rate  outstanding_balance  status
───────────  ─────────────  ───────────────────   ─────────  ─────────────  ──────────────────  ──────
LN00013      CL00011        YUSUF OLELA OMONDI    200000     15.0           140000              Active
```

**Check Payment Record:**

```sql
SELECT 
  r.receipt_number,
  r.amount,
  r.payment_date,
  r.payment_method,
  r.status
FROM repayments r
JOIN loans l ON r.loan_id = l.id
WHERE l.loan_number = 'LN00013'
  AND l.organization_id = 'YOUR_ORG_ID_HERE'  -- ⬅️ PASTE YOUR UUID HERE
ORDER BY r.created_at DESC
LIMIT 5;
```

**✅ You should see the new payment:**
```
receipt_number    amount   payment_date  payment_method  status
────────────────  ───────  ────────────  ──────────────  ────────
REC20260107001    100000   2026-01-07    M-PESA          Approved
```

---

## 🎨 Part 2: Deploy Code Changes (3 Minutes)

### Step 1️⃣: Commit Changes to GitHub

**Open your terminal/command prompt and run:**

```bash
git add .
git commit -m "Filter Record Payment dropdown to show only loans with outstanding balance or In Arrears status"
git push origin main
```

**✅ You should see:**
```
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 1.23 KiB | 1.23 MiB/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To https://github.com/yourusername/smartlenderup.git
   abc1234..def5678  main -> main
```

---

### Step 2️⃣: Wait for Netlify Deployment

```
1. Go to: https://app.netlify.com
2. Select your SmartLenderUp site
3. Click "Deploys" tab
4. Wait for the deploy to finish (usually 2-3 minutes)
5. Look for green "Published" status
```

**Timeline:**
```
🔄 Building...           [0:00]
🔄 Processing...         [0:30]
🔄 Deploying...          [1:30]
✅ Published             [2:00]
```

---

### Step 3️⃣: Test the Changes

```
1. Go to: https://smartlenderup.com
2. Login with your credentials
3. Click "Payments" tab
4. Click "+ Repayment" button
5. Look at "Select Loan" dropdown
```

**✅ What you should see:**

**BEFORE (Old Behavior):**
```
Select Loan dropdown shows:
├─ LN00001 - Client A - Outstanding: KES 0           ❌ Shouldn't show
├─ LN00002 - Client B - Outstanding: KES 50,000     ✅ Should show
├─ LN00003 - Client C - Outstanding: KES 0           ❌ Shouldn't show
└─ LN00013 - YUSUF OLELA - Outstanding: KES 140,000 ✅ Should show
```

**AFTER (New Behavior):**
```
Select Loan dropdown shows ONLY:
├─ LN00002 - Client B - Outstanding: KES 50,000     ✅ Has outstanding
└─ LN00013 - YUSUF OLELA - Outstanding: KES 140,000 ✅ Has outstanding
```

---

## ✅ Success Checklist

### Database Changes:
- [ ] Got organization UUID from Supabase
- [ ] Replaced 'YOUR_ORG_ID_HERE' in all SQL queries
- [ ] Interest rate updated successfully
- [ ] Payment of KES 100,000 recorded
- [ ] Outstanding balance reduced by KES 100,000
- [ ] Verification queries show correct data

### Code Deployment:
- [ ] Git commit successful
- [ ] Git push successful
- [ ] Netlify deployment shows "Published"
- [ ] Can access https://smartlenderup.com
- [ ] Record Payment modal opens
- [ ] Dropdown filters correctly (only shows loans with outstanding)
- [ ] Can see LN00013 in dropdown
- [ ] Can see the KES 100,000 payment in loan details

---

## 🆘 Common Issues & Solutions

### Issue 1: "No rows updated" in Step 3
**Cause:** Wrong organization ID  
**Solution:** 
- Go back to Step 2
- Re-run the query to get your UUID
- Make sure you copied the entire UUID
- Try again with correct UUID

---

### Issue 2: "Relation does not exist" error
**Cause:** Database schema not set up  
**Solution:**
- Go to Super Admin → Settings → Schema Migration
- Click "Run Migration"
- Wait for completion
- Try SQL again

---

### Issue 3: Changes not showing on website
**Cause:** Browser cache  
**Solution:**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear browser cache
- Or try incognito/private window

---

### Issue 4: "INSERT failed" in Step 4
**Cause:** Loan LN00013 doesn't exist  
**Solution:**
- Run this query to check:
  ```sql
  SELECT loan_number, client_name, status 
  FROM loans 
  WHERE loan_number = 'LN00013';
  ```
- If no results, loan doesn't exist in your database
- You may need to import loan data first

---

## 📞 Quick Reference

### Your Organization UUID:
```
Copy from Step 2 and keep handy:
_______________________________________
(Paste your UUID here for reference)
```

### Files to Use:
1. **Quick SQL:** `/COPY_PASTE_UPDATE_LN00013.sql`
2. **Detailed Guide:** `/DEPLOYMENT_GUIDE_LN00013_UPDATE.md`
3. **This Guide:** `/STEP_BY_STEP_VISUAL_GUIDE.md`

### Key Links:
- **Supabase:** https://supabase.com/dashboard
- **Netlify:** https://app.netlify.com
- **Live Site:** https://smartlenderup.com
- **GitHub:** https://github.com/yourusername/smartlenderup

---

## 🎯 Summary

**What Changed:**

1. **Loan LN00013:**
   - Interest Rate: 10% → 15% (or your specified rate)
   - Outstanding: KES 240,000 → KES 140,000
   - New Payment: KES 100,000 added

2. **Record Payment Feature:**
   - Old: Shows all active loans (even fully paid)
   - New: Shows only loans with outstanding balance

**Time Required:**
- Database updates: ~5 minutes
- Code deployment: ~3 minutes
- Testing: ~2 minutes
- **Total: ~10 minutes**

---

**Ready? Start with Step 1️⃣ above! 🚀**
