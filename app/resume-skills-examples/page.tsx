import type { Metadata } from 'next';
import { SeoIntentPage } from '@/components/seo/SeoIntentPage';
import { getSeoPage } from '@/lib/seo-pages';

const slug = 'resume-skills-examples';
const page = getSeoPage(slug);

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: '/resume-skills-examples',
  },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    type: 'website',
    url: '/resume-skills-examples',
  },
};

export default function SeoPage() {
  return <SeoIntentPage page={page} />;
}
