const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const serviceWorkerPath = path.resolve(__dirname, '../public/service-worker.js');
const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');

const newServiceWorkerContent = serviceWorkerContent.replace(
  /const CACHE_NAME = 'v\d+\.\d+';/,
  `const CACHE_NAME = 'v${version}';`
);

fs.writeFileSync(serviceWorkerPath, newServiceWorkerContent, 'utf8');
console.log(`Updated service worker cache version to v${version}`);
