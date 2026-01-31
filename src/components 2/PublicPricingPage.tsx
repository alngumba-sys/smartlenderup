import { useState, useEffect } from 'react';
import { Check, Users, TrendingUp, BarChart, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PlanLimits {
  users: number;
  projects: number;
  storageGB: number;
}

interface PlanFeatures {
  analytics: boolean;
  export: boolean;
  aiInsights: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
}

interface PlanConfig {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isVisible: boolean;
  limits: PlanLimits;
  features: PlanFeatures;
  isPopular?: boolean;
}

const PLAN_ICONS = {
  starter: Users,
  growth: TrendingUp,
  professional: BarChart,
  enterprise: Shield
};

const FEATURE_LABELS = {
  analytics: 'Advanced Analytics',
  export: 'Export Data',
  aiInsights: 'AI Insights & Predictions',
  prioritySupport: '24/7 Priority Support',
  customIntegrations: 'Custom Integrations'
};

export function PublicPricingPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadPricing();
    
    // Auto-refresh every 30 seconds to catch Super Admin changes
    const interval = setInterval(() => {
      loadPricing();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPricing = async () => {
    try {
      console.log('🔍 PublicPricingPage: Fetching pricing from Supabase...');
      
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ PublicPricingPage: Error loading pricing:', error);
        console.log('⚠️ Using empty plans array (no database data)');
        return;
      }

      console.log('📦 PublicPricingPage: Raw data from Supabase:', data);

      if (data?.plans) {
        console.log('✅ PublicPricingPage: Plans found in database:', data.plans.length);
        console.log('💰 PublicPricingPage: Growth plan monthly price:', data.plans.find((p: PlanConfig) => p.id === 'growth')?.monthlyPrice);
        console.log('💰 PublicPricingPage: Professional plan monthly price:', data.plans.find((p: PlanConfig) => p.id === 'professional')?.monthlyPrice);
        console.log('🎯 PublicPricingPage: Global discount:', data.global_discount);
        
        // Filter only visible plans
        const visiblePlans = data.plans.filter((p: PlanConfig) => p.isVisible);
        console.log('👁️ PublicPricingPage: Visible plans:', visiblePlans.length);
        
        setPlans(visiblePlans);
        setGlobalDiscount(data.global_discount || 0);
        console.log('✅ PublicPricingPage: State updated with database prices');
      } else {
        console.log('⚠️ PublicPricingPage: No plans found in database data');
      }
    } catch (err) {
      console.error('❌ PublicPricingPage: Exception loading pricing:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPricing();
  };

  const getPrice = (plan: PlanConfig) => {
    const basePrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return basePrice * (1 - globalDiscount / 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Refresh Button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all disabled:opacity-50"
            title="Refresh pricing from database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl mb-4">Choose Your Plan</h1>
          <p className="text-gray-300 text-lg mb-8">
            All plans include 14-day free trial • Scale as you grow
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-emerald-400">Save 17%</span>
            </button>
          </div>

          {/* Global Discount Badge */}
          {globalDiscount > 0 && (
            <div className="mt-4 inline-block px-4 py-2 bg-orange-500/20 border border-orange-400 rounded-full text-orange-300">
              🎉 Special Offer: {globalDiscount}% off all plans!
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] || Users;
            const price = getPrice(plan);
            const originalPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all hover:scale-105 ${
                  plan.isPopular
                    ? 'border-blue-400 shadow-xl shadow-blue-500/20'
                    : 'border-white/10'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white text-xs font-semibold">
                    POPULAR
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>

                {/* Plan Name */}
                <h3 className="text-white text-2xl mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  {plan.id === 'starter' ? (
                    <div className="text-white text-4xl">FREE</div>
                  ) : plan.id === 'enterprise' ? (
                    <div className="text-white text-4xl">Custom</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-white text-4xl">${formatPrice(price)}</span>
                        <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      {globalDiscount > 0 && originalPrice !== price && (
                        <div className="text-gray-400 line-through text-sm">
                          ${formatPrice(originalPrice)}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Limits */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Up to {plan.limits.users.toLocaleString()} clients</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>{plan.limits.storageGB} staff accounts</span>
                  </div>
                  {plan.id === 'starter' && (
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Basic loan management</span>
                    </div>
                  )}
                  {plan.id === 'growth' && (
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Advanced analytics</span>
                    </div>
                  )}
                  {plan.id === 'professional' && (
                    <>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Unlimited staff</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>AI insights & predictions</span>
                      </div>
                    </>
                  )}
                  {plan.id === 'enterprise' && (
                    <>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Unlimited clients</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Custom integrations</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Dedicated account manager</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {Object.entries(plan.features).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{FEATURE_LABELS[key as keyof typeof FEATURE_LABELS]}</span>
                      </div>
                    )
                  ))}
                  {plan.id === 'starter' && (
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Email support</span>
                    </div>
                  )}
                  {(plan.id === 'growth' || plan.id === 'professional' || plan.id === 'enterprise') && (
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-xl transition-all ${
                    plan.id === 'starter'
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      : plan.id === 'enterprise'
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.id === 'starter'
                    ? 'Get Started'
                    : plan.id === 'enterprise'
                    ? 'Contact Sales'
                    : 'Choose Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>All plans include 14-day free trial • No credit card required • View detailed comparison →</p>
        </div>
      </div>
    </div>
  );
}