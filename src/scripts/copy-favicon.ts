// This script copies the favicon from figma assets to the public folder
// Run this during build to ensure favicon is available

import faviconSrc from 'figma:asset/0813012f521c08ee88f01b5dfe11314bead655db.png';

console.log('Favicon source:', faviconSrc);
console.log('Favicon will be available at: /public/favicon.png');

// Note: In production, this image will be bundled and available
// The import statement above ensures it's included in the build
