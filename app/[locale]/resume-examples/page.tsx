import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProgrammaticProfessionListPage from '@/components/seo/ProgrammaticProfessionListPage';
import { localeAlternates } from '@/lib/seo/config';
import { getProfessionListPath, professionSeeds } from '@/lib/seo/professions';

interface ResumeExamplesPageProps {
  params: {
    locale: string;
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }];
}

export function generateMetadata({ params }: ResumeExamplesPageProps): Metadata {
  if (params.locale !== 'en') {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: 'Resume Examples by Job Title',
    description: 'Browse role-specific resume examples and practical writing cues for each profession.',
    alternates: localeAlternates({
      en: getProfessionListPath('en'),
      tr: getProfessionListPath('tr'),
    }, 'en'),
    keywords: ['resume examples', 'resume example', 'resume by job title'],
    openGraph: {
      type: 'website',
      url: getProfessionListPath('en'),
      title: 'Resume Examples by Job Title | Pathica',
      description: 'Explore profession-based resume examples designed for ATS and recruiter readability.',
    },
  };
}

export default function ResumeExamplesPage({ params }: ResumeExamplesPageProps) {
  if (params.locale !== 'en') {
    notFound();
  }

  return (
    <ProgrammaticProfessionListPage
      locale="en"
      title="Resume Examples by Job Title"
      description="Explore profession-specific resume examples, skill cues, and measurable achievement patterns you can adapt quickly."
      professions={professionSeeds}
    />
  );
}
