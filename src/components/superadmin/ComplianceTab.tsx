import { useState, useEffect } from 'react';
import { FileText, Download, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { db } from '../../utils/database';
import { supabase } from '../../lib/supabase';

interface ComplianceReport {
  id: string;
  type: 'portfolio' | 'financial_health' | 'regulatory' | 'audit';
  title: string;
  description: string;
  generated_date: string;
  period: string;
  status: 'compliant' | 'warning' | 'non_compliant';
}

export function ComplianceTab() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [orgsResult, loansResult, clientsResult] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('loans').select('*'),
        supabase.from('clients').select('*')
      ]);
      
      // Normalize loan data to match expected structure
      const normalizedLoans = (loansResult.data || []).map(loan => ({
        ...loan,
        loan_number: loan.loan_number || loan.id,
        principal_amount: loan.principal_amount || loan.amount || 0,
        loan_term_months: loan.loan_term_months || loan.term_months || 0,
        interest_rate: loan.interest_rate || loan.rate || 0,
        total_repayable: loan.total_repayable || loan.total_amount || 0,
        total_paid: loan.total_paid || 0,
        balance: loan.balance || (loan.total_repayable || loan.total_amount || 0) - (loan.total_paid || 0),
      }));
      
      setOrganizations(orgsResult.data || []);
      setLoans(normalizedLoans);
      setClients(clientsResult.data || []);
    };
    fetchData();
  }, []);

  const [reports] = useState<ComplianceReport[]>([
    {
      id: 'RPT-001',
      type: 'portfolio',
      title: 'Platform Loan Portfolio Report',
      description: 'Comprehensive analysis of all active loans across the platform',
      generated_date: '2024-01-15',
      period: 'Q4 2023',
      status: 'compliant'
    },
    {
      id: 'RPT-002',
      type: 'financial_health',
      title: 'Platform Financial Health Report',
      description: 'Analysis of platform revenue, default rates, and financial indicators',
      generated_date: '2024-01-15',
      period: 'Q4 2023',
      status: 'compliant'
    },
    {
      id: 'RPT-003',
      type: 'regulatory',
      title: 'Regulatory Compliance Report',
      description: 'Adherence to microfinance regulations across 14 countries',
      generated_date: '2024-01-10',
      period: 'Q4 2023',
      status: 'warning'
    },
    {
      id: 'RPT-004',
      type: 'audit',
      title: 'Platform Audit Trail Report',
      description: 'Complete audit log of all administrative actions',
      generated_date: '2024-01-05',
      period: 'December 2023',
      status: 'compliant'
    }
  ]);

  const totalDisbursed = loans
    .filter(l => ['disbursed', 'active', 'completed'].includes(l.status))
    .reduce((sum, l) => sum + l.principal_amount, 0);

  const defaultRate = loans.length > 0 
    ? (loans.filter(l => l.status === 'defaulted').length / loans.length * 100).toFixed(1)
    : '0.0';

  const portfolioAtRisk = loans
    .filter(l => l.status === 'active' && l.balance > l.total_repayable * 0.3)
    .reduce((sum, l) => sum + l.balance, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'non_compliant': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'warning': case 'non_compliant': return AlertTriangle;
      default: return FileText;
    }
  };

  const downloadReport = (reportId: string) => {
    alert(`Downloading report ${reportId}...`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e8d1c9' }}>Compliance & Reporting</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Generate reports and monitor compliance</p>
        </div>
      </div>

      {/* Compliance Status Overview */}
      <div className="mb-8 p-6 rounded-lg" style={{ 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        border: '1px solid rgba(16, 185, 129, 0.3)' 
      }}>
        <div className="flex items-center gap-3">
          <CheckCircle className="size-8" style={{ color: '#10b981' }} />
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#10b981' }}>Platform is Compliant</h3>
            <p className="text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
              All regulatory requirements are being met. 1 warning requires attention.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Lenders</p>
          <p className="text-3xl font-bold" style={{ color: '#ec7347' }}>{organizations.length}</p>
        </div>
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Borrowers</p>
          <p className="text-3xl font-bold" style={{ color: '#3b82f6' }}>{clients.length}</p>
        </div>
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Total Disbursed</p>
          <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
            KES {totalDisbursed.toLocaleString()}
          </p>
        </div>
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
          <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Default Rate</p>
          <p className="text-3xl font-bold" style={{ color: parseFloat(defaultRate) > 5 ? '#ef4444' : '#10b981' }}>
            {defaultRate}%
          </p>
        </div>
      </div>

      {/* Portfolio Health */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Portfolio Health Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Portfolio at Risk</p>
            <p className="text-2xl font-bold mb-1" style={{ color: '#f59e0b' }}>
              KES {portfolioAtRisk.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
              {totalDisbursed > 0 ? `${(portfolioAtRisk / totalDisbursed * 100).toFixed(1)}% of portfolio` : '0%'}
            </p>
          </div>
          <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Active Loans</p>
            <p className="text-2xl font-bold mb-1" style={{ color: '#3b82f6' }}>
              {loans.filter(l => l.status === 'active' || l.status === 'disbursed').length}
            </p>
            <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
              {loans.length} total loans
            </p>
          </div>
          <div className="p-5 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Completed Loans</p>
            <p className="text-2xl font-bold mb-1" style={{ color: '#10b981' }}>
              {loans.filter(l => l.status === 'completed').length}
            </p>
            <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
              {loans.length > 0 ? `${(loans.filter(l => l.status === 'completed').length / loans.length * 100).toFixed(1)}% success rate` : '0%'}
            </p>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e8d1c9' }}>Available Reports</h3>
        <div className="space-y-4">
          {reports.map((report) => {
            const StatusIcon = getStatusIcon(report.status);
            
            return (
              <div 
                key={report.id}
                className="p-5 rounded-lg"
                style={{ backgroundColor: '#032b43', border: '1px solid rgba(232, 209, 201, 0.1)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 115, 71, 0.1)' }}>
                        <FileText className="size-5" style={{ color: '#ec7347' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: '#e8d1c9' }}>{report.title}</h4>
                        <p className="text-xs" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                          {report.id} • Generated: {new Date(report.generated_date).toLocaleDateString()} • Period: {report.period}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm ml-14" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
                      {report.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="size-4" style={{ color: getStatusColor(report.status) }} />
                      <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(report.status) }}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-lg hover:opacity-70"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
                        title="View Report"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => downloadReport(report.id)}
                        className="p-2 rounded-lg hover:opacity-70"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
                        title="Download Report"
                      >
                        <Download className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regulatory Information */}
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: '#032b43', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3b82f6' }}>📋 Regulatory Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3" style={{ color: '#e8d1c9' }}>Active Countries</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: '#10b981' }} />
                Kenya - Central Bank of Kenya (CBK)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: '#10b981' }} />
                Uganda - Bank of Uganda (BoU)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: '#10b981' }} />
                Tanzania - Bank of Tanzania (BoT)
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="size-4" style={{ color: '#f59e0b' }} />
                Rwanda - National Bank of Rwanda (BNR) - KYC update required
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3" style={{ color: '#e8d1c9' }}>Compliance Requirements</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(232, 209, 201, 0.7)' }}>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: '#10b981' }} />
                KYC documentation for all lenders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: '#10b981' }} />
                Quarterly financial reporting
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: '#10b981' }} />
                Anti-money laundering (AML) checks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: '#10b981' }} />
                Data protection compliance (GDPR-equivalent)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}