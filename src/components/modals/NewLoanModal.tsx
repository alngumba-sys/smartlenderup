import { useState, useEffect } from 'react';
import { X, DollarSign, Info, AlertCircle, Upload, FileText, Trash2, CheckCircle, Calculator } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner@2.0.3';
import { getCurrencyCode } from '../../utils/currencyUtils';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/numberFormat';

interface NewLoanModalProps {
  onClose: () => void;
  onSubmit: (loanData: any) => void;
  preselectedClientId?: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: string;
}

export function NewLoanModal({ onClose, onSubmit, preselectedClientId }: NewLoanModalProps) {
  const { isDark } = useTheme();
  const { clients, loanProducts, loanDocuments } = useData();
  const [allowCustomRate, setAllowCustomRate] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [existingClientDocuments, setExistingClientDocuments] = useState<any[]>([]);
  const [showExistingDocsWarning, setShowExistingDocsWarning] = useState(false);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [scoringDetails, setScoringDetails] = useState<any>(null);
  
  // Get active country currency
  const currencyCode = getCurrencyCode();
  
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
    guarantorPhone: ''
  });

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

  const recommendedAmount = creditScore ? getRecommendedLoanAmount(creditScore) : 0;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#020838] border-b border-emerald-700 px-5 py-2.5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-white text-[20px]">New Loan Application</h2>
            <p className="text-gray-300 text-xs">Create a new loan for a client</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Credit Score Display in Header */}
            {creditScore !== null && (
              <>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                  <p className="text-xs text-gray-300 mb-1">Credit Score</p>
                  <p className={`text-3xl font-bold ${getCreditScoreColor(creditScore)}`}>{creditScore}</p>
                  <p className={`text-xs mt-0.5 ${getCreditScoreColor(creditScore)}`}>{getCreditScoreLabel(creditScore)}</p>
                </div>
                {/* Recommended Loan Amount */}
                <div className="text-center px-4 py-2 bg-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-lg">
                  <p className="text-xs text-emerald-200 mb-1">Max Recommended</p>
                  <p className="text-xl font-bold text-emerald-300">{currencyCode} {(recommendedAmount / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-emerald-200 mt-0.5">Based on score</p>
                </div>
              </>
            )}
            <button onClick={onClose} className="text-gray-300 hover:text-white">
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-6 gap-3">
            {/* Client Selection */}
            <div className="col-span-3">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Select Client *</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">Choose a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.id} ({client.phone}) - Score: {client.creditScore || '300'}
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Product */}
            <div className="col-span-3">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Loan Product *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="">Select loan product...</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.interestRate}% {product.interestType} | {product.repaymentFrequency} | 
                    {currencyCode} {(product.minAmount || 0).toLocaleString()} - {(product.maxAmount || 0).toLocaleString()}
                  </option>
                ))}
              </select>
              {availableProducts.length === 0 && (
                <p className="text-red-600 text-xs mt-1">No active loan products available. Please create one first.</p>
              )}
            </div>

            {/* Client Info Box - Compact */}
            {selectedClient && (
              <div className="col-span-6 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 dark:text-gray-400">Score: <strong className="text-blue-700 dark:text-blue-300">{selectedClient.creditScore || '300'}</strong></span>
                    <span className="text-gray-600 dark:text-gray-400">Business: <strong className="text-gray-900 dark:text-gray-100">{selectedClient.businessType || 'N/A'}</strong></span>
                    <span className="text-gray-600 dark:text-gray-400">Location: <strong className="text-gray-900 dark:text-gray-100">Nairobi</strong></span>
                    <span className="text-gray-600 dark:text-gray-400">Status: <strong className="text-gray-900 dark:text-gray-100">{selectedClient.status}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details - Compact */}
            {selectedProduct && (
              <div className="col-span-6 p-2 bg-gradient-to-r from-blue-50 to-emerald-50 dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Rate: <strong className="text-blue-900 dark:text-blue-300">{selectedProduct.interestRate}% {selectedProduct.interestType}</strong></span>
                  <span className="text-gray-600 dark:text-gray-400">Repayment: <strong className="text-gray-900 dark:text-gray-100">{selectedProduct.repaymentFrequency}</strong></span>
                  <span className="text-gray-600 dark:text-gray-400">Tenor: <strong className="text-gray-900 dark:text-gray-100">{selectedProduct.minTenor}-{selectedProduct.maxTenor} months</strong></span>
                  <span className="text-gray-600 dark:text-gray-400">Fee: <strong className="text-gray-900 dark:text-gray-100">{currencyCode} {selectedProduct.processingFee?.toLocaleString() || 0}</strong></span>
                </div>
              </div>
            )}

            {/* Principal Amount */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Principal Amount ({currencyCode}) *</label>
              <input
                type="text"
                required
                value={formatNumberWithCommas(formData.principalAmount)}
                onChange={(e) => setFormData({ ...formData, principalAmount: parseFormattedNumber(e.target.value) })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="0"
              />
              {creditScore !== null && recommendedAmount > 0 && (
                <p className="text-gray-500 text-xs mt-0.5">
                  Recommended {currencyCode} {(recommendedAmount / 1000).toFixed(0)}K
                </p>
              )}
            </div>
            
            {/* Interest Rate with Custom Override */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                Interest Rate (%) *
              </label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                max="100"
                value={formData.interestRate}
                readOnly
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm cursor-not-allowed"
                placeholder="10"
              />
            </div>

            {/* Loan Term */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Loan Term (months) *</label>
              <input
                type="number"
                required
                min={selectedProduct?.minTenor || 1}
                max={selectedProduct?.maxTenor || 60}
                value={formData.loanTerm}
                onChange={(e) => setFormData({ ...formData, loanTerm: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="0"
              />
              {selectedProduct && (
                <p className="text-gray-500 text-xs mt-0.5">
                  {selectedProduct.minTenor} - {selectedProduct.maxTenor} months
                </p>
              )}
            </div>

            {/* Creation Date */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Creation Date *</label>
              <input
                type="date"
                required
                value={formData.disbursementDate}
                onChange={(e) => setFormData({ ...formData, disbursementDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Purpose */}
            <div className="col-span-4">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Loan Purpose *</label>
              <textarea
                required
                rows={1}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                placeholder="Working capital, inventory purchase, equipment, etc."
              />
            </div>

            {/* Collateral Type */}
            <div className="col-span-1.5">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Collateral Type</label>
              <select
                value={formData.collateralType}
                onChange={(e) => setFormData({ ...formData, collateralType: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
            <div className="col-span-1.5">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Collateral Value ({currencyCode})</label>
              <input
                type="text"
                value={formatNumberWithCommas(formData.collateralValue)}
                onChange={(e) => setFormData({ ...formData, collateralValue: parseFormattedNumber(e.target.value) })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="0"
              />
            </div>

            {/* Guarantor Name */}
            <div className="col-span-1.5">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Guarantor Name</label>
              <input
                type="text"
                value={formData.guarantorName}
                onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Full name"
              />
            </div>

            {/* Guarantor Phone */}
            <div className="col-span-1.5">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Guarantor Phone</label>
              <input
                type="tel"
                value={formData.guarantorPhone}
                onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="0"
              />
            </div>

            {/* Document Upload */}
            <div className="col-span-6">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Upload Documents (Bank Statements, ID, Business Permit, etc.)
              </label>
              <div className="flex items-center gap-4 mb-3">
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
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                >
                  <Upload className="size-4" />
                  Choose Files
                </label>
                <p className="text-gray-500 text-sm">
                  {uploadedDocuments.length > 0 ? `${uploadedDocuments.length} document(s) uploaded` : 'No documents uploaded'}
                </p>
              </div>
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50 mb-2 px-[12px] py-[0px]">
                  {uploadedDocuments.map(doc => (
                    <div key={doc.id} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0 grid grid-cols-3 gap-3 items-center">
                          <div className="col-span-1">
                            <p className="text-gray-900 dark:text-gray-100 truncate text-sm">{doc.name}</p>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">{(doc.size / 1024).toFixed(1)} KB</span>
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Document Type:</label>
                            <select
                              value={doc.category}
                              onChange={(e) => updateDocumentCategory(doc.id, e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                6+ documents: +30 points • 3-5 docs: +15 points
              </p>
              
              {/* Warning for existing client documents */}
              {showExistingDocsWarning && existingClientDocuments.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                        This client already has {existingClientDocuments.length} document(s) on file
                      </p>
                      <div className="space-y-1 mb-3">
                        {existingClientDocuments.slice(0, 5).map((doc: any) => (
                          <div key={doc.id} className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                            <CheckCircle className="size-3" />
                            <span>{doc.type} - {doc.fileName}</span>
                            <span className="text-blue-500 dark:text-blue-400">({doc.uploadDate})</span>
                          </div>
                        ))}
                        {existingClientDocuments.length > 5 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                            ... and {existingClientDocuments.length - 5} more
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        ✓ You can reuse existing documents without uploading duplicates
                        <br />
                        ✓ If needed, you can still upload new/updated documents
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowExistingDocsWarning(false)}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
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
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedProduct}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <DollarSign className="size-4" />
              Create Loan Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}