import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

/**
 * Check if Supabase is reachable before performing critical operations
 * @returns Promise<boolean> - true if connected, false if unreachable
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('❌ Network error testing Supabase:', err);
    return false;
  }
}

/**
 * Check connection and show error toast if unreachable
 * Use this before any critical create/update operation
 * @param operationName - Name of the operation (e.g., "create loan", "add client")
 * @returns Promise<boolean> - true if connected, false if unreachable
 */
export async function ensureSupabaseConnection(operationName: string = 'operation'): Promise<boolean> {
  const isConnected = await checkSupabaseConnection();
  
  if (!isConnected) {
    toast.error('Database not reachable. Check your internet', {
      description: `Cannot ${operationName} without database connection`,
      duration: 6000,
    });
    return false;
  }
  
  return true;
}

/**
 * HOC to wrap form submission handlers with connection check
 * @param handler - Original form submission handler
 * @param operationName - Name of the operation for error message
 * @returns Wrapped handler that checks connection first
 */
export function withSupabaseCheck<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    const isConnected = await ensureSupabaseConnection(operationName);
    if (!isConnected) {
      return; // Block the operation
    }
    
    // Proceed with the original handler
    return handler(...args);
  }) as T;
}

/**
 * React hook for checking connection status in real-time
 */
export function useSupabaseConnectionStatus() {
  const [isConnected, setIsConnected] = React.useState<boolean>(true);
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      setIsChecking(false);
    };

    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking };
}

// Import React for the hook
import React from 'react';
