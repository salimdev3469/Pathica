import type { Metadata } from 'next';
import { SeoIntentPage } from '@/components/seo/SeoIntentPage';
import { getSeoPage } from '@/lib/seo-pages';

const slug = 'free-resume-builder';
const page = getSeoPage(slug);

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: '/free-resume-builder',
  },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    type: 'website',
    url: '/free-resume-builder',
  },
};

export default function SeoPage() {
  return <SeoIntentPage page={page} />;
}
