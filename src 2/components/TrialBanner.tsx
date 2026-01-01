import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CreditCard, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { PaymentModal } from './PaymentModal';

interface TrialBannerProps {
  organizationId: string;
  onPayNowClick?: () => void;
}

export function TrialBanner({ organizationId, onPayNowClick }: TrialBannerProps) {
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number;
    trialEndDate: string;
    subscriptionStatus: string;
    paymentStatus: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
        // If columns don't exist, fall back to calculating from created_at
        if (error.code === '42703') {
          console.log('ℹ️ Trial columns not in database. Calculating trial from created_at (14-day auto-trial)...');
          
          // Try to fetch just created_at
          const { data: orgData, error: fallbackError } = await supabase
            .from('organizations')
            .select('created_at')
            .eq('id', organizationId)
            .single();
          
          if (fallbackError || !orgData?.created_at) {
            console.error('Could not fetch created_at:', fallbackError);
            return;
          }

          // Calculate trial dates from created_at
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

          // Auto-show toast on day 1
          if (diffDays === 1 && !dismissed) {
            toast.error('Trial Expiring Tomorrow!', {
              description: 'Your 14-day free trial expires tomorrow. Please make payment to continue using the platform.',
              duration: 10000,
            });
          }

          // Show warning when trial has expired
          if (diffDays <= 0) {
            toast.error('Trial Period Expired!', {
              description: 'Your free trial has ended. Please contact support to activate your subscription.',
              duration: Infinity,
            });
          }
          
          return;
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

        // Auto-show toast on day 13 (1 day remaining)
        if (diffDays === 1 && !dismissed) {
          toast.error('Trial Expiring Tomorrow!', {
            description: 'Your 14-day free trial expires tomorrow. Please make payment to continue using the platform.',
            duration: 10000,
          });
        }

        // Show warning when trial has expired
        if (diffDays <= 0 && data.subscription_status === 'trial') {
          toast.error('Trial Period Expired!', {
            description: 'Your free trial has ended. Please contact support to activate your subscription.',
            duration: Infinity,
          });
        }
      } else if (data && data.created_at) {
        // If no trial_end_date but we have created_at, calculate it
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

        // Auto-show toast on day 1
        if (diffDays === 1 && !dismissed) {
          toast.error('Trial Expiring Tomorrow!', {
            description: 'Your 14-day free trial expires tomorrow. Please make payment to continue using the platform.',
            duration: 10000,
          });
        }

        // Show warning when trial has expired
        if (diffDays <= 0) {
          toast.error('Trial Period Expired!', {
            description: 'Your free trial has ended. Please contact support to activate your subscription.',
            duration: Infinity,
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchTrialInfo:', error);
    }
  };

  // Don't show banner if dismissed or if paid subscription
  if (dismissed || !trialInfo || trialInfo.subscriptionStatus === 'active' || trialInfo.paymentStatus === 'paid') {
    return null;
  }

  const { daysRemaining } = trialInfo;

  // Determine banner style based on days remaining
  const getBannerStyle = () => {
    if (daysRemaining <= 0) {
      return {
        bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
        border: '#dc2626',
        icon: AlertCircle,
        iconColor: '#fecaca',
      };
    } else if (daysRemaining === 1) {
      return {
        bg: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
        border: '#f97316',
        icon: AlertCircle,
        iconColor: '#fed7aa',
      };
    } else if (daysRemaining <= 3) {
      return {
        bg: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
        border: '#f59e0b',
        icon: Clock,
        iconColor: '#fef3c7',
      };
    } else {
      return {
        bg: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
        border: '#0ea5e9',
        icon: Clock,
        iconColor: '#bae6fd',
      };
    }
  };

  const style = getBannerStyle();
  const Icon = style.icon;

  // Get message based on days remaining
  const getMessage = () => {
    if (daysRemaining <= 0) {
      return {
        title: 'Trial Period Expired',
        description: 'Your 14-day free trial has ended. Please contact support to activate your paid subscription.',
      };
    } else if (daysRemaining === 1) {
      return {
        title: '⚠️ Trial Expiring Tomorrow!',
        description: 'Your free trial expires in 1 day. Make payment now to avoid service interruption.',
      };
    } else if (daysRemaining <= 3) {
      return {
        title: `Trial Ending Soon`,
        description: `You have ${daysRemaining} days remaining in your free trial. Ensure payment is processed before expiry.`,
      };
    } else {
      return {
        title: `Free Trial Active`,
        description: `You have ${daysRemaining} days remaining in your 14-day free trial.`,
      };
    }
  };

  const message = getMessage();

  return (
    <>
      <div 
        className="relative px-2 sm:px-3 py-1.5 mb-2 sm:mb-3 rounded-md shadow-md animate-in fade-in slide-in-from-top-2 duration-500"
        style={{ 
          background: style.bg,
          border: `1px solid ${style.border}`,
        }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1 rounded flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
              <Icon className="size-3" style={{ color: style.iconColor }} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs text-white whitespace-nowrap">{message.title}</h3>
                <div className="px-1.5 py-0.5 rounded-full text-[10px] flex-shrink-0" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff'
                }}>
                  {daysRemaining <= 0 ? 'EXPIRED' : `${daysRemaining}d left`}
                </div>
              </div>
              <p className="text-[10px] hidden sm:block" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                {message.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {daysRemaining > 0 && (
              <button
                onClick={() => {
                  if (onPayNowClick) {
                    onPayNowClick();
                  } else {
                    setIsPaymentModalOpen(true);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#111120',
                }}
              >
                <CreditCard className="size-3" />
                <span className="hidden sm:inline">Pay Now</span>
                <span className="sm:hidden">Pay</span>
              </button>
            )}
            
            {daysRemaining > 3 && (
              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded transition-all hover:bg-white/10"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                title="Dismiss"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        organizationId={organizationId}
      />
    </>
  );
}