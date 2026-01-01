import { Settings, Globe, Bell, Lock, User, Shield, Palette, Database, Mail, Sun, Moon, Monitor, DollarSign, Calculator, Info, CreditCard, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getOrganizationName, getOrganizationCountry, getOrganizationId } from '../../utils/organizationUtils';
import { getCurrencyName, getCurrencyCode, SUPPORTED_COUNTRIES } from '../../utils/currencyUtils';
import { useAuth } from '../../contexts/AuthContext';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { StripePayment } from '../StripePayment';
import { LoanProductDiagnostic } from '../LoanProductDiagnostic';

export function SettingsTab() {
  const { currentTheme, themes, setTheme, isDark, mode, toggleMode } = useTheme();
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const organizationName = getOrganizationName();
  const organizationCountry = getOrganizationCountry();
  const organizationId = getOrganizationId();
  const currencyName = getCurrencyName();
  const currencyCode = getCurrencyCode();
  
  // Get payment status
  const paymentStatus = usePaymentStatus(organizationId);
  const isManager = currentUser?.role === 'Manager';
  
  // Check if settings should be locked
  const isSettingsLocked = !paymentStatus.isPaid && !isManager;
  const isNonPaymentSectionLocked = !paymentStatus.isPaid && isManager;

  // Loan disbursement configuration state
  const [disbursementModel, setDisbursementModel] = useState<'fee_deducted_upfront' | 'fee_added_to_repayment' | 'no_fee_deduction' | 'interest_on_disbursed'>('fee_deducted_upfront');
  const [interestCalculationBase, setInterestCalculationBase] = useState<'principal' | 'disbursed_amount'>('principal');
  const [processingFeePercentage, setProcessingFeePercentage] = useState(10);
  const [isFeeOptional, setIsFeeOptional] = useState(false);
  const [exampleLoanAmount, setExampleLoanAmount] = useState(10000);
  
  // Calculate example values based on configuration
  const calculateExample = () => {
    const principal = exampleLoanAmount;
    const fee = isFeeOptional ? 0 : (principal * processingFeePercentage / 100);
    const interestRate = 15; // Example interest rate
    
    let disbursedAmount = principal;
    let baseForInterest = principal;
    let totalRepayment = principal;
    let description = '';
    
    switch (disbursementModel) {
      case 'fee_deducted_upfront':
        disbursedAmount = principal - fee;
        baseForInterest = principal;
        totalRepayment = principal + (baseForInterest * interestRate / 100);
        description = `Client receives ${currencyCode} ${disbursedAmount.toLocaleString()}, repays ${currencyCode} ${totalRepayment.toLocaleString()} (Fee: ${currencyCode} ${fee.toLocaleString()} deducted, Interest on full ${currencyCode} ${principal.toLocaleString()})`;
        break;
      
      case 'fee_added_to_repayment':
        disbursedAmount = principal;
        baseForInterest = principal;
        totalRepayment = principal + fee + (baseForInterest * interestRate / 100);
        description = `Client receives ${currencyCode} ${disbursedAmount.toLocaleString()}, repays ${currencyCode} ${totalRepayment.toLocaleString()} (Fee: ${currencyCode} ${fee.toLocaleString()} added to repayment, Interest on ${currencyCode} ${principal.toLocaleString()})`;
        break;
      
      case 'no_fee_deduction':
        disbursedAmount = principal;
        baseForInterest = principal;
        totalRepayment = principal + (baseForInterest * interestRate / 100);
        description = `Client receives ${currencyCode} ${disbursedAmount.toLocaleString()}, repays ${currencyCode} ${totalRepayment.toLocaleString()} (No processing fee charged)`;
        break;
      
      case 'interest_on_disbursed':
        disbursedAmount = principal - fee;
        baseForInterest = disbursedAmount;
        totalRepayment = principal + (baseForInterest * interestRate / 100);
        description = `Client receives ${currencyCode} ${disbursedAmount.toLocaleString()}, repays ${currencyCode} ${totalRepayment.toLocaleString()} (Fee: ${currencyCode} ${fee.toLocaleString()} deducted, Interest on disbursed ${currencyCode} ${disbursedAmount.toLocaleString()})`;
        break;
    }
    
    return {
      principal,
      fee,
      disbursedAmount,
      baseForInterest,
      interestAmount: (baseForInterest * interestRate / 100),
      totalRepayment,
      description
    };
  };
  
  const example = calculateExample();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure system preferences and settings</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {isManager && (
          <button
            onClick={() => setActiveSection('payment')}
            data-settings-payment
            className={`px-4 py-2 flex items-center gap-2 ${
              activeSection === 'payment'
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="size-4" />
            Payment
            {!paymentStatus.isPaid && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500 text-white">
                Required
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => !isNonPaymentSectionLocked && setActiveSection('general')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeSection === 'general'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          } ${isNonPaymentSectionLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isNonPaymentSectionLocked}
        >
          General Settings
          {isNonPaymentSectionLocked && <Lock className="size-3" />}
        </button>
        <button
          onClick={() => !isNonPaymentSectionLocked && setActiveSection('theme')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeSection === 'theme'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          } ${isNonPaymentSectionLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isNonPaymentSectionLocked}
        >
          Theme & Appearance
          {isNonPaymentSectionLocked && <Lock className="size-3" />}
        </button>
        <button
          onClick={() => !isNonPaymentSectionLocked && setActiveSection('notifications')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeSection === 'notifications'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          } ${isNonPaymentSectionLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isNonPaymentSectionLocked}
        >
          Notifications
          {isNonPaymentSectionLocked && <Lock className="size-3" />}
        </button>
        <button
          onClick={() => !isNonPaymentSectionLocked && setActiveSection('security')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeSection === 'security'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          } ${isNonPaymentSectionLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isNonPaymentSectionLocked}
        >
          Security
          {isNonPaymentSectionLocked && <Lock className="size-3" />}
        </button>
        <button
          onClick={() => !isNonPaymentSectionLocked && setActiveSection('subscription')}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeSection === 'subscription'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          } ${isNonPaymentSectionLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isNonPaymentSectionLocked}
        >
          Subscription & Trial
          {isNonPaymentSectionLocked && <Lock className="size-3" />}
        </button>
      </div>

      {/* Payment Required Warning for Manager */}
      {isManager && !paymentStatus.isPaid && activeSection !== 'payment' && (
        <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-2 border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-red-400 mb-1">Payment Required</h3>
              <p className="text-sm text-gray-300">
                Your trial has {paymentStatus.daysRemaining <= 0 ? 'expired' : `${paymentStatus.daysRemaining} days remaining`}. 
                Settings are locked until payment is completed. Please proceed to the{' '}
                <button 
                  onClick={() => setActiveSection('payment')}
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Payment tab
                </button>
                {' '}to activate your subscription.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Locked Warning for Non-Manager Users */}
      {isSettingsLocked && (
        <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-2 border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="size-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-red-400 mb-1">Settings Locked</h3>
              <p className="text-sm text-gray-300">
                Settings access is restricted until payment is completed. Please contact your Manager to process the payment and unlock all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Section - Manager Only */}
      {activeSection === 'payment' && isManager && (
        <div className="space-y-6">
          <StripePayment 
            organizationId={organizationId} 
            onPaymentSuccess={() => {
              // Refresh the page or update state after successful payment
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* General Settings */}
      {activeSection === 'general' && (
        <div className="space-y-6">
          <div className="bg-[rgb(17,17,32)] rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">Organization Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  defaultValue={organizationName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Country</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue={organizationCountry}>
                  {SUPPORTED_COUNTRIES.map((countryData) => (
                    <option key={countryData.country} value={countryData.country}>
                      {countryData.country}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Currency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value={currencyCode}>{currencyName} - {currencyCode}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(17,17,32)] rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">System Configuration</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Send SMS alerts to clients</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Send email alerts to staff and clients</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(17,17,32)] rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="size-5 text-blue-500" />
              <h3 className="text-gray-900">Loan Disbursement Configuration</h3>
            </div>
            
            {/* Warning Panel */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#1e3a5f', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div className="flex items-start gap-3">
                <Info className="size-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-400 mb-2">⚠️ Logic Configuration Only</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    This section configures the <strong>disbursement logic/model</strong> for your organization. 
                    The 10% processing fee shown here is <strong>only for demonstration purposes</strong>.
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed mt-2">
                    💡 <strong>Important:</strong> The actual processing fee percentage applied to each loan is set during 
                    <strong className="text-blue-400"> Loan Product Creation</strong>. This configuration only determines 
                    <strong className="text-blue-400"> HOW</strong> that fee is handled (deducted upfront, added to repayment, etc.).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Disbursement Model */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Disbursement Model</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                  value={disbursementModel}
                  onChange={(e) => setDisbursementModel(e.target.value as any)}
                >
                  <option value="fee_deducted_upfront">📤 Fee Deducted Upfront (Current Default)</option>
                  <option value="fee_added_to_repayment">➕ Fee Added to Repayment</option>
                  <option value="no_fee_deduction">🚫 No Fee Deduction (Full Disbursement)</option>
                  <option value="interest_on_disbursed">💹 Interest on Disbursed Amount</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {disbursementModel === 'fee_deducted_upfront' && '✓ Client applies for KES 10,000 → Receives KES 9,000 → Repays KES 10,000 + Interest'}
                  {disbursementModel === 'fee_added_to_repayment' && '✓ Client applies for KES 10,000 → Receives KES 10,000 → Repays KES 11,000 + Interest'}
                  {disbursementModel === 'no_fee_deduction' && '✓ Client applies for KES 10,000 → Receives KES 10,000 → Repays KES 10,000 + Interest (No fee)'}
                  {disbursementModel === 'interest_on_disbursed' && '✓ Client applies for KES 10,000 → Receives KES 9,000 → Interest calculated on KES 9,000'}
                </p>
              </div>

              {/* Processing Fee - For Example Only */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Processing Fee (%) 
                    <span className="text-xs text-gray-500 ml-2">- Example Only</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={processingFeePercentage}
                    onChange={(e) => setProcessingFeePercentage(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for demonstration below</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Fee Optional?</label>
                  <div className="flex items-center h-[42px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isFeeOptional} 
                        onChange={(e) => setIsFeeOptional(e.target.checked)} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm text-gray-900">{isFeeOptional ? 'Yes' : 'No'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Example Calculator */}
              <div className="p-5 rounded-lg" style={{ backgroundColor: '#1a2942', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="size-5 text-blue-400" />
                  <h4 className="font-medium text-blue-300">Live Example Calculator</h4>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                    Demo Only
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Example Loan Amount</label>
                    <input
                      type="number"
                      value={exampleLoanAmount}
                      onChange={(e) => setExampleLoanAmount(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg text-gray-200"
                      style={{ backgroundColor: '#0f1829', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                      placeholder="Enter amount..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#0f1829', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <p className="text-xs text-gray-500 mb-1">Loan Applied For</p>
                      <p className="text-lg font-bold text-gray-200">{currencyCode} {example.principal.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#0f1829', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <p className="text-xs text-gray-500 mb-1">Processing Fee (Example)</p>
                      <p className="text-lg font-bold text-orange-400">{currencyCode} {example.fee.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#0f1829', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <p className="text-xs text-gray-500 mb-1">Cash Disbursed</p>
                      <p className="text-lg font-bold text-blue-400">{currencyCode} {example.disbursedAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#0f1829', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <p className="text-xs text-gray-500 mb-1">Interest Amount (15%)</p>
                      <p className="text-lg font-bold text-purple-400">{currencyCode} {example.interestAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f2638', border: '2px solid rgba(59, 130, 246, 0.4)' }}>
                    <p className="text-xs text-gray-500 mb-1">Total to Repay</p>
                    <p className="text-2xl font-bold text-blue-300">{currencyCode} {example.totalRepayment.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">{example.description}</p>
                  </div>
                </div>
              </div>

              {/* Scenario Comparison Table */}
              <div className="overflow-hidden border border-gray-300 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Scenario</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Disbursed</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">To Repay</th>
                      <th className="px-4 py-3 text-left text-gray-900 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 bg-white">
                      <td className="px-4 py-3 text-gray-900">Fee Deducted Upfront</td>
                      <td className="px-4 py-3 font-medium text-blue-600">KES 9,000</td>
                      <td className="px-4 py-3 font-medium text-gray-900">KES 11,500</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">Current default model</td>
                    </tr>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">Fee Added to Repayment</td>
                      <td className="px-4 py-3 font-medium text-blue-600">KES 10,000</td>
                      <td className="px-4 py-3 font-medium text-gray-900">KES 12,500</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">Client gets full amount</td>
                    </tr>
                    <tr className="border-t border-gray-200 bg-white">
                      <td className="px-4 py-3 text-gray-900">No Fee Deduction</td>
                      <td className="px-4 py-3 font-medium text-blue-600">KES 10,000</td>
                      <td className="px-4 py-3 font-medium text-gray-900">KES 11,500</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">No processing fee</td>
                    </tr>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">Interest on Disbursed</td>
                      <td className="px-4 py-3 font-medium text-blue-600">KES 9,000</td>
                      <td className="px-4 py-3 font-medium text-gray-900">KES 11,350</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">Lower interest amount</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings */}
      {activeSection === 'theme' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">Theme & Appearance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Current Theme</p>
                  <p className="text-sm text-gray-600">Select a theme for the application</p>
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={currentTheme.id}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Toggle dark mode</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isDark} onChange={toggleMode} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeSection === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">Notification Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Loan Approval Notifications</p>
                  <p className="text-sm text-gray-600">Get notified when loans require approval</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Payment Reminders</p>
                  <p className="text-sm text-gray-600">Receive payment due date reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Overdue Alerts</p>
                  <p className="text-sm text-gray-600">Get alerts for overdue loans</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeSection === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="size-5 text-emerald-600" />
              <h3 className="text-gray-900">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Session Timeout</p>
                  <p className="text-sm text-gray-600">Auto logout after inactivity</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Password Expiry</p>
                  <p className="text-sm text-gray-600">Require password change every</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription & Trial */}
      {activeSection === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="size-5 text-blue-600" />
              <h3 className="text-gray-900">Subscription Information</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your organization is currently on a <strong>14-day free trial</strong>. 
                The trial banner above shows your remaining days.
              </p>
              
              <div className="p-4 rounded-lg bg-[#1a1a2e] border border-blue-500/30">
                <h4 className="font-medium text-blue-300 mb-2">📦 What's Included</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Full access to all platform features</li>
                  <li>✓ Unlimited loan processing</li>
                  <li>✓ AI-powered insights and analytics</li>
                  <li>✓ Document management system</li>
                  <li>✓ Mobile banking integration</li>
                  <li>✓ SMS/Email notifications</li>
                  <li>✓ Complete reporting suite</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                <h4 className="font-medium text-yellow-300 mb-2">⚡ After Trial</h4>
                <p className="text-sm text-yellow-200">
                  To continue using SmartLenderUp after your trial ends, please contact our support team at{' '}
                  <strong className="text-yellow-100">support@smartlenderup.com</strong> for subscription pricing and payment details.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a2e] border border-gray-700/50">
                <div>
                  <p className="font-medium text-white">Need Help?</p>
                  <p className="text-sm text-gray-400">Contact our support team for assistance</p>
                </div>
                <button 
                  onClick={() => window.open('mailto:support@smartlenderup.com', '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {activeSection !== 'theme' && activeSection !== 'subscription' && (
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}