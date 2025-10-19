import type { MarketplaceTemplate, MarketplaceSeller } from './types';

const sellers: MarketplaceSeller[] = [
  {
    id: 'studio-nova',
    name: 'Studio Nova',
    avatarUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=160&h=160&q=80',
    portfolioCount: 24
  },
  {
    id: 'pixel-foundry',
    name: 'Pixel Foundry',
    avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=160&h=160&q=80',
    portfolioCount: 31
  },
  {
    id: 'orbit-labs',
    name: 'Orbit Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=facearea&w=160&h=160&q=80',
    portfolioCount: 18
  },
  {
    id: 'north-dsgn',
    name: 'North DSGN',
    avatarUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=facearea&w=160&h=160&q=80',
    portfolioCount: 27
  },
  {
    id: 'vector-squad',
    name: 'Vector Squad',
    avatarUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=facearea&w=160&h=160&q=80',
    portfolioCount: 15
  },
  {
    id: 'boldline',
    name: 'Boldline',
    avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&w=160&h=160&q=80',
    portfolioCount: 22
  }
];

const templateGallery = {
  neon: [
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1505731132164-cca90383e1af?auto=format&fit=crop&w=960&q=80'
  ],
  desert: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1587613864521-530370d59cb2?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=960&q=80'
  ],
  orbit: [
    'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=960&q=80'
  ],
  ocean: [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=960&q=80'
  ],
  dawn: [
    'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=960&q=80'
  ],
  skyline: [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=960&q=80',
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=960&q=80'
  ]
} as const satisfies Record<string, readonly string[]>;

const getSeller = (index: number) => sellers[index]!;
const getGallery = (key: keyof typeof templateGallery) => [...templateGallery[key]];

