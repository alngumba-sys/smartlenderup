# Supabase Setup Instructions

## Error: "Could not find the 'name' column of 'shareholders' in the schema cache"

This error occurs because the `shareholders` table doesn't exist in your Supabase database yet, or it has the wrong schema.

## How to Fix

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the SQL Script
1. Copy the contents of `/SUPABASE_SETUP.sql`
2. Paste it into the SQL Editor
3. Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

### Step 3: Verify Table Creation
1. Go to "Table Editor" in the left sidebar
2. You should see the `shareholders` table with the following columns:
   - `id` (text)
   - `organization_id` (text)
   - `name` (text)
   - `email` (text)
   - `phone` (text)
   - `id_number` (text)
   - `address` (text)
   - `share_capital` (numeric)
   - `ownership_percentage` (numeric)
   - `bank_account` (jsonb)
   - `status` (text)
   - `total_dividends` (numeric)
   - `shares` (numeric)
   - `share_value` (numeric)
   - `total_investment` (numeric)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

### Step 4: Reload Your Application
1. Refresh your browser
2. The shareholders should now initialize properly
3. You should see Victor Muthama and Ben Mbuvi created as default shareholders

## Other Tables

If you encounter similar errors for other tables (bank_accounts, expenses, etc.), you'll need to create those tables as well. The schema definitions are available in:
- `/utils/autoSchemaMigration.ts` (complete schema definitions)
- `/utils/simpleAutoMigration.ts` (column lists)

## Alternative: Use Schema Migration Tool

Your platform includes a Schema Migration Panel that can help detect missing columns. However, it requires the tables to exist first. The SQL script above creates the basic table structure.

## Troubleshooting

### Error: "Failed to fetch"
This usually means:
1. **Network issue**: Check your internet connection
2. **Supabase API key issue**: Verify your Supabase credentials in the environment
3. **Table doesn't exist**: Run the SQL script above

### Error: "relation 'shareholders' does not exist"
- The table hasn't been created yet. Run the SQL script above.

### Error: "column 'X' does not exist"
- The table exists but is missing columns. You can either:
  1. Drop and recreate the table (WARNING: This will delete all data!)
  2. Add the missing columns manually using ALTER TABLE commands
  3. Use the Schema Migration Panel in the app (Settings → System → Schema Migration)
