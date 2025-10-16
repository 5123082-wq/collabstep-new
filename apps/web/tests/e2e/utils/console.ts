import type { Page } from '@playwright/test';

const SUPPRESSED_PATTERNS = [
  'Failed to load resource: the server responded with a status of 404 (Not Found)',
  'No default component was found for a parallel route rendered on this page',
  'The above error occurred in the <NotFoundErrorBoundary> component'
];

export function captureConsole(page: Page, store: string[]): void {
  page.on('console', (message) => {
    if (message.type() !== 'error' && message.type() !== 'warning') {
      return;
    }

    const text = message.text();
    if (SUPPRESSED_PATTERNS.some((pattern) => text.includes(pattern))) {
      return;
    }

    store.push(`${message.type()}: ${text}`);
  });
}