export const templates: MarketplaceTemplate[] = [
  {
    id: 'neo-landing-kit',
    title: 'NEO Landing Kit',
    description: 'Яркий лендинг в неоновой стилистике с 12 готовыми секциями и системой компонентов.',
    category: 'landing',
    price: 1490,
    rating: 4.8,
    ratingCount: 198,
    salesCount: 1240,
    seller: getSeller(0),
    previewUrl: templateGallery.neon[0],
    gallery: getGallery('neon'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Figma', 'Sketch'],
    requirements: ['Figma 2022.10+', 'Шрифты: Inter, Rubik'],
    files: [
      { name: 'neo-kit.fig', size: '24.3 МБ', mime: 'application/octet-stream' },
      { name: 'marketing-assets.zip', size: '12.8 МБ', mime: 'application/zip' },
      { name: 'usage-guide.pdf', size: '4.1 МБ', mime: 'application/pdf' }
    ],
    tags: ['landing', 'startup', 'gradient']
  },
  {
    id: 'minimal-logo-pack',
    title: 'Minimal Logo Pack',
    description: 'Подборка из 40 минималистичных логотипов с вариативностью по цвету и композиции.',
    category: 'logo',
    price: 990,
    rating: 4.7,
    ratingCount: 142,
    salesCount: 870,
    seller: getSeller(1),
    previewUrl: templateGallery.dawn[1],
    gallery: getGallery('dawn'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['SVG', 'Illustrator'],
    requirements: ['Adobe Illustrator 2021+', 'Шрифты: Montserrat'],
    files: [
      { name: 'minimal-logo-pack.ai', size: '18.6 МБ', mime: 'application/postscript' },
      { name: 'logo-variants.svg', size: '6.4 МБ', mime: 'image/svg+xml' },
      { name: 'brand-guidelines.pdf', size: '8.2 МБ', mime: 'application/pdf' }
    ],
    tags: ['logo', 'brand', 'minimal']
  },
  {
    id: 'orbit-saas-dashboard',
    title: 'Orbit SaaS Dashboard',
    description: 'UI-kit панели управления с графиками, таблицами и готовыми сценариями для SaaS.',
    category: 'ui_kit',
    price: 2990,
    rating: 4.9,
    ratingCount: 264,
    salesCount: 640,
    seller: getSeller(2),
    previewUrl: templateGallery.orbit[0],
    gallery: getGallery('orbit'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Figma'],
    requirements: ['Figma 2023.1+', 'Плагин Charts'],
    files: [
      { name: 'orbit-dashboard.fig', size: '32.1 МБ', mime: 'application/octet-stream' },
      { name: 'data-widgets.fig', size: '8.6 МБ', mime: 'application/octet-stream' },
      { name: 'handoff-kit.zip', size: '14.2 МБ', mime: 'application/zip' }
    ],
    tags: ['dashboard', 'analytics', 'saas']
  },
  {
    id: 'pitch-deck-elevate',
    title: 'Elevate Pitch Deck',
    description: 'Презентация для стартапов с 30 адаптивными слайдами и динамичной типографикой.',
    category: 'presentation',
    price: 1490,
    rating: 4.6,
    ratingCount: 98,
    salesCount: 420,
    seller: getSeller(3),
    previewUrl: templateGallery.ocean[0],
    gallery: getGallery('ocean'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Keynote', 'PowerPoint', 'Figma'],
    requirements: ['Keynote 12+', 'PowerPoint 2019+'],
    files: [
      { name: 'elevate-keynote.key', size: '27.4 МБ', mime: 'application/x-iwork-keynote-sffkey' },
      { name: 'elevate-pptx.pptx', size: '19.7 МБ', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      { name: 'brand-visuals.zip', size: '11.3 МБ', mime: 'application/zip' }
    ],
    tags: ['presentation', 'startup', 'pitch']
  },
  {
    id: 'aurora-mobile-ui',
    title: 'Aurora Mobile UI',
    description: 'Светлый UI-kit для мобильных приложений с 90 экранами и темной темой.',
    category: 'ui_kit',
    price: 2990,
    rating: 4.8,
    ratingCount: 186,
    salesCount: 980,
    seller: getSeller(4),
    previewUrl: templateGallery.ocean[1],
    gallery: getGallery('ocean'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Figma'],
    requirements: ['Figma 2022.6+', 'Font: SF Pro'],
    files: [
      { name: 'aurora-mobile.fig', size: '41.2 МБ', mime: 'application/octet-stream' },
      { name: 'aurora-icons.svg', size: '5.6 МБ', mime: 'image/svg+xml' },
      { name: 'handoff-pack.zip', size: '9.8 МБ', mime: 'application/zip' }
    ],
    tags: ['mobile', 'ui kit', 'light']
  },
  {
    id: 'brand-starter-kit',
    title: 'Brand Starter Kit',
    description: 'Комплект фирменного стиля: логотипы, цвета, типографика, презентация и гайдбук.',
    category: 'logo',
    price: 2990,
    rating: 4.7,
    ratingCount: 156,
    salesCount: 720,
    seller: getSeller(5),
    previewUrl: templateGallery.dawn[0],
    gallery: getGallery('dawn'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Illustrator', 'Figma'],
    requirements: ['Adobe Illustrator 2020+', 'Figma 2023.0+'],
    files: [
      { name: 'brand-assets.ai', size: '22.5 МБ', mime: 'application/postscript' },
      { name: 'brand-guide.pdf', size: '14.1 МБ', mime: 'application/pdf' },
      { name: 'presentation.pptx', size: '16.7 МБ', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
    ],
    tags: ['brand', 'logo', 'guide']
  },
  {
    id: 'noir-presentation',
    title: 'Noir Presentation Pack',
    description: 'Минималистичная презентация в темной теме с акцентными цветами и графикой.',
    category: 'presentation',
    price: 1490,
    rating: 4.5,
    ratingCount: 76,
    salesCount: 312,
    seller: getSeller(0),
    previewUrl: templateGallery.neon[1],
    gallery: getGallery('neon'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Keynote', 'PowerPoint'],
    requirements: ['Keynote 11+', 'PowerPoint 2016+'],
    files: [
      { name: 'noir-deck.key', size: '21.4 МБ', mime: 'application/x-iwork-keynote-sffkey' },
      { name: 'noir-slides.pptx', size: '17.9 МБ', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      { name: 'noir-assets.zip', size: '10.2 МБ', mime: 'application/zip' }
    ],
    tags: ['presentation', 'dark', 'minimal']
  },
  {
    id: 'venture-metrics-dashboard',
    title: 'Venture Metrics Dashboard',
    description: 'Готовая система аналитики для трекинга продуктовых метрик и воронок.',
    category: 'ui_kit',
    price: 2990,
    rating: 4.9,
    ratingCount: 204,
    salesCount: 542,
    seller: getSeller(2),
    previewUrl: templateGallery.orbit[1],
    gallery: getGallery('orbit'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Figma'],
    requirements: ['Figma 2023.2+', 'Плагин Datavizer'],
    files: [
      { name: 'venture-dashboard.fig', size: '29.6 МБ', mime: 'application/octet-stream' },
      { name: 'venture-illustrations.svg', size: '7.4 МБ', mime: 'image/svg+xml' },
      { name: 'handoff-files.zip', size: '11.5 МБ', mime: 'application/zip' }
    ],
    tags: ['dashboard', 'metrics', 'venture']
  },
  {
    id: 'startup-landing-flow',
    title: 'Startup Landing Flow',
    description: 'Серия лендингов для стартапа с адаптивной сеткой, готовыми формами и A/B версиями.',
    category: 'landing',
    price: 1490,
    rating: 4.8,
    ratingCount: 182,
    salesCount: 684,
    seller: getSeller(3),
    previewUrl: templateGallery.desert[0],
    gallery: getGallery('desert'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Figma', 'Webflow'],
    requirements: ['Figma 2022.9+', 'Webflow CMS'],
    files: [
      { name: 'startup-landing.fig', size: '25.3 МБ', mime: 'application/octet-stream' },
      { name: 'landing-components.fig', size: '10.1 МБ', mime: 'application/octet-stream' },
      { name: 'marketing-kit.zip', size: '7.9 МБ', mime: 'application/zip' }
    ],
    tags: ['landing', 'startup', 'marketing']
  },
  {
    id: 'product-launch-presentation',
    title: 'Product Launch Presentation',
    description: 'Темплейт презентации запуска продукта с инфографикой и storytelling блоками.',
    category: 'presentation',
    price: 1490,
    rating: 4.7,
    ratingCount: 134,
    salesCount: 512,
    seller: getSeller(4),
    previewUrl: templateGallery.skyline[0],
    gallery: getGallery('skyline'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Keynote', 'PowerPoint'],
    requirements: ['Keynote 11+', 'PowerPoint 2019+'],
    files: [
      { name: 'launch-deck.key', size: '24.1 МБ', mime: 'application/x-iwork-keynote-sffkey' },
      { name: 'launch-deck.pptx', size: '18.4 МБ', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      { name: 'launch-assets.zip', size: '9.7 МБ', mime: 'application/zip' }
    ],
    tags: ['presentation', 'launch', 'product']
  },
  {
    id: 'hypergrowth-branding',
    title: 'Hypergrowth Branding Pack',
    description: 'Современная айдентика с наборами логотипов, социальными шаблонами и презентацией.',
    category: 'logo',
    price: 2990,
    rating: 4.8,
    ratingCount: 176,
    salesCount: 436,
    seller: getSeller(5),
    previewUrl: templateGallery.dawn[2],
    gallery: getGallery('dawn'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Illustrator', 'Figma'],
    requirements: ['Adobe Illustrator 2021+', 'Figma 2023.1+'],
    files: [
      { name: 'hypergrowth-brand.ai', size: '28.4 МБ', mime: 'application/postscript' },
      { name: 'social-templates.fig', size: '12.3 МБ', mime: 'application/octet-stream' },
      { name: 'brand-guide.pdf', size: '9.2 МБ', mime: 'application/pdf' }
    ],
    tags: ['brand', 'logo', 'social']
  },
  {
    id: 'collabverse-presenter',
    title: 'Collabverse Presenter',
    description: 'Тематический шаблон презентации с иллюстрациями и сценарием рассказа о команде.',
    category: 'presentation',
    price: 1490,
    rating: 4.6,
    ratingCount: 88,
    salesCount: 288,
    seller: getSeller(0),
    previewUrl: templateGallery.neon[2],
    gallery: getGallery('neon'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Keynote', 'PowerPoint'],
    requirements: ['PowerPoint 2019+', 'Шрифт: Manrope'],
    files: [
      { name: 'collabverse.key', size: '19.6 МБ', mime: 'application/x-iwork-keynote-sffkey' },
      { name: 'collabverse.pptx', size: '16.2 МБ', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      { name: 'illustrations.zip', size: '8.8 МБ', mime: 'application/zip' }
    ],
    tags: ['presentation', 'team', 'story']
  },
  {
    id: 'horizon-landing-pages',
    title: 'Horizon Landing Pages',
    description: 'Набор адаптивных лендингов с 3 темами, состояниями форм и блоками интеграций.',
    category: 'landing',
    price: 1490,
    rating: 4.9,
    ratingCount: 208,
    salesCount: 792,
    seller: getSeller(3),
    previewUrl: templateGallery.desert[1],
    gallery: getGallery('desert'),
    license: 'Коммерческая лицензия, 1 проект',
    compatibility: ['Figma', 'Webflow'],
    requirements: ['Figma 2023.0+', 'Webflow CMS'],
    files: [
      { name: 'horizon-landing.fig', size: '27.8 МБ', mime: 'application/octet-stream' },
      { name: 'components-library.fig', size: '9.4 МБ', mime: 'application/octet-stream' },
      { name: 'marketing-assets.zip', size: '6.7 МБ', mime: 'application/zip' }
    ],
    tags: ['landing', 'conversion', 'webflow']
  }
];

export function getTemplateById(id: string) {
  return templates.find((template) => template.id === id);
}

export function getTemplatesByCategory(category: string, excludeId?: string) {
  return templates.filter((template) => template.category === category && template.id !== excludeId);
}
