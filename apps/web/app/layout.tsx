import '@/styles/globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ConsoleFilter from '@/components/util/ConsoleFilter';

export const metadata: Metadata = {
  title: 'Collabverse',
  description: 'Платформа совместной работы. Этап 0.'
};

const themeInitializer = `(() => {
  try {
    const storage = window.localStorage.getItem('cv-ui');
    let preference = 'system';
    if (storage) {
      const parsed = JSON.parse(storage);
      const stored = parsed?.state?.theme;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        preference = stored;
      }
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const resolved = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    if (document.body) {
      document.body.dataset.theme = resolved;
    } else {
      window.addEventListener(
        'DOMContentLoaded',
        () => {
          if (document.body) {
            document.body.dataset.theme = resolved;
          }
        },
        { once: true }
      );
    }
  } catch (error) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const fallback = media.matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = fallback;
    document.documentElement.style.colorScheme = fallback;
    window.addEventListener(
      'DOMContentLoaded',
      () => {
        if (document.body) {
          document.body.dataset.theme = fallback;
        }
      },
      { once: true }
    );
  }
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body data-theme="light" suppressHydrationWarning>
        <ConsoleFilter />
        {children}
      </body>
    </html>
  );
}
