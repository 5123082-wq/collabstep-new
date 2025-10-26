import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type SectionPageLayoutProps = {
  header: ReactNode;
  filters?: ReactNode;
  main: ReactNode;
  secondary?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function SectionPageLayout({
  header,
  filters,
  main,
  secondary,
  className,
  style
}: SectionPageLayoutProps) {
  return (
    <section className={cn('section-page-layout', className)} style={style}>
      {header}
      {filters ? <div className="section-page-layout__filters">{filters}</div> : null}
      <div className="section-page-layout__content">
        <div className="section-page-layout__primary">{main}</div>
        {secondary ? <div className="section-page-layout__secondary">{secondary}</div> : null}
      </div>
    </section>
  );
}
