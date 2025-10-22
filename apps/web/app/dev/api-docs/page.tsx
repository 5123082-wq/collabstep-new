import { notFound } from 'next/navigation';
import { SwaggerViewer } from './SwaggerViewer';

export const dynamic = 'force-dynamic';

export default function ApiDocsPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Finance API</h1>
        <p className="text-sm text-muted-foreground">
          Swagger UI доступен только в dev-режиме. Документ описывает операции расходов и бюджетов.
        </p>
      </div>
      <SwaggerViewer />
    </div>
  );
}
