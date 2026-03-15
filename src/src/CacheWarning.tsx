import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function CacheWarning() {
  const [show, setShow] = useState(false);
  const [isIncognito, setIsIncognito] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect if browser is in incognito mode
    async function detectIncognito() {
      try {
        // Try to detect incognito mode
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const { quota } = await navigator.storage.estimate();
          // Incognito mode usually has very low quota
          const isPrivate = quota && quota < 120000000; // Less than 120MB usually means incognito
          setIsIncognito(isPrivate || false);
          
          // Check if page was loaded before (potential cache issue)
          const wasLoadedBefore = sessionStorage.getItem('app_loaded_before');
          
          if (!isPrivate && wasLoadedBefore) {
            // Not in incognito AND was loaded before = might have cache issues
            setShow(true);
          }
          
          sessionStorage.setItem('app_loaded_before', 'true');
        }
      } catch (err) {
        console.log('Could not detect incognito mode');
      }
    }

    detectIncognito();

    // Show warning after 2 seconds if not in incognito
    const timer = setTimeout(() => {
      if (isIncognito === false) {
        setShow(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isIncognito]);

  if (!show || isIncognito === true) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FEF3C7',
        borderBottom: '3px solid #F59E0B',
        padding: '16px 20px',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideDown 0.5s ease-out'
      }}
    >
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '16px', 
            marginBottom: '6px',
            color: '#92400E'
          }}>
            ⚠️ Browser Cache Detected
          </div>
          <div style={{ 
            fontSize: '14px',
            color: '#78350F',
            lineHeight: '1.5'
          }}>
            If you see any errors, use <strong>Incognito mode</strong> (Ctrl+Shift+N) to load fresh files.
            {' '}
            <button 
              onClick={() => {
                if (confirm('This will open instructions in a new tab. Click OK to continue.')) {
                  const instructions = `
═══════════════════════════════════════════════════════
                    FIX ANY ERRORS
═══════════════════════════════════════════════════════

1. Press Ctrl+Shift+N (or Cmd+Shift+N on Mac)
2. Go to: http://localhost:5173
3. ✅ All errors will be gone!

Why? Incognito mode has zero browser cache, 
so it loads fresh JavaScript files.
═══════════════════════════════════════════════════════
                  `;
                  alert(instructions);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#92400E',
                textDecoration: 'underline',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit'
              }}
            >
              Click for instructions
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setShow(false)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <X size={20} />
        </button>
      </div>
      
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}