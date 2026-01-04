# 📊 SmartLenderUp Data Import Instructions

## Quick Summary

✅ **23 Loan Records** ready to import
- 17 Unique Borrowers (clients)
- 23 Loans (some borrowers have multiple loans)
- 23 Guarantor records
- **10 Fully Paid Loans** (status: 'closed')
- **13 Overdue Loans** (status: 'overdue')

---

## 🚀 Import Steps (5 Minutes)

### **STEP 1: Get Your Organization ID**

1. Go to **Supabase Dashboard** → SQL Editor
2. Run this query:

```sql
SELECT id, organization_name FROM organizations;
```

3. **Copy your organization ID** (it looks like: `123e4567-e89b-12d3-a456-426614174000`)

---

### **STEP 2: Update the SQL File**

1. Open `/IMPORT_DATA_SQL.sql`
2. Find and replace **ALL instances** of `YOUR_ORG_ID_HERE` with your actual organization ID
3. Use Find & Replace (Ctrl+H or Cmd+H):
   - Find: `YOUR_ORG_ID_HERE`
   - Replace: `<paste your actual org ID>`
   - Replace All

---

### **STEP 3: Execute in Supabase**

1. Go to **Supabase Dashboard** → SQL Editor
2. Click **"New Query"**
3. **Copy the ENTIRE contents** of `/IMPORT_DATA_SQL.sql`
4. **Paste into the SQL Editor**
5. Click **"Run"** or press `Ctrl+Enter`

⏱️ **Should take 5-10 seconds to complete**

---

### **STEP 4: Verify Import**

Run these verification queries in Supabase:

```sql
-- Check clients (should see 17)
SELECT COUNT(*) as total_clients FROM clients 
WHERE organization_id = 'YOUR_ORG_ID_HERE';

-- Check loans (should see 23)
SELECT COUNT(*) as total_loans FROM loans 
WHERE organization_id = 'YOUR_ORG_ID_HERE';

-- Check guarantors (should see 23)
SELECT COUNT(*) as total_guarantors FROM loan_guarantors;

-- Summary by status
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_principal,
  SUM(balance) as total_outstanding
FROM loans 
WHERE organization_id = 'YOUR_ORG_ID_HERE'
GROUP BY status;
```

**Expected Results:**
- ✅ 17 clients
- ✅ 23 loans
- ✅ 23 guarantors
- ✅ 10 loans with status 'closed'
- ✅ 13 loans with status 'overdue'

---

## 📋 Data Breakdown

### **Clients with Multiple Loans:**

1. **STEPHEN MULU NZAVI** - 4 loans (Client: CL00001)
   - Loan 1: 50K (Fully Paid)
   - Loan 12: 50K (Fully Paid)
   - Loan 16: 100K (Fully Paid)
   - Loan 22: 100K (Overdue: -110,000)

2. **BEN K MBUVI** - 3 loans (Client: CL00004)
   - Loan 4: 50K (Fully Paid)
   - Loan 19: 100K (Overdue: -110,000)
   - Loan 22: 100K (Overdue: -110,000)

3. **JOSPHAT M MATHEKA** - 2 loans (Client: CL00003)
   - Loan 3: 250K (Fully Paid)
   - Loan 6: 50K (Fully Paid)

4. **ERIC MUTHAMA** - 2 loans (Client: CL00006)
   - Loan 7: 100K (Fully Paid)
   - Loan 18: 150K (Overdue: -165,000)

---

### **Loan Status Distribution:**

| Status | Count | Total Principal | Total Outstanding |
|--------|-------|-----------------|-------------------|
| **Closed** (Fully Paid) | 10 | 905,000 KES | 0 KES |
| **Overdue** (Not Due) | 13 | 1,420,000 KES | -1,584,150 KES |
| **TOTAL** | **23** | **2,325,000 KES** | **-1,584,150 KES** |

---

### **Interest Rate Distribution:**

- **10.0%** - 17 loans (majority)
- **5.0%** - 4 loans
- **2.5%** - 2 loans (OLIVINE, BLOOMING BUD)
- **7.5%** - 1 loan (JAMES MBUVI)

---

### **Repayment Periods:**

- **30 Days (1 month)** - 18 loans
- **60 Days (2 months)** - 2 loans
- **90 Days (3 months)** - 3 loans

---

## 🎯 What Gets Created

