# Loan Products Location & Diagnostic Guide

## 🎯 Where to Find Your Loan Products

Your loan product is stored in the system. Here's how to access it:

### Navigation Path
1. **Login** to your organization
2. Click **"Admin"** in the main navigation menu (top)
3. Click **"Loan Products"** in the dropdown menu
4. You should see your created loan product displayed in the grid

### Quick Navigation
- **Menu**: Admin → Loan Products
- **Tab ID**: `loan-products`
- **Component**: `/components/tabs/LoanProductsTab.tsx`

---

## 🔍 Why Your Loan Product Might Not Be Visible

If you don't see your loan product, here are the most common reasons:

### 1. **Organization Context**
- Loan products are **organization-specific**
- Make sure you're logged into the **same organization** where you created the product
- Each organization has its own separate loan products

### 2. **Data Storage Location**
- All loan products are stored in **Supabase** (cloud database)
- They are loaded when you log in from the `loan_products` table
- Filter: `organization_id` = your current organization's ID

### 3. **Permissions**
- Your user role must have the `manageProducts` permission
- Check your role permissions in **Admin → Staff Management**

### 4. **Browser/Cache Issues**
- Try **refreshing the page** (F5 or Ctrl+R)
- Clear browser cache and reload
- Try in an **incognito/private window**

---

## 🛠️ How Loan Products Are Stored

### Data Flow
```
Create Product → DataContext.addLoanProduct() → Supabase Sync
                     ↓
              Local State (loanProducts array)
                     ↓
              Display in LoanProductsTab
```

### ID Format
- Loan products use IDs like: `PRD1735510800000`
- Format: `PRD` + timestamp

### Supabase Table
- **Table Name**: `loan_products`
- **Key Fields**: 
  - `id` (primary key)
  - `organization_id` (foreign key)
  - `name`, `description`, `interest_rate`, `min_amount`, `max_amount`, etc.

---

## 🔧 How to Verify Your Loan Product Exists

### Option 1: Use Browser Console
1. Open the **Loan Products** page
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Type: `localStorage.getItem('current_organization')`
5. Note your organization ID
6. Check Supabase directly (see below)

### Option 2: Check Supabase Directly
1. Go to your **Supabase Dashboard**
2. Navigate to **Table Editor**
3. Select the `loan_products` table
4. Filter by your `organization_id`
5. Look for your loan product

### Option 3: Use the Database Viewer (Built-in)
1. Go to **Admin → Settings**
2. Look for a **Database Viewer** or **Data Backup** section
3. Check if your loan products are listed there

---

## ✅ Quick Fixes

### If Your Product is Missing:

#### Fix 1: Refresh the Page
```
Press F5 or Ctrl+R
```

#### Fix 2: Re-login
```
1. Logout
2. Login again with your organization credentials
3. Navigate to Admin → Loan Products
```

#### Fix 3: Check Supabase Connection
```
1. Look for any red error toasts when the page loads
2. Check browser console (F12) for Supabase errors
3. Verify your internet connection is stable
```

#### Fix 4: Create a New Test Product
```
1. Go to Admin → Loan Products
2. Click "Create New Product"
3. Fill in the details:
   - Name: "Test Product"
   - Interest Rate: 12%
   - Min Amount: 10,000
   - Max Amount: 100,000
   - Tenor: 3-12 months
4. Save and check if it appears
```

---

## 📊 What You Should See

When you navigate to **Admin → Loan Products**, you should see:

### Summary Cards (Top)
- **Total Products**: Number of all loan products
- **Active Loans**: Number of active loans using products
- **Total Disbursed**: Total amount disbursed across all products
- **Average Rate**: Average interest rate across products

### Product Cards (Grid)
Each loan product displays:
- **Product Name** and **Description**
- **Status** badge (Active/Inactive)
- **Interest Rate** with calculation method
- **Min/Max Amount** range
- **Tenor** (loan term) range
- **Processing Fee**
- **Performance Metrics**: Total loans, active loans, etc.
- **Action Buttons**: View, Edit, Toggle Status, Delete

---

## 🐛 Diagnostic Tool

Run the following code in your **Browser Console** (F12 → Console):

