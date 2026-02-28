import { FileText, Upload, Download, Eye, Trash2, Filter, FolderOpen, Image, File, Search, User, Users } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'client'>('table');

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
    <div className={`p-6 space-y-6 ${isDark ? 'bg-[#111120]' : 'bg-[#FAFAFA]'} min-h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Document Management</h2>
          <p className="text-sm text-gray-600">{documents.length} documents</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium transition-colors">
          <Upload className="size-4" />
          Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Docs */}
        <div className="bg-[#D4D8E8] border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="size-5 text-[#5B6B9E]" />
              <span className="text-sm text-gray-700">Total Docs</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{documents.length}</p>
        </div>

        {/* Client Docs */}
        <div className="bg-[#D8E8E0] border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <User className="size-5 text-[#5E8F71]" />
              <span className="text-sm text-gray-700">Client Docs</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{categoryStats['Client Documents']}</p>
        </div>

        {/* Agreements */}
        <div className="bg-[#E8D8E8] border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="size-5 text-[#8F5E8F]" />
              <span className="text-sm text-gray-700">Agreements</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{categoryStats['Loan Agreements']}</p>
        </div>

        {/* Collateral */}
        <div className="bg-[#F5E8D8] border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-5 text-[#B8935E]" />
              <span className="text-sm text-gray-700">Clients</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{categoryStats['Collateral']}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#2C3547] border border-gray-600 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by document name or client"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1E2433] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-[#1E2433] border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All (0)</option>
              <option value="Client Documents">Client Documents ({categoryStats['Client Documents']})</option>
              <option value="Loan Agreements">Loan Agreements ({categoryStats['Loan Agreements']})</option>
              <option value="Collateral">Collateral ({categoryStats['Collateral']})</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-[#1E2433] border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Clients (0)</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 border-l border-gray-600 pl-2">
              <button 
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-black' 
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                ☰ Table
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-black' 
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                ⊞ Grid
              </button>
              <button 
                onClick={() => setViewMode('client')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'client' 
                    ? 'bg-white text-black' 
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                👤 By Client
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id === selectedDoc ? null : doc.id)}
              className={`bg-white border border-gray-300 rounded-lg cursor-pointer transition-all hover:shadow-md ${
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
                        <h3 className="font-semibold text-black mb-1">{doc.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{doc.relatedTo}</span>
                          <span className="text-gray-400">•</span>
                          <span>{doc.relatedId}</span>
                          <span className="text-gray-400">•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(doc.category)}`}>
                          {doc.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {doc.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Uploaded by {doc.uploadedBy}</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDoc === doc.id && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2 transition-colors">
                        <Eye className="size-4" />
                        View
                      </button>
                      <button className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 flex items-center gap-2 transition-colors">
                        <Download className="size-4" />
                        Download
                      </button>
                      <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
                        View Related Record
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center gap-2 ml-auto transition-colors" 
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
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg text-center py-16">
          <FileText className="size-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold text-black mb-2">No documents found</p>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
