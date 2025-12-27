import { loanFees } from '../data/dummyData';
import { getOrganizationName } from '../utils/organizationUtils';

interface PrintableStatementProps {
  loan: any;
  client: any;
  product: any;
  installments: any[];
}

export function PrintableStatement({ loan, client, product, installments }: PrintableStatementProps) {
  const organizationName = getOrganizationName();
  const fees = loanFees.filter(f => f.loanId === loan.id);
  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  
  // Calculate paid amounts
  const paidInstallments = installments.filter(i => i.status === 'Paid' || i.status === 'Late Paid');
  const paidPrincipal = paidInstallments.reduce((sum, i) => sum + i.principalComponent, 0);
  const paidInterest = paidInstallments.reduce((sum, i) => sum + i.interestComponent, 0);
  const paidTotal = paidInstallments.reduce((sum, i) => sum + i.plannedAmount, 0);

  const statementDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nextPaymentDue = installments.find(i => i.status === 'Pending' || i.status === 'Overdue');
  
  // Calculate totals
  const totalInterest = loan.principalAmount * (loan.interestRate / 100);
  const outstandingInterest = totalInterest - paidInterest;

  return (
    <div className="print-statement">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-statement,
          .print-statement * {
            visibility: visible;
          }
          .print-statement {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          /* Remove browser print headers and footers */
          html {
            margin: 0 !important;
          }
          body {
            margin: 0.5in !important;
          }
        }
        
        .print-statement {
          max-width: 100%;
          margin: 0;
          background: white;
          color: #000;
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 6.5pt;
          line-height: 1.1;
          padding: 0;
        }
        
        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          padding-bottom: 5px;
          border-bottom: 2px solid #000;
          page-break-after: avoid;
        }
        
        .print-company-info h1 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0;
          color: #000;
        }
        
        .print-statement-title {
          font-family: Arial, sans-serif;
          font-size: 16pt;
          font-weight: bold;
          color: #000 !important;
          text-align: right;
          margin-bottom: 3px;
        }
        
        .print-statement-info {
          text-align: right;
        }
        
        .print-statement-info p {
          margin: 0.5px 0;
          font-size: 7pt;
          color: #000 !important;
        }
        
        .print-statement-info p strong {
          color: #000 !important;
        }
        
        .client-info-box {
          background: #f8f8f8;
          border: 1px solid #000;
          padding: 6px;
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        
        .client-info-row {
          display: flex;
          justify-content: space-between;
          padding: 1px 0;
          font-size: 7pt;
        }
        
        .client-info-row .label {
          color: #000;
        }
        
        .client-info-row .value {
          font-weight: bold;
          color: #000;
        }
        
        .payment-due-box {
          border: 2px solid #000;
          padding: 6px;
          text-align: center;
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        
        .payment-due-box .label {
          font-size: 6.5pt;
          color: #000;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .payment-due-box .date {
          font-size: 9pt;
          font-weight: bold;
          margin-bottom: 5px;
          color: #000;
        }
        
        .payment-due-box .amount-label {
          font-size: 6.5pt;
          color: #000;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        
        .payment-due-box .amount {
          font-size: 12pt;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }
        
        .payment-due-box .notice {
          border-top: 1px solid #000;
          padding-top: 3px;
          font-size: 6pt;
          color: #000;
          font-style: italic;
        }
        
        .two-column-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        
        .info-box {
          background: #f8f8f8;
          border: 1px solid #000;
          padding: 6px;
        }
        
        .info-box-row {
          display: flex;
          justify-content: space-between;
          padding: 1px 0;
          font-size: 6.5pt;
        }
        
        .info-box-row .label {
          color: #000;
        }
        
        .info-box-row .value {
          font-weight: bold;
          color: #000;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
          font-size: 6pt;
          page-break-inside: avoid;
        }
        
        .data-table th {
          background: #000 !important;
          color: white !important;
          padding: 3px 2px;
          text-align: left;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 6pt;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .data-table td {
          padding: 2px;
          border-bottom: 1px solid #000;
          color: #000 !important;
          font-weight: normal;
          background: transparent !important;
        }
        
        .data-table tbody tr {
          background: transparent !important;
          page-break-inside: avoid;
        }
        
        .data-table tbody tr:nth-child(even) {
          background: #f8f8f8 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .data-table tbody tr td {
          color: #000 !important;
        }
        
        .data-table .text-right {
          text-align: right;
          color: #000 !important;
        }
        
        .data-table .text-center {
          text-align: center;
          color: #000 !important;
        }
        
        .data-table tfoot td {
          background: #e8e8e8 !important;
          font-weight: bold;
          padding: 3px 2px;
          border-top: 2px solid #000;
          color: #000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .status-badge {
          display: inline-block;
          padding: 1px 3px;
          border-radius: 2px;
          font-size: 5.5pt;
          font-weight: bold;
          color: #000 !important;
          border: 1px solid #000;
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
          font-size: 6.5pt;
          page-break-inside: avoid;
        }
        
        .summary-table th {
          background: #000 !important;
          color: white !important;
          padding: 3px;
          text-align: right;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 6pt;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .summary-table th:first-child {
          text-align: left;
        }
        
        .summary-table td {
          padding: 2px 3px;
          border-bottom: 1px solid #000;
          text-align: right;
          color: #000 !important;
          background: transparent !important;
        }
        
        .summary-table tbody tr {
          background: transparent !important;
        }
        
        .summary-table td:first-child {
          text-align: left;
          font-weight: bold;
          color: #000 !important;
        }
        
        .summary-table tbody tr:nth-child(even) {
          background: #f8f8f8 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .summary-table tbody tr td {
          color: #000 !important;
        }
        
        .summary-table tfoot td {
          background: #e8e8e8 !important;
          font-weight: bold;
          padding: 3px;
          border-top: 2px solid #000;
          color: #000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      {/* Statement Content */}
      <div className="print-header">
        <div className="print-company-info">
          <h1>{organizationName}</h1>
        </div>
        <div className="print-statement-info">
          <p className="print-statement-title">STATEMENT OF ACCOUNT</p>
          <p><strong>Statement Date:</strong> {statementDate}</p>
          <p><strong>Loan Account:</strong> {loan.id}</p>
          <p><strong>Client ID:</strong> {client.id}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="client-info-box">
        <div className="client-info-row">
          <span className="label">Client Name:</span>
          <span className="value">{client.name}</span>
        </div>
        <div className="client-info-row">
          <span className="label">National ID:</span>
          <span className="value">{client.nationalId}</span>
        </div>
        <div className="client-info-row">
          <span className="label">Phone Number:</span>
          <span className="value">{client.phone}</span>
        </div>
        <div className="client-info-row">
          <span className="label">Email Address:</span>
          <span className="value">{client.email}</span>
        </div>
        <div className="client-info-row">
          <span className="label">Address:</span>
          <span className="value">{client.address}, {client.city}</span>
        </div>
      </div>

      {/* Next Payment Due */}
      {nextPaymentDue && (
        <div className="payment-due-box">
          <div className="label">NEXT PAYMENT DUE</div>
          <div className="date">
            {new Date(nextPaymentDue.dueDate).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div className="amount-label">AMOUNT DUE</div>
          <div className="amount">KES {nextPaymentDue.plannedAmount.toLocaleString()}</div>
          <div className="notice">
            ⚠ If payment is received after the due date, a late payment penalty of 5% will apply.<br />
            Late payment amount: <strong>KES {(nextPaymentDue.plannedAmount * 1.05).toLocaleString()}</strong>
          </div>
        </div>
      )}

      {/* Loan Details - Two Column */}
      <div className="two-column-grid">
        <div className="info-box">
          <div className="info-box-row">
            <span className="label">Loan Product:</span>
            <span className="value">{product.name}</span>
          </div>
          <div className="info-box-row">
            <span className="label">Original Principal:</span>
            <span className="value">KES {loan.principalAmount.toLocaleString()}</span>
          </div>
          <div className="info-box-row">
            <span className="label">Interest Rate:</span>
            <span className="value">{loan.interestRate}% Flat</span>
          </div>
          <div className="info-box-row">
            <span className="label">Disbursement Date:</span>
            <span className="value">{new Date(loan.disbursementDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="info-box-row">
            <span className="label">Maturity Date:</span>
            <span className="value">{new Date(loan.maturityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="info-box-row">
            <span className="label">Loan Officer:</span>
            <span className="value">{loan.loanOfficer}</span>
          </div>
        </div>

        <div className="info-box">
          <div className="info-box-row">
            <span className="label">Outstanding Principal:</span>
            <span className="value">KES {loan.outstandingBalance.toLocaleString()}</span>
          </div>
          <div className="info-box-row">
            <span className="label">Outstanding Interest:</span>
            <span className="value">KES {outstandingInterest.toLocaleString()}</span>
          </div>
          <div className="info-box-row">
            <span className="label">Total Fees:</span>
            <span className="value">KES {totalFees.toLocaleString()}</span>
          </div>
          <div className="info-box-row">
            <span className="label">Loan Status:</span>
            <span className="value">{loan.status}</span>
          </div>
          {loan.daysInArrears > 0 && (
            <div className="info-box-row">
              <span className="label">Days in Arrears:</span>
              <span className="value">{loan.daysInArrears} days</span>
            </div>
          )}
        </div>
      </div>

      {/* Repayment Schedule */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '8%' }}>DUE DATE</th>
            <th className="text-right" style={{ width: '23%' }}>PRINCIPAL</th>
            <th className="text-right" style={{ width: '23%' }}>INTEREST</th>
            <th className="text-right" style={{ width: '23%' }}>TOTAL AMOUNT</th>
            <th className="text-center" style={{ width: '23%' }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((installment) => (
            <tr key={installment.installmentNo}>
              <td>{new Date(installment.dueDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</td>
              <td className="text-right">KES {installment.principalComponent.toLocaleString()}</td>
              <td className="text-right">KES {installment.interestComponent.toLocaleString()}</td>
              <td className="text-right">KES {installment.plannedAmount.toLocaleString()}</td>
              <td className="text-center">
                <span className="status-badge">
                  {installment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>TOTALS</td>
            <td className="text-right">KES {loan.principalAmount.toLocaleString()}</td>
            <td className="text-right">KES {totalInterest.toLocaleString()}</td>
            <td className="text-right">KES {(loan.principalAmount + totalInterest).toLocaleString()}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {/* Payment Summary */}
      <table className="summary-table">
        <thead>
          <tr>
            <th></th>
            <th>PAID TO DATE</th>
            <th>OUTSTANDING</th>
            <th>TOTAL DUE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Principal</td>
            <td>KES {paidPrincipal.toLocaleString()}</td>
            <td>KES {loan.outstandingBalance.toLocaleString()}</td>
            <td>KES {loan.principalAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Interest</td>
            <td>KES {paidInterest.toLocaleString()}</td>
            <td>KES {outstandingInterest.toLocaleString()}</td>
            <td>KES {totalInterest.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Fees</td>
            <td>KES {totalFees.toLocaleString()}</td>
            <td>KES 0</td>
            <td>KES {totalFees.toLocaleString()}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>TOTAL</td>
            <td>KES {(paidTotal + totalFees).toLocaleString()}</td>
            <td>KES {(loan.outstandingBalance + outstandingInterest).toLocaleString()}</td>
            <td>KES {(loan.principalAmount + totalInterest + totalFees).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}