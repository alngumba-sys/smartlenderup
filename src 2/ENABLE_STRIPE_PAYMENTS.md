# 🚀 How to Enable Real Stripe Payments

## Current Status
✅ **Demo Mode** - Payment button works but simulates payments
🎯 **Goal** - Enable real Stripe payment processing

---

## Option 1: Quick Test with Stripe Test Mode (Recommended First)

### Step 1: Get Stripe Test Keys (2 minutes)
1. Go to https://dashboard.stripe.com/register (create free account)
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy both keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Step 2: Create .env File (1 minute)
1. Copy `.env.example` to `.env` in your project root
2. Add your keys:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QaBcDeFgHiJk...
VITE_STRIPE_API_ENDPOINT=https://your-project.supabase.co/functions/v1/create-payment-intent
```

### Step 3: Create Supabase Edge Function (5 minutes)

**A. Install Supabase CLI:**
```bash
npm install -g supabase
supabase login
```

**B. Link your project:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

**C. Create the payment function:**
```bash
mkdir -p supabase/functions/create-payment-intent
```

**D. Create file `supabase/functions/create-payment-intent/index.ts`:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { organizationId, amount, currency, metadata } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: { organizationId, ...metadata },
      automatic_payment_methods: { enabled: true },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

**E. Deploy the function:**
```bash
supabase functions deploy create-payment-intent
```

**F. Set your Stripe secret key:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

### Step 4: Update Your .env File
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_STRIPE_API_ENDPOINT=https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-payment-intent
```

### Step 5: Restart Your App
```bash
# Stop your app and restart it to load new environment variables
npm run dev
```

### Step 6: Test Payment
1. Login as Manager
2. Go to Settings → Payment tab
3. Click "Proceed to Pay $99"
4. Use test card: **4242 4242 4242 4242**
5. Expiry: Any future date (12/34)
6. CVC: Any 3 digits (123)
7. Click "Pay Now"

✅ **Success!** Your database should update and settings unlock!

---

## Option 2: Simple Backend API (Alternative)

If you have your own backend server:

### Create API Endpoint: `/api/create-payment-intent`

**Node.js/Express Example:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { organizationId, amount, currency, metadata } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: { organizationId, ...metadata },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

Then update your `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_STRIPE_API_ENDPOINT=https://yourdomain.com/api/create-payment-intent
```

---

## 🧪 Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Card Declined |
| 4000 0025 0000 3155 | 🔐 Requires Authentication |

**For all test cards:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## 🔍 Troubleshooting

### "Pay Now" button shows demo mode
✅ This is expected until you set up the backend API

### Error: "Failed to create payment intent"
- Check your `VITE_STRIPE_API_ENDPOINT` is correct
- Verify Supabase function is deployed
- Check browser console for detailed error

### Payment succeeds but database not updated
- Check CheckoutForm.tsx `handlePaymentSuccess` function
- Verify organization ID is correct
- Check browser console logs

### Environment variables not loading
- Restart your development server
- Check `.env` file is in project root
- Variables must start with `VITE_` for Vite projects

---

## 📊 What Happens After Payment

1. ✅ Payment processes through Stripe
2. ✅ Database updates with payment status
3. ✅ Trial days extended by 30 days
4. ✅ All settings unlock for all users
5. ✅ Success toast notification appears
6. ✅ Page auto-refreshes

---

## 💡 Quick Tips

- **Always test in Test Mode first** (keys starting with `pk_test_` and `sk_test_`)
- **Never commit `.env` file** (add to `.gitignore`)
- **Check Stripe Dashboard** to see test payments: https://dashboard.stripe.com/test/payments
- **Monitor logs** in browser console for debugging

---

## 🎯 Summary

**Demo Mode** → Real Payments requires:
1. ✅ Stripe account (free)
2. ✅ Backend API endpoint (Supabase function)
3. ✅ Environment variables (.env file)

**Total Setup Time:** ~10-15 minutes

---

## 📚 Need More Help?

- Full Guide: See `/STRIPE_SETUP_GUIDE.md`
- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs/guides/functions

---

## ⚡ Pro Tip

Start with **Test Mode** and only switch to **Live Mode** (real money) after you've tested thoroughly!

Good luck! 🚀
