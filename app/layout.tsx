import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ボイスメモ',
  description: '音声でメモを取るアプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geist.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="h-full bg-gray-100 dark:bg-gray-950 font-sans antialiased">
        <div className="h-dvh max-w-lg mx-auto flex flex-col bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
