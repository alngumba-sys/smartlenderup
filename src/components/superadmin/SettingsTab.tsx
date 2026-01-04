import { useState } from 'react';
import { Save, Globe, DollarSign, Shield, Bell, Mail, Database, Clock, RefreshCw } from 'lucide-react';
import { db } from '../../utils/database';
import { SchemaMigrationPanel } from '../SchemaMigrationPanel';
import { migrateAllOrganizations } from '../../utils/migrateProjectStatesToTables';
import { toast } from 'sonner@2.0.3';

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

  const handleSave = () => {
    // In a real app, this would save to the database
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleMigrate = () => {
    migrateAllOrganizations();
    toast.success('Organizations migrated successfully!');
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
    </div>
  );
}