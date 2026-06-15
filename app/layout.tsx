import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Navbar } from '@/components/shared/Navbar';
import { MobileNav } from '@/components/shared/MobileNav';
import { Toaster } from 'sonner';
import './globals.css';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://campusopportunityhub.in'),
  title: {
    default: 'Campus Opportunity Hub - Placements, Internships & More',
    template: '%s | Campus Opportunity Hub',
  },
  description:
    'Your one-stop platform for campus placements, internships, hackathons, scholarships, and fellowships. AI-powered, student-first opportunity discovery.',
  keywords: ['campus placements', 'internship', 'hackathon', 'scholarship', 'campus drive', 'freshers jobs', 'engineering jobs India'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Campus Opportunity Hub',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@campusopphub',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CampusHub',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="flex flex-col min-h-screen pb-16 md:pb-0">
            {children}
            <MobileNav />
          </div>
          <Toaster position="bottom-right" richColors />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
