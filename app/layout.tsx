import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import './globals.css';
import CssHealthCheck from '@/components/CssHealthCheck';
import { ThemeProvider } from '@/components/theme-provider';
import NavigationFeedback from '@/components/NavigationFeedback';
import ThemeToggle from '@/components/theme-toggle';
import SiteFooter from '@/components/layout/SiteFooter';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { getBaseUrl } from '@/lib/seo/config';
import { Toaster } from '@/components/ui/sonner';

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
    default: 'Pathica | ATS-Friendly Resume Builder',
    template: '%s | Pathica',
  },
  description: 'Build an ATS-friendly resume online, optimize keywords, and improve your job application outcomes with Pathica.',
  keywords: ['resume builder', 'cv builder', 'ats resume builder', 'online cv oluştur', 'cv oluşturucu'],
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      tr: '/tr',
      'x-default': '/en',
    },
  },
  openGraph: {
    title: 'Pathica | ATS-Friendly Resume Builder',
    description: 'Create, optimize, and export ATS-friendly resumes with practical tools and examples.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathica | ATS-Friendly Resume Builder',
    description: 'Create and optimize your resume with ATS-safe templates and tools.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CssHealthCheck />
          <NavigationFeedback />
          {children}
          <SiteFooter locale={locale} />
          <Toaster />
          <div className="fixed bottom-5 right-5 z-[100]">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
