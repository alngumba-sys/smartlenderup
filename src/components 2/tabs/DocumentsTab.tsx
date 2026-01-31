import { FileText, Upload, Download, Eye, Trash2, Filter, FolderOpen, Image, File, Search, User } from 'lucide-react';
import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  category: 'Client Documents' | 'Loan Agreements' | 'Collateral' | 'other';
  type: 'pdf' | 'image' | 'doc' | 'excel' | 'other';
  size: string;
  uploadedBy: string;
  uploadDate: string;
  relatedTo: string;
  relatedId: string;
  status: 'Verified' | 'Pending' | 'Expired';
  tags: string[];
}

export function DocumentsTab() {
  const { isDark } = useTheme();
  const { loanDocuments, loans, clients, deleteLoanDocument } = useData();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  console.log('DocumentsTab - loanDocuments:', loanDocuments);
  console.log('DocumentsTab - loans:', loans);
  console.log('DocumentsTab - clients:', clients);

  // Transform loan documents to match the Document interface
  const transformedDocuments: Document[] = loanDocuments.map(doc => {
    const loan = loans.find(l => l.id === doc.loanId);
    const client = clients.find(c => c.id === loan?.clientId);
    
    console.log(`Processing doc ${doc.id}:`, {
      fileName: doc.fileName,
      loanId: doc.loanId,
      loan: loan?.id,
      clientId: loan?.clientId,
      client: client?.name
    });
    
    // Determine category based on document type
    let category: 'Client Documents' | 'Loan Agreements' | 'Collateral' | 'other' = 'other';
    if (['National ID', 'ID Copy', 'KRA PIN', 'KRA Pin', 'Passport Photo', 'Payslip', 'Bank Statement'].includes(doc.type)) {
      category = 'Client Documents';
    } else if (['Loan Agreement', 'Guarantor Form', 'Guarantor ID'].includes(doc.type)) {
      category = 'Loan Agreements';
    } else if (['Title Deed', 'Logbook', 'Insurance Certificate', 'Collateral Photo', 'Business Permit'].includes(doc.type)) {
      category = 'Collateral';
    }
    
    // Determine file type from extension
    let fileType: 'pdf' | 'image' | 'doc' | 'excel' | 'other' = 'other';
    const extension = doc.fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') fileType = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) fileType = 'image';
    else if (['doc', 'docx'].includes(extension || '')) fileType = 'doc';
    else if (['xls', 'xlsx'].includes(extension || '')) fileType = 'excel';
    
    return {
      id: doc.id,
      name: doc.fileName,
      category,
      type: fileType,
      size: doc.fileSize,
      uploadedBy: doc.uploadedBy || 'System',
      uploadDate: doc.uploadDate,
      relatedTo: client?.name || 'Unknown Client',
      relatedId: doc.loanId,
      status: doc.status as 'Verified' | 'Pending' | 'Expired',
      tags: [doc.type, loan?.productName || 'Loan']
    };
  });

  const documents: Document[] = transformedDocuments;

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.relatedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="size-5 text-red-600" />;
      case 'image':
        return <Image className="size-5 text-blue-600" />;
      case 'doc':
        return <FileText className="size-5 text-blue-800" />;
      case 'excel':
        return <FileText className="size-5 text-emerald-600" />;
      default:
        return <File className="size-5 text-gray-600" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Client Documents': 'bg-blue-100 text-blue-800',
      'Loan Agreements': 'bg-emerald-100 text-emerald-800',
      'Collateral': 'bg-purple-100 text-purple-800',
      'other': 'bg-amber-100 text-amber-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Verified': 'bg-emerald-100 text-emerald-800',
      'Pending': 'bg-gray-100 text-gray-800',
      'Expired': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const categoryStats = {
    'Client Documents': documents.filter(d => d.category === 'Client Documents').length,
    'Loan Agreements': documents.filter(d => d.category === 'Loan Agreements').length,
    'Collateral': documents.filter(d => d.category === 'Collateral').length,
    'other': documents.filter(d => d.category === 'other').length
  };

  const handleDeleteDocument = (docId: string, docName: string) => {
    if (confirm(`Are you sure you want to delete "${docName}"?`)) {
      deleteLoanDocument(docId);
      setSelectedDoc(null);
      toast.success('Document deleted successfully');
    }
  };

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-[#111120]' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Document Management</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Centralized document storage and management</p>
        </div>
        <button className="px-[16px] py-[7px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm">
          <Upload className="size-4" />
          Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1a1d2e] border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Documents</p>
              <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{documents.length}</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>All categories</p>
            </div>
            <FileText className="size-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1a3a2e] border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>Client Documents</p>
              <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{categoryStats['Client Documents']}</p>
              <p className={`text-xs ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>ID, payslips, etc.</p>
            </div>
            <User className="size-12 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#2a1d3e] border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>Loan Agreements</p>
              <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{categoryStats['Loan Agreements']}</p>
              <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Contracts & forms</p>
            </div>
            <FileText className="size-12 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#3a2d1e] border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Collateral</p>
              <p className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{categoryStats['Collateral']}</p>
              <p className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Title deeds, assets</p>
            </div>
            <FolderOpen className="size-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1a1d2e] border-gray-700' : 'bg-white border-gray-200'} space-y-3`}>
        <div className="flex items-center gap-2">
          <Search className="size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents by name or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 px-3 py-2 border rounded text-sm ${isDark ? 'bg-[#111120] border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-1.5 border rounded text-sm ${isDark ? 'bg-[#111120] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">All ({documents.length})</option>
              <option value="Client Documents">Client Documents ({categoryStats['Client Documents']})</option>
              <option value="Loan Agreements">Loan Agreements ({categoryStats['Loan Agreements']})</option>
              <option value="Collateral">Collateral ({categoryStats['Collateral']})</option>
              <option value="other">Other ({categoryStats['other']})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc.id === selectedDoc ? null : doc.id)}
            className={`rounded-lg border cursor-pointer transition-all ${isDark ? 'bg-[#1a1d2e] border-gray-700 hover:border-emerald-600' : 'bg-white border-gray-200 hover:border-emerald-300'} ${
              selectedDoc === doc.id ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(doc.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{doc.name}</h3>
                      <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>{doc.relatedTo}</span>
                        <span className="text-gray-500">•</span>
                        <span>{doc.relatedId}</span>
                        <span className="text-gray-500">•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadge(doc.category)}`}>
                        {doc.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {doc.tags.map((tag, idx) => (
                        <span key={idx} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      <span>Uploaded by {doc.uploadedBy}</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDoc === doc.id && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2">
                      <Eye className="size-4" />
                      View
                    </button>
                    <button className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 flex items-center gap-2">
                      <Download className="size-4" />
                      Download
                    </button>
                    <button className={`px-3 py-1.5 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      View Related Record
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center gap-2 ml-auto" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id, doc.name);
                      }}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className={`text-center py-16 rounded-lg border ${isDark ? 'bg-[#1a1d2e] border-gray-700' : 'bg-white border-gray-200'}`}>
          <FileText className={`size-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>No documents found</p>
          <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}