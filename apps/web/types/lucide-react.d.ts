declare module 'lucide-react' {
  import type { SVGProps } from 'react';

  export type LucideIcon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

  export const Bell: LucideIcon;
  export const ListTodo: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const UserPlus: LucideIcon;
  export const LayoutGrid: LucideIcon;
  export const LayoutList: LucideIcon;
  export const Loader2: LucideIcon;
  export const RefreshCw: LucideIcon;
}
