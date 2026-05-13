import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProgrammaticProfessionDetailPage from '@/components/seo/ProgrammaticProfessionDetailPage';
import { localeAlternates } from '@/lib/seo/config';
import { getProfessionBySlug, getProfessionPath, getProfessionStaticParams } from '@/lib/seo/professions';

interface ResumeExampleDetailPageProps {
  params: {
    locale: string;
    profession: string;
  };
}

export function generateStaticParams() {
  return getProfessionStaticParams().filter((item) => item.locale === 'en');
}

export function generateMetadata({ params }: ResumeExampleDetailPageProps): Metadata {
  if (params.locale !== 'en') {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const profession = getProfessionBySlug(params.profession);
  if (!profession) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${profession.roleName.en} Resume Example`;
  const description = `${profession.summary.en} Includes skills and achievement bullet ideas for faster editing.`;

  return {
    title,
    description,
    alternates: localeAlternates({
      en: getProfessionPath('en', profession.slug),
      tr: getProfessionPath('tr', profession.slug),
    }, 'en'),
    keywords: ['resume examples', profession.roleName.en, `${profession.roleName.en} resume example`],
    openGraph: {
      type: 'article',
      url: getProfessionPath('en', profession.slug),
      title: `${title} | Pathica`,
      description,
    },
  };
}

export default function ResumeExampleDetailPage({ params }: ResumeExampleDetailPageProps) {
  if (params.locale !== 'en') {
    notFound();
  }

  const profession = getProfessionBySlug(params.profession);
  if (!profession) {
    notFound();
  }

  return <ProgrammaticProfessionDetailPage locale="en" profession={profession} />;
}
