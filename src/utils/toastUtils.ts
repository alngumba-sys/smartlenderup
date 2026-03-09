/**
 * Toast utility wrappers that respect preview environment
 */
import { toast } from 'sonner@2.0.3';
import { isPreviewEnvironment } from '../lib/supabase';

/**
 * Show error toast only if not in preview environment
 * Use this for database/network errors that are expected in preview
 */
export const showDatabaseError = (message: string) => {
  if (!isPreviewEnvironment()) {
    toast.error(message);
  } else {
    // Log to console for debugging in preview
    console.log(`ℹ️ [Preview Mode] Suppressed error: ${message}`);
  }
};

/**
 * Show error toast regardless of environment
 * Use this for user action errors that should always be shown
 */
export const showError = (message: string) => {
  toast.error(message);
};

/**
 * Show success toast
 */
export const showSuccess = (message: string) => {
  toast.success(message);
};

/**
 * Show info toast
 */
export const showInfo = (message: string) => {
  toast.info(message);
};
