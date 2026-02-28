# 🏢 Institutions Feature - Setup Guide

## ✅ What's Already Done

The Institutions feature has been fully implemented in the codebase:

- ✅ Database service layer (`supabaseDataService.ts`)
- ✅ Data context with CRUD operations
- ✅ Institutions Tab UI with Add/Edit/Delete
- ✅ Institution modal form
- ✅ Navigation integration
- ✅ Employer-based client grouping
- ✅ Performance metrics and analytics

## 🔧 What You Need to Do

### Step 1: Run the Database Migration

**📍 Location:** `/supabase-migrations/001-create-institutions-table.sql`

**How to run:**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your BV Funguo project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy & Paste the Migration**
   - Open `/supabase-migrations/001-create-institutions-table.sql`
   - Copy the **entire file**
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" (or press `Ctrl/Cmd + Enter`)
   - Wait for success message: ✅ Institutions table created successfully!

### Step 2: Verify the Migration

After running the migration, you should see:

```
✅ Institutions table created successfully! You can now use the Institutions feature.
```

**Check if it worked:**
- Look at the bottom of the SQL Editor for the success message
- The verification queries should show 0 records (table is empty but exists)

### Step 3: Test the Feature

1. **Refresh your application** (hard reload: `Ctrl+Shift+R` or `Cmd+Shift+R`)
2. **Navigate to:** Operations → Institutions
3. **Click:** "+ Add Institution" button
4. **Fill in the form** with a test institution:
   - Name: "Kenya Tea Growers SACCO"
   - Type: SACCO
   - Contact Person: "John Kamau"
   - Phone: "+254 712 345 678"
   - etc.
5. **Click:** "Add Institution"

### Step 4: View Auto-Grouped Clients (Optional)

Even without creating institutions, you'll see:
- **Client Groupings by Employer** section
- Shows all clients automatically grouped by their employer field
- Click any group to see detailed breakdown

## 📊 Features Available

### Managed Institutions
- Create, edit, and delete institutions
- Track institution type (SACCO, Corporate, Cooperative, NGO, etc.)
- Store contact information and registration details
- View performance metrics per institution

### Auto-Grouped by Employer
- Automatically groups clients by employer field
- Shows performance metrics for each group
- Helps identify which groups should become managed institutions

### Performance Metrics
For each institution/group, you can see:
- 👥 Number of clients
- 💰 Active loans count
- 📈 Total disbursed amount
- 💵 Outstanding balance
- ⚠️ PAR (Portfolio at Risk) rate
- ⭐ Average credit score

## 🚀 Next Steps (Optional Enhancements)

### Add Institution Field to Client Forms

To assign clients to institutions when creating/editing them:

1. **Update `ClientsTab.tsx`** - Add institution dropdown to the client form
2. **Store `institutionId`** when saving clients
3. **Filter clients** by institution in the Institutions tab

Example code for client form:
```tsx
<select 
  name="institutionId"
  value={formData.institutionId}
  onChange={handleChange}
>
  <option value="">Select Institution (Optional)</option>
  {institutions.map(inst => (
    <option key={inst.id} value={inst.id}>
      {inst.name}
    </option>
  ))}
</select>
```

## 🔍 Troubleshooting

### Error: "Could not find the table 'public.institutions'"
**Solution:** Run the migration in Step 1

### Error: "permission denied for table institutions"
**Solution:** Check your RLS policies in Supabase Dashboard

### Institutions not showing up
**Solution:** 
1. Check browser console for errors
2. Verify the migration ran successfully
3. Hard reload the page (Ctrl+Shift+R)

### Can't delete an institution
**Expected:** You can't delete institutions with assigned clients. This is by design to prevent data orphaning.

## 📝 Database Schema

The migration creates:

```sql
institutions
├── id (UUID, Primary Key)
├── organization_id (UUID, Foreign Key → organizations)
├── name (TEXT, Required)
├── type (TEXT, Required) - SACCO | Corporate | Cooperative | NGO | etc.
├── contact_person (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── address (TEXT)
├── city (TEXT)
├── county (TEXT)
├── registration_number (TEXT)
├── tax_id (TEXT)
├── status (TEXT, Required) - Active | Inactive
├── notes (TEXT)
├── created_at (TIMESTAMP)
├── created_by (TEXT)
└── updated_at (TIMESTAMP)

clients
└── institution_id (UUID, Foreign Key → institutions) [OPTIONAL]
```

## ✨ Usage Examples

### Example 1: SACCO Management
Create a SACCO, assign member clients to it, and track:
- Total members
- Group lending performance
- PAR rates for the SACCO

### Example 2: Corporate Clients
Create corporate entities, assign employee clients, and monitor:
- Employee borrowing patterns
- Corporate payroll deduction loans
- Risk concentration per employer

### Example 3: NGO/Cooperative
Track lending to cooperative members or NGO beneficiaries with full institutional oversight.

## 🎉 You're Done!

Once you've completed Steps 1-3, the Institutions feature is fully operational. Navigate to **Operations → Institutions** to start using it!
