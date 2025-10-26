import type { Config } from 'tailwindcss';
import { getTailwindColorTokens, getTailwindSpacingTokens } from './design-tokens';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: getTailwindColorTokens(),
      spacing: getTailwindSpacingTokens()
    }
  },
  darkMode: 'class',
  plugins: []
};
export default config;
