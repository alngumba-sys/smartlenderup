# 🚀 Stripe Payment Setup - Quick Start Guide

## ✅ Real Stripe Integration is Ready!

Your platform is now configured to process **real Stripe payments**. Follow these simple steps to activate it:

---

## 📝 Step 1: Get Your Stripe Keys (5 minutes)

### 1.1 Create/Login to Stripe Account
- Go to: **https://dashboard.stripe.com/**
- Sign up or log in

### 1.2 Get Your API Keys
- Navigate to: **Developers → API Keys**
- Direct link: **https://dashboard.stripe.com/apikeys**

You'll see two keys:

| Key Type | Format | Use |
|----------|--------|-----|
| **Publishable Key** | `pk_test_...` or `pk_live_...` | Frontend (safe to expose) |
| **Secret Key** | `sk_test_...` or `sk_live_...` | Backend (must be kept secure) |

### 1.3 Copy Both Keys
- Click "Reveal test key" for the Secret Key
- Copy both keys to your clipboard

---

## 🔧 Step 2: Add Keys to Configuration (2 minutes)

### 2.1 Open Configuration File
Open the file: **`/stripe-config.ts`**

### 2.2 Replace Placeholder Values
Find these lines:
```typescript
publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
secretKey: 'sk_test_YOUR_SECRET_KEY_HERE',
```

Replace with your actual keys:
```typescript
publishableKey: 'pk_test_51A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
secretKey: 'sk_test_51A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
```

### 2.3 Save the File
Save `/stripe-config.ts` and you're done!

---

## 🎉 Step 3: Test Payment (1 minute)

### 3.1 Start Payment Flow
1. Click **"Pay Now"** in the trial banner
2. Click **"Proceed to Pay $99"**
3. You'll see the Stripe payment form

### 3.2 Use Test Card
Stripe provides test cards that simulate real payments:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 9995` | ❌ Declined (insufficient funds) |
| `4000 0025 0000 3155` | ⚠️ Requires 3D Secure authentication |

**Full Test Details:**
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### 3.3 Process Test Payment
1. Enter test card: `4242 4242 4242 4242`
2. Enter expiry: `12/25`
3. Enter CVC: `123`
4. Click **"Pay $99.00"**
5. ✅ Payment should process successfully!

---

## 🔍 What Happens After Payment?

### Immediate Effects:
- ✅ Payment processed through Stripe
- ✅ Database updated with payment status
- ✅ Trial days extended (30 days + remaining trial)
- ✅ All features unlocked
- ✅ Settings become accessible
- ✅ Payment success notification shown

### Database Updates:
```sql
UPDATE organizations
SET 
  payment_status = 'paid',
  subscription_status = 'active',
  trial_end_date = trial_end_date + 30 days
WHERE id = your_organization_id;
```

---

## 📊 View Payments in Stripe Dashboard

### Monitor Transactions:
1. Go to: **https://dashboard.stripe.com/payments**
2. See all test payments in real-time
3. View payment details, customer info, metadata
4. Test refunds and disputes

### Payment Details Include:
- Amount: $99.00
- Currency: USD
- Organization ID
- Organization Name
- Subscription Plan: Monthly

---

## 🔐 Security Best Practices

### ✅ Do's:
- ✅ Start with **TEST** keys (`pk_test_...` / `sk_test_...`)
- ✅ Keep secret key secure
- ✅ Test thoroughly before going live
- ✅ Monitor Stripe dashboard regularly

### ❌ Don'ts:
- ❌ Don't commit secret keys to Git
- ❌ Don't share secret keys publicly
- ❌ Don't use live keys until ready for production
- ❌ Don't skip testing with test cards

---

## 🚀 Going Live (When Ready)

### Switch to Live Mode:
1. Activate your Stripe account (complete business verification)
2. Get **LIVE** keys from: https://dashboard.stripe.com/apikeys
3. Toggle to "Live mode" in Stripe dashboard
4. Copy new keys:
   - `pk_live_...` (Publishable)
   - `sk_live_...` (Secret)
5. Update `/stripe-config.ts` with live keys
6. Test with real card (small amount first!)
7. 🎉 You're processing real payments!

---

## 🆘 Troubleshooting

### Issue: "Demo mode - Stripe keys not configured"
**Solution:** Update `/stripe-config.ts` with your actual Stripe keys

### Issue: Payment fails with "Invalid API key"
**Solutions:**
- Check key format (starts with `pk_test_` or `sk_test_`)
- Verify keys are from the same Stripe account
- Make sure test/live modes match
- Copy entire key (no spaces or extra characters)

### Issue: "Your card was declined"
**Solutions:**
- Use test card: `4242 4242 4242 4242`
- Check card number is correct
- Verify expiry is future date
- Try different test card from Stripe docs

### Issue: Payment processes but database doesn't update
**Solutions:**
- Check browser console for errors
- Verify organization ID is correct
- Check Supabase connection
- Review Supabase logs

---

## 📚 Resources

- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Stripe Docs:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing
- **API Reference:** https://stripe.com/docs/api

---

## ✅ Quick Checklist

Before processing payments, make sure:

- [ ] Stripe account created
- [ ] Test API keys obtained
- [ ] `/stripe-config.ts` updated with real keys
- [ ] File saved
- [ ] Test payment with `4242 4242 4242 4242` successful
- [ ] Payment appears in Stripe dashboard
- [ ] Database updated correctly
- [ ] Features unlocked after payment

---

## 🎯 Current Configuration

**File Location:** `/stripe-config.ts`

**Keys to Update:**
```typescript
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_YOUR_KEY_HERE', // ← Update this
  secretKey: 'sk_test_YOUR_KEY_HERE',     // ← Update this
  // ... rest of config is ready
};
```

---

## 💡 Pro Tips

1. **Start Small:** Test with $1.00 first, then increase to $99
2. **Monitor Dashboard:** Keep Stripe dashboard open during testing
3. **Check Logs:** Browser console shows helpful debug info
4. **Use Webhooks:** (Advanced) Set up webhooks for automatic updates
5. **Save Test Cards:** Bookmark Stripe's test card page for reference

---

## 🎉 You're All Set!

Once you update `/stripe-config.ts` with your Stripe keys:
- ✅ Real payments will process automatically
- ✅ Stripe handles all payment security
- ✅ Database updates in real-time
- ✅ Users get instant access after payment

**Need help?** Check the troubleshooting section above or contact Stripe support.

---

**Last Updated:** December 2024
**Platform:** SmartLenderUp Microfinance Platform
**Payment Provider:** Stripe
