import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

// Expected interest data from the spreadsheet (in KSh) - exact data from image
const SPREADSHEET_LOANS = [
  { date: "2025-10-27", borrower: "STEPHEN MULU NZAVI", principal: 50000, interest: 5000 },
  { date: "2025-10-28", borrower: "ROONEY", principal: 50000, interest: 5000 },
  { date: "2025-10-23", borrower: "JOSPHAT M MATHEKA", principal: 250000, interest: 25000 },
  { date: "2025-10-28", borrower: "BEN K MBUVI", principal: 50000, interest: 5000 },
  { date: "2025-10-31", borrower: "NATALIA THOMAS", principal: 100000, interest: 5000 },
  { date: "2025-11-03", borrower: "JOSPHAT M MATHEKA ( Sis)", principal: 50000, interest: 2500 },
  { date: "2025-11-06", borrower: "ERIC MUTHAMA", principal: 100000, interest: 10000 },
  { date: "2025-11-07", borrower: "RAUMU OUMA", principal: 30000, interest: 1500 },
  { date: "2025-11-10", borrower: "SEBASTIAN M PETER", principal: 75000, interest: 3750 },
  { date: "2025-11-13", borrower: "ELIZABETH WAWERU KIDIGA", principal: 100000, interest: 10000 },
  { date: "2025-11-20", borrower: "GEORGE KAWAYA", principal: 50000, interest: 10000 },
  { date: "2025-11-29", borrower: "STEPHEN MULU NZAVI", principal: 50000, interest: 5000 },
  { date: "2025-12-03", borrower: "YUSEF OLEA OMONDI", principal: 200000, interest: 30000 },
  { date: "2025-12-03", borrower: "KIFARU SAMSOMI MASHA", principal: 40000, interest: 4000 },
  { date: "2025-12-03", borrower: "OLIVINE INVESTMENTS LTD", principal: 150000, interest: 10750 },
  { date: "2025-12-03", borrower: "STEPHEN MULU NZAVI", principal: 100000, interest: 10000 },
  { date: "2025-12-05", borrower: "BLOOMING BUD CENTER", principal: 200000, interest: 15000 },
  { date: "2025-12-17", borrower: "ERIC MUTHAMA", principal: 150000, interest: 15000 },
  { date: "2025-12-22", borrower: "BEN K MBUVI", principal: 100000, interest: 10000 },
  { date: "2025-12-23", borrower: "STEPHEN MULU NZAVI", principal: 200000, interest: 20000 },
  { date: "2025-12-23", borrower: "BENSON NJOROGE", principal: 20000, interest: 2000 },
  { date: "2025-12-24", borrower: "GEOFREY ROGERS KILEMBA", principal: 100000, interest: 10000 },
  { date: "2025-12-27", borrower: "JAMES MWONGELA MBUVI", principal: 50000, interest: 7500 },
  { date: "2026-01-07", borrower: "NICHOLAS NDIRAGU MWANGI", principal: 300000, interest: 45000 },
  { date: "2026-01-15", borrower: "DUMERIYA ALI MWEMA", principal: 300000, interest: 45000 },
  { date: "2026-01-21", borrower: "PRISCA LOICE MBUVI", principal: 35000, interest: 2625 },
  { date: "2026-01-28", borrower: "WAIRUNE NDEVENJ", principal: 300000, interest: 22500 },
  { date: "2026-01-28", borrower: "GEOFREY ROGERS KILEMBA", principal: 150000, interest: 11250 },
  { date: "2026-01-28", borrower: "DANIEL COLLINS MAKORO", principal: 33000, interest: 2475 },
  { date: "2026-01-30", borrower: "QUENTIN DAUDI AFANDE", principal: 100000, interest: 7500 },
  { date: "2026-02-03", borrower: "BEN K MBUVI", principal: 100000, interest: 10000 },
  { date: "2026-02-03", borrower: "JAMES MUSIO MUSYOKI", principal: 150000, interest: 22500 },
  { date: "2026-02-04", borrower: "STEPHEN MULU NZAVI", principal: 200000, interest: 15000 },
  { date: "2026-02-04", borrower: "BENSON NJOROGE", principal: 20000, interest: 2000 },
  { date: "2026-02-06", borrower: "JAMES MWONGEI A MBUVI", principal: 100000, interest: 15000 },
  { date: "2026-02-12", borrower: "DANIEL COLLINS MAKORO", principal: 170000, interest: 38250 },
  { date: "2026-02-14", borrower: "ERIC MUTHAMA", principal: 60000, interest: 4500 },
  { date: "2026-02-17", borrower: "NANCY KALERYE MWANIA", principal: 25000, interest: 1875 },
  { date: "2026-02-23", borrower: "PRISCA LOICE MBUVI", principal: 35000, interest: 3500 },
  { date: "2026-02-24", borrower: "QUENTIN DAUDI AFANDE", principal: 100000, interest: 7500 },
  { date: "2025-02-25", borrower: "GEOFREY ROGERS KILEMBA", principal: 300000, interest: 67500 },
  { date: "2026-02-27", borrower: "MARION MATUNDA", principal: 20000, interest: 1500 },
  { date: "2027-02-27", borrower: "ALICE AOKO", principal: 30000, interest: 2250 },
  { date: "2028-02-27", borrower: "DORCAS MAKURA", principal: 12000, interest: 900 },
  { date: "2029-02-27", borrower: "ESMILY WANJALA", principal: 15000, interest: 1125 },
  { date: "2030-02-27", borrower: "MILDRED AKINYI", principal: 10000, interest: 750 },
  { date: "2031-02-27", borrower: "MOUREEN ADHIAMBO", principal: 20000, interest: 1500 },
  { date: "2032-02-27", borrower: "JESSICA ADHIAMBO", principal: 30000, interest: 2250 },
  { date: "2026-03-04", borrower: "STEPHEN MULU NZAVI", principal: 100000, interest: 7500 },
  { date: "2026-03-04", borrower: "BEN K MBUVI", principal: 100000, interest: 10000 },
  { date: "2026-03-09", borrower: "TERESSIA IBRAHIM", principal: 60000, interest: 13500 },
  { date: "2026-03-11", borrower: "ERIC MUTHAMA", principal: 40000, interest: 3000 },
];

