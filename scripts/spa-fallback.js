const fs = require('fs');
const path = require('path');

const browserDir = path.join(__dirname, '..', 'dist', 'gpoc', 'browser');
const indexHtml = path.join(browserDir, 'index.html');
const notFoundHtml = path.join(browserDir, '404.html');

if (!fs.existsSync(indexHtml)) {
  console.error(`Missing ${indexHtml}. Run the production build first.`);
  process.exit(1);
}

fs.copyFileSync(indexHtml, notFoundHtml);
console.log('Created 404.html SPA fallback for GitHub Pages.');
