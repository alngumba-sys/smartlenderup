import { useState } from 'react';
import { X, Calendar, DollarSign, User, Building2, PercentIcon, AlertCircle, FileText, Shield, Users, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Printer, CreditCard, TrendingUp, Wallet, MapPin, Mail, Phone, MessageSquare, Upload, Download, Banknote } from 'lucide-react';
import { PrintableStatement } from './PrintableStatement';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';
import { generateInstallments, loanFees, loanInsurance, loanRestructures } from '../data/dummyData';
import { getCurrencyCode } from '../utils/currencyUtils';
import { EarlySettlementModal } from './modals/EarlySettlementModal';
import { AddGuarantorModal } from './modals/AddGuarantorModal';
import { AddCollateralModal } from './modals/AddCollateralModal';
import { RestructureLoanModal } from './modals/RestructureLoanModal';
import { AddLoanDocumentModal } from './modals/AddLoanDocumentModal';

interface LoanDetailsModalProps {
  loanId: string;
  onClose: () => void;
}

export function LoanDetailsModal({ loanId, onClose }: LoanDetailsModalProps) {
  const { isDark } = useTheme();
  const { 
    loans, 
    clients, 
    loanProducts, 
    updateLoan,
    payments,
    collaterals,
    guarantors,
    loanDocuments,
    approvals: allApprovals
  } = useData();
  const loan = loans.find(l => l.id === loanId);
  const client = loan ? clients.find(c => c.id === loan.clientId) : null;
  const product = loan ? loanProducts.find(p => p.id === loan.productId) : null;
  const installments = loan ? generateInstallments(loanId) : [];
  
  // Filter data from context arrays
  const loanCollaterals = collaterals.filter((c: any) => c.loanId === loanId);
  const loanGuarantors = guarantors.filter((g: any) => g.loanId === loanId);
  const documents = loanDocuments.filter((d: any) => d.loanId === loanId);
  const approvals = allApprovals.filter((a: any) => a.loanId === loanId);
  const fees = loanFees.filter(f => f.loanId === loanId);
  const insurance = loanInsurance.filter(i => i.loanId === loanId);
  const restructures = loanRestructures.filter(r => r.loanId === loanId);
  
  const currencyCode = getCurrencyCode();
  
  const [showEarlySettlement, setShowEarlySettlement] = useState(false);
  const [showAddGuarantor, setShowAddGuarantor] = useState(false);
  const [showAddCollateral, setShowAddCollateral] = useState(false);
  const [showRestructureLoan, setShowRestructureLoan] = useState(false);
  const [showRepaymentSchedule, setShowRepaymentSchedule] = useState(false);
  const [showNotDisbursedWarning, setShowNotDisbursedWarning] = useState(false);
  const [warningAction, setWarningAction] = useState<'settlement' | 'print'>('settlement');
  const [showWriteOffConfirm, setShowWriteOffConfirm] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);

  if (!loan || !client || !product) {
    return null;
  }

  const handlePrint = () => {
    // Check if loan is active (disbursed)
    if (loan.status !== 'Active') {
      setWarningAction('print');
      setShowNotDisbursedWarning(true);
      return;
    }
    
    const originalTitle = document.title;
    
    // Set temporary title for printing
    document.title = '                                                                                                                                           Loan Statement';
    
    // Trigger print
    window.print();
    
    // Restore original title after print dialog opens
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleEarlySettlement = () => {
    // Check if loan is active (disbursed)
    if (loan.status !== 'Active') {
      setWarningAction('settlement');
      setShowNotDisbursedWarning(true);
      return;
    }
    
    setShowEarlySettlement(true);
  };

  const handleWriteOff = () => {
    // Check if loan is active or in arrears
    if (loan.status !== 'Active' && loan.status !== 'In Arrears') {
      toast.error(`Cannot write off a ${loan.status.toLowerCase()} loan`);
      return;
    }
    
    setShowWriteOffConfirm(true);
  };

  const confirmWriteOff = () => {
    updateLoan(loanId, { 
      status: 'written_off'
    });
    
    toast.success(`Loan ${loanId} has been written off`);
    setShowWriteOffConfirm(false);
    
    // Optionally close the modal after write-off
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'In Arrears': return 'bg-red-100 text-red-800';
      case 'Fully Paid': return 'bg-blue-100 text-blue-800';
      case 'Written Off': return 'bg-pink-100 text-pink-800';
      case 'Pending': return 'bg-slate-100 text-slate-800';
      case 'Closed': return 'bg-purple-100 text-purple-800';
      case 'Approved': return 'bg-cyan-100 text-cyan-800';
      case 'Disbursed': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInstallmentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800';
      case 'Late Paid': return 'bg-amber-100 text-amber-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="size-4 text-emerald-600" />;
      case 'Rejected': return <XCircle className="size-4 text-red-600" />;
      case 'Pending': return <Clock className="size-4 text-amber-600" />;
      case 'On Hold': return <AlertCircle className="size-4 text-gray-600" />;
      default: return null;
    }
  };

  const [activeTab, setActiveTab] = useState('Repayment Schedule');

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-gray-900 mb-1">Loan Details: {loan.id}</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-700">{client.name}</span>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(loan.status)}`}>
                {loan.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Client Information Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left: Client Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">{client.name}</p>
                    <p className="text-gray-600 text-sm">{client.id}</p>
                  </div>
                </div>
                <div className="text-sm space-y-1 mt-3">
                  <p className="text-gray-700">Loan Officer: {loan.loanOfficer}</p>
                  <p className="text-gray-600">Created: {loan.disbursementDate}</p>
                  {client.businessName && (
                    <p className="text-gray-700">{client.businessName}</p>
                  )}
                </div>
              </div>

              {/* Middle: Address & Bank */}
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-700">Address: {client.address || 'Nairobi, Kenya'}</p>
                    <p className="text-gray-600">City: {client.city || 'Nairobi'}</p>
                  </div>
                </div>
                {client.bank && (
                  <div className="flex items-start gap-2">
                    <Building2 className="size-4 text-gray-400 mt-0.5" />
                    <p className="text-gray-700">Bank: {client.bank}</p>
                  </div>
                )}
              </div>

              {/* Right: Contact Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-gray-500" />
                  <p className="text-gray-700 text-sm">{client.email}</p>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2 justify-center">
                  <Mail className="size-4" />
                  Send Email
                </button>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="size-4 text-gray-500" />
                  <p className="text-gray-700 text-sm">{client.phone}</p>
                </div>
                <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 flex items-center gap-2 justify-center">
                  <MessageSquare className="size-4" />
                  Send SMS
                </button>
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-blue-900 text-sm">Principal Amount</p>
              <p className="text-blue-900 text-2xl mt-1">{currencyCode} {loan.principalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <p className="text-amber-900 text-sm">
                {loan.status === 'Active' ? 'Outstanding Balance' : 'Approved Amount'}
              </p>
              <p className="text-amber-900 text-2xl mt-1">{currencyCode} {loan.outstandingBalance.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <p className="text-emerald-900 text-sm">Interest Rate</p>
              <p className="text-emerald-900 text-2xl mt-1">{product.interestRate}% {product.interestType}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="text-purple-900 text-sm">Days in Arrears</p>
              <p className="text-purple-900 text-2xl mt-1">{loan.daysInArrears} days</p>
            </div>
          </div>

          {/* Tabs for different sections */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex gap-4 px-4 py-2 overflow-x-auto">
                {['Repayment Schedule', 'Collateral', 'Guarantors', 'Documents', 'Approval Workflow', 'Fees & Insurance'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-2 text-sm whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Repayment Schedule */}
              {activeTab === 'Repayment Schedule' && (
                <div className="space-y-4">
                  <h4 className="text-gray-900">Repayment Schedule ({installments.length} installments)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-700">#</th>
                          <th className="px-3 py-2 text-left text-gray-700">Due Date</th>
                          <th className="px-3 py-2 text-right text-gray-700">Principal</th>
                          <th className="px-3 py-2 text-right text-gray-700">Interest</th>
                          <th className="px-3 py-2 text-right text-gray-700">Total Amount</th>
                          <th className="px-3 py-2 text-center text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installments.map((inst) => (
                          <tr key={inst.installmentNo} className="border-t border-gray-100">
                            <td className="px-3 py-2 text-gray-900">{inst.installmentNo}</td>
                            <td className="px-3 py-2 text-gray-900">{inst.dueDate}</td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {inst.principalComponent.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {inst.interestComponent.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {inst.plannedAmount.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${getInstallmentStatusColor(inst.status)}`}>
                                {inst.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Collateral Section */}
              {activeTab === 'Collateral' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="size-5 text-purple-600" />
                    <h4 className="text-gray-900">Collateral ({loanCollaterals.length})</h4>
                  </div>
                  {loanCollaterals.length === 0 ? (
                    <p className="text-gray-600 text-sm">No collateral recorded for this loan</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-purple-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-purple-900">Type</th>
                            <th className="px-3 py-2 text-left text-purple-900">Description</th>
                            <th className="px-3 py-2 text-left text-purple-900">Document #</th>
                            <th className="px-3 py-2 text-left text-purple-900">Location</th>
                            <th className="px-3 py-2 text-left text-purple-900">Verified By</th>
                            <th className="px-3 py-2 text-left text-purple-900">Verification Date</th>
                            <th className="px-3 py-2 text-right text-purple-900">Estimated Value</th>
                            <th className="px-3 py-2 text-center text-purple-900">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loanCollaterals.map((col) => (
                            <tr key={col.id} className="border-t border-purple-100 hover:bg-purple-50/50">
                              <td className="px-3 py-2 text-gray-900">{col.type}</td>
                              <td className="px-3 py-2 text-gray-700">{col.description}</td>
                              <td className="px-3 py-2 text-gray-700">{col.documentNumber || '-'}</td>
                              <td className="px-3 py-2 text-gray-700">{col.location || '-'}</td>
                              <td className="px-3 py-2 text-gray-700">{col.verifiedBy}</td>
                              <td className="px-3 py-2 text-gray-700">{col.verificationDate}</td>
                              <td className="px-3 py-2 text-right text-gray-900">{currencyCode} {col.estimatedValue.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800">
                                  {col.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Guarantors Section */}
              {activeTab === 'Guarantors' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="size-5 text-blue-600" />
                    <h4 className="text-gray-900">Guarantors ({loanGuarantors.length})</h4>
                  </div>
                  {loanGuarantors.length === 0 ? (
                    <p className="text-gray-600 text-sm">No guarantors recorded for this loan</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-blue-900">Name</th>
                            <th className="px-3 py-2 text-left text-blue-900">ID Number</th>
                            <th className="px-3 py-2 text-left text-blue-900">Phone</th>
                            <th className="px-3 py-2 text-left text-blue-900">Relationship</th>
                            <th className="px-3 py-2 text-left text-blue-900">Employer</th>
                            <th className="px-3 py-2 text-right text-blue-900">Monthly Income</th>
                            <th className="px-3 py-2 text-right text-blue-900">Guaranteed Amount</th>
                            <th className="px-3 py-2 text-center text-blue-900">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loanGuarantors.map((guar) => (
                            <tr key={guar.id} className="border-t border-blue-100 hover:bg-blue-50/50">
                              <td className="px-3 py-2 text-gray-900">{guar.name}</td>
                              <td className="px-3 py-2 text-gray-700">{guar.nationalId}</td>
                              <td className="px-3 py-2 text-gray-700">{guar.phone}</td>
                              <td className="px-3 py-2 text-gray-700">{guar.relationship}</td>
                              <td className="px-3 py-2 text-gray-700">{guar.employer || '-'}</td>
                              <td className="px-3 py-2 text-right text-gray-700">
                                {guar.monthlyIncome > 0 ? `${currencyCode} ${guar.monthlyIncome.toLocaleString()}` : '-'}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-900">{currencyCode} {guar.guaranteedAmount.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800">
                                  {guar.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Section */}
              {activeTab === 'Documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-emerald-600" />
                      <h4 className="text-gray-900">Documents ({documents.length})</h4>
                    </div>
                    <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 flex items-center gap-2" onClick={() => setShowAddDocument(true)}>
                      <Upload className="size-4" />
                      Upload Document
                    </button>
                  </div>
                  {documents.length === 0 ? (
                    <p className="text-gray-600 text-sm">No documents uploaded for this loan</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <FileText className="size-5 text-gray-400" />
                            <div>
                              <p className="text-gray-900 text-sm">{doc.fileName}</p>
                              <p className="text-gray-600 text-xs">{doc.type} • Uploaded {doc.uploadDate} by {doc.uploadedBy}</p>
                              {doc.expiryDate && (
                                <p className="text-amber-600 text-xs">Expires: {doc.expiryDate}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                              doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {doc.status}
                            </span>
                            <button className="text-blue-600 hover:text-blue-700 text-sm">
                              <Download className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Approval Workflow */}
              {activeTab === 'Approval Workflow' && (() => {
                // Find the current step in the approval process
                const currentStepIndex = approvals.findIndex(a => a.status === 'Pending');
                const hasCurrentStep = currentStepIndex !== -1;
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-emerald-600" />
                        <h4 className="text-gray-900">Approval Workflow</h4>
                      </div>
                      {hasCurrentStep && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                          <Clock className="size-4 text-amber-600" />
                          <span className="text-amber-900 text-sm">Current: {approvals[currentStepIndex].stage}</span>
                        </div>
                      )}
                    </div>
                    {approvals.length === 0 ? (
                      <p className="text-gray-600 text-sm">No approval records found</p>
                    ) : (
                      <div className="space-y-3">
                        {approvals.map((approval, index) => {
                          const isCurrentStep = index === currentStepIndex;
                          const isPastStep = currentStepIndex === -1 ? approval.status === 'Approved' : index < currentStepIndex;
                          const isFutureStep = currentStepIndex !== -1 && index > currentStepIndex;
                          const isRejected = approval.status === 'Rejected';
                          
                          return (
                            <div 
                              key={approval.id} 
                              className={`relative pl-8 transition-opacity ${isFutureStep ? 'opacity-40' : 'opacity-100'}`}
                            >
                              {index < approvals.length - 1 && (
                                <div className={`absolute left-2 top-6 bottom-0 w-0.5 ${
                                  isPastStep ? 'bg-emerald-400' : 
                                  isCurrentStep ? 'bg-amber-300' : 
                                  'bg-gray-200'
                                }`}></div>
                              )}
                              <div className={`absolute left-0 top-1 size-4 rounded-full border-2 ${
                                isRejected ? 'bg-red-500 border-red-600' :
                                isPastStep ? 'bg-emerald-500 border-emerald-600' : 
                                isCurrentStep ? 'bg-amber-400 border-amber-600 animate-pulse' : 
                                'bg-white border-gray-300'
                              }`}></div>
                              <div className={`p-3 rounded-lg border ${
                                isRejected ? 'bg-red-50 border-red-200' :
                                isPastStep ? 'bg-emerald-50 border-emerald-200' : 
                                isCurrentStep ? 'bg-amber-50 border-amber-300' : 
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className={`${
                                        isRejected ? 'text-red-900' :
                                        isPastStep ? 'text-emerald-900' : 
                                        isCurrentStep ? 'text-amber-900' : 
                                        'text-gray-700'
                                      }`}>
                                        {approval.stage}
                                      </p>
                                      {isCurrentStep && (
                                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs rounded">
                                          In Progress
                                        </span>
                                      )}
                                      {isPastStep && !isRejected && (
                                        <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-xs rounded">
                                          Completed
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-sm ${
                                      isRejected ? 'text-red-700' :
                                      isPastStep ? 'text-emerald-700' : 
                                      isCurrentStep ? 'text-amber-700' : 
                                      'text-gray-500'
                                    }`}>
                                      {approval.approver} • {approval.approverRole}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getApprovalStatusIcon(approval.status)}
                                    <span className={`text-xs ${
                                      isRejected ? 'text-red-600' :
                                      isPastStep ? 'text-emerald-600' : 
                                      isCurrentStep ? 'text-amber-600' : 
                                      'text-gray-500'
                                    }`}>
                                      {approval.date}
                                    </span>
                                  </div>
                                </div>
                                <p className={`text-sm italic ${
                                  isRejected ? 'text-red-700' :
                                  isPastStep ? 'text-emerald-700' : 
                                  isCurrentStep ? 'text-amber-700' : 
                                  'text-gray-600'
                                }`}>
                                  {approval.comments}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Fees & Insurance */}
              {activeTab === 'Fees & Insurance' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="size-5 text-amber-600" />
                    <h4 className="text-gray-900">Fees & Charges</h4>
                  </div>
                  {fees.length === 0 ? (
                    <p className="text-gray-600 text-sm">No fees applied to this loan</p>
                  ) : (
                    <div className="space-y-2">
                      {fees.map((fee) => (
                        <div key={fee.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex justify-between items-center">
                          <div>
                            <p className="text-amber-900">{fee.feeType}</p>
                            <p className="text-amber-700 text-xs">Applied: {fee.appliedDate}</p>
                            {fee.waivedBy && (
                              <p className="text-amber-600 text-xs">Waived by {fee.waivedBy}: {fee.waivedReason}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-amber-900">{currencyCode} {fee.amount.toLocaleString()}</p>
                            <span className={`px-2 py-1 rounded text-xs ${
                              fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              fee.status === 'Waived' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {fee.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insurance */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="size-5 text-blue-600" />
                      <h4 className="text-gray-900">Insurance Coverage</h4>
                    </div>
                    {insurance.length === 0 ? (
                      <p className="text-gray-600 text-sm">No insurance coverage for this loan</p>
                    ) : (
                      <div className="space-y-2">
                        {insurance.map((ins) => (
                          <div key={ins.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-blue-900">{ins.insuranceType}</p>
                                <p className="text-blue-700 text-sm">{ins.provider}</p>
                                <p className="text-blue-600 text-xs">Policy: {ins.policyNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-blue-900">{currencyCode} {ins.coverageAmount.toLocaleString()}</p>
                                <p className="text-blue-700 text-xs">Premium: {currencyCode} {ins.premium.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-blue-700">
                              <p>{ins.startDate} to {ins.endDate}</p>
                              <span className={`px-2 py-1 rounded ${
                                ins.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                ins.status === 'Expired' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {ins.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Restructuring History */}
              {restructures.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="size-5 text-indigo-600" />
                    <h4 className="text-gray-900">Restructuring History</h4>
                  </div>
                  <div className="space-y-2">
                    {restructures.map((rest) => (
                      <div key={rest.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-indigo-900">Request Date: {rest.requestDate}</p>
                            <p className="text-indigo-700 text-sm italic">{rest.reason}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            rest.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            rest.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rest.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs text-indigo-700">
                          <div>
                            <p>Original Maturity: {rest.originalMaturityDate}</p>
                            <p>Original Installment: {currencyCode} {rest.originalInstallment.toLocaleString()}</p>
                          </div>
                          <div>
                            <p>New Maturity: {rest.newMaturityDate}</p>
                            <p>New Installment: {currencyCode} {rest.newInstallment.toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-indigo-600 text-xs mt-2">
                          Approved by {rest.approvedBy} on {rest.approvalDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <div className="flex gap-2">
            <button 
              onClick={handleEarlySettlement}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2"
            >
              <Banknote className="size-4" />
              Early Settlement
            </button>
            <button 
              onClick={() => setShowRestructureLoan(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
            >
              Restructure Loan
            </button>
            <button 
              onClick={() => setShowAddGuarantor(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <Users className="size-4" />
              Add Guarantor
            </button>
            <button 
              onClick={() => setShowAddCollateral(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
            >
              <Shield className="size-4" />
              Add Collateral
            </button>
            <button 
              onClick={handleWriteOff}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Write Off
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-2">
              <Printer className="size-4" />
              Print Statement
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm">
              Close
            </button>
          </div>
        </div>

        {/* Modals */}
        {showEarlySettlement && (
          <EarlySettlementModal
            loanId={loanId}
            onClose={() => setShowEarlySettlement(false)}
          />
        )}
        
        {showAddGuarantor && (
          <AddGuarantorModal
            loanAmount={loan.principalAmount}
            loanId={loanId}
            onClose={() => setShowAddGuarantor(false)}
          />
        )}
        
        {showAddCollateral && (
          <AddCollateralModal
            loanAmount={loan.principalAmount}
            loanId={loanId}
            onClose={() => setShowAddCollateral(false)}
          />
        )}
        
        {showRestructureLoan && (
          <RestructureLoanModal
            loanId={loanId}
            onClose={() => setShowRestructureLoan(false)}
          />
        )}
        
        {showRepaymentSchedule && (
          <RepaymentScheduleModal
            loan={loan}
            onClose={() => setShowRepaymentSchedule(false)}
          />
        )}
        
        {showAddDocument && (
          <AddLoanDocumentModal
            loanId={loanId}
            onClose={() => setShowAddDocument(false)}
          />
        )}
        
        {/* Not Disbursed Warning Popup */}
        {showNotDisbursedWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="size-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="size-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">Loan Not Disbursed</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {warningAction === 'settlement' 
                      ? 'Early settlement is only available for active (disbursed) loans. This loan has not been disbursed yet.'
                      : 'Statement printing is only available for active (disbursed) loans. This loan has not been disbursed yet.'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    Current loan status: <span className="font-semibold text-gray-900 dark:text-gray-100">{loan.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNotDisbursedWarning(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Write Off Confirmation Popup */}
        {showWriteOffConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="size-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">Confirm Write Off</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Are you sure you want to write off loan {loanId}? This action is irreversible.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowWriteOffConfirm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmWriteOff}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Write Off
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden Printable Statement */}
      <div className="hidden print:block">
        <PrintableStatement 
          loan={loan}
          client={client}
          product={product}
          installments={installments}
        />
      </div>
    </div>
  );
}