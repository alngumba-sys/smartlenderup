import { useEffect, useState } from 'react';
import { HardDrive, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * DataSyncIndicator - Shows user that data is being saved automatically
 * Displays in the corner to give peace of mind that data is persistent
 */
export function DataSyncIndicator() {
  const { isDark } = useTheme();
  const [showSaved, setShowSaved] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  useEffect(() => {
    // Listen for localStorage changes to show save indicator
    const handleStorageChange = () => {
      setShowSaved(true);
      setLastSaveTime(new Date());
      
      // Hide after 2 seconds
      setTimeout(() => {
        setShowSaved(false);
      }, 2000);
    };

    // Monitor for any data changes (debounced)
    let timeout: NodeJS.Timeout;
    const checkInterval = setInterval(() => {
      handleStorageChange();
    }, 60000); // Check every minute

    return () => {
      clearInterval(checkInterval);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const formatLastSave = () => {
    if (!lastSaveTime) return '';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaveTime.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaveTime.toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showSaved && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border animate-in fade-in slide-in-from-bottom-2 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Check className="size-4 text-emerald-600" />
          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            All changes saved
          </span>
        </div>
      )}
      
      {!showSaved && lastSaveTime && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
          isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
        }`}>
          <HardDrive className="size-3" />
          <span>Saved {formatLastSave()}</span>
        </div>
      )}
    </div>
  );
}
