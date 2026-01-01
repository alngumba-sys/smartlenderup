# 🔧 Fix Payment Status Error - Quick Guide

## ❌ Error You're Seeing

```
⚠️ Failed to sync to Supabase: {
  "code": "PGRST204",
  "message": "Could not find the 'payment_status' column of 'organizations' in the schema cache"
}
```

---

## ✅ Solution: Add Missing Columns

The `organizations` table is missing the trial and payment management columns. Follow these steps:

---

## 📝 Step-by-Step Fix

### **Step 1: Open Supabase SQL Editor**

Click this link:
```
https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
```

---

### **Step 2: Run the Migration Script**

1. **Click "+ New query"** (top right)
2. **Copy ALL contents** from `/supabase-add-trial-payment-columns.sql`
3. **Paste** into SQL Editor
4. **Click "Run"** (or press Ctrl+Enter / Cmd+Enter)
5. **Wait** 5-10 seconds for execution

---

### **Step 3: Verify Columns Added**

At the bottom of the SQL Editor, you should see a results table showing:

```
column_name            | data_type                   | column_default  | is_nullable
-----------------------|-----------------------------|-----------------|-------------
last_payment_date      | timestamp with time zone    | NULL            | YES
payment_amount         | numeric                     | NULL            | YES
payment_status         | text                        | 'pending'       | YES
subscription_plan      | text                        | NULL            | YES
subscription_status    | text                        | 'trial'         | YES
trial_end_date         | timestamp with time zone    | NULL            | YES
trial_start_date       | timestamp with time zone    | NULL            | YES
```

✅ If you see these 7 columns, the migration was successful!

---

### **Step 4: Refresh Your App**

1. **Go back** to your SmartLenderUp app
2. **Hard refresh**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Test**: Try creating an organization or logging in

---

## ✅ What This Migration Does

### **Adds 7 New Columns to Organizations Table:**

1. **`trial_start_date`** (TIMESTAMPTZ)
   - When the 14-day trial started
   - Auto-set to `created_at` for existing orgs

2. **`trial_end_date`** (TIMESTAMPTZ)
   - When the trial expires (14 days from start)
   - Auto-calculated as `created_at + 14 days`

3. **`subscription_status`** (TEXT)
   - Values: `trial`, `active`, `expired`, `cancelled`
   - Default: `trial`

4. **`payment_status`** (TEXT) ✨ **THIS FIXES YOUR ERROR**
   - Values: `pending`, `paid`, `overdue`
   - Default: `pending`

5. **`subscription_plan`** (TEXT)
   - Values: `basic`, `professional`, `enterprise`
   - Default: NULL

6. **`last_payment_date`** (TIMESTAMPTZ)
   - Date of last successful payment
   - Default: NULL

7. **`payment_amount`** (NUMERIC)
   - Amount paid in last transaction
   - Default: NULL

---

## 🔍 What Happens to Existing Organizations

If you already have organizations in your database:

✅ **Automatically updated** with trial dates:
- `trial_start_date` = their `created_at` date
- `trial_end_date` = `created_at` + 14 days
- `subscription_status` = `trial`
- `payment_status` = `pending`

✅ **No data loss** - all existing data preserved

---

## 📊 Database Indexes Created

For better query performance, these indexes are created:

1. `idx_organizations_subscription_status` - Fast queries by subscription status
2. `idx_organizations_payment_status` - Fast queries by payment status
3. `idx_organizations_trial_end_date` - Fast queries for expiring trials

---

## 🎯 What Happens After Migration

### **Features That Now Work:**

✅ **14-Day Free Trial System**
- Automatic trial countdown
- Trial expiration tracking
- Days remaining calculation

✅ **Trial Banner Display**
- Shows on Manager page
- Compact design
- Real-time countdown

✅ **Payment Integration**
- Stripe payment processing
- Payment status tracking
- Subscription activation

✅ **Organization Registration**
- Auto-sets trial dates
- No more schema errors
- Smooth registration flow

---

## ⚠️ Troubleshooting

### **Issue: "relation does not exist" error**

**Solution:**
Make sure you're running the script in the correct project:
- Project: SmartLenderUp Test
- Project Ref: mqunjutuftoueoxuyznn
- URL: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql

### **Issue: "column already exists" error**

**Solution:**
This is fine! The script uses `ADD COLUMN IF NOT EXISTS`, so it won't fail if columns already exist. Just ignore this message.

### **Issue: Error still appears after migration**

**Solution:**
1. Hard refresh your app (Ctrl+Shift+R)
2. Clear browser cache
3. Try in incognito/private window
4. Check browser console for new errors

### **Issue: Verification table doesn't show columns**

**Solution:**
The columns were still added! Verify manually:
1. Go to Table Editor: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/editor
2. Click on `organizations` table
3. Scroll right to see new columns

---

## 🚀 After Migration Checklist

- [ ] SQL script ran without errors
- [ ] Verification table shows 7 columns
- [ ] App hard refreshed
- [ ] No payment_status errors in console
- [ ] Can register new organization
- [ ] Trial banner appears (if logged in as Manager)
- [ ] Payment page accessible

---

## 📝 Quick Summary

**Problem**: `payment_status` column missing from `organizations` table  
**Solution**: Run `/supabase-add-trial-payment-columns.sql` in SQL Editor  
**Time**: 2 minutes  
**Difficulty**: Easy  
**Risk**: None (existing data preserved)

---

## 🔗 Quick Links

| What | Link |
|------|------|
| **SQL Editor** | https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql |
| **Table Editor** | https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/editor |
| **Migration Script** | `/supabase-add-trial-payment-columns.sql` |

---

## ✅ Success Indicators

After running the migration, you should:

1. ✅ **No more "payment_status" errors** in console
2. ✅ **Trial banner displays** on Manager page
3. ✅ **Can register organizations** without errors
4. ✅ **Payment page loads** correctly
5. ✅ **Organizations table** has 7 new columns

---

**Last Updated**: December 29, 2024  
**Status**: Ready to run  
**Database**: SmartLenderUp Test (mqunjutuftoueoxuyznn)  
**Estimated Time**: 2 minutes
