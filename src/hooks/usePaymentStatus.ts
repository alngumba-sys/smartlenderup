import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PaymentStatusInfo {
  isPaid: boolean;
  daysRemaining: number;
  subscriptionStatus: string;
  paymentStatus: string;
  isTrialExpired: boolean;
}

export function usePaymentStatus(organizationId: string): PaymentStatusInfo {
  const [paymentInfo, setPaymentInfo] = useState<PaymentStatusInfo>({
    isPaid: true, // DISABLED: Trial system temporarily disabled - always return isPaid: true
    daysRemaining: 999, // Large number to indicate no trial
    subscriptionStatus: 'active',
    paymentStatus: 'paid',
    isTrialExpired: false,
  });

  // DISABLED: Trial system temporarily disabled
  // Commenting out the entire useEffect that checks payment status
  /*
  useEffect(() => {
    if (!organizationId) return;

    fetchPaymentStatus();
  }, [organizationId]);

  const fetchPaymentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('trial_start_date, trial_end_date, subscription_status, payment_status, created_at')
        .eq('id', organizationId)
        .single();

      if (error) {
        // If columns don't exist, calculate from created_at
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

            setPaymentInfo({
              isPaid: diffDays > 0,
              daysRemaining: diffDays,
              subscriptionStatus: 'trial',
              paymentStatus: 'pending',
              isTrialExpired: diffDays <= 0,
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

        const isPaid = data.payment_status === 'paid' && data.subscription_status === 'active';

        setPaymentInfo({
          isPaid: isPaid || diffDays > 0,
          daysRemaining: diffDays,
          subscriptionStatus: data.subscription_status || 'trial',
          paymentStatus: data.payment_status || 'pending',
          isTrialExpired: diffDays <= 0 && !isPaid,
        });
      } else if (data && data.created_at) {
        const createdDate = new Date(data.created_at);
        const trialEndDate = new Date(createdDate);
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        
        const now = new Date();
        const diffTime = trialEndDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isPaid = data.payment_status === 'paid' && data.subscription_status === 'active';

        setPaymentInfo({
          isPaid: isPaid || diffDays > 0,
          daysRemaining: diffDays,
          subscriptionStatus: data.subscription_status || 'trial',
          paymentStatus: data.payment_status || 'pending',
          isTrialExpired: diffDays <= 0 && !isPaid,
        });
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
    }
  };
  */

  return paymentInfo;
}