'use client';

import { FilterButton, ProjectsSectionFilters } from '../ProjectsSectionFilters';

export type TemplateFilterType = 'all' | 'free' | 'paid' | 'premium';

const TEMPLATES_FILTERS: { key: TemplateFilterType; label: string }[] = [
  { key: 'all', label: 'Все шаблоны' },
  { key: 'free', label: 'Бесплатные' },
  { key: 'paid', label: 'Платные' },
  { key: 'premium', label: 'Премиум' }
];

type TemplatesFiltersProps = {
  value?: TemplateFilterType;
  onChange?: (filter: TemplateFilterType) => void;
};

export function TemplatesFilters({ value = 'all', onChange }: TemplatesFiltersProps) {
  const handleFilterChange = (filter: TemplateFilterType) => {
    onChange?.(filter);
  };

  return (
    <ProjectsSectionFilters>
      {TEMPLATES_FILTERS.map((filter) => (
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

