'use client';

import { FilterButton, ProjectsSectionFilters } from '../ProjectsSectionFilters';

export type ArchiveFilterType = 'all' | 'recent' | 'old' | 'restorable';

const ARCHIVE_FILTERS: { key: ArchiveFilterType; label: string }[] = [
  { key: 'all', label: 'Все проекты' },
  { key: 'recent', label: 'Недавно архивированные' },
  { key: 'old', label: 'Старые' },
  { key: 'restorable', label: 'Можно восстановить' }
];

type ArchiveFiltersProps = {
  value?: ArchiveFilterType;
  onChange?: (filter: ArchiveFilterType) => void;
};

export function ArchiveFilters({ value = 'all', onChange }: ArchiveFiltersProps) {
  const handleFilterChange = (filter: ArchiveFilterType) => {
    onChange?.(filter);
  };

  return (
    <ProjectsSectionFilters>
      {ARCHIVE_FILTERS.map((filter) => (
        <FilterButton
          key={filter.key}
          id={filter.key}
          label={filter.label}
          active={value === filter.key}
          onClick={() => handleFilterChange(filter.key)}
        />
      ))}
    </ProjectsSectionFilters>
  );
}

