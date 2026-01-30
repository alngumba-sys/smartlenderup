# 🖱️ Manual Database Cleanup Guide - Using Supabase Table Editor

## ✅ YES! You Can Use the UI to Delete Data

This is often **easier and safer** than running SQL scripts, especially when you want to see exactly what you're deleting.

---

## 🎯 Step-by-Step Manual Deletion Process

### **Important: Delete in THIS ORDER** (to avoid foreign key errors)

Follow this sequence to prevent "foreign key constraint" errors:

---

### **STEP 1: Delete Payments** 💳

1. **Go to:** Table Editor → `payments` table
2. **Click the checkbox** in the header row (selects all)
3. **Click "Delete X rows"** button at the top
4. **Confirm deletion**

✅ **Safe to delete ALL payments**

---

### **STEP 2: Delete Loan Collateral** 🏠
*(if table exists)*

1. **Go to:** Table Editor → `loan_collateral` table
2. **Select all rows**
3. **Delete**

✅ **Safe to delete ALL**

---

### **STEP 3: Delete Loan Guarantors** 👥
*(if table exists)*

1. **Go to:** Table Editor → `loan_guarantors` table
2. **Select all rows**
3. **Delete**

✅ **Safe to delete ALL**

---

### **STEP 4: Delete Loans** 💰

1. **Go to:** Table Editor → `loans` table
2. **Select all rows**
3. **Delete**

✅ **Safe to delete ALL loans**

---

### **STEP 5: Delete Clients** 👤

1. **Go to:** Table Editor → `clients` table
2. **Select all rows** (as shown in your screenshot)
3. **Click "Delete 64 rows"** (or however many you have)
4. **Confirm**

✅ **Safe to delete ALL clients**

---

### **STEP 6: Delete Loan Products** 📦
*(if you want to clear them)*

1. **Go to:** Table Editor → `loan_products` table
2. **Select all rows**
3. **Delete**

✅ **Safe to delete ALL** (you can recreate them later)

---

### **STEP 7: Delete Journal Entries** 📖
*(if table exists)*

1. **Go to:** Table Editor → `journal_entries` table
2. **Select all rows**
3. **Delete**

✅ **Safe to delete ALL**

---

### **STEP 8: Delete Payroll Records** 💵
*(if table exists)*

1. **Go to:** Table Editor → `payroll` table
2. **Option A:** Select all and delete
3. **Option B:** Filter by organization and delete only non-UV1K records

---

### **STEP 9: Delete Employees** 👔
*(if table exists)*

**CAREFUL:** Only delete employees from other organizations, NOT UV1K

**Option A - Delete All:**
1. **Go to:** Table Editor → `employees` table
2. **Select all rows**
3. **Delete**

**Option B - Keep UV1K Employees:**
1. Click **Filters**
2. Add filter: `organization_id` ≠ `[UV1K org ID]`
3. Select filtered rows
4. Delete

---

## 🔒 **DO NOT DELETE FROM THESE TABLES** (For UV1K)

### **❌ DO NOT DELETE: organizations**
Keep the BV Funguo Ltd organization (username: UV1K)

