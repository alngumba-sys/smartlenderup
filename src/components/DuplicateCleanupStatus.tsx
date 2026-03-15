import React, { useState, useEffect } from 'react';
import { checkForDuplicates } from '../utils/autoCleanupDuplicates';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export function DuplicateCleanupStatus() {
  const { currentUser } = useAuth();
  const [duplicateCount, setDuplicateCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkDuplicates = async () => {
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

    checkDuplicates();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkDuplicates, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.organizationId]);

  if (checking) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
        <Loader className="size-3 text-blue-600 animate-spin" />
        <span className="text-blue-700">Checking database...</span>
      </div>
    );
  }

  if (duplicateCount === null) {
    return null;
  }

  if (duplicateCount === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
        <CheckCircle className="size-3 text-emerald-600" />
        <span className="text-emerald-700 font-medium">Database Clean</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
      <AlertCircle className="size-3 text-amber-600" />
      <span className="text-amber-700">
        {duplicateCount} duplicate{duplicateCount === 1 ? '' : 's'} found
      </span>
    </div>
  );
}
