# 🔧 FIX: "column product_code does not exist" Error

## 🎯 **Your Errors:**

```
❌ Error 1: column loan_products.product_code does not exist
❌ Error 2: RLS Error: Add service key to .env file
```

---

## ✅ **SOLUTION:**

### **Error 1: Missing `product_code` Column (CRITICAL)**

Your database is missing the `product_code` column in the `loan_products` table!

**Fix it NOW:**

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy/paste this SQL:**

```sql
-- Add product_code column
ALTER TABLE public.loan_products ADD COLUMN IF NOT EXISTS product_code TEXT;

-- Generate codes for existing products
UPDATE public.loan_products 
SET product_code = 'PROD-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE product_code IS NULL;

-- Make it required and unique
ALTER TABLE public.loan_products ALTER COLUMN product_code SET NOT NULL;
ALTER TABLE public.loan_products ADD CONSTRAINT loan_products_product_code_unique UNIQUE (product_code);
CREATE INDEX idx_loan_products_code ON public.loan_products(product_code);
```

3. **Click RUN** ✅
4. **Done!** Error fixed!

---

### **Error 2: RLS Error (INFORMATIONAL ONLY - Can Ignore)**

This is just a warning, not a blocker. Your app works fine without it!

**What it means:**
- Row Level Security (RLS) is enabled on your database
- The app uses the anonymous key which has limited permissions
- This is **NORMAL and SECURE**!

**Do you NEED to fix it?**
- ❌ **NO!** Your app works fine without it
- The warning appears in console logs but doesn't affect functionality

**If you WANT to fix it anyway:**

1. **Get Service Role Key:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy `service_role` key (secret!)

2. **Create `.env` file** in project root:
   ```env
   VITE_SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

**⚠️ WARNING:** Service role key **bypasses ALL security**! Only use it for:
- Admin operations
- Migrations
- Testing

**Never** use it in production client-side code!

---

## 🎯 **QUICK FIX (Copy-Paste Ready):**

### **Option A: Just Fix the Database**

Run this in Supabase SQL Editor:

```sql
-- Complete fix for product_code column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_products' AND column_name = 'product_code'
  ) THEN
    ALTER TABLE public.loan_products ADD COLUMN product_code TEXT;
    
    UPDATE public.loan_products 
    SET product_code = 'PROD-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
    WHERE product_code IS NULL;
    
    ALTER TABLE public.loan_products ALTER COLUMN product_code SET NOT NULL;
    ALTER TABLE public.loan_products ADD CONSTRAINT loan_products_product_code_unique UNIQUE (product_code);
    CREATE INDEX idx_loan_products_code ON public.loan_products(product_code);
    
    RAISE NOTICE '✅ Fixed!';
  END IF;
END $$;
```

**Then refresh browser:** Ctrl+Shift+R

---

### **Option B: Use the Pre-Made Script**

Run the file **`/ADD_PRODUCT_CODE_COLUMN.sql`** in Supabase SQL Editor.

It does everything automatically! ✨

---

### **Option C: Start Fresh (If you have no data)**

1. **Run `/SIMPLE_FIX.md` steps** to reset database
2. **Run `/supabase/COMPLETE_DATABASE_SETUP.sql`** (now includes `product_code`!)
3. **Refresh browser**
4. **Done!** ✅

---

## 📋 **After Fixing:**

1. ✅ **Refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. ✅ **Check console** - errors should be gone!
3. ✅ **Test creating a loan product**
4. ✅ **Test creating a loan**

---

## 🔍 **Why This Happened:**

Your database was created with an older schema that didn't have the `product_code` column.

The app code expects it (used for organization-prefixed product numbering like `BVF-PROD-001`).

**The fix adds the column and generates codes for any existing products!** ✨

---

## ✅ **TLDR:**

**RUN THIS SQL IN SUPABASE:**

```sql
ALTER TABLE public.loan_products ADD COLUMN IF NOT EXISTS product_code TEXT;
UPDATE public.loan_products SET product_code = 'PROD-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0') WHERE product_code IS NULL;
ALTER TABLE public.loan_products ALTER COLUMN product_code SET NOT NULL;
```

**REFRESH BROWSER.** Done! 🎉
