/**
 * FINAL SYNC REMOVAL - All remaining syncToSupabase calls
 * 
 * This documents all the remaining calls that need to be removed.
 * Each one should be removed along with its comment line.
 */

// Template for removal:
// OLD:
//     setEntity([...entity, newItem]);
//     
//     // ✅ SYNC TO SUPABASE
//     syncToSupabase('create', 'entity_name', newItem);
//   };
//
// NEW:
//     setEntity([...entity, newItem]);
//   };

export const REMAINING_SYNC_CALLS = [
  'Line 2160-2161: Expense update',
  'Line 2231-2232: Payee create',
  'Line 2238-2241: Payee update',
  'Line 2248-2249: Payee delete',
  'Line 2266-2267: PayrollRun create',
  'Line 2273-2276: PayrollRun update',
  'Line 2464-2465: BankAccount create',
  'Line 2478-2481: BankAccount update',
  'Line 2488-2489: BankAccount delete',
  'Line 2505-2506: FundingTransaction create',
  'Line 2526-2527: Task create',
  'Line 2533-2536: Task update',
  'Line 2543-2544: Task delete',
  'Line 2560-2561: KYCRecord create',
  'Line 2567-2570: KYCRecord update',
  'Line 2577-2578: KYCRecord delete',
  'Line 2595-2596: AuditLog create',
  'Line 2611-2612: Ticket create',
  'Line 2618-2621: Ticket update',
  'Line 2628-2629: Ticket delete',
  'Line 2645-2646: Group create',
  'Line 2652-2655: Group update',
  'Line 2662-2663: Group delete',
  'Line 2679-2680: Approval create',
  'Line 2686-2689: Approval update',
  'Line 2696-2697: Approval delete',
  'Line 3134-3135: Disbursement create',
  'Line 3164-3165: ProcessingFeeRecord create',
];

// Total: 28 calls to remove
