/**
 * Database Error Helper Component
 * 
 * Shows helpful guidance when database errors occur
 * Appears as a non-intrusive banner with actionable steps
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Terminal, ExternalLink, Copy, Check } from 'lucide-react';

export function DatabaseErrorHelper() {
  const [visible, setVisible] = useState(false);
  const [errorType, setErrorType] = useState<'network' | 'rls' | 'schema' | 'auth' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Listen for console errors to detect database issues
    const originalError = console.error;
    console.error = (...args) => {
      originalError(...args);
      
      const errorMessage = args.join(' ').toLowerCase();
      
      // Detect error type
      if (errorMessage.includes('permission denied') || errorMessage.includes('42501')) {
        setErrorType('rls');
        setVisible(true);
      } else if (errorMessage.includes('does not exist') || errorMessage.includes('42p01')) {
        setErrorType('schema');
        setVisible(true);
      } else if (errorMessage.includes('jwt') || errorMessage.includes('pgrst301')) {
        setErrorType('auth');
        setVisible(true);
      } else if (errorMessage.includes('failed to fetch') || errorMessage.includes('networkerror')) {
        setErrorType('network');
        setVisible(true);
      }
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!visible || !errorType) return null;

  const errorInfo = {
    network: {
      title: 'Network Connection Error',
      description: 'Cannot reach Supabase database. This could be a real connectivity issue.',
      steps: [
        'Check your internet connection',
        'Visit status.supabase.com to check if Supabase is down',
        'Try disabling VPN or proxy',
        'Check firewall settings'
      ],
      command: null,
      color: 'red'
    },
    rls: {
      title: 'Permission Denied - RLS Blocking Access',
      description: 'Row Level Security is enabled but blocking access. You need to disable RLS or set up proper authentication.',
      steps: [
        'Open browser console (F12)',
        'Type: window.diagnoseDatabaseIssue()',
        'Follow the recommended actions',
        'Quick fix: Run DISABLE_RLS_FOR_TESTING.sql in Supabase'
      ],
      command: 'window.diagnoseDatabaseIssue()',
      color: 'orange'
    },
    schema: {
      title: 'Database Schema Missing',
      description: 'Required database tables do not exist. You need to run the database setup script.',
      steps: [
        'Go to Supabase Dashboard → SQL Editor',
        'Open /supabase/COMPLETE_DATABASE_SETUP.sql',
        'Copy and paste the entire contents',
        'Click "Run" in Supabase SQL Editor'
      ],
      command: null,
      color: 'yellow'
    },
    auth: {
      title: 'Authentication Error',
      description: 'Supabase requires authentication but no valid session exists. This is common with auto-login.',
      steps: [
        'Quick fix: Disable RLS in Supabase',
        'Run: /supabase/DISABLE_RLS_FOR_TESTING.sql',
        'Or set up proper Supabase authentication',
        'See TROUBLESHOOTING_DATABASE_ERRORS.md'
      ],
      command: 'window.diagnoseDatabaseIssue()',
      color: 'blue'
    }
  };

  const info = errorInfo[errorType];
  const bgColor = {
    red: 'rgba(239, 68, 68, 0.1)',
    orange: 'rgba(249, 115, 22, 0.1)',
    yellow: 'rgba(234, 179, 8, 0.1)',
    blue: 'rgba(59, 130, 246, 0.1)'
  }[info.color];
  
  const borderColor = {
    red: 'rgba(239, 68, 68, 0.3)',
    orange: 'rgba(249, 115, 22, 0.3)',
    yellow: 'rgba(234, 179, 8, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)'
  }[info.color];

  const textColor = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    blue: '#3b82f6'
  }[info.color];

  return (
    <div
      className="fixed bottom-4 right-4 max-w-md rounded-lg shadow-2xl border-2 p-4 z-50 animate-in slide-in-from-bottom-5"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: textColor }} />
          <div>
            <h3 className="font-semibold text-sm" style={{ color: textColor }}>
              {info.title}
            </h3>
            <p className="text-xs mt-1 text-gray-700">
              {info.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-3">
        {info.steps.map((step, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-xs font-semibold min-w-[20px]" style={{ color: textColor }}>
              {index + 1}.
            </span>
            <span className="text-xs text-gray-700">{step}</span>
          </div>
        ))}
      </div>

      {/* Command to run */}
      {info.command && (
        <div className="mt-3 p-2 rounded bg-gray-900 border border-gray-700">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Terminal className="size-3 text-green-400" />
              <span className="text-xs text-green-400 font-mono">Console Command</span>
            </div>
            <button
              onClick={() => copyCommand(info.command!)}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="size-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <code className="text-xs text-white font-mono block">
            {info.command}
          </code>
        </div>
      )}

      {/* Links */}
      <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open('/TROUBLESHOOTING_DATABASE_ERRORS.md', '_blank');
          }}
          className="text-xs flex items-center gap-1 hover:underline"
          style={{ color: textColor }}
        >
          <ExternalLink className="size-3" />
          Full Troubleshooting Guide
        </a>
        
        {info.command && (
          <button
            onClick={() => {
              // Run the diagnostic command
              if (typeof window !== 'undefined' && (window as any).diagnoseDatabaseIssue) {
                (window as any).diagnoseDatabaseIssue();
              }
            }}
            className="text-xs px-2 py-1 rounded hover:bg-white/50 transition-colors"
            style={{ color: textColor }}
          >
            Run Diagnostics
          </button>
        )}
      </div>
    </div>
  );
}
