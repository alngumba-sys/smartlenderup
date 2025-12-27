# Quick Start Guide - SmartLenderUp

## Getting Started with Sample Data

If you see an empty dashboard with no clients or loans, you can quickly populate sample data for testing.

### Option 1: Browser Console (Recommended)
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Type one of these commands:

#### Populate Sample Data
```javascript
populateSampleData()
```
This will create:
- 3 loan products (Business Loan, Personal Loan, Emergency Loan)
- 5 sample clients
- 5 active loans with repayment history
- Sample repayment records

#### Reset Database (Clear All Data)
```javascript
resetDatabase()
```
This will completely clear all data and start fresh.

### What Gets Created

**Loan Products:**
- Business Loan (10K - 500K, 12% interest)
- Personal Loan (5K - 200K, 15% interest)
- Emergency Loan (2K - 50K, 18% interest)

**Sample Clients:**
- Sarah Mwangi
- James Omondi
- Grace Njeri
- Peter Kamau
- Mary Achieng

**Active Loans:**
- 5 loans in active repayment status
- Various amounts and terms
- Realistic repayment schedules

### Default Login Credentials

**Super Admin:**
- Username: `superadmin`
- Password: `SuperAdmin@123`
- Access: Click the logo 5 times on the login page

**Regular Staff:**
- Register a new organization or individual account through the registration flow

### Notes
- All sample data is stored in browser localStorage
- Clearing browser data will remove all information
- The system uses Kenya (KES) as the default currency
- You can change country/currency during organization registration
