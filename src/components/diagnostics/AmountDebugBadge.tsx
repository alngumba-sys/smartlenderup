import { Calculator } from 'lucide-react';

interface AmountDebugBadgeProps {
  loanNumber: string;
  dbPrincipal: number;
  calculatedPrincipal: number;
  total: number;
}

export function AmountDebugBadge({ loanNumber, dbPrincipal, calculatedPrincipal, total }: AmountDebugBadgeProps) {
  // Only show for specific test loans
  if (!['5224', '5276', '5344'].includes(loanNumber)) {
    return null;
  }
  
  const isCorrect = Math.abs(calculatedPrincipal - dbPrincipal) > 1000;
  
  return (
    <div className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs">
      <Calculator className="size-3 text-blue-600" />
      <span className="text-blue-700 font-mono">
        {isCorrect ? (
          <span className="text-green-600 font-semibold">
            Calc: {calculatedPrincipal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        ) : (
          <span>Using DB: {dbPrincipal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        )}
      </span>
    </div>
  );
}
