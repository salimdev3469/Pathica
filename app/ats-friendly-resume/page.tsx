import type { Metadata } from 'next';
import { SeoIntentPage } from '@/components/seo/SeoIntentPage';
import { getSeoPage } from '@/lib/seo-pages';

const slug = 'ats-friendly-resume';
const page = getSeoPage(slug);

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: '/ats-friendly-resume',
  },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    type: 'website',
    url: '/ats-friendly-resume',
  },
};

export default function SeoPage() {
  return <SeoIntentPage page={page} />;
}
