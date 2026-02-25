# 📋 Instructions: Update Loan 4869

## Quick Summary
Update loan 4869 (George Munyau Kavuva) to reflect early payment with discount:
- **Principal**: 50,000
- **Paid in**: 2 months (instead of 3)
- **Total Paid**: 60,600 (discounted from 65,000)
- **Discount**: 4,400

---

## 🚀 Step-by-Step Instructions

### Step 1: Backup (Optional but Recommended)
```sql
-- Backup current loan data
CREATE TABLE loans_backup_4869 AS
SELECT * FROM loans WHERE loan_number = '4869';

CREATE TABLE payments_backup_4869 AS
SELECT * FROM payments 
WHERE loan_id IN (SELECT id FROM loans WHERE loan_number = '4869');
```

### Step 2: Execute Update Script
1. Open your Supabase SQL Editor
2. Copy and paste the contents of `LOAN-4869-UPDATE.sql`
3. Click "Run"
4. Wait for success message

### Step 3: Verify the Update
1. Copy and paste the contents of `VERIFY-LOAN-4869.sql`
2. Click "Run"
3. Review the verification report
4. Ensure all checks show ✅ PASS

### Step 4: Test Frontend
1. Navigate to **Operations** tab
2. Search for loan **4869**
3. Click to open **ComprehensiveLoanDetailsModal**
4. Verify the following:
   - ✅ Status badge shows **"Paid"** (green)
   - ✅ Outstanding Balance shows **0**
   - ✅ Total Paid shows **60,600**
   - ✅ Amortization schedule shows 2 payments
   - ✅ Notes show early payment discount

### Step 5: Check Client Profile
1. Navigate to **Clients** tab
2. Search for **George Munyau Kavuva**
3. Click to open client details
4. Verify:
   - ✅ Outstanding shows correct amount
   - ✅ Total Paid includes this loan
   - ✅ Payment history shows the discount

---

## ✅ Expected Results

### Loan Record (loans table)
| Field | Value |
|-------|-------|
| loan_number | 4869 |
| principal_amount | 50,000 |
| total_repayable | 60,600 |
| paid_amount | 60,600 |
| outstanding_balance | 0 |
| status | Paid |
| loan_term | 3 months |
| settlement_date | 2026-03-02 |

### Payment Records (payments table)
| Date | Amount | Principal | Interest | Notes |
|------|--------|-----------|----------|-------|
| 2026-02-02 | 30,300 | 25,000 | 5,300 | First payment - Month 1 |
| 2026-03-02 | 30,300 | 25,000 | 5,300 | Final payment with discount |
| 2026-03-02 | 4,400 | 0 | 4,400 | Early payment discount |

### Frontend Display
```
┌─────────────────────────────────────────┐
│ Loan #4869 - George Munyau Kavuva       │
├─────────────────────────────────────────┤
│ Status: 🟢 Paid                         │
│ Principal: KES 50,000                   │
│ Total Repayable: KES 60,600             │
│ Total Paid: KES 60,600                  │
│ Outstanding: KES 0                      │
│ Discount: KES 4,400 (Early Payment)    │
│ Duration: 2 months (of 3 months)        │
└─────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Issue: Outstanding Balance Not Zero
**Solution**: Ensure `paid_amount` and `total_repayable` both equal 60,600

### Issue: Frontend Shows Old Data
**Solution**: 
1. Click the refresh button in the Operations tab
2. Or reload the page (Ctrl+R or Cmd+R)

### Issue: Payments Don't Add Up
**Solution**: Check that all 3 payment records were created:
```sql
SELECT COUNT(*) FROM payments 
WHERE loan_id IN (SELECT id FROM loans WHERE loan_number = '4869');
-- Should return: 3
```

### Issue: Status Not "Paid"
**Solution**: Manually update:
```sql
UPDATE loans 
SET status = 'Paid', outstanding_balance = 0
WHERE loan_number = '4869';
```

---

## 📊 Business Logic Explanation

### Why 60,600 instead of 65,000?

**Original Loan Structure (3 months)**:
- Principal: 50,000
- Interest (30% for 3 months): 15,000
- Total: 65,000
- Monthly payment: ~21,667

**Early Payment (2 months)**:
- Principal: 50,000 (unchanged)
- Interest (30% for 2 months): 10,600
- **Discount**: 4,400 (1 month's interest waived)
- Total: 60,600
- Monthly payment: 30,300

### Discount Calculation
```
Discount = (Original Interest) - (Actual Interest)
         = 15,000 - 10,600
         = 4,400

Discount % = (4,400 / 65,000) × 100
           = 6.77%
```

This incentivizes early repayment and reduces the institution's risk exposure.

---

## 📞 Support

If you encounter any issues:
1. Check the verification report for errors
2. Review the backup tables if rollback is needed
3. Contact system administrator

---

**Last Updated**: February 25, 2026  
**Script Version**: 1.0  
**Status**: ✅ Ready for Production
