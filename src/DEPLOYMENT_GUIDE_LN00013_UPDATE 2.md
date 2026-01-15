# Deployment Guide: Update LN00013 & Record Payment

## Summary of Changes

### Part A: Update Interest Rate for Loan LN00013
- **Loan ID:** LN00013
- **Client:** YUSUF OLELA OMONDI
- **Client ID:** CL00011
- **Current Interest Rate:** 10.0%
- **Action:** Update to new interest rate (specify your desired rate)

### Part B: Record Payment of KES 100,000
- **Amount:** KES 100,000
- **Client:** YUSUF OLELA OMONDI
- **Loan:** LN00013
- **Action:** Create repayment record and update outstanding balance

### Part C: Filter Record Payment Dropdown
- **Current Behavior:** Shows all Active, Disbursed, and In Arrears loans
- **New Behavior:** Only show loans with outstanding balance > 0 OR status = "In Arrears"
- **Status:** ✅ Already implemented in codebase

---

## Step-by-Step Deployment Instructions

### STEP 1: Update Code Changes (Already Done ✅)

The Record Payment modal has been updated to filter loans correctly. The change is already in your codebase at:
- **File:** `/components/modals/RecordPaymentModal.tsx`
- **Change:** Lines 128-135 now filter for loans with `outstanding > 0` OR `status = "In Arrears"`

### STEP 2: Update Loan LN00013 in Supabase Database

#### Option 1: Use Supabase Dashboard SQL Editor

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your SmartLenderUp project
   - Click "SQL Editor" in the left sidebar

2. **Get Your Organization ID**
   ```sql
   SELECT id, organization_name, username 
   FROM organizations 
   ORDER BY organization_name;
   ```
   - Copy your organization UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

3. **Update Interest Rate**
   - Replace `YOUR_ORG_ID_HERE` with your actual organization ID
   - Replace `12.0` with your desired interest rate
   
   ```sql
   UPDATE loans 
   SET 
     interest_rate = 12.0,  -- ⬅️ CHANGE THIS to your desired rate
     updated_at = NOW()
   WHERE 
     loan_number = 'LN00013' 
     AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID
   ```

4. **Record the KES 100,000 Payment**
   - Replace `YOUR_ORG_ID_HERE` with your actual organization ID (3 places)
   
   ```sql
   -- Insert repayment record
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
     'YOUR_ORG_ID_HERE',  -- ⬅️ PASTE YOUR ORG ID
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
     AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID
   
   -- Update outstanding balance
   UPDATE loans 
   SET 
     outstanding_balance = outstanding_balance - 100000,
     updated_at = NOW()
   WHERE 
     loan_number = 'LN00013' 
     AND organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID
   ```

5. **Verify the Changes**
   ```sql
   -- Check loan details
   SELECT 
     l.loan_number,
     c.client_number,
     c.name as client_name,
     l.principal_amount,
     l.interest_rate,
     l.outstanding_balance,
     l.status,
     l.updated_at
   FROM loans l
   JOIN clients c ON l.client_id = c.id
   WHERE l.loan_number = 'LN00013' 
     AND l.organization_id = 'YOUR_ORG_ID_HERE';  -- ⬅️ PASTE YOUR ORG ID
   
   -- Check repayment records
   SELECT 
     r.receipt_number,
     r.amount,
     r.payment_date,
     r.payment_method,
     r.transaction_reference,
     r.status,
     r.created_at
   FROM repayments r
   JOIN loans l ON r.loan_id = l.id
   WHERE l.loan_number = 'LN00013'
     AND l.organization_id = 'YOUR_ORG_ID_HERE'  -- ⬅️ PASTE YOUR ORG ID
   ORDER BY r.created_at DESC;
   ```

#### Option 2: Use Pre-Made SQL Files

I've created two SQL files for you:
- **`/UPDATE_LN00013_INTEREST_AND_PAYMENT.sql`** - Detailed version with comments
- **`/QUICK_UPDATE_LN00013.sql`** - Quick version for fast execution

To use:
1. Open either file
2. Copy the entire content
3. Paste into Supabase SQL Editor
4. Follow the instructions in the file to replace `YOUR_ORG_ID_HERE`
5. Execute the script

---

## STEP 3: Deploy Code Changes to Netlify

Since the code changes for filtering loans are already in your repository:

1. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "feat: Filter Record Payment dropdown to show only loans with outstanding balance or In Arrears status"
   git push origin main
   ```

2. **Verify Deployment**
   - Go to: https://app.netlify.com
   - Check your SmartLenderUp deployment
   - Wait for build to complete (usually 2-3 minutes)
   - Visit: https://smartlenderup.com

3. **Test the Changes**
   - Login to your platform
   - Go to Payments tab
   - Click "+ Repayment" button
   - Verify the "Select Loan" dropdown only shows:
     - Loans with outstanding balance > 0
     - OR loans with status "In Arrears"

---

## Expected Results

### ✅ After Database Update:

**Loan LN00013 Details:**
- Interest Rate: Updated to your specified rate (e.g., 12.0%)
- Outstanding Balance: Reduced by KES 100,000
- Status: Remains unchanged (unless outstanding becomes 0)

**New Repayment Record:**
- Amount: KES 100,000
- Client: YUSUF OLELA OMONDI (CL00011)
- Loan: LN00013
- Status: Approved
- Receipt Number: Auto-generated (e.g., REC20260107001)
- Transaction Reference: Auto-generated (e.g., MPABCD1234)

### ✅ After Code Deployment:

**Record Payment Modal:**
- Dropdown will only show loans that can accept payments
- Hidden: Fully paid loans (outstanding = 0)
- Visible: Loans with any outstanding balance or In Arrears status

---

## Verification Checklist

- [ ] Organization ID obtained from Supabase
- [ ] Interest rate updated for LN00013
- [ ] Payment of KES 100,000 recorded
- [ ] Outstanding balance reduced correctly
- [ ] Repayment record created successfully
- [ ] Code changes committed and pushed
- [ ] Netlify deployment successful
- [ ] Record Payment dropdown filters correctly
- [ ] Can see YUSUF OLELA OMONDI's payment in platform

---

## Troubleshooting

### Issue: "No rows updated" when updating interest rate
**Solution:** Make sure you replaced `YOUR_ORG_ID_HERE` with your actual organization UUID

### Issue: "Column does not exist" error
**Solution:** Your Supabase schema might be outdated. Run the schema migration first from Super Admin → Settings → Schema Migration

### Issue: Payment not showing in platform
**Solution:** 
1. Check if the repayment was inserted: Run the verification query
2. Reload the platform page (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors

### Issue: Record Payment dropdown shows all loans
**Solution:**
1. Verify Netlify deployment completed successfully
2. Clear browser cache and reload
3. Check that the code changes are in your GitHub repository

---

## Files Created

1. `/UPDATE_LN00013_INTEREST_AND_PAYMENT.sql` - Complete SQL script with detailed comments
2. `/QUICK_UPDATE_LN00013.sql` - Quick SQL script for fast execution
3. `/DEPLOYMENT_GUIDE_LN00013_UPDATE.md` - This deployment guide

---

## Support

If you encounter any issues:
1. Check the verification queries to confirm data state
2. Review Supabase logs in Dashboard → Logs
3. Check browser console for JavaScript errors
4. Verify your organization ID is correct

---

**Last Updated:** January 7, 2026
**Platform:** SmartLenderUp (https://smartlenderup.com)
**Supabase Project:** BV Funguo Ltd Microfinance Platform
