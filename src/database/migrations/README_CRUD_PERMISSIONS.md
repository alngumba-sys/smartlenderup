# CRUD Permissions Migration

## Overview
This migration adds full CRUD (Create, Read, Update, Delete) permissions to the staff management system.

## Changes Made

### 1. Database Schema
- **Added `can_create` column** to `staff_permissions` table
- Updated schema to support View, Create, Edit, and Delete permissions for each tab

### 2. Type Definitions (`/types/staff.ts`)
- Updated `TabPermission` interface to include `can_create: boolean`
- Updated `StaffPermission` interface to include `can_create: boolean`

### 3. Staff Management Component (`/components/StaffManagement.tsx`)
- Added "Create" checkbox to permission UI
- Updated permission state management to handle 4 permission types
- Updated database operations to save/load `can_create` permission

### 4. Permission Utilities (`/utils/staffPermissions.ts`)
- Added `canCreateInTab()` function to check create permissions
- Export function for use across the application

## How to Apply Migration

### Option 1: Run SQL Migration (Recommended)
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Run this migration file
\i /database/migrations/add_create_permission.sql
```

Or copy and paste the contents directly into Supabase SQL Editor.

### Option 2: Manual SQL Execution
Run this SQL command in Supabase:

```sql
-- Add can_create column
ALTER TABLE staff_permissions 
ADD COLUMN IF NOT EXISTS can_create BOOLEAN DEFAULT FALSE;

-- Update existing records (optional - sets create based on edit permission)
UPDATE staff_permissions 
SET can_create = can_edit 
WHERE can_create IS NULL OR can_create = FALSE;
```

## Usage

### Setting Permissions in UI
1. Navigate to **Admin > Settings > Staff Management**
2. Click **Edit Permissions** on any staff member
3. For each tab, you can now set:
   - ✅ **View** - Can see the tab
   - ✅ **Create** - Can create new records
   - ✅ **Edit** - Can modify existing records
   - ✅ **Delete** - Can delete records

### Permission Hierarchy
- **View must be enabled** for Create, Edit, or Delete to work
- Enabling Create, Edit, or Delete automatically enables View
- Disabling View automatically disables Create, Edit, and Delete

### Using Permissions in Code

```typescript
import { canCreateInTab, canEditInTab, canDeleteInTab, canViewTab } from '../utils/staffPermissions';

// Check if user can create loans
if (canCreateInTab('operations_loans')) {
  // Show "Add New Loan" button
}

// Check if user can edit clients
if (canEditInTab('operations_clients')) {
  // Show edit button
}

// Check if user can delete products
if (canDeleteInTab('operations_products')) {
  // Show delete button
}

// Check if user can view reports
if (canViewTab('reports_par')) {
  // Show the reports tab
}
```

## Benefits

1. **Granular Control** - Fine-tune what each staff member can do
2. **Security** - Prevent unauthorized actions
3. **Compliance** - Meet audit requirements with proper access controls
4. **Flexibility** - Different roles can have different permissions

## Testing

After applying the migration:

1. ✅ Create a new staff member and assign permissions
2. ✅ Login as that staff member
3. ✅ Verify only permitted tabs appear
4. ✅ Verify create/edit/delete buttons respect permissions
5. ✅ If Dashboard is disabled, verify landing page is Loans

## Rollback (if needed)

To remove the `can_create` column:

```sql
ALTER TABLE staff_permissions DROP COLUMN IF EXISTS can_create;
```

Note: This will remove all create permissions. Consider backing up data first.
