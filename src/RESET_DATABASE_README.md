# 🔄 Reset Database - README

## ⚡ Quick Start (2 Minutes)

Want to delete ALL data and start fresh? Follow these steps:

---

## Step 1: Run SQL in Supabase

1. **Open**: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
2. **Copy**: ALL contents from `/supabase-cleanup.sql`
3. **Paste**: Into SQL Editor
4. **Run**: Click "Run" button (or Ctrl+Enter)
5. **Verify**: All counts show 0 in results table

---

## Step 2: Clear Browser

1. **Open**: Your SmartLenderUp app
2. **Press**: `F12` (opens console)
3. **Type**: `localStorage.clear()`
4. **Press**: Enter
5. **Refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## ✅ Done!

Your database is now completely empty and ready for fresh data.

---

## 📚 Need More Help?

Choose the guide that fits your needs:

| Guide | Best For | Time |
|-------|----------|------|
| `/START_FRESH_NOW.md` | Visual step-by-step (RECOMMENDED) | 3 min |
| `/QUICK_RESET.md` | Just the essentials | 1 min |
| `/FRESH_START_GUIDE.md` | Detailed instructions + troubleshooting | 10 min |
| `/DATABASE_RESET_INDEX.md` | Find the right documentation | 2 min |

---

## 🎯 What Gets Deleted

**Everything:**
- All organizations
- All users
- All clients
- All loans
- All payments
- All expenses
- All financial data
- All audit logs
- **EVERYTHING!**

**What Stays:**
- Table structure
- Database schema
- Configuration
- RLS policies

---

## 🔗 Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
- **Table Editor**: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/editor
- **SQL Script**: `/supabase-cleanup.sql`

---

## ⚠️ Warning

**This permanently deletes all data!**
- Cannot be undone
- Use only in test environment
- Perfect for SmartLenderUp Test project

---

## 🆘 Having Issues?

Read the troubleshooting section in `/FRESH_START_GUIDE.md`

---

**Project**: SmartLenderUp Test  
**Reference**: mqunjutuftoueoxuyznn  
**Time**: ~2 minutes  
**Difficulty**: Easy
