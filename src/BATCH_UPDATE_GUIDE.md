# 🔧 Batch Update Guide - Add Supabase Connection Checks

## Files to Update

Copy-paste these code snippets to quickly add connection checks to all critical operations.

---

## 1️⃣ **PayrollTab** - `/components/tabs/PayrollTab.tsx`

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Function:
Search for: `handleCreatePayroll` or `handleRunPayroll` or similar payroll submission function

### Add Check:
```typescript
const handleCreatePayroll = async (payrollData: any) => {
  // Check Supabase connection FIRST
  const isConnected = await ensureSupabaseConnection('create payroll');
  if (!isConnected) {
    return; // Block the operation if offline
  }

  // ... rest of the function
};
```

---

## 2️⃣ **BankAccountsTab** - `/components/tabs/BankAccountsTab.tsx`

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Functions:
- `handleAddAccount` - Adding new bank account
- `handleFundAccount` - Funding an account
- `handleAddTransaction` - Recording transactions

### Add Checks:
```typescript
const handleAddAccount = async (accountData: any) => {
  const isConnected = await ensureSupabaseConnection('add bank account');
  if (!isConnected) return;
  // ... rest
};

const handleFundAccount = async (fundingData: any) => {
  const isConnected = await ensureSupabaseConnection('fund account');
  if (!isConnected) return;
  // ... rest
};
```

---

## 3️⃣ **AccountingTab** - `/components/tabs/AccountingTab.tsx` (Shareholders & Expenses)

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Functions:
- `handleAddShareholder` - Adding shareholders
- `handleRecordExpense` - Recording expenses
- `handleCapitalDeposit` - Recording capital deposits

### Add Checks:
```typescript
const handleAddShareholder = async (shareholderData: any) => {
  const isConnected = await ensureSupabaseConnection('add shareholder');
  if (!isConnected) return;
  // ... rest
};

const handleRecordExpense = async (expenseData: any) => {
  const isConnected = await ensureSupabaseConnection('record expense');
  if (!isConnected) return;
  // ... rest
};

const handleCapitalDeposit = async (depositData: any) => {
  const isConnected = await ensureSupabaseConnection('record deposit');
  if (!isConnected) return;
  // ... rest
};
```

---

## 4️⃣ **SavingsTab** - `/components/tabs/SavingsTab.tsx`

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Functions:
- `handleRecordDeposit` - Recording savings deposits
- `handleRecordWithdrawal` - Recording withdrawals

### Add Checks:
```typescript
const handleRecordDeposit = async (depositData: any) => {
  const isConnected = await ensureSupabaseConnection('record deposit');
  if (!isConnected) return;
  // ... rest
};

const handleRecordWithdrawal = async (withdrawalData: any) => {
  const isConnected = await ensureSupabaseConnection('record withdrawal');
  if (!isConnected) return;
  // ... rest
};
```

---

## 5️⃣ **RepaymentModal** - `/components/modals/RepaymentModal.tsx`

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Function:
`handleSubmit` or `handleRecordRepayment`

### Add Check:
```typescript
const handleSubmit = async (repaymentData: any) => {
  const isConnected = await ensureSupabaseConnection('record repayment');
  if (!isConnected) return;
  // ... rest
};
```

---

## 6️⃣ **ApprovalWorkflowModal** - Search for approval handlers

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Functions:
- `handleApprove` - Approving loans
- `handleReject` - Rejecting loans

### Add Checks:
```typescript
const handleApprove = async (loanId: string) => {
  const isConnected = await ensureSupabaseConnection('approve loan');
  if (!isConnected) return;
  // ... rest
};

const handleReject = async (loanId: string, reason: string) => {
  const isConnected = await ensureSupabaseConnection('reject loan');
  if (!isConnected) return;
  // ... rest
};
```

---

## 7️⃣ **PayeesTab** - `/components/tabs/PayeesTab.tsx`

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Function:
`handleAddPayee`

### Add Check:
```typescript
const handleAddPayee = async (payeeData: any) => {
  const isConnected = await ensureSupabaseConnection('add payee');
  if (!isConnected) return;
  // ... rest
};
```

---

## 8️⃣ **ExpensesTab** - `/components/tabs/ExpensesTab.tsx`

### Add Import:
```typescript
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';
```

### Find Function:
`handleAddExpense` or `handleRecordExpense`

### Add Check:
```typescript
const handleAddExpense = async (expenseData: any) => {
  const isConnected = await ensureSupabaseConnection('record expense');
  if (!isConnected) return;
  // ... rest
};
```

---

## 🔍 **Quick Search Commands:**

### Find all submit handlers:
```bash
# In VS Code, search across all files:
handleSubmit|handleAdd|handleCreate|handleRecord|onSave
```

### Find specific operations:
```bash
# Payroll
grep -r "payroll" components/tabs/PayrollTab.tsx

# Shareholders
grep -r "shareholder" components/tabs/AccountingTab.tsx

# Expenses
grep -r "expense" components/tabs/

# Bank Accounts
grep -r "account" components/tabs/BankAccountsTab.tsx
```

---

## ✅ **Testing Checklist:**

After updating each component:

1. **Disconnect internet**
2. **Try the operation** (e.g., add client, create loan)
3. **Verify error appears:**
   - ❌ "Database not reachable. Check your internet"
   - "Cannot [operation] without database connection"
4. **Reconnect internet**
5. **Try again** - should work normally

---

## 📝 **Pattern to Follow:**

```typescript
// 1. Import at top of file
import { ensureSupabaseConnection } from '../../utils/supabaseConnectionCheck';

// 2. Add to start of async handler
const handleOperation = async (data: any) => {
  // Check Supabase connection FIRST
  const isConnected = await ensureSupabaseConnection('operation name');
  if (!isConnected) {
    return; // Block the operation if offline
  }

  // Original code continues...
  await saveData(data);
  toast.success('Operation successful!');
};
```

---

## 🎯 **Operation Names Reference:**

Use these exact operation names for consistency:

| Operation | Name to Use |
|-----------|-------------|
| Add client | `'add client'` |
| Create loan | `'create loan application'` |
| Create product | `'create loan product'` |
| Approve loan | `'approve loan'` |
| Reject loan | `'reject loan'` |
| Record repayment | `'record repayment'` |
| Create payroll | `'create payroll'` |
| Add payee | `'add payee'` |
| Record expense | `'record expense'` |
| Fund account | `'fund account'` |
| Add account | `'add bank account'` |
| Add shareholder | `'add shareholder'` |
| Record deposit | `'record deposit'` |
| Record withdrawal | `'record withdrawal'` |

---

## 🚀 **Quick Implementation Steps:**

1. Open component file
2. Add import statement
3. Find the async submit handler
4. Add connection check at the start
5. Add early return if offline
6. Save file
7. Test with internet off
8. Repeat for next component

---

**Complete all updates to ensure ALL critical operations require Supabase connection!** 🔒
