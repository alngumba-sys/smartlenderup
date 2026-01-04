import { useState, useEffect } from 'react';
import { Users, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Organization {
  id: string;
  organization_name: string;
  email: string;
  plan: string;
  created_at: string;
  trial_end_date: string;
  subscription_status: string;
}

export function TrialManagementView() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in_trial' | 'expired'>('all');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setRefreshing(true);
      console.log('🔍 Loading organizations from Supabase...');

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading organizations:', error);
        return;
      }

      console.log('✅ Loaded organizations:', data?.length || 0);
      setOrganizations(data || []);
    } catch (err) {
      console.error('❌ Exception loading organizations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDaysRemaining = (trialEndDate: string): number => {
    const end = new Date(trialEndDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (daysRemaining: number): string => {
    if (daysRemaining < 0) return '#ef4444'; // red
    if (daysRemaining <= 3) return '#f59e0b'; // orange
    return '#10b981'; // green
  };

  const getStatusIcon = (daysRemaining: number) => {
    if (daysRemaining < 0) return XCircle;
    if (daysRemaining <= 3) return AlertTriangle;
    return CheckCircle;
  };

  const filteredOrganizations = organizations.filter(org => {
    const daysRemaining = getDaysRemaining(org.trial_end_date);
    
    if (filter === 'in_trial') {
      return daysRemaining >= 0 && org.subscription_status === 'trial';
    }
    if (filter === 'expired') {
      return daysRemaining < 0 && org.subscription_status === 'trial';
    }
    return true;
  });

  const stats = {
    total: organizations.length,
    inTrial: organizations.filter(org => {
      const daysRemaining = getDaysRemaining(org.trial_end_date);
      return daysRemaining >= 0 && org.subscription_status === 'trial';
    }).length,
    expired: organizations.filter(org => {
      const daysRemaining = getDaysRemaining(org.trial_end_date);
      return daysRemaining < 0 && org.subscription_status === 'trial';
    }).length,
    active: organizations.filter(org => org.subscription_status === 'active').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-2" style={{ color: '#3b82f6' }} />
          <p style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl flex items-center gap-2" style={{ color: '#e8d1c9' }}>
            <Users className="size-6" style={{ color: '#3b82f6' }} />
            Trial Management
          </h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
            Monitor and manage organization trials
          </p>
        </div>
        
        <button
          onClick={loadOrganizations}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6'
          }}
        >
          <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4" style={{
          backgroundColor: '#020838',
          border: '1px solid rgba(232, 209, 201, 0.1)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Total Organizations</span>
            <Users className="size-5" style={{ color: '#3b82f6' }} />
          </div>
          <p className="text-3xl" style={{ color: '#e8d1c9' }}>{stats.total}</p>
        </div>

        <div className="rounded-xl p-4" style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Active Trials</span>
            <CheckCircle className="size-5" style={{ color: '#10b981' }} />
          </div>
          <p className="text-3xl" style={{ color: '#10b981' }}>{stats.inTrial}</p>
        </div>

        <div className="rounded-xl p-4" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Expired Trials</span>
            <XCircle className="size-5" style={{ color: '#ef4444' }} />
          </div>
          <p className="text-3xl" style={{ color: '#ef4444' }}>{stats.expired}</p>
        </div>

        <div className="rounded-xl p-4" style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>Active Subscriptions</span>
            <CheckCircle className="size-5" style={{ color: '#3b82f6' }} />
          </div>
          <p className="text-3xl" style={{ color: '#3b82f6' }}>{stats.active}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className="px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: filter === 'all' ? 'rgba(59, 130, 246, 0.2)' : '#020838',
            border: filter === 'all' ? '1px solid #3b82f6' : '1px solid rgba(232, 209, 201, 0.1)',
            color: filter === 'all' ? '#3b82f6' : 'rgba(232, 209, 201, 0.7)'
          }}
        >
          All ({organizations.length})
        </button>
        <button
          onClick={() => setFilter('in_trial')}
          className="px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: filter === 'in_trial' ? 'rgba(16, 185, 129, 0.2)' : '#020838',
            border: filter === 'in_trial' ? '1px solid #10b981' : '1px solid rgba(232, 209, 201, 0.1)',
            color: filter === 'in_trial' ? '#10b981' : 'rgba(232, 209, 201, 0.7)'
          }}
        >
          In Trial ({stats.inTrial})
        </button>
        <button
          onClick={() => setFilter('expired')}
          className="px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: filter === 'expired' ? 'rgba(239, 68, 68, 0.2)' : '#020838',
            border: filter === 'expired' ? '1px solid #ef4444' : '1px solid rgba(232, 209, 201, 0.1)',
            color: filter === 'expired' ? '#ef4444' : 'rgba(232, 209, 201, 0.7)'
          }}
        >
          Expired ({stats.expired})
        </button>
      </div>

      {/* Organizations Table */}
      <div className="rounded-xl overflow-hidden" style={{
        backgroundColor: '#020838',
        border: '1px solid rgba(232, 209, 201, 0.1)'
      }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'rgba(232, 209, 201, 0.05)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-sm" style={{ color: '#e8d1c9' }}>Organization</th>
                <th className="px-6 py-3 text-left text-sm" style={{ color: '#e8d1c9' }}>Plan</th>
                <th className="px-6 py-3 text-left text-sm" style={{ color: '#e8d1c9' }}>Status</th>
                <th className="px-6 py-3 text-left text-sm" style={{ color: '#e8d1c9' }}>Trial End Date</th>
                <th className="px-6 py-3 text-left text-sm" style={{ color: '#e8d1c9' }}>Days Remaining</th>
                <th className="px-6 py-3 text-left text-sm" style={{ color: '#e8d1c9' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                    No organizations found
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => {
                  const daysRemaining = getDaysRemaining(org.trial_end_date);
                  const statusColor = getStatusColor(daysRemaining);
                  const StatusIcon = getStatusIcon(daysRemaining);

                  return (
                    <tr 
                      key={org.id}
                      className="transition-colors"
                      style={{ borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(232, 209, 201, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm" style={{ color: '#e8d1c9' }}>{org.organization_name}</p>
                          <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>{org.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs capitalize" style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6'
                        }}>
                          {org.plan || 'Starter'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs capitalize" style={{
                          backgroundColor: org.subscription_status === 'active' 
                            ? 'rgba(16, 185, 129, 0.15)' 
                            : 'rgba(245, 158, 11, 0.15)',
                          color: org.subscription_status === 'active' ? '#10b981' : '#f59e0b'
                        }}>
                          {org.subscription_status || 'trial'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" style={{ color: 'rgba(232, 209, 201, 0.5)' }} />
                          <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                            {new Date(org.trial_end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="size-4" style={{ color: statusColor }} />
                          <span className="text-sm font-medium" style={{ color: statusColor }}>
                            {daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4" style={{ color: 'rgba(232, 209, 201, 0.5)' }} />
                          <span className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                            {new Date(org.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg p-4" style={{ 
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <p className="text-sm" style={{ color: '#3b82f6' }}>
          <strong>💡 Tip:</strong> Organizations with expired trials can still access the platform with limited features. 
          Encourage them to upgrade to a paid plan to unlock full functionality.
        </p>
      </div>
    </div>
  );
}
