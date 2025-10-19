'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { MarketNavSection } from '@/lib/marketplace/navigation';
import { MARKET_NAVIGATION } from '@/lib/marketplace/navigation';

type MarketNavItemProps = {
  href: string;
  title: string;
  isActive: boolean;
  badge?: string | undefined;
};

function MarketNavItem({ href, title, isActive, badge }: MarketNavItemProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition',
        isActive
          ? 'bg-indigo-500/10 text-indigo-300'
          : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100'
      )}
    >
      <span>{title}</span>
      {badge ? (
        <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-indigo-200">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function MarketSidebar({ sections = MARKET_NAVIGATION }: { sections?: MarketNavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {sections.map((section, index) => {
        if (section.type === 'separator') {
          return <hr key={`separator-${index}`} className="border-neutral-800/80" />;
        }

        return (
          <div key={section.title} className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <MarketNavItem
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  badge={item.badge ?? undefined}
                  isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
