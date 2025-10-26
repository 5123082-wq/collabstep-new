import { DEFAULT_SECTION_HEADER_MENU_TOKENS, PROJECT_SECTION_LAYOUT_VARS } from '@/components/common/sectionLayoutTokens';

describe('section layout design tokens', () => {
  it('использует clamp для адаптивного меню раздела', () => {
    expect(DEFAULT_SECTION_HEADER_MENU_TOKENS['--section-header-menu-font-size']).toContain('clamp');
    expect(DEFAULT_SECTION_HEADER_MENU_TOKENS['--section-header-menu-padding-inline']).toContain('clamp');
    expect(DEFAULT_SECTION_HEADER_MENU_TOKENS['--section-header-menu-padding-block']).toContain('clamp');
  });

  it('задает мобильный и десктопный шаблон сетки для проектов', () => {
    expect(PROJECT_SECTION_LAYOUT_VARS['--section-layout-columns-mobile']).toBe('minmax(0, 1fr)');
    expect(PROJECT_SECTION_LAYOUT_VARS['--section-layout-columns-desktop']).toBe(
      'minmax(0, 1.65fr) minmax(0, 1fr)'
    );
  });
});
