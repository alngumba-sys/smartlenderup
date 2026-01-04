import { Users, Package, MapPin, FileText, Settings as SettingsIcon, Shield, TrendingUp, Award, Star, Palette, Database, DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useState } from 'react';
import { StaffPerformanceModal } from '../StaffPerformanceModal';
import { ThemeSettingsTab } from './ThemeSettingsTab';
import { DataBackupPanel } from '../DataBackupPanel';
import { PricingControlPanel } from '../PricingControlPanel';

export function AdministrationTab() {
  const { loanProducts } = useData();
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'performance' | 'products' | 'settings' | 'theme' | 'backup' | 'pricing'>('users');

  const loanOfficers = [
    { id: 'LO-001', name: 'Victor Muthama', branch: 'Nairobi', email: 'victor.muthama@bvfunguo.co.ke', phone: '0756789012', role: 'Loan Officer' }
  ];

  const branches = ['Nairobi'];

  const staffPerformance = [
    { id: 'PERF-001', staffId: 'LO-001', name: 'Victor Muthama', role: 'Loan Officer', branch: 'Nairobi', activeClients: 10, newClientsThisMonth: 2, loansDisbursedThisMonth: 12, disbursementAmountThisMonth: 955000, portfolioAtRisk: 0, collectionRate: 100, targetAchievement: 110, commissionEarned: 28650, rating: 5, lastEvaluation: '2025-12-01' }
  ] as const;

  const systemUsers = [
    { id: 'USR-001', name: 'Victor Muthama', role: 'Loan Officer', branch: 'Nairobi', email: 'victor.muthama@bvfunguo.co.ke', phone: '0756789012', status: 'Active', lastLogin: '2025-12-13 09:30' },
    { id: 'USR-002', name: 'David Mwangi', role: 'Operations Manager', branch: 'Nairobi', email: 'david.mwangi@bvfunguo.co.ke', phone: '0712345678', status: 'Active', lastLogin: '2025-12-13 07:00' },
    { id: 'USR-003', name: 'Alice Njeri', role: 'System Administrator', branch: 'Nairobi', email: 'alice.njeri@bvfunguo.co.ke', phone: '0767890123', status: 'Active', lastLogin: '2025-12-13 09:00' }
  ];

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`size-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 dark:text-white">System Administration</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage users, products, and system settings</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 ${
            activeSubTab === 'users'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Users & Permissions
        </button>
        <button
          onClick={() => setActiveSubTab('performance')}
          className={`px-4 py-2 ${
            activeSubTab === 'performance'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Staff Performance
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-2 ${
            activeSubTab === 'products'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Loan Products
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 ${
            activeSubTab === 'settings'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          System Settings
        </button>
        <button
          onClick={() => setActiveSubTab('theme')}
          className={`px-4 py-2 ${
            activeSubTab === 'theme'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Theme Settings
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2 ${
            activeSubTab === 'backup'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Data Backup
        </button>
        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`px-4 py-2 ${
            activeSubTab === 'pricing'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pricing Control
        </button>
      </div>

      {activeSubTab === 'users' && (
        // User Management
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white">User Management</h3>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Add New User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700">User ID</th>
                  <th className="px-4 py-3 text-left text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-gray-700">Branch</th>
                  <th className="px-4 py-3 text-center text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-gray-700">Last Login</th>
                  <th className="px-4 py-3 text-center text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {systemUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{user.id}</td>
                    <td className="px-4 py-3 text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-900">{user.role}</td>
                    <td className="px-4 py-3 text-gray-900">{user.branch}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.lastLogin}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">Edit</button>
                      <button className="text-red-600 hover:text-red-700">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'performance' && (
        // Staff Performance
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">Staff Performance</h3>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Add New Performance Record
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700">Staff ID</th>
                  <th className="px-4 py-3 text-left text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-gray-700">Branch</th>
                  <th className="px-4 py-3 text-center text-gray-700">Performance Rating</th>
                  <th className="px-4 py-3 text-left text-gray-700">Last Evaluation</th>
                  <th className="px-4 py-3 text-center text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffPerformance.map((staff) => (
                  <tr key={staff.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{staff.id}</td>
                    <td className="px-4 py-3 text-gray-900">{staff.name}</td>
                    <td className="px-4 py-3 text-gray-900">{staff.role}</td>
                    <td className="px-4 py-3 text-gray-900">{staff.branch}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center">
                        {getRatingStars(staff.rating)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{staff.lastEvaluation}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => setSelectedStaff(staff.id)}
                      >
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedStaff && (
            <StaffPerformanceModal
              staffId={selectedStaff}
              onClose={() => setSelectedStaff(null)}
            />
          )}
        </div>
      )}

      {activeSubTab === 'products' && (
        // Product Catalog
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">Product Catalog</h3>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Add New Product
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loanProducts.map((product) => (
              <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-gray-900">{product.name}</h4>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Amount:</span>
                    <span className="text-gray-900">KES {product.maxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="text-gray-900">{product.interestRate}% {product.interestType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repayment:</span>
                    <span className="text-gray-900">{product.repaymentFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenor:</span>
                    <span className="text-gray-900">{product.tenorMonths} months</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        // System Settings
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="size-5 text-gray-600" />
            <h3 className="text-gray-900">System Settings & Integrations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-900">M-Pesa Integration</h4>
                <span className="size-2 bg-emerald-600 rounded-full"></span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-emerald-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paybill:</span>
                  <span className="text-gray-900">400200</span>
                </div>
                <button className="w-full mt-2 px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 text-sm">
                  Configure API Keys
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-900">SMS Gateway</h4>
                <span className="size-2 bg-emerald-600 rounded-full"></span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="text-gray-900">Africa&apos;s Talking</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="text-gray-900">5,240 SMS</span>
                </div>
                <button className="w-full mt-2 px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 text-sm">
                  Configure Settings
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-900">Accounting Software</h4>
                <span className="size-2 bg-amber-600 rounded-full"></span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">System:</span>
                  <span className="text-gray-900">QuickBooks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sync:</span>
                  <span className="text-amber-600">Pending</span>
                </div>
                <button className="w-full mt-2 px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 text-sm">
                  Connect Account
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-900">Credit Bureau</h4>
                <span className="size-2 bg-emerald-600 rounded-full"></span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="text-gray-900">Metropol CRB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="text-gray-900">2 hours ago</span>
                </div>
                <button className="w-full mt-2 px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 text-sm">
                  Manage Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'theme' && (
        // Theme Settings
        <ThemeSettingsTab />
      )}

      {activeSubTab === 'backup' && (
        // Data Backup & Recovery
        <DataBackupPanel />
      )}

      {activeSubTab === 'pricing' && (
        // Pricing Control
        <PricingControlPanel />
      )}
    </div>
  );
}