```javascript
// Check if loan products are loaded
const checkLoanProducts = () => {
  // Get organization info
  const orgData = localStorage.getItem('current_organization');
  if (!orgData) {
    console.log('❌ No organization found in localStorage');
    return;
  }
  
  const org = JSON.parse(orgData);
  console.log('✅ Current Organization:', org.name, '(ID:', org.id, ')');
  
  // Note: Loan products are in React state, not localStorage
  console.log('ℹ️ Loan products are stored in Supabase and loaded into React state');
  console.log('ℹ️ To see them, navigate to Admin → Loan Products in the app');
  
  // Check permissions
  const user = localStorage.getItem('current_user');
  if (user) {
    const userData = JSON.parse(user);
    console.log('✅ Current User:', userData.name, '(Role:', userData.role, ')');
  }
};

checkLoanProducts();
```

---

## 📞 Still Can't Find Your Loan Product?

If you've tried all the above and still can't see your loan product:

### Data Recovery Steps

1. **Check the exact time you created the product**
   - Loan products get IDs based on timestamp: `PRD{timestamp}`
   - Example: If created on Dec 29, 2025 at 3:30 PM, ID would be around `PRD1735510800000`

2. **Check Supabase Directly**
   - Login to your Supabase dashboard
   - Go to Table Editor → loan_products
   - Apply filter: `organization_id = 'your-org-id'`
   - If you see the product there, it exists but isn't loading properly

3. **Check for Sync Errors**
   - Open browser console (F12)
   - Look for errors containing "loan_product" or "Supabase"
   - Common errors:
     - Network errors (check internet)
     - Permission errors (check RLS policies in Supabase)
     - Constraint errors (check data format)

4. **Verify Data Structure**
   - Loan products must have these required fields:
     - `name` (string)
     - `interest_rate` (number)
     - `interest_type` (string)
     - `min_amount`, `max_amount` (numbers)
     - `min_tenor`, `max_tenor` (numbers in months)
     - `status` ('Active' or 'Inactive')

---

## 💡 Common Scenarios

### Scenario 1: "I created a product but it disappeared after refresh"
**Cause**: Supabase sync might have failed  
**Solution**: Check browser console for errors. The product might still be in Supabase but not loading properly.

### Scenario 2: "I see other products but not mine"
**Cause**: Organization filter might be applied  
**Solution**: Verify you're logged into the correct organization. Each org has separate products.

### Scenario 3: "The Loan Products tab is empty"
**Cause**: No products created yet, or data not loading from Supabase  
**Solution**: Try creating a new test product to verify the system is working.

### Scenario 4: "I can't access Admin → Loan Products"
**Cause**: Permission issue  
**Solution**: Your role needs `manageProducts` permission. Contact your admin or check `/config/rolePermissions.ts`.

---

## 📝 Creating a Loan Product (Step-by-Step)

To create a new loan product:

1. **Navigate**: Admin → Loan Products
2. **Click**: "Create New Product" button (top right, green)
3. **Fill in Basic Information**:
   - Product Name (required) - e.g., "Business Loan"
   - Description - Brief explanation
   - Status - Active or Inactive

4. **Configure Interest Rate**:
   - Interest Rate (%) - e.g., 12
   - Interest Type - Flat, Declining, or Reducing Balance
   - Repayment Frequency - Monthly, Weekly, or Daily

5. **Set Loan Limits**:
   - Min Amount - e.g., 10,000
   - Max Amount - e.g., 500,000
   - Min Tenor - e.g., 3 months
   - Max Tenor - e.g., 24 months

6. **Add Fees** (optional):
   - Processing Fee - e.g., 2,000
   - Insurance Fee - e.g., 1,000

7. **Click**: "Create Product" button

8. **Verify**: The product should appear immediately in the grid below

---

## 🔐 Required Permissions

To manage loan products, users need:

- **View**: `viewDashboard` or `canAccessAdmin`
- **Create/Edit**: `manageProducts`
- **Delete**: `manageProducts`

Check your role in: `Admin → Staff Management → [Your User] → Role`

---

## 🎨 Visual Reference

When you see the Loan Products page, it should look like this:

```
┌─────────────────────────────────────────────────────┐
│  Loan Products                [Create New Product]  │
├─────────────────────────────────────────────────────┤
│  [Summary Cards: 3 products, 45 loans, etc.]       │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │Product 1 │  │Product 2 │  │Product 3 ��         │
│  │12% Int.  │  │15% Int.  │  │10% Int.  │         │
│  │[Details] │  │[Details] │  │[Details] │         │
│  │[Actions] │  │[Actions] │  │[Actions] │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 📅 Last Updated
December 29, 2025

## 🆘 Support
If you continue to experience issues, check:
1. Browser console for specific errors
2. Supabase dashboard for the raw data
3. Network tab in DevTools for failed API calls
