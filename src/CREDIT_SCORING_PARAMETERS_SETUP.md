# Credit Scoring Parameters - Database Setup

## 🎯 Overview
Credit Scoring Parameters are now stored in Supabase database, ensuring they persist across sessions and are always fetched from the database.

## ✅ What's Been Implemented

### 1. **Database Table**
- Created `credit_scoring_parameters` table in Supabase
- Stores parameters for both individual and business clients
- Organization-scoped with proper RLS policies

### 2. **Backend Service**
- Added `creditScoringParametersService` to `/services/supabaseDataService.ts`
- Methods: `getByClientType()`, `saveParameters()`, `getAll()`

### 3. **Frontend Integration**
- Updated `DataContext` with:
  - `saveCreditScoringParameters()` - Saves to database
  - `getCreditScoringParameters()` - Retrieves from database
  - `creditScoringParameters` - State array
- Updated `CreditScoringParametersModal` to:
  - Load parameters from database on open
  - Save parameters to database on Save button
  - Show toast notifications

## 🚀 Setup Instructions

### Step 1: Run SQL Migration

Go to your Supabase project dashboard:

1. **Navigate to**: https://app.supabase.com/project/YOUR_PROJECT_ID/editor
2. **Click**: SQL Editor
3. **Copy and paste** the SQL from: `/supabase/migrations/create_credit_scoring_parameters_table.sql`
4. **Run** the query

The SQL will:
- ✅ Create `credit_scoring_parameters` table
- ✅ Add proper indexes
- ✅ Enable Row Level Security (RLS)
- ✅ Create RLS policies

### Step 2: Verify Table Creation

Run this query to verify:

```sql
SELECT * FROM credit_scoring_parameters LIMIT 5;
```

You should see an empty table (0 rows) - this is expected.

### Step 3: Test the Feature

1. **Open your application**
2. **Navigate to**: Credit Scoring tab
3. **Click**: "Configure Parameters" button
4. **Make changes** to weights or parameters
5. **Click**: "Save Parameters"
6. **Expected**: 
   - ✅ Toast notification: "Credit scoring parameters saved successfully"
   - ✅ Parameters persist after page refresh
   - ✅ Console log: "✅ Credit scoring parameters saved and reloaded"

### Step 4: Verify Database Storage

Run this query to see saved parameters:

```sql
SELECT 
  client_type,
  parameter_name,
  weight,
  enabled
FROM credit_scoring_parameters
ORDER BY client_type, parameter_name;
```

You should see your saved parameters in the database.

## 📊 How It Works

### Data Flow

1. **On Modal Open**:
   ```
   Modal Opens → getCreditScoringParameters(clientType) → Load from DB → Display
   ```

2. **On Save**:
   ```
   Save Button → saveCreditScoringParameters(clientType, params) → 
   Delete old params → Insert new params → Reload from DB → Update state
   ```

3. **On Page Load**:
   ```
   DataContext.refreshData() → creditScoringParametersService.getAll() → 
   Load all params → Set state
   ```

### Default Parameters

If no parameters exist in database:
- **Individual Clients**: Payment History (35%), Credit Utilization (30%), Account Age (15%), Loan Count (10%), Savings Balance (10%)
- **Business Clients**: Payment History (30%), Credit Utilization (25%), Account Age (20%), Loan Count (15%), Savings Balance (10%)

## 🔍 Troubleshooting

### Issue: "Failed to save credit scoring parameters"

**Solutions**:
1. Check that SQL migration ran successfully
2. Verify RLS policies are created
3. Check browser console for detailed error
4. Verify organization_id exists in organizations table

### Issue: Parameters not loading

**Solutions**:
1. Open browser console and check for errors
2. Verify you ran the SQL migration
3. Check that `refreshData()` is being called on login
4. Verify Supabase connection

### Issue: Toast says "saved" but not in database

**Solutions**:
1. Check browser console for errors
2. Verify RLS policies allow INSERT
3. Check organization_id is valid
4. Run: `SELECT * FROM credit_scoring_parameters` to verify

## 📝 Database Schema

```sql
CREATE TABLE credit_scoring_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  client_type TEXT NOT NULL CHECK (client_type IN ('individual', 'business')),
  parameter_id TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight >= 0 AND weight <= 100),
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, client_type, parameter_id)
);
```

## ✨ Features

- ✅ **Database Persistence**: All parameters stored in Supabase
- ✅ **No localStorage**: Pure database operations
- ✅ **Real-time Updates**: Changes reflect immediately
- ✅ **Organization-scoped**: Each org has their own parameters
- ✅ **Client Type Specific**: Separate params for individual/business
- ✅ **Validation**: Weights must total 100%
- ✅ **Custom Parameters**: Add your own scoring factors
- ✅ **Enable/Disable**: Toggle parameters without deleting

## 🎉 Success Indicators

When working correctly, you'll see:

1. **Console Logs**:
   ```
   💾 Saving 5 credit scoring parameters for individual clients
   ✅ Saved 5 credit scoring parameters successfully
   ✅ Credit scoring parameters saved and reloaded
   ```

2. **Toast Notifications**:
   - "Credit scoring parameters saved successfully for individual clients"
   - "Data refreshed from database"

3. **Database Verification**:
   ```sql
   SELECT COUNT(*) FROM credit_scoring_parameters;
   -- Should return > 0
   ```

## 🔗 Related Files

- `/supabase/migrations/create_credit_scoring_parameters_table.sql` - SQL migration
- `/services/supabaseDataService.ts` - Database service
- `/contexts/DataContext.tsx` - React context with save/load functions
- `/components/modals/CreditScoringParametersModal.tsx` - UI component
- `/components/tabs/CreditScoringTab.tsx` - Credit scoring tab

---

**Ready to test!** Run the SQL migration and start configuring your credit scoring parameters! 🚀
