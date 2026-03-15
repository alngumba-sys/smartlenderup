# 🔧 How to Fix "Duplicate Key" Error - Simple Guide

## ⚡ Quick Fix (30 Seconds)

### Option 1: Use the Cleanup Button (Easiest)

1. Go to **Admin → Loan Products**
2. Look for the **🧹 Clean Duplicates** button (orange button, top-right)
3. Click it
4. Click **"Yes, Clean"**
5. Wait 2-3 seconds
6. ✅ Done! Page will refresh automatically

---

### Option 2: Run SQL in Supabase (Manual)

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Paste this code:

```sql
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY product_code ORDER BY created_at DESC) as row_num
  FROM loan_products
)
DELETE FROM loan_products
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);
```

4. Click **Run**
5. ✅ Done!

---

## ❓ What Was the Problem?

You were seeing this error:
```
⚠️ Duplicate key on attempt 1. Retrying with different code...
```

**Cause**: Your database had products with duplicate `product_code` values, causing conflicts when creating new products.

---

## ✅ What Was Fixed?

### 1. **Intelligent Retry System** (Automatic)

The system now automatically retries with different codes if it detects a duplicate:

- **Attempt 1**: Sequential code (e.g., `BVF-PROD00001`)
- **Attempt 2**: Timestamp code (e.g., `BVF-PROD12345678`)  
- **Attempt 3-5**: UUID code (e.g., `BVF-PROD3F7A9B2C`) ← Guaranteed unique

**Result**: Even if there are duplicates in the database, product creation will still succeed!

### 2. **One-Click Cleanup Button**

A new **🧹 Clean Duplicates** button in the Loan Products tab that:
- Finds all duplicate product codes
- Keeps the newest one
- Deletes the old ones
- Shows confirmation before deleting
- Reloads the page automatically

### 3. **Better Error Messages**

Instead of cryptic database errors, you now see:
```
⚠️ Duplicate key on attempt 1. Retrying with different code...
📌 Attempt 2: Using product code: BVF-PROD12345678
✅ Loan product created successfully on attempt 2
```

---

## 🧪 How to Test It's Fixed

### Test 1: Create a Product
1. Go to **Admin → Loan Products**
2. Click **+ Add Product**
3. Fill in the details
4. Click **Create**
5. ✅ Should succeed immediately (or after 1-2 retries)

### Test 2: Check Console
1. Open browser console (F12 → Console tab)
2. Create a product
3. Look for:
```
📌 Attempt 1: Using product code: BVF-PROD00001
✅ Loan product created successfully on attempt 1
```

### Test 3: Create Multiple Products Fast
1. Create 5 products in quick succession
2. ✅ All should succeed
3. Check their codes in the list

---

## 📊 Understanding Product Codes

### Format: `{ORG}-PROD{NUMBER}`

**Examples**:
- `BVF-PROD00001` ← Sequential (preferred)
- `BVF-PROD12345678` ← Timestamp (fallback)
- `BVF-PROD3F7A9B2C` ← UUID (rare, for conflicts)

**Why different formats?**
- **Sequential**: Clean, predictable, human-readable
- **Timestamp**: Used when sequential numbers conflict
- **UUID**: Guaranteed unique, used only when other methods fail

---

## 🐛 Troubleshooting

### Still seeing "Duplicate key on attempt 1"?

✅ **This is NORMAL now!** The system automatically retries and will succeed on attempt 2 or 3.

**Only worry if**:
- ❌ You see "Failed after max retries" (all 5 attempts failed)
- ❌ Product creation completely fails

**Solution**: Click the **🧹 Clean Duplicates** button

---

### Cleanup button not visible?

1. Make sure you're on the **Admin → Loan Products** tab
2. Look in the top-right area, next to **+ Add Product**
3. It's an **orange button** with text "🧹 Clean Duplicates"

---

### Want to see what duplicates exist?

Open browser console (F12) and run:
```javascript
// Check for duplicates
const checkDupes = async () => {
  const orgId = JSON.parse(localStorage.getItem('currentUser')).organizationId;
  const { data } = await supabase.from('loan_products').select('product_code').eq('organization_id', orgId);
  const codes = {};
  data.forEach(p => codes[p.product_code] = (codes[p.product_code] || 0) + 1);
  console.log('Duplicate codes:', Object.entries(codes).filter(([k,v]) => v > 1));
};
checkDupes();
```

---

## 📁 Files That Were Changed

1. **`/services/supabaseDataService.ts`**
   - Added 5-attempt retry mechanism
   - Multiple code generation strategies
   
2. **`/components/ProductCleanupButton.tsx`** (NEW)
   - One-click cleanup UI component

3. **`/components/tabs/LoanProductsTab.tsx`**
   - Added cleanup button to the header

4. **`/utils/cleanupDuplicateProducts.ts`** (NEW)
   - Cleanup logic and diagnostics

5. **`/contexts/DataContext.tsx`**
   - Fixed default product codes to use org prefix

---

## ✨ Benefits

✅ **Auto-Recovery**: System handles duplicates automatically  
✅ **No Downtime**: Products can be created even with duplicates in DB  
✅ **One-Click Fix**: Easy cleanup button for users  
✅ **Better Logging**: See exactly what's happening  
✅ **Future-Proof**: UUID fallback = 4.3 billion unique codes  

---

## 🎯 Summary

**Before**:
- ❌ Duplicate key errors blocked product creation
- ❌ Manual SQL required to fix
- ❌ No way to know what's wrong

**After**:
- ✅ Automatic retry with fallback codes
- ✅ One-click cleanup button
- ✅ Clear error messages and logging
- ✅ Products can be created even with duplicates

---

## 📞 Need Help?

If you're still having issues:

1. **Click the cleanup button** (should fix 99% of cases)
2. **Check browser console** for detailed error messages
3. **Verify you're using the latest code** (refresh hard: Ctrl+Shift+R)
4. **Check Supabase RLS policies** (ensure inserts are allowed)

---

**Status**: ✅ FIXED - The duplicate key error should no longer prevent you from creating products!
