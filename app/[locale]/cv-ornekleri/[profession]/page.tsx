import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProgrammaticProfessionDetailPage from '@/components/seo/ProgrammaticProfessionDetailPage';
import { localeAlternates } from '@/lib/seo/config';
import { getProfessionBySlug, getProfessionPath, getProfessionStaticParams } from '@/lib/seo/professions';

interface CvExampleDetailPageProps {
  params: {
    locale: string;
    profession: string;
  };
}

export function generateStaticParams() {
  return getProfessionStaticParams().filter((item) => item.locale === 'tr');
}

export function generateMetadata({ params }: CvExampleDetailPageProps): Metadata {
  if (params.locale !== 'tr') {
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

  const title = `${profession.roleName.tr} CV Örneği`;
  const description = `${profession.summary.tr} Yetkinlik ve başarı cümlesi örnekleri içerir.`;

  return {
    title,
    description,
    alternates: localeAlternates({
      en: getProfessionPath('en', profession.slug),
      tr: getProfessionPath('tr', profession.slug),
    }, 'tr'),
    keywords: ['cv örnekleri', profession.roleName.tr, `${profession.roleName.tr} cv örneği`],
    openGraph: {
      type: 'article',
      url: getProfessionPath('tr', profession.slug),
      title: `${title} | Pathica`,
      description,
    },
  };
}

export default function CvExampleDetailPage({ params }: CvExampleDetailPageProps) {
  if (params.locale !== 'tr') {
    notFound();
  }

  const profession = getProfessionBySlug(params.profession);
  if (!profession) {
    notFound();
  }

  return <ProgrammaticProfessionDetailPage locale="tr" profession={profession} />;
}
