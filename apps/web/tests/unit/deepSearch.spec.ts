import { search, type SearchItem } from '@/lib/search/deepSearch';

describe('deepSearch', () => {
  const dataset: SearchItem[] = [
    { type: 'project', title: 'Demo', ref: 'proj-1', subtitle: 'Активный' },
    { type: 'task', title: 'Сверстать лендинг', ref: 'task-12', tags: ['proj-1'] },
    { type: 'invoice', title: 'Счёт 12', ref: 'inv-12', subtitle: '120 000 ₽' },
    { type: 'user', title: 'demo@collabverse.ru', ref: 'user-1', subtitle: 'Лид' }
  ];

  it('возвращает задачи по маске #', () => {
    const result = search('#лен', dataset);
    expect(result.every((item) => item.item.type === 'task')).toBe(true);
  });

  it('возвращает проекты и людей по маске @', () => {
    const result = search('@demo', dataset);
    expect(result.every((item) => item.item.type === 'project' || item.item.type === 'user')).toBe(true);
  });

  it('возвращает счета по маске $', () => {
    const result = search('$12', dataset);
    expect(result.every((item) => item.item.type === 'invoice')).toBe(true);
  });

  it('возвращает элементы без маски', () => {
    const result = search('Demo', dataset);
    expect(result.length).toBeGreaterThan(0);
  });

  it('фильтрует результаты по projectId', () => {
    const scopedDataset: SearchItem[] = [
      { type: 'task', title: 'Задача А', ref: 'task-a', projectId: 'proj-a' },
      { type: 'task', title: 'Задача Б', ref: 'task-b', projectId: 'proj-b' }
    ];

    const result = search('Задача', scopedDataset, { projectId: 'proj-a' });
    expect(result).toHaveLength(1);
    expect(result[0].item.ref).toBe('task-a');
  });
});
