# 📖 Database Setup - Complete Guide

## 🚨 Are You Seeing This Error?

```
ERROR: 42703: column "user_id" does not exist
```

or

```
Could not find column "..."
```

or

```
Table "..." does not exist
```

**→ You need to set up your Supabase database schema!**

---

## 🎯 Choose Your Guide

### 🚀 [START_HERE_DATABASE_FIX.md](./START_HERE_DATABASE_FIX.md)
**Quick 5-minute fix** with step-by-step instructions and screenshots.  
👉 **Start here if you want to fix the issue right now.**

### ⚡ [QUICK_FIX_DATABASE_SCHEMA.md](./QUICK_FIX_DATABASE_SCHEMA.md)
**Super concise reference card** - just the essential steps.  
👉 Use this if you've done it before and need a quick reminder.

### 📚 [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)
**Comprehensive documentation** with troubleshooting, technical details, and FAQs.  
👉 Use this if you want to understand exactly what's happening.

### 🛠️ [/supabase/COMPLETE_DATABASE_SETUP.sql](./supabase/COMPLETE_DATABASE_SETUP.sql)
**The actual SQL file** you need to run in Supabase.  
👉 This is the file you'll copy and paste into Supabase SQL Editor.

---

## 📋 Quick Summary

### The Problem
Your Supabase database doesn't have the required table structure yet. The application expects 34 tables with specific columns, but your database is empty or incomplete.

### The Solution
Run the `COMPLETE_DATABASE_SETUP.sql` file in your Supabase SQL Editor to create all required tables and columns.

### Time Required
⏱️ **5 minutes** (including time to find your Supabase dashboard)

### Skill Level Required
👤 **Beginner-friendly** - just copy and paste SQL code

---

## 🎯 What Gets Fixed

Running the setup script will create:

✅ **34 database tables**  
✅ **300+ columns** with correct data types  
✅ **Foreign key relationships** between tables  
✅ **Indexes** for performance  
✅ **Default values** where appropriate  
✅ **Check constraints** for data validation  

### Tables Created:

| # | Table Name | Purpose |
|---|------------|---------|
| 1 | organizations | Company/institution details |
| 2 | staff_users | Staff members and roles |
| 3 | clients | Individual and business clients |
| 4 | loan_products | Loan product definitions |
| 5 | loans | All loan records |
| 6 | repayments | Payment history |
| 7 | shareholders | Company shareholders |
| 8 | shareholder_transactions | Shareholder investments/dividends |
| 9 | bank_accounts | Organization bank accounts |
| 10 | funding_transactions | Deposits and withdrawals **(includes user_id)** |
| 11 | chart_of_accounts | Accounting structure |
| 12 | expenses | Operating expenses |
| 13 | payees | Expense payees |
| 14 | payroll_runs | Staff payroll |
| 15 | journal_entries | Double-entry bookkeeping |
| 16 | kyc_records | KYC documents |
| 17 | tasks | Staff task management |
| 18 | tickets | Support tickets |
| 19 | audit_logs | System audit trail |
| 20 | groups | Client groups |
| 21 | guarantors | Loan guarantors |
| 22 | collaterals | Loan collateral |
| 23 | loan_documents | Document attachments |
| 24 | disbursements | Loan disbursements |
| 25 | approvals | Approval workflow |
| 26 | savings_accounts | Client savings |
| 27 | savings_transactions | Savings history |
| 28 | credit_scoring_parameters | Credit scoring rules |
| 29 | institutions | External institutions |
| 30 | branches | Organization branches |
| 31 | payments | Payment records |
| 32 | notifications | User notifications |
| 33 | pricing_configuration | Subscription pricing |
| 34 | contact_messages | Customer inquiries |

---

## ⚡ Quick Fix Steps

### 1. Open Supabase
→ https://supabase.com/dashboard  
→ Select your project  
→ Click "SQL Editor"  
→ Click "New Query"

### 2. Copy Setup File
→ Open `/supabase/COMPLETE_DATABASE_SETUP.sql` in your code editor  
→ Select All (Ctrl+A / Cmd+A)  
→ Copy (Ctrl+C / Cmd+C)

### 3. Run in Supabase
→ Paste into SQL Editor  
→ Click "RUN" (or press Ctrl+Enter / Cmd+Enter)  
→ Wait for "Success. No rows returned"

### 4. Refresh Your App
→ Go back to your application  
→ Press F5 (or Cmd+R)  
→ ✅ Done!

---

## 🛡️ Safety Notes

### Is This Safe? YES! ✅

The setup script:
- ✅ Uses `CREATE TABLE IF NOT EXISTS` - won't overwrite existing tables
- ✅ Only **creates** structure, doesn't **modify** or **delete** data
- ✅ Can be run multiple times safely
- ✅ Only affects your own Supabase project
- ✅ Doesn't send data anywhere else
- ✅ Is fully open-source and auditable

