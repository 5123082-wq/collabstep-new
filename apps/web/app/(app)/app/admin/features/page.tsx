'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ToggleLeft, ToggleRight, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/lib/ui/toast';
import clsx from 'clsx';
import { featureFlagRegistry, type FeatureFlagKey } from '../../../../../config/feature-flags';

type FeatureCategory = 'all' | 'platform' | 'section' | 'subsection';
type FeatureStatus = 'all' | 'enabled' | 'disabled';

interface FeatureItem {
  id: string;
  key: FeatureFlagKey;
  label: string;
  description: string;
  category: string;
  parentId?: string;
  enabled: boolean;
  children?: FeatureItem[];
}

const mockFeatures: FeatureItem[] = [
  {
    id: 'marketing',
    key: 'projectsCore',
    label: 'Маркетинг',
    description: 'Полный раздел маркетинга',
    category: 'platform',
    enabled: true
  },
  {
    id: 'marketing-campaigns',
    key: 'projectsOverview',
    label: 'Кампании и реклама',
    description: 'Управление рекламными кампаниями',
    category: 'section',
    parentId: 'marketing',
    enabled: true
  },
  {
    id: 'marketing-research',
    key: 'projectCreateWizard',
    label: 'Исследования',
    description: 'Маркетинговые исследования',
    category: 'subsection',
    parentId: 'marketing',
    enabled: false
  },
  {
    id: 'documents',
    key: 'projectDashboard',
    label: 'Документы',
    description: 'Раздел документов и файлов',
    category: 'platform',
    enabled: true
  },
  {
    id: 'finance',
    key: 'budgetLimits',
    label: 'Финансы',
    description: 'Финансовый модуль',
    category: 'platform',
    enabled: true
  },
  {
    id: 'tasks',
    key: 'tasksWorkspace',
    label: 'Задачи',
    description: 'Рабочее пространство задач',
    category: 'section',
    enabled: false
  }
];

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<FeatureItem[]>(mockFeatures);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FeatureCategory>('all');
  const [statusFilter, setStatusFilter] = useState<FeatureStatus>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['marketing']));

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          toast(
            `Фича "${f.label}" ${f.enabled ? 'отключена' : 'включена'}`,
            f.enabled ? 'info' : 'success'
          );
          return { ...f, enabled: !f.enabled };
        }
        return f;
      })
    );
  };

  const toggleExpand = (featureId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const filteredFeatures = features.filter((f) => {
    if (!f.parentId && categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (statusFilter === 'enabled' && !f.enabled) return false;
    if (statusFilter === 'disabled' && f.enabled) return false;
    if (searchQuery && !f.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const topLevelFeatures = filteredFeatures.filter((f) => !f.parentId);
  const childFeatures = filteredFeatures.filter((f) => f.parentId);

  const getChildren = (parentId: string) => childFeatures.filter((f) => f.parentId === parentId);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-50">Управление Фичами</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Включение и отключение разделов платформы. Изменения применяются глобально для всех пользователей.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast('TODO: Импорт конфигурации', 'info')}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-blue-500/40 hover:bg-blue-500/10"
            >
              Импорт
            </button>
            <button
              onClick={() => {
                const config = JSON.stringify(features, null, 2);
                navigator.clipboard.writeText(config);
                toast('Конфигурация скопирована в буфер', 'success');
              }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-green-500/40 hover:bg-green-500/10"
            >
              Экспорт
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск фичей..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-500 transition focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as FeatureCategory)}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100 transition focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Все категории</option>
              <option value="platform">Платформа</option>
              <option value="section">Разделы</option>
              <option value="subsection">Подразделы</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FeatureStatus)}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100 transition focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Все статусы</option>
              <option value="enabled">Включено</option>
              <option value="disabled">Отключено</option>
            </select>
          </div>
        </div>
      </div>

      {/* Features Tree */}
      <div className="space-y-2">
        {topLevelFeatures.map((feature) => {
          const hasChildren = getChildren(feature.id).length > 0;
          const isExpanded = expandedIds.has(feature.id);
          const allChildrenEnabled = getChildren(feature.id).every((c) => c.enabled);
          const someChildrenEnabled = getChildren(feature.id).some((c) => c.enabled);

          return (
            <div
              key={feature.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-950/60 transition hover:border-indigo-500/40"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(feature.id)}
                      className="rounded p-1 transition hover:bg-neutral-900"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-neutral-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-neutral-500" />
                      )}
                    </button>
                  )}
                  {!hasChildren && <div className="w-6" />}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-50">{feature.label}</h3>
                      <span
                        className={clsx(
                          'rounded px-2 py-0.5 text-xs font-medium',
                          feature.category === 'platform'
                            ? 'bg-blue-500/20 text-blue-100'
                            : feature.category === 'section'
                            ? 'bg-green-500/20 text-green-100'
                            : 'bg-purple-500/20 text-purple-100'
                        )}
                      >
                        {feature.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-400">{feature.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasChildren && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      {isExpanded && (
                        <span>
                          {someChildrenEnabled && !allChildrenEnabled
                            ? 'Частично'
                            : allChildrenEnabled
                            ? 'Все вкл.'
                            : 'Все выкл.'}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className={clsx(
                      'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition',
                      feature.enabled
                        ? 'border-green-500/40 bg-green-500/10 text-green-100 hover:bg-green-500/20'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-indigo-500/40 hover:bg-indigo-500/10'
                    )}
                  >
                    {feature.enabled ? (
                      <>
                        <ToggleRight className="h-5 w-5" />
                        Включено
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5" />
                        Отключено
                      </>
                    )}
                  </button>

                  <button className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2 text-neutral-500 transition hover:border-indigo-500/40 hover:bg-indigo-500/10">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              {isExpanded && hasChildren && (
                <div className="border-t border-neutral-800 bg-neutral-950/80">
                  {getChildren(feature.id).map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between border-b border-neutral-800 p-4 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 ml-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-neutral-50">{child.label}</h4>
                            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-100">
                              {child.category}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-neutral-400">{child.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFeature(child.id)}
                          className={clsx(
                            'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition',
                            child.enabled
                              ? 'border-green-500/40 bg-green-500/10 text-green-100 hover:bg-green-500/20'
                              : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-indigo-500/40 hover:bg-indigo-500/10'
                          )}
                        >
                          {child.enabled ? (
                            <>
                              <ToggleRight className="h-5 w-5" />
                              Включено
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-5 w-5" />
                              Отключено
                            </>
                          )}
                        </button>

                        <button className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2 text-neutral-500 transition hover:border-indigo-500/40 hover:bg-indigo-500/10">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {topLevelFeatures.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-12 text-center">
          <p className="text-sm text-neutral-400">Фичи не найдены</p>
        </div>
      )}
    </div>
  );
}