**How to delete ONLY other organizations:**
1. **Go to:** Table Editor → `organizations`
2. **Click each row** individually (don't select all)
3. **Only delete organizations** that are NOT UV1K
4. **Leave UV1K untouched**

---

### **❌ DO NOT DELETE: bank_accounts** (for UV1K)
Keep bank accounts belonging to BV Funguo Ltd

**How to delete only other org's accounts:**
1. **Go to:** Table Editor → `bank_accounts`
2. **Add filter:** `organization_id` ≠ `[your UV1K org ID]`
3. **Select filtered rows**
4. **Delete**

**Or just keep them all if they're all for UV1K**

---

### **❌ DO NOT DELETE: bank_branches** (for UV1K)
Same process as bank_accounts above

---

### **❌ DO NOT DELETE: shareholders** (for UV1K)
Same process as bank_accounts above

---

### **❌ DO NOT DELETE: users** (for UV1K)
If you have a `users` or `profiles` table:

**Option A:** Keep all users  
**Option B:** Filter and delete only non-UV1K users (if organization_id exists)

---

## 🎯 **Quick Deletion Checklist**

Use this checklist as you go:

- [ ] ✅ Delete all from: `payments`
- [ ] ✅ Delete all from: `loan_collateral` (if exists)
- [ ] ✅ Delete all from: `loan_guarantors` (if exists)
- [ ] ✅ Delete all from: `loans`
- [ ] ✅ Delete all from: `clients`
- [ ] ✅ Delete all from: `loan_products` (if desired)
- [ ] ✅ Delete all from: `journal_entries` (if exists)
- [ ] ✅ Delete all from: `payroll` (optional)
- [ ] ✅ Delete all from: `employees` (optional)
- [ ] ⚠️ Delete OTHER orgs from: `organizations` (keep UV1K)
- [ ] ⚠️ Delete OTHER org's: `bank_accounts` (keep UV1K)
- [ ] ⚠️ Delete OTHER org's: `bank_branches` (keep UV1K)
- [ ] ⚠️ Delete OTHER org's: `shareholders` (keep UV1K)

---

## 💡 **Pro Tips for UI Deletion**

### **1. Use Filters to Target Specific Records**
Click the **Filters** button and add:
- `organization_id` = `[specific org ID]`
- `status` = `'Active'`
- etc.

Then select and delete only filtered rows.

### **2. Check Row Count First**
Before deleting, note how many rows you're deleting:
- Look at the "Delete X rows" button
- Make sure it's the number you expect

### **3. Start with a Test**
Delete from one small table first to make sure you're comfortable with the process.

### **4. Use Page Navigation**
If you have 1000+ rows:
- Supabase shows 100-500 rows per page
- You may need to delete multiple times
- Or use the SQL script for bulk deletion

### **5. Refresh After Deletion**
After deleting, refresh the page to see the updated row count.

---

## ⚡ **When to Use UI vs SQL**

### **Use UI Deletion When:**
✅ You have < 500 rows per table  
✅ You want to see exactly what you're deleting  
✅ You're not comfortable with SQL  
✅ You want to selectively delete specific records  
✅ You want visual confirmation  

### **Use SQL Script When:**
✅ You have 1000+ rows to delete  
✅ You want to delete from multiple tables at once  
✅ You want a transaction (all-or-nothing)  
✅ You want to preserve specific records automatically  
✅ You need to repeat the process often  

---

## 🚨 **Common Issues and Solutions**

### **Issue: "Foreign key constraint violation"**

**Error Message:** 
```
Cannot delete row because it's referenced by another table
```

**Solution:**  
You're trying to delete a parent record before its children.

**Example:**
- Trying to delete a CLIENT who still has LOANS
- Trying to delete a LOAN that still has PAYMENTS

**Fix:** Delete in the correct order (see Step-by-Step above)

---

### **Issue: "Cannot select all rows"**

If you have 10,000+ rows, Supabase might not let you select all at once.

**Solution 1:** Delete in batches
- Delete 500 rows at a time
- Repeat until all deleted

**Solution 2:** Use the SQL script instead
- Much faster for large datasets
- Can delete 10,000+ rows instantly

---

### **Issue: "Delete button is disabled"**

**Reasons:**
1. No rows selected
2. You don't have permission
3. Row Level Security (RLS) is blocking deletion

**Solution:**
1. Make sure rows are checked
2. Check you're logged in as database owner
3. Temporarily disable RLS (be careful!):
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

---

## 📊 **Verification After Deletion**

After you finish deleting, verify:

### **Check 1: Organizations**
```sql
SELECT * FROM organizations;
```
Should show: **Only UV1K**

### **Check 2: Clients and Loans**
```sql
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM loans;
```
Should show: **0 for both**

### **Check 3: UV1K Data Preserved**
```sql
SELECT COUNT(*) FROM bank_accounts 
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K');
```
Should show: **Your UV1K bank accounts** (not 0)

---

## 🎯 **Recommended Approach**

For your situation, I recommend:

1. **Delete using UI** for these tables:
   - ✅ `payments` (select all, delete)
   - ✅ `loans` (select all, delete)
   - ✅ `clients` (select all, delete - as in your screenshot)

2. **Be careful** with these tables:
   - ⚠️ `organizations` (delete individually, keep UV1K)
   - ⚠️ `bank_accounts` (use filter if multiple orgs)
   - ⚠️ `bank_branches` (use filter if multiple orgs)

3. **Then test** by adding the 22 clients and 11 loans

---

## ✅ **Final Checklist**

Before you start:
- [ ] I have a backup (CSV exports or screenshot of data)
- [ ] I know which organization is UV1K
- [ ] I know the correct deletion order
- [ ] I'm ready to delete

After you finish:
- [ ] Clients table is empty (or only UV1K clients remain)
- [ ] Loans table is empty
- [ ] Payments table is empty
- [ ] UV1K organization still exists
- [ ] UV1K bank accounts still exist
- [ ] UV1K shareholders still exist (if any)

---

**You're all set! The UI method is perfect for your use case.** 🎉

Just follow the order above and you'll be able to clean your database safely while preserving the BV Funguo Ltd organization data.
