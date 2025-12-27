import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { CheckoutForm } from './CheckoutForm';
import { Check, AlertCircle, Building, Calendar, CreditCard, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getOrganizationName } from '../utils/organizationUtils';
import { STRIPE_CONFIG, validateStripeConfig } from '../stripe-config';
import { createPaymentIntent } from '../api/create-payment-intent';

interface StripePaymentProps {
  organizationId: string;
  onPaymentSuccess?: () => void;
}

export function StripePayment({ organizationId, onPaymentSuccess }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number;
    trialEndDate: string;
    subscriptionStatus: string;
    paymentStatus: string;
  } | null>(null);

  const organizationName = getOrganizationName();
  
  // Pricing
  const monthlyPrice = 99; // $99/month
  const currency = 'USD';

  useEffect(() => {
    fetchTrialInfo();
  }, [organizationId]);

  const fetchTrialInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('trial_start_date, trial_end_date, subscription_status, payment_status, created_at')
        .eq('id', organizationId)
        .single();

      if (error) {
        // Fall back to calculating from created_at
        if (error.code === '42703') {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('created_at')
            .eq('id', organizationId)
            .single();
          
          if (orgData?.created_at) {
            const createdDate = new Date(orgData.created_at);
            const trialEndDate = new Date(createdDate);
            trialEndDate.setDate(trialEndDate.getDate() + 14);
            
            const now = new Date();
            const diffTime = trialEndDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setTrialInfo({
              daysRemaining: diffDays,
              trialEndDate: trialEndDate.toISOString(),
              subscriptionStatus: 'trial',
              paymentStatus: 'pending',
            });
          }
        }
        return;
      }

      if (data && data.trial_end_date) {
        const endDate = new Date(data.trial_end_date);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setTrialInfo({
          daysRemaining: diffDays,
          trialEndDate: data.trial_end_date,
          subscriptionStatus: data.subscription_status || 'trial',
          paymentStatus: data.payment_status || 'pending',
        });
      } else if (data && data.created_at) {
        const createdDate = new Date(data.created_at);
        const trialEndDate = new Date(createdDate);
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        
        const now = new Date();
        const diffTime = trialEndDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setTrialInfo({
          daysRemaining: diffDays,
          trialEndDate: trialEndDate.toISOString(),
          subscriptionStatus: data.subscription_status || 'trial',
          paymentStatus: data.payment_status || 'pending',
        });
      }
    } catch (error) {
      console.error('Error fetching trial info:', error);
    }
  };

  const handleCreatePaymentIntent = async () => {
    setLoading(true);
    try {
      // Validate Stripe configuration
      const validation = validateStripeConfig();
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const data = await createPaymentIntent({
        organizationId,
        amount: monthlyPrice * 100, // Stripe uses cents
        currency: currency.toLowerCase(),
        metadata: {
          organizationId,
          organizationName,
          subscriptionPlan: 'monthly',
        },
      });
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        console.info('✅ Payment intent created successfully');
      } else {
        throw new Error('No client secret returned');
      }
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      
      // DEMO MODE FALLBACK: For testing UI without backend
      // Silently fall back to demo mode when API is not configured
      
      // Generate a mock client secret for demo purposes
      // This allows testing the Stripe UI without a backend
      const mockSecret = `pi_demo_${Math.random().toString(36).substring(7)}_secret_${Math.random().toString(36).substring(7)}`;
      setClientSecret(mockSecret);
      
      // Only log once in a subtle way
      if (!sessionStorage.getItem('demo_mode_logged')) {
        console.info('💳 Running in demo mode - Stripe keys not configured');
        console.info('📖 Update /stripe-config.ts with your Stripe keys');
        sessionStorage.setItem('demo_mode_logged', 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if already paid
  if (trialInfo?.paymentStatus === 'paid' && trialInfo?.subscriptionStatus === 'active') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg border-2 border-green-500/30 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <Check className="size-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl text-green-400">Subscription Active</h3>
              <p className="text-gray-400">Your payment has been processed successfully</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-3 p-4 bg-[#111120]/50 rounded-lg border border-gray-700/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Organization:</span>
              <span className="text-white">{organizationName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Subscription Status:</span>
              <span className="text-green-400 flex items-center gap-2">
                <Check className="size-4" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Days Remaining:</span>
              <span className="text-white">{trialInfo.daysRemaining > 0 ? trialInfo.daysRemaining : 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Plan:</span>
              <span className="text-white">Monthly Subscription</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <p className="text-sm text-gray-300">
              <AlertCircle className="size-4 inline mr-2 text-blue-400" />
              Your subscription will automatically renew. All features are now unlocked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stripe Configuration Status */}
      {!validateStripeConfig().isValid && (
        <div className="mb-3 p-2.5 rounded-md border border-yellow-500/30 bg-yellow-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-3.5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-200">
                <strong>Demo Mode:</strong> Update <code className="px-1 py-0.5 bg-black/30 rounded text-[10px]">/stripe-config.ts</code> with your Stripe keys to process real payments
              </p>
              <p className="text-[10px] text-yellow-300/80 mt-0.5">
                📖 See <code className="px-1 py-0.5 bg-black/30 rounded">/STRIPE_SETUP_INSTRUCTIONS.md</code> for setup guide
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Info - Compact */}
      {trialInfo && (
        <div className={`mb-3 p-2.5 rounded-md border text-xs ${ 
          trialInfo.daysRemaining <= 0 
            ? 'bg-red-900/20 border-red-500/30' 
            : trialInfo.daysRemaining <= 3
            ? 'bg-orange-900/20 border-orange-500/30'
            : 'bg-blue-900/20 border-blue-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className={`size-3.5 flex-shrink-0 ${ 
              trialInfo.daysRemaining <= 0 
                ? 'text-red-400' 
                : trialInfo.daysRemaining <= 3
                ? 'text-orange-400'
                : 'text-blue-400'
            }`} />
            <div>
              <p className="text-white">
                {trialInfo.daysRemaining <= 0 
                  ? 'Trial expired - payment required to continue' 
                  : `${trialInfo.daysRemaining} days trial remaining`}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Payment adds 30 days + {trialInfo.daysRemaining} trial days remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Card - Compact */}
      <div className="bg-[#1a1a2e] rounded-md border border-gray-700/50 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm text-white">Monthly Subscription</h3>
            <p className="text-[10px] text-gray-400">Full access to all features</p>
          </div>
          <div className="text-right">
            <p className="text-2xl text-white">${monthlyPrice}</p>
            <p className="text-[10px] text-gray-400">/month</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700/50 pt-2 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <Check className="size-3 text-green-400 flex-shrink-0" />
            <span>Unlimited users and transactions</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <Check className="size-3 text-green-400 flex-shrink-0" />
            <span>AI-powered insights and analytics</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <Check className="size-3 text-green-400 flex-shrink-0" />
            <span>Priority support</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <Check className="size-3 text-green-400 flex-shrink-0" />
            <span>Auto-renewal (cancel anytime)</span>
          </div>
        </div>
      </div>

      {/* Payment Form - Compact */}
      <div className="bg-[#1a1a2e] rounded-md border border-gray-700/50 p-3">
        <h3 className="text-sm text-white mb-2 flex items-center gap-1.5">
          <CreditCard className="size-4" />
          Payment Details
        </h3>

        {!clientSecret ? (
          <button
            onClick={handleCreatePaymentIntent}
            disabled={loading}
            className="w-full py-2.5 bg-[#1a1a2e] border-2 border-blue-500/50 hover:border-blue-400 hover:bg-[#252540] text-blue-300 hover:text-blue-200 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm"
          >
            {loading ? (
              <>
                <Loader className="size-4 animate-spin" />
                <span className="text-blue-200">Loading...</span>
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                <span>Proceed to Pay ${monthlyPrice}</span>
              </>
            )}
          </button>
        ) : (
          // Always use Elements wrapper for consistency
          <Elements stripe={stripePromise} options={clientSecret.startsWith('pi_demo_') ? {} : { clientSecret }}>
            <CheckoutForm 
              organizationId={organizationId}
              trialInfo={trialInfo}
              onSuccess={onPaymentSuccess}
              clientSecret={clientSecret}
            />
          </Elements>
        )}

        {/* Security Notice - Compact */}
        <div className="mt-2 p-2 bg-gray-800/30 rounded">
          <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
            <AlertCircle className="size-3 flex-shrink-0" />
            <span>
              <strong>Secure Payment:</strong> Processed via Stripe with bank-level encryption
            </span>
          </p>
        </div>
      </div>

      {/* Organization Info - Compact */}
      <div className="mt-3 p-2 bg-[#1a1a2e] rounded-md border border-gray-700/50">
        <div className="flex items-center gap-2">
          <Building className="size-4 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400">Billing for:</p>
            <p className="text-xs text-white">{organizationName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}