# ⚡ QUICK FIX: Database Schema Error

## 🚨 Error Message
```
ERROR: 42703: column "user_id" does not exist
```

## ✅ Quick Solution (5 Minutes)

### 1️⃣ Open Supabase
→ [https://supabase.com/dashboard](https://supabase.com/dashboard)  
→ Click **SQL Editor**  
→ Click **New Query**

### 2️⃣ Copy the Setup File
📁 Open file: `/supabase/COMPLETE_DATABASE_SETUP.sql`  
⌨️ Select All: `Ctrl+A` (or `Cmd+A` on Mac)  
📋 Copy: `Ctrl+C` (or `Cmd+C` on Mac)

### 3️⃣ Run in Supabase
📝 Paste into SQL Editor  
▶️ Click **RUN** button (or press `Ctrl+Enter`)  
⏳ Wait for success message

### 4️⃣ Refresh
🔄 Refresh your browser: `F5` (or `Cmd+R` on Mac)

---

## 🎯 What This Does

Creates **34 database tables** including:
- ✅ Organizations & Staff
- ✅ Clients & Loans
- ✅ Repayments & Disbursements
- ✅ Bank Accounts (with `user_id` column)
- ✅ Shareholders & Transactions
- ✅ Accounting & Expenses
- ✅ And 20+ more tables...

---

## ⚠️ Safe to Run Multiple Times

The script uses `CREATE TABLE IF NOT EXISTS` so you can run it as many times as needed without breaking anything.

---

## 📖 Full Documentation

For detailed information, see: `/DATABASE_SETUP_GUIDE.md`
