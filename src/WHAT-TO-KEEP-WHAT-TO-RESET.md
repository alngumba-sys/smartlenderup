# 🎯 Chart of Accounts - What to Keep & What to Reset

## Your Goal
**Start fresh with loan processing while keeping your bank balances intact.**

---

## ✅ **KEEP AS-IS (Don't Touch These)**

### **💰 Cash & Bank Accounts**
| Account Code | Account Name | Action |
|--------------|--------------|--------|
| **1110** | Cash in Hand | 🔒 **KEEP BALANCE** |
| **1120** | Cash at Bank | 🔒 **KEEP BALANCE** |
| **1130** | M-Pesa Account | 🔒 **KEEP BALANCE** |

**Why?** This is your actual money that you'll use to disburse loans.

---

### **💼 Equity Accounts**
| Account Code | Account Name | Action |
|--------------|--------------|--------|
| **3100** | Share Capital | 🔒 **KEEP BALANCE** |

**Why?** This represents shareholder investments in the company. Don't touch this!

---

### **📋 Account Structure**
| What | Action |
|------|--------|
| All account codes | 🔒 **KEEP** |
| All account names | 🔒 **KEEP** |
| Account hierarchy | 🔒 **KEEP** |
| Account types | 🔒 **KEEP** |

**Why?** You need the chart of accounts structure for double-entry bookkeeping.

---

## 🔄 **RESET TO ZERO (Clear Old Data)**

### **📊 Loan-Related Asset Accounts**
| Account Code | Account Name | Current Balance | New Balance |
|--------------|--------------|-----------------|-------------|
| **1200** | Loans Receivable | KSh 1,505,000 | **KSh 0** |
| **1210** | Interest Receivable | KSh 0 | **KSh 0** |
| **1220** | Accrued Interest | (if exists) | **KSh 0** |

**Why?** You're starting fresh with new loans, so old loan receivables should be cleared.

---

### **💵 Revenue Accounts**
| Account Code | Account Name | Action |
|--------------|--------------|--------|
| **4000** | Revenue | **RESET TO 0** |
| **4100** | Interest Income | **RESET TO 0** |
| **4200** | Processing Fee Income | **RESET TO 0** |
| **4300** | Late Payment Fees | **RESET TO 0** |
| **4400** | Other Income | **RESET TO 0** |

**Why?** Starting a fresh accounting period for new loan operations.

---

### **💸 Expense Accounts**
| Account Code | Account Name | Action |
|--------------|--------------|--------|
| **5000** | Expenses | **RESET TO 0** |
| **5100** | Salaries & Wages | **RESET TO 0** |
| **5200** | Operating Expenses | **RESET TO 0** |
| **5300** | Loan Loss Provision | **RESET TO 0** |
| **5400** | Other Expenses | **RESET TO 0** |

**Why?** Starting fresh accounting period.

---

### **📈 Retained Earnings**
| Account Code | Account Name | Action |
|--------------|--------------|--------|
| **3200** | Retained Earnings | **RESET TO 0** |

**Why?** Starting with a clean slate for profit/loss tracking.

---

## 🎯 **Quick Summary**

### **🔒 KEEP (Don't Change):**
```
✅ Cash in Hand (1110) - Keep actual balance
✅ Cash at Bank (1120) - Keep actual balance
✅ M-Pesa Account (1130) - Keep actual balance
✅ Share Capital (3100) - Keep actual balance
✅ All account codes, names, and structure
```

### **🔄 RESET TO 0:**
```
✅ Loans Receivable (1200)
✅ Interest Receivable (1210)
✅ All Revenue accounts (4000-4999)
✅ All Expense accounts (5000-5999)
✅ Retained Earnings (3200)
```

---

## 💡 **Your Starting Position**

After cleanup, your balance sheet will look like:

### **Assets:**
```
Cash in Hand:        KSh 76,600
Cash at Bank:        KSh 98,200
M-Pesa Account:      KSh 656,000
Loans Receivable:    KSh 0  ← Ready for new loans!
Interest Receivable: KSh 0  ← Will grow as you disburse
─────────────────────────────
Total Assets:        KSh 830,800
```

### **Equity:**
```
Share Capital:       KSh 2,265,000
Retained Earnings:   KSh 0
─────────────────────────────
Total Equity:        ?
```

### **Note on Balance Sheet:**
After resetting, your balance sheet might not balance perfectly:
- **Assets: KSh 830,800**
- **Equity: KSh 2,265,000**

This is normal! It means:
1. You have more equity than cash (some money might be in bank accounts not shown)
2. OR you need to adjust Share Capital to match your actual cash
3. OR there are other assets/liabilities not shown here

**Don't worry!** Once you start disbursing loans, the accounting will balance naturally.

---

## 🚀 **How to Do This (3 Options)**

### **Option 1: Run the SQL Script (Easiest)** ⚡
1. Copy the script from `/chart-of-accounts-cleanup-guide.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Done! ✅

### **Option 2: Manual UI Update** 🖱️
1. Go to Supabase → Table Editor → `chart_of_accounts`
2. Find account code **1200** (Loans Receivable)
3. Click to edit, set `balance = 0`, save
4. Repeat for **1210** (Interest Receivable)
5. Repeat for all **Revenue** accounts (4000-4999)
6. Repeat for all **Expense** accounts (5000-5999)
7. Repeat for **3200** (Retained Earnings)

### **Option 3: Quick SQL (Fastest)** 🏃
```sql
-- Copy & paste this quick script
UPDATE chart_of_accounts 
SET balance = 0, debit = 0, credit = 0
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
  AND account_code IN ('1200', '1210', '3200')
  OR account_type IN ('revenue', 'expense');
```

---

## ✅ **Verification**

After cleanup, run this to verify:

```sql
SELECT 
    account_code,
    account_name,
    balance,
    CASE 
        WHEN balance > 0 THEN '✅ Has Balance'
        ELSE '📝 Zero Balance'
    END as status
FROM chart_of_accounts
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY account_code;
```

**Expected Results:**
- ✅ 1110 (Cash in Hand) - Has balance
- ✅ 1120 (Cash at Bank) - Has balance
- ✅ 1130 (M-Pesa) - Has balance
- 📝 1200 (Loans Receivable) - Zero
- 📝 1210 (Interest Receivable) - Zero
- ✅ 3100 (Share Capital) - Has balance
- 📝 3200 (Retained Earnings) - Zero
- 📝 All Revenue accounts - Zero
- 📝 All Expense accounts - Zero

---

## 🎯 **After Cleanup - You're Ready To:**

1. ✅ Add your 22 test clients
2. ✅ Disburse 11 test loans
3. ✅ Start tracking new loan receivables
4. ✅ Record interest income as it accrues
5. ✅ Track payments and collections
6. ✅ Generate accurate financial reports

---

## 💰 **Your Available Capital**

Total cash available to disburse loans:
```
Cash in Hand (1110):    KSh    76,600
Cash at Bank (1120):    KSh    98,200
M-Pesa Account (1130):  KSh   656,000
──────────────────────────────────────
TOTAL AVAILABLE:        KSh   830,800
```

**You can safely disburse loans totaling up to KSh 830,800!**

---

## ⚠️ **Important Notes**

1. **Don't delete accounts** - Just reset balances to 0
2. **Keep the structure** - You need all account codes for the system
3. **Bank balances stay** - These represent real money in your accounts
4. **Share Capital stays** - This is shareholder investment
5. **Only reset transactional data** - Loans, Revenue, Expenses

---

**Ready to start? Run the SQL script and begin processing fresh loans!** 🚀
