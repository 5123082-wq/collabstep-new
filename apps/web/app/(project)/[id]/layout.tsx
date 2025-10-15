import type { ReactNode } from 'react';

type ProjectLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  return (
    <section className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-2">Проект {params.id} — оболочка (заглушка)</h2>
      {children}
    </section>
  );
}
