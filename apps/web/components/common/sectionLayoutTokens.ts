import type { CSSProperties } from 'react';

export const DEFAULT_SECTION_HEADER_MENU_TOKENS: CSSProperties = {
  '--section-header-menu-gap': 'clamp(0.25rem, 0.6vw, 0.75rem)',
  '--section-header-menu-font-size': 'clamp(0.75rem, 0.3vw + 0.72rem, 0.95rem)',
  '--section-header-menu-padding-inline': 'clamp(0.75rem, 1vw + 0.5rem, 1.25rem)',
  '--section-header-menu-padding-block': 'clamp(0.35rem, 0.25vw + 0.3rem, 0.65rem)',
  '--section-header-menu-letter-spacing': '0.01em',
  '--section-header-menu-letter-spacing-desktop': '0',
  '--section-header-menu-min-width': 'clamp(5.5rem, 30vw, 7.5rem)'
};

export const PROJECT_SECTION_LAYOUT_VARS: CSSProperties = {
  '--section-layout-stack-gap': 'clamp(1rem, 1.8vw, 1.75rem)',
  '--section-layout-gap': 'clamp(1rem, 1.8vw, 1.75rem)',
  '--section-layout-columns-mobile': 'minmax(0, 1fr)',
  '--section-layout-columns-desktop': 'minmax(0, 1.65fr) minmax(0, 1fr)'
};
