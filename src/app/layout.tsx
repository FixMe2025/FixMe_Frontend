import './globals.css';
import type { Metadata } from 'next';
import type { JSX } from 'react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: '한국어 맞춤법 · 띄어쓰기 검사기',
  description: 'Next.js + TypeScript + Tailwind v4',
};

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>
): JSX.Element {
  const { children } = props;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 초기 페인트 전에 html에 .dark 붙여서 FOUC 방지 */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{
              const s = localStorage.getItem('theme');
              const d = s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              const r = document.documentElement;
              d ? r.classList.add('dark') : r.classList.remove('dark');
            }catch{}})();`,
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
