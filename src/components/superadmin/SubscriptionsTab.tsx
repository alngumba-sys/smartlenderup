import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle, XCircle, Clock, Calendar, Settings } from 'lucide-react';
import { db } from '../../utils/database';
import { supabase } from '../../lib/supabase';
import { PricingControlPanel } from '../PricingControlPanel';

interface Subscription {
  id: string;
  organization_id: string;
  organization_name: string;
  plan: 'monthly' | 'annual';
  amount: number;
  currency: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  start_date: string;
  expiry_date: string;
  auto_renew: boolean;
  payment_method: 'm-pesa' | 'bank_transfer' | 'card';
  last_payment_date?: string;
}

export function SubscriptionsTab() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data, error } = await supabase.from('organizations').select('*');
      if (!error && data) {
        setOrganizations(data);
      } else {
        setOrganizations(db.getAllOrganizations());
      }
    };
    fetchOrganizations();
  }, []);
  
  const [subscriptions] = useState<Subscription[]>(
    organizations.map((org, index) => ({
      id: `SUB-${String(index + 1).padStart(3, '0')}`,
      organization_id: org.id,
      organization_name: org.organization_name,
      plan: index % 2 === 0 ? 'annual' : 'monthly',
      amount: index % 2 === 0 ? 25000 : 2500,
      currency: org.currency,
      status: 'active',
      start_date: '2024-01-01',
      expiry_date: index % 2 === 0 ? '2024-12-31' : '2024-02-01',
      auto_renew: true,
      payment_method: 'm-pesa',
      last_payment_date: '2024-01-01'
    }))
  );

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expired' | 'cancelled'>('all');

  const filteredSubscriptions = subscriptions.filter(sub => 
    statusFilter === 'all' || sub.status === statusFilter
  );

  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const expiringThisMonth = subscriptions.filter(s => {
    const expiry = new Date(s.expiry_date);
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return expiry >= now && expiry <= nextMonth;
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'expired': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Subscription Management</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Track lender subscriptions and billing</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(236, 115, 71, 0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 115, 71, 0.2)' }}>
              <DollarSign className="size-5" style={{ color: '#ec7347' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#ec7347' }}>
            KES {totalRevenue.toLocaleString()}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Monthly Revenue</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle className="size-5" style={{ color: '#10b981' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#10b981' }}>
            {subscriptions.filter(s => s.status === 'active').length}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Active Subscriptions</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
              <Calendar className="size-5" style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#f59e0b' }}>
            {expiringThisMonth}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Expiring This Month</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
              <XCircle className="size-5" style={{ color: '#ef4444' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#ef4444' }}>
            {subscriptions.filter(s => s.status === 'expired').length}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Expired</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: '#032b43',
            border: '1px solid rgba(232, 209, 201, 0.2)',
            color: '#e8d1c9'
          }}
        >
          <option value="all">All Subscriptions</option>
          <option value="active">Active</option>
          <option value="pending">Pending Payment</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#154F73' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Subscription ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Organization</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Plan</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Expiry Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Auto-Renew</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                  No subscriptions found
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map((sub, index) => (
                <tr 
                  key={sub.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#032b43' : '#020838',
                    borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono font-medium" style={{ color: '#e8d1c9' }}>{sub.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{sub.organization_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium capitalize" style={{ 
                      backgroundColor: sub.plan === 'annual' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: sub.plan === 'annual' ? '#10b981' : '#3b82f6'
                    }}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: '#ec7347' }}>
                      {sub.currency} {sub.amount.toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                      {sub.payment_method.toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: '#e8d1c9' }}>
                      {new Date(sub.expiry_date).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {sub.auto_renew ? (
                      <span className="text-xs font-medium" style={{ color: '#10b981' }}>✓ Yes</span>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: '#6b7280' }}>✗ No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(sub.status) }}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pricing Information */}
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3b82f6' }}>💳 Subscription Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <h4 className="font-semibold mb-2" style={{ color: '#e8d1c9' }}>Monthly Plan</h4>
            <p className="text-3xl font-bold mb-2" style={{ color: '#3b82f6' }}>KES 2,500</p>
            <ul className="space-y-1 text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
              <li>✓ Full platform access</li>
              <li>✓ Unlimited clients</li>
              <li>✓ M-Pesa integration</li>
              <li>✓ Basic support</li>
            </ul>
          </div>
          <div className="p-5 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold" style={{ color: '#e8d1c9' }}>Annual Plan</h4>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                Save 17%
              </span>
            </div>
            <p className="text-3xl font-bold mb-2" style={{ color: '#10b981' }}>KES 25,000</p>
            <ul className="space-y-1 text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
              <li>✓ Everything in Monthly</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Custom branding</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pricing Control Panel */}
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3b82f6' }}>💳 Pricing Control Panel</h3>
        <PricingControlPanel />
      </div>
    </div>
  );
}