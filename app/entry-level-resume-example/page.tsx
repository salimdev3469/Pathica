import type { Metadata } from 'next';
import { SeoIntentPage } from '@/components/seo/SeoIntentPage';
import { getSeoPage } from '@/lib/seo-pages';

const slug = 'entry-level-resume-example';
const page = getSeoPage(slug);

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: '/entry-level-resume-example',
  },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    type: 'website',
    url: '/entry-level-resume-example',
  },
};

export default function SeoPage() {
  return <SeoIntentPage page={page} />;
}
