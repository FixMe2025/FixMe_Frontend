import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,mdx,js,jsx}',
    './public/**/*.html',
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
