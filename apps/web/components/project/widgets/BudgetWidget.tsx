'use client';

import { useMemo } from 'react';
import type { Project } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import { DollarSign, AlertCircle } from 'lucide-react';

type BudgetWidgetProps = {
  project: Project;
  isLoading?: boolean;
};

export function BudgetWidget({ project, isLoading }: BudgetWidgetProps) {
  const budgetData = useMemo(() => {
    const planned = project.budgetPlanned ?? 0;
    const spent = project.budgetSpent ?? 0;
    const remaining = planned - spent;
    const percentage = planned > 0 ? Math.round((spent / planned) * 100) : 0;
    const isOverBudget = spent > planned;
    const riskLevel = percentage >= 90 ? 'high' : percentage >= 75 ? 'medium' : 'low';

    return {
      planned,
      spent,
      remaining,
      percentage,
      isOverBudget,
      riskLevel
    };
  }, [project]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-neutral-800 rounded" />
          <div className="h-20 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Бюджет проекта</h3>
        <DollarSign className="h-5 w-5 text-neutral-500" />
      </div>

      {/* Budget overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Запланировано</span>
          <span className="text-lg font-semibold text-white">{formatCurrency(budgetData.planned)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Потрачено</span>
          <span className={cn('text-lg font-semibold', budgetData.isOverBudget ? 'text-rose-400' : 'text-white')}>
            {formatCurrency(budgetData.spent)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
          <span className="text-sm font-medium text-neutral-300">Остаток</span>
          <span
            className={cn(
              'text-lg font-semibold',
              budgetData.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
            )}
          >
            {formatCurrency(budgetData.remaining)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Освоение бюджета</span>
          <span
            className={cn(
              'font-semibold',
              budgetData.riskLevel === 'high' ? 'text-rose-400' : budgetData.riskLevel === 'medium' ? 'text-amber-400' : 'text-neutral-400'
            )}
          >
            {budgetData.percentage}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-900">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              budgetData.isOverBudget
                ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                : budgetData.riskLevel === 'high'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
            )}
            style={{ width: `${Math.min(budgetData.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Risk indicator */}
      {budgetData.riskLevel !== 'low' && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border p-3',
            budgetData.riskLevel === 'high'
              ? 'border-rose-500/40 bg-rose-500/10'
              : 'border-amber-500/40 bg-amber-500/10'
          )}
        >
          <AlertCircle
            className={cn('h-4 w-4', budgetData.riskLevel === 'high' ? 'text-rose-400' : 'text-amber-400')}
          />
          <p className="text-xs text-neutral-300">
            {budgetData.isOverBudget
              ? 'Превышен бюджет'
              : budgetData.riskLevel === 'high'
                ? 'Высокий риск превышения бюджета'
                : 'Средний риск превышения бюджета'}
          </p>
        </div>
      )}
    </div>
  );
}

export default BudgetWidget;

