import { X, Calendar, DollarSign, Send, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';

interface DisbursementModalProps {
  loan: {
    id: string;
    clientId: string;
    clientName: string;
    principalAmount: number;
    productName: string;
    status: string;
  };
  onClose: () => void;
  onDisbursed?: () => void;
}

export function DisbursementModal({ loan, onClose, onDisbursed }: DisbursementModalProps) {
  const { isDark } = useTheme();
  const { addDisbursement, updateLoan, updateProcessingFeeRecord, getLoanProcessingFeeRecords, shareholders } = useData();
  const [formData, setFormData] = useState({
    scheduledDate: '',
    channel: 'M-Pesa' as 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque',
    mpesaNumber: '',
    bankName: '',
    accountNumber: '',
    reference: '',
    notes: ''
  });
  const [step, setStep] = useState<'schedule' | 'disburse'>('schedule');

  const handleScheduleDisbursement = () => {
    // Check if shareholders exist
    if (!shareholders || shareholders.length === 0) {
      toast.error('Cannot disburse loan', {
        description: 'You must add at least one shareholder to the system before disbursing loans. Please add shareholders in the Accounting tab.',
        duration: 6000
      });
      return;
    }

    if (!formData.scheduledDate) {
      toast.error('Please select a disbursement date');
      return;
    }

    if (formData.channel === 'M-Pesa' && !formData.mpesaNumber) {
      toast.error('Please enter M-Pesa number');
      return;
    }

    if (formData.channel === 'Bank Transfer' && (!formData.bankName || !formData.accountNumber)) {
      toast.error('Please enter bank details');
      return;
    }

    addDisbursement({
      loanId: loan.id,
      clientId: loan.clientId,
      clientName: loan.clientName,
      amount: loan.principalAmount,
      scheduledDate: formData.scheduledDate,
      channel: formData.channel,
      mpesaNumber: formData.mpesaNumber || undefined,
      bankName: formData.bankName || undefined,
      accountNumber: formData.accountNumber || undefined,
      reference: formData.reference || undefined,
      status: 'Scheduled',
      notes: formData.notes || undefined,
      createdBy: 'Current User' // Replace with actual user
    });

    toast.success('Disbursement scheduled successfully');
    setStep('disburse');
  };

  const handleDisburseLoan = () => {
    // Check if shareholders exist
    if (!shareholders || shareholders.length === 0) {
      toast.error('Cannot disburse loan', {
        description: 'You must add at least one shareholder to the system before disbursing loans. Please add shareholders in the Accounting tab.',
        duration: 6000
      });
      return;
    }

    // Update loan status to Active (Disbursed)
    updateLoan(loan.id, {
      status: 'Active',
      disbursedBy: 'Current User', // Replace with actual user
      disbursedDate: new Date().toISOString().split('T')[0],
      disbursementDate: new Date().toISOString().split('T')[0]
    });

    // Mark processing fee as collected
    const feeRecords = getLoanProcessingFeeRecords(loan.id);
    feeRecords.forEach(record => {
      if (record.status === 'Pending') {
        updateProcessingFeeRecord(record.id, {
          status: 'Collected',
          paymentMethod: formData.channel
        });
      }
    });

    toast.success(`Loan ${loan.id} disbursed successfully via ${formData.channel}`);
    
    if (onDisbursed) {
      onDisbursed();
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg max-w-2xl w-full`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={isDark ? 'text-white' : 'text-gray-900'}>
                {step === 'schedule' ? 'Schedule Disbursement' : 'Disburse Loan'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {loan.productName} - {loan.clientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loan Amount */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Disbursement Amount</p>
            <p className={`text-3xl ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
              KES {loan.principalAmount.toLocaleString()}
            </p>
          </div>

          {step === 'schedule' && (
            <>
              {/* Scheduled Date */}
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Scheduled Disbursement Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Disbursement Channel */}
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Disbursement Channel *
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* M-Pesa Number */}
              {formData.channel === 'M-Pesa' && (
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    M-Pesa Number *
                  </label>
                  <input
                    type="text"
                    value={formData.mpesaNumber}
                    onChange={(e) => setFormData({ ...formData, mpesaNumber: e.target.value })}
                    placeholder="254712345678"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              )}

              {/* Bank Details */}
              {formData.channel === 'Bank Transfer' && (
                <>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g., Equity Bank"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Account number"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Reference */}
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Optional reference number"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Add any additional notes"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </>
          )}

          {step === 'disburse' && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`size-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={isDark ? 'text-emerald-300' : 'text-emerald-900'}>
                    Ready to disburse this loan?
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Funds will be sent to <strong>{loan.clientName}</strong> via <strong>{formData.channel}</strong>
                  </p>
                  <ul className={`text-sm mt-3 space-y-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    <li>• Loan will be activated and appear in active loans</li>
                    <li>• Processing fee will be marked as collected</li>
                    <li>• Transaction will be recorded in Chart of Accounts</li>
                    <li>• Client will receive disbursement confirmation</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex justify-end gap-3`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          {step === 'schedule' ? (
            <button
              onClick={handleScheduleDisbursement}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Calendar className="size-4" />
              Schedule Disbursement
            </button>
          ) : (
            <button
              onClick={handleDisburseLoan}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <Send className="size-4" />
              Disburse Loan Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}