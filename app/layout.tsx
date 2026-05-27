import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ボイスメモ',
  description: '音声でメモを取るアプリ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ボイスメモ',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#111111" />
      </head>
      <body className="h-full" style={{ background: 'var(--bg)' }}>
        <div
          className="h-dvh max-w-lg mx-auto flex flex-col overflow-hidden"
          style={{ background: 'var(--bg)' }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
