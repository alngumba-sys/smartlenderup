import { useState, useEffect } from 'react';
import { X, Calendar, FileText, AlertTriangle, User, Upload, Trash2, Info, CheckCircle, Edit2, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { getCurrencyCode, getCurrencySymbol } from '../../utils/currencyUtils';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/numberFormat';
import { calculateFacilitationFee, type FacilitationFeeBreakdown, saveFacilitationFeeConfig, getFacilitationFeeConfig } from '../../utils/facilitationFeeCalculator';
import { toast } from 'sonner';

interface NewLoanModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  preselectedClientId?: string;
  editingLoanId?: string | null;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: string;
}

export function NewLoanModal({ onClose, onSubmit, preselectedClientId, editingLoanId }: NewLoanModalProps) {
  const { isDark } = useTheme();
  useEscapeKey(onClose);
  const { clients, loanProducts, loanDocuments, loans, payments, payees } = useData();
  const [allowCustomRate, setAllowCustomRate] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [existingClientDocuments, setExistingClientDocuments] = useState<any[]>([]);
  const [showExistingDocsWarning, setShowExistingDocsWarning] = useState(false);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [scoringDetails, setScoringDetails] = useState<any>(null);
  const [hasPayments, setHasPayments] = useState(false);
  const [isManualFacilitationFee, setIsManualFacilitationFee] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState<FacilitationFeeBreakdown | null>(null);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [editingFeeConfig, setEditingFeeConfig] = useState(false);
  const [tempFeeConfig, setTempFeeConfig] = useState({
    processingFeeRate: 3.0,
    lifeInsuranceRate: 1.5,
    attestationFee: 1000,
    rtgsFee: 1000,
    crbCheckFee: 500
  });
  
  // Get active country currency
  const currencyCode = getCurrencyCode();
  const currencySymbol = getCurrencySymbol();
  
  const [formData, setFormData] = useState({
    clientId: preselectedClientId || '',
    productId: '',
    principalAmount: '',
    interestRate: '',
    loanTerm: '',
    termUnit: 'months',
    disbursementDate: new Date().toISOString().split('T')[0],
    purpose: '',
    collateralType: '',
    collateralValue: '',
    guarantorName: '',
    guarantorPhone: '',
    facilitationFee: '',
    staffMemberId: ''
  });

  // Pre-fill form data when editing a loan
  useEffect(() => {
    if (editingLoanId) {
      const loanToEdit = loans.find(l => l.id === editingLoanId);
      if (loanToEdit) {
        setFormData({
          clientId: loanToEdit.clientId || '',
          productId: loanToEdit.productId || '',
          principalAmount: loanToEdit.principalAmount?.toString() || '',
          interestRate: loanToEdit.interestRate?.toString() || '',
          loanTerm: loanToEdit.term?.toString() || '',
          termUnit: loanToEdit.termUnit || 'months',
          disbursementDate: loanToEdit.disbursementDate || new Date().toISOString().split('T')[0],
          purpose: loanToEdit.purpose || '',
          collateralType: '',
          collateralValue: '',
          guarantorName: '',
          guarantorPhone: '',
          facilitationFee: loanToEdit.facilitationFee?.toString() || loanToEdit.processingFee?.toString() || '',
          staffMemberId: loanToEdit.staffMemberId || ''
        });
      }
    }
  }, [editingLoanId, loans]);

  // Check for existing client documents when client is selected
  useEffect(() => {
    if (formData.clientId) {
      const clientDocs = loanDocuments.filter((doc: any) => doc.clientId === formData.clientId);
      setExistingClientDocuments(clientDocs);
      
      if (clientDocs.length > 0) {
        setShowExistingDocsWarning(true);
      }
    } else {
      setExistingClientDocuments([]);
      setShowExistingDocsWarning(false);
    }
  }, [formData.clientId, loanDocuments]);

  // Calculate credit score when client is selected
  useEffect(() => {
    if (formData.clientId) {
      calculateCreditScore();
    }
  }, [formData.clientId, formData.principalAmount, formData.collateralValue, formData.guarantorName, formData.guarantorPhone, uploadedDocuments]);

  // Auto-calculate facilitation fee when principal, product, or term changes
  useEffect(() => {
    // Only auto-calculate if not manually edited and we have the required data
    if (!isManualFacilitationFee && formData.principalAmount && formData.productId && formData.loanTerm) {
      const principal = parseFloat(formData.principalAmount);
      if (principal > 0) {
        const breakdown = calculateFacilitationFee(principal);
        setFeeBreakdown(breakdown);
        setFormData(prev => ({ ...prev, facilitationFee: breakdown.total.toString() }));
      }
    }
  }, [formData.principalAmount, formData.productId, formData.loanTerm, isManualFacilitationFee]);

  const calculateCreditScore = () => {
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    // Use client's existing credit score, or 300 for new clients with no history
    let baseScore = parseInt(client.creditScore) || 300;
    let adjustments: any = {
      base: baseScore,
      documentUpload: 0,
      loanAmount: 0,
      collateral: 0,
      guarantor: 0
    };

    // Document upload bonus (up to +30 points)
    if (uploadedDocuments.length >= 6) {
      adjustments.documentUpload = 30;
    } else if (uploadedDocuments.length >= 3) {
      adjustments.documentUpload = 15;
    } else if (uploadedDocuments.length >= 1) {
      adjustments.documentUpload = 5;
    }

    // Loan amount risk assessment
    const amount = parseFloat(formData.principalAmount) || 0;
    if (amount > 0 && amount <= 50000) {
      adjustments.loanAmount = 10; // Lower amount = lower risk
    } else if (amount > 100000) {
      adjustments.loanAmount = -10; // Higher amount = higher risk
    }

    // Collateral bonus
    const collateralValue = parseFloat(formData.collateralValue) || 0;
    if (collateralValue > amount * 1.5) {
      adjustments.collateral = 20;
    } else if (collateralValue > amount) {
      adjustments.collateral = 10;
    }

    // Guarantor bonus
    if (formData.guarantorName && formData.guarantorPhone) {
      adjustments.guarantor = 10;
    }

    const finalScore = Math.max(300, Math.min(850, 
      baseScore + 
      adjustments.documentUpload + 
      adjustments.loanAmount + 
      adjustments.collateral + 
      adjustments.guarantor
    ));

    setCreditScore(finalScore);
    setScoringDetails(adjustments);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocuments: UploadedDocument[] = Array.from(files).map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      category: 'Other' // Default category, can be changed based on file type
    }));

    setUploadedDocuments([...uploadedDocuments, ...newDocuments]);
  };

  const removeDocument = (docId: string) => {
    setUploadedDocuments(uploadedDocuments.filter(doc => doc.id !== docId));
  };

  const updateDocumentCategory = (docId: string, category: string) => {
    setUploadedDocuments(uploadedDocuments.map(doc => 
      doc.id === docId ? { ...doc, category } : doc
    ));
  };

  // Document categories
  const documentCategories = [
    'National ID',
    'Passport',
    'Bank Statement (3 months)',
    'Bank Statement (6 months)',
    'Business Permit/License',
    'Tax Certificate/PIN',
    'Payslip',
    'Utility Bill',
    'Collateral Document',
    'Reference Letter',
    'Photo/Selfie',
    'Business Plan',
    'Other'
  ];

  // Reset custom rate when modal opens
  useEffect(() => {
    setAllowCustomRate(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      documents: uploadedDocuments,
      creditScore: creditScore,
      scoringDetails: scoringDetails
    });
    onClose();
  };

  const handleProductChange = (productId: string) => {
    const product = loanProducts.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        productId: productId,
        interestRate: (product.interestRate || 0).toString()
      });
      setAllowCustomRate(false); // Reset custom rate when product changes
    }
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const selectedProduct = loanProducts.find(p => p.id === formData.productId);
  // Show all loan products created in Admin, not just active ones
  const availableProducts = loanProducts;

  // Calculate recommended loan amount based on credit score
  const getRecommendedLoanAmount = (score: number) => {
    if (score >= 800) return 500000;      // Excellent: Up to 500K
    if (score >= 740) return 350000;      // Very Good: Up to 350K
    if (score >= 670) return 200000;      // Good: Up to 200K
    if (score >= 580) return 100000;      // Fair: Up to 100K
    if (score >= 300) return 50000;       // Poor: Up to 50K
    return 0;
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-500';    // Excellent: 800-850
    if (score >= 740) return 'text-blue-500';     // Very Good: 740-799
    if (score >= 670) return 'text-cyan-500';     // Good: 670-739
    if (score >= 580) return 'text-yellow-500';   // Fair: 580-669
    if (score >= 300) return 'text-orange-500';   // Poor: 300-579
    return 'text-gray-500';
  };

  const getCreditScoreLabel = (score: number) => {
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    if (score >= 300) return 'Poor';
    return 'No History';
  };

  const getCreditScoreBgColor = (score: number) => {
    if (score >= 800) return 'bg-green-500';
    if (score >= 740) return 'bg-blue-500';
    if (score >= 670) return 'bg-cyan-500';
    if (score >= 580) return 'bg-yellow-500';
    if (score >= 300) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getCreditScoreBadgeClass = (score: number) => {
    if (score >= 740) return 'bg-green-100 text-green-800';
    if (score >= 670) return 'bg-blue-100 text-blue-800';
    if (score >= 580) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  const recommendedAmount = creditScore ? getRecommendedLoanAmount(creditScore) : 0;

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[96vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-blue-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-white text-xl font-semibold mb-0.5">
                {editingLoanId ? 'Edit Loan Application' : 'New Loan Application'}
              </h2>
              <p className="text-blue-200 text-xs">
                {editingLoanId ? 'Update loan application details (pending approval only)' : 'Create and submit a new loan application for client approval'}
              </p>
            </div>
            
            {/* Credit Score Display in Header - Compact Design */}
            {creditScore !== null && (
              <div className="flex items-center gap-2 ml-6">
                {/* Credit Score */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg">
                  <div className="text-center">
                    <p className="text-[10px] text-blue-200 font-medium leading-tight">Credit Score</p>
                    <p className={`font-bold ${getCreditScoreColor(creditScore)} text-2xl leading-tight`}>{creditScore}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCreditScoreBadgeClass(creditScore)}`}>
                      {getCreditScoreLabel(creditScore)}
                    </span>
                  </div>
                </div>
                
                {/* Max Recommended */}
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-lg shadow-lg">
                  <div className="text-center">
                    <p className="text-[10px] text-emerald-200 font-medium leading-tight">Max Recommended</p>
                    <p className="text-xl font-bold text-white leading-tight">{currencyCode} {(recommendedAmount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={onClose} 
              className="ml-4 text-blue-200 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {/* Section 1: Client & Product Selection */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-800">Client & Product Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Client Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Select Client <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.clientNumber || client.client_number || client.id} ({client.phone}) - Score: {client.creditScore || '300'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loan Product */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Loan Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select loan product...</option>
                    {availableProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.interestRate}% {product.interestType} | {product.repaymentFrequency} | 
                        {currencyCode} {(product.minAmount || 0).toLocaleString()} - {(product.maxAmount || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                {availableProducts.length === 0 && (
                  <p className="text-red-600 text-xs mt-1">No active loan products available. Please create one first.</p>
                )}
              </div>
            </div>

            {/* Client & Product Info Boxes - Combined */}
            {(selectedClient || selectedProduct) && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {selectedClient && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 font-medium">Score:</span>
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full font-semibold">{selectedClient.creditScore || '300'}</span>
                      </div>
                      <div className="w-px h-4 bg-blue-300"></div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 font-medium">Business:</span>
                        <span className="text-gray-900 font-semibold truncate">{selectedClient.businessType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedProduct && (
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 font-medium">Rate:</span>
                        <span className="text-emerald-700 font-semibold">{selectedProduct.interestRate}% {selectedProduct.interestType}</span>
                      </div>
                      <div className="w-px h-4 bg-emerald-300"></div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 font-medium">Tenor:</span>
                        <span className="text-gray-900 font-semibold">{selectedProduct.minTenor}-{selectedProduct.maxTenor}m</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Loan Details */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-800">Loan Details</h3>
            </div>
            
            <div className="grid grid-cols-5 gap-4 mb-3">
              {/* Principal Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Principal Amount ({currencyCode}) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formatNumberWithCommas(formData.principalAmount)}
                    onChange={(e) => setFormData({ ...formData, principalAmount: parseFormattedNumber(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
                {creditScore !== null && recommendedAmount > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    💡 Max: {currencyCode} {(recommendedAmount / 1000).toFixed(0)}K
                  </p>
                )}
              </div>
              
              {/* Interest Rate */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Interest Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.interestRate}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-gray-50 text-gray-700 rounded-lg cursor-not-allowed"
                  placeholder="10"
                />
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Loan Term (months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={selectedProduct?.minTenor || 1}
                  max={selectedProduct?.maxTenor || 60}
                  value={formData.loanTerm}
                  onChange={(e) => setFormData({ ...formData, loanTerm: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
                {selectedProduct && (
                  <p className="text-gray-500 text-xs mt-1">
                    Range: {selectedProduct.minTenor}-{selectedProduct.maxTenor}m
                  </p>
                )}
              </div>

              {/* Creation Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Creation Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={formData.disbursementDate}
                    onChange={(e) => setFormData({ ...formData, disbursementDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Facilitation Fee */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Facilitation Fee ({currencyCode})
                  </label>
                  <div className="flex items-center gap-1">
                    {feeBreakdown && (
                      <button
                        type="button"
                        onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        title={showFeeBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
                      >
                        📊
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsManualFacilitationFee(!isManualFacilitationFee)}
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      title={isManualFacilitationFee ? 'Use Auto-Calculate' : 'Manual Override'}
                    >
                      {isManualFacilitationFee ? '🔄' : '✏️'}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formatNumberWithCommas(formData.facilitationFee)}
                  onChange={(e) => {
                    setIsManualFacilitationFee(true);
                    setFormData({ ...formData, facilitationFee: parseFormattedNumber(e.target.value) });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    isManualFacilitationFee 
                      ? 'border-amber-300 bg-amber-50 text-gray-900 focus:ring-amber-500 focus:border-transparent' 
                      : 'border-gray-300 bg-white text-gray-900 focus:ring-emerald-500 focus:border-transparent'
                  }`}
                  placeholder="0.00"
                />
                {!isManualFacilitationFee && formData.principalAmount ? (
                  <p className="text-emerald-600 text-xs mt-1">✨ Auto-calculated</p>
                ) : isManualFacilitationFee ? (
                  <p className="text-amber-600 text-xs mt-1">Manual mode</p>
                ) : null}
              </div>
            </div>

            {/* Fee Breakdown Display - Full Width Below */}
            {showFeeBreakdown && feeBreakdown && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-800">Fee Breakdown:</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingFeeConfig) {
                        // Save the configuration
                        const config = getFacilitationFeeConfig();
                        const updatedConfig = {
                          ...config,
                          processingFeeRate: tempFeeConfig.processingFeeRate,
                          lifeInsuranceRate: tempFeeConfig.lifeInsuranceRate,
                          attestationFee: tempFeeConfig.attestationFee,
                          rtgsFee: tempFeeConfig.rtgsFee,
                          crbCheckFee: tempFeeConfig.crbCheckFee
                        };
                        saveFacilitationFeeConfig(updatedConfig);
                        
                        // Recalculate the fee breakdown with new config
                        if (formData.principalAmount) {
                          const principal = parseFloat(formData.principalAmount);
                          if (principal > 0) {
                            const breakdown = calculateFacilitationFee(principal, updatedConfig);
                            setFeeBreakdown(breakdown);
                            if (!isManualFacilitationFee) {
                              setFormData(prev => ({ ...prev, facilitationFee: breakdown.total.toString() }));
                            }
                          }
                        }
                        
                        toast.success('Fee structure saved successfully');
                        setEditingFeeConfig(false);
                      } else {
                        // Load current config into temp state
                        const config = getFacilitationFeeConfig();
                        setTempFeeConfig({
                          processingFeeRate: config.processingFeeRate,
                          lifeInsuranceRate: config.lifeInsuranceRate,
                          attestationFee: config.attestationFee,
                          rtgsFee: config.rtgsFee,
                          crbCheckFee: config.crbCheckFee
                        });
                        setEditingFeeConfig(true);
                      }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      editingFeeConfig 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {editingFeeConfig ? (
                      <>
                        <Save className="size-3.5" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit2 className="size-3.5" />
                        Edit
                      </>
                    )}
                  </button>
                </div>
                
                {editingFeeConfig ? (
                  // Editable Mode
                  <div className="grid grid-cols-5 gap-3">
                    {/* Processing Fee */}
                    <div className="bg-white rounded-lg p-2.5 border border-blue-300">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Processing (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={tempFeeConfig.processingFeeRate}
                        onChange={(e) => setTempFeeConfig({ ...tempFeeConfig, processingFeeRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {currencyCode} {Math.round((parseFloat(formData.principalAmount) || 0) * tempFeeConfig.processingFeeRate / 100).toLocaleString()}
                      </p>
                    </div>

                    {/* Life Insurance */}
                    <div className="bg-white rounded-lg p-2.5 border border-blue-300">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Life Insurance (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={tempFeeConfig.lifeInsuranceRate}
                        onChange={(e) => setTempFeeConfig({ ...tempFeeConfig, lifeInsuranceRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {currencyCode} {Math.round((parseFloat(formData.principalAmount) || 0) * tempFeeConfig.lifeInsuranceRate / 100).toLocaleString()}
                      </p>
                    </div>

                    {/* Attestation Fee */}
                    <div className="bg-white rounded-lg p-2.5 border border-blue-300">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Attestation:</label>
                      <input
                        type="number"
                        min="0"
                        value={tempFeeConfig.attestationFee}
                        onChange={(e) => setTempFeeConfig({ ...tempFeeConfig, attestationFee: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {currencyCode} {tempFeeConfig.attestationFee.toLocaleString()}
                      </p>
                    </div>

                    {/* RTGS Fee */}
                    <div className="bg-white rounded-lg p-2.5 border border-blue-300">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">RTGS:</label>
                      <input
                        type="number"
                        min="0"
                        value={tempFeeConfig.rtgsFee}
                        onChange={(e) => setTempFeeConfig({ ...tempFeeConfig, rtgsFee: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {currencyCode} {tempFeeConfig.rtgsFee.toLocaleString()}
                      </p>
                    </div>

                    {/* CRB Check Fee */}
                    <div className="bg-white rounded-lg p-2.5 border border-blue-300">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">CRB Check:</label>
                      <input
                        type="number"
                        min="0"
                        value={tempFeeConfig.crbCheckFee}
                        onChange={(e) => setTempFeeConfig({ ...tempFeeConfig, crbCheckFee: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {currencyCode} {tempFeeConfig.crbCheckFee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-white rounded-lg p-2.5 border border-blue-200">
                      <span className="block text-xs text-gray-600 mb-1">Processing (3%):</span>
                      <span className="block text-sm font-semibold text-gray-900">{currencyCode} {feeBreakdown.processingFee.toLocaleString()}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-blue-200">
                      <span className="block text-xs text-gray-600 mb-1">Life Insurance (1.5%):</span>
                      <span className="block text-sm font-semibold text-gray-900">{currencyCode} {feeBreakdown.lifeInsurance.toLocaleString()}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-blue-200">
                      <span className="block text-xs text-gray-600 mb-1">Attestation:</span>
                      <span className="block text-sm font-semibold text-gray-900">{currencyCode} {feeBreakdown.attestationFee.toLocaleString()}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-blue-200">
                      <span className="block text-xs text-gray-600 mb-1">RTGS:</span>
                      <span className="block text-sm font-semibold text-gray-900">{currencyCode} {feeBreakdown.rtgsFee.toLocaleString()}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-blue-200">
                      <span className="block text-xs text-gray-600 mb-1">CRB Check:</span>
                      <span className="block text-sm font-semibold text-gray-900">{currencyCode} {feeBreakdown.crbCheckFee.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                {/* Total Row */}
                <div className="mt-3 pt-3 border-t-2 border-blue-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Total Facilitation Fee:</span>
                    <span className="text-xl font-bold text-emerald-700">
                      {currencyCode} {editingFeeConfig ? (
                        Math.round(
                          (parseFloat(formData.principalAmount) || 0) * tempFeeConfig.processingFeeRate / 100 +
                          (parseFloat(formData.principalAmount) || 0) * tempFeeConfig.lifeInsuranceRate / 100 +
                          tempFeeConfig.attestationFee +
                          tempFeeConfig.rtgsFee +
                          tempFeeConfig.crbCheckFee
                        ).toLocaleString()
                      ) : (
                        feeBreakdown.total.toLocaleString()
                      )}
                    </span>
                  </div>
                  {editingFeeConfig && (
                    <p className="text-xs text-amber-600 mt-1 text-right">⚠️ Click "Save" to apply changes</p>
                  )}
                </div>
              </div>
            )}

            {/* Purpose - Full Width */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Loan Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Working capital, equipment, etc."
                />
              </div>

              {/* Staff Member (Deal Owner) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Staff Member (Who Brought This Deal) <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <select
                    value={formData.staffMemberId}
                    onChange={(e) => setFormData({ ...formData, staffMemberId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">No staff member assigned</option>
                    {payees.filter(p => (p.type === 'Employee' || p.category === 'Employee') && p.status === 'Active').map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Collateral & Guarantor */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-800">Security & Guarantor Information</h3>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {/* Collateral Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Collateral Type</label>
                <select
                  value={formData.collateralType}
                  onChange={(e) => setFormData({ ...formData, collateralType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">None</option>
                  <option value="Asset">Business Asset</option>
                  <option value="Property">Property</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Collateral Value */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Collateral Value ({currencyCode})</label>
                <input
                  type="text"
                  value={formatNumberWithCommas(formData.collateralValue)}
                  onChange={(e) => setFormData({ ...formData, collateralValue: parseFormattedNumber(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>

              {/* Guarantor Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Guarantor Name</label>
                <input
                  type="text"
                  value={formData.guarantorName}
                  onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Full name"
                />
              </div>

              {/* Guarantor Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Guarantor Phone</label>
                <input
                  type="tel"
                  value={formData.guarantorPhone}
                  onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Document Upload */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-orange-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-800">Supporting Documents</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-0.5">Upload Documents (Bank Statements, ID, Business Permit, etc.)</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow"
                  >
                    <Upload className="size-4" />
                    Choose Files
                  </label>
                  {uploadedDocuments.length > 0 && (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                      {uploadedDocuments.length} uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Credit Score Bonus Info */}
              <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="size-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-900">
                  <strong>Credit Bonus:</strong> 6+ docs: <span className="font-semibold text-emerald-600">+30pts</span> • 
                  3-5: <span className="font-semibold text-blue-600">+15pts</span> • 
                  1-2: <span className="font-semibold text-gray-600">+5pts</span>
                </p>
              </div>

              {uploadedDocuments.length > 0 && (
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  {uploadedDocuments.map(doc => (
                    <div key={doc.id} className="bg-white rounded-lg p-2.5 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <FileText className="size-4 text-blue-600" />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
                            <span className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={doc.category}
                              onChange={(e) => updateDocumentCategory(doc.id, e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {documentCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Warning for existing client documents */}
              {showExistingDocsWarning && existingClientDocuments.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-900 font-semibold mb-1">
                        📁 This client has {existingClientDocuments.length} document(s) on file
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowExistingDocsWarning(false)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedProduct}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Calendar className="size-5" />
              {editingLoanId ? 'Update Loan Application' : 'Create Loan Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}