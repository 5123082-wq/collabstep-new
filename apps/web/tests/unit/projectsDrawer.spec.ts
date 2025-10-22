import { createEscapeKeyHandler, formatDrawerSubtitle, getDrawerTitle } from '@/stores/projectsDrawer';

describe('Projects drawer helpers', () => {
  it('возвращает корректные заголовки по типу сущности', () => {
    expect(getDrawerTitle(null)).toBe('Карточка');
    expect(getDrawerTitle('project')).toBe('Карточка проекта');
    expect(getDrawerTitle('template')).toBe('Карточка шаблона');
    expect(getDrawerTitle('workspace')).toBe('Карточка рабочего пространства');
    expect(getDrawerTitle('custom')).toBe('Карточка проекта');
  });

  it('форматирует подзаголовок с идентификатором и режимом', () => {
    expect(formatDrawerSubtitle(null, null)).toBeNull();
    expect(formatDrawerSubtitle('PRJ-1', null)).toBe('PRJ-1');
    expect(formatDrawerSubtitle(null, 'preview')).toBe('Режим: preview');
    expect(formatDrawerSubtitle('PRJ-2', 'edit')).toBe('PRJ-2 · режим: edit');
  });

  it('закрывает drawer по Escape и предотвращает bubbling', () => {
    const close = jest.fn();
    const handler = createEscapeKeyHandler(close);
    const preventDefault = jest.fn();

    handler({ key: 'Escape', preventDefault } as unknown as KeyboardEvent);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);

    handler({ key: 'Enter', preventDefault } as unknown as KeyboardEvent);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
