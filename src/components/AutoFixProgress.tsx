import { useState, useEffect } from 'react';

/**
 * Shows a progress banner when auto-fix is running
 */
export function AutoFixProgress() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for auto-fix events
    const handleAutoFixStart = () => {
      setShow(true);
      setMessage('Cleaning duplicate products...');
    };

    const handleAutoFixComplete = (event: any) => {
      const { deletedCount } = event.detail || {};
      if (deletedCount > 0) {
        setMessage(`✅ Removed ${deletedCount} duplicate${deletedCount === 1 ? '' : 's'}! Reloading...`);
        setTimeout(() => setShow(false), 2000);
      } else {
        setShow(false);
      }
    };

    const handleAutoFixError = () => {
      setMessage('⚠️ Auto-fix failed. Please try manually.');
      setTimeout(() => setShow(false), 3000);
    };

    window.addEventListener('autofix:start', handleAutoFixStart);
    window.addEventListener('autofix:complete', handleAutoFixComplete as EventListener);
    window.addEventListener('autofix:error', handleAutoFixError);

    return () => {
      window.removeEventListener('autofix:start', handleAutoFixStart);
      window.removeEventListener('autofix:complete', handleAutoFixComplete as EventListener);
      window.removeEventListener('autofix:error', handleAutoFixError);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-5">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
