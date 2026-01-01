# 🚀 SmartLenderUp - Netlify Deployment Guide

Complete guide for deploying your SmartLenderUp platform to Netlify.

---

## 📋 Prerequisites

- [x] Node.js 18+ installed
- [x] npm 9+ installed
- [x] Git installed
- [x] GitHub account
- [x] Code pushed to GitHub
- [x] Supabase project created
- [x] 60 minutes available

---

## 🎯 Netlify vs Vercel

**Why Netlify is Great:**
- ✅ Generous free tier
- ✅ Easy deployment
- ✅ Excellent CDN
- ✅ Built-in forms
- ✅ Serverless functions
- ✅ Automatic HTTPS

**What You Get:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Serverless functions
- Form handling
- Identity/Auth

---

## 🔧 Phase 1: Netlify Functions Setup (15 minutes)

### Step 1.1: Update Project Structure for Netlify

Netlify uses a different folder structure for serverless functions. We need to create Netlify-compatible functions.

**Create Netlify functions directory:**

```bash
mkdir -p netlify/functions
```

### Step 1.2: Create Netlify Function Wrapper

Create a file at `netlify/functions/api.ts`:

```typescript
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Import your API routes
const authLogin = require('../../api/auth/login');
const authRegister = require('../../api/auth/register');
const loansCreate = require('../../api/loans/create');
const loansById = require('../../api/loans/[id]');
const mpesaSTK = require('../../api/mpesa/stk-push');
const mpesaCallback = require('../../api/mpesa/callback');

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const path = event.path.replace('/.netlify/functions/api', '');
  
  // Convert Netlify event to Vercel-like request
  const req = {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : {},
    query: event.queryStringParameters || {},
  };

  // Response builder
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      this.body = JSON.stringify(data);
      this.headers['Content-Type'] = 'application/json';
      return this;
    },
    setHeader: function(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    end: function() {
      return this;
    }
  };

  // Route to appropriate handler
  try {
    if (path === '/auth/login') {
      await authLogin.default(req, res);
    } else if (path === '/auth/register') {
      await authRegister.default(req, res);
    } else if (path === '/loans/create') {
      await loansCreate.default(req, res);
    } else if (path.startsWith('/loans/')) {
      const id = path.split('/')[2];
      req.query = { ...req.query, id };
      await loansById.default(req, res);
    } else if (path === '/mpesa/stk-push') {
      await mpesaSTK.default(req, res);
    } else if (path === '/mpesa/callback') {
      await mpesaCallback.default(req, res);
    } else {
      res.status(404).json({ error: 'Not found' });
    }

    return {
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body,
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
```

### Step 1.3: Verify netlify.toml Configuration

Check that your `netlify.toml` file exists and contains:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "npm run dev"
  port = 5173
  targetPort = 5173
  publish = "dist"
  autoLaunch = true
