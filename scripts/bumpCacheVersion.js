const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const serviceWorkerPath = path.resolve(__dirname, '../public/service-worker.js');
let serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');

// Update CACHE_NAME
serviceWorkerContent = serviceWorkerContent.replace(
  /const CACHE_NAME = 'v[\d.]+?';/,
  `const CACHE_NAME = 'v${version}';`
);

// Update CACHE_ASSETS file versions (ensures it replaces only existing version numbers)
serviceWorkerContent = serviceWorkerContent.replace(
  /\/main\.js\?v=[\d.]+/,
  `/main.js?v=${version}`
);
serviceWorkerContent = serviceWorkerContent.replace(
  /\/styles\.css\?v=[\d.]+/,
  `/styles.css?v=${version}`
);


fs.writeFileSync(serviceWorkerPath, serviceWorkerContent, 'utf8');
console.log(`Updated service worker cache version to v${version} and CACHE_ASSETS paths.`);
