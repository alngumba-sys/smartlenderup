# 📊 Credit Scoring for NEW Microfinance Business - BV Funguo Ltd

## 🆕 **Critical Context: You're a NEW Business**

### **What This Means:**
- ❌ Most clients have **short account age** (1-6 months)
- ❌ Limited **loan history** (1-3 loans per client maximum)
- ❌ Few clients with **multiple completed cycles**
- ❌ Minimal **historical data** to predict from
- ✅ Need to make **credit decisions with limited data**
- ✅ Must focus on **current behavior** over long-term history

---

## 🚨 **MAJOR PROBLEM: Penalizing Everyone for Being New!**

### **Current "Account Age" Weight:**
- **Individual: 15%**
- **Business: 20%**

**Algorithm:**
```javascript
accountAgeScore = (months × 5) capped at 100

Examples:
- 20+ months → 100/100 (perfect score)
- 12 months → 60/100
- 6 months → 30/100
- 3 months → 15/100  ← Most of YOUR clients!
- 1 month → 5/100
```

**The Problem:**
If your business is only **6-12 months old**, then:
- ✅ Your BEST clients have only 6-12 months of history
- ❌ They ALL get 30-60% on Account Age
- ❌ Takes **20 months** to reach 100% (you haven't existed that long!)
- ❌ **Everyone is artificially penalized** for YOUR business being new

**This is like failing all students because the school just opened!**

---

## 📊 **REVISED PARAMETERS FOR NEW BUSINESS**

### **For INDIVIDUAL Clients:**

| Parameter | Old Rec | NEW Rec | Change | Rationale |
|-----------|---------|---------|--------|-----------|
| **Payment History** | 50% | **40%** | ↓ -10% | Most clients have 1-3 loans only |
| **Credit Utilization** | 30% | **40%** | ↑ +10% | Shows CURRENT repayment capacity |
| **Account Age** | 8% | **5%** | ↓ -3% | CRITICAL: Don't penalize for being new |
| **Loan Count** | 12% | **10%** | ↓ -2% | Most have 1-2 loans (not meaningful yet) |
| **Current Behavior** | 0% | **5%** | NEW | Days since last payment (real-time) |
| **Savings Balance** | 0% | **0%** | Same | NOT APPLICABLE |

**Total**: 100%

---

### **For BUSINESS Clients:**

| Parameter | Old Rec | NEW Rec | Change | Rationale |
|-----------|---------|---------|--------|-----------|
| **Payment History** | 45% | **35%** | ↓ -10% | Limited history available |
| **Credit Utilization** | 25% | **35%** | ↑ +10% | Current cash flow = best indicator |
| **Account Age** | 20% | **10%** | ↓ -10% | Your business is new = all clients are "new" |
| **Loan Count** | 10% | **10%** | Same | Experience still matters slightly |
| **Current Behavior** | 0% | **10%** | NEW | Recent payment activity |
| **Savings Balance** | 0% | **0%** | Same | NOT APPLICABLE |

**Total**: 100%

---

## 🎯 **NEW PARAMETER: Current Behavior (5-10%)**

### **Why Add This?**

When you have **limited historical data**, **recent behavior** is your best predictor!

**What to measure:**
- Days since last payment
- Payment frequency (payments per month)
- Consistency of payments

**Suggested algorithm:**
```javascript
// Current Behavior Score (0-100)
const daysSinceLastPayment = loan.daysSinceLastPayment || 999;

let currentBehaviorScore = 100;

// Penalty for payment gaps
if (daysSinceLastPayment > 60) currentBehaviorScore = 0;
else if (daysSinceLastPayment > 45) currentBehaviorScore = 30;
else if (daysSinceLastPayment > 30) currentBehaviorScore = 50;
else if (daysSinceLastPayment > 14) currentBehaviorScore = 70;
else if (daysSinceLastPayment > 7) currentBehaviorScore = 90;
else currentBehaviorScore = 100; // Paid within last 7 days

// Bonus for payment frequency
const paymentsThisMonth = clientRepayments.filter(r => 
  isWithinLastNDays(r.paymentDate, 30)
).length;

if (paymentsThisMonth >= 2) currentBehaviorScore = Math.min(100, currentBehaviorScore + 10);
```

**This rewards:**
- ✅ Clients paying regularly RIGHT NOW
- ✅ Recent payment activity (last 7-14 days)
- ✅ Consistency (multiple payments per month)

**This penalizes:**
- ❌ Gaps in payment (>30 days since last payment)
- ❌ Clients who started well but stopped paying

---

## 📈 **Comparison: Mature Business vs NEW Business**

### **MATURE Microfinance (5+ years old):**

```
Individual Clients:
┌─────────────────────────────┐
│ Payment History      50%    │ ← Long track record available
│ Credit Utilization   30%    │
│ Account Age          10%    │ ← Some clients have 5+ years
│ Loan Count           10%    │ ← Multiple loan cycles completed
│ Current Behavior      0%    │ ← History speaks for itself
└─────────────────────────────┘
```

**Logic:** You have 5+ years of data, so **historical patterns** are reliable.

---

### **NEW Microfinance (6-18 months old) - YOUR CASE:**

```
Individual Clients:
┌─────────────────────────────┐
│ Credit Utilization   40%    │ ← Shows CURRENT capacity
│ Payment History      40%    │ ← Limited but still important
│ Loan Count           10%    │ ← Most have 1-3 loans only
│ Current Behavior      5%    │ ← Recent activity matters
│ Account Age           5%    │ ← Don't penalize for being new
└─────────────────────────────┘
```

**Logic:** Limited history, so **current behavior** and **repayment capacity** are best indicators.

---

## 🔍 **Detailed Rationale**

### **1. Credit Utilization = 40% (NEW TOP PRIORITY)**

**Why increase from 30% to 40%?**

When you lack **historical data**, **current repayment rate** is your **best real-time indicator**:

```javascript
repaymentRate = totalRepaid / totalBorrowed

Examples:
- Client borrowed KES 50,000, repaid KES 48,000 = 96% ✅
- Client borrowed KES 30,000, repaid KES 15,000 = 50% ⚠️
- Client borrowed KES 20,000, repaid KES 0 = 0% ❌
```

**This shows:**
- ✅ **Actual cash flow** (not promises)
- ✅ **Current financial health** (not past)
- ✅ **Ability to pay** (not just willingness)

**For NEW clients with only 1-2 loans:**
- Repayment rate is MORE meaningful than "3 months account age"
- Shows they can ACTUALLY pay, not just that they registered 3 months ago

---

### **2. Payment History = 40% (Still Important)**

**Why reduce from 50% to 40%?**

**Problem with limited history:**
```
Client A: 1 loan, fully paid → 100% closure rate
Client B: 3 loans, 2 paid, 1 active → 66% closure rate
```

**Who's riskier?** Hard to tell with so few data points!

- Client A might be great (or just lucky once)
- Client B might be good (2/3 success) or struggling (1 active in arrears?)

**Solution:** Still weight it highly (40%) but **combine** with current behavior signals.

---

### **3. Account Age = 5% (Individual) / 10% (Business)**

**CRITICAL REDUCTION for new businesses!**

**Why drop to 5-10%?**

**Scenario: Your business opened in January 2024**

| Month | Client Age | Current Score | Fair? |
|-------|------------|---------------|-------|
| **Mar 2024** | 2 months | 10/100 | ❌ NO - penalized for YOUR newness |
| **Jun 2024** | 5 months | 25/100 | ❌ NO - still penalized |
| **Sep 2024** | 8 months | 40/100 | ⚠️ MAYBE - but maxes at your business age |
| **Dec 2024** | 11 months | 55/100 | ⚠️ MAYBE - but you're only 11 months old! |

**The math doesn't work when YOUR BUSINESS is new!**

**Better approach:**
- Keep weight at **5%** (minimal)
- Use relative age (oldest client = 100%, newest = 0%)
- OR use age relative to YOUR business start date

**For business clients:**
- Keep at **10%** (stability still matters)
- But don't penalize them for YOUR newness

---

### **4. Loan Count = 10% (Both)**

**Why keep at 10% (not higher)?**

**In a NEW business:**
- Most clients have **1-2 loans** (maybe 3 max)
- Difference between 1 loan and 2 loans is NOT significant
- No one has 5+ completed cycles yet

**Current algorithm:**
```javascript
loanCountScore = min(100, loanCount × 10)

Examples:
- 1 loan → 10/100   ← Most of your individual clients
- 2 loans → 20/100  ← Some of your clients
- 3 loans → 30/100  ← Your "experienced" clients
- 10 loans → 100/100 ← Nobody has this yet!
```

**Problem:** The scale assumes clients can have 10+ loans, but yours have 1-3!

**Better algorithm for NEW business:**
```javascript
// Adjusted for limited loan history
if (loanCount === 0) score = 0;
else if (loanCount === 1) score = 50;  // First-timer (not penalized)
else if (loanCount === 2) score = 80;  // Repeat borrower (good sign)
else if (loanCount >= 3) score = 100; // Experienced (for your business)
```

**Recommendation:** Keep at 10% but **adjust algorithm** to your reality.

---

### **5. Current Behavior = 5% (Individual) / 10% (Business)**

**NEW parameter for businesses with limited history!**

**Why add this?**

**Traditional credit scoring** (FICO, etc.) relies on **years of data**:
- 5+ years of credit history
- Dozens of transactions
- Multiple credit lines

**Your reality:**
- 6-12 months of existence
- 1-3 loans per client
- Limited historical patterns

**Solution:** Weight **recent behavior** more heavily!

**What to track:**
```javascript
// Last 30 days activity
- Did they make a payment? (+30 points)
- Multiple payments? (+20 bonus)
- Paid on schedule? (+30 points)
- Communicated about delay? (+10 points)
- No contact for >30 days? (-50 points)
```

**Examples:**

**Client A:** 1 loan (2 months old), paid every week for 8 weeks straight
- Limited history BUT perfect recent behavior
- **Score:** High on Current Behavior (100/100)

**Client B:** 3 loans, good history, but no payment in 45 days
- Good history BUT concerning recent behavior  
- **Score:** Low on Current Behavior (20/100)

**For new businesses, Recent Behavior > Old History!**

---

## 📊 **FINAL RECOMMENDATIONS FOR NEW BUSINESS**

### **INDIVIDUAL CLIENTS:**

```
Credit Utilization:    40%  ← Current repayment capacity (TOP PRIORITY)
Payment History:       40%  ← Track record (important but limited data)
Loan Count:            10%  ← Experience level (1-3 loans typical)
Current Behavior:       5%  ← Recent payment activity (new parameter)
Account Age:            5%  ← Minimal weight (everyone is "new")
Savings Balance:        0%  ← NOT APPLICABLE
────────────────────────────
TOTAL:                100%
```

**Logic:** Emphasize **what they're doing NOW** over **how long they've existed**.

---

### **BUSINESS CLIENTS:**

```
Credit Utilization:    35%  ← Cash flow indicator (TOP PRIORITY)
Payment History:       35%  ← Track record (important but limited)
Current Behavior:      10%  ← Recent payment activity (critical for new biz)
Account Age:           10%  ← Some stability check (reduced from 20%)
Loan Count:            10%  ← Experience level
Savings Balance:        0%  ← NOT APPLICABLE
────────────────────────────
TOTAL:                100%
```

**Logic:** Balance **current performance** with **some stability signals**.

---

## 📈 **Score Impact Examples (NEW Business Model)**

### **Example 1: First-Time Borrower (Perfect)**
- **Profile:** 1 loan (active), 100% repayment so far, 2 months old, paid last week

**OLD Model:**
```
Payment History: 60% base + 5% repayments = 65/100 → 65% × 50% weight = 179 pts
Credit Util: 100/100 → 100% × 30% weight = 165 pts
Account Age: 2 months × 5 = 10/100 → 10% × 8% weight = 4.4 pts
Loan Count: 1 × 10 = 10/100 → 10% × 12% weight = 6.6 pts
Savings: 0% × 0% = 0 pts

TOTAL: 300 + 179 + 165 + 4.4 + 6.6 = 655
```

**NEW Model (NEW Business):**
```
Credit Util: 100/100 → 100% × 40% weight = 220 pts ✅
Payment History: 65/100 → 65% × 40% weight = 143 pts
Loan Count: 50/100 (adjusted) → 50% × 10% weight = 27.5 pts ✅
Current Behavior: 100/100 (paid last week) → 100% × 5% weight = 27.5 pts ✅
Account Age: 10/100 → 10% × 5% weight = 2.75 pts

TOTAL: 300 + 220 + 143 + 27.5 + 27.5 + 2.75 = 720.75 → ~721 ✅
```

**Result:** First-time perfect borrower goes from **655 → 721** (+66 points!)

---

### **Example 2: Repeat Borrower (Good History)**
- **Profile:** 3 loans (2 paid, 1 active), 95% repayment, 6 months old, paid 3 days ago

**OLD Model:** ~699  
**NEW Model:** ~755 ✅ **(+56 points)**

**Why?** Rewarded for **current performance** and **consistency**, not penalized for short account age.

---

### **Example 3: Concerning Client**
- **Profile:** 2 loans (1 paid, 1 in arrears), 40% repayment, 5 months old, no payment in 50 days

**OLD Model:** ~485  
**NEW Model:** ~425 ↓ **(-60 points - better detection!)**

**Why?** Current Behavior parameter flags the **50-day payment gap** as major red flag.

---

## 🎯 **Implementation Guide**

### **Step 1: Apply New Weights**

**Individual:**
- Credit Utilization: **40**
- Payment History: **40**
- Loan Count: **10**
- Current Behavior: **5** *(Note: Need to add this parameter)*
- Account Age: **5**
- Savings: **0** (disable)

**Business:**
- Credit Utilization: **35**
- Payment History: **35**
- Current Behavior: **10** *(Note: Need to add this parameter)*
- Account Age: **10**
- Loan Count: **10**
- Savings: **0** (disable)

---

### **Step 2: Add "Current Behavior" Parameter**

You'll need to add this as a **custom parameter** or **modify the algorithm** to include:

```javascript
// Pseudo-code for Current Behavior
const daysSinceLastPayment = /* calculate from last repayment */;
const paymentsLast30Days = /* count recent payments */;

let currentBehaviorScore = 100;

if (daysSinceLastPayment > 60) currentBehaviorScore = 0;
else if (daysSinceLastPayment > 45) currentBehaviorScore = 30;
else if (daysSinceLastPayment > 30) currentBehaviorScore = 60;
else if (daysSinceLastPayment > 14) currentBehaviorScore = 80;
else if (daysSinceLastPayment <= 7) currentBehaviorScore = 100;

// Bonus for frequent payments
if (paymentsLast30Days >= 3) currentBehaviorScore = Math.min(100, currentBehaviorScore + 15);
else if (paymentsLast30Days >= 2) currentBehaviorScore = Math.min(100, currentBehaviorScore + 10);
```

---

### **Step 3: Adjust Loan Count Algorithm**

For a **new business**, adjust the loan count scoring:

```javascript
// OLD (assumes 10+ loans possible)
loanCountScore = min(100, loanCount × 10);

// NEW (adjusted for 1-3 loan reality)
let loanCountScore;
if (loanCount === 0) loanCountScore = 0;
else if (loanCount === 1) loanCountScore = 50;   // First-timer
else if (loanCount === 2) loanCountScore = 80;   // Repeat customer
else if (loanCount >= 3) loanCountScore = 100;  // Experienced (for your portfolio)
```

---

## 📊 **Expected Portfolio Impact**

### **Score Distribution Changes:**

**BEFORE (Old Model):**
```
Excellent (761-850):  2 clients  (7%)  ← Too few!
Good (701-760):       8 clients  (30%)
Average (621-700):    12 clients (44%)
Poor (300-620):       5 clients  (19%)
```

**Why?** Everyone penalized for short account age + limited loan history.

---

**AFTER (NEW Business Model):**
```
Excellent (761-850):  6 clients  (22%) ✅ ← Perfect payers rewarded
Good (701-760):       11 clients (41%) ✅ ← Good payers move up
Average (621-700):    7 clients  (26%)
Poor (300-620):       3 clients  (11%) ✅ ← Risky clients more visible
```

**Why?** Emphasis on **current behavior** and **repayment capacity** reveals true performance.

---

## ✅ **Summary: NEW Business Credit Scoring**

### **Key Differences from Mature Business:**

| Factor | Mature Business (5+ yrs) | NEW Business (6-18 months) | Why Different? |
|--------|--------------------------|----------------------------|----------------|
| **Account Age** | 10-15% | **5-10%** | Everyone is "new" |
| **Payment History** | 45-50% | **35-40%** | Limited loan cycles |
| **Credit Utilization** | 25-30% | **35-40%** | Best current indicator |
| **Loan Count** | 10-15% | **10%** | Most have 1-3 loans only |
| **Current Behavior** | 0% | **5-10%** | Recent activity critical |
| **Savings** | 5-10% | **0%** | Not applicable |

---

### **Bottom Line:**

**For a NEW microfinance business:**

✅ **Emphasize CURRENT behavior** (repayment rate, recent payments)  
✅ **De-emphasize history** (account age, loan count)  
✅ **Don't penalize clients for YOUR newness**  
✅ **Track real-time signals** (days since last payment)  
✅ **Adjust as you mature** (shift weights as you gain data)  

**In 2-3 years**, when you have:
- 50+ clients with 5+ loan cycles each
- 3+ years of operational history
- Clear patterns of defaults and successes

**THEN** shift to the "Mature Business" model with:
- Payment History: 50%
- Credit Utilization: 30%
- Account Age: 10%
- Loan Count: 10%

**But for NOW (6-18 months old), use the NEW Business model!** 📊

---

## 🎯 **Quick Implementation**

**Apply these settings TODAY:**

**Individual Clients: 40 | 40 | 10 | 5 | 5**
- Credit Utilization: 40%
- Payment History: 40%  
- Loan Count: 10%
- Current Behavior: 5% *(if can add, else distribute to top 2)*
- Account Age: 5%

**Business Clients: 35 | 35 | 10 | 10 | 10**
- Credit Utilization: 35%
- Payment History: 35%
- Current Behavior: 10% *(if can add, else distribute to top 2)*
- Account Age: 10%
- Loan Count: 10%

**If you can't add "Current Behavior" yet:**
- Individual: 45% | 40% | 10% | 0% | 5% (Credit Util | Payment | Loan | Behavior | Age)
- Business: 40% | 40% | 10% | 0% | 10% (Credit Util | Payment | Loan | Behavior | Age)

**Your scores will become MUCH more fair for new clients!** ✅
