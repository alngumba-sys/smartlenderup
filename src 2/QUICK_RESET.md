# ⚡ Quick Reset - Start Fresh in 2 Minutes

## 🎯 What This Does
Deletes ALL data from your SmartLenderUp Test database (organizations, clients, loans, expenses, everything) while keeping the table structure intact.

---

## 📝 2-Step Process

### **Step 1: Clear Supabase Database** (60 seconds)

1. Open: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
2. Click **"+ New query"**
3. Copy **ALL contents** from `/supabase-cleanup.sql`
4. Paste into SQL Editor
5. Click **"Run"** (or Ctrl+Enter)
6. Wait for verification table to appear
7. ✅ Confirm all counts = 0

---

### **Step 2: Clear Browser Data** (30 seconds)

1. Open your SmartLenderUp app
2. Press **F12** (open console)
3. Type: `localStorage.clear()`
4. Press **Enter**
5. Press **Ctrl+Shift+R** (hard refresh)
6. ✅ Done!

---

## ✅ You're Ready!

Your database is now completely clean. You can:
- Register new organizations
- Create fresh test data
- Start experiments from scratch

---

## 🔗 Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/sql
- **Table Editor**: https://supabase.com/dashboard/project/mqunjutuftoueoxuyznn/editor
- **Full Guide**: See `/FRESH_START_GUIDE.md` for detailed instructions

---

## ⚠️ Remember

- This deletes **ALL data** (cannot be undone)
- Table structure remains intact
- Perfect for testing and development
- Use before starting new test scenarios

---

**Total Time**: ~2 minutes  
**Difficulty**: Easy  
**Risk**: Low (test environment only)
