import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <section className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-2">Приложение — оболочка (заглушка)</h2>
      {children}
    </section>
  );
}
