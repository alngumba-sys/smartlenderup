/**
 * Utility functions for safe mathematical calculations
 * Prevents NaN, Infinity, and -Infinity values
 */

/**
 * Safely calculates a percentage and returns a formatted string
 * @param value - The numerator
 * @param total - The denominator
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string without the % symbol
 */
export function safePercentage(value: number, total: number, decimals: number = 2): string {
  // Check for invalid inputs
  if (!isFinite(value) || !isFinite(total) || total === 0) {
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }
  
  const percentage = (value / total) * 100;
  
  // Check for invalid result
  if (!isFinite(percentage) || isNaN(percentage)) {
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }
  
  return percentage.toFixed(decimals);
}

/**
 * Safely divides two numbers
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted result or '0.00' if invalid
 */
export function safeDivide(numerator: number, denominator: number, decimals: number = 2): string {
  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) {
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }
  
  const result = numerator / denominator;
  
  if (!isFinite(result) || isNaN(result)) {
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }
  
  return result.toFixed(decimals);
}

/**
 * Safely calculates a percentage and returns a number
 * @param value - The numerator
 * @param total - The denominator
 * @returns Percentage as a number or 0 if invalid
 */
export function safePercentageNum(value: number, total: number): number {
  if (!isFinite(value) || !isFinite(total) || total === 0) {
    return 0;
  }
  
  const percentage = (value / total) * 100;
  
  if (!isFinite(percentage) || isNaN(percentage)) {
    return 0;
  }
  
  return percentage;
}

/**
 * Safely divides and returns a number
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @returns Result as a number or 0 if invalid
 */
export function safeDivideNum(numerator: number, denominator: number): number {
  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) {
    return 0;
  }
  
  const result = numerator / denominator;
  
  if (!isFinite(result) || isNaN(result)) {
    return 0;
  }
  
  return result;
}

/**
 * Safely formats a number to fixed decimals
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string or '0.00' if invalid
 */
export function safeToFixed(value: number, decimals: number = 2): string {
  if (!isFinite(value) || isNaN(value)) {
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }
  
  return value.toFixed(decimals);
}

/**
 * Safely formats a number with locale string formatting
 * @param value - The number to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted string or '0.00' if invalid
 */
export function safeFormat(value: number, options?: Intl.NumberFormatOptions): string {
  if (!isFinite(value) || isNaN(value)) {
    const decimals = options?.minimumFractionDigits || 2;
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }
  
  return value.toLocaleString(undefined, options);
}