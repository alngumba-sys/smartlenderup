# Quick Diagnostic Tools Guide

Your microfinance platform now has two comprehensive diagnostic tools to help you verify calculations and troubleshoot discrepancies.

## 🔍 1. Interest Comparison Tool (Potential Interest Payable)

**Access:** Hover over the **Potential Interest Payable** card → Click the **🐛 bug icon**

**What it shows:**
- Comparison between system calculations and your Excel spreadsheet
- Line-by-line breakdown of each loan's interest calculation
- Identifies which loans have discrepancies
- Shows the exact formula used: `Principal × Rate × Term ÷ 100`

**When to use:**
- To verify Potential Interest Payable matches KSh 590,250
- When loan interest calculations seem incorrect
- To find which specific loans have calculation differences

**Example output:**
```
Expected (Spreadsheet): KSh 590,250
System Calculated: KSh 595,255
Difference: +KSh 5,005
Discrepancies: 3 loans
```

---

## 💰 2. Interest Paid Back Diagnostic

**Access:** Hover over the **Interest Paid Back** card → Click the **🐛 bug icon**

**What it shows:**
- All payment records with their interest portions
- Receipt numbers, dates, amounts
- Which database fields contain the interest data
- Total interest collected vs. expected
- Interest collection rate

**When to use:**
- To verify Interest Paid Back matches KSh 352,200
- When payment interest allocations seem incorrect
- To see which payments have been recorded
- To verify data is being read correctly from the database

**Example output:**
```
Expected (Spreadsheet): KSh 352,200.00
System Calculated: KSh 352,200.00
Collection Rate: 59.6%
Interest Outstanding: KSh 238,050.00
```

---

## 📊 Understanding the Metrics

### Dashboard Metrics (8 Key Values)

1. **Cumulative Amount Borrowed** (a)
   - Total principal disbursed
   - Sum of all loan principals

2. **Processing Fees** (b)
   - Total fees charged
   - Usually 1-3% of principal

3. **Potential Interest Payable** (c)
   - Total interest if all loans are repaid
   - Uses flat rate formula: P × R × T ÷ 100
   - **Diagnostic available** 🐛

4. **Total Amount Payable** (d)
   - Sum of (a) + (c)
   - Principal + Interest expected

5. **Principal Paid Back** (e)
   - Total principal repayments received
   - From payment records

6. **Interest Paid Back** (f)
   - Total interest payments received
   - From payment records
   - **Diagnostic available** 🐛

7. **Total Amount Repaid Back** (g)
   - Sum of (e) + (f)
   - Principal + Interest collected

8. **Outstanding Loans** (h)
   - (d) - (g)
   - Amount still owed

---

## 🔧 Troubleshooting

### If Interest Paid Back doesn't match:

1. **Check the diagnostic tool:**
   - Click the bug icon on Interest Paid Back card
   - Look for payments with 0 interest
   - Check if field indicators show green badges

2. **Verify database data:**
   - Open Supabase dashboard
   - Go to `repayments` table
   - Check `interest_paid` column has values

3. **Common issues:**
   - ❌ Payments created without interest breakdown
   - ❌ Interest allocated to wrong field
   - ✅ Should see: `interest_paid`, `principal_paid` fields populated

### If Potential Interest Payable doesn't match:

1. **Check the diagnostic tool:**
   - Click the bug icon on Potential Interest Payable card
   - Look at discrepancies section
   - Check rates and terms for each loan

2. **Common issues:**
   - ❌ Different interest rate than expected
   - ❌ Different term length than spreadsheet
   - ❌ Loan included/excluded incorrectly

---

## 📋 Spreadsheet Column Mapping

Your Excel columns map to system metrics as follows:

| Excel Column | System Metric |
|--------------|---------------|
| CUMM AMOUNT BORROWED | Cumulative Amount Borrowed |
| PROCESSING FEES | Processing Fees |
| POTENTIAL INTEREST PAYABLE | Potential Interest Payable 🐛 |
| TOTAL AMT PAYABLE | Total Amount Payable |
| PRINCIPAL PAID BACK | Principal Paid Back |
| INTREST PAID BACK | Interest Paid Back 🐛 |
| TOTAL AMOUNT REPAID BACK | Total Amount Repaid Back |
| OUTSTANDING LOANS | Outstanding Loans |

🐛 = Diagnostic tool available

---

## 💡 Pro Tips

1. **Use diagnostics proactively:**
   - Check them weekly to ensure data integrity
   - Before generating reports for stakeholders
   - After importing data from Excel

2. **Export diagnostic data:**
   - Take screenshots of discrepancies
   - Share with your data entry team
   - Use for training purposes

3. **Regular verification:**
   - Compare dashboard totals with Excel monthly
   - Run diagnostics after bulk operations
   - Verify after system updates

---

## 🆘 Getting Help

If diagnostics show issues:

1. **Document the problem:**
   - Screenshot of the diagnostic
   - Note which loans/payments are affected
   - Record the expected vs. actual values

2. **Check recent changes:**
   - Were loans recently imported?
   - Were payments manually entered?
   - Were any bulk updates performed?

3. **Verify in Supabase:**
   - Check the raw database values
   - Confirm field names match expectations
   - Look for null or zero values

---

## ✅ Success Indicators

Your system is working correctly when:

- ✅ Potential Interest Payable = KSh 590,250
- ✅ Interest Paid Back = KSh 352,200
- ✅ Diagnostic shows "Matches Spreadsheet" message
- ✅ All payment field indicators are green
- ✅ No discrepancies in loan breakdown tables

---

**Last Updated:** March 17, 2026
**System Version:** BV Funguo Microfinance Platform v2.0
