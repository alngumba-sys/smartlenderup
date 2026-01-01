import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Check } from 'lucide-react';

export function SupabaseSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Update last sync time every minute when online
    if (isOnline) {
      setLastSync(new Date());
      const interval = setInterval(() => {
        setLastSync(new Date());
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const getTimeSinceSync = () => {
    if (!lastSync) return '';
    const seconds = Math.floor((new Date().getTime() - lastSync.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{
      backgroundColor: isOnline ? '#0f2a1f' : '#2a1410',
      color: isOnline ? '#4ade80' : '#f87171',
      display: 'none'
    }}>
      {isOnline ? (
        <>
          <Cloud className="size-3.5" />
          <span>Cloud Sync Active</span>
          {lastSync && (
            <span className="opacity-70">• {getTimeSinceSync()}</span>
          )}
        </>
      ) : (
        <>
          <CloudOff className="size-3.5" />
          <span>Offline Mode</span>
        </>
      )}
    </div>
  );
}