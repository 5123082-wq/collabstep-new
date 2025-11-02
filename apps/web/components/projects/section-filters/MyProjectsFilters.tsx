'use client';

import { FilterButton, ProjectsSectionFilters } from '../ProjectsSectionFilters';

export type MyProjectsFilterType = 'all' | 'active' | 'archived' | 'draft';

const MY_PROJECTS_FILTERS: { key: MyProjectsFilterType; label: string }[] = [
  { key: 'all', label: 'Все проекты' },
  { key: 'active', label: 'Активные' },
  { key: 'archived', label: 'Архивные' },
  { key: 'draft', label: 'Черновики' }
];

type MyProjectsFiltersProps = {
  value?: MyProjectsFilterType;
  onChange?: (filter: MyProjectsFilterType) => void;
};

export function MyProjectsFilters({ value = 'all', onChange }: MyProjectsFiltersProps) {
  const handleFilterChange = (filter: MyProjectsFilterType) => {
    onChange?.(filter);
  };

  return (
    <ProjectsSectionFilters>
      {MY_PROJECTS_FILTERS.map((filter) => (
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

