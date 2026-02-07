import React, { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabaseDataService } from '../../services/supabaseDataService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: string;
    category: string;
    balance: number;
    debit: number;
    credit: number;
    parent_account?: string;
  } | null;
  currencyCode: string;
  organizationId: string;
}

interface JournalEntry {
  id: string;
  entry_date: string;
  entry_number: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
}

interface GroupedEntries {
  [key: string]: JournalEntry[];
}

export function AccountDetailsModal({
  isOpen,
  onClose,
  account,
  currencyCode,
  organizationId,
}: AccountDetailsModalProps) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'month' | 'type'>('none');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && account) {
      loadJournalEntries();
    }
  }, [isOpen, account]);

  const loadJournalEntries = async () => {
    if (!account) return;

    setLoading(true);
    try {
      // Fetch all journal entry lines for this account
      // Join with journal_entries to get entry details
      const { data: entryLines, error } = await supabase
        .from('journal_entry_lines')
        .select(`
          *,
          journal_entries!inner(
            entry_number,
            entry_date,
            description,
            source_type,
            status,
            created_at
          )
        `)
        .eq('organization_id', organizationId)
        .eq('account_code', account.code)
        .eq('journal_entries.status', 'Posted')
        .order('journal_entries(entry_date)', { ascending: false });

      if (error) throw error;

      // Debug: Log the raw data to see what we're getting
      console.log('Raw entry lines from database:', entryLines);
      console.log('First entry line sample:', entryLines?.[0]);

      // Transform the data to match our JournalEntry interface
      const transformedEntries = (entryLines || []).map((line: any) => {
        // Debug: Log individual line data
        console.log('Processing line:', {
          id: line.id,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount,
          debit: line.debit,
          credit: line.credit,
        });

        return {
          id: line.id,
          entry_date: line.journal_entries.entry_date,
          entry_number: line.journal_entries.entry_number,
          description: line.journal_entries.description,
          reference_type: line.journal_entries.source_type,
          reference_id: line.journal_entries.source_id,
          created_at: line.journal_entries.created_at || line.created_at,
          // Try both possible column names
          debit_amount: Number(line.debit_amount || line.debit || 0),
          credit_amount: Number(line.credit_amount || line.credit || 0),
          running_balance: 0, // Will be calculated below
        };
      });

      console.log('Transformed entries:', transformedEntries);

      // Sort by date (oldest first for balance calculation)
      transformedEntries.sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

      // Calculate running balance
      let runningBalance = 0;
      const entriesWithBalance = transformedEntries.map((entry: any) => {
        const debitAmount = entry.debit_amount;
        const creditAmount = entry.credit_amount;
        
        // For asset, expense accounts: debit increases, credit decreases
        // For liability, equity, revenue accounts: credit increases, debit decreases
        if (['asset', 'expense'].includes(account.type.toLowerCase())) {
          runningBalance += debitAmount - creditAmount;
        } else {
          runningBalance += creditAmount - debitAmount;
        }

        return {
          ...entry,
          running_balance: runningBalance,
        };
      });

      // Reverse to show newest first
      setJournalEntries(entriesWithBalance.reverse());
    } catch (error) {
      console.error('Error loading journal entries:', error);
      toast.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currencyCode} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMonthYear = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getReferenceTypeLabel = (type?: string) => {
    if (!type) return 'General Entry';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const groupEntries = (): GroupedEntries => {
    if (groupBy === 'none') {
      return { 'All Entries': journalEntries };
    }

    if (groupBy === 'month') {
      return journalEntries.reduce((groups, entry) => {
        const monthYear = getMonthYear(entry.entry_date);
        if (!groups[monthYear]) {
          groups[monthYear] = [];
        }
        groups[monthYear].push(entry);
        return groups;
      }, {} as GroupedEntries);
    }

    if (groupBy === 'type') {
      return journalEntries.reduce((groups, entry) => {
        const type = getReferenceTypeLabel(entry.reference_type);
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(entry);
        return groups;
      }, {} as GroupedEntries);
    }

    return { 'All Entries': journalEntries };
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const calculateGroupTotal = (entries: JournalEntry[]) => {
    return {
      debit: entries.reduce((sum, e) => sum + e.debit_amount, 0),
      credit: entries.reduce((sum, e) => sum + e.credit_amount, 0),
    };
  };

  if (!isOpen || !account) return null;

  const groupedEntries = groupEntries();
  const groupNames = Object.keys(groupedEntries);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl text-gray-900">Account Details</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  account.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                  account.type === 'liability' ? 'bg-red-100 text-red-800' :
                  account.type === 'equity' ? 'bg-purple-100 text-purple-800' :
                  account.type === 'revenue' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {account.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Account Code</p>
                  <p className="text-gray-900 text-lg">{account.code}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Account Name</p>
                  <p className="text-gray-900 text-lg">{account.name}</p>
                </div>
                {account.description && (
                  <div className="col-span-2">
                    <p className="text-gray-600 text-sm mb-1">Description</p>
                    <p className="text-gray-700">{account.description}</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="size-4 text-blue-600" />
                <p className="text-gray-600 text-sm">Total Debit</p>
              </div>
              <p className="text-blue-700 text-xl">{formatCurrency(account.debit)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="size-4 text-red-600" />
                <p className="text-gray-600 text-sm">Total Credit</p>
              </div>
              <p className="text-red-700 text-xl">{formatCurrency(account.credit)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="size-4 text-purple-600" />
                <p className="text-gray-600 text-sm">Current Balance</p>
              </div>
              <p className={`text-xl ${account.balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {account.balance >= 0 ? formatCurrency(account.balance) : `(${formatCurrency(Math.abs(account.balance))})`}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="size-4 text-gray-600" />
                <p className="text-gray-600 text-sm">Total Transactions</p>
              </div>
              <p className="text-gray-900 text-xl">{journalEntries.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <label className="text-gray-700 text-sm">Group By:</label>
            <select
              value={groupBy}
              onChange={(e) => {
                setGroupBy(e.target.value as 'none' | 'month' | 'type');
                setExpandedGroups(new Set());
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Grouping</option>
              <option value="month">By Month</option>
              <option value="type">By Transaction Type</option>
            </select>
            {journalEntries.length > 0 && (
              <p className="text-gray-600 text-sm ml-auto">
                Showing {journalEntries.length} transaction{journalEntries.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Journal Entries */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : journalEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No transactions found for this account</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupNames.map(groupName => {
                const entries = groupedEntries[groupName];
                const groupTotal = calculateGroupTotal(entries);
                const isExpanded = groupBy === 'none' || expandedGroups.has(groupName);

                return (
                  <div key={groupName} className="border border-gray-200 rounded-lg overflow-hidden">
                    {groupBy !== 'none' && (
                      <button
                        onClick={() => toggleGroup(groupName)}
                        className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronUp className="size-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="size-5 text-gray-600" />
                          )}
                          <span className="text-gray-900 font-medium">{groupName}</span>
                          <span className="text-gray-600 text-sm">({entries.length} transactions)</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-600">Debit: </span>
                            <span className="text-blue-700">{formatCurrency(groupTotal.debit)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Credit: </span>
                            <span className="text-red-700">{formatCurrency(groupTotal.credit)}</span>
                          </div>
                        </div>
                      </button>
                    )}
                    
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300 sticky top-0 z-10">
                            <tr>
                              <th className="text-left py-4 px-4 text-gray-700 text-sm font-semibold uppercase tracking-wide">Date</th>
                              <th className="text-left py-4 px-4 text-gray-700 text-sm font-semibold uppercase tracking-wide">Entry #</th>
                              <th className="text-left py-4 px-4 text-gray-700 text-sm font-semibold uppercase tracking-wide">Description</th>
                              <th className="text-left py-4 px-4 text-gray-700 text-sm font-semibold uppercase tracking-wide">Source</th>
                              <th className="text-right py-4 px-4 text-blue-700 text-sm font-semibold uppercase tracking-wide">Debit (+)</th>
                              <th className="text-right py-4 px-4 text-red-700 text-sm font-semibold uppercase tracking-wide">Credit (-)</th>
                              <th className="text-right py-4 px-4 text-emerald-700 text-sm font-semibold uppercase tracking-wide">Running Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry, index) => (
                              <tr
                                key={entry.id}
                                className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                }`}
                              >
                                <td className="py-3 px-4 text-gray-900 text-sm whitespace-nowrap">
                                  {formatDate(entry.entry_date)}
                                </td>
                                <td className="py-3 px-4 text-blue-600 text-sm font-mono font-medium">
                                  {entry.entry_number}
                                </td>
                                <td className="py-3 px-4 text-gray-900 text-sm">
                                  {entry.description}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {getReferenceTypeLabel(entry.reference_type)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-sm font-medium">
                                  {entry.debit_amount > 0 ? (
                                    <span className="text-blue-700 font-semibold">{formatCurrency(entry.debit_amount)}</span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right text-sm font-medium">
                                  {entry.credit_amount > 0 ? (
                                    <span className="text-red-700 font-semibold">{formatCurrency(entry.credit_amount)}</span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right text-sm font-semibold">
                                  <span className={entry.running_balance >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                                    {entry.running_balance >= 0 
                                      ? formatCurrency(entry.running_balance)
                                      : `(${formatCurrency(Math.abs(entry.running_balance))})`
                                    }
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gradient-to-r from-gray-200 to-gray-100 border-t-2 border-gray-400">
                            <tr>
                              <td colSpan={4} className="py-4 px-4 text-gray-900 font-bold text-right text-sm uppercase tracking-wide">
                                Group Total:
                              </td>
                              <td className="py-4 px-4 text-right text-blue-700 font-bold text-sm">
                                {formatCurrency(groupTotal.debit)}
                              </td>
                              <td className="py-4 px-4 text-right text-red-700 font-bold text-sm">
                                {formatCurrency(groupTotal.credit)}
                              </td>
                              <td className="py-4 px-4"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}