import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import { getLegalPageLinks } from '@/lib/legal-pages';
import { localizedPath } from '@/lib/seo/config';
import CookieSettingsButton from '@/components/legal/CookieSettingsButton';

type SiteFooterProps = {};

function getFooterLogoSrc() {
  try {
    const mtime = fs.statSync(path.join(process.cwd(), 'public', 'logo_pathica_footer.png')).mtimeMs;
    return `/logo_pathica_footer.png?v=${Math.floor(mtime)}`;
  } catch {
    return '/logo_pathica_footer.png';
  }
}

export default function SiteFooter({}: SiteFooterProps) {
  const legalPageLinks = getLegalPageLinks('en');
  const footerLogoSrc = getFooterLogoSrc();
  const seoLinks = [
    {
      href: localizedPath('en', false ? 'cv-olusturucu' : 'resume-builder'),
      label: 'Resume Builder',
    },
    {
      href: localizedPath('en', false ? 'ai-cv-olusturucu' : 'ai-resume-builder'),
      label: 'AI Resume Builder',
    },
    {
      href: localizedPath('en', false ? 'on-yazi-olusturucu' : 'cover-letter-generator'),
      label: 'Cover Letter Generator',
    },
    {
      href: localizedPath('en', false ? 'on-yazi-nasil-yazilir' : 'cover-letter-writing-guide'),
      label: 'Cover Letter Writing',
    },
    {
      href: localizedPath('en', false ? 'ats-cv-olusturucu' : 'ats-resume-builder'),
      label: 'ATS Resume Builder',
    },
  ];

  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-12 text-slate-400">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6">
        <div className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Link
            href={localizedPath('en')}
            aria-label={'Go to Pathica homepage'}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <Image
              src={footerLogoSrc}
              alt={'Pathica footer logo'}
              width={144}
              height={144}
              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
            />
          </Link>
        </div>

        <p className="mx-auto mb-6 max-w-xl text-center text-sm text-slate-400">
          {'The automated, AI-driven way to build resumes that pass ATS tests and win interviews.'}
        </p>

        <nav aria-label="Yasal ve kurumsal bağlantılar" className="w-full">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm">
            {legalPageLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton />
            </li>
          </ul>
        </nav>

        <nav aria-label={'Popular SEO pages'} className="mt-4 w-full">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm">
            {seoLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 text-sm">&copy; {new Date().getFullYear()} {'All rights reserved.'}</div>
      </div>
    </footer>
  );
}
