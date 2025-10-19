import Link from 'next/link';

export type Breadcrumb = {
  label: string;
  href?: string;
};

export default function MarketBreadcrumbs({ items }: { items: Breadcrumb[] }) {
  if (!items.length) return null;

  return (
    <nav className="flex flex-wrap items-center gap-x-2 text-sm text-neutral-400" aria-label="Хлебные крошки">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-neutral-100">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-neutral-200' : undefined}>{item.label}</span>
            )}
            {!isLast ? <span className="text-neutral-600">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
