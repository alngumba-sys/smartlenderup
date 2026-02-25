# Column Name Reference for Loan 4869 Update

## ✅ ACTUAL Columns in YOUR Loans Table

Based on your step4 SQL file, here are the **EXACT** columns that exist:

### Loans Table - Actual Columns
| Column Name | Type | Description |
|------------|------|-------------|
| ✅ **organization_id** | UUID | Organization reference |
| ✅ **client_id** | TEXT/UUID | Client reference |
| ✅ **product_id** | TEXT/UUID | Loan product reference |
| ✅ **loan_number** | TEXT | Unique loan identifier |
| ✅ **amount** | NUMERIC | Principal amount |
| ✅ **interest_rate** | NUMERIC | Interest rate % |
| ✅ **term_period** | INTEGER | Loan term length |
| ✅ **term_period_unit** | TEXT | 'months', 'weeks', etc. |
| ✅ **repayment_frequency** | TEXT | 'monthly', 'weekly', etc. |
| ✅ **total_amount** | NUMERIC | Total repayable |
| ✅ **balance** | NUMERIC | Outstanding balance |
| ✅ **amount_paid** | NUMERIC | Amount paid so far |
| ✅ **disbursement_date** | TIMESTAMP | When loan was disbursed |
| ✅ **application_date** | TIMESTAMP | When loan was applied for |
| ✅ **maturity_date** | DATE | When loan matures |
| ✅ **phase** | INTEGER | Loan phase (1-5) |
| ✅ **status** | TEXT | 'pending', 'active', 'settled', etc. |
| ✅ **created_at** | TIMESTAMP | Record creation time |
| ✅ **updated_at** | TIMESTAMP | Record update time |

### ❌ Columns That DO NOT Exist
- ❌ notes
- ❌ settlement_date
- ❌ principal_amount (it's called `amount`)
- ❌ paid_amount (it's called `amount_paid`)
- ❌ outstanding_balance (it's called `balance`)
- ❌ duration_months (it's called `term_period`)

## 📝 Correct UPDATE for Loan 4869

```sql
UPDATE loans
SET 
  amount = 50000,
  term_period = 3,
  term_period_unit = 'months',
  repayment_frequency = 'monthly',
  interest_rate = 30.0,
  total_amount = 60600,
  amount_paid = 60600,
  balance = 0,
  status = 'settled',
  phase = 5,
  disbursement_date = '2026-01-02',
  application_date = '2026-01-02',
  maturity_date = '2026-04-02',
  updated_at = NOW()
WHERE loan_number = '4869';
```

## 💡 Status Values

Based on your data:
- 'pending' - New loan application
- 'active' - Active loan with payments ongoing
- **'settled'** - Loan fully paid ← Use this
- 'overdue' - Loan past due

## 🔍 Phase Values

- 1 - Pending/Application
- 2 - Under Review
- 3 - Approved
- 4 - Disbursed/Active
- **5 - Settled** ← Use this for paid loans

## 📊 Loan 4869 Details

| Field | Value |
|-------|-------|
| Principal | 50,000 |
| Original Total | 65,000 |
| Discounted Total | 60,600 |
| Discount | 4,400 |
| Status | settled |
| Phase | 5 |
| Term | 3 months |
| Paid In | 2 months (early payment) |

---

**Note**: All SQL files updated with correct column names!
