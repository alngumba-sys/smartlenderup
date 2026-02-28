import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export function JournalEntryFixNotice() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if we should show the notice (only once per session)
    const noticeShown = sessionStorage.getItem('journal_entry_fix_notice_shown');
    
    if (!noticeShown) {
      // Show notice after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      // Mark as shown
      sessionStorage.setItem('journal_entry_fix_notice_shown', 'true');
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 12000);
    }
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-20 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-2xl p-4 max-w-md z-50 animate-slide-in">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
      
      <div className="flex items-start gap-3 pr-6">
        <CheckCircle className="size-6 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-lg mb-1">Journal Entry Fix Applied ✅</h3>
          <p className="text-sm text-green-50 mb-2">
            Duplicate journal entry numbers have been fixed! The system now uses timestamp suffixes to prevent race conditions.
          </p>
          <div className="text-xs bg-white/10 backdrop-blur-sm rounded px-2 py-1 font-mono">
            New format: JE-2026-0001-789
          </div>
        </div>
      </div>
    </div>
  );
}
