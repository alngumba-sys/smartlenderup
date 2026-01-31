# Staff Management Database Setup

This guide helps you set up the staff management tables in your Supabase database.

## Tables Created

1. **staff_users** - Stores staff user accounts
2. **staff_permissions** - Stores tab-level permissions for each staff user

## Setup Instructions

### Step 1: Connect to Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **SmartlenderUp** project

### Step 2: Open SQL Editor

1. In the left sidebar, click on **SQL Editor**
2. Click **New query**

### Step 3: Run the Migration

1. Copy the entire contents of `create_staff_tables.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press `Ctrl/Cmd + Enter`)

You should see a success message indicating that the tables were created.

### Step 4: Verify the Tables

1. In the left sidebar, click on **Table Editor**
2. You should now see two new tables:
   - `staff_users`
   - `staff_permissions`

## Table Schemas

### staff_users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| organization_id | UUID | Foreign key to organizations table |
| full_name | TEXT | Staff member's full name |
| phone_number | TEXT | Phone number (used for login) |
| email | TEXT | Email address (optional) |
| password_hash | TEXT | Password (defaults to last 4 digits of phone) |
| role | TEXT | One of: manager, staff, loan_officer, accountant, collector |
| is_first_login | BOOLEAN | Flag to force password change on first login |
| is_active | BOOLEAN | Whether the staff account is active |
| created_by | TEXT | User ID/email who created this staff account |
| created_at | TIMESTAMP | When the record was created |
| updated_at | TIMESTAMP | When the record was last updated |

### staff_permissions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| staff_user_id | UUID | Foreign key to staff_users table |
| tab_name | TEXT | Tab key (e.g., 'dashboard', 'operations_loans') |
| can_view | BOOLEAN | Whether staff can view this tab |
| can_edit | BOOLEAN | Whether staff can edit in this tab |
| can_delete | BOOLEAN | Whether staff can delete in this tab |
| created_at | TIMESTAMP | When the record was created |
| updated_at | TIMESTAMP | When the record was last updated |

## How It Works

### Creating Staff

1. Manager logs in to SmartLenderUp
2. Goes to **Settings** → **Staff Management**
3. Clicks **Add Staff Member**
4. Fills in staff details:
   - Full name
   - Phone number
   - Email (optional)
   - Role
5. Selects which tabs the staff can access and their permissions (View/Edit/Delete)
6. Clicks **Create Staff Member**

The system automatically:
- Generates a default password (last 4 digits of phone number)
- Sets `is_first_login` to `true`
- Creates permission records for each selected tab

### Staff Login

1. Staff member goes to the login page
2. Clicks **Staff Login**
3. Enters their phone number and password (last 4 digits initially)
4. On first login, they're prompted to change their password
5. After setting a new password, they gain access to the platform

### Permission-Based Access

- The navigation menu automatically filters to show only tabs the staff has permission to view
- Edit and Delete buttons are hidden for tabs where staff doesn't have those permissions
- Managers always have full access to all tabs

## Security Features

- **Row Level Security (RLS)**: Enabled on both tables
- **Organization Isolation**: Staff can only see other staff from their own organization
- **Password Security**: Passwords should be hashed in production (currently using plain text for demo)
- **Audit Trail**: `created_by`, `created_at`, and `updated_at` fields track changes

## Available Tab Keys

The following tab keys are available for permissions:

- `dashboard` - Dashboard
- `operations_loans` - Operations → Loans
- `operations_products` - Operations → Loan Products  
- `operations_clients` - Operations → Clients
- `operations_groups` - Operations → Groups
- `accounting_chart` - Accounting → Chart of Accounts
- `accounting_journal` - Accounting → Journal Entries
- `accounting_trial` - Accounting → Trial Balance
- `reports_par` - Reports → PAR Report
- `reports_collections` - Reports → Collections Report
- `reports_management` - Reports → Management Report
- `payroll` - Payroll
- `ai_tools` - AI Tools
- `settings` - Settings

## Troubleshooting

### Tables already exist error

If you get an error saying the tables already exist, you can either:
- Drop the existing tables and rerun the migration
- Or modify the SQL to use `CREATE TABLE IF NOT EXISTS`

### Permission denied errors

Make sure you're connected to the correct Supabase project and have the necessary permissions to create tables.

### Organization ID not found

Make sure you have an `organizations` table with a valid organization record before creating staff users.

## Production Considerations

Before deploying to production:

1. **Implement proper password hashing** - Use bcrypt or similar
2. **Add email verification** - Verify staff email addresses
3. **Add password reset flow** - Allow staff to reset forgotten passwords
4. **Audit logging** - Log all permission changes
5. **Session management** - Implement secure session handling
6. **Rate limiting** - Prevent brute force login attempts

## Support

For questions or issues, contact support at support@smartlenderup.com
