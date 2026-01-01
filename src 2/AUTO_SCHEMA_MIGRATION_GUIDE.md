# 🔧 Automatic Schema Migration System

## Overview

SmartLenderUp now includes an **automatic schema migration system** that detects missing database columns and generates the SQL needed to add them. No more manual column additions!

---

## ✨ Key Features

✅ **Automatic Detection** - Checks all 25+ tables for missing columns on app startup  
✅ **Smart SQL Generation** - Creates ready-to-run ALTER TABLE statements  
✅ **Zero Data Loss** - Uses `ADD COLUMN IF NOT EXISTS` to safely add columns  
✅ **User-Friendly UI** - Schema Migration Panel in Super Admin Settings  
✅ **One-Click Copy** - Copy SQL to clipboard and apply in Supabase  
✅ **Download Option** - Download migration SQL as a file for records  

---

## 🚀 How It Works

### 1. **Automatic Check on Login**

When you log in to the platform, the system automatically:
- Checks all database tables for missing columns
- Compares actual schema with expected schema
- Generates migration SQL if differences are found
- Shows a notification if migration is needed

### 2. **Manual Check via UI**

You can manually trigger a schema check:

1. **Access Super Admin Panel**
   - Click the SmartLenderUp logo 5 times on the login page
   - Navigate to **Settings** tab

2. **Use Schema Migration Panel**
   - Click **"Check Database Schema"** button
   - Wait for scan to complete (usually 5-10 seconds)
   - View results showing missing columns

3. **Apply Migration**
   - Click **"Copy SQL"** to copy migration script
   - Go to Supabase Dashboard → SQL Editor
   - Paste and run the SQL
   - Refresh the page

---

## 📋 Tables Covered

The auto-migration system monitors these tables:

- ✅ shareholders
- ✅ shareholder_transactions
- ✅ bank_accounts
- ✅ expenses
- ✅ payees
- ✅ groups
- ✅ tasks
- ✅ payroll_runs
- ✅ funding_transactions
- ✅ disbursements
- ✅ approvals
- ✅ journal_entries
- ✅ processing_fee_records
- ✅ tickets
- ✅ kyc_records
- ✅ audit_logs

---

## 🛠️ Example Workflow

### Scenario: Shareholders Table Missing Columns

**Before Migration:**
```
⚠️ shareholders table is missing:
  - address
  - share_capital
  - ownership_percentage
  - bank_account
```

**System Generates:**
```sql
ALTER TABLE shareholders
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS share_capital NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ownership_percentage NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_account JSONB;
```

**After Migration:**
```
✅ shareholders table is up to date!
✅ All columns present
```

---

## 📝 Using the Schema Migration Panel

### Location
**Super Admin Dashboard → Settings Tab → Schema Migration Panel**

### Features

1. **Check Schema Button**
   - Scans all tables for missing columns
   - Shows results in real-time

2. **Results Display**
   - Lists tables needing migration
   - Shows specific missing columns
   - Displays total count

3. **Action Buttons**
   - **Copy SQL** - Copies migration script to clipboard
   - **Download** - Downloads SQL as a file
   - **View SQL** - Expands to show full SQL script

4. **Instructions**
   - Step-by-step guide on how to apply migration
   - Direct links to relevant sections

---

## 🔍 How Column Detection Works

The system detects missing columns by:

1. **Querying each table** using Supabase client
2. **Attempting to select each column** individually
3. **Catching "column does not exist" errors**
4. **Building a list of missing columns**
5. **Generating appropriate ALTER TABLE statements**

### Smart Type Detection

The system automatically determines column types:

- `*_id` or `id` → `TEXT`
- `amount`, `balance`, `capital` → `NUMERIC(15, 2)`
- `date`, `*_at`, `timestamp` → `TEXT` or `TIMESTAMP`
- `*_verified`, `*_collected` → `BOOLEAN`
- `count`, `members`, `year` → `INTEGER`
- `bank_account`, `attachments` → `JSONB`
- Everything else → `TEXT`

---

## ⚠️ Important Notes

### Safety First

✅ Uses `ADD COLUMN IF NOT EXISTS` - safe to run multiple times  
✅ Includes `DEFAULT` values to prevent null issues  
✅ Preserves all existing data  
✅ No DROP or DELETE operations  

### Limitations

❌ Does **not** modify existing columns (type changes, etc.)  
❌ Does **not** drop columns (manual action required)  
❌ Does **not** create tables (only adds columns)  
❌ Does **not** handle complex schema changes  

For complex migrations, use manual SQL scripts.

---

## 🧪 Testing the System

### Test Scenario 1: Fresh Installation

