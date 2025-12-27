import { X, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { loans, clients, loanProducts } from '../data/dummyData';
import { useTheme } from '../contexts/ThemeContext';

interface LoanRestructuringModalProps {
  loanId: string;
  onClose: () => void;
}

export function LoanRestructuringModal({ loanId, onClose }: LoanRestructuringModalProps) {
  const { isDark } = useTheme();
  const loan = loans.find(l => l.id === loanId);
  const client = clients.find(c => c.id === loan?.clientId);
  const product = loanProducts.find(p => p.id === loan?.productId);

  if (!loan || !client || !product) {
    return null;
  }

  const calculateRestructuredSchedule = () => {
    // Mock calculation for demonstration
    return {
      originalMonthlyPayment: 8500,
      newMonthlyPayment: 6200,
      extensionMonths: 3,
      newMaturityDate: '2026-03-01',
      restructuringFee: 500,
      totalSavings: 2300
    };
  };

  const restructuredData = calculateRestructuredSchedule();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">Loan Restructuring</h2>
            <p className="text-gray-600 text-sm">Review and approve restructuring request</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 text-sm">
                Loan restructuring will modify the repayment terms. This action requires management approval
                and will be reported to the Credit Reference Bureau.
              </p>
            </div>
          </div>

          {/* Current Loan Details */}
          <div>
            <h3 className="text-gray-900 mb-3">Current Loan Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Loan ID:</span>
                <span className="text-gray-900">{loan.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="text-gray-900">{client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="text-gray-900">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Principal Amount:</span>
                <span className="text-gray-900">KES {loan.principalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Balance:</span>
                <span className="text-gray-900">KES {loan.outstandingBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Maturity Date:</span>
                <span className="text-gray-900">{loan.maturityDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days in Arrears:</span>
                <span className={`${loan.daysInArrears > 0 ? 'text-red-700' : 'text-gray-900'}`}>
                  {loan.daysInArrears} days
                </span>
              </div>
            </div>
          </div>

          {/* Restructuring Options */}
          <div>
            <h3 className="text-gray-900 mb-3">Restructuring Proposal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm mb-2">Restructuring Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Extend Repayment Period</option>
                  <option>Payment Holiday (Moratorium)</option>
                  <option>Reduce Monthly Payment</option>
                  <option>Capitalize Arrears</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Extension Period (Months)</label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Restructuring Fee (KES)</label>
                  <input
                    type="number"
                    defaultValue={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-2">Reason for Restructuring</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Business Cash Flow Issues</option>
                  <option>Medical Emergency</option>
                  <option>Natural Disaster Impact</option>
                  <option>Family Emergency</option>
                  <option>Economic Downturn</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-2">Additional Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter additional notes or client explanation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="Client reports temporary cash flow issues due to slow business. Expects recovery in 2-3 months. Good payment history prior to current arrears."
                />
              </div>
            </div>
          </div>

          {/* Restructured Terms Preview */}
          <div>
            <h3 className="text-gray-900 mb-3">Proposed New Terms</h3>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Current Monthly Payment</p>
                  <p className="text-gray-900">KES {restructuredData.originalMonthlyPayment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-emerald-700 mb-1">New Monthly Payment</p>
                  <p className="text-emerald-900">
                    KES {restructuredData.newMonthlyPayment.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-emerald-200 pt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Extension Period</p>
                  <p className="text-gray-900">{restructuredData.extensionMonths} months</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">New Maturity Date</p>
                  <p className="text-gray-900">{restructuredData.newMaturityDate}</p>
                </div>
              </div>

              <div className="border-t border-emerald-200 pt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Restructuring Fee</p>
                  <p className="text-gray-900">KES {restructuredData.restructuringFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-emerald-700 mb-1">Monthly Payment Reduction</p>
                  <p className="text-emerald-900">
                    KES {restructuredData.totalSavings.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="text-gray-900 mb-3">Required Documents</h3>
            <div className="space-y-2">
              {[
                'Restructuring Request Letter',
                'Updated Business Financial Statements',
                'Updated Cash Flow Projection',
                'Guarantor Consent (if applicable)'
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" defaultChecked={idx === 0} />
                  <FileText className="size-4 text-gray-600" />
                  <span className="text-gray-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Analysis */}
          <div>
            <h3 className="text-gray-900 mb-3">Impact Analysis</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  i
                </div>
                <div>
                  <p className="text-blue-900">
                    • Loan will be flagged as restructured in credit bureau report
                  </p>
                  <p className="text-blue-900">
                    • Client credit score may be temporarily affected
                  </p>
                  <p className="text-blue-900">
                    • PAR (Portfolio at Risk) classification will be updated
                  </p>
                  <p className="text-blue-900">
                    • Reduced immediate collection pressure while maintaining client relationship
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval */}
          <div>
            <h3 className="text-gray-900 mb-3">Approval</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm mb-2">Credit Committee Decision</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Pending Review</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Requires Additional Information</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-2">Approval Comments</label>
                <textarea
                  rows={2}
                  placeholder="Enter approval comments or conditions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              Save as Draft
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Submit for Approval
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Approve & Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}