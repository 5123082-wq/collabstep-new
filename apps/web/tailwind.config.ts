import type { Config } from 'tailwindcss';
import { getTailwindTokens } from './design-tokens';

const tokens = getTailwindTokens();

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: tokens,
      spacing: {
        'content-inline': tokens['content-inline-padding'],
        'rail-collapsed': tokens['rail-collapsed-width'],
        'rail-dock-spacing': tokens['rail-dock-spacing'],
        'rail-safe-gap': tokens['rail-safe-gap'],
        'rail-safe-area': tokens['rail-safe-area'],
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Inter',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        heading: [
          'var(--font-sans)',
          'Inter',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
export default config;
