import fs from 'node:fs';
import path from 'node:path';

describe('Projects layout responsive styles', () => {
  const layoutCss = fs.readFileSync(
    path.resolve(__dirname, '../../styles/layout.css'),
    'utf8'
  );

  it('обеспечивает однострочное меню в топбаре с помощью clamp', () => {
    const navMatch = layoutCss.match(/\.projects-topbar__nav\s*\{[^}]+\}/);
    expect(navMatch).toBeTruthy();
    expect(navMatch?.[0]).toContain('flex-wrap: nowrap');

    const linkMatch = layoutCss.match(/\.projects-topbar__link\s*\{[^}]+\}/);
    expect(linkMatch).toBeTruthy();
    expect(linkMatch?.[0]).toMatch(/font-size:\s*clamp/);
    expect(linkMatch?.[0]).toMatch(/padding-inline:\s*clamp/);
    expect(linkMatch?.[0]).toMatch(/white-space:\s*nowrap/);
  });

  it('задает адаптивную сетку для каталога проектов', () => {
    const baseGrid = layoutCss.match(/\.projects-layout-grid\s*\{[^}]+\}/);
    expect(baseGrid).toBeTruthy();
    expect(baseGrid?.[0]).toContain('display: grid');

    const gridMedia = layoutCss.match(
      /@media\s*\(min-width:\s*1280px\)[\s\S]*?\.projects-layout-grid\s*\{[\s\S]*?grid-template-columns[\s\S]*?\}/
    );
    expect(gridMedia).toBeTruthy();
  });

  it('содержит адаптивные правила для фильтров проекта', () => {
    const filtersBase = layoutCss.match(/\.projects-filters\s*\{[^}]+\}/);
    expect(filtersBase).toBeTruthy();
    expect(filtersBase?.[0]).toContain('display: grid');

    const filtersMedia = layoutCss.match(
      /@media\s*\(min-width:\s*640px\)[\s\S]*?\.projects-filters\s*\{[\s\S]*?grid-template-columns[\s\S]*?\}/
    );
    expect(filtersMedia).toBeTruthy();
  });

  it('делает общий shell адаптивным между мобильным и десктопом', () => {
    const shellBody = layoutCss.match(/\.dashboard-shell__body\s*\{[^}]+\}/);
    expect(shellBody).toBeTruthy();
    expect(shellBody?.[0]).toContain('flex-direction: column');

    const shellMedia = layoutCss.match(
      /@media\s*\(min-width:\s*1280px\)[\s\S]*?\.dashboard-shell__body\s*\{[\s\S]*?flex-direction:\s*row[\s\S]*?\}/
    );
    expect(shellMedia).toBeTruthy();
  });
});
