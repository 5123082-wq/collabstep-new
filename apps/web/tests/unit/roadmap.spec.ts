import { getStageRangeFor, isStageDone } from '@/lib/roadmap';

describe('roadmap helpers', () => {
  it('returns stage ranges for known sections', () => {
    expect(getStageRangeFor('dashboard.widgets')).toBe('8–10');
    expect(getStageRangeFor('project.finance')).toBe('10');
    expect(getStageRangeFor('project.contractors')).toBe('11');
    expect(getStageRangeFor('global.search')).toBe('13');
  });

  it('detects completed stages', () => {
    expect(isStageDone(5)).toBe(true);
    expect(isStageDone(6)).toBe(false);
    expect(isStageDone(15)).toBe(false);
  });
});
