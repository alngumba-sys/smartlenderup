/**
 * Status Utilities - Platform-wide status normalization
 * 
 * This module ensures consistent handling of loan and payment statuses across the platform.
 * Key principle: "Paid" and "Fully Paid" are treated as IDENTICAL statuses.
 */

/**
 * Normalize loan/payment status to a standard format
 * - Converts "Fully Paid", "Fully_Paid", "fully paid", "fully_paid" to "Paid"
 * - Ensures consistent case handling
 */
export function normalizeStatus(status: string | undefined): string {
  if (!status) return 'Pending';
  
  const normalized = status.trim();
  
  // Convert "Fully Paid" variants to "Paid"
  if (normalized.toLowerCase().replace(/[_\s]/g, '') === 'fullypaid') {
    return 'Paid';
  }
  
  // Capitalize first letter, lowercase rest
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

/**
 * Check if a status represents a fully paid/completed loan
 * Returns true for: Paid, Fully Paid, Fully_Paid, Closed, Completed, Settled
 */
export function isPaidStatus(status: string | undefined): boolean {
  if (!status) return false;
  
  const normalized = status.toLowerCase().trim().replace(/[_\s]/g, '');
  
  return (
    normalized === 'paid' ||
    normalized === 'fullypaid' ||
    normalized === 'closed' ||
    normalized === 'completed' ||
    normalized === 'settled'
  );
}

/**
 * Check if a status represents an active loan
 * Returns true for: Active, Disbursed, In Arrears
 */
export function isActiveStatus(status: string | undefined): boolean {
  if (!status) return false;
  
  const normalized = status.toLowerCase().trim().replace(/[_\s]/g, '');
  
  return (
    normalized === 'active' ||
    normalized === 'disbursed' ||
    normalized === 'inarrears' ||
    normalized === 'overdue'
  );
}

/**
 * Check if a status represents a disbursed loan (includes any loan that has been given out)
 * Returns true for: Active, Disbursed, In Arrears, Paid, Fully Paid, Closed, Completed, Defaulted, Written Off
 */
export function isDisbursedStatus(status: string | undefined): boolean {
  if (!status) return false;
  
  const normalized = status.toLowerCase().trim().replace(/[_\s]/g, '');
  
  return (
    normalized === 'active' ||
    normalized === 'disbursed' ||
    normalized === 'inarrears' ||
    normalized === 'overdue' ||
    normalized === 'paid' ||
    normalized === 'fullypaid' ||
    normalized === 'closed' ||
    normalized === 'completed' ||
    normalized === 'settled' ||
    normalized === 'defaulted' ||
    normalized === 'default' ||
    normalized === 'defaultpastdue' ||
    normalized === 'writtenoff'
  );
}

/**
 * Get display-friendly status text
 * Normalizes "Fully Paid" to "Paid" for consistent UI
 */
export function getDisplayStatus(status: string | undefined): string {
  if (!status) return 'Pending';
  
  const normalized = normalizeStatus(status);
  
  // Special cases for display
  if (normalized.toLowerCase() === 'inarrears') return 'In Arrears';
  if (normalized.toLowerCase() === 'writtenoff') return 'Written Off';
  
  return normalized;
}

/**
 * Get status badge color class for Tailwind
 */
export function getStatusColor(status: string | undefined): {
  bg: string;
  text: string;
  bgDark: string;
  textDark: string;
} {
  const normalized = normalizeStatus(status);
  const lower = normalized.toLowerCase();
  
  if (isPaidStatus(status)) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      bgDark: 'bg-blue-900/30',
      textDark: 'text-blue-300'
    };
  }
  
  if (lower === 'active' || lower === 'disbursed') {
    return {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      bgDark: 'bg-emerald-900/30',
      textDark: 'text-emerald-300'
    };
  }
  
  if (lower === 'inarrears' || lower === 'overdue') {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      bgDark: 'bg-amber-900/30',
      textDark: 'text-amber-300'
    };
  }
  
  if (lower === 'defaulted' || lower === 'writtenoff') {
    return {
      bg: 'bg-red-100',
      text: 'text-red-700',
      bgDark: 'bg-red-900/30',
      textDark: 'text-red-300'
    };
  }
  
  if (lower === 'pending' || lower === 'approved') {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      bgDark: 'bg-gray-700',
      textDark: 'text-gray-300'
    };
  }
  
  // Default
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    bgDark: 'bg-gray-700',
    textDark: 'text-gray-300'
  };
}
