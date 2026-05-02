import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#7c3aed',
        background: '#f8fafc',
        foreground: '#0f172a',
        border: '#e2e8f0',
      },
    },
  },
  plugins: [],
};

export default config;
