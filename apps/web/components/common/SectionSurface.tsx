import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ForwardedRef
} from 'react';
import { cn } from '@/lib/utils';

const BASE_SURFACE_CLASS =
  'section-surface border border-neutral-900/70 bg-neutral-950/80 shadow-sm backdrop-blur';

type SectionSurfaceProps<T extends ElementType> = {
  as?: T;
  padding?: 'none' | 'sm' | 'md';
  className?: string;
};

type PropsWithOmitted<T extends ElementType> = SectionSurfaceProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SectionSurfaceProps<T> | 'as'>;

const SectionSurface = forwardRef(<T extends ElementType = 'section'>(
  { as, padding = 'md', className, ...props }: PropsWithOmitted<T>,
  ref: ForwardedRef<Element>
) => {
  const Component = (as ?? 'section') as ElementType;

  const paddingClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'px-4 py-3'
        : 'px-6 py-5';

  return (
    <Component ref={ref} className={cn(BASE_SURFACE_CLASS, paddingClass, className)} {...props} />
  );
});

SectionSurface.displayName = 'SectionSurface';

export default SectionSurface;
