import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner@2.0.3';
import { getOrganizationId } from '../utils/organizationUtils';

export function DataImportExport() {
  const [importing, setImporting] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const organizationId = getOrganizationId();

  // Helper function to format dates from DD.MM.YYYY or DD/MM/YYYY to YYYY-MM-DD
  const formatDate = (dateStr: string): string => {
    if (!dateStr?.trim()) return new Date().toISOString().split('T')[0];
    
    const cleaned = dateStr.trim();
    
    // Check if already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return cleaned;
    }
    
    // Try DD.MM.YYYY format
    if (cleaned.includes('.')) {
      const [day, month, year] = cleaned.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try DD/MM/YYYY format
    if (cleaned.includes('/')) {
      const [day, month, year] = cleaned.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Default to today
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to format phone numbers (add 254 if missing)
  const formatPhoneNumber = (phone: string): string => {
    if (!phone?.trim()) return '';
    
    // Remove spaces, dashes, and parentheses
    let cleaned = phone.trim().replace(/[\s\-()]/g, '');
    
    // Remove + if present
    cleaned = cleaned.replace(/^\+/, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  // Helper function to format numbers (remove commas, parse correctly)
  const formatNumber = (numStr: string): number => {
    if (!numStr?.trim()) return 0;
    
    // Remove commas, spaces, and percentage signs
    const cleaned = numStr.trim()
      .replace(/,/g, '')
      .replace(/\s/g, '')
      .replace(/%/g, '');
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to determine repayment frequency from period text
  const formatRepaymentFrequency = (periodText: string): string => {
    if (!periodText?.trim()) return 'monthly';
    
    const text = periodText.toLowerCase();
    
    // Extract number of days
    const match = text.match(/(\d+)/);
    if (!match) return 'monthly';
    
    const days = parseInt(match[1]);
    
    // Determine frequency based on days
    if (days <= 7) return 'weekly';
    if (days <= 14) return 'biweekly';
    if (days <= 30) return 'monthly';
    if (days <= 90) return 'quarterly';
    
    return 'monthly';
  };

  // Download CSV template
  const downloadTemplate = () => {
    const headers = [
      'DATE OF ISSUE',
      'NAME OF BORROWER',
      'ID NUMBER',
      'TEL NO',
      'CUMM AMOUNT BORROWED',
      'PROCESSING FEES',
      'INTEREST (%)',
      'REPAYMENT PERIOD',
      'DUE DATE',
      'REPAYMENT DURATION IN MONTHS',
      'POTENTIAL INTEREST PAYABLE',
      'TOTAL AMT PAYABLE (PRINCIPAL + INTEREST)',
      'PRINCIPAL PAID BACK',
      'INTREST PAID BACK',
      'TOTAL AMOUNT REPAID BACK (P + I)',
      'OUTSTANDING LOANS (P+I)',
      'NAME',
      'ID NO / CHASIS NO / CHS NO',
      'TEL NO / ENGINE NO',
      'COMMENTS'
    ];

    const exampleRow = [
      '2024-01-15',
      'John Doe',
      '12345678',
      '+254712345678',
      '50000',
      '5000',
      '15',
      'Monthly',
      '2025-01-15',
      '12',
      '7500',
      '57500',
      '10000',
      '1500',
      '11500',
      '46000',
      'Jane Smith',
      '87654321',
      '+254787654321',
      'Family friend'
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      exampleRow.join(','),
      // Empty row for user to fill
      Array(headers.length).fill('').join(',')
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'loan_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Template downloaded successfully!');
  };

  // Parse CSV file
  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is CSV or Excel
    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isCSV && !isExcel) {
      alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    setImporting(true);
    setUploadResults(null);
    setProgress({ current: 0, total: 0 });

    try {
      let parsedData: any[] = [];

      if (isCSV) {
        // Parse CSV file using native JavaScript (no external library needed)
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or has no data rows');
        }
        
        // Parse header row
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        
        // Parse data rows
        parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
      } else {
        // Parse Excel file
        const XLSX = await import('xlsx');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        parsedData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
      }

      // Process the data
      await processImportData(parsedData);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadResults({
        success: 0,
        failed: 1,
        errors: ['Failed to parse file. Please check the file format.']
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Process the imported data
  const processImportData = async (data: any[]) => {
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    setProgress({ current: 0, total: data.length });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because we skip header and arrays are 0-indexed

      try {
        // Map column headers to variables (supports multiple possible column names)
        const dateOfIssue = row['DATE OF ISSUE'] || row['Date of Issue'] || row['DATE_OF_ISSUE'];
        const borrowerName = row['NAME OF BORROWER'] || row['Name of Borrower'] || row['BORROWER_NAME'] || row['NAME'];
        const idNumber = row['ID NUMBER'] || row['Id Number'] || row['ID_NUMBER'];
        const telNo = row['TEL NO'] || row['Tel No'] || row['PHONE'] || row['PHONE_NUMBER'];
        const amountBorrowed = row['CUMM AMOUNT BORROWED'] || row['Cumm Amount Borrowed'] || row['AMOUNT_BORROWED'] || row['AMOUNT'];
        const processingFees = row['PROCESSING FEES'] || row['Processing Fees'] || row['PROCESSING_FEES'] || '0';
        const interestRate = row['INTEREST (%)'] || row['Interest (%)'] || row['INTEREST'] || row['INTEREST_RATE'];
        const repaymentPeriod = row['REPAYMENT PERIOD'] || row['Repayment Period'] || row['REPAYMENT_PERIOD'] || 'Monthly';
        const dueDate = row['DUE DATE'] || row['Due Date'] || row['DUE_DATE'];
        const repaymentDuration = row['REPAYMENT DURATION IN MONTHS'] || row['Repayment Duration in Months'] || row['DURATION'] || '1';
        const potentialInterestPayable = row['POTENTIAL INTEREST PAYABLE'] || row['Potential Interest Payable'] || '0';
        const totalAmountPayable = row['TOTAL AMT PAYABLE ( PRINCIPAL + INTEREST)'] || row['TOTAL AMT PAYABLE (PRINCIPAL + INTEREST)'] || row['Total Amt Payable'] || '0';
        const principalPaidBack = row['PRINCIPAL PAID BACK'] || row['Principal Paid Back'] || row['PRINCIPAL_PAID'] || '0';
        const interestPaidBack = row['INTREST PAID BACK'] || row['INTEREST PAID BACK'] || row['Interest Paid Back'] || row['INTEREST_PAID'] || '0';
        const totalAmountRepaidBack = row['TOTAL AMOUNT REPAID BACK (P + I)'] || row['TOTAL AMOUNT REPAID BACK (P + i)'] || row['Total Amount Repaid Back'] || row['TOTAL_REPAID'] || '0';
        const outstandingLoans = row['OUTSTANDING LOANS (P+I)'] || row['Outstanding Loans'] || row['OUTSTANDING'] || '0';
        
        // Guarantor information
        const guarantorName = row['NAME'] || row['GUARANTOR NAME'] || row['Guarantor Name'] || row['GUARANTOR_NAME'];
        const guarantorIdNo = row['ID NO / CHASIS NO / CHO NO'] || row['ID NO / CHASIS NO / CHS NO'] || row['GUARANTOR ID'] || row['ID NO'];
        const guarantorTelNo = row['TEL NO / ENGINE NO'] || row['GUARANTOR TEL NO'] || row['GUARANTOR PHONE'];
        const guarantorComments = row['COMMENTS'] || row['Comments'] || row['COMMENT'];

        // Validate required fields
        if (!borrowerName?.trim()) {
          errors.push(`Row ${rowNumber}: Borrower name is required`);
          failedCount++;
          continue;
        }

        // Format phone number
        const formattedPhone = formatPhoneNumber(telNo);
        if (!formattedPhone) {
          errors.push(`Row ${rowNumber}: Phone number is required`);
          failedCount++;
          continue;
        }

        // Format and validate amount
        const formattedAmount = formatNumber(amountBorrowed);
        if (formattedAmount <= 0) {
          errors.push(`Row ${rowNumber}: Valid amount is required`);
          failedCount++;
          continue;
        }

        // Generate client ID
        const { data: existingClients, error: countError } = await supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('organization_id', organizationId);

        if (countError) throw countError;

        const clientCount = (existingClients?.length || 0) + 1;
        const clientId = `CL${String(clientCount).padStart(5, '0')}`;

        // Check if client already exists by phone
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', formattedPhone)
          .eq('organization_id', organizationId)
          .single();

        let clientDbId = existingClient?.id;

        // Create client if doesn't exist
        if (!clientDbId) {
          // Split borrower name into first and last name
          const nameParts = borrowerName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              client_number: clientId,
              organization_id: organizationId,
              first_name: firstName,
              last_name: lastName,
              phone: formattedPhone,
              id_number: idNumber?.trim() || '',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (clientError) throw clientError;
          clientDbId = newClient.id;
        }

        // Generate loan ID
        const { data: existingLoans, error: loanCountError } = await supabase
          .from('loans')
          .select('id', { count: 'exact' })
          .eq('organization_id', organizationId);

        if (loanCountError) throw loanCountError;

        const loanCount = (existingLoans?.length || 0) + 1;
        const loanId = `LN${String(loanCount).padStart(6, '0')}`;

        // Create loan
        const amount = formattedAmount;
        const processingFee = formatNumber(processingFees);
        const interest = formatNumber(interestRate);
        
        // Ensure interest rate is within valid range (0-100%)
        // If the value is too large, it might be the total interest amount, not the rate
        let validInterestRate = interest;
        if (interest > 100) {
          // Likely the total interest amount, calculate percentage
          validInterestRate = (interest / amount) * 100;
        }
        // Cap at 100% to prevent overflow
        validInterestRate = Math.min(validInterestRate, 100);
        
        // Parse repayment period (e.g., "30 Days", "60 Days") to get days
        let periodInDays = 30; // Default
        if (repaymentPeriod?.includes('Days') || repaymentPeriod?.includes('days')) {
          const match = repaymentPeriod.match(/(\d+)/);
          if (match) periodInDays = Number(match[1]);
        }
        
        // Use repayment duration in months if provided, otherwise calculate from days
        // IMPORTANT: Convert to integer - database expects integer, not decimal
        const durationValue = formatNumber(repaymentDuration);
        const periodInMonths = durationValue > 0 ? Math.round(durationValue) : Math.round(periodInDays / 30);
        
        // Ensure periodInMonths is at least 1
        const finalPeriodInMonths = Math.max(1, periodInMonths);

        // Parse dates - handle various date formats
        const applicationDate = formatDate(dateOfIssue);
        const maturityDate = formatDate(dueDate) || new Date(Date.now() + finalPeriodInMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const { error: loanError } = await supabase
          .from('loans')
          .insert({
            loan_number: loanId,
            client_id: clientDbId,
            organization_id: organizationId,
            amount: amount,
            interest_rate: validInterestRate,
            term_period: finalPeriodInMonths, // Now guaranteed to be an integer >= 1
            term_period_unit: 'months',
            repayment_frequency: formatRepaymentFrequency(repaymentPeriod),
            purpose: 'Imported Loan',
            disbursement_method: 'cash',
            disbursement_account: '',
            status: 'active',
            phase: 5, // Phase 5 = Disbursed (integer, not string)
            application_date: applicationDate,
            disbursement_date: applicationDate,
            maturity_date: maturityDate,
            total_amount: amount + (amount * validInterestRate / 100),
            balance: amount + (amount * validInterestRate / 100) - formatNumber(totalAmountRepaidBack),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (loanError) throw loanError;

        // Create repayment records if any payments have been made
        const principalPaid = formatNumber(principalPaidBack);
        const interestPaid = formatNumber(interestPaidBack);
        const totalPaid = principalPaid + interestPaid;

        if (totalPaid > 0) {
          const { error: repaymentError } = await supabase
            .from('repayments')
            .insert({
              organization_id: organizationId,
              loan_id: loanId,
              payment_date: applicationDate,
              amount: totalPaid,
              payment_method: 'cash',
              principal_paid: principalPaid,
              interest_paid: interestPaid,
              penalty_paid: 0,
              status: 'completed',
              transaction_reference: `IMPORT-${loanId}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (repaymentError) {
            console.error('Repayment creation error:', repaymentError);
            // Don't fail the entire row if repayment creation fails
          }
        }

        // Create guarantor if provided
        if (guarantorName?.trim()) {
          const formattedGuarantorPhone = formatPhoneNumber(guarantorTelNo);
          
          const { error: guarantorError } = await supabase
            .from('guarantors')
            .insert({
              loan_id: loanId,
              organization_id: organizationId,
              name: guarantorName.trim(),
              id_number: guarantorIdNo?.trim() || '',
              phone: formattedGuarantorPhone || '',
              comments: guarantorComments?.trim() || '',
              created_at: new Date().toISOString()
            });

          if (guarantorError) {
            console.error('Guarantor creation error:', guarantorError);
            // Don't fail the entire row if guarantor fails
          }
        }

        successCount++;
      } catch (error: any) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errors.push(`Row ${rowNumber}: ${error.message || 'Unknown error'}`);
        failedCount++;
      }

      setProgress({ current: i + 1, total: data.length });
    }

    setUploadResults({
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10) // Show max 10 errors
    });

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} loan(s)!`);
    }

    if (failedCount > 0) {
      toast.error(`Failed to import ${failedCount} loan(s). Check details below.`);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileSpreadsheet className="size-5 text-blue-600" />
        <h3 className="text-gray-900">Data Import/Export</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Import loan data with borrower and guarantor information from CSV or Excel files. Download the template to see the required format.
      </p>

      {/* Download Template */}
      <div className="mb-6">
        <button
          onClick={downloadTemplate}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Download className="size-4" />
          Download CSV Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="size-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">
          Upload your completed CSV or Excel file to import loan data
        </p>
        
        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer">
          <Upload className="size-4" />
          {importing ? 'Importing...' : 'Upload CSV/Excel File'}
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
          />
        </label>

        {importing && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader className="size-5 animate-spin" />
              <span className="text-sm">Processing file...</span>
            </div>
            
            {progress.total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Processing row {progress.current} of {progress.total}</span>
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Results */}
      {uploadResults && (
        <div className="mt-6 space-y-3">
          {/* Success Count */}
          {uploadResults.success > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">
                  Successfully Imported: {uploadResults.success} loan(s)
                </p>
                <p className="text-sm text-green-700">
                  Clients, loans, guarantors, and payment records have been added to the database.
                </p>
              </div>
            </div>
          )}

          {/* Error Count */}
          {uploadResults.failed > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-900">
                    Failed to Import: {uploadResults.failed} loan(s)
                  </p>
                  <p className="text-sm text-red-700">
                    Please review the errors below and correct your CSV file.
                  </p>
                </div>
              </div>

              {/* Error List */}
              {uploadResults.errors.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto bg-white rounded border border-red-200 p-3">
                  <ul className="space-y-1 text-sm text-red-800">
                    {uploadResults.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="size-3 mt-1 flex-shrink-0" />
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                  {uploadResults.failed > uploadResults.errors.length && (
                    <p className="text-xs text-red-600 mt-2">
                      ... and {uploadResults.failed - uploadResults.errors.length} more error(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Clear Results */}
          <button
            onClick={() => setUploadResults(null)}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="size-4" />
          Important Notes
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Download the template first to ensure correct format</li>
          <li><strong>Dates:</strong> Can be DD.MM.YYYY, DD/MM/YYYY, or YYYY-MM-DD (e.g., 27.10.2025 or 2025-10-27)</li>
          <li><strong>Phone numbers:</strong> Can be with or without country code (e.g., 721861725 or +254721861725) - Kenya code (+254) will be added automatically</li>
          <li><strong>Amounts:</strong> Can include commas and decimals (e.g., 50,000.00 or 50000) - they will be formatted automatically</li>
          <li><strong>Interest rate:</strong> Can include percentage symbol (e.g., 10.0% or 10) - will be parsed as number</li>
          <li><strong>Repayment period:</strong> Can be in days (e.g., "30 Days") - will be converted to monthly/weekly/quarterly</li>
          <li>The system will automatically create clients if they don't exist (matched by phone number)</li>
          <li>Payment tracking: Enter principal paid and interest paid to record payments</li>
          <li>Guarantor information is optional but recommended</li>
        </ul>
      </div>
    </div>
  );
}