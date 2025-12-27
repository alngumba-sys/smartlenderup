# SmartLenderUp Login Guide

## ✅ Authentication Flow (BEST PRACTICE)

Your platform now uses **Supabase-first authentication** with localStorage fallback for offline mode.

### How It Works

1. **Primary**: Checks Supabase database (source of truth)
2. **Fallback**: Checks localStorage (offline mode only)
3. **Auto-sync**: Caches Supabase data to localStorage on successful login

---

## 🔐 Login Credentials

### Option 1: Your Organization from Supabase
Based on your screenshot, your organization credentials are:

- **Email**: `bidhaa@bidhaavibes.com` OR `brian@bidhaavibes.com`
- **Password**: The password you entered during registration (e.g., `Test@1234`)

### Option 2: Demo Accounts

**Admin Account** (for testing):
- Username: `12345`
- Password: `Test@1234`

**Employee Account** (for testing):
- Username: `employee@bvfunguo.co.ke`
- Password: `Employee@123`

---

## 🚀 How to Login

1. Go to login page
2. Enter your **organization email** (either main or contact email)
3. Enter your **password**
4. Click **Login**

The system will:
- ✅ Check Supabase first
- ✅ Cache your organization data locally
- ✅ Show success toast with your organization name
- ✅ Fall back to offline mode if no internet

---

## 🔍 Debug Tools

### Check Organizations in Database
```javascript
window.debugOrgs()
```

### Fix LocalStorage Structure
```javascript
window.fixLocalStorage()
```

---

## 📝 For New Organizations

When registering a new organization:
1. Fill out the registration form
2. Organization saves to **Supabase** (primary database)
3. Organization saves to **localStorage** (cache)
4. Use the **contact email** and password to login

---

## 🎯 Benefits of Supabase-First

✅ **Single source of truth** - All data in database
✅ **Multi-device support** - Login from anywhere
✅ **Offline capability** - Works without internet
✅ **Auto-sync** - Always up-to-date
✅ **Enterprise-ready** - Production best practice

---

## 🆘 Troubleshooting

If login fails:
1. Check console (F12) for detailed logs
2. Verify your credentials in Supabase dashboard
3. Try running `window.debugOrgs()` to see cached data
4. Check network tab for Supabase connection

Console will show:
- 🔐 Authentication attempt
- ✅ Organization found (Supabase or localStorage)
- ❌ Invalid credentials
- ⚠️ Offline mode activated
