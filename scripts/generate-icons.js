import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate Favicon SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-opacity="0.3" flood-color="#000000"/>
    </filter>
  </defs>

  <!-- Background rounded squircle -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />

  <!-- Wallet Body -->
  <g filter="url(#shadow)">
    <rect x="80" y="140" width="352" height="250" rx="36" fill="url(#walletGrad)" stroke="#334155" stroke-width="4"/>
    
    <!-- Wallet flap -->
    <path d="M 80 176 C 80 156, 96 140, 116 140 L 396 140 C 416 140, 432 156, 432 176 L 432 230 C 432 245, 420 256, 405 256 L 107 256 C 92 256, 80 245, 80 230 Z" fill="#334155" opacity="0.4"/>
    
    <!-- Banknote peaking out -->
    <rect x="130" y="105" width="252" height="70" rx="12" fill="#34d399" opacity="0.9" />
    <circle cx="256" cy="130" r="14" fill="#059669" opacity="0.6"/>

    <!-- Clasp pocket -->
    <rect x="310" y="225" width="130" height="80" rx="24" fill="#1e293b" stroke="#475569" stroke-width="4"/>
    
    <!-- Clasp coin button -->
    <circle cx="360" cy="265" r="22" fill="url(#coinGrad)" />
    <circle cx="360" cy="265" r="14" fill="#d97706" />
    <text x="360" y="272" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#ffffff" text-anchor="middle">D</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('Saved public/favicon.svg');

// 2. Generate PNG icons (192 and 512)
function createIconPng(size, filename) {
  const png = new PNG({ width: size, height: size });
  const scale = size / 512;
  const radius = 120 * scale;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      // Calculate squircle distance
      const cx = size / 2;
      const cy = size / 2;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const half = size / 2 - 8 * scale;
      
      // Rounded corner check
      let inSquircle = false;
      const cornerX = half - radius;
      const cornerY = half - radius;
      if (dx <= cornerX || dy <= cornerY) {
        inSquircle = dx <= half && dy <= half;
      } else {
        const distSq = (dx - cornerX) ** 2 + (dy - cornerY) ** 2;
        inSquircle = distSq <= radius ** 2;
      }

      if (inSquircle) {
        // Gradient from #10b981 (16, 185, 129) to #047857 (4, 120, 87)
        const t = (x + y) / (size * 2);
        let r = Math.round(16 * (1 - t) + 4 * t);
        let g = Math.round(185 * (1 - t) + 120 * t);
        let b = Math.round(129 * (1 - t) + 87 * t);

        // Wallet shape in center
        const wx1 = 80 * scale;
        const wx2 = 432 * scale;
        const wy1 = 140 * scale;
        const wy2 = 390 * scale;

        // Peak bill
        if (x >= 130 * scale && x <= 382 * scale && y >= 105 * scale && y < 150 * scale) {
          r = 52; g = 211; b = 153; // #34d399
        }

        // Wallet dark body
        if (x >= wx1 && x <= wx2 && y >= wy1 && y <= wy2) {
          r = 20; g = 30; b = 48; // #141e30

          // Wallet clasp circle
          const claspCx = 360 * scale;
          const claspCy = 265 * scale;
          const cDist = Math.hypot(x - claspCx, y - claspCy);
          if (cDist <= 22 * scale) {
            r = 245; g = 158; b = 11; // gold
            if (cDist <= 14 * scale) {
              r = 217; g = 119; b = 6;
            }
          } else if (x >= 310 * scale && x <= 430 * scale && y >= 225 * scale && y <= 305 * scale) {
            r = 30; g = 41; b = 59;
          }
        }

        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      } else {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }
    }
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(publicDir, filename), buffer);
  console.log(`Saved public/${filename} (${size}x${size})`);
}

createIconPng(192, 'pwa-192x192.png');
createIconPng(512, 'pwa-512x512.png');
createIconPng(180, 'apple-touch-icon.png');
