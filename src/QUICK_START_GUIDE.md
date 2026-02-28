# 🚀 Quick Start Guide - New Features

## 1️⃣ Setting Up Client Login (2 minutes)

### Step 1: Set Client Password
1. Navigate to **Admin → Clients** tab
2. Click on any client
3. Scroll to **"Client Portal"** section
4. Enter a password (e.g., "1234")
5. Click **"Set Password"**
6. ✅ Success! Note shown: "Password set for [Client Name]"

### Step 2: Client Login
1. Click **"Client Login"** button in top navigation
2. Enter client's phone number **last 4 digits** (e.g., if phone is +254712345678, enter 5678)
3. Enter the password you just set
4. Click **"Login"**
5. ✅ You're now in the client portal!

---

## 2️⃣ Client Applies for Loan (1 minute)

### As Client:
1. In Client Portal, click **"Apply for Loan"** tab
2. Select a **Loan Product** from dropdown
3. Enter **Requested Amount**
4. Enter **Loan Purpose** (e.g., "Business expansion")
5. Click **"Submit Application"**
6. ✅ Success toast: "Application submitted!"

### What Happens:
- ✅ Loan created with status **"Pending"**
- ✅ Admin notification created automatically
- ✅ Visible in client's "My Loans" tab

---

## 3️⃣ Admin Reviews Application (1 minute)

### Step 1: View Notification
1. Navigate to **Admin → Notifications**
2. You'll see: **"New Loan Application"** notification
3. Shows client name, loan amount, product
4. Badge: **"Action Required"**

### Step 2: Take Action
**Option A - Review:**
1. Click **"Review"** button
2. Add optional notes (e.g., "Checking credit history")
3. Click **"Confirm Review"**
4. ✅ Loan status → "Under Review"
5. ✅ Client gets notification: "Application Under Review"

**Option B - Decline:**
1. Click **"Decline"** button
2. Add reason (e.g., "Insufficient credit score")
3. Click **"Confirm Decline"**
4. ✅ Loan status → "Declined"
5. ✅ Client gets notification: "Application Declined" + reason

---

## 4️⃣ Assign Staff to Loan (30 seconds)

### When Creating New Loan:
1. Navigate to **Operations → Loans**
2. Click **"+ New Loan"**
3. Fill in client, product, amount
4. Find **"Staff Member"** dropdown
5. Select staff member (e.g., "John Doe")
6. Click **"Create Loan"**
7. ✅ Loan assigned to selected staff!

### When Editing Existing Loan:
1. Click **"Edit"** on any loan
2. Change **"Staff Member"** dropdown
3. Click **"Update Loan"**
4. ✅ Staff assignment updated!

---

## 5️⃣ Track Commissions (30 seconds)

### View Staff Commissions:
1. Navigate to **Management → Payroll**
2. Click **"Commissions"** tab
3. Select **Staff Member** from dropdown
4. Review table showing:
   - All loans assigned to this staff
   - Loan amounts
   - Commission per loan
   - Total commission earned

### Customize Commission Rate:
1. Change **"Commission Rate"** (default 2%)
2. Click **"Update Rate"**
3. ✅ Total recalculates automatically!

---

## 🎯 Common Use Cases

### Use Case 1: End-to-End Client Application
```
1. Client calls → You set their password
2. Client logs in from their phone
3. Client applies for loan
4. You get notification
5. You review → Approve in 5-phase workflow
6. Client gets approval notification
```

### Use Case 2: Track Staff Performance
```
1. Assign staff to each loan when creating
2. At month-end, go to Payroll → Commissions
3. Select each staff member
4. Review their loans and commission
5. Export for payroll processing
```

### Use Case 3: Bulk Loan Review
```
1. Admin → Notifications
2. Filter by "client_application" category
3. Filter by "Unread"
4. Review each application one by one
5. Use Review/Decline buttons
6. Mark all as read when done
```

---

## 🔍 Where to Find Things

| Feature | Navigation Path |
|---------|----------------|
| **Client Login** | Top navigation → "Client Login" button |
| **Set Client Password** | Admin → Clients → Select client → Client Portal section |
| **Notifications** | Admin → Notifications |
| **Assign Staff** | Operations → Loans → New/Edit Loan → Staff Member dropdown |
| **Commissions** | Management → Payroll → Commissions tab |
| **View as Client** | Login as client → My Loans / Apply for Loan tabs |

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Client can login with last 4 digits + password
- [ ] Client can view their loans
- [ ] Client can apply for new loan
- [ ] Admin receives notification when client applies
- [ ] Admin can Review or Decline from notification
- [ ] Client receives status update notification
- [ ] Staff can be assigned to loans
- [ ] Commissions calculated correctly
- [ ] All data saved to Supabase

---

## 🆘 Troubleshooting

### "Invalid credentials" when client tries to login
**Solution:** 
1. Go to Admin → Clients
2. Find the client
3. Set their password again
4. Make sure phone number matches

### Notification not showing
**Solution:**
1. Check browser console for errors
2. Refresh the page
3. Go to Notifications tab directly via Admin → Notifications

### Staff member not in dropdown
**Solution:**
1. Check that staff member exists in Settings → Staff Management
2. Make sure they're active (not archived)
3. Refresh the page

### Commission not calculating
**Solution:**
1. Make sure loan has staff_member_id assigned
2. Check that loan status is active (Disbursed/Active)
3. Verify commission rate is set (default 2%)

---

## 📊 Sample Test Data

### Test Client
- Name: John Doe
- Phone: +254712345678
- Last 4 digits: **5678**
- Password: **1234**

### Test Loan Application
- Product: Business Loan
- Amount: 50,000 KES
- Purpose: Expand retail store
- Expected Status: Pending → Under Review → Approved

### Test Staff Assignment
- Staff: Jane Smith (ID: STF001)
- Loans: 5 loans @ 100,000 KES each
- Commission Rate: 2%
- Expected Commission: 10,000 KES (2% of 500,000)

---

**Ready to go! 🚀**

All features are live and working. If you encounter any issues, check the browser console or refer to `/IMPLEMENTATION_SUMMARY.md` for detailed technical information.
