'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ForwardedRef,
  forwardRef
} from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

type Gap = 'sm' | 'md' | 'lg' | 'xl';
type Direction = 'row' | 'column';
type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'between';

type ResponsiveStackProps<T extends ElementType> = {
  as?: T;
  gap?: Gap;
  breakpoint?: string;
  desktopDirection?: Direction;
  mobileDirection?: Direction;
  align?: Align;
  justify?: Justify;
  desktopAlign?: Align;
  mobileAlign?: Align;
  desktopJustify?: Justify;
  mobileJustify?: Justify;
};

type PropsWithOmitted<T extends ElementType> = ResponsiveStackProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ResponsiveStackProps<T> | 'as'>;

const GAP_CLASS: Record<Gap, string> = {
  sm: 'layout-stack--gap-sm',
  md: 'layout-stack--gap-md',
  lg: 'layout-stack--gap-lg',
  xl: 'layout-stack--gap-xl'
};

const ALIGN_CLASS: Record<Align, string> = {
  start: 'layout-stack--align-start',
  center: 'layout-stack--align-center',
  end: 'layout-stack--align-end',
  stretch: 'layout-stack--align-stretch'
};

const JUSTIFY_CLASS: Record<Justify, string> = {
  start: 'layout-stack--justify-start',
  center: 'layout-stack--justify-center',
  between: 'layout-stack--justify-between'
};

const ResponsiveStack = forwardRef(<T extends ElementType = 'div'>(
  {
    as,
    gap = 'lg',
    breakpoint = '(min-width: 1280px)',
    desktopDirection = 'row',
    mobileDirection = 'column',
    align = 'stretch',
    justify = 'start',
    desktopAlign,
    mobileAlign,
    desktopJustify,
    mobileJustify,
    className,
    ...props
  }: PropsWithOmitted<T>,
  ref: ForwardedRef<Element>
) => {
  const Component = (as ?? 'div') as ElementType;
  const isDesktop = useMediaQuery(breakpoint);
  const orientationClass = isDesktop
    ? `layout-stack--desktop-${desktopDirection}`
    : `layout-stack--mobile-${mobileDirection}`;
  const resolvedAlign = isDesktop ? desktopAlign ?? align : mobileAlign ?? align;
  const resolvedJustify = isDesktop ? desktopJustify ?? justify : mobileJustify ?? justify;

  return (
    <Component
      ref={ref}
      data-layout-mode={isDesktop ? 'desktop' : 'mobile'}
      className={cn(
        'layout-stack',
        GAP_CLASS[gap],
        ALIGN_CLASS[resolvedAlign],
        JUSTIFY_CLASS[resolvedJustify],
        orientationClass,
        className
      )}
      {...props}
    />
  );
});

ResponsiveStack.displayName = 'ResponsiveStack';

export default ResponsiveStack;
