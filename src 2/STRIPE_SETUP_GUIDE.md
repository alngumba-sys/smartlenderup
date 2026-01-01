# Stripe Payment Integration - Setup Guide

## 🎯 Overview
This platform is integrated with Stripe for secure payment processing. Follow these steps to activate live payments.

---

## 📋 Prerequisites
- Stripe account (sign up at https://stripe.com)
- Supabase project (for backend API)
- Organization ID from your database

---

## 🔑 Step 1: Get Stripe API Keys

1. **Sign up for Stripe:**
   - Go to https://dashboard.stripe.com/register
   - Complete account verification

2. **Get your API keys:**
   - Navigate to https://dashboard.stripe.com/apikeys
   - You'll see two types of keys:
     - **Publishable key** (pk_test_... or pk_live_...)
     - **Secret key** (sk_test_... or sk_live_...)

3. **Test Mode vs Live Mode:**
   - Start with **Test Mode** keys for development
   - Switch to **Live Mode** keys only after testing

---

## 🔧 Step 2: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Stripe Keys (Test Mode)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Supabase (if not already configured)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**⚠️ SECURITY WARNING:**
- Never commit secret keys to Git
- Add `.env` to your `.gitignore`
- Use environment variables in production

---

## 🚀 Step 3: Create Backend API (Supabase Edge Function)

### Option A: Supabase Edge Function (Recommended)

1. **Install Supabase CLI:**
```bash
npm install -g supabase
supabase login
```

2. **Create the function:**
```bash
supabase functions new create-payment-intent
```

3. **Add this code to `supabase/functions/create-payment-intent/index.ts`:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { organizationId, amount, currency, metadata } = await req.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        organizationId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

4. **Deploy the function:**
```bash
supabase functions deploy create-payment-intent
```

5. **Set the secret key:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
```

---

## 🔄 Step 4: Update Frontend API Endpoint

Update `/components/StripePayment.tsx` line ~130:

```typescript
const response = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-payment-intent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      organizationId,
      amount: monthlyPrice * 100,
      currency: currency.toLowerCase(),
      metadata: {
        organizationId,
        organizationName,
        subscriptionPlan: 'monthly',
      },
    }),
  }
);
```

---

## 🪝 Step 5: Set Up Stripe Webhooks (Production)

Webhooks confirm payments server-side for security.

1. **Create webhook endpoint:**
```bash
supabase functions new stripe-webhook
```

2. **Add webhook handler code:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const organizationId = paymentIntent.metadata.organizationId

      // Update database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const now = new Date()
      const trialEndDate = new Date(now)
      trialEndDate.setDate(trialEndDate.getDate() + 30)

      await supabase
        .from('organizations')
        .update({
          payment_status: 'paid',
          subscription_status: 'active',
          trial_end_date: trialEndDate.toISOString(),
          last_payment_date: now.toISOString(),
        })
        .eq('id', organizationId)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
```

3. **Deploy webhook:**
```bash
supabase functions deploy stripe-webhook
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

4. **Configure in Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
   - Select events: `payment_intent.succeeded`
   - Copy the signing secret and add it to Supabase secrets

---

## 🧪 Step 6: Test Payments

### Stripe Test Cards:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0025 0000 3155
- **Exp Date:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Testing Flow:
1. Go to Settings → Payment tab (as Manager)
2. Click "Proceed to Pay $99"
3. Enter test card: 4242 4242 4242 4242
4. Complete payment
5. Verify subscription status updates
6. Confirm settings are unlocked

---

## 🔐 Security Best Practices

✅ **DO:**
- Use environment variables for all keys
- Validate payments server-side with webhooks
- Use HTTPS in production
- Implement rate limiting on API endpoints
- Log payment events for auditing

❌ **DON'T:**
- Hardcode API keys in source code
- Trust client-side payment confirmations alone
- Expose secret keys in frontend code
- Skip webhook signature verification

---

## 💰 Pricing Configuration

Current setup: **$99/month subscription**

To change pricing:
1. Update `monthlyPrice` in `/components/StripePayment.tsx` (line ~29)
2. Consider creating Stripe Products/Prices in dashboard
3. Use Price IDs for subscription-based billing

---

## 📊 Database Schema

Ensure these columns exist in your `organizations` table:

```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;
```

---

## 🆘 Troubleshooting

### Issue: "Failed to create payment intent"
- Check backend API is deployed
- Verify Stripe secret key is set
- Check network tab for API errors

### Issue: Payment succeeds but database not updated
- Verify webhook is configured
- Check webhook signing secret
- Review Supabase function logs

### Issue: "Invalid API key"
- Ensure you're using the correct key (test/live)
- Regenerate keys if compromised
- Check environment variables are loaded

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Testing](https://stripe.com/docs/testing)

---

## ✅ Production Checklist

Before going live:
- [ ] Switch to Live API keys
- [ ] Update webhook endpoints
- [ ] Test with real payment method
- [ ] Enable production mode in Stripe dashboard
- [ ] Set up payment failure notifications
- [ ] Configure automatic subscription renewal
- [ ] Add receipt email functionality
- [ ] Implement refund handling
- [ ] Add payment history page
- [ ] Set up monitoring and alerts

---

## 🎉 You're All Set!

Your Stripe integration is now configured. Test thoroughly in test mode before switching to live mode.

For support:
- Stripe Support: https://support.stripe.com
- Platform Support: support@smartlenderup.com
