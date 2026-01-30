# 🚀 How to Add Test Clients to BV Funguo Ltd Database

## You have **3 easy options** to add the 22 test clients:

---

## **Option 1: SQL Script (Fastest)** ⚡

### Steps:
1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file: `/bulk-insert-test-clients.sql`
3. Copy all the SQL code
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. ✅ Done! All 22 clients added in seconds

### Advantages:
- ⚡ Fastest method
- ✅ Auto-generates proper CL00001 format IDs
- ✅ Maintains ID sequence
- ✅ Shows confirmation with client numbers
- ✅ No manual entry needed

---

## **Option 2: CSV Bulk Upload via UI** 📊

### Steps:
1. Download the file: `/test-clients-bulk-upload.csv`
2. In your app, go to **Clients Tab**
3. Click the **"Bulk Upload"** button (upload icon)
4. Select the CSV file
5. Map the columns (should auto-map)
6. Click **"Import Clients"**
7. ✅ Done!

### Advantages:
- 👁️ Visual confirmation before import
- ✅ Uses your existing bulk upload feature
- ✅ No SQL knowledge needed
- ✅ Can edit CSV before uploading

---

## **Option 3: Manual Entry via UI** 📝

### Steps:
1. In your app, go to **Clients Tab**
2. Click **"Add New Client"**
3. Fill in the details for each client
4. Repeat 22 times

### Advantages:
- 🎯 Good for testing the Add Client form
- ✅ Full validation testing
- ⚠️ Time-consuming (not recommended for 22 clients)

---

## **📋 Test Data Summary**

You're adding **22 clients**:
- **13 Male** clients
- **9 Female** clients
- **12 with email addresses**
- **10 without email addresses**
- All from **Kenya**
- All with **phone numbers** and **ID numbers**

### Loan Balances to Test (from your images):
- PRISCAH LOICE MBUVI: 37,625.00
- DANIEL COLLINS MAKOKO MWATETI: 35,475.00
- Ben Mbuvi: 110,000.00
- BILLY BOSTON ANYONYI: 143,300.00
- Geofrey Rogiers Mwandango: 161,250.00
- Benson Njoronge: 22,000.00
- James Mbuvi: 28,750.00
- Nicholas Ndiragu Mwangi: 345,000.00
- JUWERYIYA ALI MUHAMMAD: 345,000.00
- Stephen Mulu Nzavi: 220,000.00
- OLIVE KAMENE NDEVENI: 322,500.00

**Note:** The SQL script only adds clients, not loans. To add loans with balances, you'll need to create loans separately after adding clients.

---

## **✅ Verification After Import**

After running the script, verify in your app:

1. **Go to Clients Tab**
2. **Check:**
   - Total clients increased by 22
   - Client IDs follow CL00001 format
   - All names, phones, and emails are correct
   - Gender is properly set

3. **Run this SQL query** to verify:
```sql
SELECT 
    client_number,
    first_name || ' ' || last_name AS full_name,
    phone,
    email,
    gender,
    status
FROM clients
WHERE organization_id = (SELECT id FROM organizations WHERE username = 'UV1K')
ORDER BY client_number DESC
LIMIT 22;
```

---

## **🗑️ How to Remove Test Clients (if needed)**

If you want to remove these test clients:

```sql
-- Get the organization ID
DO $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE username = 'UV1K';
    
    -- Delete the last 22 clients
    DELETE FROM clients
    WHERE organization_id = v_org_id
    AND client_number IN (
        SELECT client_number
        FROM clients
        WHERE organization_id = v_org_id
        ORDER BY created_at DESC
        LIMIT 22
    );
    
    RAISE NOTICE '✅ Deleted 22 test clients';
END $$;
```

---

## **💡 Recommendation**

Use **Option 1 (SQL Script)** - it's the fastest and most reliable method for bulk testing!

After adding these test clients, you can:
1. Test the Clients Tab
2. Test loan creation with these clients
3. Test the cleanup script
4. Verify that the preserved data remains intact

---

## **📞 Need Help?**

If you encounter any errors:
1. Check that organization UV1K exists
2. Verify Supabase connection
3. Check that the `clients` table has all required columns
4. Review error messages in the SQL Editor console

Happy testing! 🎉
