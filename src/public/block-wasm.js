// 🔴 NUCLEAR OPTION: Block ALL WebAssembly compilation attempts
// This runs BEFORE any other JavaScript and prevents WASM from loading

(function() {
  'use strict';
  
  console.log('🛡️ WebAssembly blocker active');
  
  // Store original WebAssembly
  const OriginalWebAssembly = window.WebAssembly;
  
  // Replace WebAssembly with a stub that blocks everything
  window.WebAssembly = {
    compile: function() {
      console.warn('🚫 Blocked WebAssembly.compile() - using mock Supabase instead');
      return Promise.reject(new Error('WebAssembly blocked - using mock client'));
    },
    compileStreaming: function() {
      console.warn('🚫 Blocked WebAssembly.compileStreaming() - using mock Supabase instead');
      return Promise.reject(new Error('WebAssembly blocked - using mock client'));
    },
    instantiate: function() {
      console.warn('🚫 Blocked WebAssembly.instantiate() - using mock Supabase instead');
      return Promise.reject(new Error('WebAssembly blocked - using mock client'));
    },
    instantiateStreaming: function() {
      console.warn('🚫 Blocked WebAssembly.instantiateStreaming() - using mock Supabase instead');
      return Promise.reject(new Error('WebAssembly blocked - using mock client'));
    },
    validate: function() {
      console.warn('🚫 Blocked WebAssembly.validate()');
      return false;
    },
    Module: function() {
      throw new Error('WebAssembly.Module blocked');
    },
    Instance: function() {
      throw new Error('WebAssembly.Instance blocked');
    },
    Memory: OriginalWebAssembly?.Memory || function() {},
    Table: OriginalWebAssembly?.Table || function() {},
    CompileError: Error,
    LinkError: Error,
    RuntimeError: Error
  };
  
  // Also block fetch requests for .wasm files
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    
    if (url.includes('.wasm')) {
      console.warn('🚫 Blocked fetch to .wasm file:', url);
      return Promise.reject(new Error('WASM file loading blocked'));
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ WebAssembly completely blocked - app will use mock Supabase');
})();
