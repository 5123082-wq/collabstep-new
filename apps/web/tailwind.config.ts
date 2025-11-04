import type { Config } from 'tailwindcss';
import { getTailwindTokens, getTailwindSpacingTokens } from './design-tokens';

const tokens = getTailwindTokens();
const spacingTokens = getTailwindSpacingTokens();

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: tokens,
      spacing: spacingTokens,
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
