import { useState } from 'react';
import { AlertTriangle, X, Copy, Check, ExternalLink } from 'lucide-react';

export function DatabaseErrorOverlay() {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (dismissed) return null;

  const handleCopyInstructions = () => {
    const instructions = `1. Go to https://supabase.com/dashboard
2. Click your SmartLenderUp project
3. Click "SQL Editor" on the left sidebar
4. Click "New Query"
5. Open /RUN-THIS-IN-SUPABASE.sql from your project
6. Copy ALL the SQL code
7. Paste it in Supabase SQL Editor
8. Click the green "RUN" button
9. Wait for ✅ success messages
10. Refresh this page (Ctrl+Shift+R)`;
    
    // Try modern clipboard API first, fallback to older method
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(instructions)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback: use older execCommand method
          fallbackCopy(instructions);
        });
    } else {
      // Use fallback for browsers without clipboard API
      fallbackCopy(instructions);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Just show copied anyway - user can manually copy
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenSupabase = () => {
    window.open('https://supabase.com/dashboard', '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="relative max-w-2xl w-full rounded-xl shadow-2xl border-2 overflow-hidden"
        style={{
          backgroundColor: '#1a1a2e',
          borderColor: '#ef4444'
        }}
      >
        {/* Animated Alert Bar */}
        <div 
          className="h-2 animate-pulse"
          style={{
            background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)',
            backgroundSize: '200% 100%',
            animation: 'gradient 2s ease infinite'
          }}
        />
        
        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:scale-110"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444'
          }}
        >
          <X className="size-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div 
              className="p-3 rounded-xl flex-shrink-0 animate-bounce"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444'
              }}
            >
              <AlertTriangle className="size-8" />
            </div>
            <div>
              <h2 
                className="text-2xl mb-2"
                style={{ color: '#ef4444' }}
              >
                Database Setup Required
              </h2>
              <p style={{ color: '#94a3b8' }}>
                Your Supabase database is missing required columns. This will take 2 minutes to fix.
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
            <p className="text-sm mb-2" style={{ color: '#fca5a5' }}>
              Missing:
            </p>
            <ul className="space-y-1 text-sm" style={{ color: '#ef4444' }}>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-current" />
                <code className="font-mono">pricing_config.trial_days</code> column
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-current" />
                <code className="font-mono">contact_messages</code> table
              </li>
            </ul>
          </div>

          {/* Quick Fix Instructions */}
          <div className="mb-6">
            <h3 
              className="text-lg mb-4 flex items-center gap-2"
              style={{ color: '#10b981' }}
            >
              <span className="flex items-center justify-center size-6 rounded-full text-xs" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                ✓
              </span>
              Quick Fix (2 Minutes)
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span 
                  className="flex items-center justify-center size-7 rounded-full flex-shrink-0 text-sm"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                >
                  1
                </span>
                <div className="flex-1">
                  <p style={{ color: '#e2e8f0' }} className="mb-2">
                    Open Supabase SQL Editor
                  </p>
                  <button
                    onClick={handleOpenSupabase}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 text-sm"
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white'
                    }}
                  >
                    <ExternalLink className="size-4" />
                    Open Supabase Dashboard
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span 
                  className="flex items-center justify-center size-7 rounded-full flex-shrink-0 text-sm"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                >
                  2
                </span>
                <div className="flex-1">
                  <p style={{ color: '#e2e8f0' }} className="mb-2">
                    Navigate to SQL Editor → New Query
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span 
                  className="flex items-center justify-center size-7 rounded-full flex-shrink-0 text-sm"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                >
                  3
                </span>
                <div className="flex-1">
                  <p style={{ color: '#e2e8f0' }} className="mb-2">
                    Copy SQL code from this file:
                  </p>
                  <code 
                    className="block px-3 py-2 rounded font-mono text-sm"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    /RUN-THIS-IN-SUPABASE.sql
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span 
                  className="flex items-center justify-center size-7 rounded-full flex-shrink-0 text-sm"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                >
                  4
                </span>
                <div className="flex-1">
                  <p style={{ color: '#e2e8f0' }}>
                    Paste and click <strong style={{ color: '#10b981' }}>RUN</strong>, then refresh this page
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyInstructions}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied!' : 'Copy Instructions'}
            </button>
            
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-3 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                color: '#94a3b8',
                border: '1px solid rgba(148, 163, 184, 0.3)'
              }}
            >
              I'll Do This Later
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center mt-4" style={{ color: '#64748b' }}>
            Need help? Check <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}>/DATABASE-FIX-README.md</code> for detailed instructions
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}