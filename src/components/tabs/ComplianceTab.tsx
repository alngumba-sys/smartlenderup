import { FileCheck, Download, Calendar, CheckCircle, Clock, AlertCircle, BarChart3, XCircle, X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { complianceReports } from '../../data/dummyData';
import { useTheme } from '../../contexts/ThemeContext';

export function ComplianceTab() {
  const { isDark } = useTheme();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'metrics'>('reports');
  const [activeModal, setActiveModal] = useState<'total' | 'approved' | 'pending' | 'issues' | null>(null);

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: 'bg-gray-100 text-gray-800',
      Submitted: 'bg-blue-100 text-blue-800',
      Approved: 'bg-emerald-100 text-emerald-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="size-5 text-emerald-600" />;
      case 'Submitted':
        return <Clock className="size-5 text-blue-600" />;
      case 'Rejected':
        return <XCircle className="size-5 text-red-600" />;
      default:
        return <FileCheck className="size-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Compliance & Regulatory</h2>
          <p className="text-gray-600">CBK reporting and regulatory compliance management</p>
        </div>
        <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm">
          <Download className="size-4" />
          Export All Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveModal('total')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Reports</p>
              <p className="text-gray-900 text-2xl">{complianceReports.length}</p>
            </div>
            <FileCheck className="size-8 text-blue-600" />
          </div>
        </div>
        <div 
          onClick={() => setActiveModal('approved')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-gray-900 text-2xl">{complianceReports.filter(r => r.status === 'Approved').length}</p>
            </div>
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
        </div>
        <div 
          onClick={() => setActiveModal('pending')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-gray-900 text-2xl">
                {complianceReports.filter(r => r.status === 'Draft' || r.status === 'Submitted').length}
              </p>
            </div>
            <Clock className="size-8 text-blue-600" />
          </div>
        </div>
        <div 
          onClick={() => setActiveModal('issues')}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-amber-300 dark:hover:border-amber-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Issues Found</p>
              <p className="text-gray-900 text-2xl">
                {complianceReports.reduce((sum, r) => sum + r.issuesIdentified, 0)}
              </p>
            </div>
            <AlertCircle className="size-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 ${
            activeSubTab === 'reports'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Regulatory Reports
        </button>
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`px-4 py-2 ${
            activeSubTab === 'metrics'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Compliance Metrics
        </button>
      </div>

      {activeSubTab === 'reports' && (
        <>
          {/* Reports List */}
          <div className="space-y-3">
            {complianceReports.map((report) => {
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id === selectedReport ? null : report.id)}
                  className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-600 ${
                    selectedReport === report.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(report.status)}
                          <h3 className="text-gray-900">{report.reportType}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm flex-wrap mb-2">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="size-4" />
                            <span>Period: {report.reportingPeriod}</span>
                          </div>
                          <div className="text-gray-600">
                            <span>Report Date: {report.reportDate}</span>
                          </div>
                          {report.submissionDate && (
                            <div className="text-blue-700">
                              <span>Submitted: {report.submissionDate}</span>
                            </div>
                          )}
                          {report.approvalDate && (
                            <div className="text-emerald-700">
                              <span>Approved: {report.approvalDate}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div>Submitted to: {report.submittedTo}</div>
                          <div>Prepared by: {report.submittedBy}</div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-gray-600">
                            Findings: <span className="text-gray-900">{report.findings}</span>
                          </div>
                          <div className="text-gray-600">
                            Issues: <span className={report.issuesIdentified > 0 ? 'text-amber-700' : 'text-emerald-700'}>{report.issuesIdentified}</span>
                          </div>
                        </div>

                        {report.notes && (
                          <p className="text-gray-600 text-sm mt-2">{report.notes}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {report.status === 'Approved' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Download report');
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Download className="size-4" />
                            Download
                          </button>
                        ) : report.status === 'Submitted' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Approve report');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Submit report');
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeSubTab === 'metrics' && (
        <div className="space-y-6">
          {/* Compliance Metrics Dashboard */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="size-5 text-blue-600" />
              <h3 className="text-gray-900">Portfolio Quality Metrics (Current)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Portfolio at Risk (PAR 30)</p>
                <div className="flex items-end gap-2">
                  <p className="text-gray-900 text-3xl">3.2%</p>
                  <span className="text-emerald-600 text-sm mb-1">Within limit</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: '32%' }}></div>
                </div>
                <p className="text-gray-500 text-xs">Regulatory limit: 10%</p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Capital Adequacy Ratio</p>
                <div className="flex items-end gap-2">
                  <p className="text-gray-900 text-3xl">18.5%</p>
                  <span className="text-emerald-600 text-sm mb-1">Compliant</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: '74%' }}></div>
                </div>
                <p className="text-gray-500 text-xs">Minimum required: 15%</p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Loan Loss Provision Coverage</p>
                <div className="flex items-end gap-2">
                  <p className="text-gray-900 text-3xl">125%</p>
                  <span className="text-emerald-600 text-sm mb-1">Adequate</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: '100%' }}></div>
                </div>
                <p className="text-gray-500 text-xs">Target: 100%</p>
              </div>
            </div>
          </div>

          {/* AML Compliance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 mb-4">Anti-Money Laundering (AML) Compliance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="text-blue-900 text-sm mb-1">KYC Completion Rate</p>
                <p className="text-blue-900 text-2xl">98.5%</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                <p className="text-emerald-900 text-sm mb-1">Suspicious Transactions</p>
                <p className="text-emerald-900 text-2xl">0</p>
                <p className="text-emerald-700 text-xs">This quarter</p>
              </div>
              <div className="bg-amber-50 p-4 rounded border border-amber-200">
                <p className="text-amber-900 text-sm mb-1">Enhanced Due Diligence</p>
                <p className="text-amber-900 text-2xl">3</p>
                <p className="text-amber-700 text-xs">In progress</p>
              </div>
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <p className="text-purple-900 text-sm mb-1">High Value Transactions</p>
                <p className="text-purple-900 text-2xl">12</p>
                <p className="text-purple-700 text-xs">This month</p>
              </div>
            </div>
          </div>

          {/* CBK Reporting Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 mb-4">CBK Reporting Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-emerald-600" />
                  <div>
                    <p className="text-gray-900 text-sm">Monthly Returns</p>
                    <p className="text-gray-600 text-xs">All submissions up to date</p>
                  </div>
                </div>
                <span className="text-emerald-700 text-sm">100% Compliant</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-emerald-600" />
                  <div>
                    <p className="text-gray-900 text-sm">Quarterly Reports</p>
                    <p className="text-gray-600 text-xs">Q4 2024 submitted on time</p>
                  </div>
                </div>
                <span className="text-emerald-700 text-sm">On Time</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-blue-600" />
                  <div>
                    <p className="text-gray-900 text-sm">Annual Audit</p>
                    <p className="text-gray-600 text-xs">Due: March 31, 2025</p>
                  </div>
                </div>
                <span className="text-blue-700 text-sm">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Total Reports */}
      {activeModal === 'total' && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`} onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="size-6 text-blue-600" />
                <h3 className="text-gray-900 text-lg">Total Compliance Reports</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-900 text-sm mb-1">Total Reports</p>
                  <p className="text-blue-900 text-3xl">{complianceReports.length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-emerald-900 text-sm mb-1">Compliance Rate</p>
                  <p className="text-emerald-900 text-3xl">87.5%</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-gray-900">Reports Breakdown</h4>
                {complianceReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.status)}
                      <div>
                        <p className="text-gray-900 text-sm">{report.reportType}</p>
                        <p className="text-gray-600 text-xs">{report.reportingPeriod}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-blue-900 text-sm mb-2">Report Metrics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-700">Average Completion Time</p>
                    <p className="text-blue-900">12 days</p>
                  </div>
                  <div>
                    <p className="text-blue-700">On-Time Submission Rate</p>
                    <p className="text-blue-900">100%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Generate Report
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Approved Reports */}
      {activeModal === 'approved' && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`} onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-6 text-emerald-600" />
                <h3 className="text-gray-900 text-lg">Approved Compliance Reports</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-emerald-900 text-sm mb-1">Approved Reports</p>
                  <p className="text-emerald-900 text-3xl">{complianceReports.filter(r => r.status === 'Approved').length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-900 text-sm mb-1">Approval Rate</p>
                  <p className="text-blue-900 text-3xl">
                    {((complianceReports.filter(r => r.status === 'Approved').length / complianceReports.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-gray-900">Approved Reports List</h4>
                {complianceReports.filter(r => r.status === 'Approved').map((report) => (
                  <div key={report.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-900 text-sm mb-1">{report.reportType}</p>
                        <p className="text-gray-600 text-xs mb-1">Period: {report.reportingPeriod}</p>
                        <p className="text-emerald-700 text-xs">Approved: {report.approvalDate}</p>
                      </div>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1">
                        <Download className="size-3" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h4 className="text-emerald-900 text-sm mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-emerald-700">Average Approval Time</p>
                    <p className="text-emerald-900">8 days</p>
                  </div>
                  <div>
                    <p className="text-emerald-700">Zero Issues Rate</p>
                    <p className="text-emerald-900">75%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Download All
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Pending Reports */}
      {activeModal === 'pending' && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`} onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="size-6 text-blue-600" />
                <h3 className="text-gray-900 text-lg">Pending Compliance Reports</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-900 text-sm mb-1">Pending Reports</p>
                  <p className="text-blue-900 text-3xl">
                    {complianceReports.filter(r => r.status === 'Draft' || r.status === 'Submitted').length}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-900 text-sm mb-1">Requires Action</p>
                  <p className="text-amber-900 text-3xl">
                    {complianceReports.filter(r => r.status === 'Submitted').length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-gray-900">Pending Reports List</h4>
                {complianceReports.filter(r => r.status === 'Draft' || r.status === 'Submitted').map((report) => (
                  <div key={report.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 text-sm">{report.reportType}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mb-1">Period: {report.reportingPeriod}</p>
                        <p className="text-blue-700 text-xs">Report Date: {report.reportDate}</p>
                      </div>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        {report.status === 'Draft' ? 'Complete' : 'Review'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="text-amber-900 text-sm mb-2">Action Required</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-amber-900">{complianceReports.filter(r => r.status === 'Draft').length} reports need to be completed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-amber-900">{complianceReports.filter(r => r.status === 'Submitted').length} reports pending approval</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Review All
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Set Reminders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Issues Found */}
      {activeModal === 'issues' && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isDark ? 'dark' : ''}`} onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-6 text-amber-600" />
                <h3 className="text-gray-900 text-lg">Compliance Issues Identified</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-700">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-900 text-sm mb-1">Total Issues</p>
                  <p className="text-amber-900 text-3xl">{complianceReports.reduce((sum, r) => sum + r.issuesIdentified, 0)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-900 text-sm mb-1">Critical Issues</p>
                  <p className="text-red-900 text-3xl">2</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-gray-900">Issues by Report</h4>
                {complianceReports.filter(r => r.issuesIdentified > 0).map((report) => (
                  <div key={report.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm mb-1">{report.reportType}</p>
                        <p className="text-gray-600 text-xs mb-2">Period: {report.reportingPeriod}</p>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-amber-600" />
                          <span className="text-amber-900 text-sm">{report.issuesIdentified} issue(s) identified</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="text-red-900 text-sm mb-2">Critical Issues Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-900">Documentation Gap</p>
                      <p className="text-red-700 text-xs">Missing client verification documents</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-900">Policy Violation</p>
                      <p className="text-red-700 text-xs">Exceeded lending limit in 1 transaction</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-blue-900 text-sm mb-2">Remediation Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Issues Resolved</span>
                    <span className="text-blue-900">5 of 7</span>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: '71%' }}></div>
                  </div>
                  <p className="text-blue-700 text-xs">Target completion: 2 weeks</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                  Review Issues
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}