# Testing Organization Registration & Login

## Quick Start Guide

### Step 1: Create a New Organization

1. On the login page, click the **"Get Started"** button
2. Select **"Organization"** from the registration type modal
3. Fill in the organization details:
   - Organization Name (required)
   - Date of Incorporation (required)
   - Industry, Type, Country (auto-sets currency)
   - Contact information (email, phone)
   - Location details
   - Primary contact person details
   - Password (minimum 8 characters)

4. Click **"Create Organization Account"**

### Step 2: Save Your Username

After successful registration, a success modal will appear showing:

```
┌─────────────────────────────────────┐
│  Organization Created Successfully! │
├─────────────────────────────────────┤
│  Your Login Username                │
│  ┌─────────────────────────────┐   │
│  │  Username: A2K9  [Copy]     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️ IMPORTANT: Save this username!  │
│     You'll need it to login         │
└─────────────────────────────────────┘
```

**IMPORTANT**: 
- ✅ Click the **"Copy"** button to copy your username
- ✅ Write down your username somewhere safe
- ✅ You'll use this username + your password to login

### Step 3: Login with Your New Account

1. Close the success modal
2. On the login page, enter:
   - **Username**: Your 4-digit code (e.g., "A2K9")
   - **Password**: The password you created during registration

3. Click **"Sign In"**

### Step 4: View Database (Optional)

Click the purple **Database** button (bottom-right corner) to:
- View all created organizations
- See usernames and passwords (for testing)
- Export data as JSON
- Clear database

## Example Registration Flow

### Example Data
```
Organization Name: Kenya MicroCredit Ltd
Registration Number: PVT-123456
Date of Incorporation: January 15, 2020
Industry: Microfinance
Country: Kenya (Currency: KES auto-set)
Email: info@kenyamicrocredit.co.ke
Phone: +254 712 345 678

Contact Person:
- Name: John Kamau
- Title: CEO
- Email: john.kamau@kenyamicrocredit.co.ke
- Phone: +254 700 123 456

Password: SecurePass123!
```

### Generated Username
```
System generates: K7M3
```

### Login Credentials
```
Username: K7M3
Password: SecurePass123!
```

## Testing Multiple Organizations

You can create multiple organizations to test the system:

1. **Kenya MicroCredit Ltd** → Username: `K7M3`
2. **Uganda Savings SACCO** → Username: `U9P2`
3. **Tanzania Community Bank** → Username: `T5Q8`

Each organization gets its own:
- Unique 4-digit alphanumeric username
- Separate database space (organization_id foreign key)
- Independent client/loan/repayment records

## Database Structure

When you create an organization, the system creates:

```javascript
Organization {
  id: "ORG-1703346123456-789",
  username: "K7M3",  // 4-digit alphanumeric
  organization_name: "Kenya MicroCredit Ltd",
  email: "info@kenyamicrocredit.co.ke",
  phone: "+254 712 345 678",
  country: "Kenya",
  currency: "KES",
  status: "active",
  password_hash: "SecurePass123!",  // In production, this would be hashed
  created_at: "2024-12-23T10:15:23.456Z",
  // ... other fields
}
```

## Demo Accounts (Pre-loaded)

For quick testing, use these demo accounts:

### Admin Account
```
Username: 12345
Password: Test@1234
```

### Employee Account
```
Username: employee@bvfunguo.co.ke
Password: Employee@123
```
OR
```
Username: 0712345678
Password: Employee@123
```

## Troubleshooting

### "Invalid credentials" Error
- ✅ Check your username is correct (case-sensitive)
- ✅ Check your password is correct
- ✅ Try clicking the Database viewer to see your username
- ✅ Organization status must be "active"

### Can't See Database Viewer
- ✅ Look for purple floating button in bottom-right corner
- ✅ Click it to open the viewer panel

### Lost Your Username
- ✅ Click the Database viewer button
- ✅ Look for your organization name
- ✅ Your username is displayed next to it

### Clear All Data
- ✅ Open Database viewer
- ✅ Click "Clear All" button
- ✅ Confirm the action
- ✅ Page will reload with clean database

## Next Steps After Login

Once logged in as an organization admin, you can:
1. ✅ Set up loan products
2. ✅ Add clients (individuals or groups)
3. ✅ Process loan applications
4. ✅ Manage repayments
5. ✅ View analytics and reports
6. ✅ Configure M-Pesa integration
7. ✅ Manage staff users

## Data Persistence

All data is stored in localStorage:
- Persists across browser sessions
- Survives page refreshes
- Specific to your browser
- Can be exported/imported as JSON
- Ready for Supabase migration

## Production Deployment Notes

When migrating to Supabase:
1. Password hashing will be implemented (bcrypt/argon2)
2. UUIDs will replace timestamp-based IDs
3. Email verification will be added
4. Rate limiting on login attempts
5. Session management with JWT tokens
6. Row-level security policies enforced
