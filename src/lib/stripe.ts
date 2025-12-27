import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../stripe-config';

// Load Stripe with the publishable key from configuration
export const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);