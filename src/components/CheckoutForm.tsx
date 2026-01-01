import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader, Check, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface CheckoutFormProps {
  organizationId: string;
  trialInfo: {
    daysRemaining: number;
    trialEndDate: string;
    subscriptionStatus: string;
    paymentStatus: string;
  } | null;
  onSuccess?: () => void;
  clientSecret: string;
}

export function CheckoutForm({ organizationId, trialInfo, onSuccess, clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Check if we're in demo mode
  const isDemoMode = clientSecret.startsWith('pi_demo_');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Payment form submitted');
    console.log('Demo mode:', isDemoMode);
    console.log('Client secret:', clientSecret);

    setIsProcessing(true);
    setMessage('');

    try {
      // DEMO MODE: Simulate payment success without calling Stripe API
      if (isDemoMode) {
        console.log('🎭 DEMO MODE: Simulating payment...');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        await handlePaymentSuccess();
        
        return;
      }

      // PRODUCTION MODE: Use real Stripe API
      if (!stripe || !elements) {
        console.error('Stripe not initialized');
        setMessage('Payment system not ready. Please refresh the page.');
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'An error occurred');
        toast.error('Payment Failed', {
          description: error.message || 'Unable to process payment',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful - update database
        await handlePaymentSuccess();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setMessage(err.message || 'An unexpected error occurred');
      toast.error('Payment Error', {
        description: err.message || 'An unexpected error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log('Processing payment success...');
      
      // Calculate new trial end date (add remaining days to current date + 30 days)
      const now = new Date();
      const newTrialEndDate = new Date(now);
      const daysToAdd = (trialInfo?.daysRemaining || 0) + 30; // Add remaining trial days + 30 days subscription
      newTrialEndDate.setDate(newTrialEndDate.getDate() + daysToAdd);

      console.log('Updating database...');
      console.log('Organization ID:', organizationId);
      console.log('New trial end date:', newTrialEndDate.toISOString());
      console.log('Days to add:', daysToAdd);

      // Update organization payment status
      const { data, error: updateError } = await supabase
        .from('organizations')
        .update({
          payment_status: 'paid',
          subscription_status: 'active',
          trial_end_date: newTrialEndDate.toISOString(),
          last_payment_date: now.toISOString(),
          subscription_plan: 'monthly',
        })
        .eq('id', organizationId)
        .select();

      if (updateError) {
        console.error('Database update error:', updateError);
      } else {
        console.log('Database updated successfully:', data);
      }

      const successMessage = isDemoMode 
        ? '🎭 Demo payment successful! In production, this would charge your card.'
        : 'Payment successful! Your subscription has been activated.';

      toast.success('Payment Successful!', {
        description: `${successMessage} You now have ${daysToAdd} days of access.`,
        duration: 5000,
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        console.log('Refreshing page...');
        onSuccess?.();
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error('Update Error', {
        description: 'Payment processed but failed to update status. Please contact support.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isDemoMode ? (
        // Demo Mode: Show mock payment form
        <div className="space-y-4">
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 mb-2">
              🎭 <strong>Demo Mode Active</strong>
            </p>
            <p className="text-xs text-blue-200">
              Click "Pay Now" to simulate a successful payment. No real charges will be made.
              To accept real payments, configure your backend API endpoint.
            </p>
          </div>

          {/* Mock Card Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-blue-200 mb-2">Card Number</label>
              <div className="p-3 bg-[#1a1a2e] border border-blue-500/30 rounded-lg flex items-center gap-2">
                <CreditCard className="size-4 text-blue-400" />
                <input
                  type="text"
                  value="4242 4242 4242 4242"
                  readOnly
                  className="bg-transparent text-blue-200 outline-none w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-blue-200 mb-2">Expiry</label>
                <input
                  type="text"
                  value="12/34"
                  readOnly
                  className="w-full p-3 bg-[#1a1a2e] border border-blue-500/30 rounded-lg text-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-2">CVC</label>
                <input
                  type="text"
                  value="123"
                  readOnly
                  className="w-full p-3 bg-[#1a1a2e] border border-blue-500/30 rounded-lg text-blue-200"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Production Mode: Show real Stripe Payment Element
        <div className="stripe-payment-element">
          <PaymentElement 
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  email: '',
                },
              },
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#3b82f6',
                  colorBackground: '#1a1a2e',
                  colorText: '#e5e7eb',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                },
              },
            }}
          />
        </div>
      )}
      
      {message && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-3 bg-[#1a1a2e] border-2 border-blue-500/50 hover:border-blue-400 hover:bg-[#252540] text-blue-300 hover:text-blue-200 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
      >
        {isProcessing ? (
          <>
            <Loader className="size-5 animate-spin" />
            <span className="text-blue-200">Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="size-5" />
            <span>{isDemoMode ? 'Pay Now (Demo)' : 'Pay Now'}</span>
          </>
        )}
      </button>
      
      {isDemoMode && (
        <p className="text-xs text-center text-blue-300">
          ⚡ Click the button above to complete demo payment
        </p>
      )}
    </form>
  );
}