import { act } from 'react';
import { useUiStore } from '@/lib/state/ui-store';

describe('ui-store', () => {
  beforeEach(() => {
    useUiStore.setState({ bgPreset: 'mesh', expandedGroups: [], lastProjectId: null });
  });

  it('переключает фон и сохраняет состояние', () => {
    act(() => {
      useUiStore.getState().setBgPreset('grid');
    });

    expect(useUiStore.getState().bgPreset).toBe('grid');
  });

  it('переключает раскрытые группы меню', () => {
    act(() => {
      useUiStore.getState().toggleGroup('projects');
    });

    expect(useUiStore.getState().expandedGroups).toContain('projects');
  });

  it('сохраняет идентификатор последнего проекта', () => {
    act(() => {
      useUiStore.getState().setLastProjectId('proj-1');
    });

    expect(useUiStore.getState().lastProjectId).toBe('proj-1');
  });
});
