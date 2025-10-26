'use client';

import { createContext, forwardRef, useContext } from 'react';
import { cn } from '@/lib/utils';

type FormLayout = 'vertical' | 'horizontal';

interface FormContextValue {
  layout: FormLayout;
}

const FormContext = createContext<FormContextValue>({ layout: 'vertical' });

function useFormContext() {
  return useContext(FormContext);
}

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { className, layout = 'vertical', children, ...props },
  ref
) {
  return (
    <FormContext.Provider value={{ layout }}>
      <form
        ref={ref}
        data-layout={layout}
        className={cn(
          'grid gap-6 rounded-3xl border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] p-6 shadow-[0_28px_64px_-40px_rgba(15,23,42,0.8)] transition-shadow duration-200 hover:shadow-[0_32px_76px_-36px_rgba(15,23,42,0.75)]',
          className
        )}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

export const FormField = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { layout } = useFormContext();

  return (
    <div
      className={cn(
        'space-y-2 rounded-2xl border border-transparent px-2 py-2 transition-colors duration-200 focus-within:border-[color:var(--accent-border)] focus-within:bg-[color:var(--surface-muted)]',
        layout === 'horizontal' && 'sm:grid sm:grid-cols-[minmax(160px,0.4fr)_1fr] sm:items-start sm:gap-4 sm:space-y-0',
        className
      )}
      {...props}
    />
  );
};

export const FormLabel = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(function FormLabel(
  { className, ...props },
  ref
) {
  const { layout } = useFormContext();

  return (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium text-[color:var(--text-secondary)]',
        layout === 'horizontal' && 'sm:col-start-1 sm:pt-1.5',
        className
      )}
      {...props}
    />
  );
});

export const FormControl = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function FormControl(
  { className, ...props },
  ref
) {
  const { layout } = useFormContext();

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 text-[color:var(--text-secondary)]',
        layout === 'horizontal' && 'sm:col-start-2',
        className
      )}
      {...props}
    />
  );
});

export const FormDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function FormDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn('text-sm leading-relaxed text-[color:var(--text-tertiary)]', className)}
      {...props}
    />
  );
});

export const FormMessage = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function FormMessage(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn('text-sm font-medium text-[rgba(248,113,113,0.95)]', className)}
      {...props}
    />
  );
});

export const FormActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-3 border-t border-[color:var(--surface-border-subtle)] pt-4 text-[color:var(--text-secondary)] sm:flex-row sm:justify-end sm:gap-4',
      className
    )}
    {...props}
  />
);
