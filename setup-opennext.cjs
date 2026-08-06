const fs = require('fs');
fs.writeFileSync('open-next.config.ts', `import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();`);
fs.writeFileSync('wrangler.jsonc', JSON.stringify({
  name: 'kalki-mirror',
  main: '.open-next/worker.js',
  compatibility_date: '2024-09-23',
  compatibility_flags: ['nodejs_compat'],
  assets: { directory: '.open-next/assets', binding: 'ASSETS' }
}, null, 2));
