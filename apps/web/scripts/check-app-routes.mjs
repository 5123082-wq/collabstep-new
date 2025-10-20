import fs from 'node:fs';
import path from 'node:path';

const root = 'apps/web/app';
const pages = [];

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
  console.error('Route collisions detected:');
  for (const [url, files] of conflicts) {
    console.error(`  ${url}\n    ${files.join('\n    ')}`);
  }
  process.exit(1);
}
