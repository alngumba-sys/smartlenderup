import { Shield, CheckCircle, XCircle, AlertCircle, FileText, Plus, Filter, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { ViewToggle } from '../ViewToggle';
import { useTheme } from '../../contexts/ThemeContext';

export function KYCTab() {
  const { isDark } = useTheme();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRiskRating, setFilterRiskRating] = useState<string>('all');
  const [selectedKYC, setSelectedKYC] = useState<string | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');
  const [newKYC, setNewKYC] = useState({
    clientId: '',
    clientName: ''
  });

  const { kycRecords, clients } = useData();

  const filteredKYC = kycRecords.filter(kyc => {
    const matchesStatus = filterStatus === 'all' || kyc.status === filterStatus;
    const matchesRisk = filterRiskRating === 'all' || kyc.riskRating === filterRiskRating;
    return matchesStatus && matchesRisk;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      Complete: 'bg-emerald-100 text-emerald-800',
      Incomplete: 'bg-red-100 text-red-800',
      'Pending Review': 'bg-blue-100 text-blue-800',
      Expired: 'bg-amber-100 text-amber-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      Low: 'bg-emerald-100 text-emerald-800',
      Medium: 'bg-amber-100 text-amber-800',
      High: 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="size-5 text-emerald-600" />
    ) : (
      <XCircle className="size-5 text-gray-400" />
    );
  };

  const isExpiringSoon = (nextReviewDate: string) => {
    const next = new Date(nextReviewDate);
    const today = new Date();
    const diffDays = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">KYC Verification</h2>
          <p className="text-gray-600">Know Your Customer compliance and verification</p>
        </div>
        <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm" onClick={() => setShowInitiateModal(true)}>
          <Plus className="size-4" />
          Initiate KYC
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-gray-900 text-2xl">{kycRecords.length}</p>
            </div>
            <Shield className="size-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Complete</p>
              <p className="text-gray-900 text-2xl">{kycRecords.filter(k => k.status === 'Complete').length}</p>
            </div>
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-gray-900 text-2xl">{kycRecords.filter(k => k.status === 'Pending Review').length}</p>
            </div>
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {kycRecords.filter(k => k.status === 'Pending Review').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Incomplete</p>
              <p className="text-gray-900 text-2xl">{kycRecords.filter(k => k.status === 'Incomplete').length}</p>
            </div>
            <div className="size-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              {kycRecords.filter(k => k.status === 'Incomplete').length}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-900 text-sm">High Risk</p>
              <p className="text-amber-900 text-2xl">{kycRecords.filter(k => k.riskRating === 'High').length}</p>
            </div>
            <AlertCircle className="size-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-600" />
            <span className="text-gray-700 text-sm">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Complete">Complete</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Risk Rating:</span>
            <select
              value={filterRiskRating}
              onChange={(e) => setFilterRiskRating(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <ViewToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* KYC Records List */}
      <div className="space-y-3">
        {filteredKYC.map((kyc) => {
          const expiringSoon = isExpiringSoon(kyc.nextReviewDate);
          return (
            <div
              key={kyc.id}
              onClick={() => setSelectedKYC(kyc.id === selectedKYC ? null : kyc.id)}
              className={`bg-white dark:bg-gray-800 rounded-lg border cursor-pointer transition-all ${
                kyc.status === 'Expired' ? 'border-red-300 bg-red-50' :
                expiringSoon ? 'border-amber-300 bg-amber-50' :
                'border-gray-200 hover:border-emerald-300'
              } ${selectedKYC === kyc.id ? 'ring-2 ring-emerald-500' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900">{kyc.clientName}</h3>
                      <span className="text-gray-500 text-sm">({kyc.clientId})</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(kyc.status)}`}>
                        {kyc.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskBadge(kyc.riskRating)}`}>
                        {kyc.riskRating} Risk
                      </span>
                      {expiringSoon && (
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="size-3" />
                          Review Due Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="text-gray-600">
                        <span className="text-xs">Last Review: {kyc.lastReviewDate}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="text-xs">Next Review: {kyc.nextReviewDate}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="text-xs">Reviewed by: {kyc.reviewedBy}</span>
                      </div>
                    </div>

                    {/* Verification Checklist */}
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs">
                        {getVerificationIcon(kyc.nationalIdVerified)}
                        <span className={kyc.nationalIdVerified ? 'text-emerald-700' : 'text-gray-500'}>
                          National ID
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {getVerificationIcon(kyc.addressVerified)}
                        <span className={kyc.addressVerified ? 'text-emerald-700' : 'text-gray-500'}>
                          Address
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {getVerificationIcon(kyc.phoneVerified)}
                        <span className={kyc.phoneVerified ? 'text-emerald-700' : 'text-gray-500'}>
                          Phone
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {getVerificationIcon(kyc.biometricsCollected)}
                        <span className={kyc.biometricsCollected ? 'text-emerald-700' : 'text-gray-500'}>
                          Biometrics
                        </span>
                      </div>
                    </div>

                    {kyc.notes && (
                      <p className="text-gray-600 text-sm">{kyc.notes}</p>
                    )}
                  </div>

                  {kyc.status !== 'Complete' && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Complete KYC verification');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>

                {selectedKYC === kyc.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <h4 className="text-gray-900 mb-2">Documents on File</h4>
                      <div className="flex flex-wrap gap-2">
                        {kyc.documentsOnFile.length > 0 ? (
                          kyc.documentsOnFile.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm">
                              <FileText className="size-4 text-blue-600" />
                              <span className="text-blue-900">{doc}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No documents on file</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        View Documents
                      </button>
                      <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                        View Client Profile
                      </button>
                      <button className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                        Schedule Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredKYC.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Shield className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No KYC records match your filters</p>
        </div>
      )}

      {/* Initiate KYC Modal */}
      {showInitiateModal && (
        <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center ${isDark ? 'dark' : ''}`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Initiate KYC</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowInitiateModal(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm">Client ID</label>
                <input
                  type="text"
                  value={newKYC.clientId}
                  onChange={(e) => setNewKYC({ ...newKYC, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Client Name</label>
                <input
                  type="text"
                  value={newKYC.clientName}
                  onChange={(e) => setNewKYC({ ...newKYC, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm" onClick={() => setShowInitiateModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm" onClick={() => {
                // Add new KYC record logic here
                setShowInitiateModal(false);
              }}>
                Initiate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}