/**
 * Stripe Payment Intent Creation API
 * 
 * This simulates a backend API endpoint for creating Stripe payment intents.
 * In a production environment, this would be a proper backend API (Node.js, Supabase Edge Function, etc.)
 * 
 * For this implementation, we'll use client-side Stripe.js directly with the secret key
 * stored in stripe-config.ts
 * 
 * ⚠️ SECURITY NOTE:
 * This approach is for demo/development only. In production, you should:
 * 1. Use a proper backend API (Node.js, Supabase, etc.)
 * 2. Never expose secret keys in frontend code
 * 3. Validate all inputs server-side
 */

import { STRIPE_CONFIG } from '../stripe-config';

interface CreatePaymentIntentRequest {
  organizationId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Creates a Stripe Payment Intent
 * This function will be called by the frontend to initiate payment
 */
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  try {
    // In a real backend, this would use the Stripe Node.js SDK
    // For now, we'll use the Stripe REST API directly
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_CONFIG.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: request.amount.toString(),
        currency: request.currency.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        'metadata[organizationId]': request.organizationId,
        ...Object.fromEntries(
          Object.entries(request.metadata || {}).map(([key, value]) => [
            `metadata[${key}]`,
            value,
          ])
        ),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create payment intent');
    }

    const paymentIntent = await response.json();

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}
