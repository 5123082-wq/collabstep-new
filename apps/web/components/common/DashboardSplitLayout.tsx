import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DASHBOARD_SHELL_CLASSNAMES } from './layoutPresets';

type DashboardSplitLayoutProps = {
  topbar?: ReactNode;
  main: ReactNode;
  mainProps?: ComponentProps<'main'>;
  aside?: ReactNode;
  asideProps?: ComponentProps<'aside'>;
  footer?: ReactNode;
  className?: string;
};

export default function DashboardSplitLayout({
  topbar,
  main,
  mainProps,
  aside,
  asideProps,
  footer,
  className
}: DashboardSplitLayoutProps) {
  return (
    <div className={cn(DASHBOARD_SHELL_CLASSNAMES.root, className)}>
      {topbar}
      <div className={DASHBOARD_SHELL_CLASSNAMES.body}>
        <main
          {...mainProps}
          className={cn(DASHBOARD_SHELL_CLASSNAMES.main, mainProps?.className)}
        >
          {main}
        </main>
        {aside ? (
          <aside
            {...asideProps}
            className={cn(DASHBOARD_SHELL_CLASSNAMES.aside, asideProps?.className)}
          >
            {aside}
          </aside>
        ) : null}
      </div>
      {footer}
    </div>
  );
}
