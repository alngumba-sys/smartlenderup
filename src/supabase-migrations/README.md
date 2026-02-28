# Supabase Database Migrations

This folder contains SQL migration scripts for your BV Funguo microfinance platform.

## How to Run Migrations

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase Project Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy the Migration File**
   - Open the migration file you want to run (e.g., `001-create-institutions-table.sql`)
   - Copy the entire contents

4. **Paste and Run**
   - Paste the SQL into the query editor
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

5. **Verify Success**
   - You should see success messages at the bottom
   - Check the verification queries at the end of the migration

### Method 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Make sure you're in your project directory
cd /path/to/your/project

# Run a specific migration
supabase db execute --file supabase-migrations/001-create-institutions-table.sql
```

## Available Migrations

### 001-create-institutions-table.sql
**Purpose**: Creates the institutions table for managing organizations (SACCOs, Corporates, Cooperatives, etc.)

**What it does**:
- ✅ Creates `institutions` table with all necessary fields
- ✅ Adds indexes for better performance
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Adds `institution_id` column to `clients` table (optional)
- ✅ Includes verification queries

**Required for**: Institutions Tab feature

## Troubleshooting

### Error: "relation already exists"
This means the table already exists. You can safely ignore this error or drop the table first if you want to recreate it.

### Error: "permission denied"
Make sure you're logged in to Supabase with an account that has admin access to your project.

### Error: "column does not exist"
This might happen if the migration expects columns from a previous migration. Make sure to run migrations in order.

## After Running Migrations

1. **Refresh your application** - Hard reload your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check the browser console** - Look for success messages
3. **Test the feature** - Navigate to the Institutions tab and try creating an institution

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Verify all previous migrations have been run
3. Check that your RLS policies are set up correctly
