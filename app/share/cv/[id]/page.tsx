import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SharePageProps = {
  params: { id: string };
  searchParams: { title?: string | string[]; score?: string | string[] };
};

const FIXED_SHARE_HEADLINE = 'Pathica CV Preview';
const FIXED_SHARE_DESCRIPTION = 'I built an ATS-ready CV with Pathica. See the preview and create yours in minutes.';

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function normalizeTitle(raw: string): string {
  const value = raw.trim();
  if (!value) return 'Resume';
  return value.slice(0, 90);
}

function normalizeScore(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (!value || value === 'pending') return 'Pending';

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 'Pending';

  return `${Math.max(0, Math.min(100, Math.round(parsed)))}/100`;
}

function getSiteUrl() {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const protocol = h.get('x-forwarded-proto') || 'https';

  if (host) return `${protocol}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
  const title = normalizeTitle(firstValue(searchParams.title));
  const score = normalizeScore(firstValue(searchParams.score));
  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const pagePath = `/share/cv/${params.id}?title=${encodeURIComponent(title)}&score=${encodeURIComponent(score)}`;
  const absoluteUrl = `${siteUrl}${pagePath}`;
  const ogImage = `${siteUrl}/share/cv/${params.id}/opengraph-image?title=${encodeURIComponent(title)}&score=${encodeURIComponent(score)}`;

  return {
    title: FIXED_SHARE_HEADLINE,
    description: FIXED_SHARE_DESCRIPTION,
    openGraph: {
      title: FIXED_SHARE_HEADLINE,
      description: FIXED_SHARE_DESCRIPTION,
      type: 'website',
      url: absoluteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} CV preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: FIXED_SHARE_HEADLINE,
      description: FIXED_SHARE_DESCRIPTION,
      images: [ogImage],
    },
  };
}

export default function SharedCvPage({ params, searchParams }: SharePageProps) {
  const title = normalizeTitle(firstValue(searchParams.title));
  const score = normalizeScore(firstValue(searchParams.score));
  const previewImage = `/share/cv/${params.id}/opengraph-image?title=${encodeURIComponent(title)}&score=${encodeURIComponent(score)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shared CV Snapshot</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          ATS Score: {score}
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <Image
            src={previewImage}
            alt={`${title} preview`}
            width={1200}
            height={630}
            className="h-auto w-full"
            priority
          />
        </div>

        <p className="mt-6 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {FIXED_SHARE_DESCRIPTION}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/cv/new">
              Start Your CV <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">Go to Pathica</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
