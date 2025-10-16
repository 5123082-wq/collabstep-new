import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { globby } from 'globby';

const requiredFiles = [
  'apps/web/app/(marketing)/page.tsx',
  'apps/web/app/(app)/layout.tsx',
  'apps/web/app/(project)/project/[id]/layout.tsx'
];

const missingFiles = requiredFiles.filter((file) => !existsSync(resolve(process.cwd(), file)));

if (missingFiles.length > 0) {
  console.error('Missing required route files:\n' + missingFiles.map((file) => ` - ${file}`).join('\n'));
  process.exit(1);
}

const routeFiles = await globby(['apps/web/app/**/page.tsx', 'apps/web/app/**/layout.tsx']);

if (routeFiles.length === 0) {
  console.error('Route verification failed: no route files found under apps/web/app');
  process.exit(1);
}

console.log('Route verification succeeded. Checked %d route entries.', routeFiles.length);