1. Create a new Supabase project
2. Run base schema creation SQL
3. Login to SmartLenderUp
4. System will detect all missing columns
5. Apply generated migration SQL
6. Verify all tables are complete

### Test Scenario 2: Partial Schema

1. Manually drop a few columns from a table
2. Trigger schema check
3. System should detect only those missing columns
4. Apply migration
5. Verify columns are restored

### Test Scenario 3: Idempotency

1. Run schema check
2. Apply migration SQL
3. Run schema check again
4. Should show "Schema is up to date"

---

## 🐛 Troubleshooting

### "Could not find column" Error

**Problem:** Application crashes with column not found error

**Solution:**
1. Open Super Admin Panel → Settings
2. Click "Check Database Schema"
3. Copy and apply generated SQL
4. Refresh the page

### Schema Check Fails

**Problem:** Schema check shows error or doesn't complete

**Solution:**
1. Check Supabase connection
2. Verify organization_id is valid
3. Check console for detailed errors
4. Try manual SQL approach

### SQL Application Fails

**Problem:** Error when running generated SQL in Supabase

**Solution:**
1. Check table exists: `SELECT * FROM table_name LIMIT 1`
2. Verify user has ALTER TABLE permissions
3. Run SQL line-by-line to identify problem
4. Check Supabase logs for details

---

## 📚 Technical Implementation

### Files Involved

```
/utils/simpleAutoMigration.ts
├── checkTableColumns()      - Checks single table
├── checkAllTables()          - Checks all tables
├── generateMigrationSQL()    - Creates SQL script
└── autoCheckAndMigrate()     - Main function

/components/SchemaMigrationPanel.tsx
└── UI component for schema management

/contexts/DataContext.tsx
└── Automatic check on data load

/supabase/migrations/create_auto_migration_functions.sql
└── Helper functions (optional)
```

### Integration Points

**Automatic Check:**
```typescript
// In DataContext.tsx useEffect
const migrationCheck = await autoCheckAndMigrate(organizationId);
if (migrationCheck.needsMigration) {
  showMigrationNotification(results, sql);
}
```

**Manual Trigger:**
```typescript
// In SchemaMigrationPanel.tsx
const runSchemaCheck = async () => {
  const result = await autoCheckAndMigrate(orgId);
  setResults(result.results);
  setMigrationSQL(result.sql);
};
```

---

## 🎯 Best Practices

### For Developers

1. **Update Schema Definitions** when adding new columns
   - Edit `EXPECTED_TABLE_COLUMNS` in `simpleAutoMigration.ts`
   - Add column with correct type

2. **Test Locally First**
   - Run schema check in development
   - Verify SQL before production

3. **Version Control**
   - Save generated SQL scripts
   - Document schema changes

### For Users

1. **Regular Checks** - Run schema check monthly
2. **Before Major Updates** - Always check schema
3. **After Supabase Changes** - Re-check if tables modified
4. **Keep Logs** - Download and save migration SQLs

---

## 🔄 Future Enhancements

### Planned Features

- [ ] Automatic SQL application (with user confirmation)
- [ ] Schema version tracking
- [ ] Migration history log
- [ ] Rollback capability
- [ ] Column type modification detection
- [ ] Index and constraint management
- [ ] Multi-organization support
- [ ] Email notifications for schema issues

---

## 💡 FAQ

### Q: Is it safe to run the generated SQL?

**A:** Yes! The SQL uses `ADD COLUMN IF NOT EXISTS` which:
- Never drops or modifies existing columns
- Never deletes data
- Can be run multiple times safely

### Q: What if I have custom columns?

**A:** Custom columns are ignored. The system only adds missing *expected* columns. Your custom columns remain untouched.

### Q: Do I need to run this every time?

**A:** No. The system checks automatically on login. Only run manually if you see errors or after making schema changes.

### Q: Can I disable automatic checks?

**A:** Yes. Comment out the auto-migration code in `DataContext.tsx` line ~877-890.

### Q: What about table creation?

**A:** This system only adds columns to existing tables. For new tables, use the main schema SQL scripts.

---

## 📞 Support

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify Supabase connection and credentials
3. Review Supabase SQL Editor for syntax errors
4. Contact support with:
   - Error messages
   - Table name
   - Organization ID
   - Screenshots of Schema Migration Panel

---

## 🎉 Summary

The Auto Schema Migration System:

✅ Saves time by automating column detection  
✅ Reduces errors from manual SQL writing  
✅ Provides clear, actionable migration paths  
✅ Works seamlessly with existing workflows  
✅ Keeps your database schema in sync  

**No more manual column additions!** 🚀

---

**Last Updated:** December 30, 2024  
**Version:** 1.0.0  
**Platform:** SmartLenderUp Microfinance System
