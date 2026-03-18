# Debug: Landing Page Not Showing

## What Should Happen

When you log in (or when auto-login is disabled), you should see:
1. **Login Page** (if not authenticated)
2. **Landing Page** (brown/warm colored MotherCompanyHome) if authenticated but no platform selected
3. **Dashboard** (after selecting a platform)

## Current Flow in App.tsx

```
Line 450-459: isLoading = true → Show loading spinner
Line 477-484: !isAuthenticated → Show LoginPage
Line 488-501: !currentPlatform → Show MotherCompanyHome (LANDING PAGE)
Line 511+: currentPlatform exists → Show Dashboard
```

## Debugging Steps

### Step 1: Check Console Logs
Open your browser console (F12) and look for these messages:

- `🏠 [App] Authenticated - showing landing page` ← Should see this if landing page is rendering
- `🔍 [App] Current State:` ← Shows current authentication state
- `🔐 [App] Not authenticated - showing login page` ← Shows login page

### Step 2: Check Current State
In the browser console, type:
```javascript
window.debugAuthState()
```

This will show you:
- Is Authenticated
- Is Loading
- Current User
- localStorage data

### Step 3: Force Landing Page
If you're stuck, try this in console:
```javascript
// Clear platform selection to force landing page
localStorage.removeItem('currentPlatform');
location.reload();
```

### Step 4: Check for Blocking Overlays
The landing page might be rendering but covered by:
1. A stuck modal overlay
2. A diagnostic component auto-showing
3. A blur overlay from a dropdown

In console, check:
```javascript
// Check if any modals are open
document.querySelectorAll('[class*="fixed"][class*="inset"]').length
```

### Step 5: Check currentPlatform State
In console:
```javascript
// This should be null to show landing page
console.log(localStorage.getItem('currentPlatform'));
```

## Quick Fixes

### Fix 1: Clear All State
```javascript
// Clear everything and reload
localStorage.clear();
location.reload();
```

### Fix 2: Force Landing Page View
```javascript
// Set authenticated but no platform
localStorage.setItem('bvfunguo_user', JSON.stringify({
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Admin User',
  email: 'admin@smartlenderup.com',
  phone: '0700000000',
  role: 'Admin',
  userType: 'admin',
  organizationId: '00000000-0000-0000-0000-000000000001',
  username: 'admin'
}));
localStorage.removeItem('currentPlatform');
location.reload();
```

## What I See in Your Screenshot

The screenshot would help me understand:
- Is the page completely white/blank?
- Is there any content showing?
- Is there a loading spinner?
- Are there any console errors?

## Most Likely Causes

1. **Auto-login is creating platform selection** - The auto-login code was setting `currentPlatform('smartlenderup')` which skips the landing page
2. **Landing page is rendering but invisible** - Check CSS/styles
3. **Modal/overlay is blocking the view** - Check for stuck overlays
4. **JavaScript error preventing render** - Check console for errors

## Tell Me More

1. What do you see on screen? (blank, loading, partial content?)
2. What console logs do you see?
3. Did you just log in or refresh the page?
4. Have you logged in before on this browser?