const EXPECTED_TOTAL = 590250;

interface InterestComparisonToolProps {
  onClose: () => void;
}

export function InterestComparisonTool({ onClose }: InterestComparisonToolProps) {
  const { loans } = useData();
  const [comparison, setComparison] = useState<any[]>([]);
  const [systemTotal, setSystemTotal] = useState(0);
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);

  useEffect(() => {
    analyzeLoans();
  }, [loans]);

  const calculateCorrectInterest = (loan: any) => {
    const principal = loan.principalAmount || loan.amount || 0;
    const rate = loan.interestRate || 0;
    const term = loan.term || loan.termPeriod || loan.loanTerm || loan.termMonths || 1;
    
    // FLAT RATE: Interest = Principal × Rate × Term / 100
    const correctInterest = (principal * rate * term) / 100;
    return Math.round(correctInterest);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const findMatchingSpreadsheetEntry = (loan: any) => {
    const clientName = loan.clientName || '';
    const principal = loan.principalAmount || loan.amount || 0;
    const loanDate = new Date(loan.requestDate || loan.disbursementDate || loan.applicationDate);
    
    // Find all matching entries by name and principal
    const matches = SPREADSHEET_LOANS.filter((sl) => {
      const nameMatch = sl.borrower.toLowerCase().includes(clientName.toLowerCase()) || 
                       clientName.toLowerCase().includes(sl.borrower.toLowerCase());
      const principalMatch = sl.principal === principal;
      
      if (!principalMatch) return false;
      if (!nameMatch) return false;
      
      // Check date proximity (within 7 days)
      const spreadsheetDate = new Date(sl.date);
      const daysDiff = Math.abs((loanDate.getTime() - spreadsheetDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDiff < 7;
    });
    
    if (matches.length === 1) {
      return matches[0];
    }
    
    // If multiple matches, try exact name
    const exactMatch = matches.find((m) => 
      m.borrower.toLowerCase() === clientName.toLowerCase()
    );
    
    return exactMatch || matches[0] || null;
  };

  const analyzeLoans = () => {
    const disbursedLoans = loans.filter((l: any) => 
      l.disbursementDate && l.status !== 'Rejected'
    );
    
    let totalSystemInterest = 0;
    const comparisonResults: any[] = [];
    const foundDiscrepancies: any[] = [];
    
    disbursedLoans.forEach((loan: any) => {
      const systemInterest = calculateCorrectInterest(loan);
      totalSystemInterest += systemInterest;
      
      const match = findMatchingSpreadsheetEntry(loan);
      const spreadsheetInterest = match?.interest || 0;
      const difference = systemInterest - spreadsheetInterest;
      const isMatch = Math.abs(difference) < 1; // Allow for rounding
      
      const result = {
        loanNumber: loan.loanNumber || loan.id,
        clientName: loan.clientName || 'Unknown',
        principal: loan.principalAmount || loan.amount || 0,
        rate: loan.interestRate || 0,
        term: loan.term || loan.termPeriod || loan.loanTerm || loan.termMonths || 1,
        systemInterest,
        spreadsheetInterest,
        difference,
        isMatch,
        date: loan.requestDate || loan.disbursementDate,
        matchedBorrower: match?.borrower || 'NOT FOUND',
        formula: `${(loan.principalAmount || loan.amount || 0).toLocaleString()} × ${loan.interestRate || 0}% × ${loan.term || loan.termPeriod || loan.loanTerm || loan.termMonths || 1} ÷ 100`
      };
      
      comparisonResults.push(result);
      
      if (!isMatch) {
        foundDiscrepancies.push(result);
      }
    });
    
    setSystemTotal(totalSystemInterest);
    setComparison(comparisonResults);
    setDiscrepancies(foundDiscrepancies);
  };

  const totalDifference = systemTotal - EXPECTED_TOTAL;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔍 Interest Calculation Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">System vs. Spreadsheet - Finding the KSh 5,005 difference</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Expected (Spreadsheet)</p>
              <p className="text-2xl font-bold text-blue-600">KSh {EXPECTED_TOTAL.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">System Calculated</p>
              <p className="text-2xl font-bold text-gray-900">KSh {systemTotal.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Difference</p>
              <p className={`text-2xl font-bold ${totalDifference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalDifference > 0 ? '+' : ''}KSh {totalDifference.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Discrepancies Found</p>
              <p className="text-2xl font-bold text-orange-600">{discrepancies.length} loans</p>
            </div>
          </div>
        </div>

        {/* Discrepancies List */}
        {discrepancies.length > 0 && (
          <div className="p-6 bg-red-50 border-b max-h-[200px] overflow-y-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-3">⚠️ Loans with Interest Discrepancies:</h3>
                <div className="space-y-2 text-sm">
                  {discrepancies.map((d, i) => (
                    <div key={i} className="bg-white p-3 rounded border border-red-200">
                      <div className="font-semibold text-red-900">
                        {i + 1}. {d.clientName} - KSh {d.principal.toLocaleString()}
                      </div>
                      <div className="text-red-700 mt-1 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">System:</span> KSh {d.systemInterest.toLocaleString()} 
                          <span className="text-gray-500 ml-1">({d.formula})</span>
                        </div>
                        <div>
                          <span className="font-medium">Expected:</span> KSh {d.spreadsheetInterest.toLocaleString()}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Difference:</span> 
                          <strong className="text-red-800 ml-1">
                            {d.difference > 0 ? '+' : ''}KSh {d.difference.toLocaleString()}
                          </strong>
                          <span className="text-gray-500 ml-2">
                            (Rate: {d.rate}%, Term: {d.term} month{d.term !== 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Comparison Table */}
        <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 500px)' }}>
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Client Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Matched To</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Principal</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Rate</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Term</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">System Interest</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Spreadsheet</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Diff</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">✓</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparison.map((item, index) => (
                <tr 
                  key={index}
                  className={item.isMatch ? 'bg-white hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}
                >
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{item.clientName}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{item.matchedBorrower}</td>
                  <td className="px-4 py-3 text-right text-gray-900">KSh {item.principal.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.rate}%</td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.term}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                    KSh {item.systemInterest.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-900 font-semibold">
                    KSh {item.spreadsheetInterest.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${
                    item.difference === 0 ? 'text-gray-400' : 
                    item.difference > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.difference > 0 ? '+' : ''}{item.difference.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.isMatch ? (
                      <CheckCircle className="size-5 text-green-600 mx-auto" />
                    ) : (
                      <AlertCircle className="size-5 text-red-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold sticky bottom-0">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right text-gray-900">TOTALS:</td>
                <td className="px-4 py-3 text-right text-gray-900">KSh {systemTotal.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-blue-900">KSh {EXPECTED_TOTAL.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right ${
                  totalDifference === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalDifference > 0 ? '+' : ''}{totalDifference.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p><strong>Note:</strong> System uses formula: Principal × Rate × Term ÷ 100</p>
            <p>Discrepancies may be due to different rates or terms in the database.</p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}