```

**What this does:**
- Sets build command to `npm run build`
- Publishes `dist` folder
- Routes `/api/*` to Netlify functions
- Enables SPA routing
- Sets Node.js version to 18

---

## 🚀 Phase 2: Deploy to Netlify (15 minutes)

### Step 2.1: Create Netlify Account

1. Go to https://www.netlify.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Netlify to access your GitHub

**Why GitHub?**
- Auto-deploy on git push
- Easy repository access
- Seamless integration

### Step 2.2: Create New Site

1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Authorize Netlify (if prompted)
4. Select your repository: `smartlenderup-platform`
5. Click on the repository

### Step 2.3: Configure Build Settings

**Basic Settings:**
- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

**Click "Show advanced" and verify:**
- Node version: 18

**Keep these defaults - they match your netlify.toml!**

### Step 2.4: Add Environment Variables

**CRITICAL STEP!**

Before deploying, add environment variables:

1. Click "Add environment variables"
2. Click "New variable" for each:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | From Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Service role key (keep secret!) |

**Optional (add later):**
| Variable Name | Value | Notes |
|---------------|-------|-------|
| `MPESA_ENV` | `sandbox` | M-Pesa environment |
| `MPESA_CONSUMER_KEY` | Your key | From Safaricom |
| `MPESA_CONSUMER_SECRET` | Your secret | From Safaricom |
| `MPESA_SHORTCODE` | `174379` | Sandbox shortcode |
| `MPESA_PASSKEY` | Your passkey | From Safaricom |
| `MPESA_CALLBACK_URL` | `https://your-site.netlify.app/api/mpesa/callback` | Update after deployment |
| `VITE_RESEND_API_KEY` | `re_...` | Email service (optional) |
| `VITE_FROM_EMAIL` | `noreply@smartlenderup.com` | Sender email |

**How to add:**
1. Enter **Key**: `VITE_SUPABASE_URL`
2. Enter **Value**: Your Supabase URL
3. Click "Create variable"
4. Repeat for all variables

**⚠️ IMPORTANT:**
- Copy values from your `.env` file
- Double-check spelling (case-sensitive)
- No quotes around values
- Service role key must be kept secret

### Step 2.5: Deploy Site

1. Click "Deploy smartlenderup-platform" (or similar)
2. **Wait 3-5 minutes** for deployment

**You'll see:**
```
Initializing...
Building...
├── Installing dependencies
├── Running build command
├── Optimizing files
└── Deploying to CDN
Success! ✓
```

### Step 2.6: Get Your Live URL

Once deployed, you'll get a URL like:
```
https://smartlenderup-platform.netlify.app
```

Or with random suffix:
```
https://amazing-curie-abc123.netlify.app
```

**Save this URL!**

---

## ✅ Phase 3: Post-Deployment Configuration (10 minutes)

### Step 3.1: Update M-Pesa Callback URL

If you're using M-Pesa:

1. Go to Netlify → Site settings → Environment variables
2. Find `MPESA_CALLBACK_URL`
3. Update to: `https://your-site.netlify.app/api/mpesa/callback`
4. Click "Save"
5. Trigger redeploy:
   - Deploys → Trigger deploy → Deploy site

### Step 3.2: Custom Domain (Optional)

**If you have a domain:**

1. Go to **Domain settings**
2. Click "Add custom domain"
3. Enter your domain: `smartlenderup.com`
4. Click "Verify"

**Netlify will show DNS records:**

**For Netlify DNS (Recommended):**
- Transfer your domain to Netlify DNS
- Automatic SSL
- Easiest setup

**For External DNS (Namecheap, GoDaddy, etc.):**

Add these records in your domain registrar:

**For root domain:**
- Type: `A`
- Name: `@`
- Value: `75.2.60.5` (Netlify's IP)

**For www:**
- Type: `CNAME`
- Name: `www`
- Value: `your-site.netlify.app`

**Wait 5-60 minutes for DNS propagation**

### Step 3.3: Enable HTTPS

Netlify automatically provisions SSL certificates!

1. Go to **Domain settings** → **HTTPS**
2. Wait 1-2 minutes
3. Certificate will be issued automatically
4. Your site will be `https://smartlenderup.com`

**✅ Done! HTTPS is active**

### Step 3.4: Set Site Name (Optional)

Change the random URL to something better:

1. Go to **Site settings** → **General** → **Site details**
2. Click "Change site name"
3. Enter: `smartlenderup` (if available)
4. New URL: `https://smartlenderup.netlify.app`

---

## 🧪 Phase 4: Test Production Deployment (10 minutes)

### Step 4.1: Test Frontend

**Open your Netlify URL in browser:**

```
https://your-site.netlify.app
```

**Test checklist:**
- [ ] Landing page loads
- [ ] Navigation works
- [ ] Sign Up modal opens
- [ ] Sign In modal opens
- [ ] Theme toggle works
- [ ] Mobile responsive (F12 → device toolbar)
- [ ] No console errors (F12 → Console)

### Step 4.2: Test User Registration

1. Click "Sign Up"
2. Choose "Individual"
3. Fill form:
   - Full Name: Production Test User
   - Email: prod-test@example.com
   - Phone: +254712345678
   - Password: TestProd123!
4. Submit

**Verify in Supabase:**
1. Go to Supabase dashboard
2. Table Editor → users
3. User should appear ✅

**✅ If user appears, registration works!**

### Step 4.3: Test Login

1. Go back to landing page
2. Click "Sign In"
3. Enter credentials:
   - Email: prod-test@example.com
   - Password: TestProd123!
4. Click "Sign In"

**You should:**
- See the portal dashboard
- Be logged in successfully

**✅ If you see portal, authentication works!**

### Step 4.4: Test API Endpoints

**Test with cURL:**

```bash
# Replace with your actual Netlify URL
NETLIFY_URL="https://your-site.netlify.app"

# Test registration API
curl -X POST $NETLIFY_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "Test123!",
    "full_name": "API Test User",
    "phone": "+254700000000",
    "role": "client"
  }'

# Expected response:
# {"success":true,"user":{...},"message":"Registration successful"}
```

**Test in browser console:**

1. Open your site
2. Press F12 → Console
3. Paste this code:

```javascript
fetch('https://your-site.netlify.app/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'browser-api-test@example.com',
    password: 'Test123!',
    full_name: 'Browser API Test',
    phone: '+254700000001',
    role: 'client'
  })
})
.then(r => r.json())
.then(data => console.log('✅ API works!', data))
.catch(err => console.error('❌ API error:', err));
```

**✅ If you see success response, API works!**

### Step 4.5: Check Netlify Logs

1. Go to Netlify dashboard
2. Click your site
3. Go to **Functions** tab
4. Look for `api` function
5. Click to see logs

**Check for:**
- ✅ No errors
- ✅ Function executions show up
- ✅ Response times < 1s

### Step 4.6: Test Complete User Flow

**Create Client → Apply for Loan → Verify Database:**

1. Login as admin: `admin@bvfunguo.com` / `admin123`
2. Go to "Clients" tab
3. Click "Add Client"
4. Fill details, submit
5. Go to Supabase → clients table → Client appears ✅
6. Switch to Client Portal
7. Go to "Apply" tab
8. Fill loan application
9. Submit
10. Go to Supabase → loans table → Loan appears ✅

**✅ If data appears in database, full stack works!**

---

## 🔄 Phase 5: Continuous Deployment (Automatic!)

### How It Works

```
You make changes locally
    ↓
git add .
git commit -m "Update feature"
git push origin main
    ↓
GitHub receives push
    ↓
Webhook triggers Netlify
    ↓
Netlify automatically:
├── Pulls latest code
├── Installs dependencies
├── Runs build
├── Deploys to CDN
└── Updates live site
    ↓
✅ Your site is updated!
(Takes 2-3 minutes)
```

### Making Updates

```bash
# 1. Make changes locally
# Edit files in your code editor

# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin main

# 5. Netlify auto-deploys!
# Check deploy progress in Netlify dashboard
# Live site updates in 2-3 minutes
```

---

## 🎯 Phase 6: Netlify-Specific Features

### 6.1: Form Handling (Built-in!)

Netlify has built-in form handling. You can use it for contact forms:

**Add to your HTML:**
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

**Netlify automatically:**
- Handles submissions
- Stores in dashboard
- Sends notifications
- No backend code needed!

### 6.2: Deploy Previews

Every pull request gets a preview URL!

**How to use:**
1. Create a new branch
2. Make changes
3. Push to GitHub
4. Create Pull Request
5. Netlify creates preview: `https://deploy-preview-123--your-site.netlify.app`
6. Test before merging!

### 6.3: Split Testing (A/B Testing)

Test different versions:

1. Go to **Split Testing**
2. Create branch: `feature-test`
3. Set traffic split: 50/50
4. Deploy both versions
5. See which performs better!

### 6.4: Analytics

Enable Netlify Analytics:

1. Go to **Analytics** tab
2. Click "Enable Analytics"
3. Cost: $9/month (optional)
4. Get insights:
   - Page views
   - Unique visitors
   - Top pages
   - Traffic sources
   - Bandwidth usage

---

## 🆘 Troubleshooting

### Issue: Build Fails

**Symptoms:**
- Deployment fails
- Red error in build log

**Solutions:**

1. **Check build log:**
   - Netlify → Deploys → Click failed deploy
   - Read error message

2. **Test build locally:**
   ```bash
   npm run build
   ```
   - Fix any errors that appear
   - Commit and push

3. **Common issues:**
   - Missing dependencies: Run `npm install`
   - TypeScript errors: Fix type issues
   - Environment variables: Check they're set

4. **Clear cache and retry:**
   - Deploys → Trigger deploy → Clear cache and deploy site

### Issue: Functions Not Working

**Symptoms:**
- API returns 404
- `/api/*` doesn't work

**Solutions:**

1. **Check functions directory:**
   ```bash
   ls -la netlify/functions
   ```
   - Should see `api.ts` or `api.js`

2. **Check netlify.toml:**
   ```toml
   [build]
     functions = "netlify/functions"
   ```

3. **Check redirects:**
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200
   ```

4. **View function logs:**
   - Functions tab → api → Recent logs

### Issue: Environment Variables Not Working

**Symptoms:**
- API can't connect to Supabase
- "undefined" errors

**Solutions:**

1. **Check variables are set:**
   - Site settings → Environment variables
   - Verify all required variables exist

2. **Check variable names:**
   - Frontend: Must start with `VITE_`
   - Backend: Any name
   - Case-sensitive!

3. **Redeploy after adding variables:**
   - Deploys → Trigger deploy → Deploy site

4. **Check spelling:**
   - `VITE_SUPABASE_URL` (not `VITE_SUPABASE_URI`)
   - `SUPABASE_SERVICE_ROLE_KEY` (exact spelling)

### Issue: Database Not Connected

**Symptoms:**
- Users not saving
- Login fails
- "Failed to fetch" errors

**Solutions:**

1. **Check Supabase project status:**
   - Supabase dashboard
   - Project should be "Active" (not paused)

2. **Verify credentials:**
   - Copy from Supabase → Settings → API
   - Paste into Netlify environment variables
   - Redeploy

3. **Check database tables:**
   - Table Editor → Should see 18 tables
   - If missing, run schema.sql again

4. **Test connection:**
   ```bash
   # In browser console
   console.log(import.meta.env.VITE_SUPABASE_URL);
   ```
   - Should show your Supabase URL

### Issue: Custom Domain Not Working

**Symptoms:**
- Domain shows error
- HTTPS not working

**Solutions:**

1. **Wait for DNS propagation:**
   - Can take up to 48 hours
   - Usually 15-30 minutes
   - Check: https://dnschecker.org

2. **Verify DNS records:**
   - Check in domain registrar
   - Should match Netlify's instructions

3. **Use Netlify DNS:**
   - Easiest option
   - Transfer domain to Netlify
   - Automatic configuration

4. **Check SSL certificate:**
   - Domain settings → HTTPS
   - Should say "Provisioned"
   - If not, click "Verify DNS configuration"

---

## 📊 Netlify Dashboard Overview

### Main Sections

**Site Overview:**
- Production URL
- Deploy status
- Recent activity
- Bandwidth usage

**Deploys:**
- All deployments
- Deploy previews
- Build logs
- Rollback option

**Functions:**
- Active functions
- Execution logs
- Usage metrics
- Error tracking

**Site Settings:**
- General (site name, domain)
- Build & deploy (build settings)
- Environment variables
- Domain management
- HTTPS/SSL

**Analytics (if enabled):**
- Traffic overview
- Top pages
- Sources
- Bandwidth

---

## 💰 Netlify Pricing

### Free Tier (Your Current Plan)
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Deploy previews
- ✅ Serverless functions (125k requests/month)
- ✅ Forms (100 submissions/month)

**Perfect for:**
- Development
- Small to medium projects
- 100-1,000 users
- Testing

### Pro Plan ($19/month)
- Everything in Free
- 1 TB bandwidth
- Unlimited build minutes
- Multiple team members
- Priority support

### Business Plan ($99/month)
- Everything in Pro
- SSO/SAML
- Role-based access
- SLA guarantee
- Dedicated support

**💡 Start with Free tier, upgrade as needed!**

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created (18 tables)
- [ ] netlify.toml configured
- [ ] Netlify functions created
- [ ] Netlify account created
- [ ] Site imported from GitHub
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Production URL working
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] Login works
- [ ] API endpoints respond
- [ ] Database connected
- [ ] No errors in logs
- [ ] Custom domain added (optional)
- [ ] HTTPS enabled

---

## 🎉 Success!

Your SmartLenderUp platform is now live on Netlify! 🚀

**What You Have:**
- ✅ Production URL: `https://your-site.netlify.app`
- ✅ Automatic deployments on git push
- ✅ HTTPS enabled
- ✅ CDN distribution worldwide
- ✅ Serverless functions working
- ✅ Database connected
- ✅ Full-stack application live

**Next Steps:**
1. Change default admin password
2. Test all features
3. Add custom domain (optional)
4. Enable M-Pesa (add credentials)
5. Set up email notifications
6. Start onboarding customers!

---

## 📞 Support

**Netlify Resources:**
- Docs: https://docs.netlify.com
- Community: https://answers.netlify.com
- Status: https://status.netlify.com
- Support: https://www.netlify.com/support

**Platform Resources:**
- Backend Setup: `/BACKEND_SETUP.md`
- API Testing: `/API_TESTING.md`
- Architecture: `/SYSTEM_ARCHITECTURE.md`

---

**Congratulations! Your platform is live on Netlify! 🎊**

**Start accepting loan applications today!** 🚀
