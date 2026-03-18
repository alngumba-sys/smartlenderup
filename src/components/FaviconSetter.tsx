import { useEffect } from 'react';
import faviconImage from 'figma:asset/0813012f521c08ee88f01b5dfe11314bead655db.png';

export function FaviconSetter() {
  useEffect(() => {
    // Set the favicon dynamically
    const setFavicon = () => {
      // Remove existing favicons
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      // Create new favicon link
      const link = document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = faviconImage;
      document.head.appendChild(link);

      // Also set apple-touch-icon
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = faviconImage;
      document.head.appendChild(appleTouchIcon);
    };

    setFavicon();
  }, []);

  return null; // This component doesn't render anything
}
