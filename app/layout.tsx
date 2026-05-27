import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ボイスメモ',
  description: '音声でメモを取るアプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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
