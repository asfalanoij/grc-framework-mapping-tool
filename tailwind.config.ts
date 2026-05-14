import type { Config } from 'tailwindcss';

// Theme tokens ported 1:1 from the legacy index.html CSS custom properties.
// Phase 1 design intent: no visual regression — Tailwind expresses the same palette.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#F7F8FA',
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F1F3F7',
          3: '#E9EDF2',
        },
        border: {
          DEFAULT: '#E4E7EC',
          strong: '#D0D5DD',
        },
        ink: {
          DEFAULT: '#0B1626',
          2: '#344054',
          3: '#667085',
          4: '#98A2B3',
          5: '#C9CFD8',
        },
        brand: {
          DEFAULT: '#0E7C6A',
          hov: '#0A5C50',
          50: '#E6F4F1',
          100: '#C7E6DE',
          200: '#98D2C2',
          700: '#0A5C50',
          text: '#0A4A40',
        },
        success: {
          DEFAULT: '#079455',
          50: '#ECFDF3',
          100: '#D1FADF',
          text: '#027A48',
        },
        warning: {
          DEFAULT: '#DC6803',
          50: '#FFFAEB',
          100: '#FEF0C7',
          text: '#B54708',
        },
        error: {
          DEFAULT: '#D92D20',
          50: '#FEF3F2',
          100: '#FEE4E2',
          text: '#B42318',
        },
        info: {
          DEFAULT: '#175CD3',
          50: '#EFF8FF',
          100: '#D1E9FF',
          text: '#1849A9',
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
