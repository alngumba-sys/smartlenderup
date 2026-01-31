import { useState, useEffect } from 'react';
import { DollarSign, Users, HardDrive, Save, Settings, ToggleLeft, ToggleRight, Percent, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

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

export function PricingControlPanel() {
  const [plans, setPlans] = useState<PlanConfig[]>([
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 0,
      yearlyPrice: 0,
      isVisible: true,
      limits: { users: 10, projects: 10, storageGB: 5 },
      features: {
        analytics: false,
        export: true,
        aiInsights: false,
        prioritySupport: false,
        customIntegrations: false
      }
    },
    {
      id: 'growth',
      name: 'Growth',
      monthlyPrice: 99,
      yearlyPrice: 990,
      isVisible: true,
      limits: { users: 500, projects: 100, storageGB: 50 },
      features: {
        analytics: true,
        export: true,
        aiInsights: false,
        prioritySupport: true,
        customIntegrations: false
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 249,
      yearlyPrice: 2490,
      isVisible: true,
      isPopular: true,
      limits: { users: 2000, projects: 500, storageGB: 200 },
      features: {
        analytics: true,
        export: true,
        aiInsights: true,
        prioritySupport: true,
        customIntegrations: true
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      isVisible: true,
      limits: { users: 99999, projects: 99999, storageGB: 1000 },
      features: {
        analytics: true,
        export: true,
        aiInsights: true,
        prioritySupport: true,
        customIntegrations: true
      }
    }
  ]);

  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [trialDays, setTrialDays] = useState(14);

  // Load pricing data from Supabase on mount
  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading pricing data:', error);
        return;
      }

      if (data?.plans) {
        setPlans(data.plans);
        setGlobalDiscount(data.global_discount || 0);
        setTrialDays(data.trial_days || 14);
      }
    } catch (err) {
      console.error('Error loading pricing:', err);
    }
  };

  const updatePlanPrice = (planId: string, field: 'monthlyPrice' | 'yearlyPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, [field]: numValue } : p
    ));
  };

  const updatePlanLimit = (planId: string, field: keyof PlanLimits, value: string) => {
    const numValue = parseInt(value) || 0;
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, limits: { ...p.limits, [field]: numValue } } : p
    ));
  };

  const togglePlanVisibility = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, isVisible: !p.isVisible } : p
    ));
  };

  const togglePlanFeature = (planId: string, feature: keyof PlanFeatures) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, features: { ...p.features, [feature]: !p.features[feature] } } : p
    ));
  };

  const handleSaveAndGoLive = async () => {
    setIsSaving(true);
    try {
      console.log('💾 PricingControlPanel: Starting save process...');
      console.log('📊 PricingControlPanel: Growth plan monthly price:', plans.find(p => p.id === 'growth')?.monthlyPrice);
      console.log('📊 PricingControlPanel: Professional plan monthly price:', plans.find(p => p.id === 'professional')?.monthlyPrice);
      
      // Check if database is reachable
      const { error: connectionError } = await supabase.from('pricing_config').select('count').limit(1);
      
      if (connectionError) {
        console.error('❌ PricingControlPanel: Database not reachable:', connectionError);
        toast.error('Database not reachable. Check your internet');
        setIsSaving(false);
        return;
      }

      // Get the latest config to update it
      const { data: existingData } = await supabase
        .from('pricing_config')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('🔍 PricingControlPanel: Existing data ID:', existingData?.id || 'none (will insert new)');

      // Save pricing configuration
      const configData = {
        plans: plans,
        global_discount: globalDiscount,
        trial_days: trialDays,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existingData?.id) {
        // Update existing record
        console.log('🔄 PricingControlPanel: Updating existing record with ID:', existingData.id);
        const result = await supabase
          .from('pricing_config')
          .update(configData)
          .eq('id', existingData.id);
        error = result.error;
        console.log('✅ PricingControlPanel: Update result:', result.data ? 'success' : 'no data returned');
      } else {
        // Insert new record
        console.log('➕ PricingControlPanel: Inserting new record');
        const result = await supabase
          .from('pricing_config')
          .insert({
            ...configData,
            created_at: new Date().toISOString()
          });
        error = result.error;
        console.log('✅ PricingControlPanel: Insert result:', result.data ? 'success' : 'no data returned');
      }

      if (error) {
        console.error('❌ PricingControlPanel: Database error:', error);
        throw error;
      }

      // Verify the save by reading back
      const { data: verifyData } = await supabase
        .from('pricing_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (verifyData) {
        console.log('✅ PricingControlPanel: Verified saved data in database');
        console.log('💰 PricingControlPanel: Verified Growth plan price:', verifyData.plans.find((p: any) => p.id === 'growth')?.monthlyPrice);
        console.log('💰 PricingControlPanel: Verified Professional plan price:', verifyData.plans.find((p: any) => p.id === 'professional')?.monthlyPrice);
      }

      toast.success('Pricing configuration saved successfully! 🎉');
      console.log('✅ Pricing saved to database');
    } catch (err: any) {
      console.error('❌ PricingControlPanel: Error saving pricing:', err);
      toast.error('Failed to save pricing configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl flex items-center gap-2" style={{ color: '#e8d1c9' }}>
            <Settings className="size-6" style={{ color: '#3b82f6' }} />
            Pricing Remote Control
          </h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
            Control platform pricing, limits, and features in real-time
          </p>
        </div>
        
        {/* Global Controls */}
        <div className="flex items-center gap-4">
          {/* Trial Days */}
          <div className="flex items-center gap-3 rounded-lg p-4" style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                Trial Period (Days)
              </label>
              <input
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(parseInt(e.target.value) || 14)}
                className="w-24 px-3 py-1.5 rounded-lg text-sm"
                style={{
                  backgroundColor: '#020838',
                  border: '1px solid rgba(232, 209, 201, 0.2)',
                  color: '#e8d1c9'
                }}
                placeholder="14"
                min="0"
                max="365"
              />
            </div>
          </div>

          {/* Global Discount */}
          <div className="flex items-center gap-3 rounded-lg p-4" style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <Percent className="size-5" style={{ color: '#f59e0b' }} />
            <div>
              <label className="text-xs block mb-1" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                Global Discount
              </label>
              <input
                type="number"
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 rounded-lg text-sm"
                style={{
                  backgroundColor: '#020838',
                  border: '1px solid rgba(232, 209, 201, 0.2)',
                  color: '#e8d1c9'
                }}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
            <span style={{ color: 'rgba(232, 209, 201, 0.7)' }}>%</span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const discountedMonthly = plan.monthlyPrice * (1 - globalDiscount / 100);
          const discountedYearly = plan.yearlyPrice * (1 - globalDiscount / 100);

          return (
            <div
              key={plan.id}
              className="rounded-xl p-6 transition-all"
              style={{
                backgroundColor: plan.isPopular ? 'rgba(59, 130, 246, 0.1)' : '#020838',
                border: plan.isPopular ? '2px solid #3b82f6' : '1px solid rgba(232, 209, 201, 0.1)'
              }}
            >
              {/* Plan Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg flex items-center gap-2" style={{ color: '#e8d1c9' }}>
                    {plan.name}
                    {plan.isPopular && (
                      <span className="px-2 py-0.5 text-xs rounded-full" style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6'
                      }}>
                        POPULAR
                      </span>
                    )}
                  </h4>
                  <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Plan ID: {plan.id}</p>
                </div>
                
                {/* Visibility Toggle */}
                <button
                  onClick={() => togglePlanVisibility(plan.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: plan.isVisible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(232, 209, 201, 0.1)',
                    color: plan.isVisible ? '#10b981' : 'rgba(232, 209, 201, 0.6)'
                  }}
                >
                  {plan.isVisible ? (
                    <>
                      <Eye className="size-4" />
                      <span className="text-xs">Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-4" />
                      <span className="text-xs">Hidden</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pricing Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-xs block" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    value={plan.monthlyPrice}
                    onChange={(e) => updatePlanPrice(plan.id, 'monthlyPrice', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: '#032b43',
                      border: '1px solid rgba(232, 209, 201, 0.2)',
                      color: '#e8d1c9'
                    }}
                    placeholder="0"
                  />
                  {globalDiscount > 0 && (
                    <p className="text-xs" style={{ color: '#10b981' }}>
                      After discount: ${formatCurrency(discountedMonthly)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs block" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                    Yearly Price ($)
                  </label>
                  <input
                    type="number"
                    value={plan.yearlyPrice}
                    onChange={(e) => updatePlanPrice(plan.id, 'yearlyPrice', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: '#032b43',
                      border: '1px solid rgba(232, 209, 201, 0.2)',
                      color: '#e8d1c9'
                    }}
                    placeholder="0"
                  />
                  {globalDiscount > 0 && (
                    <p className="text-xs" style={{ color: '#10b981' }}>
                      After discount: ${formatCurrency(discountedYearly)}
                    </p>
                  )}
                </div>
              </div>

              {/* Limits Section */}
              <div className="pt-4 mb-4" style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
                <h5 className="text-sm mb-3 flex items-center gap-2" style={{ color: '#e8d1c9' }}>
                  <Settings className="size-4" />
                  Plan Limits
                </h5>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs flex items-center gap-1" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                      <Users className="size-3" />
                      Users
                    </label>
                    <input
                      type="number"
                      value={plan.limits.users}
                      onChange={(e) => updatePlanLimit(plan.id, 'users', e.target.value)}
                      className="w-full px-2 py-1.5 rounded text-sm"
                      style={{
                        backgroundColor: '#032b43',
                        border: '1px solid rgba(232, 209, 201, 0.2)',
                        color: '#e8d1c9'
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs flex items-center gap-1" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                      <DollarSign className="size-3" />
                      Projects
                    </label>
                    <input
                      type="number"
                      value={plan.limits.projects}
                      onChange={(e) => updatePlanLimit(plan.id, 'projects', e.target.value)}
                      className="w-full px-2 py-1.5 rounded text-sm"
                      style={{
                        backgroundColor: '#032b43',
                        border: '1px solid rgba(232, 209, 201, 0.2)',
                        color: '#e8d1c9'
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs flex items-center gap-1" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                      <HardDrive className="size-3" />
                      Storage (GB)
                    </label>
                    <input
                      type="number"
                      value={plan.limits.storageGB}
                      onChange={(e) => updatePlanLimit(plan.id, 'storageGB', e.target.value)}
                      className="w-full px-2 py-1.5 rounded text-sm"
                      style={{
                        backgroundColor: '#032b43',
                        border: '1px solid rgba(232, 209, 201, 0.2)',
                        color: '#e8d1c9'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Features Toggle */}
              <div className="pt-4" style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
                <h5 className="text-sm mb-3" style={{ color: '#e8d1c9' }}>Feature Access</h5>
                
                <div className="space-y-2">
                  {Object.entries(plan.features).map(([feature, enabled]) => (
                    <button
                      key={feature}
                      onClick={() => togglePlanFeature(plan.id, feature as keyof PlanFeatures)}
                      className="w-full flex items-center justify-between p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: '#032b43',
                        color: 'rgba(232, 209, 201, 0.8)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(232, 209, 201, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#032b43'}
                    >
                      <span className="text-sm capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {enabled ? (
                        <ToggleRight className="size-5" style={{ color: '#10b981' }} />
                      ) : (
                        <ToggleLeft className="size-5" style={{ color: 'rgba(232, 209, 201, 0.3)' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleSaveAndGoLive}
          disabled={isSaving}
          className="px-8 py-4 rounded-xl flex items-center gap-3 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
          onMouseEnter={(e) => !isSaving && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Save className="size-6" />
          {isSaving ? 'Saving Changes...' : 'Save & Go Live'}
        </button>
      </div>

      {/* Info Footer */}
      <div className="rounded-lg p-4" style={{ 
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <p className="text-sm" style={{ color: '#3b82f6' }}>
          <strong>💡 Pro Tip:</strong> Changes take effect immediately after clicking "Save & Go Live". 
          All existing subscriptions will continue at their original pricing until renewal.
        </p>
      </div>
    </div>
  );
}