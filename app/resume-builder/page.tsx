import type { Metadata } from 'next';
import { SeoIntentPage } from '@/components/seo/SeoIntentPage';
import { getSeoPage } from '@/lib/seo-pages';

const slug = 'resume-builder';
const page = getSeoPage(slug);

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: '/resume-builder',
  },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    type: 'website',
    url: '/resume-builder',
  },
};

export default function SeoPage() {
  return <SeoIntentPage page={page} />;
}
