const fs = require('fs');
const { createCanvas } = require('canvas');

function drawIcon(canvas, size) {
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    
    // Bible book
    const bookWidth = size * 0.65;
    const bookHeight = size * 0.55;
    const bookX = (size - bookWidth) / 2;
    const bookY = (size - bookHeight) / 2;
    
    // Book cover
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(bookX, bookY, bookWidth, bookHeight);
    
    // Book pages
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(bookX + size * 0.02, bookY + size * 0.02, bookWidth - size * 0.04, bookHeight - size * 0.04);
    
    // Golden cross
    ctx.fillStyle = '#FFD700';
    const crossSize = size * 0.2;
    const crossX = size / 2 - crossSize / 6;
    const crossY = size / 2 - crossSize / 2;
    
    // Vertical bar
    ctx.fillRect(crossX, crossY, crossSize / 3, crossSize);
    // Horizontal bar
    ctx.fillRect(crossX - crossSize / 6, crossY + crossSize / 3, crossSize * 0.65, crossSize / 3);
    
    // Text
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${size * 0.08}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BIBLE', size / 2, bookY + bookHeight + size * 0.08);
}

// Create icons
const iconSizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 }
];

try {
    iconSizes.forEach(icon => {
        const canvas = createCanvas(icon.size, icon.size);
        drawIcon(canvas, icon.size);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`public/${icon.name}`, buffer);
        console.log(`Created: ${icon.name} (${buffer.length} bytes)`);
    });
    
    console.log('Icon generation complete!');
} catch (error) {
    console.log('Canvas library not available. Using fallback method...');
    
    // Fallback: Create a simple colored square PNG manually
    iconSizes.forEach(icon => {
        // Create a minimal valid PNG - this is a 1x1 black pixel PNG
        const minimalPNG = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
            0x49, 0x48, 0x44, 0x52, // IHDR
            0x00, 0x00, 0x00, 0x01, // width: 1
            0x00, 0x00, 0x00, 0x01, // height: 1
            0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
            0x90, 0x77, 0x53, 0xDE, // CRC
            0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
            0x49, 0x44, 0x41, 0x54, // IDAT
            0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // image data
            0xE2, 0x21, 0xBC, 0x33, // CRC
            0x00, 0x00, 0x00, 0x00, // IEND chunk size
            0x49, 0x45, 0x4E, 0x44, // IEND
            0xAE, 0x42, 0x60, 0x82  // CRC
        ]);
        
        fs.writeFileSync(`public/${icon.name}`, minimalPNG);
        console.log(`Created minimal PNG: ${icon.name}`);
    });
}
