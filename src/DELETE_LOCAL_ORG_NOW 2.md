# 🗑️ Delete Local Organization - Quick Guide

## ⚡ Remove Organization from localStorage (1 Minute)

Your organization was saved locally. Let's remove it so the app uses Supabase only.

---

## 🎯 Quick Steps

### **Step 1: Open Browser Console**
Press `F12` (or right-click → Inspect → Console)

### **Step 2: Paste This Command**

```javascript
localStorage.removeItem('bv_funguo_db');
localStorage.removeItem('current_organization');
console.log('✅ Deleted local organization data!');
location.reload();
```

### **Step 3: Press Enter**

The page will refresh automatically.

---

## ✅ Done!

Your localStorage is now clean. Organizations will only be stored in Supabase.

---

## 📝 What Happens Next

1. **Register a new organization** → Saves directly to Supabase
2. **Login** → Fetches from Supabase only
3. **No local storage** → All data in database

---

## 🔍 Verify It Worked

After refresh, open console (F12) and type:

```javascript
console.log(localStorage.getItem('bv_funguo_db'));
// Should show: null
```

If it shows `null`, you're good! ✅

---

## 🆘 Need More Help?

Read the full guide: `/ORGANIZATIONS_DATABASE_ONLY.md`

---

**Time**: 1 minute  
**Difficulty**: Easy  
**Safe**: Yes (only removes local data, Supabase data is preserved)