### **1. Clients Table** (17 records)
Each client gets:
- ✅ Unique UUID (auto-generated)
- ✅ Client Number (CL00001 - CL00017)
- ✅ Name (first_name, last_name, full name)
- ✅ Phone number
- ✅ ID Number (where available)
- ✅ Status: 'active'
- ✅ KYC Status: 'approved'
- ✅ Verification Status: 'verified'

### **2. Loans Table** (23 records)
Each loan gets:
- ✅ Unique UUID (auto-generated)
- ✅ Loan Number (LN00001 - LN00023)
- ✅ Linked to client via client_id (UUID)
- ✅ Amount, interest rate, term period
- ✅ Total amount, balance, amount paid
- ✅ Application date, disbursement date, maturity date
- ✅ Status: 'closed' or 'overdue'
- ✅ Phase: 5 (completed workflow)

### **3. Loan Guarantors Table** (23 records)
Each guarantor gets:
- ✅ Unique UUID (auto-generated)
- ✅ Linked to loan via loan_id (UUID)
- ✅ Guarantor name, ID number, phone
- ✅ Relationship to client
- ✅ Consent status (true for paid loans, false for overdue)

---

## ⚠️ Important Notes

### **Client Number Format:**
- Uses **CL00001 format** (CL + 5 digits) as per your system
- Sequential from CL00001 to CL00017

### **Loan Number Format:**
- Uses **LN00001 format** (LN + 5 digits)
- Sequential from LN00001 to LN00023

### **Negative Outstanding Balance:**
- In your Excel, "Outstanding" column shows **negative values** for overdue loans
- Example: -110,000 means the loan is 110,000 KES overdue
- This is properly mapped to the `balance` field in loans table

### **Loan Status Logic:**
- **Green rows (Fully Paid Up)** → `status = 'closed'`, `balance = 0`, `amount_paid = total_amount`
- **Orange rows (Not Due)** → `status = 'overdue'`, `balance = negative value`, `amount_paid = 0 or partial`

### **Guarantor Consent:**
- **Fully Paid loans** → `consent_given = true`
- **Overdue loans** → `consent_given = false`

### **Special Cases:**
1. **CAR - KBJ 728Z** (Loan 11) → Marked as 'Collateral' instead of 'Guarantor'
2. **SELF - PD CHEQUE** (Loan 21) → Marked as 'Self Guarantee'
3. **JOSPHAT M MATHEKA (Sis)** → Same person as main JOSPHAT, different loan

---

## 🔄 If You Need to Re-Import

If you need to delete and re-import:

```sql
-- Delete in reverse order (guarantors first, then loans, then clients)
DELETE FROM loan_guarantors WHERE loan_id IN (SELECT id FROM loans WHERE organization_id = 'YOUR_ORG_ID_HERE');
DELETE FROM loans WHERE organization_id = 'YOUR_ORG_ID_HERE';
DELETE FROM clients WHERE organization_id = 'YOUR_ORG_ID_HERE' AND client_number LIKE 'CL000%';
```

Then run the import SQL again.

---

## ✅ Success Checklist

After import, you should see in SmartLenderUp dashboard:

- [ ] 17 new clients in Borrowers tab
- [ ] 23 new loans in Loans tab
- [ ] 10 loans marked as "Closed" (fully paid)
- [ ] 13 loans marked as "Overdue" (not due)
- [ ] Guarantor information visible in loan details
- [ ] Total portfolio: 2,325,000 KES
- [ ] Outstanding balance: -1,584,150 KES (overdue)

---

## 🆘 Troubleshooting

### **Error: "organization_id not found"**
→ You forgot to replace `YOUR_ORG_ID_HERE` with your actual org ID

### **Error: "duplicate key value"**
→ Data already imported. Use the delete queries above and try again

### **Error: "foreign key constraint"**
→ Make sure you're running the SQL in order (clients first, then loans, then guarantors)

### **Some loans not showing in dashboard**
→ Check if you're logged in with the correct organization
→ Refresh the dashboard (F5)
→ Check browser console for errors

---

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase SQL Editor error message
2. Verify your organization_id is correct
3. Make sure you copied the entire SQL file
4. Try running each section separately (clients, then loans, then guarantors)

---

**Ready to import? Follow the steps above and you'll have all 23 loans in your system in under 5 minutes!** 🚀
