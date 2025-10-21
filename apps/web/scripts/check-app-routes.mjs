import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'app');
const pages = [];
const strict = process.env.CHECK_ROUTES_STRICT === '1';

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      walk(p);
    } else if (/^page\.tsx?$/.test(f.name)) {
      const url = p.replace(root, '').replace(/\/\([^)]*\)/g, '').replace(/\/page\.tsx?$/, '') || '/';
      pages.push({ file: p, url });
    }
  }
}

walk(root);

const map = new Map();
for (const p of pages) {
  const arr = map.get(p.url) ?? [];
  arr.push(p.file);
  map.set(p.url, arr);
}

const conflicts = [...map.entries()].filter(([, files]) => files.length > 1);

if (conflicts.length) {
  const msg = conflicts.map(([url, files]) => `  ${url}\n    ${files.join('\n    ')}`).join('\n');
  const tag = strict ? 'ERROR' : 'WARNING';
  (strict ? console.error : console.warn)(`[check-app-routes] ${tag}\n${msg}`);
  process.exit(strict ? 1 : 0);
}

console.log('[check-app-routes] OK — no collisions');
