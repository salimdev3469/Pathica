import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import './globals.css';
import CssHealthCheck from '@/components/CssHealthCheck';
import { ThemeProvider } from '@/components/theme-provider';
import NavigationFeedback from '@/components/NavigationFeedback';
import SiteFooter from '@/components/layout/SiteFooter';
import { getBaseUrl } from '@/lib/seo/config';
import { Toaster } from '@/components/ui/sonner';
import CookieConsentBanner from '@/components/legal/CookieConsentBanner';
import { COOKIE_CONSENT_COOKIE_NAME } from '@/lib/cookie-consent';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'Pathica | AI Resume Builder, CV Maker & Cover Letter Generator',
    template: '%s | Pathica',
  },
  description:
    "Build ATS-friendly resumes and cover letters with Pathica's AI resume builder, CV maker, and keyword optimization tools.",
  keywords: [
    'ai resume builder',
    'resume builder',
    'cv builder',
    'cv maker',
    'online resume maker',
    'cover letter generator',
    'ats resume checker',
    'resume keyword optimizer',
    'ats friendly resume format',
    'ai cv maker',
  ],
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      tr: '/tr',
      'x-default': '/en',
    },
  },
  openGraph: {
    title: 'Pathica | AI Resume Builder, CV Maker & Cover Letter Generator',
    description: "Build ATS-friendly resumes and cover letters with Pathica's AI resume builder, CV maker, and keyword optimization tools.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathica | AI Resume Builder & CV Maker',
    description: "Build ATS-friendly resumes and cover letters with Pathica's AI resume builder, CV maker, and keyword optimization tools.",
  },
  icons: {
    icon: '/tab_icon.png',
    shortcut: '/tab_icon.png',
    apple: '/tab_icon.png',
  },
  verification: {
    google: 'CbHZSPwIaXqcWldwqnhU9ylhYQy_Zep0WJVxMMCdmlE',
  },
};

import SmoothScrolling from '@/components/layout/SmoothScrolling';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const initialCookieConsent = cookieStore.get(COOKIE_CONSENT_COOKIE_NAME)?.value ?? null;

  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-clip">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors duration-300 overflow-x-clip`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CssHealthCheck />
          <NavigationFeedback />
          <SmoothScrolling>
            {children}
            <SiteFooter />
            <CookieConsentBanner initialConsentValue={initialCookieConsent} />
          </SmoothScrolling>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
