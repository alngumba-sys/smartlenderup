import { useState } from 'react';
import { Globe, DollarSign, ToggleLeft, ToggleRight, Edit, Save, X } from 'lucide-react';

interface CountryConfig {
  country: string;
  currency: string;
  symbol: string;
  enabled: boolean;
  platformFeePercentage: number;
  subscriptionMonthly: number;
  subscriptionAnnual: number;
  flag: string;
}

export function CountryManagementTab() {
  const [countries, setCountries] = useState<CountryConfig[]>([
    { country: 'Kenya', currency: 'KES', symbol: 'KSh', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 2500, subscriptionAnnual: 25000, flag: '🇰🇪' },
    { country: 'Uganda', currency: 'UGX', symbol: 'USh', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 95000, subscriptionAnnual: 950000, flag: '🇺🇬' },
    { country: 'Tanzania', currency: 'TZS', symbol: 'TSh', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 60000, subscriptionAnnual: 600000, flag: '🇹🇿' },
    { country: 'Rwanda', currency: 'RWF', symbol: 'FRw', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 26000, subscriptionAnnual: 260000, flag: '🇷🇼' },
    { country: 'Ethiopia', currency: 'ETB', symbol: 'Br', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 1400, subscriptionAnnual: 14000, flag: '🇪🇹' },
    { country: 'South Africa', currency: 'ZAR', symbol: 'R', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 450, subscriptionAnnual: 4500, flag: '🇿🇦' },
    { country: 'Nigeria', currency: 'NGN', symbol: '₦', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 38000, subscriptionAnnual: 380000, flag: '🇳🇬' },
    { country: 'Ghana', currency: 'GHS', symbol: 'GH₵', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 350, subscriptionAnnual: 3500, flag: '🇬🇭' },
    { country: 'Zimbabwe', currency: 'ZWL', symbol: 'Z$', enabled: false, platformFeePercentage: 2.5, subscriptionMonthly: 900, subscriptionAnnual: 9000, flag: '🇿🇼' },
    { country: 'Zambia', currency: 'ZMW', symbol: 'ZK', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 550, subscriptionAnnual: 5500, flag: '🇿🇲' },
    { country: 'Botswana', currency: 'BWP', symbol: 'P', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 320, subscriptionAnnual: 3200, flag: '🇧🇼' },
    { country: 'Malawi', currency: 'MWK', symbol: 'MK', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 26000, subscriptionAnnual: 260000, flag: '🇲🇼' },
    { country: 'Mozambique', currency: 'MZN', symbol: 'MT', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 1600, subscriptionAnnual: 16000, flag: '🇲🇿' },
    { country: 'Other', currency: 'USD', symbol: '$', enabled: true, platformFeePercentage: 2.5, subscriptionMonthly: 25, subscriptionAnnual: 250, flag: '🌍' },
  ]);

  const [editingCountry, setEditingCountry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CountryConfig>>({});

  const toggleCountryStatus = (country: string) => {
    setCountries(countries.map(c => 
      c.country === country ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const startEdit = (country: CountryConfig) => {
    setEditingCountry(country.country);
    setEditForm(country);
  };

  const saveEdit = () => {
    if (editingCountry) {
      setCountries(countries.map(c => 
        c.country === editingCountry ? { ...c, ...editForm } : c
      ));
      setEditingCountry(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingCountry(null);
    setEditForm({});
  };

  const enabledCount = countries.filter(c => c.enabled).length;
  const totalRevenue = countries.reduce((sum, c) => {
    // Mock calculation - would be based on actual subscriptions
    return sum + (c.enabled ? c.subscriptionMonthly * 2 : 0); // 2 orgs per country as example
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Currency & Country Management</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Configure platform pricing for 14 African countries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 115, 71, 0.2)' }}>
              <Globe className="size-5" style={{ color: '#ec7347' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#e8d1c9' }}>{enabledCount}/{countries.length}</h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Enabled Countries</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
              <DollarSign className="size-5" style={{ color: '#10b981' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#e8d1c9' }}>14</h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Currencies Supported</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
              <DollarSign className="size-5" style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#e8d1c9' }}>
            {countries[0] ? `${countries[0].platformFeePercentage}%` : '0%'}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Platform Fee</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
              <DollarSign className="size-5" style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: '#e8d1c9' }}>Mock Revenue</h3>
          <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Subscription Revenue</p>
        </div>
      </div>

      {/* Countries Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(232, 209, 201, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#154F73' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Country</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Currency</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Platform Fee</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Monthly Sub</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Annual Sub</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#e8d1c9' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country, index) => {
              const isEditing = editingCountry === country.country;
              
              return (
                <tr 
                  key={country.country}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#032b43' : '#020838',
                    borderTop: '1px solid rgba(232, 209, 201, 0.05)'
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#e8d1c9' }}>{country.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono" style={{ color: '#e8d1c9' }}>{country.currency}</p>
                    <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>Symbol: {country.symbol}</p>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.platformFeePercentage || 0}
                        onChange={(e) => setEditForm({ ...editForm, platformFeePercentage: parseFloat(e.target.value) })}
                        className="w-20 px-2 py-1 rounded text-sm"
                        style={{ backgroundColor: '#020838', border: '1px solid rgba(236, 115, 71, 0.3)', color: '#e8d1c9' }}
                      />
                    ) : (
                      <p className="text-sm font-medium" style={{ color: '#ec7347' }}>{country.platformFeePercentage}%</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.subscriptionMonthly || 0}
                        onChange={(e) => setEditForm({ ...editForm, subscriptionMonthly: parseFloat(e.target.value) })}
                        className="w-24 px-2 py-1 rounded text-sm"
                        style={{ backgroundColor: '#020838', border: '1px solid rgba(236, 115, 71, 0.3)', color: '#e8d1c9' }}
                      />
                    ) : (
                      <p className="text-sm" style={{ color: '#e8d1c9' }}>{country.symbol} {country.subscriptionMonthly.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.subscriptionAnnual || 0}
                        onChange={(e) => setEditForm({ ...editForm, subscriptionAnnual: parseFloat(e.target.value) })}
                        className="w-24 px-2 py-1 rounded text-sm"
                        style={{ backgroundColor: '#020838', border: '1px solid rgba(236, 115, 71, 0.3)', color: '#e8d1c9' }}
                      />
                    ) : (
                      <p className="text-sm" style={{ color: '#e8d1c9' }}>{country.symbol} {country.subscriptionAnnual.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleCountryStatus(country.country)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
                      style={{
                        backgroundColor: country.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: country.enabled ? '#10b981' : '#ef4444'
                      }}
                    >
                      {country.enabled ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                      <span className="text-xs font-medium">{country.enabled ? 'Enabled' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-1.5 rounded hover:opacity-70"
                            style={{ color: '#10b981' }}
                            title="Save"
                          >
                            <Save className="size-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded hover:opacity-70"
                            style={{ color: '#ef4444' }}
                            title="Cancel"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(country)}
                          className="p-1.5 rounded hover:opacity-70"
                          style={{ color: '#3b82f6' }}
                          title="Edit Pricing"
                        >
                          <Edit className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <p className="text-sm" style={{ color: '#3b82f6' }}>
          💡 <strong>Note:</strong> Platform fees are charged on successful loan disbursements. Subscription fees are charged monthly or annually from lenders.
        </p>
      </div>
    </div>
  );
}
