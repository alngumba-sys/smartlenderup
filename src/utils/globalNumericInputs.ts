/**
 * Global utility to enhance ALL numeric inputs across the platform
 * Automatically clears "0" on focus and restores it on blur if empty
 */

export function initializeGlobalNumericInputs() {
  // Add event listeners to all numeric inputs on the page
  const enhanceNumericInputs = () => {
    const numericInputs = document.querySelectorAll('input[type="number"]');
    
    numericInputs.forEach((input) => {
      const htmlInput = input as HTMLInputElement;
      
      // Skip if already enhanced (check for data attribute)
      if (htmlInput.dataset.numericEnhanced === 'true') {
        return;
      }
      
      // Mark as enhanced
      htmlInput.dataset.numericEnhanced = 'true';
      
      // Handle focus - clear "0" and select all
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        
        // Clear if value is "0" or "0.00"
        if (value === '0' || value === '0.00' || value === '0.0') {
          target.value = '';
        }
        
        // Select all text for easy replacement
        setTimeout(() => target.select(), 10);
      };
      
      // Handle blur - restore "0" if empty
      const handleBlur = (e: FocusEvent) => {
        const target = e.target as HTMLInputElement;
        
        // If field is empty, restore to "0"
        if (target.value === '' || target.value === null) {
          // Check if there's a min attribute
          const min = target.getAttribute('min');
          target.value = min || '0';
        }
      };
      
      // Add listeners
      htmlInput.addEventListener('focus', handleFocus);
      htmlInput.addEventListener('blur', handleBlur);
      
      // Store listeners for potential cleanup
      (htmlInput as any)._numericFocusHandler = handleFocus;
      (htmlInput as any)._numericBlurHandler = handleBlur;
    });
  };
  
  // Run immediately
  enhanceNumericInputs();
  
  // Re-run on DOM changes (for dynamically added inputs)
  const observer = new MutationObserver((mutations) => {
    let shouldRerun = false;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const element = node as Element;
          if (element.tagName === 'INPUT' || element.querySelector('input[type="number"]')) {
            shouldRerun = true;
          }
        }
      });
    });
    
    if (shouldRerun) {
      enhanceNumericInputs();
    }
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => {
    observer.disconnect();
  };
}

/**
 * React hook version - call this in your App component
 */
export function useGlobalNumericInputs() {
  if (typeof window === 'undefined') return;
  
  // Initialize on mount
  React.useEffect(() => {
    const cleanup = initializeGlobalNumericInputs();
    return cleanup;
  }, []);
}

// For non-React usage
declare global {
  interface Window {
    initNumericInputs?: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.initNumericInputs = initializeGlobalNumericInputs;
}
