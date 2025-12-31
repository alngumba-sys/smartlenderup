import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Settings, Save, Users, Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ScoringParameter {
  id: string;
  name: string;
  weight: number;
  description: string;
  enabled: boolean;
}

interface CreditScoringParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parameters: ScoringParameter[]) => void;
  clientType: 'individual' | 'business';
  setClientType: (type: 'individual' | 'business') => void;
}

export function CreditScoringParametersModal({ isOpen, onClose, onSave, clientType, setClientType }: CreditScoringParametersModalProps) {
  const { isDark } = useTheme();
  
  const [parametersIndividual, setParametersIndividual] = useState<ScoringParameter[]>([
    {
      id: 'payment_history',
      name: 'Payment History',
      weight: 35,
      description: 'Track record of on-time payments and defaults',
      enabled: true
    },
    {
      id: 'credit_utilization',
      name: 'Credit Utilization',
      weight: 30,
      description: 'Ratio of current debt to available credit',
      enabled: true
    },
    {
      id: 'account_age',
      name: 'Account Age',
      weight: 15,
      description: 'Length of credit history with institution',
      enabled: true
    },
    {
      id: 'loan_count',
      name: 'Loan Count & Mix',
      weight: 10,
      description: 'Number and diversity of credit products',
      enabled: true
    },
    {
      id: 'savings_balance',
      name: 'Savings Balance',
      weight: 10,
      description: 'Average savings account balance',
      enabled: true
    }
  ]);

  const [parametersBusiness, setParametersBusiness] = useState<ScoringParameter[]>([
    {
      id: 'payment_history',
      name: 'Payment History',
      weight: 30,
      description: 'Track record of on-time payments and defaults',
      enabled: true
    },
    {
      id: 'credit_utilization',
      name: 'Credit Utilization',
      weight: 25,
      description: 'Ratio of current debt to available credit',
      enabled: true
    },
    {
      id: 'account_age',
      name: 'Account Age',
      weight: 20,
      description: 'Length of credit history with institution',
      enabled: true
    },
    {
      id: 'loan_count',
      name: 'Loan Count & Mix',
      weight: 15,
      description: 'Number and diversity of credit products',
      enabled: true
    },
    {
      id: 'savings_balance',
      name: 'Savings Balance',
      weight: 10,
      description: 'Average savings account balance',
      enabled: true
    }
  ]);

  const parameters = clientType === 'individual' ? parametersIndividual : parametersBusiness;
  const setParameters = clientType === 'individual' ? setParametersIndividual : setParametersBusiness;

  const [newParameter, setNewParameter] = useState({ name: '', weight: 0, description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const totalWeight = parameters.filter(p => p.enabled).reduce((sum, p) => sum + p.weight, 0);

  const handleWeightChange = (id: string, newWeight: number) => {
    setParameters(parameters.map(p => 
      p.id === id ? { ...p, weight: Math.max(0, Math.min(100, newWeight)) } : p
    ));
  };

  const handleToggleParameter = (id: string) => {
    setParameters(parameters.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleDeleteParameter = (id: string) => {
    if (window.confirm('Are you sure you want to delete this parameter?')) {
      setParameters(parameters.filter(p => p.id !== id));
    }
  };

  const handleAddParameter = () => {
    if (newParameter.name && newParameter.weight > 0) {
      const param: ScoringParameter = {
        id: `custom_${Date.now()}`,
        name: newParameter.name,
        weight: newParameter.weight,
        description: newParameter.description,
        enabled: true
      };
      setParameters([...parameters, param]);
      setNewParameter({ name: '', weight: 0, description: '' });
      setShowAddForm(false);
    }
  };

  const handleSave = () => {
    if (totalWeight !== 100) {
      alert('Total weight must equal 100%. Please adjust the weights.');
      return;
    }
    onSave(parameters);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[rgb(208,239,255)] dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-gray-900 dark:text-white font-bold">Credit Scoring Parameters</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Configure the factors that determine credit scores</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Client Type Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-1">
              <button
                onClick={() => setClientType('individual')}
                className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 text-sm ${
                  clientType === 'individual'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                    : isDark 
                      ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Users className="size-4" />
                Individual Parameters
              </button>
              <button
                onClick={() => setClientType('business')}
                className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 text-sm ${
                  clientType === 'business'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                    : isDark 
                      ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Building2 className="size-4" />
                Business Parameters
              </button>
            </div>
          </div>

          {/* Weight Summary */}
          <div className={`p-4 rounded-lg border-2 mb-6 ${
            totalWeight === 100 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${totalWeight === 100 ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
                  Total Weight (Active Parameters Only)
                </p>
                <p className={`text-3xl ${totalWeight === 100 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                  {totalWeight}%
                </p>
              </div>
              {totalWeight !== 100 && (
                <div className="text-amber-700 dark:text-amber-300 text-sm text-right">
                  <p>⚠️ Must equal 100%</p>
                  <p>Adjust: {totalWeight > 100 ? `-${totalWeight - 100}%` : `+${100 - totalWeight}%`}</p>
                </div>
              )}
              {totalWeight === 100 && (
                <div className="text-emerald-700 dark:text-emerald-300 text-sm">
                  ✓ Weights properly balanced
                </div>
              )}
            </div>
          </div>

          {/* Parameters List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white">Scoring Parameters</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
              >
                <Plus className="size-4" />
                Add Parameter
              </button>
            </div>

            {/* Add New Parameter Form */}
            {showAddForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-blue-900 mb-3 text-sm">Add Custom Parameter</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Parameter Name *</label>
                    <input
                      type="text"
                      value={newParameter.name}
                      onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="e.g., Business Revenue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Weight (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newParameter.weight || ''}
                      onChange={(e) => setNewParameter({ ...newParameter, weight: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={newParameter.description}
                      onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="Description..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddParameter}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                  >
                    Add Parameter
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Parameters Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-gray-700">Parameter Name</th>
                    <th className="px-4 py-3 text-left text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left text-gray-700">Weight (%)</th>
                    <th className="px-4 py-3 text-left text-gray-700">Visual</th>
                    <th className="px-4 py-3 text-right text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parameters.map((param) => (
                    <tr key={param.id} className={!param.enabled ? 'bg-gray-50 opacity-60' : ''}>
                      <td className="px-4 py-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={param.enabled}
                            onChange={() => handleToggleParameter(param.id)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{param.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{param.description}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={param.weight}
                          onChange={(e) => handleWeightChange(param.id, parseInt(e.target.value) || 0)}
                          disabled={!param.enabled}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${param.enabled ? 'bg-emerald-600' : 'bg-gray-400'}`}
                            style={{ width: `${param.weight}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteParameter(param.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete parameter"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-blue-900 mb-2 text-sm flex items-center gap-2">
              <Settings className="size-4" />
              How Credit Scoring Works
            </h4>
            <ul className="text-blue-800 text-xs space-y-1">
              <li>• Each parameter is weighted and contributes to the final credit score (0-850)</li>
              <li>• All active parameter weights must total exactly 100%</li>
              <li>• You can add custom parameters, adjust weights, or disable parameters</li>
              <li>• Changes affect all future credit score calculations immediately</li>
              <li>• Disabled parameters are excluded from calculations</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={totalWeight !== 100}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <Save className="size-4" />
              Save Parameters
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}