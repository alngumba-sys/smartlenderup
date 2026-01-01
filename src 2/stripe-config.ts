/**
 * Stripe Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your Stripe keys from https://dashboard.stripe.com/apikeys
 * 2. Replace the placeholder values below with your actual keys
 * 3. Start with TEST keys (pk_test_... and sk_test_...)
 * 4. Switch to LIVE keys only after testing
 */

export const STRIPE_CONFIG = {
  // Frontend: Publishable Key (safe to expose in browser)
  // Get from: https://dashboard.stripe.com/apikeys
  publishableKey: 'pk_test_PLACEHOLDER_KEY_NOT_CONFIGURED',
  
  // Backend: Secret Key (MUST be kept secure - used server-side only)
  // Get from: https://dashboard.stripe.com/apikeys
  // ⚠️ WARNING: Never commit this to Git in production!
  secretKey: 'sk_test_PLACEHOLDER_KEY_NOT_CONFIGURED',
  
  // Payment Configuration
  pricing: {
    monthly: {
      amount: 99, // $99 per month
      currency: 'USD',
      description: 'SmartLenderUp Monthly Subscription',
    },
  },
};

// Validate configuration
export function validateStripeConfig(): { isValid: boolean; message: string } {
  if (!STRIPE_CONFIG.publishableKey || 
      STRIPE_CONFIG.publishableKey === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE' ||
      STRIPE_CONFIG.publishableKey === 'pk_test_PLACEHOLDER_KEY_NOT_CONFIGURED') {
    return {
      isValid: false,
      message: 'Stripe Publishable Key not configured. Please update /stripe-config.ts',
    };
  }
  
  if (!STRIPE_CONFIG.secretKey || 
      STRIPE_CONFIG.secretKey === 'sk_test_YOUR_SECRET_KEY_HERE' ||
      STRIPE_CONFIG.secretKey === 'sk_test_PLACEHOLDER_KEY_NOT_CONFIGURED') {
    return {
      isValid: false,
      message: 'Stripe Secret Key not configured. Please update /stripe-config.ts',
    };
  }
  
  // Validate key format
  if (!STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
    return {
      isValid: false,
      message: 'Invalid Publishable Key format. Must start with pk_test_ or pk_live_',
    };
  }
  
  if (!STRIPE_CONFIG.secretKey.startsWith('sk_')) {
    return {
      isValid: false,
      message: 'Invalid Secret Key format. Must start with sk_test_ or sk_live_',
    };
  }
  
  return {
    isValid: true,
    message: 'Stripe configuration is valid',
  };
}