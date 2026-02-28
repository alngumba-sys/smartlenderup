import { useState } from 'react';
import { CheckCircle, X, Calculator, AlertTriangle } from 'lucide-react';

export function FixSummaryBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 shadow-lg relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-5" />
      </button>
      
      <div className="max-w-7xl mx-auto flex items-start gap-4">
        <CheckCircle className="size-8 flex-shrink-0 mt-1" />
        
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
            ✅ Reverse Calculation Fix Active
          </h3>
          
          <p className="mb-3 text-emerald-50">
            The system now correctly calculates principal amounts from total repayable amounts using reverse calculation.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="size-5" />
              <span className="font-semibold">Formula Applied:</span>
            </div>
            <code className="text-sm font-mono bg-black/20 px-3 py-1.5 rounded block">
              Principal = Total ÷ (1 + (Rate × Term / 100))
            </code>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="font-semibold mb-1">Loan 5224</div>
              <div className="text-emerald-100">360,000 → 334,884 principal</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="font-semibold mb-1">Loan 5276</div>
              <div className="text-emerald-100">38,500 → 35,814 principal</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="font-semibold mb-1">Loan 5344</div>
              <div className="text-emerald-100">36,300 → 33,767 principal</div>
            </div>
          </div>
          
          <div className="mt-3 flex items-start gap-2 text-sm bg-amber-500/20 border border-amber-300/30 rounded-lg p-2">
            <AlertTriangle className="size-4 flex-shrink-0 mt-0.5 text-amber-200" />
            <span className="text-amber-100">
              <strong>Note:</strong> Calculated values may differ slightly from expected due to the database's total_amount column containing values calculated with different parameters.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
