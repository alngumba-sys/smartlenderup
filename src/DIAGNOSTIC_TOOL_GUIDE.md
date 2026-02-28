# 🔍 Loan Status Diagnostic Tool - User Guide

## How to Access

1. **Go to Admin Dashboard** → **Loans Tab**
2. **Click the purple "Diagnostics" button** in the top-right corner
3. The diagnostic modal will open showing all loan status analysis

---

## What the Tool Shows

### 📊 **Statistics Dashboard**

Five key metrics at the top:

1. **Total Loans** - Total number of loans in the system
2. **Marked as "Paid"** - How many loans have status = "Paid", "Fully Paid", "Settled", or "Closed"
3. **Status Mismatches** - Loans where the status doesn't match the calculated outstanding balance
4. **Should Be Paid** - Loans that are fully repaid (balance = 0) but not marked as "Paid"
5. **Incorrectly Paid** - Loans marked as "Paid" but still have an outstanding balance

---

### 🔍 **Diagnostic Table Columns**

| Column | Description |
|--------|-------------|
| **Loan #** | Loan number (e.g., LN-001) |
| **Client** | Client name |
| **Current Status** | Status from database (Active, Paid, etc.) |
| **Principal** | Original loan amount |
| **Total Repayable** | Principal + Interest (calculated using 7.5% formula) |
| **Paid** | Total repayments received from database |
| **Calculated O/S** | Outstanding = Total Repayable - Paid |
| **DB O/S** | Outstanding balance stored in database |
| **Repayments** | Number of repayment records for this loan |
| **Should Be** | What the status SHOULD be based on balance |
| **Analysis** | Visual indicator of status correctness |

---

### 🎨 **Analysis Icons**

- ✅ **Green Check (OK)** - Status is correct
- ⚠️ **Orange Warning (Mark Paid)** - Fully repaid but not marked as "Paid" yet
- ❌ **Red X (Wrong)** - Marked as "Paid" but still has outstanding balance

---

### 🔎 **Filter Options**

1. **All Loans** - Shows all loans
2. **Marked as Paid** - Only shows loans with "Paid" status
3. **Mismatches** - Only shows loans with status issues

---

## What to Look For

### ✅ **Normal Scenarios**

1. **Active loan with balance** - Status = "Active", Outstanding > 0 ✓
2. **Fully paid loan** - Status = "Paid", Outstanding = 0 ✓

### ⚠️ **Issues to Investigate**

1. **Should Be Paid** (Orange warning)
   - Calculated Outstanding = 0
   - Status = "Active" or "Disbursed"
   - **Reason:** Full repayments received but status not updated
   - **Action:** These should be marked as "Fully Paid"

2. **Incorrectly Paid** (Red X)
   - Status = "Paid" or "Fully Paid"
   - Calculated Outstanding > 0
   - **Reason:** Status was changed manually OR calculation error
   - **Action:** Investigate why marked as paid with balance remaining

---

## Understanding the Data

### Formula Used
```
Total Repayable = Principal + Interest
Interest = Principal × Rate × Term / 100
Outstanding = Total Repayable - Total Paid
```

### Example
- Principal: KES 100,000
- Interest Rate: 7.5% monthly
- Term: 3 months
- Interest: 100,000 × 7.5 × 3 / 100 = KES 22,500
- Total Repayable: KES 122,500
- If Paid: KES 122,500
- Outstanding: 0 → Should be marked "Paid"

---

## Common Questions

### Q: Why are some loans marked as "Paid"?
**A:** Two possible reasons:
1. Full repayments were recorded, triggering automatic status update
2. Someone manually changed the status in the admin panel

### Q: How does automatic status update work?
**A:** In `/contexts/DataContext.tsx`, when a repayment is added:
```typescript
status: newOutstandingBalance <= 0 ? 'Fully Paid' : loan.status
```
If outstanding balance reaches 0, status automatically becomes "Fully Paid"

### Q: What if I see mismatches?
**A:** This could indicate:
1. Repayments were recorded incorrectly
2. Loan amounts were changed after repayments
3. Manual status changes
4. Data inconsistency between tables

---

## Next Steps

After reviewing the diagnostics, you can:

1. **Export the data** - Take screenshots or copy problematic loan numbers
2. **Investigate specific loans** - Click on loans in the main Loans tab to see full details
3. **Fix issues** - Update loan statuses or repayment records as needed
4. **Report findings** - Share specific loan numbers that need correction

---

## Technical Details

### Files Involved
- **Diagnostic Component:** `/components/diagnostics/LoanStatusDiagnostic.tsx`
- **Auto-Update Logic:** `/contexts/DataContext.tsx` (lines 3767, 3877)
- **Display Override:** `/components/tabs/LoansTab.tsx` (lines 1765-1769)

### Database Tables Queried
- `loans` - Loan records with status and balances
- `repayments` - Payment records
- `clients` - Client information

---

**Created:** February 27, 2026
**Purpose:** Investigate loan status "Paid" issues
**Location:** Admin Dashboard → Loans Tab → Diagnostics Button
