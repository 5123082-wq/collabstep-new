import type { Config } from 'tailwindcss';
import { getTailwindColorTokens, getTailwindSpacingTokens } from './design-tokens';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: getTailwindColorTokens(),
      spacing: getTailwindSpacingTokens(),
      fontFamily: {
        sans: ["var(--font-sans)", 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'sans-serif']
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
export default config;
