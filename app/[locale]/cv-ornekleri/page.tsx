import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProgrammaticProfessionListPage from '@/components/seo/ProgrammaticProfessionListPage';
import { localeAlternates } from '@/lib/seo/config';
import { getProfessionListPath, professionSeeds } from '@/lib/seo/professions';

interface CvExamplesPageProps {
  params: {
    locale: string;
  };
}

export function generateStaticParams() {
  return [{ locale: 'tr' }];
}

export function generateMetadata({ params }: CvExamplesPageProps): Metadata {
  if (params.locale !== 'tr') {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: 'CV Örnekleri (Meslek Bazlı)',
    description: 'Meslek bazlı CV örnekleri, yetkinlik ipuçları ve ölçülebilir başarı cümlesi fikirlerini incele.',
    alternates: localeAlternates({
      en: getProfessionListPath('en'),
      tr: getProfessionListPath('tr'),
    }, 'tr'),
    keywords: ['cv örnekleri', 'meslek bazlı cv', 'cv hazırlama örnekleri'],
    openGraph: {
      type: 'website',
      url: getProfessionListPath('tr'),
      title: 'CV Örnekleri (Meslek Bazlı) | Pathica',
      description: 'ATS odaklı meslek bazlı CV örneklerini ve pratik içerik önerilerini keşfedin.',
    },
  };
}

export default function CvExamplesPage({ params }: CvExamplesPageProps) {
  if (params.locale !== 'tr') {
    notFound();
  }

  return (
    <ProgrammaticProfessionListPage
      locale="tr"
      title="Meslek Bazlı CV Örnekleri"
      description="Her meslek için role uygun yetkinlikler ve başarı odaklı örnek cümlelerle CV hazırlama sürecini hızlandırın."
      professions={professionSeeds}
    />
  );
}
