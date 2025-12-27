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
  const { clients, loanDocuments, loans, deleteLoanDocument } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'grouped'>('grouped'); // Changed default to 'grouped'
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Transform loanDocuments from DataContext
  const documents: Document[] = useMemo(() => {
    return loanDocuments.map(doc => {
      const loan = loans.find(l => l.id === doc.loanId);
      const client = clients.find(c => c.id === loan?.clientId);
      
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
        clientName: client?.name || 'Unknown',
        clientId: loan?.clientId,
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
    <div className={`p-6 space-y-6 ${isDark ? 'bg-[#111120]' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Document Management</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} 
            {selectedClient !== 'all' && ` from ${clients.find(c => c.id === selectedClient)?.name}`}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-[16px] py-[7px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
        >
          <Upload className="size-4" />
          Upload Document
        </button>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-900 dark:text-blue-100 text-xl">{documents.length}</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs">Total Docs</p>
            </div>
            <FileText className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-900 dark:text-emerald-100 text-xl">
                {documents.filter(d => d.category === 'Client Documents').length}
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs">Client Docs</p>
            </div>
            <User className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-900 dark:text-purple-100 text-xl">
                {documents.filter(d => d.category === 'Loan Agreements').length}
              </p>
              <p className="text-purple-600 dark:text-purple-400 text-xs">Agreements</p>
            </div>
            <FileText className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-900 dark:text-amber-100 text-xl">{clientStats.length}</p>
              <p className="text-amber-600 dark:text-amber-400 text-xs">Clients</p>
            </div>
            <Users className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white dark:bg-[#1a1a2e] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by document name or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | 'All')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({documents.filter(d => cat === 'All' || d.category === cat).length})
                </option>
              ))}
            </select>

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm min-w-[180px]"
            >
              <option value="all">All Clients ({documents.length})</option>
              {clientStats.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.count})
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="size-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="size-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                  viewMode === 'grouped'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Users className="size-4" />
                By Client
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocs.size > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDocs.size} document{selectedDocs.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDocs(new Set())}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear Selection
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedDocs.size === paginatedDocuments.length && paginatedDocuments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Document</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  {selectedClient === 'all' && (
                    <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Client</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Loan ID</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Upload Date</th>
                  <th className="px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocs.has(doc.id)}
                        onChange={() => handleSelectDoc(doc.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded by {doc.uploadedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getCategoryColor(doc.category)}`}>
                        {doc.type}
                      </span>
                    </td>
                    {selectedClient === 'all' && (
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{doc.clientName}</td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{doc.loanId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingDocument(doc)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="View"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
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
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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
            <div className="text-center py-12">
              <FileText className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No documents found</p>
              <p className="text-gray-500 text-xs mt-1">Try adjusting your filters</p>
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
              className={`bg-white dark:bg-[#1a1a2e] rounded-lg border p-4 hover:shadow-lg transition-shadow ${
                selectedDocs.has(doc.id) ? 'border-emerald-500 dark:border-emerald-600' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedDocs.has(doc.id)}
                  onChange={() => handleSelectDoc(doc.id)}
                  className="mt-1 rounded border-gray-300 dark:border-gray-600"
                />
                <FileText className="size-8 text-gray-400" />
              </div>
              
              <h4 className="text-sm text-gray-900 dark:text-white mb-2 line-clamp-2" title={doc.name}>{doc.name}</h4>
              
              <div className="space-y-1.5 mb-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs ${getCategoryColor(doc.category)}`}>
                  {doc.category}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <User className="size-3" />
                  {doc.clientName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewingDocument(doc)}
                  className="flex-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center gap-1 text-xs"
                >
                  <Eye className="size-3" />
                  View
                </button>
                <button
                  onClick={() => handleDownloadDocument(doc)}
                  className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 flex items-center justify-center gap-1 text-xs"
                >
                  <Download className="size-3" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${doc.name}"?`)) {
                      deleteLoanDocument(doc.id);
                      toast.success('Document deleted');
                    }
                  }}
                  className="px-2 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center gap-1 text-xs"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
          {paginatedDocuments.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-[#1a1a2e] rounded-lg border border-gray-200 dark:border-gray-700">
              <FileText className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No documents found</p>
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
              <div key={clientId} className="bg-white dark:bg-[#1a1a2e] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => handleToggleClient(clientId)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="size-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="size-4 text-gray-600 dark:text-gray-400" />}
                    <User className="size-5 text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <p className="text-sm text-gray-900 dark:text-white">{client?.name || 'Unknown Client'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{clientDocs.length} document{clientDocs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {clientDocs.reduce((acc, doc) => {
                        const size = parseFloat(doc.size);
                        return acc + (isNaN(size) ? 0 : size);
                      }, 0).toFixed(1)} KB total
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {clientDocs.map(doc => (
                        <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedDocs.has(doc.id)}
                              onChange={() => handleSelectDoc(doc.id)}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                            <FileText className="size-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white truncate">{doc.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(doc.category)}`}>
                                  {doc.category}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">• {new Date(doc.uploadDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <button
                              onClick={() => setViewingDocument(doc)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
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
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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
            <div className="text-center py-12 bg-white dark:bg-[#1a1a2e] rounded-lg border border-gray-200 dark:border-gray-700">
              <FileText className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No documents found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-[#1a1a2e] rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length}
            </p>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
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
              className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
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
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="size-4" />
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

      {/* Upload Modal - Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white text-lg">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Document upload feature coming soon. Documents are currently added when creating loans.</p>
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}