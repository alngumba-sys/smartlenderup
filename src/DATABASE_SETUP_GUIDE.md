# 🛠️ Database Setup Guide - Fix "user_id does not exist" Error

## ❌ The Problem

You're seeing this error:
```
Error: Failed to run sql query: ERROR: 42703: column "user_id" does not exist
```

This means your Supabase database **doesn't have the proper table structure yet**. The tables either:
- Don't exist at all
- Exist but are missing required columns
- Have the wrong column names or data types

## ✅ The Solution

Run the **ONE-TIME database setup script** that creates all 34 tables with the correct structure.

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Open Supabase SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Locate the Setup File

The file is located at:
```
/supabase/COMPLETE_DATABASE_SETUP.sql
```

Open this file in your code editor (VS Code, etc.)

### Step 3: Copy the Entire File

1. Select all content: `Ctrl+A` (Windows/Linux) or `Cmd+A` (Mac)
2. Copy: `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac)

### Step 4: Run in Supabase

1. Paste the SQL code into the Supabase SQL Editor
2. Click the **"RUN"** button (bottom right corner)
3. Or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
4. Wait for the success message: **"Success. No rows returned"**

### Step 5: Refresh Your Application

Press `F5` or `Cmd+R` to refresh the page. The error should be gone!

---

## 🎯 What Gets Created

The setup script creates **34 comprehensive tables**:

### Core System Tables
✅ **organizations** - Your company/institution data  
✅ **staff_users** - Staff members and their roles  
✅ **clients** - Individual and business clients  

### Loan Management Tables
✅ **loan_products** - Loan product definitions  
✅ **loans** - All loan records  
✅ **repayments** - Payment history  
✅ **guarantors** - Loan guarantors  
✅ **collaterals** - Loan collateral records  
✅ **loan_documents** - Document attachments  
✅ **disbursements** - Loan disbursement records  
✅ **approvals** - 5-phase approval workflow  

### Financial Tables
✅ **bank_accounts** - Organization bank accounts  
✅ **funding_transactions** - Deposits and withdrawals (includes `user_id` column)  
✅ **chart_of_accounts** - Accounting structure  
✅ **journal_entries** - Double-entry bookkeeping  
✅ **expenses** - Operating expenses  
✅ **payees** - Expense payees  
✅ **payroll_runs** - Staff payroll  

### Investment & Equity Tables
✅ **shareholders** - Company shareholders  
✅ **shareholder_transactions** - Dividend payments, etc.  

### Savings Tables
✅ **savings_accounts** - Client savings accounts  
✅ **savings_transactions** - Savings deposits/withdrawals  

### Organizational Tables
✅ **groups** - Client groups  
✅ **institutions** - External institutions  
✅ **branches** - Organization branches  
✅ **credit_scoring_parameters** - Credit scoring rules  

### Operations Tables
✅ **tasks** - Staff task management  
✅ **tickets** - Support tickets  
✅ **kyc_records** - KYC documents  
✅ **audit_logs** - System audit trail  
✅ **notifications** - User notifications  
✅ **payments** - Payment records  

### Configuration Tables
✅ **pricing_configuration** - Subscription pricing  
✅ **contact_messages** - Customer inquiries  

---

## 🔍 Specific Issue: user_id Column

The error you're seeing specifically affects the **funding_transactions** table, which needs a `user_id` column to track who created each transaction.

**In the setup script (line 381):**
```sql
CREATE TABLE IF NOT EXISTS public.funding_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,  👈 THIS COLUMN IS MISSING IN YOUR DATABASE
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  shareholder_id UUID REFERENCES public.shareholders(id),
  -- ... rest of columns
);
```

---

## ⚠️ Important Notes

### Safe to Run Multiple Times
The script uses `CREATE TABLE IF NOT EXISTS`, so it's **completely safe** to run multiple times. It won't:
- Delete existing data
- Duplicate tables
- Cause any errors

### One-Time Setup
You only need to run this **ONCE per Supabase project**. After it's run, your database will be fully configured.

### Automatic Schema
The script automatically:
- Creates all 34 tables
- Sets up proper relationships (foreign keys)
- Adds indexes for performance
- Configures default values
- Sets up proper constraints

---

## 🐛 Troubleshooting

### "Permission denied" Error
Make sure you're logged into Supabase with the correct account and have selected the right project.

### "Syntax error" Message
Make sure you copied the **entire file** from start to finish. The script is ~1000+ lines long.

### Still Getting Errors After Setup?
1. Clear your browser cache: `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Clear localStorage: Open browser console (F12) and run: `localStorage.clear()`
3. Refresh the page: `F5` or `Cmd+R`
4. If still issues, check the browser console (F12) for detailed error logs

---

## 📊 Database Structure Overview

```
organizations (root)
├── staff_users (employees)
├── clients (borrowers)
│   ├── loans
│   │   ├── repayments
│   │   ├── guarantors
│   │   ├── collaterals
│   │   ├── loan_documents
│   │   ├── disbursements
│   │   └── approvals
│   ├── savings_accounts
│   │   └── savings_transactions
│   └── kyc_records
├── loan_products (product catalog)
├── bank_accounts
│   └── funding_transactions
├── shareholders
│   └── shareholder_transactions
├── chart_of_accounts
│   └── journal_entries
├── expenses
├── payees
├── payroll_runs
├── groups
├── institutions
├── branches
├── tasks
├── tickets
├── notifications
├── audit_logs
└── more...
```

---

## 💡 Technical Details

### PostgreSQL Error Code 42703
This error code specifically means: **"undefined_column"**

Your application is trying to insert or query a column that doesn't exist in the database table.

### Why This Happened
The Supabase database is created empty by default. It needs to be initialized with your application's schema before it can store data.

### The Fix
Running the `COMPLETE_DATABASE_SETUP.sql` script creates the complete schema with all required columns, relationships, and constraints.

---

## 🎉 After Setup

Once the setup is complete, you'll be able to:

✅ Create and manage loans  
✅ Record payments  
✅ Manage clients  
✅ Track bank accounts  
✅ Record expenses  
✅ Manage shareholders  
✅ Run financial reports  
✅ Track staff and their permissions  
✅ Use the full approval workflow  
✅ Store all data securely in Supabase  

---

## 📞 Need Help?

If you're still experiencing issues after following this guide:

1. **Check Browser Console**: Press F12 and look at the Console tab for detailed error messages
2. **Check Supabase Logs**: Go to Supabase Dashboard → Logs to see database errors
3. **Verify Tables Created**: Go to Supabase Dashboard → Table Editor to confirm tables exist
4. **Check Column Structure**: Click on a table like `funding_transactions` and verify it has the `user_id` column

---

## 🔐 Security Note

All data is stored in **your own Supabase project**. The setup script:
- Creates tables in your database
- Does NOT send data anywhere else
- Does NOT modify existing data
- Is open-source and fully auditable

---

**File Location**: `/supabase/COMPLETE_DATABASE_SETUP.sql`  
**Last Updated**: March 9, 2026  
**Platform**: SmartLenderUp Microfinance System
