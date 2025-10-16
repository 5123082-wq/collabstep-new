import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const serverAppDir = path.resolve('.next/server/app');
const sourceManifest = path.join(serverAppDir, 'page_client-reference-manifest.js');
const marketingDir = path.join(serverAppDir, '(marketing)');
const marketingManifest = path.join(marketingDir, 'page_client-reference-manifest.js');

if (!existsSync(sourceManifest)) {
  console.warn('[fix-manifests] Базовый манифест не найден, пропуск.');
  process.exit(0);
}

if (!existsSync(marketingDir)) {
  console.warn('[fix-manifests] Каталог (marketing) отсутствует, пропуск.');
  process.exit(0);
}

if (!existsSync(marketingManifest)) {
  mkdirSync(marketingDir, { recursive: true });
  copyFileSync(sourceManifest, marketingManifest);
  console.log('[fix-manifests] Скопирован page_client-reference-manifest.js для сегмента (marketing).');
} else {
  console.log('[fix-manifests] Манифест для (marketing) уже существует.');
}
