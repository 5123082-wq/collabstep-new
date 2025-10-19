import type { MarketplaceTemplate } from './types';

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
});

export function formatTemplatePrice(value: number): string {
  return currencyFormatter.format(value);
}

export function getTemplatePriceLabel(template: MarketplaceTemplate): {
  primary: string;
  secondary?: string;
} {
  if (template.pricingType === 'free') {
    return {
      primary: 'Бесплатно',
      secondary: 'Доступно без оплаты'
    };
  }

  if (template.pricingType === 'subscription') {
    const tier = template.subscriptionTier ?? 'Pro';
    return {
      primary: `В подписке ${tier}`,
      secondary: 'Без дополнительной оплаты'
    };
  }

  return {
    primary: formatTemplatePrice(template.price),
    secondary: 'Разовая покупка'
  };
}

export function getTemplatePricingBadge(template: MarketplaceTemplate): {
  label: string;
  tone: 'subscription' | 'free' | 'paid';
} {
  if (template.pricingType === 'free') {
    return { label: 'Бесплатно', tone: 'free' };
  }

  if (template.pricingType === 'subscription') {
    return { label: 'Подписка', tone: 'subscription' };
  }

  return { label: 'Покупка', tone: 'paid' };
}
