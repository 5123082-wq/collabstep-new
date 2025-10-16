import type { Page } from '@playwright/test';

export const captureConsoleMessages = (page: Page, storage: string[]) => {
  page.on('console', (message) => {
    if (!['error', 'warning'].includes(message.type())) {
      return;
    }

    const text = message.text();
    const ignoredPatterns = [
      'Failed to load resource: the server responded with a status of 404 (Not Found)',
      'No default component was found for a parallel route rendered on this page.'
    ];

    if (ignoredPatterns.some((pattern) => text.includes(pattern))) {
      return;
    }

    storage.push(text);
  });
};
