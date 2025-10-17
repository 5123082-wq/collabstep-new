import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('stage references guard', () => {
  it('contains no Stage 3 markers in tracked files', () => {
    const repoRoot = path.resolve(__dirname, '../../../..');
    const output = execSync('git ls-files', { cwd: repoRoot }).toString();
    const files = output.split('\n').filter(Boolean);

    const textExtensions = new Set([
      '.ts',
      '.tsx',
      '.js',
      '.cjs',
      '.mjs',
      '.json',
      '.md',
      '.yml',
      '.yaml',
      '.css',
      '.scss',
      '.txt',
      '.html'
    ]);

    const offenders = files.filter((filePath) => {
      const ext = path.extname(filePath);
      if (ext && !textExtensions.has(ext)) {
        return false;
      }
      const content = readFileSync(path.join(repoRoot, filePath), 'utf8');
      return content.includes('Stage 3') || content.includes('Stage3');
    });

    expect(offenders).toEqual([]);
  });
});
