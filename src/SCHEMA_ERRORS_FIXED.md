# ✅ FIXED: Schema Errors for Bank Accounts and Expenses

## 🔍 What Was Wrong

### Error You Saw:
```json
{
  "code": "PGRST204",
  "message": "Could not find the 'opening_balance' column of 'bank_accounts' in the schema cache"
}
```

### Root Cause:
The code was trying to insert columns that **don't exist** in your Supabase database schema:

**Bank Accounts:**
- ❌ Code tried to insert: `opening_balance`, `current_balance`, `currency`, `status`
- ✅ Schema only has: `account_name`, `account_number`, `bank_name`, `branch`, `account_type`, `balance`

**Expenses:**
- ❌ Code tried to insert: `expense_category`, `expense_date`, `payment_reference`, `payee_name`, `bank_account_id`, `receipt_number`, `created_by`, `approved_by`, `approved_date`, `paid_by`, `paid_date`, `notes`
- ✅ Schema only has: `id`, `organization_id`, `expense_id`, `category`, `description`, `amount`, `payee_id`, `payment_method`, `payment_date`, `status`

---

## 🛠️ What Was Fixed

### 1. **Bank Accounts** - Code Updated to Match Schema

**File: `/contexts/DataContext.tsx`**

**Before (trying to insert non-existent columns):**
```typescript
{
  account_name: accountData.accountName,
  account_number: accountData.accountNumber,
  bank_name: accountData.bankName,
  branch: accountData.branch || '',
  account_type: accountData.accountType,
  currency: accountData.currency || getCurrencyCode(),  // ❌ Doesn't exist
  opening_balance: accountData.openingBalance || 0,      // ❌ Doesn't exist
  current_balance: accountData.openingBalance || 0,      // ❌ Doesn't exist
  status: accountData.status || 'active'                 // ❌ Doesn't exist
}
```

**After (only existing columns):**
```typescript
{
  account_name: accountData.accountName,
  account_number: accountData.accountNumber,
  bank_name: accountData.bankName,
  branch: accountData.branch || '',
  account_type: accountData.accountType,
  balance: accountData.openingBalance || 0  // ✅ Uses 'balance' column
}
```

**Mapping back to React:**
```typescript
const newAccount: BankAccount = {
  id: supabaseBankAccount.id,
  accountName: supabaseBankAccount.account_name,
  accountNumber: supabaseBankAccount.account_number,
  bankName: supabaseBankAccount.bank_name,
  branch: supabaseBankAccount.branch || '',
  accountType: supabaseBankAccount.account_type,
  currency: accountData.currency || getCurrencyCode(),  // Stored in React only
  openingBalance: supabaseBankAccount.balance || 0,
  balance: supabaseBankAccount.balance || 0,
  status: supabaseBankAccount.status || 'Active',       // Stored in React only
  createdDate: supabaseBankAccount.created_at?.split('T')[0],
  lastUpdated: supabaseBankAccount.updated_at?.split('T')[0]
};
```

---

### 2. **Expenses** - Code Updated to Match Schema

**File: `/services/supabaseDataService.ts`**