### Will I Lose Data? NO! ❌

The script:
- ❌ Does NOT drop tables
- ❌ Does NOT delete data
- ❌ Does NOT modify existing columns
- ✅ Only adds what's missing

---

## 🐛 Common Issues & Solutions

### Issue 1: "Permission denied"
**Solution:** Make sure you're logged into Supabase with the correct account and have selected the right project.

### Issue 2: "Syntax error near..."
**Solution:** Make sure you copied the **ENTIRE file** from start to finish. The script is ~1000 lines long.

### Issue 3: Still getting errors after setup
**Solution:**
1. Clear browser cache: Ctrl+Shift+Delete
2. Clear localStorage: Open console (F12) and run `localStorage.clear()`
3. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)

### Issue 4: Want to verify tables were created
**Solution:**
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. You should see all 34 tables listed
4. Click on "funding_transactions" and verify it has a "user_id" column

---

## 📞 Need More Help?

### Documentation Files:
- 📄 **START_HERE_DATABASE_FIX.md** - Beginner-friendly guide
- 📄 **QUICK_FIX_DATABASE_SCHEMA.md** - Quick reference
- 📄 **DATABASE_SETUP_GUIDE.md** - Comprehensive guide

### Debugging:
- Open browser console: Press **F12**
- Look for error messages with helpful details
- Check the **Console** and **Network** tabs

### Supabase Resources:
- **Supabase Logs**: Dashboard → Logs
- **Table Editor**: Dashboard → Table Editor
- **SQL Editor**: Dashboard → SQL Editor

---

## ✅ Success Checklist

After running the setup script, you should be able to:

- [x] Create new clients
- [x] Create loan products
- [x] Create and manage loans
- [x] Record repayments
- [x] Manage bank accounts
- [x] Add shareholders
- [x] Record expenses
- [x] Generate reports
- [x] Use all platform features

---

## 🎓 Understanding the Error

### Error Code: 42703
PostgreSQL error code **42703** means: **"undefined_column"**

This means your application tried to use a column that doesn't exist in the database table.

### Why It Happens
1. Your application code expects certain columns to exist
2. Supabase projects start with an empty database
3. The schema needs to be created before the app can work
4. The `COMPLETE_DATABASE_SETUP.sql` file creates that schema

### The Fix
Running the setup SQL file creates all the tables and columns your application needs.

---

## 🚀 After Setup

Once your database is set up:

### Features Available:
✅ Full loan management  
✅ Client management  
✅ Payment tracking  
✅ Financial reporting  
✅ Shareholder management  
✅ Expense tracking  
✅ Staff management  
✅ Approval workflows  
✅ Credit scoring  
✅ And much more...

### Performance:
✅ Fast queries (thanks to indexes)  
✅ Data integrity (thanks to constraints)  
✅ Proper relationships (thanks to foreign keys)  
✅ Scalable structure (supports growth)

---

## 📊 Database Architecture

```
SmartLenderUp Database (34 Tables)
│
├── Core System (3 tables)
│   ├── organizations
│   ├── staff_users
│   └── clients
│
├── Loan Management (9 tables)
│   ├── loan_products
│   ├── loans
│   ├── repayments
│   ├── guarantors
│   ├── collaterals
│   ├── loan_documents
│   ├── disbursements
│   └── approvals
│
├── Financial Management (5 tables)
│   ├── bank_accounts
│   ├── funding_transactions ⭐ (has user_id column)
│   ├── chart_of_accounts
│   ├── journal_entries
│   └── expenses
│
├── Shareholders (2 tables)
│   ├── shareholders
│   └── shareholder_transactions
│
├── Savings (2 tables)
│   ├── savings_accounts
│   └── savings_transactions
│
└── Operations (13 tables)
    ├── payees
    ├── payroll_runs
    ├── kyc_records
    ├── tasks
    ├── tickets
    ├── audit_logs
    ├── groups
    ├── institutions
    ├── branches
    ├── payments
    ├── notifications
    ├── pricing_configuration
    └── contact_messages
```

---

## 📝 Version Information

- **Platform:** SmartLenderUp Microfinance System
- **Database:** PostgreSQL (via Supabase)
- **Schema Version:** 1.0
- **Last Updated:** March 9, 2026
- **Compatibility:** All SmartLenderUp versions

---

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Ready to fix your database?**

👉 **[Go to START_HERE_DATABASE_FIX.md](./START_HERE_DATABASE_FIX.md)** for step-by-step instructions!

---

*This guide is part of the SmartLenderUp platform documentation.*
