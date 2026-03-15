import React, { useState, useEffect } from 'react';
import { checkForDuplicates } from '../utils/autoCleanupDuplicates';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, X } from 'lucide-react';

export function DuplicateWarningBanner() {
  const { currentUser } = useAuth();
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkDups = async () => {
      if (!currentUser?.organizationId) return;
      
      setChecking(true);
      try {
        const count = await checkForDuplicates(currentUser.organizationId);
        setDuplicateCount(count);
      } catch (error) {
        console.error('Failed to check duplicates:', error);
      } finally {
        setChecking(false);
      }
    };

    checkDups();
    
    // Re-check every 10 seconds
    const interval = setInterval(checkDups, 10000);
    return () => clearInterval(interval);
  }, [currentUser?.organizationId]);

  if (checking || dismissed || duplicateCount === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg border-2 border-amber-400">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 animate-pulse"></div>
            <AlertTriangle className="relative size-6" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            ⚠️ Duplicate Product Codes Detected
          </h3>
          <p className="text-sm text-amber-50 mb-3">
            Found <strong>{duplicateCount} duplicate product code{duplicateCount === 1 ? '' : 's'}</strong> in your database. 
            This causes the "Duplicate key on attempt 1" warning when creating products.
          </p>
        </div>
        
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
          title="Dismiss"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}