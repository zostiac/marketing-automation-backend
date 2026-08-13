import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Sparkles } from 'lucide-react';
import { Nav } from '@/components/nav';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Marketing Automation — Amar English School',
  description: 'Control panel for content scheduling and design generation jobs.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d11' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <h1 className="text-sm font-semibold text-foreground">Amar English School</h1>
                  <p className="text-xs text-muted-foreground">Marketing Automation</p>
                </div>
              </div>
              <Nav />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-muted-foreground sm:px-6">
          Marketing automation control panel · times shown in Asia/Kathmandu
        </footer>
      </body>
    </html>
  );
}
