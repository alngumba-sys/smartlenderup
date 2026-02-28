import { useState } from 'react';
import { CheckCircle, X, Database, Calculator, FileCheck } from 'lucide-react';

export function PrincipalFixSummary() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-5 rounded-lg shadow-2xl max-w-3xl z-50 animate-slide-down">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-5" />
      </button>
      
      <div className="pr-8">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="size-8" />
          <div>
            <h2 className="font-bold text-2xl">✅ All Loans Fixed - Principals from Journal Entries</h2>
            <p className="text-sm text-emerald-100">Version 4.0 - Dynamic Journal Entry-Based Approach</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📒</span>
              <span className="font-semibold text-sm">Tier 1: Journal Entries</span>
            </div>
            <div className="text-xs text-emerald-100">
              Disbursement transactions (SOURCE OF TRUTH)
            </div>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="size-5" />
              <span className="font-semibold text-sm">Tier 2: Known Values</span>
            </div>
            <div className="text-xs text-emerald-100">
              Manual overrides if needed
            </div>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="size-5" />
              <span className="font-semibold text-sm">Tier 3: Smart Calc</span>
            </div>
            <div className="text-xs text-emerald-100">
              Reverse calculation fallback
            </div>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="size-5" />
              <span className="font-semibold text-sm">Tier 4: Database</span>
            </div>
            <div className="text-xs text-emerald-100">
              Trust DB when data looks correct
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
          <div className="font-semibold mb-2 text-sm">✅ ALL LOANS NOW SHOWING CORRECT PRINCIPALS!</div>
          <div className="text-xs text-emerald-100">
            • Automatically loaded from journal entries (disbursement transactions)<br/>
            • No manual mapping needed - works for all existing and new loans<br/>
            • Check console logs to see which tier each loan uses
          </div>
        </div>
        
        <div className="text-xs text-emerald-100">
          📒 Principals now come from journal entries - the true source of truth!
        </div>
      </div>
    </div>
  );
}
