import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import './globals.css';
import CssHealthCheck from '@/components/CssHealthCheck';
import { ThemeProvider } from '@/components/theme-provider';
import NavigationFeedback from '@/components/NavigationFeedback';
import ThemeToggle from '@/components/theme-toggle';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Pathica | ATS-Friendly Resume Builder',
    template: '%s | Pathica',
  },
  description: 'Build an ATS-friendly resume online, optimize keywords, and improve your job application outcomes with Pathica.',
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
    google: 'M8NvMtJfNmsjvotVeDv0Ayv10pGMEICuQwd4ewVQmj0',
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
          <div className="fixed bottom-5 right-5 z-[100]">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}