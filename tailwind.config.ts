import type { Config } from 'tailwindcss';

// Tailwind CSS 설정 파일
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
