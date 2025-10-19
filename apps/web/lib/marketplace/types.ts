export type MarketplaceCategory = 'logo' | 'landing' | 'ui_kit' | 'presentation';

export type MarketplaceFile = {
  name: string;
  size: string;
  mime: string;
};

export type MarketplaceSeller = {
  id: string;
  name: string;
  avatarUrl: string;
  portfolioCount: number;
};

export type TemplatePricingType = 'free' | 'subscription' | 'paid';

export type MarketplaceTemplate = {
  id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  price: number;
  pricingType: TemplatePricingType;
  subscriptionTier?: string;
  rating: number;
  ratingCount: number;
  salesCount: number;
  seller: MarketplaceSeller;
  previewUrl: string;
  gallery: string[];
  videoUrl?: string;
  license: string;
  compatibility: string[];
  requirements: string[];
  files: MarketplaceFile[];
  tags: string[];
};
