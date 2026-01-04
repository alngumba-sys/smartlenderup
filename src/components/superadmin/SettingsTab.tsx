import { useState, useEffect } from 'react';
import { Save, Globe, DollarSign, Shield, Bell, Mail, Database, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { db } from '../../utils/database';
import { SchemaMigrationPanel } from '../SchemaMigrationPanel';
import { migrateAllOrganizations } from '../../utils/migrateProjectStatesToTables';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';

export function SettingsTab() {
  const [platformName, setPlatformName] = useState('SmartLenderUp');
  const [supportEmail, setSupportEmail] = useState('support@smartlenderup.com');
  const [defaultCurrency, setDefaultCurrency] = useState('KES');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [saved, setSaved] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [clearStatements, setClearStatements] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationInput, setVerificationInput] = useState('');

  // Load organizations on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, organization_name, username, status')
          .order('organization_name');

        if (error) {
          console.error('❌ Error loading organizations:', error);
          toast.error('Failed to load organizations');
          setOrganizations([]);
        } else {
          setOrganizations(data || []);
        }
      } catch (error) {
        console.error('❌ Error loading organizations:', error);
        setOrganizations([]);
      } finally {
        setLoadingOrgs(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleSave = () => {
    // In a real app, this would save to the database
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleMigrate = () => {
    migrateAllOrganizations();
    toast.success('Organizations migrated successfully!');
  };

  const handleClearBankAccounts = async () => {
    if (!selectedOrgId) {
      toast.error('Please select an organization first');
      return;
    }

    // Show verification modal instead of window.confirm/prompt
    setVerificationInput('');
    setShowVerificationModal(true);
  };

  const handleConfirmClearBankAccounts = async () => {
    const selectedOrg = organizations.find(org => org.id === selectedOrgId);
    if (!selectedOrg) {
      toast.error('Organization not found');
      return;
    }

    // Verify the input matches the organization username
    if (verificationInput !== selectedOrg.username) {
      toast.error('Organization username mismatch - please type the exact username');
      return;
    }

    setShowVerificationModal(false);
    setIsClearing(true);
    
    try {
      console.log('🗑️ Starting bank account deletion for organization:', selectedOrgId);

      // Check connection
      const { error: connectionError } = await supabase
        .from('bank_accounts')
        .select('count')
        .limit(1);

      if (connectionError) {
        toast.error('Database not reachable. Check your internet');
        setIsClearing(false);
        return;
      }

      // Count bank accounts to delete
      const { data: accountsToDelete, error: countError } = await supabase
        .from('bank_accounts')
        .select('id, account_name, bank_name')
        .eq('organization_id', selectedOrgId);

      if (countError) {
        console.error('❌ Error counting bank accounts:', countError);
        toast.error('Failed to load bank accounts');
        setIsClearing(false);
        return;
      }

      const accountCount = accountsToDelete?.length || 0;
      console.log(`📊 Found ${accountCount} bank accounts to delete`);

      if (accountCount === 0) {
        toast.info('No bank accounts found for this organization');
        setIsClearing(false);
        return;
      }

      // Delete bank accounts for this organization
      const { error: deleteError } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('organization_id', selectedOrgId);

      if (deleteError) {
        console.error('❌ Error deleting bank accounts:', deleteError);
        toast.error('Failed to delete bank accounts');
        setIsClearing(false);
        return;
      }

      console.log(`✅ Deleted ${accountCount} bank accounts`);

      // Optionally delete funding transactions
      if (clearStatements) {
        const { error: fundingError } = await supabase
          .from('funding_transactions')
          .delete()
          .eq('organization_id', selectedOrgId);

        if (fundingError) {
          console.warn('⚠️ Error deleting funding transactions:', fundingError);
          toast.warning('Bank accounts deleted, but some statements may remain');
        } else {
          console.log('✅ Funding transactions deleted');
          toast.success(`Deleted ${accountCount} bank accounts and all statements!`);
        }
      } else {
        toast.success(`Deleted ${accountCount} bank accounts (statements kept)`);
      }

      // Reset form
      setSelectedOrgId('');
      setClearStatements(false);
      
      // Suggest page reload
      setTimeout(() => {
        if (window.confirm('Bank accounts cleared! Click OK to reload the page and see changes.')) {
          window.location.reload();
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Error clearing bank accounts:', error);
      toast.error('Failed to clear bank accounts');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Platform Settings</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Configure platform-wide settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
          style={{ 
            backgroundColor: saved ? '#10b981' : '#ec7347',
            color: '#ffffff'
          }}
        >
          <Save className="size-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="size-5" style={{ color: '#ec7347' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>General Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: '#020838',
                  border: '1px solid rgba(232, 209, 201, 0.2)',
                  color: '#e8d1c9'
                }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: '#020838',
                  border: '1px solid rgba(232, 209, 201, 0.2)',
                  color: '#e8d1c9'
                }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                Default Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: '#020838',
                  border: '1px solid rgba(232, 209, 201, 0.2)',
                  color: '#e8d1c9'
                }}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="UGX">UGX - Ugandan Shilling</option>
                <option value="TZS">TZS - Tanzanian Shilling</option>
                <option value="RWF">RWF - Rwandan Franc</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="size-5" style={{ color: '#ec7347' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>System Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#020838' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>Maintenance Mode</p>
                <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Disable platform access for maintenance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: maintenanceMode ? '#ec7347' : '#6b7280' }}></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#020838' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>Allow New Registrations</p>
                <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Enable new user and organization sign-ups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: allowRegistration ? '#ec7347' : '#6b7280' }}></div>
              </label>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: '#020838',
                  border: '1px solid rgba(232, 209, 201, 0.2)',
                  color: '#e8d1c9'
                }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                Max Login Attempts
              </label>
              <input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: '#020838',
                  border: '1px solid rgba(232, 209, 201, 0.2)',
                  color: '#e8d1c9'
                }}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5" style={{ color: '#ec7347' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#020838' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>Email Notifications</p>
                <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Send email notifications to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: emailNotifications ? '#ec7347' : '#6b7280' }}></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#020838' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>SMS Notifications</p>
                <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Send SMS notifications to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: smsNotifications ? '#ec7347' : '#6b7280' }}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Schema Migration Panel */}
        <SchemaMigrationPanel />

        {/* Backup & Database */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Database className="size-5" style={{ color: '#ec7347' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Backup & Database</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#020838' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>Automatic Daily Backups</p>
                <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Automatically backup database daily</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: autoBackup ? '#ec7347' : '#6b7280' }}></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{ backgroundColor: '#ec7347', color: '#ffffff' }}
              >
                Create Backup Now
              </button>
              <button
                className="px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{ backgroundColor: '#154F73', color: '#e8d1c9' }}
              >
                View Backup History
              </button>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(236, 115, 71, 0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-4" style={{ color: '#ec7347' }} />
                <p className="text-xs font-medium" style={{ color: '#ec7347' }}>Last Backup</p>
              </div>
              <p className="text-sm" style={{ color: '#e8d1c9' }}>December 24, 2025 at 3:00 AM</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Next scheduled: December 25, 2025 at 3:00 AM</p>
            </div>

            {/* Data Migration Section */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="size-4" style={{ color: '#34d399' }} />
                <p className="text-xs font-medium" style={{ color: '#34d399' }}>Data Migration</p>
              </div>
              <p className="text-sm mb-3" style={{ color: '#e8d1c9' }}>Sync all organization data from project_states to individual tables</p>
              <button
                onClick={handleMigrate}
                className="w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: '#34d399', color: '#111120' }}
              >
                <RefreshCw className="size-4" />
                Migrate All Organizations Now
              </button>
              <p className="text-xs mt-2" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>This will enable Super Admin to see all data across organizations</p>
            </div>

            {/* Clear Bank Accounts Section */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#020838', border: '1px solid rgba(236, 115, 71, 0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="size-4" style={{ color: '#ec7347' }} />
                <p className="text-xs font-medium" style={{ color: '#ec7347' }}>Clear Bank Accounts (Organization-Specific)</p>
              </div>
              <p className="text-sm mb-4" style={{ color: '#e8d1c9' }}>Delete all bank accounts for a specific organization</p>
              
              {/* Organization Selector */}
              <div className="mb-3">
                <label className="block text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                  Select Organization *
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: '#111120',
                    border: '1px solid rgba(232, 209, 201, 0.2)',
                    color: '#e8d1c9'
                  }}
                  disabled={loadingOrgs || isClearing}
                >
                  <option value="">
                    {loadingOrgs ? 'Loading organizations...' : 'Select an organization'}
                  </option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.organization_name} ({org.username}) - {org.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Statements Checkbox */}
              <div className="mb-4 flex items-center gap-2 p-2 rounded" style={{ backgroundColor: '#111120' }}>
                <input
                  type="checkbox"
                  id="clearStatements"
                  checked={clearStatements}
                  onChange={(e) => setClearStatements(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#ec7347' }}
                  disabled={isClearing}
                />
                <label htmlFor="clearStatements" className="text-xs cursor-pointer" style={{ color: '#e8d1c9' }}>
                  Also delete all statements/transactions (funding history)
                </label>
              </div>

              <button
                onClick={handleClearBankAccounts}
                className="w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: selectedOrgId && !isClearing ? '#ec7347' : '#6b7280', 
                  color: '#ffffff',
                  cursor: selectedOrgId && !isClearing ? 'pointer' : 'not-allowed'
                }}
                disabled={!selectedOrgId || isClearing}
              >
                <Trash2 className="size-4" />
                {isClearing ? 'Clearing...' : 'Clear Bank Accounts'}
              </button>
              <p className="text-xs mt-2" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                ⚠️ This action CANNOT be undone. You'll need to type the organization username to confirm.
              </p>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Organizations</p>
            <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>{db.getAllOrganizations().length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Clients</p>
            <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>{db.getAllClients().length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Loans</p>
            <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>{db.getAllLoans().length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Users</p>
            <p className="text-2xl font-bold" style={{ color: '#e8d1c9' }}>{db.getAllUsers().length}</p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (() => {
        const selectedOrg = organizations.find(org => org.id === selectedOrgId);
        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
            onClick={() => setShowVerificationModal(false)}
          >
            <div 
              className="w-full max-w-md rounded-lg shadow-xl"
              style={{ backgroundColor: '#0a1929', border: '1px solid rgba(236, 115, 71, 0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b" style={{ borderColor: 'rgba(232, 209, 201, 0.1)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 115, 71, 0.1)' }}>
                    <Trash2 className="size-5" style={{ color: '#ec7347' }} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>
                    Confirm Deletion
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Warning Banner */}
                <div 
                  className="p-3 rounded-lg flex items-start gap-2"
                  style={{ backgroundColor: 'rgba(236, 115, 71, 0.1)', border: '1px solid rgba(236, 115, 71, 0.3)' }}
                >
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#ec7347' }}>
                      This action CANNOT be undone!
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                      All bank accounts for this organization will be permanently deleted.
                    </p>
                  </div>
                </div>

                {/* Organization Details */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#020838' }}>
                  <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                    Organization to be affected:
                  </p>
                  <p className="text-sm font-medium mb-1" style={{ color: '#e8d1c9' }}>
                    {selectedOrg?.organization_name}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
                    Username: <span style={{ color: '#ec7347' }}>{selectedOrg?.username}</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>
                    Status: {selectedOrg?.status}
                  </p>
                </div>

                {/* What will be deleted */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#020838' }}>
                  <p className="text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                    What will be deleted:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ec7347' }} />
                      <p className="text-xs" style={{ color: '#e8d1c9' }}>All bank accounts</p>
                    </div>
                    {clearStatements && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ec7347' }} />
                        <p className="text-xs" style={{ color: '#e8d1c9' }}>All statements and transactions</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Input */}
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                    Type <span style={{ color: '#ec7347', fontWeight: 600 }}>{selectedOrg?.username}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    placeholder="Enter organization username"
                    className="w-full px-4 py-2.5 rounded-lg text-sm"
                    style={{
                      backgroundColor: '#111120',
                      border: '1px solid rgba(232, 209, 201, 0.2)',
                      color: '#e8d1c9'
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Footer */}
              <div 
                className="p-6 border-t flex items-center justify-end gap-3"
                style={{ borderColor: 'rgba(232, 209, 201, 0.1)' }}
              >
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationInput('');
                  }}
                  className="px-4 py-2.5 rounded-lg font-medium transition-all"
                  style={{ 
                    backgroundColor: '#154F73', 
                    color: '#e8d1c9' 
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearBankAccounts}
                  disabled={verificationInput !== selectedOrg?.username}
                  className="px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: verificationInput === selectedOrg?.username ? '#ec7347' : '#6b7280',
                    color: '#ffffff',
                    cursor: verificationInput === selectedOrg?.username ? 'pointer' : 'not-allowed',
                    opacity: verificationInput === selectedOrg?.username ? 1 : 0.5
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete Bank Accounts
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}