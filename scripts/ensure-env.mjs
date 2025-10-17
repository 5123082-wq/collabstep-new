import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
  } else {
    fs.writeFileSync(envPath, '', 'utf8');
  }
}

const requiredVars = new Map([
  ['NAV_V1', 'on'],
  ['APP_LOCALE', 'ru'],
  ['AUTH_DEV', 'on'],
  ['DEMO_ADMIN_EMAIL', 'admin.demo@collabverse.test'],
  ['DEMO_ADMIN_PASSWORD', 'demo-admin'],
  ['DEMO_USER_EMAIL', 'user.demo@collabverse.test'],
  ['DEMO_USER_PASSWORD', 'demo-user']
]);

const raw = fs.readFileSync(envPath, 'utf8');
const lines = raw.split(/\r?\n/);
const seen = new Set();

const updated = lines.map((line) => {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!match) {
    return line;
  }

  const key = match[1];
  if (!requiredVars.has(key)) {
    return `${key}=${match[2].trim()}`;
  }

  seen.add(key);
  return `${key}=${requiredVars.get(key)}${''}`;
});

for (const [key, value] of requiredVars.entries()) {
  if (!seen.has(key) && !updated.some((line) => line.startsWith(`${key}=`))) {
    updated.push(`${key}=${value}`);
  }
}

const normalized = updated
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/\s+$/, '');

fs.writeFileSync(envPath, normalized.endsWith('\n') ? normalized : `${normalized}\n`, 'utf8');
