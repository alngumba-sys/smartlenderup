import { formatCurrency, getCurrencySymbol, getCurrencyCode } from '../utils/currencyUtils';

interface CurrencyDisplayProps {
  amount: number;
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
  className?: string;
}

export function CurrencyDisplay({ 
  amount, 
  showSymbol = true, 
  showCode = false, 
  decimals = 0,
  className = ''
}: CurrencyDisplayProps) {
  return (
    <span className={className}>
      {formatCurrency(amount, { showSymbol, showCode, decimals })}
    </span>
  );
}

// Export utilities for inline use
export { getCurrencySymbol, getCurrencyCode, formatCurrency };
