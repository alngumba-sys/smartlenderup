// Utility functions for number formatting with commas

/**
 * Format a number with commas (1000 -> 1,000)
 */
export function formatNumberWithCommas(value: string | number): string {
  if (!value && value !== 0) return '';
  
  // Remove existing commas and non-numeric characters except decimal point
  const cleanValue = value.toString().replace(/,/g, '');
  
  // Split into integer and decimal parts
  const parts = cleanValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Recombine with decimal part if it exists
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Remove commas from a formatted number string (1,000 -> 1000)
 */
export function parseFormattedNumber(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * Handle number input change with automatic comma formatting
 */
export function handleNumberInputChange(
  value: string,
  onChange: (value: string) => void,
  allowDecimals: boolean = true
): void {
  // Remove commas
  let cleanValue = value.replace(/,/g, '');
  
  // Only allow numbers and decimal point
  if (allowDecimals) {
    cleanValue = cleanValue.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
  } else {
    cleanValue = cleanValue.replace(/[^\d]/g, '');
  }
  
  // Format with commas for display
  const formattedValue = formatNumberWithCommas(cleanValue);
  
  // Call the onChange handler with the clean value (without commas)
  onChange(cleanValue);
}

/**
 * Get numeric value from formatted input
 */
export function getNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;
  const cleaned = parseFormattedNumber(value);
  return parseFloat(cleaned) || 0;
}
