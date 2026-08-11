import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marketing Automation — Amar English School',
  description: 'Control panel for occasion detection, poster generation, and outreach.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased dark:bg-slate-950">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white"
                >
                  AE
                </div>
                <div>
                  <h1 className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
                    Amar English School
                  </h1>
                  <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
                    Marketing Automation
                  </p>
                </div>
              </div>
              <Nav />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-400 sm:px-6 dark:text-slate-600">
          Marketing automation control panel · times shown in Asia/Kathmandu
        </footer>
      </body>
    </html>
  );
}
