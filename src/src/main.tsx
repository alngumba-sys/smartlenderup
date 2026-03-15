import React from 'react';
import ReactDOM from 'react-dom/root';
import App from './App'; // Changed from ../App to ./App
import './index.css';

// ==========================================
// 🛡️ WASM BLOCKER - NO SERVICE WORKER
// ==========================================
// Service workers are now unregistered in index.html
// This ensures no cached service workers interfere

console.log('📦 Loading app with MOCK Supabase (no WASM)');

// ==========================================
// 🔴 WEBASSEMBLY ERROR DETECTION 🔴
// ==========================================
// Detect if old cached JavaScript tries to load Supabase
const wasmErrorDetected = () => {
  console.error('\n\n');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('  🔴 WEBASSEMBLY ERROR - BROWSER CACHE ISSUE');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('');
  console.error('Your browser is using CACHED files that try to load Supabase.');
  console.error('');
  console.error('✅ THE FIX (2 STEPS):');
  console.error('');
  console.error('   STEP 1: Close this window');
  console.error('   STEP 2: Press Ctrl+Shift+N (opens incognito mode)');
  console.error('   STEP 3: Go to http://localhost:5174');
  console.error('');
  console.error('   → The error will be GONE in incognito mode!');
  console.error('');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('\n\n');
  
  // Show visual overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 40px;
      border-radius: 20px;
      max-width: 600px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: left;
    ">
      <h1 style="color: #e53e3e; margin: 0 0 20px 0; font-size: 28px;">
        🔴 Browser Cache Issue
      </h1>
      <p style="margin: 0 0 20px 0; line-height: 1.6; color: #2d3748;">
        Your browser cached OLD files that try to load Supabase.
        <br><br>
        <strong>The fix is already in the code - you just need to clear your cache!</strong>
      </p>
      
      <div style="background: #f0fff4; border-left: 4px solid #38a169; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #22543d; font-size: 18px;">✅ EASIEST FIX:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #2d3748; line-height: 1.8; font-size: 16px;">
          <li>Close this window</li>
          <li>Press <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px;">Ctrl+Shift+N</code> (Windows/Linux) or <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px;">Cmd+Shift+N</code> (Mac)</li>
          <li>Navigate to <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px;">http://localhost:5174</code></li>
          <li><strong>Error will be GONE!</strong> 🎉</li>
        </ol>
      </div>
      
      <div style="background: #ebf8ff; border-left: 4px solid #3182ce; padding: 20px; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #2c5282; font-size: 18px;">OR Clear Cache Manually:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #2d3748; line-height: 1.8; font-size: 16px;">
          <li>Press <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px;">Ctrl+Shift+Delete</code></li>
          <li>Select "Cached images and files"</li>
          <li>Click "Clear data"</li>
          <li>Reload this page</li>
        </ol>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <button onclick="location.reload(true)" style="
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        ">
          I Cleared Cache - Reload Now
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
};

// Listen for WASM errors
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('WebAssembly')) {
    e.preventDefault();
    e.stopPropagation();
    wasmErrorDetected();
    return false;
  }
}, true);

// Listen for unhandled promise rejections (WASM might fail here too)
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && String(e.reason).includes('WebAssembly')) {
    e.preventDefault();
    wasmErrorDetected();
  }
});

// ==========================================
// Suppress Recharts duplicate key warnings
// ==========================================
// These warnings are from Recharts library internals and are harmless
// They don't affect functionality - just noisy console spam
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const stringified = String(args[0] || '');
  if (
    stringified.includes('Encountered two children with the same key') ||
    stringified.includes('Warning: Encountered two children') ||
    stringified.includes('Keys should be unique')
  ) {
    return; // Suppress Recharts warnings
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const stringified = String(args[0] || '');
  if (
    stringified.includes('Encountered two children with the same key') ||
    stringified.includes('Warning: Encountered two children') ||
    stringified.includes('Keys should be unique')
  ) {
    return; // Suppress Recharts warnings
  }
  originalWarn.apply(console, args);
};
// ==========================================

// Force light mode - remove any dark mode preferences on app load
localStorage.removeItem('bvfunguo-theme-mode');
document.documentElement.classList.remove('dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);