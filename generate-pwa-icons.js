const fs = require('fs');
const path = require('path');

// Create a simple canvas-based icon generator
function generatePWAIcons() {
  // Create a simple SVG-based icon content
  const iconSVG = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#FFD700"/>
      <rect x="64" y="64" width="384" height="384" rx="32" fill="#000000"/>
      <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#FFD700">B</text>
      <text x="256" y="380" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#FFD700">BIBLE</text>
    </svg>
  `;

  // Write the SVG file
  fs.writeFileSync('public/pwa-icon.svg', iconSVG);
  
  console.log('Generated PWA icon SVG file');
  console.log('To convert to PNG files, you can use online converters or tools like:');
  console.log('- https://convertio.co/svg-png/');
  console.log('- https://cloudconvert.com/svg-to-png');
  console.log('');
  console.log('Generate these files:');
  console.log('- 192x192 PNG → save as public/pwa-192x192.png');
  console.log('- 512x512 PNG → save as public/pwa-512x512.png');
  console.log('- 180x180 PNG → save as public/apple-touch-icon.png');
}

generatePWAIcons();
