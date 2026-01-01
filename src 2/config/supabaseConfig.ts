/**
 * Supabase Primary Storage Configuration
 * 
 * This configuration ensures that ALL data operations go through Supabase
 * as the primary data store, with localStorage only used for caching.
 * 
 * Updated: December 2025
 */

export const SUPABASE_CONFIG = {
  // ============================================
  // PRIMARY STORAGE SETTINGS
  // ============================================
  
  /**
   * Enable Supabase as primary data store
   * When true: All operations write to Supabase first, localStorage is cache only
   * When false: Falls back to localStorage (offline mode)
   */
  ENABLED: true,
  
  /**
   * Require Supabase for all operations
   * When true: Operations fail if Supabase is unavailable
   * When false: Falls back to localStorage if Supabase fails
   */
  REQUIRED: true,
  
  /**
   * Use localStorage as cache layer
   * When true: Data is cached in localStorage for faster reads
   * When false: All reads come from Supabase (slower but always fresh)
   */
  USE_CACHE: true,
  
  /**
   * Cache expiration time (in milliseconds)
   * Default: 5 minutes (300000 ms)
   */
  CACHE_EXPIRATION: 300000, // 5 minutes
  
  // ============================================
  // DATA SYNC SETTINGS
  // ============================================
  
  /**
   * Auto-sync to Supabase on every change
   * When true: Every create/update/delete immediately syncs to Supabase
   * When false: Changes are batched (not recommended)
   */
  AUTO_SYNC: true,
  
  /**
   * Show sync notifications in UI
   * When true: Users see toast notifications for sync operations
   * When false: Sync happens silently in background
   */
  SHOW_SYNC_NOTIFICATIONS: false, // Keep false to avoid notification spam
  
  /**
   * Log sync operations to console
   * When true: Detailed sync logs appear in console
   * When false: Silent sync (only errors logged)
   */
  LOG_SYNC_OPERATIONS: true,
  
  /**
   * Retry failed sync operations
   * Number of retry attempts before giving up
   */
  SYNC_RETRY_ATTEMPTS: 3,
  
  /**
   * Retry delay (in milliseconds)
   * Delay between retry attempts
   */
  SYNC_RETRY_DELAY: 1000, // 1 second
  
  // ============================================
  // TABLE MAPPING
  // ============================================
  
  /**
   * Map frontend entity names to Supabase table names
   * This ensures consistent naming across the app
   */
  TABLE_MAPPING: {
    // Core entities
    'client': 'clients',
    'loan': 'loans',
    'loan_product': 'loan_products',
    'repayment': 'repayments',
    
    // Savings
    'savings_account': 'savings_accounts',
    'savings_transaction': 'savings_transactions',
    
    // Shareholders
    'shareholder': 'shareholders',
    'shareholder_transaction': 'shareholder_transactions',
    
    // Financial
    'bank_account': 'bank_accounts',
    'funding_transaction': 'funding_transactions',
    'expense': 'expenses',
    'payee': 'payees',
    
    // HR & Payroll
    'employee': 'employees',
    'payroll_record': 'payroll_records',
    
    // Accounting
    'journal_entry': 'journal_entries',
    'journal_entry_line': 'journal_entry_lines',
    
    // Workflow
    'approval': 'approvals',
    'processing_fee_record': 'processing_fee_records',
    
    // Organization
    'group': 'groups',
    'branch': 'branches',
    
    // System
    'audit_log': 'audit_logs',
    'user_setting': 'user_settings',
    'subscription': 'subscriptions',
    'subscription_payment': 'subscription_payments',
  } as const,
  
  // ============================================
  // LOCALSTORAGE MANAGEMENT
  // ============================================
  
  /**
   * LocalStorage keys to preserve (never clear these)
   */
  PROTECTED_KEYS: [
    'sb-', // Supabase auth tokens (prefix)
    'supabase.auth.token',
    'theme_preference',
    'user_language',
  ],
  
  /**
   * LocalStorage keys to use only as cache
   * These are populated from Supabase and can be cleared
   */
  CACHE_KEYS: [
    'bvfunguo_clients',
    'bvfunguo_loans',
    'bvfunguo_loan_products',
    'bvfunguo_repayments',
    'bvfunguo_savings_accounts',
    'bvfunguo_savings_transactions',
    'bvfunguo_shareholders',
    'bvfunguo_shareholder_transactions',
    'bvfunguo_bank_accounts',
    'bvfunguo_funding_transactions',
    'bvfunguo_expenses',
    'bvfunguo_payees',
    'bvfunguo_employees',
    'bvfunguo_payroll_records',
    'bvfunguo_journal_entries',
    'bvfunguo_journal_entry_lines',
    'bvfunguo_approvals',
    'bvfunguo_processing_fee_records',
    'bvfunguo_groups',
    'bvfunguo_branches',
    'bvfunguo_audit_logs',
  ],
  
  // ============================================
  // OFFLINE MODE
  // ============================================
  
  /**
   * Enable offline mode
   * When true: App can work without Supabase connection
   * When false: App requires active Supabase connection
   */
  OFFLINE_MODE_ENABLED: false,
  
  /**
   * Queue operations when offline
   * When true: Operations are queued and synced when connection returns
   * When false: Operations fail when offline
   */
  QUEUE_OFFLINE_OPERATIONS: false,
  
  // ============================================
  // VALIDATION
  // ============================================
  
  /**
   * Validate data before saving to Supabase
   * When true: Data is validated against schema before save
   * When false: Data is saved without validation (faster but risky)
   */
  VALIDATE_BEFORE_SAVE: true,
  
  /**
   * Strict validation mode
   * When true: Missing or invalid fields cause operation to fail
   * When false: Invalid fields are filtered out, operation continues
   */
  STRICT_VALIDATION: false,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if Supabase is enabled
 */
export const isSupabaseEnabled = (): boolean => {
  return SUPABASE_CONFIG.ENABLED;
};

/**
 * Check if Supabase is required
 */
export const isSupabaseRequired = (): boolean => {
  return SUPABASE_CONFIG.REQUIRED;
};

/**
 * Check if cache should be used
 */
export const shouldUseCache = (): boolean => {
  return SUPABASE_CONFIG.USE_CACHE;
};

/**
 * Get table name for entity
 */
export const getTableName = (entity: string): string => {
  return SUPABASE_CONFIG.TABLE_MAPPING[entity as keyof typeof SUPABASE_CONFIG.TABLE_MAPPING] || entity;
};

/**
 * Check if a localStorage key is protected
 */
export const isProtectedKey = (key: string): boolean => {
  return SUPABASE_CONFIG.PROTECTED_KEYS.some(protectedKey => 
    key.startsWith(protectedKey)
  );
};

/**
 * Check if a localStorage key is a cache key
 */
export const isCacheKey = (key: string): boolean => {
  return SUPABASE_CONFIG.CACHE_KEYS.includes(key);
};

/**
 * Log sync operation (if enabled)
 */
export const logSync = (operation: string, entity: string, details?: any): void => {
  if (SUPABASE_CONFIG.LOG_SYNC_OPERATIONS) {
    console.log(`[SUPABASE SYNC] ${operation} - ${entity}`, details || '');
  }
};

/**
 * Show sync notification (if enabled)
 */
export const notifySync = (message: string, type: 'success' | 'error' | 'info' = 'info'): void => {
  if (SUPABASE_CONFIG.SHOW_SYNC_NOTIFICATIONS) {
    // This would be replaced with actual toast notification
    console.log(`[SYNC ${type.toUpperCase()}] ${message}`);
  }
};

// ============================================
// MIGRATION HELPERS
// ============================================

/**
 * Migration status tracking
 */
export const MIGRATION_STATUS = {
  /**
   * Has data been migrated from localStorage to Supabase?
   */
  localStorage_migrated: false,
  
  /**
   * Migration timestamp
   */
  migrated_at: null as string | null,
  
  /**
   * Migration version
   */
  migration_version: '1.0.0',
};

/**
 * Mark migration as complete
 */
export const markMigrationComplete = (): void => {
  MIGRATION_STATUS.localStorage_migrated = true;
  MIGRATION_STATUS.migrated_at = new Date().toISOString();
  localStorage.setItem('bvfunguo_migration_status', JSON.stringify(MIGRATION_STATUS));
};

/**
 * Check if migration is needed
 */
export const isMigrationNeeded = (): boolean => {
  const status = localStorage.getItem('bvfunguo_migration_status');
  if (!status) return true;
  
  try {
    const parsed = JSON.parse(status);
    return !parsed.localStorage_migrated;
  } catch {
    return true;
  }
};

// ============================================
// EXPORTS
// ============================================

export default SUPABASE_CONFIG;

// Type-safe entity names
export type EntityType = keyof typeof SUPABASE_CONFIG.TABLE_MAPPING;

// Re-export for convenience
export {
  SUPABASE_CONFIG as Config,
};
