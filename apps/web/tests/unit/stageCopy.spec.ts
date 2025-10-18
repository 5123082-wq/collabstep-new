import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

describe('stage copy audit', () => {
  const projectRoot = path.join(__dirname, '..', '..');
  const targetDirectories = ['app', 'components', 'lib', 'styles']
    .map((segment) => path.join(projectRoot, segment))
    .filter((dir) => {
      try {
        return statSync(dir).isDirectory();
      } catch {
        return false;
      }
    });

  const ignoredDirectories = new Set(['node_modules', 'tests', '.next', '.git']);
  const allowedExtensions = new Set(['.ts', '.tsx', '.json', '.md', '.mjs', '.css']);
  const forbiddenPattern = /stage\s*3/i;

  function collectFiles(dir: string): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectFiles(fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (allowedExtensions.has(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  it('исключает упоминания Stage 3 из клиентского кода', () => {
    const files = targetDirectories.flatMap((dir) => collectFiles(dir));
    const offenders = files.filter((file) => forbiddenPattern.test(readFileSync(file, 'utf8')));

    expect(offenders).toEqual([]);
  });
});