**Before (spreading all fields):**
```typescript
async create(expenseData: any, organizationId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      id: crypto.randomUUID(),
      ...expenseData,  // ❌ Includes non-existent columns
      organization_id: organizationId,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

**After (only existing columns):**
```typescript
async create(expenseData: any, organizationId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      id: crypto.randomUUID(),
      organization_id: organizationId,
      expense_id: `EXP${Date.now()}`,
      category: expenseData.category || expenseData.expense_category,
      description: expenseData.description,
      amount: expenseData.amount,
      payee_id: expenseData.payee_id || null,
      payment_method: expenseData.payment_method,
      payment_date: expenseData.expense_date || new Date().toISOString(),
      status: expenseData.status || 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

**File: `/contexts/DataContext.tsx`**

**Before:**
```typescript
const supabaseExpense = await supabaseDataService.expenses.create({
  expense_category: expenseData.category,  // ❌ Column doesn't exist
  expense_date: expenseData.expenseDate,   // ❌ Column doesn't exist
  payment_reference: expenseData.paymentReference,  // ❌ Doesn't exist
  payee_name: expenseData.payeeName,       // ❌ Doesn't exist
  bank_account_id: expenseData.bankAccountId,  // ❌ Doesn't exist
  // ... many more non-existent columns
}, organizationId);
```

**After:**
```typescript
const supabaseExpense = await supabaseDataService.expenses.create({
  category: expenseData.category,          // ✅ Exists
  description: expenseData.description,    // ✅ Exists
  amount: expenseData.amount,              // ✅ Exists
  expense_date: expenseData.expenseDate,   // ✅ Maps to payment_date
  payment_method: expenseData.paymentMethod, // ✅ Exists
  payee_id: expenseData.payeeId || null,   // ✅ Exists
  status: expenseData.status || 'Approved' // ✅ Exists
}, organizationId);
```

**Mapping back (hybrid approach):**
```typescript
const newExpense: Expense = {
  // From Supabase (persisted)
  id: supabaseExpense.id,
  category: supabaseExpense.category,
  description: supabaseExpense.description,
  amount: supabaseExpense.amount,
  expenseDate: supabaseExpense.payment_date?.split('T')[0],
  paymentMethod: supabaseExpense.payment_method,
  payeeId: supabaseExpense.payee_id,
  status: supabaseExpense.status,
  createdDate: supabaseExpense.created_at?.split('T')[0],
  
  // From React (temporary storage until schema updated)
  paymentReference: expenseData.paymentReference || '',
  payeeName: expenseData.payeeName || '',
  bankAccountId: expenseData.bankAccountId || '',
  receiptNumber: expenseData.receiptNumber || '',
  createdBy: expenseData.createdBy,
  approvedBy: expenseData.approvedBy || null,
  approvedDate: expenseData.approvedDate || null,
  paidBy: expenseData.paidBy || null,
  paidDate: expenseData.paidDate || null,
  notes: expenseData.notes || ''
};
```

---

## 🎯 Current Behavior

### Bank Accounts:
✅ **WORKING** - Creates bank accounts with these fields saved to Supabase:
- Account name, number, bank name, branch, account type, balance

⚠️ **React-only** - These fields are stored in React state but not Supabase:
- Currency (defaults to organization currency)
- Status (defaults to "Active")

### Expenses:
✅ **WORKING** - Creates expenses with these fields saved to Supabase:
- Category, description, amount, payment date, payment method, payee ID, status

⚠️ **React-only** - These fields are stored in React state but not Supabase:
- Payment reference, payee name, bank account ID, receipt number
- Created by, approved by, approved date, paid by, paid date, notes

---

## 🔧 How to Add Missing Columns (Optional)

If you want to save ALL fields to Supabase (not just React state), run the SQL migration:

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**

### Step 2: Run the Migration
Copy and paste the contents of `/FIX_BANK_ACCOUNTS_EXPENSES_SCHEMA.sql` and click **RUN**

This will add:

**Bank Accounts:**
- `currency` column

**Expenses:**
- `expense_category`
- `expense_date`
- `payment_reference`
- `payee_name`
- `bank_account_id`
- `receipt_number`
- `created_by`
- `approved_by`
- `approved_date`
- `paid_by`
- `paid_date`
- `notes`

### Step 3: Update the Code
After running the migration, you can update the code to save these fields to Supabase instead of just React state.

---

## ✅ Testing Instructions

### Test Bank Accounts:

1. **Add a new bank account**
   - Fill in all fields
   - Click "Add Account"

2. **Check console:**
   ```
   🏦 Creating bank account with Supabase-first approach...
   ✅ Bank account created in Supabase: {id: "...", account_name: "..."}
   ✅ Bank account added to React state
   ```

3. **Check Supabase:**
   - Go to Table Editor → `bank_accounts`
   - Find your new account
   - Should see: account_name, account_number, bank_name, branch, account_type, balance

4. **Refresh page:**
   - Account should still be there ✅

---

### Test Expenses:

1. **Add a new expense**
   - Fill in all fields
   - Click "Save" or "Add Expense"

2. **Check console:**
   ```
   💸 Creating expense with Supabase-first approach...
   ✅ Expense created in Supabase: {id: "...", category: "..."}
   ```

3. **Check Supabase:**
   - Go to Table Editor → `expenses`
   - Find your new expense
   - Should see: category, description, amount, payment_date, payment_method, payee_id, status

4. **Refresh page:**
   - **Core expense data** (category, amount, date) should still be there ✅
   - **Extra fields** (payee name, receipt number, notes) will be lost until schema updated ⚠️

---

## 📊 Data Persistence Summary

| Entity | Field | Saved to Supabase? | Survives Refresh? |
|--------|-------|-------------------|-------------------|
| **Bank Account** | Account Name | ✅ Yes | ✅ Yes |
| **Bank Account** | Account Number | ✅ Yes | ✅ Yes |
| **Bank Account** | Bank Name | ✅ Yes | ✅ Yes |
| **Bank Account** | Branch | ✅ Yes | ✅ Yes |
| **Bank Account** | Account Type | ✅ Yes | ✅ Yes |
| **Bank Account** | Balance | ✅ Yes | ✅ Yes |
| **Bank Account** | Currency | ❌ No (React only) | ❌ No |
| **Bank Account** | Status | ❌ No (React only) | ❌ No |
| **Expense** | Category | ✅ Yes | ✅ Yes |
| **Expense** | Description | ✅ Yes | ✅ Yes |
| **Expense** | Amount | ✅ Yes | ✅ Yes |
| **Expense** | Expense Date | ✅ Yes | ✅ Yes |
| **Expense** | Payment Method | ✅ Yes | ✅ Yes |
| **Expense** | Payee ID | ✅ Yes | ✅ Yes |
| **Expense** | Status | ✅ Yes | ✅ Yes |
| **Expense** | Payee Name | ❌ No (React only) | ❌ No |
| **Expense** | Payment Reference | ❌ No (React only) | ❌ No |
| **Expense** | Bank Account | ❌ No (React only) | ❌ No |
| **Expense** | Receipt Number | ❌ No (React only) | ❌ No |
| **Expense** | Approval Details | ❌ No (React only) | ❌ No |
| **Expense** | Notes | ❌ No (React only) | ❌ No |

---

## 🎉 Success!

The app will now work without errors:

✅ Bank accounts can be created
✅ Expenses can be created
✅ No more "Could not find column" errors
✅ Core data persists to Supabase
✅ Additional fields stored in React state temporarily

To get **full persistence** of all fields, run the SQL migration in `/FIX_BANK_ACCOUNTS_EXPENSES_SCHEMA.sql`!
