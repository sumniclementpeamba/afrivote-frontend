import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import PlanThemeInitializer from '@/components/PlanThemeInitializer';
import BrandingLoader from '@/components/BrandingLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from 'next-themes';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'AfriVote',
  description: 'Next-Gen Pan-African Online Voting & Digital Election Platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true}
        className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white min-h-screen flex flex-col"
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <PlanThemeInitializer />
            <BrandingLoader />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'font-sans text-sm font-semibold rounded-2xl shadow-xl backdrop-blur-md border',
                style: {
                  background: 'var(--toast-bg, rgba(255, 255, 255, 0.95))',
                  color: 'var(--toast-color, #0f172a)',
                  borderColor: 'var(--toast-border, rgba(226, 232, 240, 0.8))',
                  padding: '12px 18px',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#ffffff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
                },
              }}
            />
            <ErrorBoundary>{children}</ErrorBoundary>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}