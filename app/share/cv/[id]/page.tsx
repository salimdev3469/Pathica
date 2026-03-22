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

import { supabaseAdmin } from '@/lib/supabase';
import { CVState, Section, Item, PersonalInfo } from '@/context/CVContext';
import { normalizeCvFont } from '@/lib/cv-fonts';
import { ReadOnlyViewer } from '@/components/cv-builder/ReadOnlyViewer';

type CvFieldRow = {
    id: string;
    label: string;
    value: string;
    field_type: string;
    position: number;
};

type CvSectionRow = {
    id: string;
    title: string;
    position: number;
    cv_fields: CvFieldRow[];
};

export default async function SharedCvPage({ params, searchParams }: SharePageProps) {
  const title = normalizeTitle(firstValue(searchParams.title));
  const score = normalizeScore(firstValue(searchParams.score));

  const { data: cvData, error } = await supabaseAdmin
      .from('cvs')
      .select(
          `
          id, title, user_id,
          cv_sections(
              id, title, position,
              cv_fields(
                  id, label, value, field_type, position
              )
          )
      `,
      )
      .eq('id', params.id)
      .single();

  if (error || !cvData) {
      return (
          <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
              <div className="w-full max-w-2xl text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">CV Not Found</h1>
                  <p className="mt-4 text-slate-600 dark:text-slate-400">The CV you are looking for does not exist or has been removed.</p>
                  <Button asChild className="mt-6 rounded-xl">
                      <Link href="/">Go to Pathica</Link>
                  </Button>
              </div>
          </main>
      );
  }

  // Transform to front-end state
  const allSections = ((cvData.cv_sections || []) as CvSectionRow[]).sort(
      (a, b) => a.position - b.position,
  );

  const personalInfoSection = allSections.find((s) => s.title === '_personal_info');
  const summarySection = allSections.find((s) => s.title === '_summary');

  let personalInfo: PersonalInfo | undefined;
  if (personalInfoSection && personalInfoSection.cv_fields[0]) {
      try {
          personalInfo = JSON.parse(personalInfoSection.cv_fields[0].value) as PersonalInfo;
      } catch {
          personalInfo = undefined;
      }
  }

  let summary = '';
  let summaryTitle = 'Profile Summary';
  let summaryTitleFontSize: number | undefined;
  let summaryFontSize: number | undefined;
  let fontFamily = normalizeCvFont(undefined);
  
  if (summarySection) {
      const summaryField = summarySection.cv_fields.find((field) => field.label === 'summary') || summarySection.cv_fields[0];
      if (summaryField) summary = summaryField.value;

      const summaryTitleField = summarySection.cv_fields.find((field) => field.label === 'summary_title');
      if (summaryTitleField?.value) summaryTitle = summaryTitleField.value;

      const fontFamilyField = summarySection.cv_fields.find((field) => field.label === 'font_family');
      if (fontFamilyField?.value) fontFamily = normalizeCvFont(fontFamilyField.value);

      const summaryTitleFontSizeField = summarySection.cv_fields.find((field) => field.label === 'summary_title_font_size');
      if (summaryTitleFontSizeField?.value) {
          const parsed = parseInt(summaryTitleFontSizeField.value, 10);
          if (!isNaN(parsed)) summaryTitleFontSize = parsed;
      }

      const summaryFontSizeField = summarySection.cv_fields.find((field) => field.label === 'summary_font_size');
      if (summaryFontSizeField?.value) {
          const parsed = parseInt(summaryFontSizeField.value, 10);
          if (!isNaN(parsed)) summaryFontSize = parsed;
      }
  }

  const normalSections = allSections.filter(
      (s) => s.title !== '_personal_info' && s.title !== '_summary' && s.title !== '_ats_meta',
  );

  const sections: Section[] = normalSections.map((sectionRow) => {
      let titleFontSize: number | undefined;
      const metaField = (sectionRow.cv_fields || []).find((f) => f.label === 'section_meta');
      if (metaField) {
          try { titleFontSize = JSON.parse(metaField.value).titleFontSize; } catch { }
      }

      return {
          id: sectionRow.id,
          title: sectionRow.title,
          position: sectionRow.position,
          ...(titleFontSize !== undefined && { titleFontSize }),
          items: (sectionRow.cv_fields || [])
              .sort((a, b) => a.position - b.position)
              .map((fieldRow) => {
                  if (fieldRow.field_type === 'item') {
                      try {
                          return JSON.parse(fieldRow.value) as Item;
                      } catch {
                          return null;
                      }
                  }
                  return null;
              })
              .filter(Boolean) as Item[],
      };
  });

  const initialState: CVState = {
      id: cvData.id,
      title: cvData.title,
      personalInfo: personalInfo || ({} as PersonalInfo),
      summaryTitle,
      ...(summaryTitleFontSize !== undefined && { summaryTitleFontSize }),
      fontFamily,
      summary: summary || '',
      ...(summaryFontSize !== undefined && { summaryFontSize }),
      sections,
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-50 p-4 sm:p-6 md:p-8 dark:bg-slate-950">
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
          <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shared CV</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
              {score !== 'Pending' && (
                  <p className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  ATS Score: {score}
                  </p>
              )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md">
                  <Link href="/login">
                      Create Yours <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
          </div>
      </div>

      <div className="w-full max-w-5xl">
          <ReadOnlyViewer cvState={initialState} />
      </div>

      <div className="mt-8 text-center w-full max-w-2xl">
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {FIXED_SHARE_DESCRIPTION}
          </p>
      </div>
    </main>
  );
}
