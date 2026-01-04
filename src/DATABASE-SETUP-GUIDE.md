# 🗄️ Database Setup Guide for SmartLenderUp

## ❌ Current Errors

You're seeing these errors because the database tables are missing:

1. **`contact_messages` table doesn't exist** (404 error)
2. **`trial_days` column missing** from `pricing_config` table

---

## ✅ Quick Fix (5 Minutes)

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: **SmartLenderUp**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

---

### **Step 2: Run the Setup SQL**

1. Open the file: `/supabase-setup.sql` in this project
2. **Copy ALL the SQL code** (Ctrl+A, Ctrl+C)
3. **Paste it** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

---

### **Step 3: Verify Success**

You should see output like:

```
✅ contact_messages table created | exists: 1
✅ pricing_config.trial_days column | exists: 1

Showing pricing config:
┌──────────────┬──────────┬───────────────┬─────────────┬────────────┬───────────┐
│ id           │ plan_name│ monthly_price │ annual_price│ trial_days │ is_active │
├──────────────┼──────────┼───────────────┼─────────────┼────────────┼───────────┤
│ uuid-xxx     │ Growth   │ 199.00        │ 1990.00     │ 14         │ true      │
│ uuid-xxx     │ Professional │ 299.00    │ 2990.00     │ 14         │ true      │
│ uuid-xxx     │ Enterprise │ 599.00      │ 5990.00     │ 14         │ true      │
└──────────────┴──────────┴───────────────┴─────────────┴────────────┴───────────┘
```

---

### **Step 4: Test the Features**

#### **Test Contact Form:**
1. Go to your landing page: https://smartlenderup.com
2. Scroll to footer
3. Click **"Contact Us"** button
4. Fill in the form and submit
5. ✅ Should see: "Message sent! We'll get back to you soon. 🎉"

#### **Test Super Admin:**
1. Click logo 5 times quickly
2. Login with Super Admin credentials
3. Go to **"Contact Messages"** tab
4. ✅ Should see your test message with a red "NEW" badge

#### **Test Trial Management:**
1. In Super Admin, go to **"Subscriptions"** tab
2. Scroll to **"Pricing Remote Control"** section
3. Change trial days for any plan
4. Click **"Save Changes"**
5. ✅ Should see: "Pricing updated successfully!"

---

## 📋 What the SQL Does

### 1. **Creates `contact_messages` Table**
```sql
Columns:
- id (UUID, auto-generated)
- name (text, required)
- email (text, required)
- phone (text, optional)
- message (text, required)
- status ('unread' | 'read', defaults to 'unread')
- created_at (timestamp, auto-set)

Indexes:
- status (for filtering)
- created_at (for sorting)

Security:
- Anyone can INSERT (send messages)
- Super Admins can SELECT, UPDATE, DELETE
```

### 2. **Adds `trial_days` to `pricing_config`**
```sql
- Checks if table exists, creates if not
- Adds trial_days column (integer, default 14)
- Updates existing records to include trial_days
```

### 3. **Inserts Default Pricing Plans**
```sql
- Growth: $199/month, 14-day trial
- Professional: $299/month, 14-day trial
- Enterprise: $599/month, 14-day trial
```

### 4. **Sets Up Row Level Security (RLS)**
```sql
- Public can read pricing
- Public can send contact messages
- Authenticated users manage everything
- Anonymous users have full access (for demo)
```

---

## 🔧 Alternative: Manual Table Creation

If you prefer to create tables manually:

### **Create contact_messages:**
1. Go to **Table Editor** in Supabase
2. Click **New Table**
3. Name: `contact_messages`
4. Add columns:
   - `name` (text, required)
   - `email` (text, required)
   - `phone` (text, nullable)
   - `message` (text, required)
   - `status` (text, default: 'unread')
5. Enable RLS and add policies

### **Add trial_days to pricing_config:**
1. Go to **Table Editor** → `pricing_config`
2. Click **Add Column**
3. Name: `trial_days`
4. Type: `int4` (integer)
5. Default: `14`
6. Click **Save**

---

## 🚨 Troubleshooting

### **Error: "relation already exists"**
- This is fine! It means the table was already created
- The SQL uses `IF NOT EXISTS` to avoid errors

### **Error: "permission denied"**
- Make sure you're the project owner
- Check if you're in the correct Supabase project

### **Error: "column already exists"**
- This is fine! The SQL checks before adding columns
- Your database is already up to date

### **Contact form still shows 404:**
- Wait 10-15 seconds for Supabase to refresh schema cache
- Refresh your browser (Ctrl+Shift+R)
- Check if the table exists in Table Editor

### **Pricing control still shows error:**
- Make sure you ran the full SQL script
- Check if `trial_days` column exists in `pricing_config` table
- Refresh the Super Admin dashboard

---

## ✅ Success Checklist

- [ ] Ran SQL script in Supabase SQL Editor
- [ ] Saw success messages in output
- [ ] `contact_messages` table exists in Table Editor
- [ ] `pricing_config` has `trial_days` column
- [ ] Contact form works (no 404 error)
- [ ] Super Admin can see contact messages
- [ ] Pricing control panel can save trial_days
- [ ] No more red errors in browser console

---

## 📞 Need Help?

If you're still seeing errors after following these steps:

1. **Check browser console** (F12) for detailed error messages
2. **Check Supabase logs** in your dashboard
3. **Verify table structure** in Table Editor matches the schema
4. **Check RLS policies** are properly set up

---

## 🎉 You're Done!

Once the SQL runs successfully:
- ✅ Contact form will work perfectly
- ✅ Messages appear in Super Admin with notification badges
- ✅ Trial management system fully functional
- ✅ Pricing control panel can update trial periods
- ✅ All database operations work smoothly

**Your SmartLenderUp platform is now fully configured!** 🚀
