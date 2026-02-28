import { useState, useMemo } from 'react';
import { FileText, Upload, Download, Eye, Trash2, Search, ChevronDown, ChevronRight, Grid, List, CheckSquare, Square, ChevronLeft, ChevronRight as ChevronRightIcon, Users, X, Calendar, User, Tag, FolderOpen, File } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';

type DocumentCategory = 'Client Documents' | 'Loan Agreements' | 'Collateral' | 'Guarantor Forms' | 'Meeting Minutes' | 'Legal Documents' | 'Other';

interface Document {
  id: string;
  name: string;
  type: string; // Store the actual document type
  category: DocumentCategory;
  uploadDate: string;
  uploadedBy: string;
  size: string;
  clientName?: string;
  clientId?: string;
  loanId?: string;
  status: 'Active' | 'Archived';
}

export function DocumentManagementTab() {
  const { isDark } = useTheme();
  const { clients, loanDocuments, loans, deleteLoanDocument, addLoanDocument } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'grouped'>('grouped'); // Changed default to 'grouped'
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadClientId, setUploadClientId] = useState<string>('');
  const [uploadLoanId, setUploadLoanId] = useState<string>('');
  const [uploadDocType, setUploadDocType] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Client Documents');
  
  // Client picture state
  const [clientPicture, setClientPicture] = useState<string | null>(null);
  const [showPictureUpload, setShowPictureUpload] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Transform loanDocuments from DataContext
  const documents: Document[] = useMemo(() => {
    return loanDocuments.map(doc => {
      const loan = loans.find(l => l.id === doc.loanId);
      const client = clients.find(c => c.id === loan?.clientId || c.id === loan?.clientUuid);
      
      let category: DocumentCategory = 'Other';
      if (['National ID', 'ID Copy', 'KRA PIN', 'KRA Pin', 'Passport Photo', 'Payslip', 'Bank Statement'].includes(doc.type)) {
        category = 'Client Documents';
      } else if (['Loan Agreement', 'Guarantor Form', 'Guarantor ID'].includes(doc.type)) {
        category = 'Loan Agreements';
      } else if (['Title Deed', 'Logbook', 'Insurance Certificate', 'Collateral Photo', 'Business Permit'].includes(doc.type)) {
        category = 'Collateral';
      }
      
      return {
        id: doc.id,
        name: doc.fileName,
        type: doc.type, // Store the actual document type
        category,
        uploadDate: doc.uploadDate,
        uploadedBy: doc.uploadedBy || 'System',
        size: doc.fileSize,
        clientName: client?.name || 'Unknown Client',
        clientId: loan?.clientId || loan?.clientUuid,
        loanId: doc.loanId,
        status: 'Active' as const
      };
    });
  }, [loanDocuments, loans, clients]);

  const categories: (DocumentCategory | 'All')[] = ['All', 'Client Documents', 'Loan Agreements', 'Collateral', 'Guarantor Forms', 'Meeting Minutes', 'Legal Documents', 'Other'];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesClient = selectedClient === 'all' || doc.clientId === selectedClient;
      return matchesSearch && matchesCategory && matchesClient;
    });
  }, [documents, searchQuery, selectedCategory, selectedClient]);

  const clientStats = useMemo(() => {
    return clients.map(client => ({
      id: client.id,
      name: client.name,
      count: documents.filter(d => d.clientId === client.id).length
    })).filter(client => client.count > 0);
  }, [clients, documents]);

  const groupedByClient = useMemo(() => {
    const grouped: Record<string, Document[]> = {};
    filteredDocuments.forEach(doc => {
      const clientId = doc.clientId || 'unknown';
      if (!grouped[clientId]) {
        grouped[clientId] = [];
      }
      grouped[clientId].push(doc);
    });
    return grouped;
  }, [filteredDocuments]);

  const getCategoryColor = (category: DocumentCategory) => {
    const colors = {
      'Client Documents': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Loan Agreements': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Collateral': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Guarantor Forms': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Meeting Minutes': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Legal Documents': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[category];
  };

  const handleSelectDoc = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDocs.size === paginatedDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(paginatedDocuments.map(d => d.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedDocs.size === 0) return;
    if (confirm(`Delete ${selectedDocs.size} selected document(s)?`)) {
      Array.from(selectedDocs).forEach(id => deleteLoanDocument(id));
      setSelectedDocs(new Set());
      toast.success(`${selectedDocs.size} document(s) deleted successfully`);
    }
  };

  const handleToggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const handleDownloadDocument = (doc: Document) => {
    // Create a placeholder text file with document info (since we don't have actual files)
    const documentInfo = `
Document: ${doc.name}
Type: ${doc.type}
Category: ${doc.category}
Client: ${doc.clientName}
Loan ID: ${doc.loanId}
Upload Date: ${doc.uploadDate}
Uploaded By: ${doc.uploadedBy}
Size: ${doc.size}

This is a placeholder download. In production, this would download the actual ${doc.type} file.
    `.trim();

    const blob = new Blob([documentInfo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${doc.name}`);
  };

  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Document Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Upload className="size-4" />
          Upload Document
        </button>
      </div>

      {/* Stats Cards - Subtle borders with colored icons */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Documents */}
        <div className="bg-white rounded-xl border border-red-100 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-semibold text-gray-900">{documents.length}</p>
              <p className="text-sm text-gray-500 mt-1">Total Documents</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="size-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Client Documents */}
        <div className="bg-white rounded-xl border border-red-100 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {documents.filter(d => d.category === 'Client Documents').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Client Documents</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <User className="size-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Loan Agreements */}
        <div className="bg-white rounded-xl border border-red-100 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {documents.filter(d => d.category === 'Loan Agreements').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Loan Agreements</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <FileText className="size-5 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-xl border border-red-100 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-semibold text-gray-900">{clientStats.length}</p>
              <p className="text-sm text-gray-500 mt-1">Active Clients</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Users className="size-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        {/* Client Picture Upload Card */}
        <div className="bg-white rounded-xl border border-red-100 p-5 hover:shadow-sm transition-shadow">
          <div className="flex flex-col items-center justify-center h-full">
            {clientPicture ? (
              <div className="relative group w-full">
                <img
                  src={clientPicture}
                  alt="Client"
                  className="w-full h-20 object-cover rounded-lg mb-2"
                />
                <button
                  onClick={() => {
                    setClientPicture(null);
                    toast.success('Picture removed');
                  }}
                  className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
                <p className="text-xs text-gray-500 text-center">Client Picture</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <input
                  type="file"
                  accept="image/*"
                  id="client-picture-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setClientPicture(event.target?.result as string);
                        toast.success('Picture uploaded successfully');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="client-picture-upload"
                  className="cursor-pointer flex flex-col items-center justify-center w-full"
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
                    <Upload className="size-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-900 font-medium text-center">Upload Client Picture</p>
                  <p className="text-xs text-gray-400 mt-0.5">Click to browse</p>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white rounded-xl border border-red-100 p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by document name or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | 'All')}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium min-w-[140px]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({documents.filter(d => cat === 'All' || d.category === cat).length})
              </option>
            ))}
          </select>

          {/* Client Filter */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium min-w-[160px]"
          >
            <option value="all">All Clients ({documents.length})</option>
            {clientStats.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.count})
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <List className="size-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Grid className="size-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'grouped'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Users className="size-4" />
              By Client
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocs.size > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              {selectedDocs.size} document{selectedDocs.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDocs(new Set())}
                className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Clear Selection
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
              >
                <Trash2 className="size-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedDocs.size === paginatedDocuments.length && paginatedDocuments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">Document</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">Type</th>
                  {selectedClient === 'all' && (
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">Client</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">Loan ID</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">Upload Date</th>
                  <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocs.has(doc.id)}
                        onChange={() => handleSelectDoc(doc.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="size-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">Uploaded by {doc.uploadedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(doc.category)}`}>
                        {doc.type}
                      </span>
                    </td>
                    {selectedClient === 'all' && (
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{doc.clientName}</td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{doc.loanId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingDocument(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${doc.name}"?`)) {
                              deleteLoanDocument(doc.id);
                              toast.success('Document deleted');
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {paginatedDocuments.length === 0 && (
            <div className="text-center py-16">
              <FileText className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-1">No documents found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedDocuments.map(doc => (
            <div
              key={doc.id}
              className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-all ${
                selectedDocs.has(doc.id) ? 'border-green-500' : 'border-red-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedDocs.has(doc.id)}
                  onChange={() => handleSelectDoc(doc.id)}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="size-5 text-blue-600" />
                </div>
              </div>
              
              <h4 className="text-sm text-gray-900 font-semibold mb-3 line-clamp-2 min-h-[40px]" title={doc.name}>{doc.name}</h4>
              
              <div className="space-y-2 mb-3">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                  {doc.type}
                </span>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {doc.clientName}
                </p>
                <p className="text-xs text-gray-500">{doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setViewingDocument(doc)}
                  className="flex-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                >
                  <Eye className="size-3.5" />
                  View
                </button>
                <button
                  onClick={() => handleDownloadDocument(doc)}
                  className="px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                >
                  <Download className="size-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${doc.name}"?`)) {
                      deleteLoanDocument(doc.id);
                      toast.success('Document deleted');
                    }
                  }}
                  className="px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          {paginatedDocuments.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-red-100">
              <FileText className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-medium">No documents found</p>
            </div>
          )}
        </div>
      )}

      {/* Grouped by Client View */}
      {viewMode === 'grouped' && (
        <div className="space-y-3">
          {Object.entries(groupedByClient).map(([clientId, clientDocs]) => {
            const client = clients.find(c => c.id === clientId);
            const isExpanded = expandedClients.has(clientId);
            
            return (
              <div key={clientId} className="bg-white rounded-xl border border-red-100 overflow-hidden">
                <button
                  onClick={() => handleToggleClient(clientId)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="size-4 text-gray-600" /> : <ChevronRight className="size-4 text-gray-600" />}
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                      <User className="size-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-900 font-semibold">{client?.name || 'Unknown Client'}</p>
                      <p className="text-xs text-gray-500">{clientDocs.length} document{clientDocs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-medium">
                      {clientDocs.reduce((acc, doc) => {
                        const size = parseFloat(doc.size);
                        return acc + (isNaN(size) ? 0 : size);
                      }, 0).toFixed(1)} KB total
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="divide-y divide-gray-100">
                      {clientDocs.map(doc => (
                        <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedDocs.has(doc.id)}
                              onChange={() => handleSelectDoc(doc.id)}
                              className="rounded border-gray-300"
                            />
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <FileText className="size-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 font-medium truncate">{doc.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                                  {doc.type}
                                </span>
                                <span className="text-xs text-gray-500">{doc.size}</span>
                                <span className="text-xs text-gray-400">• {new Date(doc.uploadDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <button
                              onClick={() => setViewingDocument(doc)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Download className="size-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${doc.name}"?`)) {
                                  deleteLoanDocument(doc.id);
                                  toast.success('Document deleted');
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(groupedByClient).length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-red-100">
              <FileText className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-medium">No documents found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-red-100 px-4 py-3">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length}
            </p>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-200 bg-white text-gray-900 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-black text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="size-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white text-lg">{viewingDocument.name}</h3>
                <button onClick={() => setViewingDocument(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(viewingDocument.category)}`}>
                    {viewingDocument.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Client:</span>
                  <span className="text-gray-900 dark:text-white">{viewingDocument.clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Loan ID:</span>
                  <span className="text-gray-900 dark:text-white">{viewingDocument.loanId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Size:</span>
                  <span className="text-gray-900 dark:text-white">{viewingDocument.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Upload Date:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(viewingDocument.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Uploaded By:</span>
                  <span className="text-gray-900 dark:text-white">{viewingDocument.uploadedBy}</span>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center mb-4">
                <FileText className="size-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">Document preview unavailable</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Download to view full document</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setViewingDocument(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleDownloadDocument(viewingDocument);
                    setViewingDocument(null);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <Download className="size-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 text-lg font-semibold">Upload Document</h3>
              <button onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadClientId('');
                setUploadLoanId('');
                setUploadDocType('');
                setUploadCategory('Client Documents');
              }} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                
                if (!uploadFile || !uploadClientId || !uploadLoanId || !uploadDocType) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                
                // Create document object
                const newDocument = {
                  id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  fileName: uploadFile.name,
                  type: uploadDocType,
                  fileSize: `${(uploadFile.size / 1024).toFixed(1)} KB`,
                  uploadDate: new Date().toISOString(),
                  uploadedBy: 'Current User',
                  status: 'Verified',
                  loanId: uploadLoanId,
                  verified: true
                };
                
                addLoanDocument(newDocument);
                toast.success('Document uploaded successfully');
                
                // Reset form
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadClientId('');
                setUploadLoanId('');
                setUploadDocType('');
                setUploadCategory('Client Documents');
              }}
              className="space-y-4"
            >
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
                {uploadFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <div className="flex items-center gap-2">
                  <User className="size-4 text-gray-500" />
                  <select
                    value={uploadClientId}
                    onChange={(e) => {
                      setUploadClientId(e.target.value);
                      setUploadLoanId(''); // Reset loan when client changes
                    }}
                    className="flex-1 px-3 py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan
                </label>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-gray-500" />
                  <select
                    value={uploadLoanId}
                    onChange={(e) => setUploadLoanId(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!uploadClientId}
                  >
                    <option value="">Select Loan</option>
                    {loans
                      .filter(loan => loan.clientId === uploadClientId || loan.clientUuid === uploadClientId)
                      .map(loan => (
                        <option key={loan.id} value={loan.id}>
                          {loan.loanNumber || loan.id} - {loan.productName} ({loan.status})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-gray-500" />
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  >
                    <option value="">Select Type</option>
                    <optgroup label="Client Documents">
                      <option value="National ID">National ID</option>
                      <option value="ID Copy">ID Copy</option>
                      <option value="KRA PIN">KRA PIN</option>
                      <option value="Passport Photo">Passport Photo</option>
                      <option value="Payslip">Payslip</option>
                      <option value="Bank Statement">Bank Statement</option>
                    </optgroup>
                    <optgroup label="Loan Documents">
                      <option value="Loan Agreement">Loan Agreement</option>
                      <option value="Guarantor Form">Guarantor Form</option>
                      <option value="Guarantor ID">Guarantor ID</option>
                    </optgroup>
                    <optgroup label="Collateral">
                      <option value="Title Deed">Title Deed</option>
                      <option value="Logbook">Logbook</option>
                      <option value="Insurance Certificate">Insurance Certificate</option>
                      <option value="Collateral Photo">Collateral Photo</option>
                      <option value="Business Permit">Business Permit</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="Meeting Minutes">Meeting Minutes</option>
                      <option value="Legal Document">Legal Document</option>
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadClientId('');
                    setUploadLoanId('');
                    setUploadDocType('');
                    setUploadCategory('Client Documents');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="size-4" />
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}