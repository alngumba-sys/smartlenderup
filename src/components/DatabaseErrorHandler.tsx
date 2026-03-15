import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';

interface DatabaseErrorHandlerProps {
  children: React.ReactNode;
}

export function DatabaseErrorHandler({ children }: DatabaseErrorHandlerProps) {
  const [dbError, setDbError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Listen for uncaught errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || '';
      
      // Check for database schema errors
      if (
        errorMessage.includes('column') && errorMessage.includes('does not exist') ||
        errorMessage.includes('42703') ||
        errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
        errorMessage.includes('42P01')
      ) {
        setDbError(errorMessage);
        event.preventDefault(); // Prevent default error handling
      }
    };

    // Listen for unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      
      if (
        errorMessage.includes('column') && errorMessage.includes('does not exist') ||
        errorMessage.includes('42703') ||
        errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
        errorMessage.includes('42P01')
      ) {
        setDbError(errorMessage);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard', '_blank');
  };

  const copyInstructions = () => {
    const text = `Database Setup Instructions:

1. Open https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" → "New Query"
4. Open /supabase/COMPLETE_DATABASE_SETUP.sql in your code editor
5. Copy ALL the SQL code (Ctrl+A, Ctrl+C)
6. Paste into Supabase SQL Editor
7. Click "RUN" button
8. Wait for success message
9. Refresh this page (F5)`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!dbError) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div 
          className="max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden border-2"
          style={{
            backgroundColor: '#1a1a2e',
            borderColor: '#ef4444'
          }}
        >
          {/* Animated Alert Bar */}
          <div 
            className="h-2"
            style={{
              background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)',
              animation: 'gradient-shift 2s ease infinite'
            }}
          />

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="p-3 rounded-xl flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  animation: 'bounce 1s infinite'
                }}
              >
                <AlertTriangle className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#ef4444' }}>
                  Database Not Initialized
                </h2>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Your Supabase database is missing required tables and columns
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div 
              className="p-4 rounded-lg mb-6"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <p className="text-xs mb-2 font-semibold" style={{ color: '#fca5a5' }}>
                Error Details:
              </p>
              <code 
                className="text-xs block font-mono p-2 rounded"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#ef4444',
                  wordBreak: 'break-word'
                }}
              >
                {dbError}
              </code>
            </div>

            {/* Quick Instructions */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold" style={{ color: '#10b981' }}>
                ✅ Quick Fix (2 Minutes):
              </h3>

              <ol className="space-y-3 text-sm" style={{ color: '#e2e8f0' }}>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                  >
                    1
                  </span>
                  <span>Open Supabase Dashboard → SQL Editor → New Query</span>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                  >
                    2
                  </span>
                  <span>
                    Open <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>/supabase/COMPLETE_DATABASE_SETUP.sql</code> in your code editor
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                  >
                    3
                  </span>
                  <span>Copy ALL the SQL code (Ctrl+A, then Ctrl+C)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                  >
                    4
                  </span>
                  <span>Paste into Supabase SQL Editor and click RUN</span>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                  >
                    5
                  </span>
                  <span>Refresh this page (F5) after seeing success message</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={openSupabase}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white'
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Open Supabase
              </button>
              
              <button
                onClick={copyInstructions}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Instructions'}
              </button>
            </div>

            {/* Documentation Link */}
            <p className="text-xs text-center mt-4" style={{ color: '#64748b' }}>
              Full guide: <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}>/START_HERE_DATABASE_FIX.md</code>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
